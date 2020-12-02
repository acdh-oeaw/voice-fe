<template>
  <div class="d-flex flex-shrink-1 search-field align-center px-3">
    <v-text-field v-model="mainData.search.value" @keydown.enter="search" label="Search the VOICE Corpus" hide-details class="mr-2 mt-0"></v-text-field>
    <v-btn @click="search" small color="indigo darken-4 white--text">Search</v-btn>
  </div>
</template>

<script>
export default {
  name: 'SearchField',
  props: {
    'mainData': Object
  },
  data: () => ({
  }),
  mounted () {
  },
  methods: {
    search () {
      if (!this.mainData.search.loading) {
        this.mainData.options.singleView = 'search'
        this.mainData.search.loading = true
        this.mainData.search.searched = false
        this.$http
          .get(this.mainData.apiUrl + 'search/', { params: { q: this.mainData.search.value } })
          .then((response) => {
            console.log('search', response.data)
            if (response.data && response.data.u) {
              this.mainData.search.searched = true
              this.mainData.search.results = response.data
            }
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
</script>

<style scoped>
  .search-field {
    min-width: 310px;
  }
</style>
