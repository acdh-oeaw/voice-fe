const localFunctions = {
  renderUtterance (uObj, xmlObj, type = 'plain', highlight) {
    // console.log('renderUtterance', type, uObj, xmlObj)
    if (type === 'xml-view') {
      let aXml = xmlObj.xml.split('\n')
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
  // voice - layout
  if (type === 'voice') {
    // overlap tags - before
    if (uObj.tag === 'seg' && uObj.attributes && uObj.attributes['type'] === 'overlap') {
      aTxt += '<span class="fx-overlap">'
      aTxt += '&lt;'
      if (uObj.attributes['n']) {
        aTxt += uObj.attributes['n']
      } else {
        console.log('overlap tags - No "n" attribute!!!!')
      }
      aTxt += '&gt;'
      let oSiblings = xmlObj.list[uObj.parent].children
      let oPos = oSiblings.indexOf(uObj)
      if (oPos === oSiblings.length - 1 || oPos === 0 ||
        ((xmlObj.list[oPos + 1].tag === 'w' || xmlObj.list[oPos + 1].tag === 'emph') &&
          (!xmlObj.list[oPos + 1].attributes['part'] ||
          (xmlObj.list[oPos + 1].attributes['part'] === 'F'))
        )
      ) {
        aTxt += ' '
      }
      aTxt += '</span>'
    }
    // pause
    if (uObj.tag === 'pause') {
      aTxt += ' ('
      if (uObj.attributes && typeof uObj.attributes['dur'] === 'string') {
        let aM = uObj.attributes['dur'].match(/PT(.+)S/i)
        aTxt += (aM && aM[1]) ? aM[1] : '.'
      } else {
        aTxt += '.'
      }
      aTxt += ') '
    }
    // contextual events
    if (uObj.tag === 'incident') {
      aTxt += ' {' + (uObj.attributes && uObj.attributes['voice:desc'] ? uObj.attributes && uObj.attributes['voice:desc'] && uObj.attributes['voice:desc'] : '');
      if (uObj.attributes && uObj.attributes['dur'] && uObj.attributes['dur'] && typeof uObj.attributes['dur'] === 'string') {
        let aM = uObj.attributes['dur'].match(/PT(.+)S/i)
        aTxt += ' (' + ((aM && aM[1]) ? aM[1] : '.') + ')'
      }
      aTxt += '} '
    }
    // speaking modes
    if (uObj.tag === 'shift') {
      aTxt += '&lt;'
      if (uObj.attributes && uObj.attributes['new']) {
        let nList = {
          'laugh': '@',
          'p': 'soft',
          'l': 'slow',
          'f': 'loud',
          'whisp': 'whispering',
          'sigh': 'sighing',
          'phone': 'on phone',
          'reading': 'reading',
          'a': 'fast'
        }
        if (uObj.attributes['new'] === 'neutral') {
          if (uObj.attributes['corresp'] && xmlIdCache[uObj.attributes['corresp']]) {
            aTxt += '/' + (nList[xmlIdCache[uObj.attributes['corresp']]] || xmlIdCache[uObj.attributes['corresp']])
          } else {
            aTxt += '/' + uObj.attributes['new']
          }
        } else if (uObj.attributes['new'] === 'normal') {
          aTxt += '/@'
        } else if (uObj.attributes['new']) {
          if (uObj.attributes['xml:id'] && uObj.attributes['xml:id']) {
            xmlIdCache['#' + uObj.attributes['xml:id']] = uObj.attributes['new']
          }
          aTxt += nList[uObj.attributes['new']] || uObj.attributes['new']
        }
      }
      aTxt += '&gt; '
    }
    // vocal
    if (uObj.tag === 'vocal' && uObj.attributes && uObj.attributes['voice:desc'] && uObj.attributes['voice:desc'] !== 'laughing') {
      aTxt += '&lt;' + uObj.attributes['voice:desc'] + '&gt;'
    }
    // spel - before
    if (uObj.attributes && uObj.attributes['spelt_orig']) {
      aTxt += '<span class="fx-spel"> &lt;spel&gt; </span>'
    }
    // foreign_tag - before
    if (uObj.tag === 'foreign' && uObj.attributes && uObj.attributes['type'] && uObj.attributes['xml:lang']) {
      aTxt += '<span class="fx-foreign"> &lt;' + uObj.attributes['type'] + uObj.attributes['xml:lang'] + '&gt; </span>'
    }
    if (uObj.attributes && uObj.attributes['type'] === 'other_continuation') {
      aTxt += '<span class="fx-other-continuation">=</span>'
    }
    // unintelligible - before
    if (uObj.tag === 'supplied' && uObj.attributes && uObj.attributes['reason'] === 'unintelligible') {
      aTxt += '<span class="fx-unintelligible-tag"> &lt;un&gt; </span>'
    }
    // ono - before
    if (uObj.tag === 'seg' && uObj.attributes && uObj.attributes['type'] === 'onomatopoeia') {
      aTxt += '<span class="fx-ono"> &lt;ono&gt; </span>'
    }
    // pvc - before
    if (uObj.tag === 'voice:pvc') {
      aTxt += '<span class="fx-pvct"> &lt;pvc&gt; </span>'
    }
    // unclear - before
    if (uObj.tag === 'unclear') {
      aTxt += '<span class="fx-unclear"> (</span>'
    }
  }
  return aTxt
}

function renderingUtteranceAfter(uObj, xmlObj, type, xmlIdCache) {
  let aTxt = ''
  // voice - layout
  if (type === 'voice') {
    // overlap tags - after
    if (uObj.tag === 'seg' && uObj.attributes && uObj.attributes['type'] === 'overlap') {
      let oSiblings = xmlObj.list[uObj.parent].children
      let oPos = oSiblings.indexOf(uObj)
      aTxt += '<span class="fx-overlap">'
      if (oPos === oSiblings.length - 1) {
        aTxt += ' '
      }
      aTxt += '&lt;/'
      if (uObj.attributes['n']) {
        aTxt += uObj.attributes['n']
      }
      aTxt += '&gt;'
      if (oPos < 1 ||
        ((xmlObj.list[oPos - 1].tag === 'w' || xmlObj.list[oPos - 1].tag === 'emph') &&
          (!xmlObj.list[oPos - 1].attributes['part'] ||
          (xmlObj.list[oPos - 1].attributes['part'] === 'F'))
        )
      ) {
        aTxt += ' '
      }
      aTxt += '</span>'
    }
    // spel - after
    if (uObj.attributes && uObj.attributes['spelt_orig']) {
      aTxt += '<span class="fx-spel"> &lt;/spel&gt; </span>'
    }
    // foreign_tag - after
    if (uObj.tag === 'foreign' && uObj.attributes && uObj.attributes['type'] && uObj.attributes['xml:lang']) {
      if (uObj.attributes['voice:translation']) {
        aTxt += '<span class="fx-foreign-t"> {' + uObj.attributes['voice:translation'] + '} </span>'
      }
      aTxt += '<span class="fx-foreign"> &lt;/' + uObj.attributes['type'] + uObj.attributes['xml:lang'] + '&gt; </span>'
    }
    // unintelligible - after
    if (uObj.tag === 'supplied' && uObj.attributes && uObj.attributes['reason'] === 'unintelligible') {
      aTxt += '<span class="fx-unintelligible-tag"> &lt;/un&gt; </span>'
    }
    // ono - after
    if (uObj.tag === 'seg' && uObj.attributes && uObj.attributes['type'] === 'onomatopoeia') {
      aTxt += '<span class="fx-ono"> &lt;/ono&gt; </span>'
    }
    // pvc - after (before ipa)
    if (uObj.tag === 'voice:pvc' && uObj.attributes && uObj.attributes['comment']) {
      aTxt += '{' + uObj.attributes['comment'] + '}'
    }
    // ipa - after
    if (uObj.attributes && uObj.attributes['voice:ipa']) {
      aTxt += '<span class="tag-seg type-ipa"><span class="fx-ipa"> &lt;ipa&gt; </span>' + uObj.attributes['voice:ipa'] + '<span class="fx-ipa"> &lt;/ipa&gt; </span></span>'
    }
    // pvc - after
    if (uObj.tag === 'voice:pvc') {
      aTxt += '<span class="fx-pvct"> &lt;/pvc&gt; </span>'
    }
    // c - after
    if (uObj.tag === 'c' && uObj.attributes && uObj.attributes['type']) {
      if (uObj.attributes['type'] === 'lengthening') {
        aTxt += ':'
      } else if (uObj.attributes['type'] === 'intonation') {
        if (uObj.attributes['function'] === 'fall') {
          aTxt += '.'
        } else if (uObj.attributes['function'] === 'rise') {
          aTxt += '?'
        }
      }
    }
    // unclear - after
    if (uObj.tag === 'unclear') {
      aTxt += '<span class="fx-unclear">)</span>'
    }
  }
  return aTxt
}

export default localFunctions