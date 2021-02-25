<template>
  <div class="d-flex flex-shrink-1 search-field align-center px-3">
    <v-text-field
      v-model="mainData.search.value"
      @keydown.enter="search(false)"
      @click:clear="search(true)"
      :loading="mainData.search.loading"
      label="Search the VOICE Corpus"
      class="mr-2 mt-0"
      hide-details
      clearable
    />
    <v-btn @click="search(false)" small color="indigo darken-4 white--text" :loading="mainData.search.loading" :disabled="!mainData.search.value || mainData.search.value.length < 2">Search</v-btn>
  </div>
</template>

<script>
export default {
  name: 'SearchField',
  props: {
    'mainData': Object
  },
  data: () => ({
    dev: process.env.NODE_ENV === 'development'
  }),
  mounted () {
  },
  methods: {
    search (clear = false) {
      if (clear) {
        this.mainData.search.value = ''
      }
      this.mainData.options.singleView = 'search'
      if (!this.mainData.search.loading && (this.mainData.search.lastValue !== this.mainData.search.value || this.dev)) {
        this.mainData.search.searched = false
        this.mainData.search.highlights = []
        this.mainData.search.foundXmlId = []
        this.mainData.search.lastValue = this.mainData.search.value
        if (this.mainData.search.value && this.mainData.search.value.length > 0) {
          this.mainData.search.loading = true
          this.$http
            .get(this.mainData.apiUrl + 'search/', { params: { q: this.mainData.search.value } })
            .then((response) => {
              console.log('search', response.data)
              if (response.data && response.data.u) {
                this.mainData.search.results = response.data
                if (this.mainData.search.results && this.mainData.search.results.u) {
                  this.mainData.search.results.u.forEach(aU => {
                    if (aU.highlight) {
                      this.mainData.search.highlights = this.mainData.search.highlights.concat(aU.highlight)
                    }
                    if (this.mainData.search.foundXmlId.indexOf(aU.xmlId) < 0) {
                      this.mainData.search.foundXmlId.push(aU.xmlId)
                    }
                  })
                }
                this.mainData.search.searched = true
              }
              this.mainData.search.scrollPos = 0
              this.mainData.search.loading = false
            })
            .catch((err) => {
              console.log(err)
              this.mainData.search.loading = false
            })
        }
      }
    }
  }
}
</script>

<style scoped>
  .search-field {
    min-width: 310px;
  }
</style>
