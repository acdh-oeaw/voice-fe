<template>
  <div ref="viewarea" class="viewarea linescroll">
    <template
      v-for="(aLine, aIdx) in element.bodyObj.data.u.list"
    >
      <div class="d-flex line-frm" :key="'u' + element.id + 'l' + aIdx">
        <div class="line-nr" v-if="show_utI">{{ aIdx + 1 }}</div>
        <div class="line-speaker" v-if="show_sId">{{ aLine.speaker }}</div>
        <div>{{ aLine.obj.text }}</div>
      </div>
      <div class="line-gap" :key="'u' + element.id + 'lg' + aIdx" v-if="show_gap && aLine.gap">
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
    xmlObjLines: null,
    lastElement: null
  }),
  mounted () {
    console.log('CorpusElementViews2', this.element)
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
  },
  methods: {
  },
  watch: {
    'element.id' () {
      this.lastElement = this.element
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
