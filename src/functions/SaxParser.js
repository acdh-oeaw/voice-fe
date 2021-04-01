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
  getPlainText (o) {
    let val = ''
    if (o.children) {
      o.children.forEach(c => {
        if (c.type === 'text') {
          val += c.value
        } else {
          if (c.children) {
            val += localFunctions.getPlainText(c)
          }
          // ToDo: Real Plain Text spaces!
          val += ' '
        }
      })
    }
    return val.trim()
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
    let uStartPosition = 0
    let headerXML = null
    let headerObj = null
    let bodyObj = null
    let uList = []
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
        if (node.name === 'u') {
          uStartPosition = parser.startTagPosition - 1
          uList.push(aObj)
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
        if (body && o.tag === 'u') {
          aObj.xml = xml.substr(uStartPosition, parser.position - uStartPosition)
          aObj.text = localFunctions.getPlainText(o)
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
          body.xmlObj = {
            obj: bodyObj,
            list: aObjList,
            uList
          }
          body.data = parseBody(body.xmlObj)
        }
        console.log('Sax Parser - parseIt', parseInt(performance.now() - sTime), 'ms', { header, body, xml })
      }
      parser.write(xml).close()
    }
    return [headerXML]
  }
}

function parseBody (xmlObj) {
  let data = {
    u: {
      obj: {},
      list: []
    }
  }
  xmlObj.uList.forEach((o) => {
    let gap = ''
    let oSiblings = xmlObj.list[o.parent].children
    let oPos = oSiblings.indexOf(o)
    if (oPos === oSiblings.length - 1) {
      let opSiblings = xmlObj.list[xmlObj.list[o.parent].parent].children
      let opPos = opSiblings.indexOf(xmlObj.list[o.parent])
      let g = opPos > -1 && opSiblings[opPos + 1] && opSiblings[opPos + 1].tag === 'gap' && opSiblings[opPos + 1]
      if (g) {
        if (g.attributes.reason) {
          gap += '('
          if (g.attributes.reason === 'not_transcribed') {
            gap += 'gap'
          } else if (g.attributes.reason === 'not_recorded') {
            gap += 'nrec'
          }
          let nU = opSiblings[opPos + 2] && opSiblings[opPos + 2].type === 'tag' && opSiblings[opPos + 2]
          if (nU && xmlObj.list[o.parent].attributes['voice:end'] && nU.attributes['voice:start']) {
            let fTime = dur2sec(xmlObj.list[o.parent].attributes['voice:end'])
            let tTime = dur2sec(nU.attributes['voice:start'])
            gap += ' ' + sec2dur(tTime - fTime, 0)
          }
          gap += ')'
          if (g.attributes['voice:desc']) {
            gap += ' {' + g.attributes['voice:desc'] + '}'
          }
        }
      }
    }
    let u = {
      uId: o.attributes['xml:id'] ? o.attributes['xml:id'] : null,
      obj: o,
      speaker: o.attributes.who ? o.attributes.who.split('_').slice(-1)[0] : null,
      gap: gap.length > 0 ? gap : null,
      text: null,
      textHeight: 24,
      voice: null,
      voiceHeight: 24,
      plain: null,
      plainHeight: 24,
      pos: null,
      posHeight: 24,
      xmlView: null,
      xmlHeight: 24
    }
    // console.log(o)
    if (u.uId) {
      data.u.obj[u.uId] = u
    }
    data.u.list.push(u)
  })
  console.log('parseBody', data)
  return data
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

function dur2sec (hms) {
  var s = 0.0
  if (hms && hms.indexOf(':') > -1) {
    var a = hms.split(':')
    if (a.length > 2) { s += parseFloat(a[a.length - 3]) * 60 * 60 }
    if (a.length > 1) { s += parseFloat(a[a.length - 2]) * 60 }
    if (a.length > 0) { s += parseFloat(a[a.length - 1]) }
  } else {
    s = parseFloat(hms)
  }
  return ((isNaN(s)) ? 0.0 : s)
}

function sec2dur (sec) {
  var v = ''
  if (sec < 0) { sec = -sec; v = '-' }
  var h = parseInt(sec / 3600)
  sec %= 3600
  var m = parseInt(sec / 60)
  var s = sec % 60
  return v + ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2) + ':' + ('0' + s.toFixed(0)).slice(-2)
}

export default localFunctions