<template>
  <div class="flex-grow-1 d-flex flex-column">
    <div class="scroll-content flex-grow-1">
      <div ref="viewarea" class="px-3 py-2">
        <div class="mb-2">Search Results - "{{ mainData.search.value }}" - Filter: {{ mainData.app.filterActive }}</div>
        <div v-if="mainData.search.loading">
          loading ...
        </div>
        <div v-else-if="!mainData.search.searched">
          Noch keine Suche durchgeführt ...
        </div>
        <div v-else-if="mainData.search.results">
          <div>query: {{ mainData.search.results.query }}</div>
          <div>cql: {{ mainData.search.results.cql }}</div>
          <div v-if="mainData.search.results.status">status: {{ mainData.search.results.status }}</div>
          <div>xmlStatus: {{ mainData.search.results.xmlStatus }}</div>
          <div v-if="mainData.search.results.u">
            <span :title="'unfiltered hits: ' + mainData.search.results.hits" class="cur-help">{{ filteredHits }}</span> hits in <span :title="'unfiltered utterances: ' + mainData.search.results.u.length" class="cur-help">{{ filteredSearchResults.length }}</span> utterances
          </div>
          <div v-else>
            error
          </div>
          <div>highlighted tokens: {{ mainData.search.highlights ? mainData.search.highlights.size : 'error' }}</div>
          <div>
            <v-select hide-details
              label="Style"
              :items="['voice', 'plain', 'pos', 'xml-view']"
              v-model="mainData.search.view.type"
            ></v-select>
          </div>
          <SearchResultsView :mainData="mainData" :view="mainData.search.view.type" :filteredSearchResults="filteredSearchResults" :scrollerRef="$refs.viewarea" />
        </div>
      </div>
    </div>
    <div class="voice-switches" v-if="mainData.search.view.type === 'voice' && mainData.search.results && mainData.search.results.u && mainData.search.results.u.length > 0">
      <RenderSelect :mainData="mainData" class="d-flex flex-wrap justify-space-around" />
    </div>
  </div>
</template>

<script>
import RenderSelect from './RenderSelect';
import SearchResultsView from './SearchResultsView';

export default {
  name: 'SearchResults',
  props: {
    'mainData': Object
  },
  data: () => ({
  }),
  mounted () {
  },
  computed: {
    filteredSearchResults () {
      if (this.mainData.search.results && this.mainData.search.results.u && this.mainData.search.results.u.length > 0) {
        if (this.mainData.app.filteredSeIds) {
          return this.mainData.search.results.u.filter(e => this.mainData.app.filteredSeIds.indexOf(e.xmlId) > -1)
        }
        return this.mainData.search.results.u
      } else {
        return []
      }
    },
    filteredHits () {
      return this.filteredSearchResults.reduce((a, c) => a + (c.hits || 0), 0)
    },
    show_utI () {
      return this.mainData.search.view.type !== 'voice' || this.mainData.views.voice.utI.val
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
  },
  watch: {
  },
  components: {
    RenderSelect,
    SearchResultsView
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
</style>
