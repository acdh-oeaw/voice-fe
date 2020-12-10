<template>
  <div ref="lineContent" class="line-content" v-html="aText"></div>
</template>

<script>
export default {
  name: 'RenderLine',
  props: {
    'xmlObjLine': Object,
    'highlight': Array
  },
  data: () => ({
    aText: ''
  }),
  mounted () {
    // console.log('CorpusElementViews', this.xmlObjLine)
    this.updateXmlObjLine()
  },
  beforeDestroy () {
  },
  computed: {
  },
  methods: {
    updateXmlObjLine () {
      if (this.xmlObjLine) {
        this.$set(this.xmlObjLine, 'text', null)
        if (!this.xmlObjLine.text) {
          let text = this.xmlObjLine.dom.textContent
          if (this.xmlObjLine.dom.childNodes && this.xmlObjLine.dom.childNodes.length > 0) {
            text = this.renderText(this.xmlObjLine.dom.childNodes)
          }
          this.$set(this.xmlObjLine, 'text', text)
        }
        this.aText = this.xmlObjLine.text
        this.$nextTick(() => {
          if (this.$refs && this.$refs.lineContent) {
            this.$set(this.xmlObjLine, 'textHeight', this.$refs.lineContent.clientHeight)
          }
        })
      }
    },
    renderText (dom, trimIt=true) {
      let domArray = [].slice.call(dom)
      let aTxt = ''
      if (domArray && domArray.length > 0) {
        domArray.forEach(elm => {
          if (elm.nodeType === 1) {
            let trimThis = !(elm.attributes && elm.attributes['xml:space'] && elm.attributes['xml:space'].value === 'preserve')
            let aClasses = ['tag-' + elm.tagName]
            let attrClasses = {'type': {}, 'n': { has: true }, 'voice:desc': {}, 'voice:syl': {}}
            if (elm.attributes) {
              Object.keys(attrClasses).forEach(a => {
                if (elm.attributes[a] && elm.attributes[a].value) {
                  let cn = a.replace(/:/g, '-')
                  aClasses.push(cn + '-' + elm.attributes[a].value)
                  if (attrClasses[a].has) {
                    aClasses.push('has-'+ cn)
                  }
                }
              })
              if (this.highlight && elm.attributes['xml:id'] && elm.attributes['xml:id'].value && this.highlight.indexOf(elm.attributes['xml:id'].value) > -1) {
                aClasses.push('highlight')
              }
            }
            aTxt += '<span class="' + aClasses.join(' ') + '">'
            if (elm.attributes && elm.attributes['voice:syl'] && elm.attributes['voice:syl'].value) {
              aTxt += '@'.repeat(parseInt(elm.attributes['voice:syl'].value))
            }
            aTxt += elm.childNodes && elm.childNodes.length > 0 ? this.renderText(elm.childNodes, trimThis) : elm.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            aTxt += '</span>'
          } else if (elm.nodeType === 3) {
            let bTxt = elm.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            if (trimIt) {
              bTxt = bTxt.trim()
            }
            aTxt += bTxt
          }
        })
      }
      return aTxt
    }
  },
  watch: {
    xmlObjLine () {
      this.updateXmlObjLine()
    },
    highlight () {
      this.updateXmlObjLine()
    }
  },
  components: {
  }
}
</script>

<style scoped>
.line-content >>> .has-n {
  color: #00f;
}
.line-content >>> .highlight {
  background: #ff0;
}
.line-content >>> .tag-parsererror {
  color: #d00;
  font-weight: bold;
}
</style>
