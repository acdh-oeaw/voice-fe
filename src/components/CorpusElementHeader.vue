<template>
  <div class="header">
    <h1>Header:</h1>
    <h2 v-if="headerData.title">{{ headerData.title.textContent }}</h2>
    <hr/>
    <h3 v-if="headerData.edition">{{ headerData.edition.textContent }}</h3>
    <div class="recording" v-if="headerData.recording.dom && headerData.recording.dom.length > 0">
      <h3>Recording</h3>
      <table class="rec-entries ml-2">
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
    <div class="text-class" v-if="headerData.textClass && headerData.textClass.length > 0">
      <h3>Text Classification</h3>
      <table class="cat-refs ml-2">
        <tbody>
          <tr v-for="(tc, i) in headerData.textClass" :key="'tc' + i">
            <th>{{ tc.h }}:</th>
            <td>{{ tc.d }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="setting-desc" v-if="headerData.settingDesc">
      <h3>Setting</h3>
      <table class="setting-descs ml-2">
        <tbody>
          <tr v-if="headerData.settingDesc.countryCode">
            <th>Country-Code:</th>
            <td>{{ headerData.settingDesc.countryCode.textContent }}</td>
          </tr>
          <tr v-if="headerData.settingDesc.city">
            <th>City:</th>
            <td>{{ headerData.settingDesc.city.textContent }}</td>
          </tr>
          <tr v-if="headerData.settingDesc.locale">
            <th>Locale:</th>
            <td>{{ headerData.settingDesc.locale.textContent }}</td>
          </tr>
          <tr v-if="headerData.settingDesc.activity">
            <th>Activity:</th>
            <td>{{ headerData.settingDesc.activity.textContent }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="partic-desc" v-if="headerData.particDesc">
      <h3>Speaker Information</h3>
      <table class="list-person ml-2">
        <tbody>
          <template v-if="headerData.particDesc.personGrp && headerData.particDesc.personGrp.length > 0">
            <tr class="person" v-for="(pg, i) in headerData.particDesc.personGrp" :key="'pdpg' + i">
              <th colspan="2">{{ pg.h }}</th>
              <td colspan="4">{{ pg.d }}</td>
            </tr>
          </template>
          <template v-if="headerData.particDesc.personIdentified && headerData.particDesc.personIdentified.length > 0">
            <tr><th colspan="6">Identified</th></tr>
            <tr><th>ID</th><th>Sex</th><th>Age</th><th>L1</th><th>Role</th><th>Occupation</th></tr>
            <tr v-for="(pi, i) in headerData.particDesc.personIdentified" :key="'pdpi' + i">
              <th>{{ pi.id }}</th>
              <td>{{ pi.sex }}</td>
              <td>{{ pi.age }}</td>
              <td>{{ pi.l1 }}</td>
              <td>{{ pi.role }}</td>
              <td>{{ pi.occupation }}</td>
            </tr>
          </template>
          <template v-if="headerData.particDesc.personNotIdentified && headerData.particDesc.personNotIdentified.length > 0">
            <tr><th colspan="6">Speakers Not Identified</th></tr>
            <tr><th colspan="6">{{ headerData.particDesc.personNotIdentified.join(', ') }}</th></tr>
          </template>
          <template v-if="headerData.particDesc.relationGrp && headerData.particDesc.relationGrp.length > 0">
            <tr class="person" v-for="(rg, i) in headerData.particDesc.relationGrp" :key="'pdrg' + i">
              <th colspan="2">{{ rg.h }}</th>
              <td colspan="4">{{ rg.d }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div class="revision-desc" v-if="headerData.revisionDesc">
      <h3>Creation History</h3>
      <table class="changes ml-2">
        <tbody>
          <tr v-for="(rd, i) in headerData.revisionDesc" :key="'rd' + i">
            <th>{{ rd.txt }}:</th>
            <td>{{ rd.who }}</td>
          </tr>
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
      let xmlDoc = parser.parseFromString(this.element.header,"application/xml")
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
        textClass: (() => {
          let textClass = []
          let catRef = this.headerDom.querySelectorAll('textClass > catRef')
          if (catRef && catRef[0] && catRef[0].attributes && catRef[0].attributes.target && catRef[0].attributes.target.value) {
            let catRefs = catRef[0].attributes.target.value.split(' ').map(v => v.substring(1))
            this.headerDom.querySelectorAll('taxonomy category').forEach(cat => {
              if (cat.attributes && cat.attributes['xml:id'] && cat.attributes['xml:id'].value && catRefs.indexOf(cat.attributes['xml:id'].value) > -1) {
                textClass.push({h: cat.parentElement.querySelector('catDesc').textContent, d: cat.querySelector('catDesc').textContent })
              }
            })
          }
          return textClass
        }) (),
        settingDesc: {
          countryCode: this.headerDom.querySelector('name[type="country"]'),
          city: this.headerDom.querySelector('name[type="city"]'),
          locale: this.headerDom.querySelector('locale'),
          activity: this.headerDom.querySelector('activity')
        },
        particDesc: {
          personGrp: (() => {
            let pGrp = []
            this.headerDom.querySelectorAll('particDesc personGrp').forEach(pg => {
              pGrp.push({
                h: pg.attributes.role ? {speakers: 'Speakers', audience: 'Audience', interactants: 'Interactants'}[pg.attributes.role.value] || pg.attributes.role.value  : '?',
                d: pg.attributes.size && pg.attributes.size.value ? pg.attributes.size.value : 'unknown'
              })
            })
            return pGrp
          }) (),
          personIdentified: (() => {
            let pIdent = []
            this.headerDom.querySelectorAll('particDesc listPerson[type="identified"] > person').forEach(p => {
              pIdent.push({
                id: p.attributes['xml:id'].value.split('_')[1],
                sex: ['male', 'female'][p.querySelector('sex').attributes.value.value - 1] || 'unknown',
                age: ['unknown', '17-24', '25-34', '35-49', '50+'][p.querySelector('age').attributes.value.value] || 'N/A',
                l1: p.querySelector('langKnown[level="L1"]').attributes.tag.value,
                role: p.attributes['role'].value,
                occupation: p.querySelector('occupation') && p.querySelector('occupation').textContent ? p.querySelector('occupation').textContent : ' '
              })
            })
            pIdent.sort((a, b) => {
              if ( a.id < b.id ){ return -1 }
              if ( a.id > b.id ){ return 1 }
              return 0
            })
            return pIdent
          }) (),
          personNotIdentified: (() => {
            let pNotIdent = []
            this.headerDom.querySelectorAll('particDesc listPerson[type="not_identified"] > person').forEach(p => {
              pNotIdent.push(p.attributes['xml:id'].value.split('_')[1])
            })
            return pNotIdent.sort()
          }) (),
          relationGrp: (() => {
            let rGrp = []
            this.headerDom.querySelectorAll('relationGrp relation').forEach(r => {
              rGrp.push({
                h: r.attributes.type ? {acquaintedness: 'Acquaintedness', power: 'Power relations'}[r.attributes.type.value] || r.attributes.type.value : '?',
                d: r.attributes.name.value.split('_').join(' ')
              })
            })
            return rGrp.sort()
          }) ()

        },
        revisionDesc: (() => {
          let rDescs = []
          this.headerDom.querySelectorAll('revisionDesc change').forEach(c => {
            rDescs.push({
              when: c.attributes.when.value,
              who: c.attributes.who.value,
              txt: c.textContent
            })
          })
          rDescs.sort((a, b) => {
            if ( a.when > b.when ){ return -1 }
            if ( a.when < b.when ){ return 1 }
            if ( a.who < b.who ){ return -1 }
            if ( a.who > b.who ){ return 1 }
            return 0
          })
          return rDescs
        }) (),
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
.rec-entries th, .cat-refs th, .setting-descs th, .changes th, .list-person th {
  padding-right: 1rem;
  text-align: left;
}
.list-person td {
  padding-right: 1rem;
  min-width: 4.5rem;
}
</style>
