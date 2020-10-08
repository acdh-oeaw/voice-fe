<template>
  <div class="flex-grow-1 px-3 py-2">
    Search Results - "{{ mainData.search.value }}"<br>
    {{ mainData.search.searched ? '...' : 'Noch keine Suche durchgeführt ...'}}
  </div>
</template>

<script>
export default {
  name: 'SearchResults',
  props: {
    'mainData': Object
  },
  data: () => ({
    publicPath: process.env.BASE_URL
  }),
  mounted () {
    console.log('SearchResults', this.mainData)
  },
  methods: {
  }
}
</script>

<style scoped>
</style>
