<template>
  <div class="header">
    <v-alert dense outlined type="info">Text headers currently correspond to VOICE 2.0. Updates will be made for the official release of VOICE 3.0.</v-alert>
    <h1>Header: {{ mainData.corpus.selectedElement }}</h1>
    <div v-if="element && element.headerObj">
      <h2 v-if="element.headerObj.data.title">{{ element.headerObj.data.title.charAt(0).toUpperCase() + element.headerObj.data.title.slice(1) }}</h2>
      <hr/>
      <h3 v-if="element.headerObj.data.edition">{{ element.headerObj.data.edition }}</h3>
      <div class="recording" v-if="element.headerObj.data.recordingDuration || element.headerObj.data.recordingInfos">
        <h3>Recording</h3>
        <table class="rec-entries ml-2">
          <tbody>
            <tr v-if="element.headerObj.data.recordingDuration">
              <th>Duration:</th>
              <td>{{ element.headerObj.data.recordingDuration[1] + ':' + element.headerObj.data.recordingDuration[2] + ':' + element.headerObj.data.recordingDuration[3] }}</td>
            </tr>
            <template v-for="(re, i) in element.headerObj.data.recordingInfos">
              <tr :key="'re' + i" v-if="i === 'date'">
                <th>Date:</th>
                <td>{{ re }}</td>
              </tr>
              <tr :key="'re' + i" v-else-if="i === 'equipment'">
                <th>Equipment:</th>
                <td>{{ re }}</td>
              </tr>
              <tr :key="'re' + i" v-else-if="i === 'resps'">
                <th>{{ re[0] === 'recording' ? 'Recorded by' : (re[0]) ? re[0] : '?' }}:</th>
                <td>{{ re[1].join(', ') }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <div class="text-class" v-if="element.headerObj.data.textClass && element.headerObj.data.textClass.length > 0">
        <h3>Text Classification</h3>
        <table class="cat-refs ml-2">
          <tbody>
            <tr v-for="(tc, i) in element.headerObj.data.textClass" :key="'tc' + i">
              <th>{{ tc.h }}:</th>
              <td>{{ tc.d }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="setting-desc" v-if="Object.keys(element.headerObj.data.settingDesc).length > 0">
        <h3>Setting</h3>
        <table class="setting-descs ml-2">
          <tbody>
            <tr v-if="element.headerObj.data.settingDesc.countryCode">
              <th>Country-Code:</th>
              <td>{{ element.headerObj.data.settingDesc.countryCode }}</td>
            </tr>
            <tr v-if="element.headerObj.data.settingDesc.city">
              <th>City:</th>
              <td>{{ element.headerObj.data.settingDesc.city }}</td>
            </tr>
            <tr v-if="element.headerObj.data.settingDesc.locale">
              <th>Locale:</th>
              <td>{{ element.headerObj.data.settingDesc.locale }}</td>
            </tr>
            <tr v-if="element.headerObj.data.settingDesc.activity">
              <th>Activity:</th>
              <td>{{ element.headerObj.data.settingDesc.activity }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="partic-desc" v-if="element.headerObj.data.particDesc">
        <h3>Speaker Information</h3>
        <table class="list-person ml-2">
          <tbody>
            <template v-if="element.headerObj.data.particDesc.personGrp.length > 0">
              <tr class="person" v-for="(pg, i) in element.headerObj.data.particDesc.personGrp" :key="'pdpg' + i">
                <th colspan="2">{{ pg.h }}</th>
                <td colspan="4">{{ pg.d }}</td>
              </tr>
            </template>
            <template v-if="element.headerObj.data.particDesc.personIdentified.length > 0">
              <tr><th colspan="6">Identified</th></tr>
              <tr><th>ID</th><th>Sex</th><th>Age</th><th>L1</th><th>Role</th><th>Occupation</th></tr>
              <tr v-for="(pi, i) in element.headerObj.data.particDesc.personIdentified" :key="'pdpi' + i">
                <th>{{ pi.id }}</th>
                <td>{{ pi.sex }}</td>
                <td>{{ pi.age }}</td>
                <td>{{ pi.l1 }}</td>
                <td>{{ pi.role }}</td>
                <td>{{ pi.occupation }}</td>
              </tr>
            </template>
            <template v-if="element.headerObj.data.particDesc.personNotIdentified.length > 0">
              <tr><th colspan="6">Speakers Not Identified</th></tr>
              <tr><th colspan="6">{{ element.headerObj.data.particDesc.personNotIdentified.join(', ') }}</th></tr>
            </template>
            <template v-if="element.headerObj.data.particDesc.relationGrp && element.headerObj.data.particDesc.relationGrp.length > 0">
              <tr class="person" v-for="(rg, i) in element.headerObj.data.particDesc.relationGrp" :key="'pdrg' + i">
                <th colspan="2">{{ rg.h }}</th>
                <td colspan="4">{{ rg.d }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <div class="revision-desc" v-if="element.headerObj.data.revisionDesc">
        <h3>Creation History</h3>
        <table class="changes ml-2">
          <tbody>
            <tr v-for="(rd, i) in element.headerObj.data.revisionDesc" :key="'rd' + i">
              <th>{{ rd.txt }}:</th>
              <td>{{ rd.who }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="notes-stmt" v-if="element.headerObj.data.notes.length > 0">
        <h3>Event Description</h3>
        <div class="note ml-2 mb-2"
          v-for="(n, i) in element.headerObj.data.notes" :key="'n' + i"
        >
          {{ n }}
        </div>
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
  font-size: 1.35rem;
  font-style: italic;
}
h3 {
  margin: 0.75rem 0;
}
.header {
  padding: 1rem;
}
.rec-entries th, .cat-refs th, .setting-descs th, .changes th, .list-person th {
  padding-right: 1rem;
  text-align: left;
}
.list-person td {
  padding-right: 1rem;
  min-width: 4.5rem;
}
</style>
