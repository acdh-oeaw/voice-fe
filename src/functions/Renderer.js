const localFunctions = {
  renderUtterance (uObj, xmlObj, type = 'plain', highlight, isSearch = false) {
    // console.log('renderUtterance', type, uObj, xmlObj)
    if (type === 'xml-view') {
      let aXml = xmlObj.xml.split('\n')
      aXml = aXml.filter(l => l.trim().length > 0)
      let lS = aXml.length > 0 && aXml[aXml.length - 1] ? aXml[aXml.length - 1].search(/\S/) : -1
      if (lS > 0) {
        aXml = aXml.map((l, i) => i > 0 ? l.substring(lS) : l)
      }
      // ToDo: XML View
      return localFunctions.w3CodeColor(aXml.join('\n'))
    } else {
      let xmlIdCache = {}
      let fxCache = {
        pos: null
      }
      return renderingUtterance(uObj, xmlObj, type, highlight, isSearch, xmlIdCache, fxCache)
    }
  },
  w3CodeColor (elmntTxt) {
    // let t1 = performance.now()
    elmntTxt = elmntTxt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r?\n/g, '<br>')
    elmntTxt = htmlMode(elmntTxt)
    // console.log('w3CodeColor', performance.now() - t1)
    return elmntTxt

    function extract(str, start, end, func, repl) {
      var s, e, d = "", a = []
      while (str.search(start) > -1) {
        s = str.search(start)
        e = str.indexOf(end, s)
        if (e == -1) {e = str.length;}
        if (repl) {
          a.push(func(str.substring(s, e + (end.length))))
          str = str.substring(0, s) + repl + str.substr(e + (end.length))
        } else {
          d += str.substring(0, s)
          d += func(str.substring(s, e + (end.length)))
          str = str.substr(e + (end.length))
        }
      }
      this.rest = d + str
      this.arr = a
    }
    function htmlMode(txt) {
      var rest = txt, done = "", comment, startpos, endpos, i
      comment = new extract(rest, "&lt;!--", "--&gt;", commentMode, "W3HTMLCOMMENTPOS")
      rest = comment.rest
      while (rest.indexOf("&lt;") > -1) {
        startpos = rest.indexOf("&lt;")
        endpos = rest.indexOf("&gt;", startpos)
        if (endpos == -1) {endpos = rest.length;}
        done += rest.substring(0, startpos)
        done += tagMode(rest.substring(startpos, endpos + 4))
        rest = rest.substr(endpos + 4)
      }
      rest = done + rest;
      for (i = 0; i < comment.arr.length; i++) {
          rest = rest.replace("W3HTMLCOMMENTPOS", comment.arr[i])
      }
      return rest
    }
    function tagMode(txt) {
      var rest = txt, done = "", startpos, endpos, result;
      while (rest.search(/(\s|<br>)/) > -1) {    
        startpos = rest.search(/(\s|<br>)/)
        endpos = rest.indexOf("&gt;")
        if (endpos == -1) {endpos = rest.length;}
        done += rest.substring(0, startpos)
        done += attributeMode(rest.substring(startpos, endpos))
        rest = rest.substr(endpos)
      }
      result = done + rest
      result = '<span class="tc">&lt;</span>' + result.substring(4)
      if (result.substr(result.length - 4, 4) == '&gt;') {
        result = result.substring(0, result.length - 4) + '<span class="tc">&gt;</span>'
      }
      return '<span class="tnc">' + result + '</span>'
    }
    function attributeMode(txt) {
      var rest = txt, done = "", startpos, endpos, singlefnuttpos, doublefnuttpos, spacepos;
      while (rest.indexOf("=") > -1) {
        endpos = -1
        startpos = rest.indexOf("=")
        singlefnuttpos = rest.indexOf("'", startpos)
        doublefnuttpos = rest.indexOf('"', startpos)
        spacepos = rest.indexOf(" ", startpos + 2)
        if (spacepos > -1 && (spacepos < singlefnuttpos || singlefnuttpos == -1) && (spacepos < doublefnuttpos || doublefnuttpos == -1)) {
          endpos = rest.indexOf(" ", startpos)
        } else if (doublefnuttpos > -1 && (doublefnuttpos < singlefnuttpos || singlefnuttpos == -1) && (doublefnuttpos < spacepos || spacepos == -1)) {
          endpos = rest.indexOf('"', rest.indexOf('"', startpos) + 1)
        } else if (singlefnuttpos > -1 && (singlefnuttpos < doublefnuttpos || doublefnuttpos == -1) && (singlefnuttpos < spacepos || spacepos == -1)) {
          endpos = rest.indexOf("'", rest.indexOf("'", startpos) + 1)
        }
        if (!endpos || endpos == -1 || endpos < startpos) {endpos = rest.length;}
        done += rest.substring(0, startpos)
        done += attributeValueMode(rest.substring(startpos, endpos + 1))
        rest = rest.substr(endpos + 1)
      }
      return '<span class="ac">' + done + rest + '</span>'
    }
    function attributeValueMode(txt) {
      return '<span class="avc">' + txt + '</span>'
    }
    function commentMode(txt) {
      return '<span class="cc">' + txt + '</span>'
    }
  },
}

