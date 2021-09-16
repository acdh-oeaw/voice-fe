<template>
  <v-app>
    <v-container class="home-width" v-if="currentRouteName === 'home'">
      <img :src="publicPath + 'images/vc-logo-1-676.png'" class="img-fluid w-100 mt-15 mb-3" />
    </v-container>
    <v-container :class="{'max-width': !mainData.options.fullWidth, 'd-flex': true, 'pb-0': true}" :fluid="!mainData.wideScreen" v-else>
      <router-link to="/"><img :src="publicPath + 'images/vc-logo-1-250.png'" class="img-fluid logo-small mt-1" /></router-link>
      <v-spacer />
      <div class="d-flex align-end">
        <v-btn @click="clearRenderCache" v-if="dev" x-small class="mr-3 d-none d-md-flex">Clear Render Cache</v-btn>
        <v-select dense hide-details class="d-none d-md-flex mr-3"
          label="API"
          :items="[apiUrl, 'http://127.0.0.1:3000/']"
          v-model="mainData.apiUrl"
          v-if="dev"
        ></v-select>
        <v-btn :title="mainData.options.dualView ? 'MERGE COLUMNS' : 'SPLIT COLUMNS'" class="mr-1" @click="mainData.options.dualView = !mainData.options.dualView" icon small v-if="dualViewPossible">
          <v-icon>{{ mainData.options.dualView ? 'mdi-arrow-collapse-horizontal' : 'mdi-arrow-split-vertical' }}</v-icon>
        </v-btn>
        <v-btn :title="mainData.options.fullWidth ? 'NARROW VIEW' : 'EXPANDED VIEW'" class="mr-1" @click="mainData.options.fullWidth = !mainData.options.fullWidth" icon small v-if="mainData.wideScreen">
          <v-icon>{{ mainData.options.fullWidth ? 'mdi-unfold-less-vertical' : 'mdi-unfold-more-vertical' }}</v-icon>
        </v-btn>
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn text small v-bind="attrs" v-on="on" color="#125">
              <v-icon class="mr-2" style="top: -2px;">mdi-book-open-variant</v-icon>
              Corpus information
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="mainData.corpus.selectedElement = false; mainData.options.singleView = 'corpus'; mainData.corpus.showCorpusHeader = true;">
              <v-list-item-icon class="mr-4"><v-icon>mdi-open-in-app</v-icon></v-list-item-icon>
              <v-list-item-title>VOICE Header</v-list-item-title>
            </v-list-item>
            <v-list-item href="https://voice-clariah.acdh.oeaw.ac.at/searchmanual/" target="_blank">
              <v-list-item-icon class="mr-4"><v-icon>mdi-open-in-new</v-icon></v-list-item-icon>
              <v-list-item-title>Search Manual</v-list-item-title>
            </v-list-item>
            <v-list-item href="https://voice-clariah.acdh.oeaw.ac.at/wp-content/uploads/2021/04/VOICE-mark-up-conventions.pdf" target="_blank">
              <v-list-item-icon class="mr-4"><v-icon>mdi-file-pdf-box</v-icon></v-list-item-icon>
              <v-list-item-title>Mark-Up Conventions</v-list-item-title>
            </v-list-item>
            <v-list-item href="https://voice-clariah.acdh.oeaw.ac.at/wp-content/uploads/2021/04/VOICE-spelling-conventions.pdf" target="_blank">
              <v-list-item-icon class="mr-4"><v-icon>mdi-file-pdf-box</v-icon></v-list-item-icon>
              <v-list-item-title>Spelling Conventions</v-list-item-title>
            </v-list-item>
            <v-list-item href="https://voice-clariah.acdh.oeaw.ac.at/wp-content/uploads/2021/04/POS-tagging-and-lemmatization-manual.pdf" target="_blank">
              <v-list-item-icon class="mr-4"><v-icon>mdi-file-pdf-box</v-icon></v-list-item-icon>
              <v-list-item-title>POS and Lemmatization Manual</v-list-item-title>
            </v-list-item>
            <v-list-item href="https://voice-clariah.acdh.oeaw.ac.at/wp-content/uploads/2021/04/Short-POS-tagset.pdf" target="_blank">
              <v-list-item-icon class="mr-4"><v-icon>mdi-file-pdf-box</v-icon></v-list-item-icon>
              <v-list-item-title>Short POS Tag Set</v-list-item-title>
            </v-list-item>
            <v-list-item >
              <v-list-item-icon class="mr-4"><v-icon>mdi-book</v-icon></v-list-item-icon>
              <v-list-item-title>How to Cite VOICE</v-list-item-title>
            </v-list-item>
            <v-list-item href="https://voice-clariah.acdh.oeaw.ac.at/" target="_blank">
              <v-list-item-icon class="mr-4"><v-icon>mdi-open-in-new</v-icon></v-list-item-icon>
              <v-list-item-title>VOICE CLARIAH Homepage</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
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
        <div class="d-flex flex-wrap justify-space-between align-center">
          <div>
            <v-chip class="mx-1 mb-1" label link small href="/dependency-license-report.html" target="_blank">Version: {{ mainData.version }}</v-chip>
            <v-chip class="mx-1 mb-1" label link small v-bind:href="mainData.apiDependencyAndLicense" target="_blank">API: {{ mainData.apiVersion }}</v-chip>
          </div>
          <div class="text-center">
            VOICE. 2021. The Vienna-Oxford International Corpus of English (version VOICE 3.0 Online). ({{ now }}).
            <v-tooltip top max-width="600">
              <template v-slot:activator="{ on, attrs }"><v-icon dense style="top:-1px;" v-bind="attrs" v-on="on">mdi-information-outline</v-icon></template>
              <div class="py-1 text-justify">
                <p class="my-0">VOICE. 2021. The Vienna-Oxford International Corpus of English (version VOICE 3.0 Online). Founding director: Barbara Seidlhofer; Principal investigators VOICE 3.0: Marie-Luise Pitzl, Daniel Schopper; Researchers: Angelika Breiteneder, Hans-Christian Breuer, Nora Dorn, Theresa Klimpfinger, Stefan Majewski, Ruth Osimk-Teasdale, Hannes Pirker, Marie-Luise Pitzl, Michael Radeka, Stefanie Riegler, Barbara Seidlhofer, Omar Siam, Daniel Stoxreiter. Available at: https://voice.acdh.oeaw.ac.at ({{ now }}).</p>
              </div>
            </v-tooltip>
            
          </div>
          <div>
            <v-chip class="mx-1 mb-1" label link small v-on:click="revokeCookieAndTrackingConsent" v-if="userOptedTracking" data-testid="revokeTracking">Stop tracking me</v-chip>
            <v-chip class="mx-1 mb-1" label link small color="primary" href="https://www.oeaw.ac.at/en/oeaw/data-protection" data-testid="privacyPolicy" target="_blank">Privacy Policy</v-chip>
            <v-chip class="mx-1 mb-1" label link small color="primary" href="/imprint.html" data-testid="siteNotice">Site Notice</v-chip>
            <v-chip class="mx-1 mb-1" label link small color="primary" href="mailto:voice3.0@oeaw.ac.at?subject=Feedback">Feedback</v-chip>
          </div>
        </div>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script>
