<template>
  <div class="d-flex flex-grow-1">
    <div class="scroll-content">
      <div class="px-3 py-2">
        <div class="mb-2">Search Results - "{{ mainData.search.value }}"</div>
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
          <div>u: {{ mainData.search.results.u ? mainData.search.results.u.length : 'error' }}</div>
          <div class="mt-2" v-if="mainData.search.results.u">
            <div>
              <div v-for="(uObj, uIdx) in searchResultsU" class="line-frm" :key="uIdx">
                <div @click="openDocument(uObj.xmlId)" class="line-document" v-if="uIdx < 1 || uObj.xmlId !== searchResultsU[uIdx-1].xmlId">
                  {{ uObj.xmlId }}
                </div>
                <div class="d-flex">
                  <div class="line-nr">{{ uObj.uId.split('_')[2] }}</div>
                  <div class="line-speaker" v-if="xmlObjLines">{{ xmlObjLines[uIdx].speaker }}</div>
                  <RenderLine :xmlObjLine="xmlObjLines[uIdx]" :highlight="uObj.highlight" v-if="xmlObjLines"/>
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
  </div>
</template>

<script>
import RenderLine from './RenderLine';

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
  },
  computed: {
    searchResultsU () {
      return this.mainData.search.results && this.mainData.search.results.u && this.mainData.search.results.u.length > 0 ? this.mainData.search.results.u.slice(0, 100) : []
    }
  },
  methods: {
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
        let aLines = this.mainData.search.results.u.map(aU => {
          let uDom = parser.parseFromString(aU.xml, "text/html").getElementsByTagName('u')[0]
          let speaker = uDom.attributes && uDom.attributes.who && uDom.attributes.who.nodeValue ? uDom.attributes.who.nodeValue : null
          if (speaker && typeof speaker === 'string') {
            speaker = speaker.split('_').slice(-1)[0]
          }
          return {
            dom: uDom,
            speaker: speaker,
            text: null,
            textHeight: 24
          }
        })
        this.xmlObjLines = aLines
        // console.log('updateXmlObjLines', this.xmlObjLines[0].dom.outerHTML, this.mainData.search.results.u[0].xml)
      }
    }
  },
  watch: {
    'mainData.search.results': {
      deep: true,
      handler() {
        this.updateXmlObjLines()
      }
    }
  },
  components: {
    RenderLine
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
  padding: 0 0.5rem 0 7.5rem;
  font-weight: bold;
  cursor: pointer;
}
.line-document:hover, .line-document:focus {
  background: #eef;
}
.line-nr {
  min-width: 3rem;
}
.line-speaker {
  min-width: 4rem;
  font-weight: bold;
}
</style>
