<template>
  <v-app>
    <v-container class="home-width" v-if="currentRouteName === 'home'">
      <img :src="publicPath + 'images/vc-logo-0-676.png'" class="img-fluid w-100 mt-7" />
    </v-container>
    <v-container :class="{'max-width': !mainData.options.fullWidth, 'd-flex': true, 'pb-0': true}" :fluid="!mainData.wideScreen" v-else>
      <router-link to="/"><img :src="publicPath + 'images/vc-logo-0-300.png'" class="img-fluid logo-small mt-1" /></router-link>
      <v-spacer />
      <div class="d-flex align-end">
        <v-btn @click="clearRenderCache" v-if="dev" x-small class="mr-3">Clear Render Cache</v-btn>
        <v-select dense hide-details
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
    <v-footer color="white" class="py-0 footer">
      <v-container class="py-0 px-2 text-right">
        <div class="d-flex justify-space-between">
          <div>
            <v-chip class="mx-1 mb-1" label small>Version: {{ version }}</v-chip>
            <v-chip class="mx-1 mb-1" label small>API: {{ apiVersion }}</v-chip>
          </div>
          <div>
            <v-chip class="mx-1 mb-1" label link small color="primary">Privacy Policy</v-chip>
            <v-chip class="mx-1 mb-1" label link small color="primary">Site Notice</v-chip>
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
    mainData: mainDataFunc.initMainData()
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
    },
    clearRenderCache () {
      let views = ['voice', 'plain', 'pos', 'xml-view']
      this.mainData.corpus.elements.forEach(e => {
        e.bodyObj.data.u.list.forEach(u => {
          views.forEach(v => {
            if (u[v]) {
              u[v] = ''
            }
          })
        })
      })
    }
  },
  computed: {
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
