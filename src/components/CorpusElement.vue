<template>
  <div class="flex-grow-1 d-flex flex-column">
    <div class="flex-grow-1 d-flex flex-column">
      <v-tabs v-model="vTab" grow height="30" class="flex-shrink-1 fx-bb" v-if="aElement">
        <v-tab href="#textheader">Text Header</v-tab>
        <v-tab href="#voice">voice</v-tab>
        <v-tab href="#plain">plain</v-tab>
        <v-tab href="#pos">PoS</v-tab>
        <v-tab href="#xml">XML</v-tab>
      </v-tabs>
      <div class="px-3 py-2 scroll-content flex-grow-1">
        <div v-if="!aElement" class="tei-header pa-2" v-html="teiHeader"/>
        <div v-else-if="vTab === 'xml'">
          <CorpusElementXml :element="aElement" v-if="aElement && aElement.xml" />
        </div>
        <div v-else-if="vTab === 'textheader'">
          <CorpusElementHeader :element="aElement" :mainData="mainData" v-if="aElement && aElement.header" />
        </div>
        <div v-else>
          <CorpusElementViews :view="vTab" :element="aElement" :mainData="mainData" v-if="aElement && aElement.xml" />
        </div>
      </div>
    </div>
    <div class="voice-switches" v-if="aElement && vTab === 'voice'">
      <div class="d-flex flex-wrap justify-space-around">
        <div @click="mainData.views.voice.utI = !mainData.views.voice.utI" :class="'vs-uti' + (mainData.views.voice.utI ? '' : ' off')" title="utterance identifier">1</div>
        <div @click="mainData.views.voice.sId = !mainData.views.voice.sId" :class="'vs-sid' + (mainData.views.voice.sId ? '' : ' off')" title="speaker id">S1</div>
        <div @click="mainData.views.voice.oT = !mainData.views.voice.oT" :class="'vs-ot' + (mainData.views.voice.oT ? '' : ' off')" title="overlap tags">&lt;1&gt;</div>
        <div @click="mainData.views.voice.p = !mainData.views.voice.p" :class="'vs-p' + (mainData.views.voice.p ? '' : ' off')" title="pauses">(.)</div>
        <div @click="mainData.views.voice.cE = !mainData.views.voice.cE" :class="'vs-ce' + (mainData.views.voice.cE ? '' : ' off')" title="contextual events">{...}</div> 
        <div @click="mainData.views.voice.sM = !mainData.views.voice.sM" :class="'vs-sm' + (mainData.views.voice.sM ? '' : ' off')" title="speaking modes">&lt;fast&gt;</div>
        <div @click="mainData.views.voice.vsN = !mainData.views.voice.vsN" :class="'vs-vsn' + (mainData.views.voice.vsN ? '' : ' off')" title="vocal/speaker noise">&lt;coughs&gt;</div>
        <div @click="mainData.views.voice.spl = !mainData.views.voice.spl" :class="'vs-spl' + (mainData.views.voice.spl ? '' : ' off')" title="spelled">&lt;spel&gt;</div>
        <div @click="mainData.views.voice.fLaT = !mainData.views.voice.fLaT" :class="'vs-flat' + (mainData.views.voice.fLaT ? '' : ' off')" title="foreign language tags">&lt;L1fr&gt;</div>
        <div @click="mainData.views.voice.oC = !mainData.views.voice.oC" :class="'vs-oc' + (mainData.views.voice.oC ? '' : ' off')" title="other continuations">=</div>
        <div @click="mainData.views.voice.uiT = !mainData.views.voice.uiT" :class="'vs-uit' + (mainData.views.voice.uiT ? '' : ' off')" title="unintelligible tags">&lt;un&gt;</div>
        <div @click="mainData.views.voice.ono = !mainData.views.voice.ono" :class="'vs-ono' + (mainData.views.voice.ono ? '' : ' off')" title="onomatopoeia">&lt;ono&gt;</div>
        <div @click="mainData.views.voice.pvcT = !mainData.views.voice.pvcT" :class="'vs-pvct' + (mainData.views.voice.pvcT ? '' : ' off')" title="pvc tags">&lt;pvc&gt;</div>
        <div @click="mainData.views.voice.gap = !mainData.views.voice.gap" :class="'vs-gap' + (mainData.views.voice.gap ? '' : ' off')" title="gap">(gap/(nrec</div>
      </div>
    </div>
    <Audioplayer class="fx-bt" :audiourl="aAudioUrl" v-if="!refreshAudio && aAudioUrl" />
  </div>
</template>

<script>
import Audioplayer from './Audioplayer';
import CorpusElementHeader from './CorpusElementHeader';
import CorpusElementViews from './CorpusElementViews';
import CorpusElementXml from './CorpusElementXml';

export default {
  name: 'CorpusElement',
  props: {
    'mainData': Object
  },
  data: () => ({
    vTab: null,
    refreshAudio: false
  }),
  mounted () {
    console.log('CorpusElement', this.mainData)
  },
  computed: {
    aAudioUrl () {
      return this.aElement && this.aElement.audioAvailable && this.aElement.refs && this.aElement.refs.audio
    },
    aElement () {
      return this.mainData.corpus.selectedElement && this.mainData.corpus.obj[this.mainData.corpus.selectedElement]
    },
    aElementDev () {
      let aElDev = {}
      Object.keys(this.aElement).forEach(p => {
        aElDev[p] = (p === 'xml' || p === 'header') ? ('size ' + this.aElement[p].length.toLocaleString() + ' Byte') : this.aElement[p]
      })
      return aElDev
    },
    teiHeader () {
      if (this.mainData.corpus.baseJSON.teiHeader) {
        return this.mainData.corpus.baseJSON.teiHeader.replaceAll(/(class=")([0-9a-z-]+)(")/gm, '$1th-$2$3')
      }
      return 'Loading ...'
    }
  },
  methods: {
    loadElementData () {
      if (this.mainData.apiUrl && this.aElement) {
        if (this.vTab === 'textheader') {
          if (!this.aElement.headerLoaded && !this.aElement.headerLoading) {
            // header headerLoaded headerLoading
            console.log('Load Header ...', this.mainData.apiUrl, this.mainData.corpus.selectedElement)
            this.aElement.headerLoading = true
            this.$http
              .get(this.mainData.apiUrl + 'xml/' + this.mainData.corpus.selectedElement + '/header')
              .then((response) => {
                if (response.data && response.data.xmlId && this.mainData.corpus.selectedElement && this.mainData.corpus.obj[response.data.xmlId]) {
                  let lElement = this.mainData.corpus.obj[response.data.xmlId]
                  if (!response.data.error) {
                    lElement.header = response.data.xml
                    lElement.headerLoaded = true
                  } else {
                    alert(response.data.error)
                    console.log(response.data.error, response)
                  }
                  lElement.headerLoading = false
                }
              })
              .catch((err) => {
                console.log(err)
                this.aElement.headerLoading = true
              })
          }
        } else {
          if (!this.aElement.xmlLoaded && !this.aElement.xmlLoading) {
            // xml xmlLoaded xmlLoading
            console.log('Load XML ...', this.mainData.apiUrl)
            this.aElement.xmlLoading = true
            this.$http
              .get(this.mainData.apiUrl + 'xml/' + this.mainData.corpus.selectedElement + '/file')
              .then((response) => {
                if (response.data && response.data.xmlId && this.mainData.corpus.selectedElement && this.mainData.corpus.obj[response.data.xmlId]) {
                  let lElement = this.mainData.corpus.obj[response.data.xmlId]
                  if (!response.data.error) {
                    lElement.xml = response.data.xml
                    lElement.xmlLoaded = true
                    if (!lElement.headerLoaded && !lElement.headerLoading) {
                      console.log('extract header from xml file')
                      let parser = new DOMParser()
                      let xmlDoc = parser.parseFromString(lElement.xml,"text/xml")
                      let aHeader = xmlDoc.getElementsByTagName('teiHeader')
                      if (aHeader && aHeader[0]) {
                        aHeader = aHeader[0]
                        lElement.header = aHeader.outerHTML.replace(/<([a-zA-Z0-9 ]+)(?:xml)ns=".*"(.*)>/g, '<$1$2>')
                        lElement.headerLoaded = true
                      } else {
                        alert('Can\'t extract header!');
                      }
                    }
                  } else {
                    alert(response.data.error)
                    console.log(response.data.error, response)
                  }
                  lElement.xmlLoading = false
                }
              })
              .catch((err) => {
                console.log(err)
                this.aElement.xmlLoading = true
              })
          }
        }
      }
    }
  },
  watch: {
    aAudioUrl () {
      this.refreshAudio = true
      this.$nextTick(() => {
        this.refreshAudio = false
      })
    },
    aElement () {
      this.loadElementData()
    },
    vTab () {
      this.loadElementData()
    }
  },
  components: {
    Audioplayer,
    CorpusElementHeader,
    CorpusElementViews,
    CorpusElementXml
  }
}
</script>

<style scoped>
.voice-switches {
  border-top: solid 1px #ccc;
}
.voice-switches > div {
  max-width: 700px;
}
.voice-switches > div > div {
  cursor: pointer;
  user-select: none;
  min-width: 20px;
  padding: 0 2px;
  text-align: center;
}
.voice-switches > div > div.off {
  color: #bbb!important;
}
.voice-switches > div > div:hover {
  background: #ddd;
}

/* voice-switches */
.vs-sid {
  font-weight: bold;
}
.vs-ot {
  color: blue;
}
.vs-p {
  color: brown;
}
.vs-ce {
  color: #808080;
}
.vs-sm {
  color: #AA0066;
}
.vs-vsn {
  color: #AA0066;
}
.vs-spl {
  color: #AA0066;
}
.vs-uit {
  color: #00978E;
}
.vs-ono {
  color: #61DDD2;
}
.vs-pvct {
  color: #61DDD2;
}
.tei-header >>> ul, .tei-header >>> p, .tei-header >>> dl {
  margin-left: 8px;
}
.tei-header >>> dl dt {
  font-weight: bold;
}
.tei-header >>> dl dd {
  margin-left: 8px;
  margin-bottom: 8px;
}
.tei-header >>> h3 {
  margin-bottom: 8px;
}
</style>
