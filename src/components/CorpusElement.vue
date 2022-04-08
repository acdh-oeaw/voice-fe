<template>
  <div class="flex-grow-1 d-flex flex-column fill-height">
    <div class="flex-grow-1 d-flex flex-column fill-height">
      <div class="d-flex fx-bb" v-if="aElement">
        <v-tabs v-model="vTab" grow height="30" class="flex-shrink-1">
          <v-tab href="#textheader">Text Header</v-tab>
          <v-tab href="#voice">voice</v-tab>
          <v-tab href="#plain">plain</v-tab>
          <v-tab href="#pos">PoS</v-tab>
          <v-tab href="#xml">XML</v-tab>
        </v-tabs>
        <v-btn icon small class="mx-1 mt-auto" title="Download" disabled v-if="vTab === 'textheader'">
          <v-icon small>mdi-download</v-icon>
        </v-btn>
        <v-menu v-model="showDownloadMenue" offset-y style="max-width: 400px" v-else>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small class="mx-1 mt-auto" title="Download" color="#125" v-bind="attrs" v-on="on">
              <v-icon small>mdi-download</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="downloadXML" v-if="vTab === 'xml'">
              <v-list-item-icon class="mr-4"><v-icon>mdi-xml</v-icon></v-list-item-icon>
              <v-list-item-title>XML</v-list-item-title>
            </v-list-item>
            <template v-else>
              <v-list-item @click="downloadText = { id: 'xls', txt: 'XLSX file' }">
                <v-list-item-icon class="mr-4"><v-icon>mdi-microsoft-excel</v-icon></v-list-item-icon>
                <v-list-item-title>XLSX</v-list-item-title>
              </v-list-item>
              <v-list-item @click="downloadText = { id: 'csv', txt: 'CSV file' }">
                <v-list-item-icon class="mr-4"><v-icon>mdi-file-delimited-outline</v-icon></v-list-item-icon>
                <v-list-item-title>CSV</v-list-item-title>
              </v-list-item>
              <v-list-item @click="downloadText = { id: 'html', txt: 'HTML file' }">
                <v-list-item-icon class="mr-4"><v-icon>mdi-language-html5</v-icon></v-list-item-icon>
                <v-list-item-title>HTML</v-list-item-title>
              </v-list-item>
              <v-list-item @click="downloadText = { id: 'text', txt: 'text file' }">
                <v-list-item-icon class="mr-4"><v-icon>mdi-text-box-outline</v-icon></v-list-item-icon>
                <v-list-item-title>Text</v-list-item-title>
              </v-list-item>
            </template>
          </v-list>
        </v-menu>
      </div>
      <div class="px-3 py-2 scroll-content flex-grow-1">
        <div v-if="mainData.corpus.showCorpusHeader" class="tei-header px-4 py-2" v-html="teiHeader"/>
        <div v-else-if="!aElement" class="pa-3">
          <div class="corpus-text pb-5" v-html="mainData.corpus.text" />
        </div>
        <div v-else-if="vTab === 'xml'">
          <CorpusElementXml :element="aElement" v-if="aElement && aElement.xml" />
        </div>
        <div v-else-if="vTab === 'textheader'">
          <CorpusElementHeader :element="aElement" :mainData="mainData" v-if="aElement && aElement.header" />
        </div>
        <div v-else>
          <CorpusElementViews :view="vTab" :element="aElement" :mainData="mainData" :type="vTab" v-if="aElement && aElement.xml" />
          <div class="pa-4" v-else>
            Loading ...
          </div>
        </div>
      </div>
    </div>
    <div class="voice-switches" v-if="aElement && mainData.views && mainData.views[vTab]">
      <RenderSelect :mainData="mainData" :type="vTab" class="d-flex flex-wrap" />
    </div>
    <Audioplayer class="fx-bt" :audiourl="aAudioUrl" v-if="!refreshAudio && aAudioUrl" />
    <CorpusElementDownload
      :mainData="mainData"
      :element="aElement"
      :type="downloadText"
      :view="{kwic: false, type: vTab, views: mainData.views }"
      @close="downloadText = null"
      v-if="aElement && downloadText"
    />
  </div>
