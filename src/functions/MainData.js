import filterSpeechEvents from './FilterSpeechEvents'

const localFunctions = {
  initMainData () {
    let mainData = {
      app: null,
      apiUrl: process.env.VUE_APP_API_URL,
      filter: {
        active: false,
        manualSelect: false,
        manualSelection: [],
        interactants: null,
        speakers: null,
        acquaintedness: null,
        powerRelations: null,
        durationOfSpeechEvent: null,
        words: null,
        domain: null,
        spet: null,
        onlyWithAudio: false,
        filterSpeechEventsFunc: filterSpeechEvents
      },
      search: {
        value: '',
        lastValue: '',
        searched: false,
        loading: false,
        searchValue: '',
        results: {},
        scrollPos: 0,
        highlights: [],
        foundXmlId: [],
        view: {
          type: 'voice'
        }
      },
      corpus: {
        selectedElement: null,
        elements: [
        ],
        list: [
        ],
        baseJSON: {}
      },
      options: {
        fullWidth: true,
        dualView: true,
        singleView: 'corpus',
        treeShowSpet: false,
      },
      views: {
        voice: {
          utI: { val: true, text: '1', title: 'utterance identifier', style: { color: '#000' } },
          sId: { val: true, text: 'S1', title: 'speaker id', style: { color: '#000', 'font-weight': 'bold', display: 'none' } },
          oT: { val: true, text: '<1>', title: 'overlap tags', style: { color: 'blue' } },
          p: { val: true, text: '(.)', title: 'pauses', style: { color: 'brown' } },
          cE: { val: true, text: '{...}', title: 'contextual events', style: { color: '#808080' } }, 
          sM: { val: true, text: '<fast>', title: 'speaking modes', style: { color: '#AA0066' } },
          sMls: { val: true, text: '<@>', title: 'speaking mode laughingly spoken', style: { color: '#AA0066' } },
          vsN: { val: true, text: '<coughs>', title: 'vocal/speaker noise', style: { color: '#AA0066' } },
          vsNl: { val: true, text: '@', title: 'vocal/speaker noise laughter', style: { color: '#AA0066' } },
          spl: { val: true, text: '<spel>', title: 'spelled', style: { color: '#AA0066' } },
          fLaT: { val: true, text: '<L1fr>', title: 'foreign language tags', style: { color: '#b13610' } },
          oC: { val: true, text: '=', title: 'other continuations', style: { color: '#8700C1' } },
          uiT: { val: true, text: '<un>', title: 'unintelligible tags', style: { color: '#00978E' } },
          ono: { val: true, text: '<ono>', title: 'onomatopoeia', style: { color: '#61DDD2' } },
          pvcT: { val: true, text: '<pvc>', title: 'pvc tags', style: { color: '#61DDD2' } },
          gap: { val: true, text: '(gap)', title: 'gap', style: { color: '#000' } },
          lie: { val: true, text: ':.?', title: '(Lengthening, Intonation, Emphasis)', style: { color: '#000' } },
          ut: { val: true, text: '(word)', title: 'Uncertain transcription', style: { color: '#000' } },
        }
      },
      wideScreen: false
    }
    return mainData
  }
}

export default localFunctions