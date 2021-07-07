import renderer from './Renderer'
const XLSX = require('xlsx')

const localFunctions = {
  saveSearchResult (xmlObjLines, filteredSearchResults, view, type, fxText, highlights, progressFunction = null, doneFunction = null) {
    let uList = []
    renderExportUtterances(xmlObjLines, filteredSearchResults, view, type, fxText, highlights, progressFunction, doneFunction, uList, 0)
  },
}

function renderExportUtterances (xmlObjLines, filteredSearchResults, view, type, fxText, highlights, progressFunction = null, doneFunction = null, uList, uListPos) {
  let htmlTmp = document.createElement('DIV')
  let aLines = []
  if (progressFunction) {
    aLines = xmlObjLines.slice(uListPos, uListPos + 200)
    uListPos = uListPos + aLines.length
  } else {
    aLines = xmlObjLines
  }
  if (aLines.length > 0) {
    if (progressFunction) {
      progressFunction(100 / xmlObjLines.length * uList.length)
      // console.log(100 / xmlObjLines.length * uList.length)
    }
    aLines.forEach(aU => {
      if (!filteredSearchResults || filteredSearchResults.filter(x => x.uId === aU.uId).length > 0) {
        let lHtml = renderer.renderUtterance(aU.uObj.obj, {...aU.uObj, xml: aU.uObj.obj.xml}, view.type, highlights, true)
        htmlTmp.innerHTML = lHtml
        let lTxt = (htmlTmp.textContent || htmlTmp.innerText || '').trim().replace(/ +(?= )/g, '')
        if (view.kwic && filteredSearchResults) {
          let aObj = filteredSearchResults.filter(x => x.uId === aU.uId)[0]
          aObj.hits.forEach(uHit => {
            let kwicHtmlTmp = document.createElement('DIV')
            kwicHtmlTmp.innerHTML = htmlTmp.innerHTML
            let kwicHtml = kwicHtmlTmp.querySelector('#s_' + uHit[0])
            let kwicText = (kwicHtml.textContent || kwicHtml.innerText || '').trim().replace(/ +(?= )/g, '')
            kwicHtml.innerHTML = '###startKwic###' + kwicHtml.innerHTML + '###endKwic###'
            let lKwicText = (kwicHtmlTmp.textContent || kwicHtmlTmp.innerText || '').trim().replace(/ +(?= )/g, '')
            console.log('s_' + uHit[0], kwicText, kwicHtml, kwicHtmlTmp)
            uList.push({
              uId: aU.uId,
              html: lHtml,
              text: lTxt,
              leftText: lKwicText.substr(0, lKwicText.indexOf('###startKwic###')),
              kwicText: kwicText,
              rightText: lKwicText.substr(lKwicText.indexOf('###endKwic###') + 13),
              uObj: aU.uObj
            })
          })
        } else {
          uList.push({
            uId: aU.uId,
            html: lHtml,
            text: lTxt,
            uObj: aU.uObj
          })
        }
      }
    })
    console.log(uList)
    if (progressFunction) {
      setTimeout(() => { renderExportUtterances(xmlObjLines, filteredSearchResults, view, type, fxText, highlights, progressFunction, doneFunction, uList, uListPos) }, 10)
    }
  }
  if (!progressFunction || aLines.length === 0) {
    // console.log('renderExportUtterances', uList)
    if (progressFunction) {
      progressFunction(100)
    }
    exportUtterancesList (xmlObjLines, filteredSearchResults, view, type, fxText, highlights, progressFunction, doneFunction, uList)
  }
}

function exportUtterancesList (xmlObjLines, filteredSearchResults, view, type, fxText, highlights, progressFunction = null, doneFunction = null, uList) {
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
      aExportText += txtMinLen(u.uId + ': ', minLen + 2) + txtMinLen((u.uObj.obj.attributes && u.uObj.obj.attributes.who ? u.uObj.obj.attributes.who.split('_').slice(-1)[0] : '') + ': ', 7) + u.text + '\n'
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
  } else if (type.id === 'xls' || type.id === 'xlsWS' || type.id === 'csv') {
    var aFileType = type.id === 'csv' ? 'csv' : 'xlsx'
    // console.log('xls', aHeader, aDateTime, aFilename, fxText, highlights, view)
    var wb = XLSX.utils.book_new()
    wb.Props = {
      Title: aHeader,
      Subject: fxText ? fxText.addText.replace('\n', ' - ') : '',
      Author: aHeader,
      CreatedDate: new Date()
    }
    var ws
    let aSheet = 'Overview'
    wb.SheetNames.push(aSheet)
    var ws_data = [[aHeader]]
    if (fxText && fxText.version) {
      fxText.version.split('\n').forEach(v => {
        ws_data.push([v.trim()])
      })
    }
    if (fxText && fxText.addText) {
      fxText.addText.split('\n').forEach(v => {
        ws_data.push([v.trim()])
      })
    }
    ws_data.push([aDateTime])
    ws_data.push([])
    let dg = 0
    uList.forEach(u => {
      if (type.id === 'xlsWS' && aSheet !== u.uId.split('_u_')[0]) {
        ws = XLSX.utils.aoa_to_sheet(ws_data)
        colWidths(ws, view, filteredSearchResults)
        wb.Sheets[aSheet] = ws
        aSheet = u.uId.split('_u_')[0]
        wb.SheetNames.push(aSheet)
        ws_data = []
        dg = 0
      }
      if (dg === 0) {
        if (view.kwic && filteredSearchResults) {
          ws_data.push(['nr', 'utterance ID', 'speaker', 'left text', 'kwic', 'right text'])
        } else {
          ws_data.push(['nr', 'utterance ID', 'speaker', 'text'])
        }
      }
      let aSpeaker = u.uObj.obj.attributes && u.uObj.obj.attributes.who ? u.uObj.obj.attributes.who.split('_').slice(-1)[0] : ''
      if (view.kwic && filteredSearchResults) {
        ws_data.push([dg + 1, u.uId, aSpeaker, u.leftText.replace('\n', ' ').trim(), u.kwicText.replace('\n', ' ').trim(), u.rightText.replace('\n', ' ').trim()])
      } else {
        ws_data.push([dg + 1, u.uId, aSpeaker, u.text.replace('\n', ' ').trim()])
      }
      dg++
    })
    // console.log(uList)
    ws = XLSX.utils.aoa_to_sheet(ws_data)
    colWidths(ws, view, filteredSearchResults)
    wb.Sheets[aSheet] = ws
    XLSX.writeFile(wb, aFilename + '.' + aFileType, {bookType: aFileType, type: 'binary', FS: ';'})
    if (doneFunction) {
      doneFunction(true)
    }
  } else {
    console.log('unknown export type', type.id, type)
  }
}

function colWidths (ws, view, filteredSearchResults) {
  if (view.kwic && filteredSearchResults) {
    ws['!cols'] = [{wpx: 50}, {wpx: 150}, {wpx: 50}, {wpx: 300}, {wpx: 100}, {wpx: 300}]
  } else {
    ws['!cols'] = [{wpx: 50}, {wpx: 150}, {wpx: 50}, {wpx: 700}]
  }
}

function txtMinLen (txt, len) {
  while (txt.length < len) {
    txt += ' '
  }
  return txt
}

export default localFunctions