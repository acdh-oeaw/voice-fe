<template>
  <v-dialog v-model="open" persistent width="300">
    <v-card color="primary" dark>
      <v-card-text class="py-3">
        <template v-if="status === 0">
          Loading files for {{ type.txt }} ...
          <v-progress-linear
            v-model="lProgress.loaded"
            :buffer-value="lProgress.loaded + lProgress.loading"
            color="white"
            style="background-color: #005eb6 !important;"
            class="mt-3"
          ></v-progress-linear>
        </template>
        <template v-else-if="status === 1">
          Rendering {{ view.type.toUpperCase() }} style for {{ type.txt }} ...
          <v-progress-linear
            v-model="rProgress"
            color="white"
            style="background-color: #005eb6 !important;"
            class="mt-3"
          ></v-progress-linear>
        </template>
        <v-btn @click="open = false" color="accent" class="w-100 mt-3">Abort</v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import exporter from '../functions/Exporter'
import htmlCss from '!!raw-loader!../assets/css/RenderLine.css'
import htmlTemplate from '!!raw-loader!../assets/html/HtmlTemplate.html'

export default {
  name: 'SearchResultsDownload',
  props: {
    'mainData': Object,
    'type': Object,
    'filteredSearchResults': Array,
    'searchResultsView': Object,
    'view': Object
  },
  data: () => ({
    status: 0,
    open: true,
    rProgress: 0
  }),
  mounted () {
    console.log('SearchResultsDownload', this.mainData, this.searchResultsView, this.view)
    this.$nextTick(() => {
      this.loadNext()
    })
  },
  computed: {
    lProgress () {
      let max = this.searchResultsView.xmlObjLines.length
      let loaded = (this.searchResultsView.xmlObjLines.filter(u => u.xml)).length
      return {
        loaded: 100 / max * loaded,
        loading: this.searchResultsView.loadingNext ? 100 / max * this.searchResultsView.loadList.length : 0,
        inProgress: this.searchResultsView.loadingNext
      }
    }
  },
  methods: {
    loadNext () {
      if (this.mainData.search.errors.length > 0) {
        alert('Error while downloading ...')
        this.open = false
      } else if (this.status === 0 && !this.searchResultsView.loadingNext && this.searchResultsView.loadList.length > 0) {
        this.searchResultsView.loadNext()
      }
      if (this.status === 0 && !this.searchResultsView.loadingNext && this.searchResultsView.loadList.length === 0) {
        this.status = 1
        this.$nextTick(() => {
          exporter.saveSearchResult(
            this.searchResultsView.xmlObjLines,
            this.filteredSearchResults,
            this.view,
            this.type,
            {
              version: 'Versions: FE ' + this.mainData.version + ' - API: ' + this.mainData.apiVersion,
              addText: 'search: ' + this.mainData.search.results.query.q + '\n' +
                       'cql: ' + this.mainData.search.results.cql + '\n' +
                       this.filteredSearchResults.reduce((a, c) => a + (c.hits.length || 0), 0) + ' hits in ' + this.filteredSearchResults.length + ' utterances' +
                       (this.mainData.app.filterActive ? '\nfilter active!' : ''),
              fileFx: 'search'
            },
            this.mainData.search.highlights,
            (p) => { this.rProgress = p },
            this.saveFile,
            htmlCss,
            htmlTemplate,
            document
          )
        })
      }
    },
    saveFile (data, mimeType, fileExtension, filename) {
      if (data) {
        let blob = new Blob([data], {type: mimeType})
        const a = document.createElement('a')
        a.href= URL.createObjectURL(blob)
        a.download = filename + '.' + fileExtension
        a.click()
      }
      this.open = false
    }
  },
  watch: {
    'searchResultsView.loadingNext' () {
      this.loadNext()
    },
    open () {
      if (!this.open) {
        setTimeout(() => { this.$emit('close') }, 200)
      }
    }
  },
  components: {
  }
}
</script>

<style scoped>
</style>
