<template>
  <div class="flex-grow-1 d-flex flex-column">
    <div class="flex-grow-1 d-flex flex-column">
      <v-tabs v-model="vTab" grow height="30" class="flex-shrink-1 fx-bb">
        <v-tab href="#textheader">Text Header</v-tab>
        <v-tab href="#voice">voice</v-tab>
        <v-tab href="#plain">plain</v-tab>
        <v-tab href="#pos">PoS</v-tab>
        <v-tab href="#xml">XML</v-tab>
      </v-tabs>
      <div class="px-3 py-2 scroll-content flex-grow-1">
        <div v-if="vTab === 'xml'">
          <CorpusElementXml :element="aElement" v-if="aElement && aElement.xml" />
        </div>
        <div v-else-if="vTab === 'textheader'">
          VOICE - {{ vTab }}<br>
          {{ aElement ? aElement.id : 'Kein Element ausgewählt ...'}}
          <code v-if="aElement" style="display: block; white-space: pre-wrap;">{{ aElementDev }}</code>
        </div>
        <div v-else>
          <CorpusElementViews :element="aElement" :mainData="mainData" v-if="aElement && aElement.xml" />
        </div>
      </div>
    </div>
    <Audioplayer class="fx-bt" :audiourl="aAudioUrl" v-if="!refreshAudio && aAudioUrl" />
  </div>
</template>

<script>
import Audioplayer from './Audioplayer';
import CorpusElementViews from './CorpusElementViews';
import CorpusElementXml from './CorpusElementXml';

export default {
  name: 'CorpusElement',
  props: {
    'mainData': Object
  },
  data: () => ({
    vTab: 0,
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
    CorpusElementViews,
    CorpusElementXml
  }
}
</script>

<style scoped>
</style>
