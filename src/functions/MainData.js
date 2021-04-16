import filterSpeechEvents from './FilterSpeechEvents'
import saxParser from './SaxParser'

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
        highlights: new Map(),
        foundXmlId: [],
        view: {
          type: 'voice',
          kwic: false,
          views: null
        },
        errors: [],
        now: false
      },
      corpus: {
        selectedElement: null,
        goToUtterance: null,
        showCorpusHeader: false,
        elements: [
        ],
        list: [
        ],
        baseJSON: {},
        saxParserFunc: saxParser
      },
      options: {
        fullWidth: true,
        dualView: true,
        singleView: 'corpus',
        treeShowSpet: false,
        treeShowFiltered: false,
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
        },
        pos: {
          utI: { val: true, text: '1', title: 'utterance identifier', style: { color: '#000' } },
          asFT: { val: false, text: '(FT)', title: 'always show function tags', style: { color: '#666' } },
          slv: { val: false, text: '_', title: 'single line view', style: { color: '#333' } },
        }
      },
      infos: {
        spetInfos: {
          con: { label: 'conversation', title: 'A conversation is defined as a speech event at which people interact without a predefined purpose.'},
          int: { label: 'interview', title: 'An interview is defined as a speech event at which questions are being asked and answered.'},
          mtg: { label: 'meeting', title: 'A meeting is defined as a speech event at which a clearly defined group of people meets to discuss previously specified matters.'},
          pan: { label: 'panel', title: 'A panel is defined as a speech event at which a group of specialists give their advice or opinion on a specified topic to an audience.'},
          prc: { label: 'press conference', title: 'A press conference is defined as a speech event at which somebody talks to a group of journalists in order to answer their questions and/or to make an official statement.'},
          qas: { label: 'question-answer session', title: 'A question-answer session is defined as a speech event at which members of an audience ask questions which are answered by specialist speakers.'},
          sed: { label: 'seminar discussion', title: 'A seminar discussion is defined as a speech event at which a group of people meets for systematic study and/or work under the direction of one or more experts.'},
          sve: { label: 'service encounter', title: 'A service encounter is defined as a speech event at which somebody seeks a service which is provided by somebody else.'},
          wgd: { label: 'working group discussion', title: 'A working group discussion is defined as a speech event at which a (temporarily formed) subgroup of a larger group discusses a particular problem or question in order to suggest ways of dealing with it.'},
          wsd: { label: 'workshop discussion', title: 'A workshop discussion is defined as a speech event at which a specific group of people exchanges views, ideas or information on a particular topic.'},
        },
        domainInfos: {
          'ED': { label: 'ED', title: 'Educational - The educational domain includes all social situations connected with institutions or people involved in teaching, training or studying.'},
          'LE': { label: 'LE', title: 'Leisure - The leisure domain includes all social situations occurring during the time that is spent doing something one chooses to do when one is not working or studying.'},
          'PB': { label: 'PB', title: 'Professional business - The professional business domain includes all social situations connected with activities of making, buying, selling or supplying goods or services for money.'},
          'PO': { label: 'PO', title: 'Professional organizational - The professional organizational domain includes all social situations connected with activities of international organizations or networks which are not doing research or business.'},
          'PR': { label: 'PR', title: 'Professional research and science - The professional research/science domain includes all social situations connected with the careful study of a subject, especially in order to discover new facts or information about it.'},
        }
      },
      wideScreen: false
    }
    return mainData
  }
}

export default localFunctions