function renderingUtterance(uObj, xmlObj, type, highlight, isSearch = false, xmlIdCache, fxCache, renderText = true) {
  let aTxt = ''
  if (uObj.type === 'tag') {
    if (uObj.tag === 'u') {
      uObj.children.forEach(c => {
        aTxt += renderingUtterance(c, xmlObj, type, highlight, isSearch, xmlIdCache, fxCache)
      })
      if (type === 'pos' && fxCache.pos) {
        aTxt += fxCache.pos.c + '</span>'
        fxCache.pos = null
      }
    } else {
      let aClasses = ['tag-' + uObj.tag]
      let aId = null
      let attrClasses = {'type': {}, 'voice:type': {}, 'n': { has: true }, 'voice:desc': {}, 'reason': {}, 'new': {}}
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
          aId = uObj.attributes['xml:id']
        }
        if (uObj.tag === 'shift' && uObj.attributes['new'] === 'neutral') {
          if (uObj.attributes['corresp'] && xmlIdCache[uObj.attributes['corresp']]) {
            aClasses.push('neutral-' + xmlIdCache[uObj.attributes['corresp']])
          }
        }
      }
      if (type === 'pos') {
        // ana
        if (uObj.attributes && uObj.attributes['ana'] && (uObj.attributes['part'] || uObj.attributes['join'])) {
          if (fxCache.pos) {
            aTxt += fxCache.pos.c + '</span>'
          }
          aTxt += '<span class="fx-ana-frm">'
          fxCache.pos = { c: '' }
        }
      }
      aTxt += '<span class="' + aClasses.join(' ') + '"' + 
              (aId ? ' id="' + (isSearch ? 's_' : '') + aId + '"' : '') + 
              (uObj.attributes && uObj.attributes['lemma'] ? ' title="Lemma: ' + uObj.attributes['lemma'] + '"' : '') + 
              '>'
      if (uObj.attributes && uObj.attributes['voice:syl']) {
        aTxt += ' ' + '@'.repeat(parseInt(uObj.attributes['voice:syl'])) + ' '
      }
      aTxt += renderingUtteranceBefore(uObj, xmlObj, type, isSearch, xmlIdCache, fxCache)
      if (type === 'voice' && uObj.tag === 'seg' && uObj.attributes && uObj.attributes['type'] === 'ws' && xmlObj.list[uObj.parent].tag === 'unclear'
        && (xmlObj.list[uObj.parent].children.indexOf(uObj) === 0 || xmlObj.list[uObj.parent].children.indexOf(uObj) === xmlObj.list[uObj.parent].children.length - 1)
      ) {
        aTxt += ''
      }
      if (uObj.attributes && uObj.attributes['voice:mode'] && uObj.attributes['voice:mode'] === 'spelt' && uObj.attributes['orig']) {
        aTxt += '<span class="fx-spelt-orig">' + uObj.attributes['orig']
      }
      uObj.children.forEach(c => {
        aTxt += renderingUtterance(c, xmlObj, type, highlight, isSearch, xmlIdCache, fxCache, !(uObj?.attributes?.['voice:mode'] === 'spelt'))
      })
      if (uObj.attributes && uObj.attributes['voice:mode'] && uObj.attributes['voice:mode'] === 'spelt' && uObj.attributes['orig']) {
        aTxt += '</span>'
      }
      aTxt += renderingUtteranceAfter(uObj, xmlObj, type, isSearch, xmlIdCache, fxCache)
      aTxt += '</span>'
      // Whitespace
      let ws = false
      if (
        (uObj.tag === 'w' || uObj.tag === 'emph') &&
        ((!uObj.attributes['part'] && !uObj.attributes['join']) ||
          uObj.attributes['part'] === 'F' ||
          uObj.attributes['join'] === 'left')
      ) {
        if (uObj.tag !== 'emph' ||
          (uObj.children.length === 1 && uObj.children[0].type === 'text')
        ) {
          if (type === 'voice') {
            let oSiblings = xmlObj.list[uObj.parent].children
            let oPos = oSiblings.indexOf(uObj)
            if (
              (xmlObj.list[uObj.parent].tag !== 'unclear') ||
              (oPos < oSiblings.length - 1)
            ) {
              ws = true
            }
            if (oPos > 0 && oSiblings[oPos - 1].tag === 'unclear') {
              aTxt = ' ' + aTxt
            }
          } else {
            ws = true
          }
        } else if (uObj.parent) {
          let oSiblings = xmlObj.list[uObj.parent].children
          let oPos = oSiblings.indexOf(uObj)
          if (oPos > 0 && oSiblings[oPos - 1].tag === 'unclear') {
            aTxt = ' ' + aTxt
          }
        }
      } else {
        if (type === 'voice') {
          let oSiblings = xmlObj.list[uObj.parent].children
          let oPos = oSiblings.indexOf(uObj)
          if (oPos > 0 && oSiblings[oPos - 1].tag === 'unclear') {
            aTxt = ' ' + aTxt
          }
        }
        if (uObj.tag === 'vocal') {
          let oSiblings = xmlObj.list[uObj.parent].children
          let oPos = oSiblings.indexOf(uObj)
          if (
            oPos < oSiblings.length - 1 &&
            (oSiblings[oPos + 1].tag === 'w' || oSiblings[oPos + 1].tag === 'emph')
          ) {
            ws = true
          }
        }
      }
      if (ws) {
        if (fxCache.pos) {
          aTxt += fxCache.pos.c + '</span>'
          fxCache.pos = null
        }
        aTxt += ' '
      }
    }
  } else if (uObj.type === 'text' && renderText) {
    aTxt += uObj.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()
  }
  return aTxt
}

