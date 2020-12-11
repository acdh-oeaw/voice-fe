<template>
  <v-app>
    <v-container class="home-width" v-if="currentRouteName === 'home'">
      <img :src="publicPath + 'images/vc-logo-0-676.png'" class="img-fluid w-100 mt-7" />
    </v-container>
    <v-container :class="{'max-width': !mainData.options.fullWidth, 'd-flex': true, 'pb-0': true}" :fluid="!mainData.wideScreen" v-else>
      <router-link to="/"><img :src="publicPath + 'images/vc-logo-0-300.png'" class="img-fluid logo-small mt-1" /></router-link>
      <v-spacer />
      <div class="d-flex align-end">
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
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data: () => ({
    loading: false,
    publicPath: process.env.BASE_URL,
    dev: process.env.NODE_ENV === 'development',
    mainData: {
      apiUrl: 'https://voice-node.acdh-dev.oeaw.ac.at/',
      search: {
        value: '',
        lastValue: '',
        searched: false,
        loading: false,
        searchValue: '',
        results: {},
        highlights: [],
        foundXmlId: []
      },
      corpus: {
        selectedElement: null,
        elements: [
        ],
        list: [
        ]
      },
      options: {
        fullWidth: true,
        dualView: true,
        singleView: 'corpus'
      },
      wideScreen: false
    }
  }),
  mounted () {
    this.resized()
    this.loadCorpus()
    window.addEventListener('resize', this.resized)
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
        .get('/corpustree.json')
        .then((response) => {
          // console.log(response)
          let getCorpusObjs = (cList, aObj) => {
            cList.forEach(el => {
              if (el.speechEvents) {
                el.id = el.label
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
          let aObj = {}
          this.$set(this.mainData.corpus, 'list', response.data.domains)
          this.$set(this.mainData.corpus, 'obj', getCorpusObjs(this.mainData.corpus.list, aObj))
          console.log('mainData.corpus', this.mainData.corpus)
          this.loading = false
        })
        .catch((err) => {
          console.log(err)
          this.loading = false
        })
    }
  },
  computed: {
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
