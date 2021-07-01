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
          Rendering {{ view.toUpperCase() }} style for {{ type.txt }} ...
        </template>
        <v-btn @click="open = false" color="accent" class="w-100 mt-3">Abort</v-btn>
        <div class="mt-3"><b>HCB:</b> Ist noch nicht fertig!</div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'SearchResultsDownload',
  props: {
    'mainData': Object,
    'type': Object,
    'filteredSearchResults': Array,
    'searchResultsView': Object,
    'view': String
  },
  data: () => ({
    status: 0,
    open: true
  }),
  mounted () {
    console.log('SearchResultsDownload', this.mainData, this.searchResultsView)
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
      }
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