function renderingUtteranceBefore(uObj, xmlObj, type, isSearch, xmlIdCache, fxCache) {
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
        ((oSiblings[oPos - 1].tag === 'w' || oSiblings[oPos - 1].tag === 'emph') &&
          ((!oSiblings[oPos - 1].attributes['part'] && !oSiblings[oPos - 1].attributes['join']) ||
          (oSiblings[oPos - 1].attributes['part'] === 'F') ||
          (oSiblings[oPos - 1].attributes['join'] === 'left'))
        ) ||
        (!uObj.children || uObj.children.length < 1 ||
          ((uObj.children[0].tag === 'w' || uObj.children[0].tag === 'emph') &&
            ((!uObj.children[0].attributes['part'] && !uObj.children[0].attributes['join']) ||
            (uObj.children[0].attributes['part'] === 'I') ||
            (uObj.children[0].attributes['join'] === 'right'))
          )
        )
      ) {
        if (!(uObj.children && uObj.children.length > 0 && uObj.children[0].attributes &&
            ((uObj.children[0].attributes['part'] === 'F') ||
            (uObj.children[0].attributes['join'] === 'left')))) {
          aTxt += ' '
        }
      }
      aTxt += '</span>'
    }
    // voice:to tags - before
    if (uObj.tag === 'voice:to') {
      aTxt += '<span class="fx-voice-to">&lt;to '
      if (uObj.attributes && uObj.attributes['who']) {
        let speaker = uObj.attributes['who'].split('_')
        if (speaker && speaker[1]) {
          aTxt += speaker[1]
        }
      }
      aTxt += '&gt;</span> '
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
            aTxt += '/' + (nList[xmlIdCache[uObj.attributes['corresp']]] || xmlIdCache[uObj.attributes['corresp']].replace(/^([^_]+)_(.+)/, '$1 $2'))
          } else {
            aTxt += '/' + uObj.attributes['new'].replace(/^([^_]+)_(.+)/, '$1 $2')
          }
        } else if (uObj.attributes['new'] === 'normal') {
          aTxt += '/@'
        } else if (uObj.attributes['new']) {
          if (uObj.attributes['xml:id'] && uObj.attributes['xml:id']) {
            xmlIdCache['#' + uObj.attributes['xml:id']] = uObj.attributes['new']
          }
          aTxt += nList[uObj.attributes['new']] || uObj.attributes['new'].replace(/^([^_]+)_(.+)/, '$1 $2')
        }
      }
      aTxt += '&gt; '
    }
    // vocal
    if (uObj.tag === 'vocal' && uObj.attributes && uObj.attributes['voice:desc'] && uObj.attributes['voice:desc'] !== 'laughing') {
      aTxt += '&lt;' + uObj.attributes['voice:desc'] + '&gt;'
    }
    // spel - before
    if (uObj.attributes && uObj.attributes['voice:mode'] && uObj.attributes['voice:mode'] === 'spelt') {
      aTxt += '<span class="fx-spel"> &lt;spel&gt; </span>'
    }
    // foreign_tag - before
    if (uObj.tag === 'foreign' && uObj.attributes && uObj.attributes['voice:type'] && uObj.attributes['xml:lang']) {
      aTxt += '<span class="fx-foreign"> &lt;' + uObj.attributes['voice:type'] + uObj.attributes['xml:lang'] + '&gt; </span>'
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
      if (xmlObj.list[uObj.parent].tag === 'seg') {
        aTxt += ' '
      }
      let oSiblings = xmlObj.list[uObj.parent].children
      let oPos = oSiblings.indexOf(uObj)
      if (oPos > 0 && oSiblings[oPos - 1].tag === 'seg') {
        aTxt += ' '
      }
      aTxt += '<span class="fx-unclear">(</span>'
    }
  }
  return aTxt
}

