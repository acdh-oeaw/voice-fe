<template>
  <div ref="viewarea" class="viewarea linescroll" v-on:scroll="scrolling()">
    <template
      v-for="(aLine, aIdx) in element.bodyObj.data.u.list"
    >
      <div ref="lines"
        :data-uid="aIdx"
        :key="'u' + element.id + 'l' + aIdx"
        :style="inView.indexOf(aIdx) === -1 ? 'min-height:' + aLine[view + 'Height'] + 'px;' : null"
        :class="'d-flex line-frm' + (mainData.corpus.goToUtterance === aLine.uId ? ' jump' : '')"
      >
        <div class="line-nr" v-if="show_utI">{{ aIdx + 1 }}</div>
        <div class="line-speaker" v-if="show_sId">{{ aLine.speaker }}</div>
        <div v-if="inView.indexOf(aIdx) > - 1" v-html="aLine[view]" :class="classes"></div>
        <div v-else>{{ aLine.obj.text }}</div>
      </div>
      <div class="line-gap" ref="lines" :key="'u' + element.id + 'lg' + aIdx" v-if="show_gap && aLine.gap">
        {{ aLine.gap }}
      </div>
    </template>
  </div>
</template>

<script>
import renderer from '../functions/Renderer'
var _ = require('lodash')

