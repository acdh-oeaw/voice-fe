<template>
  <div ref="viewarea" class="viewarea linescroll" v-on:scroll="scrolling()">
    <div class="line-viewarea" :style="'height: ' + (height) + 'px;'" v-if="xmlObjLines">
      <div class="line-viewarea" :style="'top: ' + lineTopPx + 'px;'">
        <template
          v-for="(aLine, aIdx) in visibleXmlObjLines"
        >
          <div class="d-flex line-frm" :key="'l' + aIdx">
            <div class="line-nr" v-if="show_utI">{{ lineTop + aIdx + 1 }}</div>
            <div class="line-speaker" v-if="show_sId">{{ aLine.speaker }}</div>
            <RenderLine :xmlObjLine="aLine" :type="view" :highlight="mainData.search.highlights" :mainData="mainData" />
          </div>
          <div class="line-gap" :key="'lg' + aIdx" v-if="show_gap && aLine.gap">
            {{ aLine.gap }}
          </div>
        </template>
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
    lastElement: null,
    scrollReady: false
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
    show_utI () {
      return this.view !== 'voice' || this.mainData.views.voice.utI.val
    },
    show_sId () {
      return this.view !== 'voice' || this.mainData.views.voice.sId.val
    },
    show_gap () {
      return this.view !== 'voice' || this.mainData.views.voice.gap.val
    },
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
    scrollGetALine (aTop, aBottom) {
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
        return {aTopLine, aBottomLine}
        // console.log(aTopLine, aBottomLine, aLinePx)
    },
    scrolling () {
      if (this.xmlObjLines && this.$refs && this.$refs.viewarea) {
        let aTop = this.$refs.viewarea.scrollTop
        this.element.scrollPos[this.view] = aTop
        let aBottom = this.$refs.viewarea.scrollTop + this.$refs.viewarea.clientHeight
        let aLines = this.scrollGetALine(aTop, aBottom)
        if (this.scrollReady) {
          // console.log('setTop', aLines.aTopLine)
          this.$set(this.element, 'aTopLine', aLines.aTopLine)
          this.$set(this.element, 'aTopLineUId', this.xmlObjLines[aLines.aTopLine].uId)
        }
        if (aLines.aTopLine <= this.lineTop) {
          this.lineTop = Math.floor(aLines.aTopLine - (this.lineLenght / 2 + (aLines.aBottomLine - aLines.aTopLine) / 2))
          if (this.lineTop < 0) {
            this.lineTop = 0
          }
        } else if (aLines.aBottomLine >= this.lineTop + this.lineLenght) {
          this.lineTop = Math.ceil(aLines.aTopLine - (this.lineLenght / 3))
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
        let xmlDoc = parser.parseFromString(xmlS,"application/xml")
        let aLines = [].slice.call(xmlDoc.getElementsByTagName('u')).map((dom, i) => {
          let speaker = dom.attributes && dom.attributes.who && dom.attributes.who.nodeValue ? dom.attributes.who.nodeValue : null
          if (speaker && typeof speaker === 'string') {
            speaker = speaker.split('_').slice(-1)[0]
          }
          let gap = ''
          if (dom && !dom.nextElementSibling && dom.parentElement && dom.parentElement.nextElementSibling && dom.parentElement.nextElementSibling.tagName === 'gap') {
            let aDom = dom.parentElement.nextElementSibling
            if (aDom.attributes && aDom.attributes['reason']) {
              gap += '('
              if (aDom.attributes['reason'].value === 'not_transcribed') {
                gap += 'gap'
              } else if (aDom.attributes['reason'].value === 'not_recorded') {
                gap += 'nrec'
              }
              if (dom.parentElement.attributes['voice:end'] && aDom.nextElementSibling && aDom.nextElementSibling.attributes['voice:start']) {
                let fTime = this.dur2sec(dom.parentElement.attributes['voice:end'].value)
                let tTime = this.dur2sec(aDom.nextElementSibling.attributes['voice:start'].value)
                gap += ' ' + this.sec2dur(tTime - fTime, 0)
              }
              gap += ')'
              if (aDom.attributes['voice:desc'] && aDom.attributes['voice:desc'].value) {
                gap += ' {' + aDom.attributes['voice:desc'].value + '}'
              }
            }
          }
          return {
            dom: dom,
            uId: dom && dom.tagName === 'u' && dom.attributes['xml:id'] ? dom.attributes['xml:id'].value : null,
            speaker: speaker,
            gap: gap.length > 0 ? gap : null,
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
    loadScrollPos (dg = 5) {
      if (this.$refs && this.$refs.viewarea && this.element.aTopLine) {
        let aLinePx = this.xmlObjLines ? this.xmlObjLines.slice(0, this.element.aTopLine).reduce((a,b) => a + b.textHeight + this.extraHeight, 0) : 0
        this.$refs.viewarea.scrollTop = aLinePx
        // console.log(this.element.aTopLine, aLinePx, this.scrollGetALine(aLinePx).aTopLine)
        if (dg >= 0) {
          this.$nextTick(() => {
            this.loadScrollPos(dg - 1)
          })
        } else {
          this.scrollReady = true
        }
        // this.$refs.viewarea.scrollTop = this.element.scrollPos[this.view]
      } else {
        this.scrollReady = true
      }
    },
    cacheHeights (v, el) {
      if (v && this.xmlObjLines && this.xmlObjLines.length > 0 && el.lineHeight[v]) {
        this.$set(el.lineHeight, v, Array.from(this.xmlObjLines.map(l => l.textHeight)))
        console.log('cacheHeights')
      }
    },
    dur2sec (hms) {
      var s = 0.0
      if (hms && hms.indexOf(':') > -1) {
        var a = hms.split(':')
        if (a.length > 2) { s += parseFloat(a[a.length - 3]) * 60 * 60 }
        if (a.length > 1) { s += parseFloat(a[a.length - 2]) * 60 }
        if (a.length > 0) { s += parseFloat(a[a.length - 1]) }
      } else {
        s = parseFloat(hms)
      }
      return ((isNaN(s)) ? 0.0 : s)
    },
    sec2dur (sec) {
      var v = ''
      if (sec < 0) { sec = -sec; v = '-' }
      var h = parseInt(sec / 3600)
      sec %= 3600
      var m = parseInt(sec / 60)
      var s = sec % 60
      return v + ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2) + ':' + ('0' + s.toFixed(0)).slice(-2)
    }
  },
  watch: {
    'element.id' () {
      if (this.lastElement) {
        this.cacheHeights(this.view, this.lastElement)
      }
      this.scrollReady = false
      this.loadScrollPos()
      this.updateXmlObjLines()
      this.lastElement = this.element
      this.$nextTick(() => {
        this.scrolling()
      })
    },
    view (nVal, oVal) {
      this.cacheHeights(oVal, this.element)
      this.scrollReady = false
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
.line-gap {
  color: #222;
  background: #fafafa;
  border-top: 1px solid #ddd;
  padding: 0.5rem 0.5rem;
}
.line-nr {
  min-width: 3rem;
}
.line-speaker {
  min-width: 4rem;
  font-weight: bold;
}
</style>
