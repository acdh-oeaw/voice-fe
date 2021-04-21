<template>
  <v-app>
    <v-container class="home-width" v-if="currentRouteName === 'home'">
      <img :src="publicPath + 'images/vc-logo-0-676.png'" class="img-fluid w-100 mt-7" />
    </v-container>
    <v-container :class="{'max-width': !mainData.options.fullWidth, 'd-flex': true, 'pb-0': true}" :fluid="!mainData.wideScreen" v-else>
      <router-link to="/"><img :src="publicPath + 'images/vc-logo-0-300-beta.png'" class="img-fluid logo-small mt-1" /></router-link>
      <div class="px-4">
        <v-alert dense outlined type="info">
          <div><b>You are currently using VOICE 3.0 Online BETA</b> (temporary pre-release, version end of April 2021).</div>
          <div style="font-size: 0.8rem; line-height: 1rem;">
            Search results may not be fully consistent yet as small features of the interface may still be adapted.<br>
            Please let us have your feedback and/or report any Bugs in our online survey. <i>Thanks for beta-testing!</i>
          </div>
        </v-alert>
      </div>
      <v-spacer />
      <div class="d-flex align-end">
        <v-btn @click="clearRenderCache" v-if="dev" x-small class="mr-3 d-none d-md-flex">Clear Render Cache</v-btn>
        <v-select dense hide-details class="d-none d-md-flex"
          label="API"
          :items="['https://voice-node.acdh-dev.oeaw.ac.at/', 'http://127.0.0.1:3000/']"
          v-model="mainData.apiUrl"
          v-if="dev"
        ></v-select>
        <v-btn @click="mainData.options.dualView = !mainData.options.dualView" icon small v-if="dualViewPossible">
          <v-icon>{{ mainData.options.dualView ? 'mdi-arrow-collapse-horizontal' : 'mdi-arrow-split-vertical' }}</v-icon>
        </v-btn>
        <v-btn @click="mainData.options.fullWidth = !mainData.options.fullWidth" icon small v-if="mainData.wideScreen">
          <v-icon>{{ mainData.options.fullWidth ? 'mdi-unfold-less-vertical' : 'mdi-unfold-more-vertical' }}</v-icon>
        </v-btn>
      </div>
    </v-container>
    <v-main>
      <router-view :main-data="mainData" />
    </v-main>
    <v-overlay :value="loading">
      <v-progress-circular
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
    <v-dialog v-model="showSpeakerDialog" width="500">
      <v-card>
        <v-card-title>Speaker Information</v-card-title>
        <v-card-text v-if="showSpeaker">
          <div v-if="showSpeaker.txt">
            {{ showSpeaker.txt }}
          </div>
          <table>
            <tr v-if="showSpeaker.age"><td><b>Age:</b></td><td> {{ showSpeaker.age }}</td></tr>
            <tr v-if="showSpeaker.sex"><td><b>Sex:</b></td><td> {{ showSpeaker.sex }}</td></tr>
            <tr v-if="showSpeaker['L1'] && showSpeaker['L1'].length > 0"><td><b>L1:</b></td><td> {{ showSpeaker['L1'].join(', ') }}</td></tr>
            <tr v-if="showSpeaker.id"><td><b>ID:</b></td><td> {{ showSpeaker.id }}</td></tr>
            <tr v-if="showSpeaker.occupation"><td><b>Occupation:</b></td><td> {{ showSpeaker.occupation }}</td></tr>
          </table>
          <table v-if="showSpeaker.refs" class="mt-3">
            <tr class="text-left"><th>Text</th><th>Role</th><th>Tag</th></tr>
            <tr v-for="k in Object.keys(showSpeaker.refs).sort((a, b) => { return a === mainData.showSpeaker.id ? -1 : b === mainData.showSpeaker.id ? 1 : 0 })" :key="k">
              <td :class="'pr-3' + (k === mainData.showSpeaker.id ? ' bold' : '')">{{ k }}:</td>
              <td class="pr-3">{{ showSpeaker.refs[k].role }}</td>
              <td>{{ showSpeaker.refs[k].tag }}</td>
            </tr>
          </table>
          <div class="pt-3" v-if="dev">
            {{ showSpeaker }}
          </div>
        </v-card-text>
        <v-card-text v-else-if="mainData.showSpeaker">
          {{ mainData.showSpeaker }}
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" text @click="showSpeakerDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-footer color="white" class="py-0 footer">
      <v-container class="py-0 px-2 text-right">
        <div class="d-flex justify-space-between">
          <div>
            <v-chip class="mx-1 mb-1" label link small href="/dependency-license-report.html" target="_blank">Version: {{ version }}</v-chip>
            <v-chip class="mx-1 mb-1" label small>API: {{ apiVersion }}</v-chip>
          </div>
          <div>
            <v-chip class="mx-1 mb-1" label link small v-on:click="revokeCookieAndTrackingConsent" v-if="userOptedTracking" data-testid="revokeTracking">Stop tracking me</v-chip>
            <v-chip class="mx-1 mb-1" label link small color="primary" href="https://www.oeaw.ac.at/en/oeaw/data-protection" data-testid="privacyPolicy" target="_blank">Privacy Policy</v-chip>
            <v-chip class="mx-1 mb-1" label link small color="primary" href="/imprint.html" data-testid="siteNotice">Site Notice</v-chip>
          </div>
        </div>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script>
