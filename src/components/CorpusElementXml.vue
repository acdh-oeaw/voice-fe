<template>
  <div class="xml-view d-flex flex-column">
    <div class="xml-tools pa-2">
      <v-btn @click="scrollTo(0)" class="mr-2" small>TOP</v-btn>
      <v-btn @click="scrollTo(teiHeaderLine)" class="mr-2" small :disabled="teiHeaderLine < 0">&lt;teiHeader&gt;</v-btn>
      <v-btn @click="scrollTo(bodyLine)" class="mr-2" small :disabled="bodyLine < 0">&lt;body&gt;</v-btn>
      <v-btn @click="scrollTo(uLine)" class="mr-2" small v-if="uLine">Jump to utterance {{ element.aTopLineUId.split('_').slice(-1)[0] }}</v-btn>
    </div>
    <div class="xml-content flex-grow-1">
      <div ref="xmlScrollFrm" class="linescroll" v-on:scroll="scrolling">
        <div class="xml-prev" :style="'height: ' + (xmlLines.length * lineHeight) + 'px;'" v-if="xmlLines">
          <div ref="xmlviewarea" class="xml-viewarea px-3 py-1" :style="'top: ' + (lineTop * lineHeight) + 'px; min-width: ' + minWidth + 'px;'"
            v-if="xmlFormated"
            v-html="xmlFormated"
          />
        </div>
        <div ref="lineheight" class="xml-prev" style="color:#fff;">.</div>
      </div>
    </div>
  </div>
</template>

<script>
import renderer from '../functions/Renderer'

export default {
  name: 'CorpusElementXml',
  props: {
    'element': Object
  },
  data: () => ({
    lineHeight: 24,
    lineTop: 0,
    lineLenght: 100,
    minWidth: 100
  }),
  mounted () {
    // console.log(this.$refs, this.element)
    this.$nextTick(() => {
      this.loadScrollPos()
      this.lineHeight = this.$refs.lineheight.clientHeight
      if (this.lineHeight < 10) {
        this.lineHeight = 10
      }
    })
  },
  beforeDestroy () {
  },
  computed: {
    uLine () {
      return this.element.aTopLineUId ? this.findLine('xml:id="' + this.element.aTopLineUId + '"') : null
    },
    teiHeaderLine () {
      return this.findLine('<teiHeader>')
    },
    bodyLine () {
      return this.findLine('<body>')
    },
    xmlLines () {
      let xmlS = this.element && this.element.xml
      if (xmlS) {
        // let t1 = performance.now()
        xmlS = xmlS.replace(/\r?\n/g, '#lsp!lt#').split('#lsp!lt#')
        // console.log('xmlLines', performance.now() - t1)
        return xmlS
      }
      return null
    },
    xmlFormated () {
      if (this.xmlLines) {
        // let t1 = performance.now()
        let xmlF = renderer.w3CodeColor(this.xmlLines.slice(this.lineTop, this.lineTop + this.lineLenght).join('\n'))
        // console.log('xmlFormated - w3CodeColor', performance.now() - t1)
        return xmlF
      }
      return null
    }
  },
  methods: {
    findLine (s) {
      if (this.xmlLines) {
        s = s.toLowerCase()
        for (let i = 0; i < this.xmlLines.length; i++) {
          if (this.xmlLines[i].toLowerCase().indexOf(s) > -1) {
            return i * this.lineHeight
          }
        }
      }
      return -1
    },
    scrollTo (line) {
      this.$refs.xmlScrollFrm.scrollTop = line
    },
    scrolling (e) {
      let aTop = e.srcElement.scrollTop
      let aBottom = e.srcElement.scrollTop + e.srcElement.clientHeight
      this.element.scrollPos.xml = aTop
      if (this.$refs.xmlviewarea) {
        let aWidth = this.$refs.xmlviewarea.clientWidth
        if (this.minWidth < aWidth) {
          this.minWidth = aWidth
        }
      }
      let aTopLine = Math.floor(aTop / this.lineHeight)
      let aBottomLine = Math.ceil(aBottom / this.lineHeight)
      if (aTopLine <= this.lineTop) {
        this.lineTop = Math.floor(aTopLine - (this.lineLenght / 2 + (aBottomLine - aTopLine) / 2))
        if (this.lineTop < 0) {
          this.lineTop = 0
        }
      } else if (aBottomLine >= this.lineTop + this.lineLenght) {
        this.lineTop = Math.ceil(aTopLine - (this.lineLenght / 3))
        if (this.lineTop + this.lineLenght > this.xmlLines.length - 1) {
          this.lineTop = this.xmlLines.length - 1 - this.lineLenght
        }
      }
    },
    loadScrollPos () {
      if (this.$refs && this.$refs.xmlScrollFrm) {
        this.$refs.xmlScrollFrm.scrollTop = this.element.scrollPos.xml
      }
    }
  },
  watch: {
    'element.id' () {
      this.loadScrollPos()
    }
  },
  components: {
  }
}
</script>

<style scoped>
.v-btn {
  text-transform:none !important;
}
.xml-view {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
.xml-content {
  position: relative;
}
.xml-tools {
  border-bottom: solid 1px #ccc;
}
.xml-prev {
  font-family: Consolas, "Courier New", monospace;
  white-space: pre;
  position: relative;
}
.xml-viewarea {
  position: absolute;
  left: 0;
  top: 0;
  min-width: 100%;
  min-height: 10px;
}
.xml-prev >>> .tc {
  color: mediumblue;
}
.xml-prev >>> .tnc {
  color: brown;
}
.xml-prev >>> .ac {
  color: red;
}
.xml-prev >>> .avc {
  color: mediumblue;
}
.xml-prev >>> .cc {
  color: green;
}
</style>
