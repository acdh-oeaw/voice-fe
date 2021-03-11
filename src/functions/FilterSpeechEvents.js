const localFunctions = {
  getFilteredIds (corpus, filter, type='all') {
    let xmlIds = Object.keys(corpus.obj)
    if (typeof type === 'string') {
      type = [type]
    }
    if ((type.indexOf('all') > -1 || type.indexOf('manualSelect') > -1) && filter.manualSelect) {
      xmlIds = xmlIds.filter(e => filter.manualSelection.indexOf(e) > -1)
    }
    if ((type.indexOf('all') > -1 || type.indexOf('domain') > -1) && filter.domain) {
      xmlIds = xmlIds.filter(e =>  corpus.obj[e].domain === filter.domain)
    }
    if ((type.indexOf('all') > -1 || type.indexOf('spet') > -1) && filter.spet) {
      xmlIds = xmlIds.filter(e =>  corpus.obj[e].spet === filter.spet)
    }
    if ((type.indexOf('all') > -1 || type.indexOf('interactants') > -1) && filter.interactants) {
      xmlIds = xmlIds.filter(e =>  corpus.obj[e].interactantsNo >= filter.interactants.f && corpus.obj[e].interactantsNo <= filter.interactants.t)
    }
    if ((type.indexOf('all') > -1 || type.indexOf('speakers') > -1) && filter.speakers) {
      xmlIds = xmlIds.filter(e =>  corpus.obj[e].speakersNo >= filter.speakers.f && corpus.obj[e].speakersNo <= filter.speakers.t)
    }
    if ((type.indexOf('all') > -1 || type.indexOf('acquaintedness') > -1) && filter.acquaintedness) {
      xmlIds = xmlIds.filter(e =>  corpus.obj[e].relationAcquaintedness === filter.acquaintedness)
    }
    if ((type.indexOf('all') > -1 || type.indexOf('powerRelations') > -1) && filter.powerRelations) {
      xmlIds = xmlIds.filter(e =>  corpus.obj[e].relationPower >= filter.powerRelations)
    }
    if ((type.indexOf('all') > -1 || type.indexOf('durationOfSpeechEvent') > -1) && filter.durationOfSpeechEvent) {
      xmlIds = xmlIds.filter(e =>  corpus.obj[e].duration >= filter.durationOfSpeechEvent.f && corpus.obj[e].duration < filter.durationOfSpeechEvent.t)
    }
    if ((type.indexOf('all') > -1 || type.indexOf('words') > -1) && filter.words) {
      xmlIds = xmlIds.filter(e =>  corpus.obj[e].words >= filter.words.f && corpus.obj[e].words <= filter.words.t)
    }
    if ((type.indexOf('all') > -1 || type.indexOf('onlyWithAudio') > -1) && filter.onlyWithAudio) {
      xmlIds = xmlIds.filter(e => corpus.obj[e].audioAvailable)
    }
    // console.log('getFilteredIds', xmlIds, corpus)
    return xmlIds
  }
}

export default localFunctions