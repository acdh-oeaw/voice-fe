<template>
  <div ref="viewarea" class="viewarea linescroll">
    <div>
      <div
        v-for="(aLine, aIdx) in xmlObjLines" :key="'l' + aIdx"
        class="d-flex line-frm"
      >
        <div class="line-nr">{{ aIdx + 1 }}</div>
        <div class="line-speaker">{{ aLine.speaker }}</div>
        <RenderLine :xmlObjLine="aLine"/>
      </div>
    </div>
  </div>
</template>

<script>
import RenderLine from './RenderLine';

export default {
  name: 'CorpusElementViews',
  props: {
    'element': Object
  },
  data: () => ({
  }),
  mounted () {
    console.log('CorpusElementViews', this.element, this.xmlObjLines)
  },
  beforeDestroy () {
  },
  computed: {
    xmlObjLines () {
      let xmlS = this.element && this.element.xml
      if (xmlS) {
        let t1 = performance.now()
        let parser = new DOMParser()
        let xmlDoc = parser.parseFromString(xmlS,"text/xml")
        let aLines = [].slice.call(xmlDoc.getElementsByTagName('u')).map(dom => {
          let speaker = dom.attributes && dom.attributes.who && dom.attributes.who.nodeValue ? dom.attributes.who.nodeValue : null
          if (speaker && typeof speaker === 'string') {
            speaker = speaker.split('_').slice(-1)[0]
          }
          return {
            dom: dom,
            speaker: speaker,
            text: null,
            textHeight: 24
          }
        })
        console.log('xmlObjLines', performance.now() - t1)
        return aLines
      }
      return null
    }
  },
  methods: {
  },
  watch: {
  },
  components: {
    RenderLine
  }
}
</script>

<style scoped>
.viewarea {
  position: absolute;
  left: 0;
  top: 0;
  min-width: 100%;
  min-height: 10px;
}
.line-frm {
  border-top: 1px solid #ddd;
  padding: 0.1rem 0.5rem;
}
.line-nr {
  min-width: 3rem;
}
.line-speaker {
  min-width: 4rem;
  font-weight: bold;
}
.line-content >>> .has-n {
  color: #00f;
}
</style>
