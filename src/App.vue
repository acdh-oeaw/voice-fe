<template>
  <v-app>
    <v-container class="home-width" v-if="currentRouteName === 'home'">
      <img :src="publicPath + 'images/vc-logo-0-676.png'" class="img-fluid w-100 mt-7" />
    </v-container>
    <v-container :class="{'max-width': !mainData.options.fullWidth, 'd-flex': true, 'pb-0': true}" :fluid="!mainData.wideScreen" v-else>
      <router-link to="/"><img :src="publicPath + 'images/vc-logo-0-300.png'" class="img-fluid logo-small mt-1" /></router-link>
      <v-spacer />
      <div class="d-flex align-end">
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
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data: () => ({
    publicPath: process.env.BASE_URL,
    mainData: {
      search: {
        value: '',
        searched: false,
        searchValue: '',
        results: []
      },
      corpus: {
        selectedElement: null,
        elements: [
        ],
        list: [
          {
            id: 'ED',
            children: [
              { id: 'EDcon4' },
              { id: 'EDcon250' },
              { id: 'EDcon496', audio: true },
              { id: 'EDcon521', audio: true },
              { id: 'EDint328' },
              { id: 'EDint330' },
              { id: 'EDint331' },
              { id: 'EDint604' },
              { id: 'EDint605' },
              { id: 'EDsed31' },
              { id: 'EDsed25', audio: true },
              { id: 'EDsed301' },
              { id: 'EDsed362' },
              { id: 'EDsed363' },
              { id: 'EDsed364' },
              { id: 'EDsve421' },
              { id: 'EDsve422', audio: true },
              { id: 'EDsve423' },
              { id: 'EDsve451' },
              { id: 'EDsve452' },
              { id: 'EDwgd5' },
              { id: 'EDwgd6' },
              { id: 'EDwgd241' },
              { id: 'EDwgd305' },
              { id: 'EDwgd497', audio: true },
              { id: 'EDwsd9' },
              { id: 'EDwsd15' },
              { id: 'EDwsd242' },
              { id: 'EDwsd302' },
              { id: 'EDwsd303', audio: true },
              { id: 'EDwsd304' },
              { id: 'EDwsd306' },
              { id: 'EDwsd464' },
              { id: 'EDwsd499' },
              { id: 'EDwsd590' }
            ]
          },
          {
            id: 'LE',
            children: [
              { id: 'LEcon8' },
              { id: 'LEcon227' },
              { id: 'LEcon228' },
              { id: 'LEcon229' },
              { id: 'LEcon329' },
              { id: 'LEcon351' },
              { id: 'LEcon352' },
              { id: 'LEcon353' },
              { id: 'LEcon405' },
              { id: 'LEcon417' },
              { id: 'LEcon418' },
              { id: 'LEcon420', audio: true },
              { id: 'LEcon545', audio: true },
              { id: 'LEcon547' },
              { id: 'LEcon548' },
              { id: 'LEcon560' },
              { id: 'LEcon562' },
              { id: 'LEcon565' },
              { id: 'LEcon566', audio: true },
              { id: 'LEcon573' },
              { id: 'LEcon575' },
              { id: 'LEint551' },
              { id: 'LEint552' },
              { id: 'LEint553' },
              { id: 'LEint554' },
              { id: 'LEint555' }
            ]
          }
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
    this.updateCorpus()
    window.addEventListener('resize', this.resized)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.resized)
  },
  methods: {
    resized () {
      this.mainData.wideScreen = window.innerWidth >= 1264
    },
    updateCorpus () {
      let flatCorpusList = (cList, aObj) => {
        cList.forEach(el => {
          if (el.children) {
            flatCorpusList(el.children, aObj)
          } else {
            aObj[el.id] = el
          }
        })
        return aObj
      }
      let aObj = {}
      this.$set(this.mainData.corpus, 'obj', flatCorpusList(this.mainData.corpus.list, aObj))
      console.log('mainData.corpus.obj', this.mainData.corpus.obj)
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
    width: 300px;
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
