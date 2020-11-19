<template>
  <div class="flex-grow-1 d-flex flex-column">
    <div class="flex-grow-1">
      <v-tabs v-model="vTab" grow height="30" class="flex-shrink-1 fx-bb">
        <v-tab href="#textheader">Text Header</v-tab>
        <v-tab href="#voice">voice</v-tab>
        <v-tab href="#plain">plain</v-tab>
        <v-tab href="#pos">PoS</v-tab>
        <v-tab href="#xml">XML</v-tab>
      </v-tabs>
      <div class="px-3 py-2">
        VOICE - {{ vTab }}<br>
        {{ aElement ? aElement.id : 'Kein Element ausgewählt ...'}}
        <code v-if="aElement" style="display: block; white-space: pre-wrap;">{{ aElement }}</code>
      </div>
    </div>
    <div class="fx-bt audio-frm px-3 py-1" v-if="aElement && aElement.audioAvailable">
      Audioplayer
    </div>
  </div>
</template>

<script>
export default {
  name: 'CorpusElement',
  props: {
    'mainData': Object
  },
  data: () => ({
    vTab: 0
  }),
  mounted () {
    console.log('CorpusElement', this.mainData)
  },
  computed: {
    aElement () {
      return this.mainData.corpus.selectedElement && this.mainData.corpus.obj[this.mainData.corpus.selectedElement]
    }
  },
  methods: {
  }
}
</script>

<style scoped>
  .audio-frm {
    background: #eee;
  }
</style>
