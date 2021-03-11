<template>
  <div class="d-flex flex-grow-1 flex-column">
    <div class="scroll-content">
      <div ref="viewarea" class="px-3 py-2" v-on:scroll="scrolling">
        <div class="mb-2">Search Results - "{{ mainData.search.value }}" - Filter: {{ mainData.app.filterActive }}</div>
        <div v-if="mainData.search.loading">
          loading ...
        </div>
        <div v-else-if="!mainData.search.searched">
          Noch keine Suche durchgeführt ...
        </div>
        <div v-else-if="mainData.search.results">
          <div>query: {{ mainData.search.results.query }}</div>
          <div v-if="mainData.search.results.status">status: {{ mainData.search.results.status }}</div>
          <div>xmlStatus: {{ mainData.search.results.xmlStatus }}</div>
          <div>u: {{ mainData.search.results.u ? filteredSearchResults.length + ' / ' + mainData.search.results.u.length : 'error' }}</div>
          <div>h: {{ mainData.search.highlights ? mainData.search.highlights.length : 'error' }}</div>
          <div>cql: {{ mainData.search.results.cql }}</div>
          <div>
            <v-select hide-details
              label="Style"
              :items="['voice', 'plain', 'pos', 'xml']"
              v-model="mainData.search.view.type"
            ></v-select>
          </div>
          <div class="mt-2" v-if="mainData.search.results.u">
            <div>
              <div v-for="(uObj, uIdx) in searchResultsU" class="line-frm" :key="uObj.idx + '-' + uIdx">
                <div @click="openDocument(uObj.xmlId)" class="line-document" v-if="uIdx < 1 || uObj.xmlId !== searchResultsU[uIdx-1].xmlId">
                  {{ uObj.xmlId }}
                </div>
                <div :class="'d-flex' + (mainData.search.view.type === 'xml' ? ' flex-wrap' : '')">
                  <div class="line-uid" v-if="show_utI">{{ uObj.uId.split('_')[0] + ':' + uObj.uId.split('_')[2] }}</div>
                  <template v-if="xmlObjLines[uObj.idx] && xmlObjLines[uObj.idx].dom">
                    <div class="line-speaker" v-if="xmlObjLines">{{ xmlObjLines[uObj.idx].speaker }}</div>
                    <div class="flex-break" v-if="mainData.search.view.type === 'xml'"></div>
                    <RenderLine :xmlObjLine="xmlObjLines[uObj.idx]" :highlight="uObj.highlight" :type="mainData.search.view.type" :mainData="mainData" v-if="xmlObjLines"/>
                  </template>
                  <div class="line-loading" v-else>
                    Loading ... (TBD)
                  </div>
                </div>
              </div>
            </div>
            <div class="my-3" v-if="mainData.search.results.u && mainData.search.results.u.length > 100">
              <b>Weitere Ergebnisse ausgeblendet ... (ToDo)</b>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="voice-switches" v-if="mainData.search.view.type === 'voice' && mainData.search.results && mainData.search.results.u && mainData.search.results.u.length > 0">
      <RenderSelect :mainData="mainData" class="d-flex flex-wrap justify-space-around" />
    </div>
  </div>
</template>

<script>
import RenderLine from './RenderLine';
import RenderSelect from './RenderSelect';

