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
        <div v-if="!aElement" class="tei-header px-4 py-2" v-html="teiHeader"/>
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
      <RenderSelect :mainData="mainData" class="d-flex flex-wrap justify-space-around" />
    </div>
    <Audioplayer class="fx-bt" :audiourl="aAudioUrl" v-if="!refreshAudio && aAudioUrl" />
  </div>
</template>

<script>
import Audioplayer from './Audioplayer';
import CorpusElementHeader from './CorpusElementHeader';
import CorpusElementViews from './CorpusElementViews';
import CorpusElementXml from './CorpusElementXml';
import RenderSelect from './RenderSelect';

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
    CorpusElementXml,
    RenderSelect
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
.tei-header >>> h2 {
  margin-top: 16px;
  margin-bottom: 16px;
  border-bottom: solid 1px #bbb;
}
.tei-header >>> h3 {
  margin-bottom: 8px;
}
</style>
