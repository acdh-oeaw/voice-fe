const sax = require('sax')
// sax.MAX_BUFFER_LENGTH = 128 * 1024

const localFunctions = {
  parseIt (xml, header = null, body = null) {
    let sTime = performance.now()
    if (header || body) {
      let parser = sax.parser(false, { lowercase: true })
      let aTree = []
      let aObj = {
        type: 'root',
        tree: aTree,
        children: [],
        parent: null
      }
      parser.onerror = (e) => {
        console.log('sax error:', { e })
      }
      parser.onopentag = (node) => {
        let nObj = {
          type: 'tag',
          tree: [...aTree],
          tag: node.name,
          attributes: node.attributes,
          children: [],
          parent: aObj
        }
        aObj.children.push(nObj)
        aObj = nObj
        aTree.push(node.name)
      }
      parser.ontext = (txt) => {
        let aTxt = txt.trim()
        if (aTxt.length) {
          aObj.children.push({
            type: 'text',
            tree: [...aTree],
            value: txt,
            parent: aObj
          })
          // console.log('ontext', aTree.join(' > '), txt)
        }
      }
      parser.onclosetag = (tag) => {
        if (aTree[aTree.length - 1] === tag) {
          aObj = aObj.parent
          aTree.pop()
        }
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
        }
        console.log('Sax Parser - parseIt', parseInt(performance.now() - sTime), 'ms', { header, body, xml })
      }
      parser.write(xml).close()
    }
  }
}

export default localFunctions