</template>

<script>
import Audioplayer from './Audioplayer';
import CorpusElementHeader from './CorpusElementHeader';
import CorpusElementViews from './CorpusElementViews';
import CorpusElementXml from './CorpusElementXml';
import RenderSelect from './RenderSelect';
import CorpusElementDownload from './CorpusElementDownload';

export default {
  name: 'CorpusElement',
  props: {
    'mainData': Object
  },
  data: () => ({
    vTab: null,
    refreshAudio: false,
    showDownloadMenue: false,
    downloadText: null
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
    teiHeader () {
      if (this.mainData.corpus.baseJSON.teiHeader) {
        return this.mainData.corpus.baseJSON.teiHeader.replaceAll(/(class=")([0-9a-z-]+)(")/gm, '$1th-$2$3')
      }
      return 'Loading ...'
    }
  },
  methods: {
    downloadXML () {
      console.log('downloadXML', this.aElement)
      if (this.aElement && this.aElement.xml) {
        let blob = new Blob([this.aElement.xml], {type: 'application/xml'})
        const a = document.createElement('a')
        a.href= URL.createObjectURL(blob)
        a.download = this.aElement.id + '.xml'
        a.click()
      }
    },
    loadElementData () {
      if (this.mainData.apiUrl && this.aElement) {
        if (this.vTab === 'textheader') {
          if (!this.aElement.headerLoaded && !this.aElement.headerLoading) {
            // header headerLoaded headerLoading
            console.log('Load Header ...', this.mainData.apiUrl, this.mainData.corpus.selectedElement)
            this.aElement.headerLoading = true
            this.$http
              .get(this.mainData.apiUrl + 'xml/' + this.mainData.corpus.selectedElement + '.xml/header')
              .then((response) => {
                if (response.data && response.data.xmlId && this.mainData.corpus.selectedElement && this.mainData.corpus.obj[response.data.xmlId.replace(/\.xml$/, '')]) {
                  let lElement = this.mainData.corpus.obj[response.data.xmlId.replace(/\.xml$/, '')]
                  if (!response.data.error) {
                    lElement.header = response.data.xml
                    lElement.headerLoaded = true
                    lElement.headerObj = { loading: true }
                    this.mainData.corpus.saxParserFunc.parseIt(response.data.xml, lElement.headerObj)
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
              .get(this.mainData.apiUrl + 'xml/' + this.mainData.corpus.selectedElement + '.xml/file')
              .then((response) => {
                if (response.data && response.data.xmlId && this.mainData.corpus.selectedElement && this.mainData.corpus.obj[response.data.xmlId.replace(/\.xml$/, '')]) {
                  let lElement = this.mainData.corpus.obj[response.data.xmlId.replace(/\.xml$/, '')]
                  if (!response.data.error) {
                    lElement.xml = response.data.xml
                    lElement.xmlLoaded = true
                    lElement.bodyObj = { loading: true }
                    if (!lElement.headerLoaded && !lElement.headerLoading) {
                      console.log('extract header from xml file')
                      lElement.headerObj = { loading: true }
                      let [headerXML] = this.mainData.corpus.saxParserFunc.parseIt(response.data.xml, lElement.headerObj, lElement.bodyObj)
                      if (headerXML && headerXML) {
                        lElement.header = headerXML
                        lElement.headerLoaded = true
                      } else {
                        alert('Can\'t extract header!');
                      }
                    } else {
                      this.mainData.corpus.saxParserFunc.parseIt(response.data.xml, null, lElement.bodyObj)
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
    },
    'mainData.corpus.goToUtterance' (uId) {
      if (uId && ['voice', 'plain', 'pos'].indexOf(this.vTab) === -1) {
        this.vTab = 'voice'
      }
    }
  },
  components: {
    Audioplayer,
    CorpusElementHeader,
    CorpusElementViews,
    CorpusElementXml,
    RenderSelect,
    CorpusElementDownload
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
