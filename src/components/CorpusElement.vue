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
    <Audioplayer class="fx-bt" :audiourl="aAudioUrl" v-if="!refreshAudio && aAudioUrl" />
  </div>
</template>

<script>
import Audioplayer from './Audioplayer';

export default {
  name: 'CorpusElement',
  props: {
    'mainData': Object
  },
  data: () => ({
    vTab: 0,
    refreshAudio: false
  }),
  mounted () {
    console.log('CorpusElement', this.mainData)
  },
  computed: {
    aAudioUrl () {
      return this.aElement && this.aElement.audioAvailable && this.aElement.refs && this.aElement.refs.audio
    },
    aElement () {
      return this.mainData.corpus.selectedElement && this.mainData.corpus.obj[this.mainData.corpus.selectedElement]
    }
  },
  methods: {
  },
  watch: {
    aAudioUrl () {
      this.refreshAudio = true
      this.$nextTick(() => {
        this.refreshAudio = false
      })
    }
  },
  components: {
    Audioplayer
  }
}
</script>

<style scoped>
</style>
