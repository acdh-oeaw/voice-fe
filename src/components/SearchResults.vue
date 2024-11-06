<template>
  <div class="flex-grow-1 d-flex flex-column fill-height">
    <div class="flex-shrink-1 fx-bb" v-if="!mainData.search.loading && mainData.search.searched && mainData.search.results && mainData.search.results.hits">
      <template v-if="mainData.search.results.u">
        <div class="px-3 pt-2">
          <span :title="'unfiltered hits: ' + mainData.search.results.hits.length" class="cur-help">{{ filteredHits }}</span> hits in <span :title="'unfiltered utterances: ' + mainData.search.results.u.length" class="cur-help">{{ filteredSearchResults.length }}</span> utterances
        </div>
        <div class="d-flex">
          <v-tabs v-model="mainData.search.view.type" grow height="30" class="flex-shrink-1 fx-bb border-0 mt-1">
            <v-tab href="#voice">voice</v-tab>
            <v-tab href="#plain">plain</v-tab>
            <v-tab href="#pos">PoS</v-tab>
            <v-tab href="#xml-view" :disabled="mainData.search.view.kwic">XML</v-tab>
          </v-tabs>
          <v-checkbox
            label="KWIC"
            class="mx-2"
            dense
            hide-details
            :disabled="mainData.search.view.type === 'xml-view'"
            v-model="mainData.search.view.kwic"
          ></v-checkbox>
          <v-btn icon small class="mt-1 mx-1" disabled v-if="mainData.search.view.type === 'xml-view'">
            <v-icon small>mdi-download</v-icon>
          </v-btn>
          <v-menu v-model="showDownloadMenue" offset-y style="max-width: 400px" v-else>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small class="mt-1 mx-1" title="Download search results" color="#125" v-bind="attrs" v-on="on">
                <v-icon small>mdi-download</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="downloadSearchResults = { id: 'xls', txt: 'XLSX file' }">
                <v-list-item-icon class="mr-4"><v-icon>mdi-microsoft-excel</v-icon></v-list-item-icon>
                <v-list-item-title>XLSX</v-list-item-title>
              </v-list-item>
              <v-list-item @click="downloadSearchResults = { id: 'xlsWS', txt: 'XLSX file with Worksheets' }">
                <v-list-item-icon class="mr-4"><v-icon>mdi-microsoft-excel</v-icon></v-list-item-icon>
                <v-list-item-title>XLSX - Worksheets</v-list-item-title>
              </v-list-item>
              <v-list-item @click="downloadSearchResults = { id: 'csv', txt: 'CSV file' }">
                <v-list-item-icon class="mr-4"><v-icon>mdi-file-delimited-outline</v-icon></v-list-item-icon>
                <v-list-item-title>CSV</v-list-item-title>
              </v-list-item>
              <v-list-item @click="downloadSearchResults = { id: 'html', txt: 'HTML file' }">
                <v-list-item-icon class="mr-4"><v-icon>mdi-language-html5</v-icon></v-list-item-icon>
                <v-list-item-title>HTML</v-list-item-title>
              </v-list-item>
              <v-list-item @click="downloadSearchResults = { id: 'text', txt: 'text file' }" :disabled="mainData.search.view.kwic">
                <v-list-item-icon class="mr-4"><v-icon>mdi-text-box-outline</v-icon></v-list-item-icon>
                <v-list-item-title>Text</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
      <div v-else>
        error
      </div>
    </div>
    <div class="scroll-content flex-grow-1">
      <div @scroll="viewareaScroll" ref="viewarea" class="px-3 py-2">
        <template v-for="(err, i) in mainData.search.errors">
          <v-alert prominent type="error" dismissible :key="'err' + i">
            <b>Error</b> ({{ err.status }}): <b>{{ err.txt }}</b><br>
            Query: {{ err.q }}
          </v-alert>
        </template>
        <!-- <div class="mb-2">Search Results - "{{ mainData.search.value }}" - Filter: {{ mainData.app.filterActive }}</div> -->
        <div v-if="mainData.search.loading">
          loading ...
        </div>
        <div v-else-if="!mainData.search.searched">
          <div>No search done yet ...</div>
        </div>
        <div v-else-if="mainData.search.results && mainData.search.results.hits">
          <v-alert prominent type="warning" dismissible v-if="mainData.search.results.hits.length === 0">
            Nothing found. Check query syntax.
          </v-alert>
          <v-alert prominent type="warning" dismissible v-else-if="filteredHits === 0">
            Nothing found with current filter. (Without filter: {{ mainData.search.results.u.length }} Hits)
          </v-alert>
          <div class="cql-line">CQL: {{ mainData.search.results.cql }}</div>
          <v-alert v-model="mainData.search.showInfos.utteranceClick" dense outlined type="info" dismissible class="mt-3">
            <div style="font-size: 0.9rem; line-height: 1.1rem;">To view a search result in the corresponding corpus text, click on the utterance ID in the search results.</div>
          </v-alert>
          <div v-if="mainData.search.view.type === 'pos'">
            <v-btn href="https://voice.acdh.oeaw.ac.at/assets/content/en/pages/pos-manuals/Short-POS-tagset.pdf" target="_blank" class="mr-2 mb-3" small><v-icon class="mr-2" small>mdi-book-open-variant</v-icon> List of POS tag</v-btn>
            <v-btn href="https://voice.acdh.oeaw.ac.at/assets/content/en/pages/pos-manuals/POS-tagging-and-lemmatization-manual.pdf" target="_blank" class="mr-2 mb-3" small><v-icon class="mr-2" small>mdi-book-open-variant</v-icon> POS tagging and lemmatization</v-btn>
          </div>
          <div v-if="mainData.search.view.type === 'voice'">
            <v-btn href="https://voice.acdh.oeaw.ac.at/assets/content/en/pages/transcription-conventions/VOICE-mark-up-conventions.pdf" target="_blank" class="mr-2 mb-3" small><v-icon class="mr-2" small>mdi-book-open-variant</v-icon> Mark-Up Conventions</v-btn>
            <v-btn href="https://voice.acdh.oeaw.ac.at/assets/content/en/pages/transcription-conventions/VOICE-spelling-conventions.pdf" target="_blank" class="mr-2 mb-3" small><v-icon class="mr-2" small>mdi-book-open-variant</v-icon> Spelling Conventions</v-btn>
          </div>
          <SearchResultsView
            ref="searchResultsView"
            @goToUtterance="goToUtterance"
            :mainData="mainData"
            :view="mainData.search.view.type"
            :filteredSearchResults="filteredSearchResults"
            :downloadSearchResults="downloadSearchResults"
            :scrollerRef="$refs.viewarea"
          />
        </div>
      </div>
    </div>
    <div class="voice-switches" v-if="mainData.search.searched && mainData.search.results && mainData.search.results.u && mainData.search.view.views && mainData.search.view.views[mainData.search.view.type] && mainData.search.results && mainData.search.results.u && mainData.search.results.u.length > 0">
      <RenderSelect :mainData="mainData" :views="mainData.search.view.views" :type="mainData.search.view.type" class="d-flex flex-wrap" />
    </div>
    <SearchResultsDownload
      :mainData="mainData"
      :type="downloadSearchResults"
      :filteredSearchResults="filteredSearchResults"
      :view="mainData.search.view"
      :searchResultsView="$refs.searchResultsView"
      @close="downloadSearchResults = null"
      v-if="downloadSearchResults"
    />
  </div>
</template>

<script>
import RenderSelect from './RenderSelect';
import SearchResultsView from './SearchResultsView';
import SearchResultsDownload from './SearchResultsDownload';

export default {
  name: 'SearchResults',
  props: {
    'mainData': Object
  },
  data: () => ({
    showDownloadMenue: false,
    downloadSearchResults: null
  }),
  mounted () {
    if (!this.mainData.search.view.views) {
      this.mainData.search.view.views = JSON.parse(JSON.stringify(this.mainData.views))
    }
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
      return this.filteredSearchResults.reduce((a, c) => a + (c.hits.length || 0), 0)
    },
    show_utI () {
      return this.mainData.search.view.type !== 'voice' || this.mainData.search.view.views.voice.utI.val
    }
  },
  methods: {
    viewareaScroll (e) {
      if (this.$refs.searchResultsView) {
        this.$refs.searchResultsView.scrollEvent(e)
      }
    },
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
    SearchResultsView,
    SearchResultsDownload
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
.cql-line {
  font-size: 0.8rem;
  color: #999;
}
</style>
