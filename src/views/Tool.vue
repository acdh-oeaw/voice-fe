<template>
  <v-container :class="{'max-width': !mainData.options.fullWidth, 'py-0': true}" :fluid="!mainData.wideScreen" fill-height align-start>
    <v-row class="fill-height">
      <v-col class="col-12 col-md toolsetleft fill-height">
        <ToolsetLeft :mainData="mainData" />
      </v-col>
      <v-col class="col-12 col-md py-0 fill-height">
        <v-row class="fill-height">
          <v-col :class="{
            'col-12': true,
            'col-lg-6': dualView,
            'd-none': !dualView && mainData.options.singleView !== 0
          }">
            <v-card class="fill-height">
              <SearchSelect :mainData="mainData" :viewNr="0" :dualView="dualView" />
              <SearchResults :mainData="mainData" />
            </v-card>
          </v-col>
          <v-col :class="{
            'col-12': true,
            'col-lg-6': dualView,
            'd-none': !dualView && mainData.options.singleView !== 1
          }">
            <v-card class="fill-height d-flex flex-column">
              <SearchSelect :mainData="mainData" :viewNr="1" :dualView="dualView" />
              <CorpusElement :mainData="mainData" />
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ToolsetLeft from '../components/ToolsetLeft';
import SearchSelect from '../components/SearchSelect';
import SearchResults from '../components/SearchResults';
import CorpusElement from '../components/CorpusElement';

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
  },
  methods: {
  },
  computed: {
    dualView () {
      return this.mainData.wideScreen && this.mainData.options.fullWidth && this.mainData.options.dualView
    }
  },
  watch: {
  },
  components: {
    ToolsetLeft,
    SearchSelect,
    SearchResults,
    CorpusElement
  }
}
</script>

<style scoped>
  @media (min-width: 960px) {
    .toolsetleft {
      max-width: 350px;
    }
  }
</style>
