const sax = require('sax')
// sax.MAX_BUFFER_LENGTH = 128 * 1024

function addObj (l, o) {
  o.id = l.push(o) - 1
  return o
}

const localFunctions = {
  getText (o) {
    let val = ''
    o.children.forEach(c => {
      if (c.type === 'text') {
        val += c.value
      } else if (c.children) {
        val += localFunctions.getText(c)
      }
    })
    return val
  },
  getRespStmtList (o) {
    let l = []
    let r = []
    o.children.forEach(c => {
      if (c.type === 'tag') {
        if (c.tag === 'resp') {
          r.push(localFunctions.getText(c))
        } else {
          l.push(localFunctions.getText(c))
        }
      }
    })
    return [r[0], l]
  },
  parseIt (xml, header = null, body = null) {
    let sTime = performance.now()
    let headerStartPosition = 0
    let headerXML = null
    let headerObj = null
    let bodyObj = null
    if (header || body) {
      if (header) {
        header.data = {}
      }
      let parser = sax.parser(false, { lowercase: true, position: true })
      let aTree = []
      let aObjList = []
      let aObj = addObj(aObjList, {
        type: 'root',
        tree: aTree,
        children: [],
        parent: -1
      })
      parser.onerror = (e) => {
        console.log('sax error:', { e })
      }
      parser.onopentag = (node) => {
        let nObj = addObj(aObjList, {
          type: 'tag',
          tree: [...aTree],
          tag: node.name,
          attributes: node.attributes,
          children: [],
          parent: aObj.id
        })
        aObj.children.push(nObj)
        aObj = nObj
        aTree.push(node.name)
        if (node.name === 'teiheader') {
          headerStartPosition = parser.startTagPosition - 1
        }
      }
      parser.ontext = (txt) => {
        let aTxt = txt.trim()
        if (aTxt.length) {
          aObj.children.push({
            type: 'text',
            tree: [...aTree],
            value: txt,
            parent: aObj.id
          })
          // console.log('ontext', aTree.join(' > '), txt)
        }
      }
      let parseTag = (o) => {
        // console.log(o.tag)
        if (o.tag === 'teiheader') {
          headerXML = xml.substr(headerStartPosition, parser.position - headerStartPosition)
        }
        if (header) {
          if (o.tag === 'teiheader') {
            headerObj = aObj
          }
          // get Header informations
          if (o.tree.indexOf('teiheader') > -1) {
            if (o.tag === 'title' && o.tree.indexOf('titlestmt') > -1) {
              header.data.title = localFunctions.getText(o)
            }
            if (o.tag === 'edition') {
              header.data.edition = localFunctions.getText(o)
            }
            if (o.tag === 'recording' && o.tree.indexOf('recordingstmt') > -1) {
              header.data.recordingDuration = o.attributes.dur ? [...o.attributes.dur.matchAll(/T(.+)H(.+)M(.+)S/gm)][0] : null
            }
            if (o.tree[o.tree.length - 1] === 'recording' && o.tree.indexOf('recordingstmt') > -1) {
              if (!header.data.recordingInfos) {
                header.data.recordingInfos = {}
              }
              if (o.tag === 'date') {
                header.data.recordingInfos.date = localFunctions.getText(o)
              }
              if (o.tag === 'equipment') {
                header.data.recordingInfos.equipment = localFunctions.getText(o)
              }
              if (o.tag === 'respstmt') {
                header.data.recordingInfos.resps = localFunctions.getRespStmtList(o)
              }
            }
          }
        }
        if (body) {
          if (o.tag === 'body') {
            bodyObj = aObj
          }
        }
      }
      parser.onclosetag = (tag) => {
        if (aTree[aTree.length - 1] === tag) {
          parseTag(aObj)
        }
        aObj = aObjList[aObj.parent || 0]
        aTree.pop()
      }
      parser.onprocessinginstruction = (node) => {
        aObj.children.push({
          type: 'processinginstruction',
          name: node.name,
          body: node.body,
          tree: [...aTree],
          parent: aObj
        })
        console.log('onprocessinginstruction', node)
      }
      parser.onend = () => {
        console.log('onend', aObj)
        if (header) {
          header.loading = false
          header.xmlObj = {obj: headerObj, list: aObjList}
        }
        if (body) {
          body.loading = false
          body.xmlObj = {obj: bodyObj, list: aObjList}
        }
        console.log('Sax Parser - parseIt', parseInt(performance.now() - sTime), 'ms', { header, body, xml })
      }
      parser.write(xml).close()
    }
    return [headerXML]
  }
}

export default localFunctions