import mainDataFunc from './functions/MainData'

export default {
  name: 'App',
  data: () => ({
    loading: false,
    publicPath: process.env.BASE_URL,
    dev: process.env.NODE_ENV === 'development',
    version: process.env.VUE_APP_VERSION,
    apiVersion: '?',
    branch: process.env.VUE_APP_BRANCH,
    mainData: mainDataFunc.initMainData(),
    userOptedTracking: true,
    showSpeakerDialog: false
  }),
  mounted () {
    this.resized()
    this.loadCorpus()
    window.addEventListener('resize', this.resized)
    this.mainData.app = this
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.resized)
  },
  timers: {
     checkMatomo: { time: 400, autostart: true, repeat: true }
  },
  methods: {
    resized () {
      this.mainData.wideScreen = window.innerWidth >= 1264
    },
    loadCorpus () {
      this.loading = true
      this.$http
        .get(this.mainData.apiUrl)
        .then((response) => {
          this.apiVersion = response.bodyText
        })
        .catch((err) => {
          console.log(err)
        })
      this.$http
        .get('/corpustree.json')
        .then((response) => {
          // console.log(response)
          let getCorpusObjs = (cList, aObj) => {
            cList.forEach(el => {
              if (el.speechEvents) {
                el.id = el.label
                el.title = (this.mainData.infos.domainInfos[el.label] && this.mainData.infos.domainInfos[el.label].title),
                el.children = el.speechEvents
                delete el.speechEvents
                getCorpusObjs(el.children, aObj)
              } else {
                ['speakersBucket', 'interactantsBucket'].forEach(p => {
                  if (typeof el[p] !== 'undefined') {
                    let aStr = el[p].toString()
                    let aFrom = el[p]
                    let aTo = el[p]
                    if (typeof el[p] === 'string') {
                      if (aFrom.indexOf('–') > -1) {
                        let aVals = aFrom.split('–')
                        aFrom = parseInt(aVals[0])
                        aTo = parseInt(aVals[1])
                      } else if (aFrom.indexOf('and more') > -1) {
                        aFrom = parseInt(aFrom)
                        aTo = Infinity
                      } else {
                        aFrom = parseInt(aFrom)
                        aTo = parseInt(aTo)
                      }
                    }
                    el[p] = { str: aStr, from: aFrom, to: aTo}
                  }
                })
                this.$set(el, 'open', false)
                this.$set(el, 'scrollPos', {
                  voice: 0,
                  plain: 0,
                  pos: 0,
                  xml: 0
                })
                this.$set(el, 'lineHeight', {
                  voice: [],
                  plain: [],
                  pos: []
                })
                this.$set(el, 'header', '')
                this.$set(el, 'headerLoading', false)
                this.$set(el, 'headerLoaded', false)
                this.$set(el, 'xml', '')
                this.$set(el, 'xmlLoading', false)
                this.$set(el, 'xmlLoaded',  false)
                this.$set(aObj, el.id, el)
              }
            })
            return aObj
          }
          let getSpetList = (cList) => {
            let aList = []
            cList.forEach(el => {
              if (el.children) {
                aList.push({
                  id: el.id,
                  label: el.label,
                  title: el.title,
                  children: getSpetList(el.children)
                })
              } else {
                let aSpet = aList.filter(e => e.sId === el.spet)
                if (aSpet.length > 0) {
                  aSpet[0].children.push(el)
                } else {
                  aList.push({
                    id: el.domain + '-' + el.spet,
                    sId: el.spet,
                    label: (this.mainData.infos.spetInfos[el.spet] && this.mainData.infos.spetInfos[el.spet].label) || el.spet,
                    title: (this.mainData.infos.spetInfos[el.spet] && this.mainData.infos.spetInfos[el.spet].title),
                    children: [el]
                  })
                }
              }
            })
            return aList
          }
          let aObj = {}
          this.$set(this.mainData.corpus, 'list', response.data.domains)
          this.$set(this.mainData.corpus, 'baseJSON', response.data)
          this.$set(this.mainData.corpus, 'obj', getCorpusObjs(this.mainData.corpus.list, aObj))
          this.$set(this.mainData.corpus, 'listSpet', getSpetList(this.mainData.corpus.list))
          Object.keys(response.data.speakers).forEach((sn) => {
            let aSpeaker = response.data.speakers[sn]
            this.$set(aSpeaker, 'id', sn)
            Object.keys(aSpeaker.refs).forEach((rc) => {
              let aRef = aSpeaker.refs[rc]
              if (this.mainData.corpus.obj[rc]) {
                if (this.mainData.filter.manualSelection.indexOf(this.mainData.corpus.obj[rc].id) < 0) {
                  this.mainData.filter.manualSelection.push(this.mainData.corpus.obj[rc].id)
                }
                if (!this.mainData.corpus.obj[rc].speakers) {
                  this.$set(this.mainData.corpus.obj[rc], 'speakers', {})
                }
                this.$set(this.mainData.corpus.obj[rc].speakers, aRef.tag, aSpeaker)
              }
            })
          })
          console.log('mainData', this.mainData)
          this.loading = false
        })
        .catch((err) => {
          console.log(err)
          this.loading = false
        })
      this.$http
        .get('/corpustext.html')
        .then((response) => {
          if (response && response.body) {
            this.mainData.corpus.text = response.body
          }
        })
        .catch((err) => {
          console.log(err)
          this.loading = false
        })
    },
    revokeCookieAndTrackingConsent () {
      this.$matomo && this.$matomo.forgetConsentGiven() && this.$matomo.orgetCookieConsentGiven() && this.$matomo.optUserOut()
    },
    checkMatomo() {
      if (this.$matomo) {
        this.userOptedTracking = this.$matomo && !this.$matomo.isUserOptedOut()
      }
    },
    clearRenderCache () {
      let views = ['voice', 'plain', 'pos', 'xml-view']
      this.mainData.corpus.elements.forEach(e => {
        if (e && e.bodyObj && e.bodyObj.data) {
          e.bodyObj.data.u.list.forEach(u => {
            views.forEach(v => {
              if (u[v]) {
                u[v] = ''
              }
            })
          })
        }
      })
    }
  },
  computed: {
    showSpeaker () {
      // console.log(this.mainData.showSpeaker && this.mainData.showSpeaker.id && this.mainData.showSpeaker.speaker && this.mainData.corpus.obj[this.mainData.showSpeaker.id], this.mainData)
      let s = this.mainData.showSpeaker && this.mainData.showSpeaker.id && this.mainData.showSpeaker.speaker && this.mainData.corpus.obj[this.mainData.showSpeaker.id] && this.mainData.corpus.obj[this.mainData.showSpeaker.id].speakers && this.mainData.corpus.obj[this.mainData.showSpeaker.id].speakers[this.mainData.showSpeaker.speaker]
      let fx = {
        'SX': { txt: 'Unidentified speaker', sex: 'unknown' },
        'SX-f': { txt: 'Unidentified female speaker', sex: 'female' },
        'SX-m': { txt: 'Unidentified female speaker', sex: 'male' },
        'SS': { txt: 'Unidentified group of speakers' },
      }
      if (s && Object.keys(fx).indexOf(s.id) > -1) {
        s = JSON.parse(JSON.stringify(s))
        s.sex = fx[s.id].sex || s.sex
        s.txt = fx[s.id].txt || s.txt
        s.refs = null
      }
      return s
    },
    filterActive () {
      let f = this.mainData.filter
      return f.active && (f.domain || f.spet || f.manualSelect || f.interactants || f.speakers || f.acquaintedness || f.powerRelations || f.durationOfSpeechEvent || f.words || f.onlyWithAudio) ? true : false
    },
    filteredSeIds () {
      return this.filterActive ? this.mainData.filter.filterSpeechEventsFunc.getFilteredIds(this.mainData.corpus, this.mainData.filter) : null
    },
    currentRouteName() {
        return this.$route.name;
    },
    dualViewPossible () {
      return this.mainData.wideScreen && this.mainData.options.fullWidth
    }
  },
  watch: {
    'mainData.showSpeaker' (nVal) {
      if (nVal) {
        this.showSpeakerDialog = true
      }
    }
  }
}
</script>

