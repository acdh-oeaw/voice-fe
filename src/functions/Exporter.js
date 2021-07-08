import renderer from './Renderer'
// const XLSX = require('xlsx')
const ExcelJS = require('exceljs');

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
            // console.log('s_' + uHit[0], kwicText, kwicHtml, kwicHtmlTmp)
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
    // console.log(uList)
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
    const wb = new ExcelJS.Workbook()
    wb.title = aHeader
    wb.subject = fxText ? fxText.addText.replace('\n', ' - ') : ''
    wb.creator = aHeader
    wb.created = new Date()
    var ws
    let aSheet = 'Overview'
    ws = addWs(wb, aSheet, view, filteredSearchResults)
    ws.addRow([aHeader])
    if (fxText && fxText.version) {
      fxText.version.split('\n').forEach(v => {
        ws.addRow([v.trim()])
      })
    }
    if (fxText && fxText.addText) {
      fxText.addText.split('\n').forEach(v => {
        ws.addRow([v.trim()])
      })
    }
    ws.addRow([aDateTime])
    ws.addRow()
    let dg = 0
    uList.forEach(u => {
      if (type.id === 'xlsWS' && aSheet !== u.uId.split('_u_')[0]) {
        aSheet = u.uId.split('_u_')[0]
        ws = addWs(wb, aSheet, view, filteredSearchResults)
        dg = 0
      }
      if (dg === 0) {
        if (view.kwic && filteredSearchResults) {
          let aRow = ws.addRow(['nr', 'utterance ID', 'speaker', 'left text', 'kwic', 'right text'])
          aRow.style = { font: { bold: true } }
          aRow.border = { bottom: { style: 'medium' } }
          aRow.eachCell(c => {
            c.style = { font: { bold: true } }
            c.border = { bottom: { style: 'medium' } }
          })
        } else {
          ws.addRow(['nr', 'utterance ID', 'speaker', 'text'])
        }
      }
      let aSpeaker = u.uObj.obj.attributes && u.uObj.obj.attributes.who ? u.uObj.obj.attributes.who.split('_').slice(-1)[0] : ''
      if (view.kwic && filteredSearchResults) {
        ws.addRow([dg + 1, u.uId, aSpeaker, u.leftText.replace('\n', ' ').trim(), u.kwicText.replace('\n', ' ').trim(), u.rightText.replace('\n', ' ').trim()])
      } else {
        ws.addRow([dg + 1, u.uId, aSpeaker, u.text.replace('\n', ' ').trim()])
      }
      dg++
    })
    // console.log(uList)
    if (aFileType === 'xlsx') {
      wb.xlsx.writeBuffer().then(saveTable.bind(null, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', aFileType, aFilename, doneFunction))
    } else if (aFileType === 'csv') {
      // wb.csv.writeBuffer({ formatterOptions: {} }).then(saveTable.bind(null, 'text/csv', aFileType, aFilename, doneFunction))
      let out = ''
      wb.eachSheet(s => {
        s.eachRow(r => {
          let cOut = []
          r.eachCell(c => {
            let cVal = c
            if (cVal instanceof Date) {
              cVal = cVal.toLocaleString('en-US')
            }
            cVal = cVal === null || c === undefined ? '' : c.toString()
            cVal = cVal.replace(/"/g, '""')
            if (cVal.search(/("|;|\n)/g) >= 0) {
              cVal = '"' + cVal + '"'
            }
            cOut.push(c.value)
          })
          out += cOut.join(';') + '\n'
        })
        out += '\n'
      })
      saveTable('text/csv;charset=utf-8', aFileType, aFilename, doneFunction, out)
    }
  } else {
    console.log('unknown export type', type.id, type)
  }
}

function saveTable (fileType, aFileType, aFilename, doneFunction, buffer) {
  if (buffer) {
    // console.log(buffer)
    let blob = new Blob([buffer], {type: fileType})
    const a = document.createElement('a')
    a.href= URL.createObjectURL(blob)
    a.download = aFilename + '.' + aFileType
    a.click()  
  } else {
    alert('Error on creating file!')
  }
  if (doneFunction) {
    doneFunction(true)
  }
}

function addWs (wb, aSheet, view, filteredSearchResults) {
  let ws = wb.addWorksheet(aSheet)
  if (view.kwic && filteredSearchResults) {
    ws.columns = [
      { key: 'nr', width: 5 },
      { key: 'uId', width: 15 },
      { key: 'speaker', width: 10 },
      { key: 'ltext', width: 120, style: { alignment: { horizontal: 'right' } } },
      { key: 'kwic', width: 20, style: { alignment: { horizontal: 'center' } } },
      { key: 'rtext', width: 120 }
    ]
  } else {
    ws.columns = [
      { key: 'nr', width: 5 },
      { key: 'uId', width: 15 },
      { key: 'speaker', width: 10 },
      { key: 'text', width: 260 }
    ]
  }
  return ws
}

function txtMinLen (txt, len) {
  while (txt.length < len) {
    txt += ' '
  }
  return txt
}

export default localFunctions