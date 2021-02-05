<template>
  <div class="header">
    <h1>Header:</h1>
    <h2 v-if="headerData.title">{{ headerData.title.textContent }}</h2>
    <hr/>
    <h3 v-if="headerData.edition">{{ headerData.edition.textContent }}</h3>
    <div class="notes-stmt" v-if="headerData.notes && headerData.notes.length > 0">
      <h3>Event Description</h3>
      <div class="note ml-2 mb-2"
        v-for="(n, i) in headerData.notes" :key="'n' + i"
      >
        {{ n.textContent }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CorpusElementHeader',
  props: {
    'mainData': Object,
    'element': Object
  },
  data: () => ({
  }),
  mounted () {
    console.log('CorpusElementHeader', this.element, {x: this.headerDom})
  },
  beforeDestroy () {
  },
  computed: {
    headerDom () {
      let parser = new DOMParser()
      let xmlDoc = parser.parseFromString(this.element.header,"text/xml")
      return xmlDoc
    },
    headerData () {
      let hData = {
        title: this.headerDom.querySelector('titleStmt title'),
        edition: this.headerDom.querySelector('edition'),
        notes: this.headerDom.querySelectorAll('notesStmt note')
      }
      return hData
    }
  },
  methods: {
  },
  watch: {
  },
  components: {
  }
}
</script>

<style scoped>
h1 {
  font-size: 1.6rem;
}
h2 {
  font-size: 1.4rem;
  font-style: italic;
}
h3 {
  margin: 0.75rem 0;
}
.header {
  padding: 1rem;
}
</style>
