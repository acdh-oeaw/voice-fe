const localFunctions = {
  getFilteredIds (ose, filter, corpus, type='all') {
    let se = ose.filter(e => e && e.xmlId)
    if (typeof type === 'string') {
      type = [type]
    }
    if ((type.indexOf('all') > -1 || type.indexOf('manualSelect') > -1) && filter.manualSelect) {
      se = se.filter(e => filter.manualSelection.indexOf(e.xmlId) > -1)
    }
    if ((type.indexOf('all') > -1 || type.indexOf('onlyWidthAudio') > -1) && filter.onlyWidthAudio) {
      se = se.filter(e => corpus.obj[e.xmlId] && corpus.obj[e.xmlId].audioAvailable)
    }
    // corpus.obj.EDcon4.audioAvailable
    console.log('getFilteredIds', se, corpus)
    return se
  }
}

export default localFunctions