export default {
  name: 'SearchResults',
  props: {
    'mainData': Object
  },
  data: () => ({
    xmlObjLines: null
  }),
  mounted () {
    this.updateXmlObjLines()
    this.$nextTick(() => {
      this.loadScrollPos()
    })
  },
  computed: {
    filteredSearchResults () {
      if (this.mainData.search.results && this.mainData.search.results.u && this.mainData.search.results.u.length > 0) {
        if (this.mainData.app.filterActive) {
          return this.mainData.filter.filterSpeechEventsFunc.getFilteredIds(this.mainData.search.results.u, this.mainData.filter, this.mainData.corpus)
        }
        return this.mainData.search.results.u
      } else {
        return []
      }
    },
    searchResultsU () {
      let ml = this.mainData.search.view.type === 'xml' ? 25 : 100
      return this.filteredSearchResults.slice(0, ml)
    },
    show_utI () {
      return this.mainData.search.view.type !== 'voice' || this.mainData.views.voice.utI.val
    }
  },
  methods: {
    scrolling () {
      if (this.$refs && this.$refs.viewarea) {
        let aTop = this.$refs.viewarea.scrollTop
        this.mainData.search.scrollPos = aTop
      }
    },
    openDocument (xmlId) {
      console.log('openDocument', xmlId)
      this.mainData.corpus.selectedElement = xmlId
      if (xmlId) {
        this.mainData.options.singleView = 'corpus'
        if (this.mainData.corpus.elements.filter(e => e.id === xmlId).length === 0) {
          if (this.mainData.corpus.obj[xmlId]) {
            this.$set(this.mainData.corpus.obj[xmlId], 'open', true)
            this.mainData.corpus.elements.unshift(this.mainData.corpus.obj[xmlId])
          }
        }
      }
    },
    updateXmlObjLines () {
      this.xmlObjLines = null
      if (this.mainData.search.results && this.mainData.search.results.u && this.mainData.search.results.u.length > 0) {
        // console.log('SearchResults - updateXmlObjLines', this.mainData.search.results.u)
        let parser = new DOMParser()
        let aLines = this.mainData.search.results.u.map((aU, aI) => {
          this.$set(aU, 'idx', aI)
          let uDom = null
          let speaker = null
          if (typeof aU.xml === 'string' && aU.xml.length > 5) {
            uDom = parser.parseFromString('<TEI xmlns="http://www.tei-c.org/ns/1.0" xmlns:voice="http://www.univie.ac.at/voice/ns/1.0" xmlns:xi="http://www.w3.org/2001/XInclude" version="5">' + aU.xml + '</TEI>', "application/xml").getElementsByTagName('u')[0]
            speaker = uDom.attributes && uDom.attributes.who && uDom.attributes.who.nodeValue ? uDom.attributes.who.nodeValue : null
          }
          if (speaker && typeof speaker === 'string') {
            speaker = speaker.split('_').slice(-1)[0]
          }
          return {
            dom: uDom,
            xml: aU.xml,
            speaker: speaker,
            text: null,
            textHeight: 24
          }
        })
        this.xmlObjLines = aLines
        // console.log('updateXmlObjLines', this.xmlObjLines[0].dom.outerHTML, this.mainData.search.results.u[0].xml)
      }
    },
    loadScrollPos () {
      if (this.$refs && this.$refs.viewarea) {
        this.$refs.viewarea.scrollTop = this.mainData.search.scrollPos
      }
    }
  },
  watch: {
    'mainData.search.results': {
      deep: true,
      handler() {
        this.loadScrollPos()
        this.updateXmlObjLines()
      }
    }
  },
  components: {
    RenderLine,
    RenderSelect
  }
}
</script>

<style scoped>
.line-frm {
  border-top: 1px solid #ddd;
  padding: 2px 0.5rem;
}
.line-frm:last-child {
  border-bottom: 1px solid #ddd;
}
.line-document {
  background: #eee;
  margin: -2px -0.5rem 3px -0.5rem;
  padding: 0 0.5rem 0 0.5rem;
  font-weight: bold;
  cursor: pointer;
}
.line-document:hover, .line-document:focus {
  background: #eef;
}
.line-uid {
  min-width: 8.5rem;
}
.line-speaker {
  min-width: 4rem;
  font-weight: bold;
}
.voice-switches {
  border-top: solid 1px #ccc;
}
.voice-switches > div {
  max-width: 700px;
}
.line-loading {
  flex-grow: 1;
  background: #f1f3ff;
  padding: 0 4px;
  font-style: italic;
}
</style>
