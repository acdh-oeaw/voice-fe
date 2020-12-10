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
            <hr>
            <div v-for="(uObj, uIdx) in mainData.search.results.u.slice(0, 100)" :key="uIdx">
              xmlId: {{ uObj.xmlId }}, uId: {{ uObj.uId }}<br>
              <RenderLine :xmlObjLine="xmlObjLines[uIdx]" :highlight="uObj.highlight" v-if="xmlObjLines"/>
              <hr>
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
  methods: {
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
</style>
