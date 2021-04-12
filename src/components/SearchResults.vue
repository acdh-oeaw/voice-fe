<template>
  <div class="flex-grow-1 d-flex flex-column">
    <div class="scroll-content flex-grow-1">
      <div ref="viewarea" class="px-3 py-2">
        <template v-for="(err, i) in mainData.search.errors">
          <v-alert prominent type="error" dismissible :key="'err' + i">
            <b>Error</b> ({{ err.status }}): <b>{{ err.txt }}</b><br>
            Query: {{ err.q }}
          </v-alert>
        </template>
        <div class="mb-2">Search Results - "{{ mainData.search.value }}" - Filter: {{ mainData.app.filterActive }}</div>
        <div v-if="mainData.search.loading">
          loading ...
        </div>
        <div v-else-if="mainData.search.results && mainData.search.results.query">
          <v-alert prominent type="warning" dismissible v-if="mainData.search.results.hits === 0">
            Nothing found
          </v-alert>
          <v-alert prominent type="warning" dismissible v-else-if="filteredHits === 0">
            Nothing found with actual filter. (Without filter: {{ mainData.search.results.hits }} Hits)
          </v-alert>
          <div>query: {{ mainData.search.results.query }}</div>
          <div v-if="mainData.search.results.cql">cql: {{ mainData.search.results.cql }}</div>
          <div v-if="mainData.search.results.status">status: {{ mainData.search.results.status }}</div>
          <div>xmlStatus: {{ mainData.search.results.xmlStatus }}</div>
          <div v-if="mainData.search.results.u">
            <span :title="'unfiltered hits: ' + mainData.search.results.hits" class="cur-help">{{ filteredHits }}</span> hits in <span :title="'unfiltered utterances: ' + mainData.search.results.u.length" class="cur-help">{{ filteredSearchResults.length }}</span> utterances
          </div>
          <div v-else>
            error
          </div>
          <div v-if="mainData.search.highlights && mainData.search.highlights.size > 0">highlighted tokens: {{ mainData.search.highlights.size }}</div>
          <div v-if="mainData.search.results.u && mainData.search.results.u.length > 0">
            <v-select hide-details
              label="Style"
              :items="['voice', 'plain', 'pos', 'xml-view']"
              v-model="mainData.search.view.type"
            ></v-select>
          </div>
          <SearchResultsView @goToUtterance="goToUtterance" :mainData="mainData" :view="mainData.search.view.type" :filteredSearchResults="filteredSearchResults" :scrollerRef="$refs.viewarea" />
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
    goToUtterance (u) {
      let xmlId = u.split('_')[0]
      this.openDocument(xmlId, u)
    },
    openDocument (xmlId, uId = null) {
      console.log('openDocument', xmlId, uId)
      this.mainData.corpus.selectedElement = xmlId
      this.mainData.corpus.goToUtterance = uId
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
