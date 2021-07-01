import renderer from './Renderer'

const localFunctions = {
  saveSearchResult (xmlObjLines, view, type, fxText, progressFunction = null, doneFunction = null) {
    let uList = []
    renderExportUtterances(xmlObjLines, view, type, fxText, progressFunction, doneFunction, uList)
  },
}

function renderExportUtterances (xmlObjLines, view, type, fxText, progressFunction = null, doneFunction = null, uList) {
  let htmlTmp = document.createElement('DIV')
  let aLines = []
  if (progressFunction) {
    aLines = xmlObjLines.slice(uList.length, uList.length + 200)
  } else {
    aLines = xmlObjLines
  }
  if (aLines.length > 0) {
    if (progressFunction) {
      progressFunction(100 / xmlObjLines.length * uList.length)
      // console.log(100 / xmlObjLines.length * uList.length)
    }
    aLines.forEach(aU => {
      let lHtml = renderer.renderUtterance(aU.uObj.obj, {...aU.uObj, xml: aU.uObj.obj.xml}, view, false, true)
      htmlTmp.innerHTML = lHtml
      let lTxt = (htmlTmp.textContent || htmlTmp.innerText || '').trim().replace(/ +(?= )/g, '')
      uList.push({
        uId: aU.uId,
        html: lHtml,
        text: lTxt
      })
    })
    if (progressFunction) {
      setTimeout(() => { renderExportUtterances(xmlObjLines, view, type, fxText, progressFunction, doneFunction, uList) }, 10)
    }
  }
  if (!progressFunction || aLines.length === 0) {
    // console.log('renderExportUtterances', uList)
    if (progressFunction) {
      progressFunction(100)
    }
    exportUtterancesList (xmlObjLines, view, type, fxText, progressFunction, doneFunction, uList)
  }
}

function exportUtterancesList (xmlObjLines, view, type, fxText, progressFunction = null, doneFunction = null, uList) {
  // console.log('exportUtterancesList', view, type, uList)
  let aHeader = 'VOICE 3.0'
  let aTime = new Date()
  let aDateTime = aTime.toLocaleString('en-US')
  let aFilename = 'voice-search_' + aTime.getFullYear() + '-' + ('0' + aTime.getMonth()).slice(-2) + '-' + ('0' + aTime.getDay()).slice(-2) + '_' + ('0' + aTime.getHours()).slice(-2) + '-' + ('0' + aTime.getMinutes()).slice(-2) + '-' + ('0' + aTime.getSeconds()).slice(-2)
  if (type.id === 'text') {
    let aExportText = ''
    aExportText += aHeader + '\n'
    if (fxText && fxText.version) {
      aExportText += fxText.version + '\n'
    }
    if (fxText && fxText.addText) {
      aExportText += fxText.addText + '\n'
    }
    aExportText += aDateTime + '\n'
    aExportText += '\n'
    let minLen = uList.map(u => u.uId.length).sort().reverse()[0]
    uList.forEach(u => {
      aExportText += txtMinLen(u.uId + ': ', minLen + 2) + u.text + '\n'
    })
    // console.log('text', { aExportText })
    let blob = new Blob([aExportText], { type: "text/plain;charset=utf-8" })
    const a = document.createElement('a')
    a.href= URL.createObjectURL(blob)
    a.download = aFilename + '.txt'
    a.click()
    if (doneFunction) {
      doneFunction(true)
    }
  }
}

function txtMinLen(txt, len) {
  while (txt.length < len) {
    txt += ' '
  }
  return txt
}

export default localFunctions