function renderingUtteranceAfter(uObj, xmlObj, type, isSearch, xmlIdCache, fxCache) {
  let aTxt = ''
  // pos - layout
  if (type === 'pos') {
    let pTxt = ''
    // ana
    if (uObj.attributes && uObj.attributes['ana']) {
      let ana = uObj.attributes['ana'].replace(/#/g, '').split('f')
      if (ana[0]) {
        pTxt += '<span class="fx-ana"><span class="fx-ana-s">_</span><span class="fx-ana-form">' + ana[0] + '</span>' + (ana[1] ? '<span class="fx-ana-f' + (ana[0] === ana[1] ? ' fx-ana-f-s' : '') + '">(' + ana[1] + ')</span>' : '') + '</span>'
      }
    }
    // pause
    // if (uObj.tag === 'pause') {
    //   pTxt += ' _'
    //   if (uObj.attributes && typeof uObj.attributes['dur'] === 'string') {
    //     let aM = uObj.attributes['dur'].match(/PT(.+)S/i)
    //     pTxt += (aM && aM[1]) ? aM[1] : '.'
    //   } else {
    //     pTxt += '.'
    //   }
    //   pTxt += '_PA '
    // }
    if (fxCache.pos &&
        !(xmlObj.list[uObj.parent].tag === 'seg' && xmlObj.list[uObj.parent].children.indexOf(uObj) === xmlObj.list[uObj.parent].children.length - 1)
      ) {
      fxCache.pos.c += pTxt
    } else {
      aTxt += pTxt
    }
  }
  // voice - layout
  else if (type === 'voice') {
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
      if (!uObj.children || uObj.children.length < 1 ||
        ((uObj.children[uObj.children.length - 1].tag === 'w' || uObj.children[uObj.children.length - 1].tag === 'emph') &&
          ((!uObj.children[uObj.children.length - 1].attributes['part'] && !uObj.children[uObj.children.length - 1].attributes['join']) ||
          (uObj.children[uObj.children.length - 1].attributes['part'] === 'F') ||
          (uObj.children[uObj.children.length - 1].attributes['join'] === 'left'))
        )
      ) {
        aTxt += ' '
      }
      aTxt += '</span>'
    }
    // voice:to tags - after
    if (uObj.tag === 'voice:to') {
      aTxt += '<span class="fx-voice-to">&lt;/to '
      if (uObj.attributes && uObj.attributes['who']) {
        let speaker = uObj.attributes['who'].split('_')
        if (speaker && speaker[1]) {
          aTxt += speaker[1]
        }
      }
      aTxt += '&gt;</span> '
    }
    // spel - after
    if (uObj.attributes && uObj.attributes['voice:mode'] && uObj.attributes['voice:mode'] === 'spelt') {
      aTxt += '<span class="fx-spel"> &lt;/spel&gt; </span>'
    }
    // foreign_tag - after
    if (uObj.tag === 'foreign' && uObj.attributes && uObj.attributes['voice:type'] && uObj.attributes['xml:lang']) {
      if (!uObj.children || uObj.children.length < 1 ||
        ((uObj.children[uObj.children.length - 1].tag === 'w' || uObj.children[uObj.children.length - 1].tag === 'emph') &&
          ((!uObj.children[uObj.children.length - 1].attributes['part'] && !uObj.children[uObj.children.length - 1].attributes['join']) ||
          (uObj.children[uObj.children.length - 1].attributes['part'] === 'F') ||
          (uObj.children[uObj.children.length - 1].attributes['join'] === 'left'))
        )
      ) {
        aTxt += ' '
      }
      if (uObj.attributes['voice:translation']) {
        aTxt += '<span class="fx-foreign-t"> {' + uObj.attributes['voice:translation'] + '} </span>'
      }
      aTxt += '<span class="fx-foreign">&lt;/' + uObj.attributes['voice:type'] + uObj.attributes['xml:lang'] + '&gt;'
      let oSiblings = xmlObj.list[uObj.parent].children
      let oPos = oSiblings.indexOf(uObj)
      if (oPos === oSiblings.length - 1 || oPos === 0 ||
        ((oSiblings[oPos + 1].tag === 'w' || oSiblings[oPos + 1].tag === 'emph') &&
          ((!oSiblings[oPos + 1].attributes['part'] && !oSiblings[oPos + 1].attributes['join']) ||
          (oSiblings[oPos + 1].attributes['part'] === 'F') ||
          (oSiblings[oPos + 1].attributes['join'] === 'left'))
        )
      ) {
        aTxt += ' '
      }
      aTxt += '</span>'
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
      if (xmlObj.list[uObj.parent] && xmlObj.list[uObj.parent].tag === 'seg') {
        aTxt += ' '
      }
    }
  }
  return aTxt
}

export default localFunctions