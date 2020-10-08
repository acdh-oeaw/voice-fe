<template>
  <div class="search-select-frm fx-bb d-flex flex-wrap flex-md-nowrap">
    <div class="d-flex flex-shrink-1 search-field align-center px-3" v-if="!dualView || viewNr === 0">
      <v-text-field v-model="mainData.search.value" @keydown.enter="search" label="Search the VOICE Corpus" hide-details class="mr-2 mt-0"></v-text-field>
      <v-btn @click="search" small color="indigo darken-4 white--text">Search</v-btn>
    </div>
    <div v-if="!dualView || viewNr === 1" :class="{ 'fx-bl': !dualView, 'px-3': true, 'py-1': true, 'ce-frm': true, 'flex-grow-1': true }">
      <v-chip
        close label outlined color="default"
        :class="{
          'selected': ceVal.id === mainData.corpus.selectedElement,
          'my-1': true,
          'mx-1': true
        }"
        @click="selectCorpusElement(ceVal.id)"
        @click:close="closeCorpusElement(ceVal.id, ceKey)"
        v-for="(ceVal, ceKey) in mainData.corpus.elements"
        :key="'ce' + ceKey"
      >
        {{ ceVal.id }}
      </v-chip>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchSelect',
  props: {
    'mainData': Object,
    'viewNr': Number,
    'dualView': Boolean
  },
  data: () => ({
    publicPath: process.env.BASE_URL,
    cTab: 0
  }),
  mounted () {
    console.log('SearchSelect', this.mainData)
  },
  methods: {
    search () {
      this.mainData.options.singleView = 0
    },
    selectCorpusElement (ceId) {
      this.mainData.corpus.selectedElement = ceId
      this.mainData.options.singleView = 1
    },
    closeCorpusElement (ceId, ceKey) {
      console.log('closeCorpusElement', ceKey)
      if (this.mainData.corpus.selectedElement === ceId) {
        this.mainData.corpus.selectedElement = null
      }
      this.$delete(this.mainData.corpus.elements[ceKey], 'loaded')
      this.$delete(this.mainData.corpus.elements, ceKey)
    }
  }
}
</script>

<style scoped>
  .search-field {
    min-width: 310px;
  }
  .search-select-frm > div {
    height: 48px;
  }
  .v-chip.v-chip--outlined.v-chip.v-chip.selected {
    background-color: #e8e8e8!important;
  }
  .ce-frm {
    overflow: hidden auto;
  }
</style>
