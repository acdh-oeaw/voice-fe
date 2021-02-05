<template>
  <div class="header">
    {{ headerData }}
    <div class="notes-stmt" v-if="headerData.notes.length > 0">
      <h3 class="my-3">Event Description</h3>
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
    console.log('CorpusElementHeader', this.element)
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
        notes: []
      }
      let ns = this.headerDom.getElementsByTagName('notesStmt')
      for(let i = 0; i < ns.length; i++) {
        let n = ns[i].getElementsByTagName('note')
        for(let i2 = 0; i2 < n.length; i2++) {
          hData.notes.push(n[i2])
        }
      }
      console.log(hData)
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
.header {
  padding: 1rem;
}
</style>