<style>
  .footer {
    font-size: 0.9rem;
    margin-top: -5px;
  }
  .img-fluid {
    max-width: 100%;
    height: auto;
  }
  .bold {
    font-weight: bold;
  }
  .w-100 {
    width: 100%;
  }
  .logo-small {
    width: 200px;
  }
  .fx-bt {
    border-top: 1px solid #ddd;
  }
  .fx-bb {
    border-bottom: 1px solid #ddd;
  }
  .fx-bl {
    border-left: 1px solid #ddd;
  }
  .fx-br {
    border-right: 1px solid #ddd;
  }
  .underline {
    text-decoration: underline;
  }
  .v-main {
    position: relative;
    min-height: 500px;
  }
  .v-main > .v-main__wrap {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: auto;
  }
  .scroll-content {
    position: relative;
    height: 100%;
    width: 100%;
  }
  .linescroll, .scroll-content > div {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: auto;
  }
  .flex-break {
    flex-basis: 100%;
    height: 0;
  }
  .fx-icon-red {
    background: #b00!important;
  }
  .cur-help {
    cursor: help;
  }
  .v-tooltip__content code {
      background-color: rgba(0, 0, 0, 0.3)!important;
  }
  @media (min-width: 1264px) {
    .container {
      max-width: 1785px!important;
    }
    .container.max-width {
      max-width: 1185px!important;
    }
  }
  @media (min-width: 960px) {
    .home-width {
      max-width: 700px!important;
    }
  }
</style>
