import renderer from './Renderer'
const ExcelJS = require('exceljs')

const localFunctions = {
  saveSearchResult (xmlObjLines, filteredSearchResults, view, type, fxText, highlights, progressFunction = null, doneFunction = null, htmlCss, htmlTemplate, xDocument) {
    let uList = []
    renderExportUtterances(xmlObjLines, filteredSearchResults, view, type, fxText, highlights, progressFunction, doneFunction, uList, 0, htmlCss, htmlTemplate, xDocument)
  },
}

function renderExportUtterances (xmlObjLines, filteredSearchResults, view, type, fxText, highlights, progressFunction = null, doneFunction = null, uList, uListPos, htmlCss, htmlTemplate, xDocument) {
  let htmlTmp = xDocument.createElement('DIV')
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
        let lHtml = renderer.renderUtterance(aU.uObj.obj, {...aU.uObj, xml: aU.uObj.obj.xml}, view.type, highlights, filteredSearchResults ? true : false)
        htmlTmp.innerHTML = lHtml
        let lTxt = (htmlTmp.textContent || htmlTmp.innerText || '').trim().replace(/ +(?= )/g, '')
        if (view.kwic && filteredSearchResults) {
          let aObj = filteredSearchResults.filter(x => x.uId === aU.uId)[0]
          aObj.hits.forEach(uHit => {
            let kwicHtmlTmp = xDocument.createElement('DIV')
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
              kwicSelector: 's_' + uHit[0],
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
      setTimeout(() => { renderExportUtterances(xmlObjLines, filteredSearchResults, view, type, fxText, highlights, progressFunction, doneFunction, uList, uListPos, htmlCss, htmlTemplate, xDocument) }, 10)
    }
  }
  if (!progressFunction || aLines.length === 0) {
    // console.log('renderExportUtterances', uList)
    if (progressFunction) {
      progressFunction(100)
    }
    exportUtterancesList (xmlObjLines, filteredSearchResults, view, type, fxText, highlights, progressFunction, doneFunction, uList, htmlCss, htmlTemplate)
  }
}

function exportUtterancesList (xmlObjLines, filteredSearchResults, view, type, fxText, highlights, progressFunction = null, doneFunction = null, uList, htmlCss, htmlTemplate) {
  // console.log('exportUtterancesList', view, type, uList)
  let aHeader = 'VOICE 3.0'
  let aTime = new Date()
  let aDateTime = aTime.toLocaleString('en-US')
  let aFilename = 'voice' + (fxText && fxText.fileFx ? '-' + fxText.fileFx : '') + '_' + aTime.getFullYear() + '-' + ('0' + (aTime.getMonth()+1)).slice(-2) + '-' + ('0' + aTime.getDate()).slice(-2) + '_' + ('0' + aTime.getHours()).slice(-2) + '-' + ('0' + aTime.getMinutes()).slice(-2) + '-' + ('0' + aTime.getSeconds()).slice(-2)
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
    if (doneFunction) {
      doneFunction(aExportText, 'text/plain;charset=utf-8', 'txt', aFilename)
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
            cVal = cVal === null || cVal === undefined ? '' : cVal.toString()
            cVal = cVal.replace(/"/g, '""')
            if (cVal.search(/("|;|\n)/g) >= 0) {
              cVal = '"' + cVal + '"'
            }
            cOut.push(cVal)
          })
          out += cOut.join(';') + '\n'
        })
        out += '\n'
      })
      saveTable('text/csv;charset=utf-8', aFileType, aFilename, doneFunction, out)
    }
  } else if (type.id === 'html') {
    let aOut = htmlTemplate
    aOut = aOut.replace('/*CSS*/', htmlCss)
    aOut = aOut.replace('<!--Title-->', aHeader + (fxText ? ' - ' + fxText.addText.replace('\n', ' - ') : '') + ' - ' + aDateTime)
    // console.log({x: aOut})
    let aExportText = ''
    aExportText += '<h1 style="margin: 0;">' + aHeader + '</h1>\n'
    if (fxText && fxText.version) {
      aExportText += '<div style="font-size: 0.8rem;">' + fxText.version.replace('\n', '<br>\n') + '</div>\n'
    }
    if (fxText && fxText.addText) {
      aExportText += fxText.addText.replace('\n', '<br>\n') + '<br>\n'
    }
    aExportText += aDateTime + '<br>'
    aOut = aOut.replace('<!--Header-->', aExportText)
    let aClasses = 'line-con typ-' + view.type
    Object.keys(view.views).some(v => {
      if (view.type === v) {
        Object.keys(view.views[v]).forEach(vo => {
          if (view.views[v][vo].val) {
            aClasses += ' s-' + vo.toLowerCase()
          }
        })
        return true
      }
    })
    let aRenderLines = ''
    let lXmlId = ''
    let luId = ''
    if (filteredSearchResults && view.kwic) {
      aOut = aOut.replace('<!--KwicScriptStart-->', '')
      aOut = aOut.replace('<!--KwicScriptEnd-->', '')
    } else {
      aOut = aOut.replace(/<!--KwicScriptStart-->(.|\r|\n)*<!--KwicScriptEnd-->/gm, '')
    }
    uList.forEach(u => {
      if (filteredSearchResults && lXmlId !== u.uId.split('_u_')[0]) {
        aRenderLines += '<div class="line-document">' + u.uId.split('_u_')[0] + '</div>'
      }
      aRenderLines += '<div class="line-frm">'
      if (filteredSearchResults) {
        aRenderLines += '<div class="line-uid">' + (luId !== u.uId ? u.uId.split('_u_').join(':') : '') + '</div>'
      } else {
        aRenderLines += '<div class="line-nr">' + u.uId.split('_u_')[1] + '</div>'
      }
      aRenderLines += '<div class="line-speaker">' + (luId !== u.uId && u.uObj.obj.attributes && u.uObj.obj.attributes.who ? u.uObj.obj.attributes.who.split('_').slice(-1)[0] : '') + '</div>'
      if (filteredSearchResults && view.kwic) {
        aRenderLines += '<div class="kwic-frm" data-kwic="' + u.kwicSelector + '">'
      }
      aRenderLines += '<div class="rl-lc ' + aClasses + '">' + u.html.trim() + '</div>\n'
      if (filteredSearchResults && view.kwic) {
        aRenderLines += '</div>'
      }
      aRenderLines += '</div>'
      luId = u.uId
      lXmlId = u.uId.split('_u_')[0]
    })
    aOut = aOut.replace('<!--RenderLines-->', aRenderLines)
    // console.log('html', aOut, view.type)
    if (doneFunction) {
      doneFunction(aOut, 'text/html;charset=utf-8', 'html', aFilename)
    }
  } else {
    console.log('unknown export type', type.id, type)
  }
}

function saveTable (mimeType, aFileType, aFilename, doneFunction, buffer) {
  if (buffer) {
    // console.log(buffer)
    doneFunction(buffer, mimeType, aFileType, aFilename)
  } else {
    alert('Error on creating file!')
    if (doneFunction) {
      doneFunction(false)
    }
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