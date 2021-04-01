const sax = require('sax')
// sax.MAX_BUFFER_LENGTH = 128 * 1024

function addObj (l, o) {
  o.id = l.push(o) - 1
  return o
}

const localFunctions = {
  getText (o) {
    let val = ''
    if (o.children) {
      o.children.forEach(c => {
        if (c.type === 'text') {
          val += c.value
        } else if (c.children) {
          val += localFunctions.getText(c)
        }
      })
    }
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
  getDescendants (o) {
    let d = []
    if (o.children) {
      let cOc = o.children.flatMap(c => localFunctions.getDescendants(c))
      d = [...o.children, ...cOc]
    }
    return d
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
        if (header && o.tag === 'teiheader') {
          headerObj = aObj
        }
        if (body && o.tag === 'body') {
          bodyObj = aObj
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
          header.data = parseHeader(header.xmlObj)
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

function parseHeader (xmlObj) {
  let data = {
    settingDesc: {},
    particDesc: {
      personGrp: [],
      personIdentified: [],
      personNotIdentified: [],
      relationGrp: []
    },
    revisionDesc: [],
    notes: []
  }
  xmlObj.list.forEach((o) => {
    // get Header informations
    if (o.tree.indexOf('teiheader') > -1) {
      if (o.tag === 'title' && o.tree.indexOf('titlestmt') > -1) {
        data.title = localFunctions.getText(o)
      }
      if (o.tag === 'edition') {
        data.edition = localFunctions.getText(o)
      }
      if (o.tag === 'recording' && o.tree.indexOf('recordingstmt') > -1) {
        data.recordingDuration = o.attributes.dur ? [...o.attributes.dur.matchAll(/T(.+)H(.+)M(.+)S/gm)][0] : null
      }
      if (o.tree[o.tree.length - 1] === 'recording' && o.tree.indexOf('recordingstmt') > -1) {
        if (!data.recordingInfos) {
          data.recordingInfos = {}
        }
        if (o.tag === 'date') {
          data.recordingInfos.date = localFunctions.getText(o)
        }
        if (o.tag === 'equipment') {
          data.recordingInfos.equipment = localFunctions.getText(o)
        }
        if (o.tag === 'respstmt') {
          data.recordingInfos.resps = localFunctions.getRespStmtList(o)
        }
      }
      if (o.tree[o.tree.length - 1] === 'textclass' && o.tag === 'catref') {
        if (!data.textClass) {
          data.textClass = []
          if (o.attributes.target) {
            let catRefs = o.attributes.target.split(' ').map(v => v.substring(1))
            xmlObj.list.filter(tc => tc.tag === 'category' && tc.tree.indexOf('taxonomy') > -1 && catRefs.indexOf(tc.attributes['xml:id']) > -1).forEach(tc => {
              let h = xmlObj.list[tc.parent].children.filter(tcp => tcp.tag === 'catdesc')
              if (h.length > 0) {
                let d = tc.children.filter(tcc => tcc.tag === 'catdesc')
                if (d.length > 0) {
                  data.textClass.push({h: localFunctions.getText(h[0]), d: localFunctions.getText(d[0])})
                }
              }
            })
          }
        }
      }
      if (o.tag === 'name' && o.attributes.type === 'country') {
        data.settingDesc.countryCode = localFunctions.getText(o)
      }
      if (o.tag === 'name' && o.attributes.type === 'city') {
        data.settingDesc.city = localFunctions.getText(o)
      }
      if (o.tag === 'locale') {
        data.settingDesc.locale = localFunctions.getText(o)
      }
      if (o.tag === 'activity') {
        data.settingDesc.activity = localFunctions.getText(o)
      }
      if (o.tag === 'persongrp' && o.tree.indexOf('particdesc') > -1) {
        data.particDesc.personGrp.push({
          h: o.attributes.role ? {speakers: 'Speakers', audience: 'Audience', interactants: 'Interactants'}[o.attributes.role] || o.attributes.role : '?',
          d: o.attributes.size ? o.attributes.size : 'unknown'
        })
      }
      if (o.tag === 'person' && xmlObj.list[o.parent].tag === 'listperson' && xmlObj.list[o.parent].attributes.type === 'identified' && o.tree.indexOf('particdesc') > -1) {
        let oDescendants = localFunctions.getDescendants(o)
        let occQ = oDescendants.filter(c => c.tag === 'occupation')
        data.particDesc.personIdentified.push({
          id: o.attributes['xml:id'].split('_')[1],
          sex: ['male', 'female'][oDescendants.filter(c => c.tag === 'sex')[0].attributes.value - 1] || 'unknown',
          age: ['unknown', '17-24', '25-34', '35-49', '50+'][oDescendants.filter(c => c.tag === 'age')[0].attributes.value] || 'N/A',
          l1: oDescendants.filter(c => c.tag === 'langknown' && c.attributes.level === 'L1')[0].attributes.tag,
          role: o.attributes.role,
          occupation: occQ.length > 0 ? localFunctions.getText(occQ[0]) : ' '
        })
      }
      if (o.tag === 'person' && xmlObj.list[o.parent].tag === 'listperson' && xmlObj.list[o.parent].attributes.type === 'not_identified' && o.tree.indexOf('particdesc') > -1) {
        data.particDesc.personNotIdentified.push(o.attributes['xml:id'].split('_')[1])
      }
      if (o.tag === 'relation' && o.tree.indexOf('relationgrp') > -1) {
        data.particDesc.relationGrp.push({
          h: o.attributes.type ? {acquaintedness: 'Acquaintedness', power: 'Power relations'}[o.attributes.type] || o.attributes.type : '?',
          d: o.attributes.name.split('_').join(' ')
        })
      }
      if (o.tag === 'change' && o.tree.indexOf('revisiondesc') > -1) {
        data.revisionDesc.push({
          when: o.attributes.when,
          who: o.attributes.who,
          txt: localFunctions.getText(o)
        })
      }
      if (o.tag === 'note' && o.tree.indexOf('notesstmt') > -1) {
        data.notes.push(localFunctions.getText(o))
      }
    }
  })
  data.particDesc.personIdentified.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  data.particDesc.relationGrp.sort((a, b) => a.h < b.h ? -1 : a.h > b.h ? 1 : 0)
  data.revisionDesc.sort((a, b) => a.when > b.when ? -1 : a.when < b.when ? 1 : a.who < b.who ? -1 : a.who > b.who ? 1 : 0)
  return data
}

export default localFunctions