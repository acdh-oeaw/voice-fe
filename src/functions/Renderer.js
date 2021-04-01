const localFunctions = {
  renderUtterance (uObj, xmlObj, type = 'plain', highlight) {
    // console.log('renderUtterance', type, uObj, xmlObj)
    if (type === 'xml-view') {
      let aXml = this.xmlObjLine.xml.split('\n')
      aXml = aXml.filter(l => l.trim().length > 0)
      let lS = aXml.length > 0 && aXml[aXml.length - 1] ? aXml[aXml.length - 1].search(/\S/) : -1
      if (lS > 0) {
        aXml = aXml.map((l, i) => i > 0 ? l.substring(lS) : l)
      }
      // ToDo: XML View
      // return CorpusElementXml.methods.w3CodeColor(aXml.join('\n'))
    } else {
      let xmlIdCache = {}
      return renderingUtterance(uObj, xmlObj, type, highlight, xmlIdCache)
    }
    return '<b style="color: #900;">renderUtterance: Error!</b>'
  },
}

function renderingUtterance(uObj, xmlObj, type, highlight, xmlIdCache) {
  let aTxt = ''
  if (uObj.type === 'tag') {
    if (uObj.tag === 'u') {
      uObj.children.forEach(c => {
        aTxt += renderingUtterance(c, xmlObj, type, highlight, xmlIdCache)
      })
    } else {
      let aClasses = ['tag-' + uObj.tag]
      let attrClasses = {'type': {}, 'n': { has: true }, 'voice:desc': {}, 'reason': {}, 'new': {}}
      if (uObj.attributes && Object.keys(uObj.attributes).length > 0) {
        Object.keys(attrClasses).forEach(a => {
          if (uObj.attributes[a]) {
            let cn = a.replace(/:/g, '-')
            aClasses.push(cn + '-' + uObj.attributes[a].replace(/\s/gm, '-'))
            if (attrClasses[a].has) {
              aClasses.push('has-'+ cn)
            }
          }
        })
        if (highlight && uObj.attributes['xml:id'] && highlight.has(uObj.attributes['xml:id'])) {
          aClasses.push('highlight')
        }
        if (uObj.tag === 'shift' && uObj.attributes['new'] === 'neutral') {
          if (uObj.attributes['corresp'] && xmlIdCache[uObj.attributes['corresp']]) {
            aClasses.push('neutral-' + xmlIdCache[uObj.attributes['corresp']])
          }
        }
      }
      aTxt += '<span class="' + aClasses.join(' ') + '">'
      if (uObj.attributes && uObj.attributes['voice:syl']) {
        aTxt += '@'.repeat(parseInt(uObj.attributes['voice:syl']))
      }
      aTxt += renderingUtteranceBefore(uObj, xmlObj, type, xmlIdCache)
      if (type === 'voice' && uObj.tag === 'seg' && uObj.attributes && uObj.attributes['type'] === 'ws' && xmlObj.list[uObj.parent].tag === 'unclear'
        && (xmlObj.list[uObj.parent].children.indexOf(uObj) === 0 || xmlObj.list[uObj.parent].children.indexOf(uObj) === xmlObj.list[uObj.parent].children.length - 1)
      ) {
        aTxt += ''
      } else if (uObj.attributes && uObj.attributes['spelt_orig']) {
        aTxt += uObj.attributes['spelt_orig']
      }
      uObj.children.forEach(c => {
        aTxt += renderingUtterance(c, xmlObj, type, highlight, xmlIdCache)
      })
      aTxt += renderingUtteranceAfter(uObj, xmlObj, type, xmlIdCache)
      aTxt += '</span>'
      if ((uObj.tag === 'w' || uObj.tag === 'emph') &&
        (!uObj.attributes['part'] ||
        (uObj.attributes['part'] === 'F'))
      ) {
        aTxt += ' '
      }

    }
  } else if (uObj.type === 'text') {
    aTxt += uObj.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()
  }
  return aTxt
}

function renderingUtteranceBefore(uObj, xmlObj, type, xmlIdCache) {
  let aTxt = ''
  return aTxt
}

function renderingUtteranceAfter(uObj, xmlObj, type, xmlIdCache) {
  let aTxt = ''
  return aTxt
}

export default localFunctions