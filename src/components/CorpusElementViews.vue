<template>
  <div ref="viewarea" class="viewarea linescroll" v-on:scroll="scrolling">
    <div class="line-viewarea" :style="'height: ' + (height) + 'px;'" v-if="xmlObjLines">
      <div class="line-viewarea" :style="'top: ' + lineTopPx + 'px;'">
        <div
          v-for="(aLine, aIdx) in visibleXmlObjLines" :key="'l' + aIdx"
          class="d-flex line-frm"
        >
          <div class="line-nr">{{ lineTop + aIdx + 1 }}</div>
          <div class="line-speaker">{{ aLine.speaker }}</div>
          <RenderLine :xmlObjLine="aLine" :highlight="mainData.search.highlights" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RenderLine from './RenderLine';

export default {
  name: 'CorpusElementViews',
  props: {
    'mainData': Object,
    'element': Object,
    'view': String
  },
  data: () => ({
    lineTop: 0,
    lineLenght: 100,
    extraHeight: 5,
    xmlObjLines: null,
    lastElement: null
  }),
  mounted () {
    console.log('CorpusElementViews', this.element, this.xmlObjLines)
    this.updateXmlObjLines()
    this.$nextTick(() => {
      this.loadScrollPos()
    })
    this.lastElement = this.element
  },
  beforeDestroy () {
  },
  computed: {
    height () {
      return this.xmlObjLines ? this.xmlObjLines.reduce((a,b) => a + b.textHeight + this.extraHeight, 0) : 100
    },
    lineTopPx () {
      return this.xmlObjLines ? this.xmlObjLines.slice(0, this.lineTop).reduce((a,b) => a + b.textHeight, 0) + this.extraHeight * this.lineTop : 0
    },
    visibleXmlObjLines () {
      return this.xmlObjLines && this.xmlObjLines.slice(this.lineTop, this.lineTop + this.lineLenght + 1)
    }
  },
  methods: {
    scrolling () {
      if (this.xmlObjLines && this.$refs && this.$refs.viewarea) {
        let aTop = this.$refs.viewarea.scrollTop
        this.element.scrollPos[this.view] = aTop
        let aBottom = this.$refs.viewarea.scrollTop + this.$refs.viewarea.clientHeight
        let aTopLine = 0
        let aBottomLine = 0
        let aLinePx = 0
        this.xmlObjLines.forEach(l => {
          if (aLinePx < aTop) {
            aTopLine += 1
          }
          if (aLinePx < aBottom) {
            aBottomLine += 1
          }
          aLinePx += l.textHeight + this.extraHeight
        })
        // console.log(aTopLine, aBottomLine, aLinePx)
        if (aTopLine <= this.lineTop) {
          this.lineTop = Math.floor(aTopLine - (this.lineLenght / 2 + (aBottomLine - aTopLine) / 2))
          if (this.lineTop < 0) {
            this.lineTop = 0
          }
        } else if (aBottomLine >= this.lineTop + this.lineLenght) {
          this.lineTop = Math.ceil(aTopLine - (this.lineLenght / 3))
          if (this.lineTop + this.lineLenght > this.xmlObjLines.length - 1) {
            this.lineTop = this.xmlObjLines.length - 1 - this.lineLenght
          }
        }
      }
    },
    updateXmlObjLines () {
      let xmlS = this.element && this.element.xml
      if (xmlS) {
        let t1 = performance.now()
        let parser = new DOMParser()
        let xmlDoc = parser.parseFromString(xmlS,"text/xml")
        let aLines = [].slice.call(xmlDoc.getElementsByTagName('u')).map((dom, i) => {
          let speaker = dom.attributes && dom.attributes.who && dom.attributes.who.nodeValue ? dom.attributes.who.nodeValue : null
          if (speaker && typeof speaker === 'string') {
            speaker = speaker.split('_').slice(-1)[0]
          }
          return {
            dom: dom,
            speaker: speaker,
            text: null,
            textHeight: this.element.lineHeight[this.view] && this.element.lineHeight[this.view][i] ? this.element.lineHeight[this.view][i] : 24
          }
        })
        this.xmlObjLines = aLines
        console.log('xmlObjLines', performance.now() - t1)
      } else {
        this.xmlObjLines = null
      }
    },
    loadScrollPos () {
      if (this.$refs && this.$refs.viewarea) {
        this.$refs.viewarea.scrollTop = this.element.scrollPos[this.view]
      }
    },
    cacheHeights (v, el) {
      if (v && this.xmlObjLines && this.xmlObjLines.length > 0 && el.lineHeight[v]) {
        this.$set(el.lineHeight, v, Array.from(this.xmlObjLines.map(l => l.textHeight)))
        console.log('cacheHeights')
      }
    }
  },
  watch: {
    'element.id' () {
      if (this.lastElement) {
        this.cacheHeights(this.view, this.lastElement)
      }
      this.loadScrollPos()
      this.updateXmlObjLines()
      this.lastElement = this.element
      this.$nextTick(() => {
        this.scrolling()
      })
    },
    view (nVal, oVal) {
      this.cacheHeights(oVal, this.element)
      this.loadScrollPos()
      this.updateXmlObjLines()
      this.$nextTick(() => {
        this.scrolling()
      })
    }
    // element: {
    //   deep: true,
    //   handler() {
    //     this.updateXmlObjLines()
    //   }
    // }
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
  right: 0;
  bottom: 0;
}
.line-viewarea {
  position: absolute;
  left: 0;
  top: 0;
  min-width: 100%;
  min-height: 10px;
}
.line-frm {
  border-top: 1px solid #ddd;
  padding: 2px 0.5rem;
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