export default {
  name: 'CorpusElementViews',
  props: {
    'mainData': Object,
    'element': Object,
    'view': String
  },
  data: () => ({
    inView: []
  }),
  mounted () {
    console.log('CorpusElementViews', this.element)
    this.scroll2TopLine(this.element.aTopLineUId)
    this.scrolling()
    this.goToUtterance()
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
    classes () {
      let aClasses = 'line-con typ-' + this.view
      if (this.view === 'voice') {
        Object.keys(this.mainData.views.voice).forEach(vo => {
          if (this.mainData.views.voice[vo].val) {
            aClasses += ' s-' + vo.toLowerCase()
          }
        })
      }
      return aClasses
    }
  },
  methods: {
    goToUtterance () {
      if (this.mainData.corpus.goToUtterance) {
        let eId = this.mainData.corpus.goToUtterance.split('_')[0]
        if (eId === this.element.id) {
          // console.log('goToUtterance', this.element.id, this.mainData.corpus.goToUtterance)
          this.scroll2TopLine(this.mainData.corpus.goToUtterance, 0, 150)
          this.$nextTick(() => {
            _.debounce(() => {
              console.log('xxx', this.mainData.corpus.goToUtterance)
              this.mainData.corpus.goToUtterance = null
            }, 100)()
          })
        }
      }
    },
    scroll2TopLine (toUid, dg = 0, add2Top = 0) {
      if (toUid) {
        if (this.$refs && this.$refs.viewarea && this.$refs.lines && dg > 2) {
          if (this.$refs.lines.some((line) => {
            if (line.dataset && line.dataset.uid) {
              let uId = parseInt(line.dataset.uid)
              let aU = this.element.bodyObj.data.u.list[uId]
              if (aU && aU.uId === toUid) {
                this.$refs.viewarea.scrollTop = line.offsetTop + 5 - add2Top
                return true
              }
            }
          })) {
            this.scrolling()
            return true
          }
        }
        if (dg < 6) {
          this.$nextTick(() => {
            this.scroll2TopLine(toUid, dg + 1, add2Top)
          })
        }
      }
    },
    scrolling () {
      if (this.$refs && this.$refs.viewarea && this.$refs.lines) {
        let vT = this.$refs.viewarea.scrollTop
        let vH = this.$refs.viewarea.clientHeight
        this.inView = []
        this.$refs.lines.forEach((line) => {
          let aH = line.offsetHeight || 0
          let aT = line.offsetTop
          if (aT + aH >= vT && aT <= vT + vH) {
            if (line.dataset && line.dataset.uid) {
              let uId = parseInt(line.dataset.uid)
              let aU = this.element.bodyObj.data.u.list[uId]
              if (aU[this.view + 'Height'] !== aH) {
                aU[this.view + 'Height'] = aH
              }
              if (!aU[this.view]) {
                aU[this.view] = renderer.renderUtterance(aU.obj, this.element.bodyObj.xmlObj, this.view, this.mainData.search.highlights)
              }
              this.inView.push(uId)
            }
          }
        })
        if (this.inView[1]) {
          this.element.aTopLineUId = this.element.bodyObj.data.u.list[this.inView[0]].uId
        }
      }
    }
  },
  watch: {
    'mainData.corpus.goToUtterance' () {
      this.goToUtterance()
    },
    'mainData.views.voice': {
      deep: true,
      handler() {
        this.scrolling()
      }
    },
    'mainData.search.lastValue' () {
      this.scrolling()
    },
    'mainData.search.loading' (nv) {
      if (!nv) {
        this.scrolling()
      }
    },
    'view' () {
      this.scrolling()
    },
    'element.id' () {
      this.$nextTick(() => {
        this.scroll2TopLine(this.element.aTopLineUId)
        this.scrolling()
      })
    },
  },
  components: {
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
  transition: background-color 3s;
}
.line-frm.jump {
  background-color: #eef;
  transition: background-color 0s;
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

.line-con >>> .highlight {
  background: #ff0;
}
.line-con >>> .tag-parsererror {
  color: #d00;
  font-weight: bold;
}

/*********/
/* Voice */
/*********/
.line-con.typ-voice >>> .fx-overlap,
.line-con.typ-voice >>> .type-overlap {
  color: blue;
}
.line-con.typ-voice:not(.s-ot) >>> .fx-overlap {
  display: none;
}

.line-con.typ-voice >>> .tag-pause {
  color: brown;
}
.line-con.typ-voice:not(.s-p) >>> .tag-pause {
  display: none;
}

.line-con.typ-voice >>> .tag-incident {
  color: #808080;
}
.line-con.typ-voice:not(.s-ce) >>> .tag-incident {
  display: none;
}

.line-con.typ-voice >>> .tag-shift {
  color: #AA0066;
}
.line-con.typ-voice:not(.s-sm) >>> .tag-shift:not(.new-laugh):not(.neutral-laugh) {
  display: none;
}

.line-con.typ-voice:not(.s-smls) >>> .new-laugh,
.line-con.typ-voice:not(.s-smls) >>> .neutral-laugh {
  display: none;
}

.line-con.typ-voice >>> .tag-vocal {
  color: #AA0066;
}
.line-con.typ-voice:not(.s-vsn) >>> .tag-vocal:not(.voice-desc-laughing) {
  display: none;
}

.line-con.typ-voice:not(.s-vsnl) >>> .tag-vocal.voice-desc-laughing {
  display: none;
}

.line-con.typ-voice >>> .fx-spel {
  color: #AA0066;
}
.line-con.typ-voice:not(.s-spl) >>> .fx-spel {
  display: none;
}

.line-con.typ-voice >>> .tag-foreign.type-LN, .line-con.typ-voice >>> .tag-foreign.type-L1, .line-con.typ-voice >>> .tag-foreign.type-LQ {
  color: #b13610;
}

.line-con.typ-voice:not(.s-flat) >>> .fx-foreign {
  display: none;
}
.line-con.typ-voice:not(.s-flat) >>> .fx-foreign-t {
  display: none;
}

.line-con.typ-voice:not(.s-oc) >>> .fx-other-continuation {
  display: none;
}

.line-con.typ-voice >>> .tag-supplied.reason-unintelligible {
  color: #00978E;
}
.line-con.typ-voice:not(.s-uit) >>> .fx-unintelligible-tag {
  display: none;
}

.line-con.typ-voice >>> .fx-ono {
  color: #61DDD2;
}
.line-con.typ-voice:not(.s-ono) >>> .fx-ono {
  display: none;
}

.line-con.typ-voice >>> .fx-pvct {
  color: #61DDD2;
}
.line-con.typ-voice:not(.s-pvct) >>> .fx-pvct {
  display: none;
}

.line-con.typ-voice >>> .fx-ipa {
  color: #61DDD2;
}

.line-con.typ-voice >>> .tag-emph {
  text-transform: uppercase;
}

.line-con.typ-voice >>> .type-other_continuation {
  color: #8700C1;
}

.line-con.typ-voice:not(.s-ut) >>> .tag-unclear {
  text-transform: lowercase;
}
.line-con.typ-voice:not(.s-ut) >>> .fx-unclear {
  display: none;
}

.line-con.typ-voice:not(.s-lie) >>> .type-lengthening,
.line-con.typ-voice:not(.s-lie) >>> .type-intonation,
.line-con.typ-voice:not(.s-lie) >>> .tag-emph {
  display: none;
}

/*********/
/* Plain */
/*********/
.line-con.typ-plain >>> .has-n {
  color: #00f;
}

/*******/
/* Pos */
/*******/

/*******/
/* XML */
/*******/

.line-con.typ-xml-view {
  font-family: Consolas, "Courier New", monospace;
  white-space: pre-wrap;
  position: relative;
  border-top: 1px solid #bbb;
}
.line-con.typ-xml-view >>> .tc {
  color: mediumblue;
}
.line-con.typ-xml-view >>> .tnc {
  color: brown;
}
.line-con.typ-xml-view >>> .ac {
  color: red;
}
.line-con.typ-xml-view >>> .avc {
  color: mediumblue;
}
.line-con.typ-xml-view >>> .cc {
  color: green;
}
</style>
