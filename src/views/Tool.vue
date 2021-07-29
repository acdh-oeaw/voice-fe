<template>
  <v-container :class="{'max-width': !mainData.options.fullWidth, 'py-0': true}" :fluid="!mainData.wideScreen" fill-height align-start>
    <v-row class="fill-height" style="margin-bottom: initial; margin-top: initial">
      <v-col class="col-12 col-md toolsetleft fill-height">
        <ToolsetLeft :mainData="mainData" />
      </v-col>
      <v-col class="col-12 col-md py-0 fill-height">
        <v-row class="fill-height" style="margin-bottom: initial; margin-top: initial">
          <v-col :class="{
            'col-12': true,
            'col-lg-6': dualView
          }" v-if="dualView || mainData.options.singleView === 'search'">
            <v-card class="d-flex flex-column fill-height">
              <SearchSelect :mainData="mainData" :viewNr="0" :dualView="dualView" />
              <SearchResults :mainData="mainData" />
            </v-card>
          </v-col>
          <v-col :class="{
            'col-12': true,
            'col-lg-6': dualView
          }" v-if="dualView || mainData.options.singleView === 'corpus'">
            <v-card class="fill-height d-flex flex-column">
              <SearchSelect :mainData="mainData" :viewNr="1" :dualView="dualView" />
              <CorpusElement :mainData="mainData" />
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <DialogBookmarks :mainData="mainData" />
  </v-container>
</template>

<script>
import ToolsetLeft from '../components/ToolsetLeft';
import SearchSelect from '../components/SearchSelect';
import SearchResults from '../components/SearchResults';
import CorpusElement from '../components/CorpusElement';
import DialogBookmarks from '../components/DialogBookmarks';

export default {
  name: 'Tool',
  props: {
    'mainData': Object
  },
  data: () => ({
    publicPath: process.env.BASE_URL
  }),
  mounted () {
    console.log('Tool', this.mainData)
    this.getBookmarks()
  },
  timers: {
    checkMatomo: { time: 100, autostart: true, repeat: true }
  },
  methods: {
    checkMatomo () {
      if (this.$matomo) {
        this.mainData.hideCookieConsent ||= this.$matomo.hasRememberedConsent()
        if (!this.mainData.hideCookieConsent) {
          this.$router.replace('/')
        } 
        this.$timer.stop('checkMatomo')
      }
    },
    getBookmarks () {
      if (this.$route.query.bookmarks) {
        this.mainData.bookmarks.import.urlData = this.$route.query.bookmarks
        this.mainData.bookmarks.import.show = true
        this.mainData.bookmarks.import.external = true
        this.$router.push({ path: this.$route.path, query: Object.keys(this.$route.query).filter(key => key !== 'bookmarks').reduce((obj, key) => { return {...obj, [key]: this.$route.query[key]} }, {}) })
      }
    }
  },
  computed: {
    dualView () {
      return this.mainData.wideScreen && this.mainData.options.fullWidth && this.mainData.options.dualView
    }
  },
  watch: {
    '$route.query.bookmarks' () {
      if (this.$route.query.bookmarks) {
        this.getBookmarks()
      }
    }
  },
  components: {
    ToolsetLeft,
    SearchSelect,
    SearchResults,
    CorpusElement,
    DialogBookmarks
  }
}
</script>

<style>
@import '../assets/css/RenderLine.css';
@media (min-width: 960px) {
  .toolsetleft {
    max-width: 350px;
  }
}
</style>
