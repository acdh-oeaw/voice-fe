<template>
  <div class="header">
    <h1>Header:</h1>
    <h2 v-if="headerData.title">{{ headerData.title.textContent }}</h2>
    <hr/>
    <h3 v-if="headerData.edition">{{ headerData.edition.textContent }}</h3>
    <div class="recording" v-if="headerData.recording.dom && headerData.recording.dom.length > 0">
      <h3>Recording</h3>
      <table class="rec-entries">
        <tbody>
          <tr v-if="headerData.recording.duration">
            <th>Duration:</th>
            <td>{{ headerData.recording.duration[1] + ':' + headerData.recording.duration[2] + ':' + headerData.recording.duration[3] }}</td>
          </tr>
          <template v-for="(re, i) in headerData.recording.dom">
            <tr :key="'re' + i" v-if="re.tagName === 'date'">
              <th>Date:</th>
              <td>{{ re.textContent }}</td>
            </tr>
            <tr :key="'re' + i" v-else-if="re.tagName === 'equipment'">
              <th>Equipment:</th>
              <td>{{ re.textContent }}</td>
            </tr>
            <tr :key="'re' + i" v-else-if="re.tagName === 'respStmt' && re.querySelector('resp') && re.querySelector('resp').textContent === 'recording'">
              <th>Recorded by:</th>
              <td>{{ respStmtList(re) }}</td>
            </tr>
            <tr :key="'re' + i" v-else-if="re.tagName === 'respStmt'">
              <th>{{ re.querySelector('resp') ? re.querySelector('resp').textContent : 'Responsibility' }}:</th>
              <td>{{ respStmtList(re) }}</td>
            </tr>
            <tr :key="'re' + i" v-else>
              <th>?:</th>
              <td>{{ re.textContent }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
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
    // console.log('CorpusElementHeader', this.element, {x: this.headerDom})
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
      let recTmp = this.headerDom.querySelector('recordingStmt recording')
      let hData = {
        title: this.headerDom.querySelector('titleStmt title'),
        edition: this.headerDom.querySelector('edition'),
        recording: {
          dom: this.headerDom.querySelectorAll('recordingStmt recording > *'),
          duration: recTmp && recTmp.attributes && recTmp.attributes.dur ? [...recTmp.attributes.dur.value.matchAll(/T(.+)H(.+)M(.+)S/gm)][0] : null
        },
        notes: this.headerDom.querySelectorAll('notesStmt note')
      }
      console.log(hData)
      return hData
    }
  },
  methods: {
    respStmtList (d) {
      let al = []
      ;[].slice.call(d.children).forEach(c => {
        if (c.tagName !== 'resp') {
          al.push(c.textContent)
        }
      })
      return al.join(', ')
    }
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
  font-size: 1.35rem;
  font-style: italic;
}
h3 {
  margin: 0.75rem 0;
}
.header {
  padding: 1rem;
}
.rec-entries th {
  padding-right: 1rem;
  text-align: left;
}
</style>
