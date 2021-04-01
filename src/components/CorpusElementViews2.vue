<template>
  <div ref="viewarea" class="viewarea linescroll" v-on:scroll="scrolling()">
    <template
      v-for="(aLine, aIdx) in element.bodyObj.data.u.list"
    >
      <div class="d-flex line-frm" ref="lines"
        :data-uid="aIdx"
        :key="'u' + element.id + 'l' + aIdx"
        :style="'min-height:' + aLine.posHeight + 'px;'"
      >
        <div class="line-nr" v-if="show_utI">{{ aIdx + 1 }}</div>
        <div class="line-speaker" v-if="show_sId">{{ aLine.speaker }}</div>
        <div v-if="inView.indexOf(aIdx) > - 1" v-html="aLine.pos"></div>
        <div v-else>{{ aLine.obj.text }}</div>
      </div>
      <div class="line-gap" ref="lines" :key="'u' + element.id + 'lg' + aIdx" v-if="show_gap && aLine.gap">
        {{ aLine.gap }}
      </div>
    </template>
  </div>
</template>

<script>
import RenderLine from './RenderLine';

export default {
  name: 'CorpusElementViews2',
  props: {
    'mainData': Object,
    'element': Object,
    'view': String
  },
  data: () => ({
    inView: [],
    lastElement: null
  }),
  mounted () {
    console.log('CorpusElementViews2', this.element)
    this.lastElement = this.element
    this.scrolling()
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
  },
  methods: {
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
              if (aU.posHeight !== aH) {
                aU.posHeight = aH
              }
              if (!aU.pos) {
                aU.pos = '<span><span>' + aU.obj.text + '</span> <span style="color: #aaa">(<u>rendered</u> <span style="color: #999;"><i>test</i></span>)</span></span>'
              }
              this.inView.push(uId)
            }
          }
        })
      }
    }
  },
  watch: {
    'element.id' () {
      this.lastElement = this.element
      this.scrolling()
    },
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
