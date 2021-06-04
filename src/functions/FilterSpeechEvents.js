const localFunctions = {
  filterActive (f) {
    return (
      f.manualSelect && !(Array.isArray(f.manualSelect) && f.manualSelect.length === 0) ||
      f.domain && !(Array.isArray(f.domain) && f.domain.length === 0) ||
      f.spet && !(Array.isArray(f.spet) && f.spet.length === 0) ||
      f.interactants && !(Array.isArray(f.interactants) && f.interactants.length === 0) ||
      f.speakers && !(Array.isArray(f.speakers) && f.speakers.length === 0) ||
      f.acquaintedness && !(Array.isArray(f.acquaintedness) && f.acquaintedness.length === 0) ||
      f.powerRelations && !(Array.isArray(f.powerRelations) && f.powerRelations.length === 0) ||
      f.durationOfSpeechEvent && !(Array.isArray(f.durationOfSpeechEvent) && f.durationOfSpeechEvent.length === 0) ||
      f.words && !(Array.isArray(f.words) && f.words.length === 0) ||
      f.speakersL1 && !(Array.isArray(f.speakersL1) && f.speakersL1.length === 0) ||
      f.onlyWithAudio && !(Array.isArray(f.onlyWithAudio) && f.onlyWithAudio.length === 0)
    ) ? true : false
  },
  getFilteredIds (corpus, filter, type='all') {
    let xmlIds = Object.keys(corpus.obj)
    if (typeof type === 'string') {
      type = [type]
    }
    if ((type.indexOf('all') > -1 || type.indexOf('manualSelect') > -1) && filter.manualSelect) {
      xmlIds = xmlIds.filter(e => filter.manualSelection.indexOf(e) > -1)
    }
    if ((type.indexOf('all') > -1 || type.indexOf('domain') > -1) && filter.domain && !(Array.isArray(filter.domain) && filter.domain.length === 0)) {
      let af = Array.isArray(filter.domain) ? filter.domain : [filter.domain]
      xmlIds = xmlIds.filter(e => af.indexOf(corpus.obj[e].domain) > -1)
    }
    if ((type.indexOf('all') > -1 || type.indexOf('spet') > -1) && filter.spet && !(Array.isArray(filter.spet) && filter.spet.length === 0)) {
      let af = Array.isArray(filter.spet) ? filter.spet : [filter.spet]
      xmlIds = xmlIds.filter(e => af.indexOf(corpus.obj[e].spet) > -1)
    }
    if ((type.indexOf('all') > -1 || type.indexOf('interactants') > -1) && filter.interactants && !(Array.isArray(filter.interactants) && filter.interactants.length === 0)) {
      let af = Array.isArray(filter.interactants) ? filter.interactants : [filter.interactants]
      xmlIds = xmlIds.filter(e => af.filter(f => corpus.obj[e].interactantsNo >= f.f && corpus.obj[e].interactantsNo <= f.t).length > 0)
    }
    if ((type.indexOf('all') > -1 || type.indexOf('speakers') > -1) && filter.speakers && !(Array.isArray(filter.speakers) && filter.speakers.length === 0)) {
      let af = Array.isArray(filter.speakers) ? filter.speakers : [filter.speakers]
      xmlIds = xmlIds.filter(e => af.filter(f => corpus.obj[e].speakersNo >= f.f && corpus.obj[e].speakersNo <= f.t).length > 0)
    }
    if ((type.indexOf('all') > -1 || type.indexOf('acquaintedness') > -1) && filter.acquaintedness && !(Array.isArray(filter.acquaintedness) && filter.acquaintedness.length === 0)) {
      let af = Array.isArray(filter.acquaintedness) ? filter.acquaintedness : [filter.acquaintedness]
      xmlIds = xmlIds.filter(e => af.indexOf(corpus.obj[e].relationAcquaintedness) > -1)
    }
    if ((type.indexOf('all') > -1 || type.indexOf('powerRelations') > -1) && filter.powerRelations && !(Array.isArray(filter.powerRelations) && filter.powerRelations.length === 0)) {
      let af = Array.isArray(filter.powerRelations) ? filter.powerRelations : [filter.powerRelations]
      xmlIds = xmlIds.filter(e => af.indexOf(corpus.obj[e].relationPower) > -1)
    }
    if ((type.indexOf('all') > -1 || type.indexOf('durationOfSpeechEvent') > -1) && filter.durationOfSpeechEvent && !(Array.isArray(filter.durationOfSpeechEvent) && filter.durationOfSpeechEvent.length === 0)) {
      let af = Array.isArray(filter.durationOfSpeechEvent) ? filter.durationOfSpeechEvent : [filter.durationOfSpeechEvent]
      xmlIds = xmlIds.filter(e => af.filter(f => corpus.obj[e].duration >= f.f && corpus.obj[e].duration < f.t).length > 0)
    }
    if ((type.indexOf('all') > -1 || type.indexOf('words') > -1) && filter.words && !(Array.isArray(filter.words) && filter.words.length === 0)) {
      let af = Array.isArray(filter.words) ? filter.words : [filter.words]
      xmlIds = xmlIds.filter(e => af.filter(f => corpus.obj[e].words >= f.f && corpus.obj[e].words <= f.t).length > 0)
    }
    if ((type.indexOf('all') > -1 || type.indexOf('speakersL1') > -1) && filter.speakersL1 && !(Array.isArray(filter.speakersL1) && filter.speakersL1.length === 0)) {
      let af = Array.isArray(filter.speakersL1) ? filter.speakersL1 : [filter.speakersL1]
      xmlIds = xmlIds.filter(e => af.filter(f => corpus.obj[e].speakersL1.indexOf(f) > -1).length > 0)
    }
    if ((type.indexOf('all') > -1 || type.indexOf('onlyWithAudio') > -1) && filter.onlyWithAudio) {
      xmlIds = xmlIds.filter(e => corpus.obj[e].audioAvailable)
    }
    // console.log('getFilteredIds', xmlIds, corpus)
    return xmlIds
  }
}

export default localFunctions