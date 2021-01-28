<template>
  <div ref="lineContent" :class="classes" v-html="aText"></div>
</template>

<script>
export default {
  name: 'RenderLine',
  props: {
    'xmlObjLine': Object,
    'highlight': Array,
    'type': String,
    'mainData': Object
  },
  data: () => ({
    aText: '',
    aType: 'plain',
    xmlIdCache: {}
  }),
  mounted () {
    // console.log('CorpusElementViews', this.xmlObjLine)
    this.updateXmlObjLine()
  },
  beforeDestroy () {
  },
  computed: {
    classes () {
      let aClasses = 'line-con typ-' + this.aType
      if (this.aType === 'voice') {
        if (this.mainData.views.voice.p) { aClasses += ' s-p' }
        if (this.mainData.views.voice.oT) { aClasses += ' s-ot' }
        if (this.mainData.views.voice.cE) { aClasses += ' s-ce' }
        if (this.mainData.views.voice.sM) { aClasses += ' s-sm' }
      }
      return aClasses
    }
  },
  methods: {
    updateXmlObjLine () {
      if (this.xmlObjLine) {
        this.aType = this.type || 'plain'
        // console.log(this.aType)
        if (!this.xmlObjLine[this.aType]) {
          this.$set(this.xmlObjLine, this.aType, null)
          let text = this.xmlObjLine.dom.textContent
          if (this.xmlObjLine.dom.childNodes && this.xmlObjLine.dom.childNodes.length > 0) {
            this.xmlIdCache = {}
            text = this.renderText(this.xmlObjLine.dom.childNodes)
            // console.log(this.xmlIdCache)
          }
          this.$set(this.xmlObjLine, this.aType, text)
        }
        this.aText = this.xmlObjLine[this.aType]
        this.$nextTick(() => {
          if (this.$refs && this.$refs.lineContent) {
            // ToDo: textHeight (plain, voice, usw.)
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
            let attrClasses = {'type': {}, 'n': { has: true }}
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
            // voice - layout
            if (this.aType === 'voice') {
              // overlap tags - before
              if (elm.tagName === 'seg' && elm.attributes && elm.attributes['type'] && elm.attributes['type'].value === 'overlap') {
                aTxt += '<span class="fx-overlap"> &lt;'
                if (elm.attributes['n'] && elm.attributes['n'].value) {
                  aTxt += elm.attributes['n'].value
                } else {
                  console.log('overlap tags - No "n" attribute!!!!')
                }
                aTxt += '&gt; </span>'
              }
              // pause
              if (elm.tagName === 'pause') {
                aTxt += ' ('
                if (elm.attributes && elm.attributes['dur'] && elm.attributes['dur'].value && typeof elm.attributes['dur'].value === 'string') {
                  let aM = elm.attributes['dur'].value.match(/PT(.+)S/i)
                  aTxt += (aM && aM[1]) ? aM[1] : '.'
                } else {
                  aTxt += '.'
                }
                aTxt += ')'
              }
              // contextual events
              if (elm.tagName === 'incident') {
                aTxt += ' {' + (elm.attributes && elm.attributes['voice:desc'] && elm.attributes['voice:desc'].value ? elm.attributes && elm.attributes['voice:desc'] && elm.attributes['voice:desc'].value : '');
                if (elm.attributes && elm.attributes['dur'] && elm.attributes['dur'].value && typeof elm.attributes['dur'].value === 'string') {
                  let aM = elm.attributes['dur'].value.match(/PT(.+)S/i)
                  aTxt += ' (' + ((aM && aM[1]) ? aM[1] : '.') + ')'
                }
                aTxt += '} '
              }
              // speaking modes
              if (elm.tagName === 'shift') {
                aTxt += ' &lt;'
                if (elm.attributes && elm.attributes['new']) {
                  if (elm.attributes['new'].value === 'neutral') {
                    if (elm.attributes['corresp'] && elm.attributes['corresp'].value && this.xmlIdCache[elm.attributes['corresp'].value]) {
                      aTxt += '/' + this.xmlIdCache[elm.attributes['corresp'].value]
                    } else {
                      aTxt += '/' + elm.attributes['new'].value
                    }
                  } else if (elm.attributes['new'].value === 'normal') {
                    aTxt += '/@'
                  } else if (elm.attributes['new'].value) {
                    let nList = {
                      'laugh': '@',
                      'p': 'soft',
                      'l': 'slow',
                      'f': 'loud',
                      'whisp': 'whispering',
                      'sigh': 'sighing',
                      'phone': 'on phone',
                      'reading': 'reading',
                      'a': 'fast'
                    }
                    let aVal = nList[elm.attributes['new'].value] || elm.attributes['new'].value
                    if (elm.attributes['xml:id'] && elm.attributes['xml:id'].value) {
                      this.xmlIdCache['#' + elm.attributes['xml:id'].value] = aVal
                    }
                    aTxt += aVal
                  }
                }
                aTxt += '&gt; '
              }
            }
            aTxt += elm.childNodes && elm.childNodes.length > 0 ? this.renderText(elm.childNodes, trimThis) : elm.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            // voice - layout
            if (this.aType === 'voice') {
              // overlap tags - after
              if (elm.tagName === 'seg' && elm.attributes && elm.attributes['type'] && elm.attributes['type'].value === 'overlap') {
                  aTxt += '<span class="fx-overlap"> &lt;/'
                  if (elm.attributes['n'] && elm.attributes['n'].value) {
                    aTxt += elm.attributes['n'].value
                  }
                  aTxt += '&gt; </span>'
              }
            }
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
    type () {
      this.updateXmlObjLine()
    },
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
.line-con >>> .highlight {
  background: #ff0;
}
.line-con >>> .tag-parsererror {
  color: #d00;
  font-weight: bold;
}

/* Voice */
.line-con.typ-voice >>> .fx-overlap {
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
.line-con.typ-voice:not(.s-sm) >>> .tag-shift {
  display: none;
}

/* Plain */
.line-con.typ-plain >>> .has-n {
  color: #00f;
}
/* Pos */
</style>
