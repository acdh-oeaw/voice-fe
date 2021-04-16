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
        <div class="line-speaker" v-if="show_sId"><button @click="showSpeaker(aLine)">{{ aLine.speaker }}</button></div>
        <div v-if="inView.indexOf(aIdx) > - 1" v-html="aLine[view]" :class="classes" data-testid="lineContent"></div>
        <div v-else data-testid="lineContent">{{ aLine.obj.text }}</div>
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
  methods: {
    showSpeaker (l) {
      this.mainData.showSpeaker = {id: l.uId.split('_')[0], speaker: l.speaker}
    },
    goToUtterance () {
      if (this.mainData.corpus.goToUtterance) {
        let eId = this.mainData.corpus.goToUtterance.split('_')[0]
        if (eId === this.element.id) {
          // console.log('goToUtterance', this.element.id, this.mainData.corpus.goToUtterance)
          this.scroll2TopLine(this.mainData.corpus.goToUtterance, 0, 150)
          this.$nextTick(() => {
            _.debounce(() => {
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
  computed: {
    show_utI () {
      let show = true
      Object.keys(this.mainData.views).some(v => {
        if (this.view === v) {
          show = !this.mainData.views[v].utI || this.mainData.views[v].utI.val
        }
      })
      return show
    },
    show_sId () {
      return this.view !== 'voice' || this.mainData.views.voice.sId.val
    },
    show_gap () {
      return this.view !== 'voice' || this.mainData.views.voice.gap.val
    },
    classes () {
      let aClasses = 'line-con typ-' + this.view
      Object.keys(this.mainData.views).some(v => {
        if (this.view === v) {
          Object.keys(this.mainData.views[v]).forEach(vo => {
            if (this.mainData.views[v][vo].val) {
              aClasses += ' s-' + vo.toLowerCase()
            }
          })
          return true
        }
      })
      return aClasses
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

</style>