import mainDataFunc from './functions/MainData'
import bookmarks from './functions/Bookmarks'

export default {
  name: 'App',
  data: () => ({
    loading: false,
    publicPath: process.env.BASE_URL,
    apiUrl: process.env.VUE_APP_API_URL,
    dev: process.env.NODE_ENV === 'development',
    branch: process.env.VUE_APP_BRANCH,
    mainData: mainDataFunc.initMainData(),
    userOptedTracking: true,
    showSpeakerDialog: false,
    now: new Date()
  }),
  mounted () {
    this.resized()
    this.loadCorpus()
    window.addEventListener('resize', this.resized)
    this.mainData.app = this
    this.mainData.version = process.env.VUE_APP_VERSION
    if (this.mainData.version.charAt(0) === 'v') {
      this.mainData.version = this.mainData.version.substring(1)
    }
    bookmarks.loadBookmarkStore(this, this.mainData.bookmarks)
    this.now = [this.now.getFullYear(), ('00' + (this.now.getMonth() + 1)).slice(-2), ('00' + this.now.getDate()).slice(-2)].join('-')
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
          this.mainData.apiVersion = response.data.apiVersion
          this.mainData.apiDependencyAndLicense = response.data.apiDependencyAndLicense
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
        'SX-m': { txt: 'Unidentified male speaker', sex: 'male' },
        'SS': { txt: 'Unidentified group of speakers' },
      }
      if (s && Object.keys(fx).indexOf(s.id) > -1) {
        s = JSON.parse(JSON.stringify(s))
        s.sex = fx[s.id].sex || s.sex
        s.txt = fx[s.id].txt || s.txt
        s.refs = null
      } else if (this.mainData.showSpeaker && this.mainData.showSpeaker.speaker && this.mainData.showSpeaker.speaker.match(/SX-\d/)) {
        let oSpeaker = this.mainData.showSpeaker.speaker.replace('X-', '')
        s = this.mainData.showSpeaker && this.mainData.showSpeaker.id && oSpeaker && this.mainData.corpus.obj[this.mainData.showSpeaker.id] && this.mainData.corpus.obj[this.mainData.showSpeaker.id].speakers && this.mainData.corpus.obj[this.mainData.showSpeaker.id].speakers[oSpeaker]
      }
      return s
    },
    filterActive () {
      return this.mainData.filter.active && this.mainData.filter.filterSpeechEventsFunc.filterActive(this.mainData.filter)
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
  .mw-33 {
    min-width: 33.333%;
  }
  .mw-50 {
    min-width: 50%;
  }
  .sm-font {
    font-size: 0.8rem;
    line-height: 1rem;
  }
  .logo-small {
    width: 250px;
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
  .border-0 {
    border: none;
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
  .m-title {
    font-size: 12px;
    padding: 2px;
    color: rgba(0, 0, 0, 0.6);
  }
  .m-hint {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.6);
  }
  .inset-card-shadow {
    box-shadow: inset 0px 3px 1px -2px rgb(0 0 0 / 20%), inset 0px 2px 2px 0px rgb(0 0 0 / 14%), inset 0px 1px 5px 0px rgb(0 0 0 / 12%)!important;
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
  .jump-btn::after {
    content: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' width='20' height='20' viewBox='0 0 24 24'%3E%3Cpath fill='%23333' d='M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z' /%3E%3C/svg%3E");
    position: relative;
    top: 1px;
  }
  .comment-btn::after {
    content: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' width='20' height='20' viewBox='0 0 24 24'%3E%3Cpath fill='%23333' d='M9,22A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V4C2,2.89 2.9,2 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22V22H9M10,16V19.08L13.08,16H20V4H4V16H10M6,7H18V9H6V7M6,11H15V13H6V11Z' /%3E%3C/svg%3E");
    position: relative;
    top: 2px;
  }

  .trash-icon::after, .edit-icon::after {
    content: "\F01B4";
    display: block;
    width: 20px;
    height: 24px;
    display: inline-block;
    font: normal normal normal 24px/1 "Material Design Icons";
    font-size: inherit;
    text-rendering: auto;
    line-height: inherit;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #666;
    font-size: 1.4rem;
    line-height: 1;
    position: relative;
    top: -1px;
    left: 1px;
    cursor: pointer;
  }
  .edit-icon::after {
    content: "\F03EB";
  }
  .bookmark, .bookmark-check {
    position: relative;
  }
  button.bookmark, button.bookmark-check {
    height: fit-content;
    margin-bottom: -3px;
    outline: none;
  }
  .bookmark::after, .bookmark-check::after {
    content: "\F137B";
    display: block;
    width: 20px;
    height: 24px;
    display: inline-block;
    font: normal normal normal 24px/1 "Material Design Icons";
    font-size: inherit;
    text-rendering: auto;
    line-height: inherit;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #aaa;
    font-size: 1.4rem;
    line-height: 1;
    position: relative;
    top: 1px;
    left: 1px;
    cursor: pointer;
  }
  .bookmark.bookmark-fast::after {
    content: "\F00C4";
  }
  .bookmark-check::after {
    content: "\F00C1";
    color: #666;
  }
  .bookmark-check.bookmark-fast::after {
    content: "\F00C6";
    color: #800;
  }
  .bookmark:hover::after, .bookmark-check:hover::after {
    color: #333;
  }
  .bookmark-check.bookmark-fast:hover::after {
    color: #a00;
  }
  .bookmark:hover::before, .bookmark-check:hover::before {
    content: "";
    position: absolute;
    background: #ccc;
    width: 28px;
    height: 28px;
    left: -2px;
    top: -2px;
    border-radius: 100%;
  }
</style>
