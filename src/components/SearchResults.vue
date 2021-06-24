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
            <v-tab href="#xml-view">XML</v-tab>
          </v-tabs>
          <v-checkbox
            label="KWIC"
            class="mx-2"
            dense
            hide-details
            :disabled="mainData.search.view.type === 'xml-view'"
            v-model="mainData.search.view.kwic"
          ></v-checkbox>
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
          <!-- <div class="mt-3">
            <hr class="mb-3">
            <p><b><u>Explore the new features of VOICE 3.0 Online BETA</u></b></p>
            <p><b>Enhanced search functions</b></p>
            <p>
              In VOICE 3.0 Online BETA, the previous interfaces VOICE Online and VOICE POS Online have been merged and refined. In addition, our new interface includes entirely new query options that make it possible to search for select mark-up of spoken language (pauses, laughter, overlaps, etc.). Queries for tokens, POS, lemmas and mark-up can be flexibly combined and modified with different wildcards. For details of query features to try out, see our VOICE 3.0 Online BETA
              <a href="https://voice-clariah.acdh.oeaw.ac.at/searchmanual/" target="_blank">search manual</a>.
            </p>
            <p><b>Additional filter categories</b></p>
            <p>In addition to domain and speech event type, VOICE 3.0 Online BETA offers new filter categories for selecting speech events (number of interactants/speakers, duration, number of words, etc.) and building your own subcorpus. </p>
            <p><b>New style options</b></p>
            <p>Try out the enhanced, customizable display of search results and VOICE transcripts. Have a look at our style options (voice, plain, pos, xml; kwic style for search results) and/or adapt the voice style according to your research interests by using the different 'flexi style' categories (overlaps, pauses, etc.; new: e.g. laughter, uncertain transcription). </p>
          </div> -->
        </div>
        <div v-else-if="mainData.search.results && mainData.search.results.hits">
          <v-alert prominent type="warning" dismissible v-if="mainData.search.results.hits.length === 0">
            Nothing found. Check query syntax.
          </v-alert>
          <v-alert prominent type="warning" dismissible v-else-if="filteredHits === 0">
            Nothing found with current filter. (Without filter: {{ mainData.search.results.u.length }} Hits)
          </v-alert>
          <div class="cql-line">CQL: {{ mainData.search.results.cql }}</div>
          <!-- <div>query: {{ mainData.search.results.query }}</div> -->
          <!-- <div v-if="mainData.search.results.status">status: {{ mainData.search.results.status }}</div> -->
          <!-- <div>xmlStatus: {{ mainData.search.results.xmlStatus }}</div> -->
          <!-- <div>highlighted tokens: {{ mainData.search.highlights ? mainData.search.highlights.size : 'error' }}</div> -->
          <v-alert v-model="mainData.search.showInfos.utteranceClick" dense outlined type="info" dismissible class="mt-3">
            <div style="font-size: 0.9rem; line-height: 1.1rem;">To view a search result in the corresponding corpus text, click on the utterance ID in the search results.</div>
          </v-alert>
          <div v-if="mainData.search.view.type === 'pos'">
            <v-btn href="https://voice-clariah.acdh.oeaw.ac.at/wp-content/uploads/2021/04/Short-POS-tagset.pdf" target="_blank" class="mr-2 mb-3" small><v-icon class="mr-2" small>mdi-book-open-variant</v-icon> List of POS tag</v-btn>
            <v-btn href="https://voice-clariah.acdh.oeaw.ac.at/wp-content/uploads/2021/04/POS-tagging-and-lemmatization-manual.pdf" target="_blank" class="mr-2 mb-3" small><v-icon class="mr-2" small>mdi-book-open-variant</v-icon> POS tagging and lemmatization</v-btn>
          </div>
          <div v-if="mainData.search.view.type === 'voice'">
            <v-btn href="https://voice-clariah.acdh.oeaw.ac.at/wp-content/uploads/2021/04/VOICE-mark-up-conventions.pdf" target="_blank" class="mr-2 mb-3" small><v-icon class="mr-2" small>mdi-book-open-variant</v-icon> Mark-Up Conventions</v-btn>
            <v-btn href="https://voice-clariah.acdh.oeaw.ac.at/wp-content/uploads/2021/04/VOICE-spelling-conventions.pdf" target="_blank" class="mr-2 mb-3" small><v-icon class="mr-2" small>mdi-book-open-variant</v-icon> Spelling Conventions</v-btn>
          </div>
          <SearchResultsView ref="searchResultsView" @goToUtterance="goToUtterance" :mainData="mainData" :view="mainData.search.view.type" :filteredSearchResults="filteredSearchResults" :scrollerRef="$refs.viewarea" />
        </div>
      </div>
    </div>
    <div class="voice-switches" v-if="mainData.search.searched && mainData.search.results && mainData.search.results.u && mainData.search.view.views && mainData.search.view.views[mainData.search.view.type] && mainData.search.results && mainData.search.results.u && mainData.search.results.u.length > 0">
      <RenderSelect :mainData="mainData" :views="mainData.search.view.views" :type="mainData.search.view.type" class="d-flex flex-wrap" />
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
.cql-line {
  font-size: 0.8rem;
  color: #999;
}
</style>
