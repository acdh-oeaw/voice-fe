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
            <div v-for="(uObj, uIdx) in mainData.search.results.u" :key="uIdx">
              xmlId: {{ uObj.xmlId }}, uId: {{ uObj.uId }}<br>
              xml: {{ uObj.xml.length.toLocaleString() }} Byte<br>
              highlight: {{ uObj.highlight }}<br>
              <hr>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchResults',
  props: {
    'mainData': Object
  },
  data: () => ({
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
