<template>
  <div class="search-select-frm fx-bb d-flex flex-wrap flex-md-nowrap">
    <SearchField :mainData="mainData" v-if="!dualView || viewNr === 0" />
    <div v-if="!dualView || viewNr === 1" :class="{ 'fx-bl': !dualView, 'px-3': true, 'py-1': true, 'ce-frm': true, 'flex-grow-1': true }">
      <!-- <v-chip @click="selectCorpusElement()" :class="{'selected': !mainData.corpus.selectedElement, 'px-1': true, 'my-1': true, 'mx-1': true}" label outlined color="default"><v-icon>mdi-view-headline</v-icon></v-chip> -->
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
import SearchField from './SearchField';

export default {
  name: 'SearchSelect',
  props: {
    'mainData': Object,
    'viewNr': Number,
    'dualView': Boolean
  },
  data: () => ({
  }),
  mounted () {
    console.log('SearchSelect', this.mainData)
  },
  methods: {
    selectCorpusElement (ceId) {
      this.mainData.corpus.selectedElement = ceId
      this.mainData.options.singleView = 'corpus'
    },
    closeCorpusElement (ceId, ceKey) {
      console.log('closeCorpusElement', ceKey)
      this.$delete(this.mainData.corpus.elements[ceKey], 'loaded')
      this.$delete(this.mainData.corpus.elements, ceKey)
      if (this.mainData.corpus.selectedElement === ceId) {
        this.mainData.corpus.selectedElement = this.mainData.corpus.elements[ceKey - 1] ? this.mainData.corpus.elements[ceKey - 1].id : (this.mainData.corpus.elements[0] ? this.mainData.corpus.elements[0].id : null)
      }
    }
  },
  components: {
    SearchField
  }
}
</script>

<style scoped>
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
