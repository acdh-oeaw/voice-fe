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
        if (this.mainData.views.voice.vsN) { aClasses += ' s-vsn' }
        if (this.mainData.views.voice.spl) { aClasses += ' s-spl' }
        if (this.mainData.views.voice.fLaT) { aClasses += ' s-flat' }
        if (this.mainData.views.voice.oC) { aClasses += ' s-oc' }
        if (this.mainData.views.voice.uiT) { aClasses += ' s-uit' }
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
          if (elm.nodeType === 1) { // ELEMENT_NODE
            let trimThis = !(elm.attributes && elm.attributes['xml:space'] && elm.attributes['xml:space'].value === 'preserve')
            let aClasses = ['tag-' + elm.tagName]
            let attrClasses = {'type': {}, 'n': { has: true }, 'voice:desc': {}, 'reason': {}}
            if (elm.attributes) {
              Object.keys(attrClasses).forEach(a => {
                if (elm.attributes[a] && elm.attributes[a].value) {
                  let cn = a.replace(/:/g, '-')
                  aClasses.push(cn + '-' + elm.attributes[a].value.replace(/\s/gm, '-'))
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
              // vocal
              if (elm.tagName === 'vocal' && elm.attributes && elm.attributes['voice:desc'] && elm.attributes['voice:desc'].value !== 'laughing') {
                aTxt += '&lt;' + elm.attributes['voice:desc'].value + '&gt;'
              }
              // spel - before
              if (elm.attributes && elm.attributes['spelt_orig']) {
                aTxt += '<span class="fx-spel"> &lt;spel&gt; </span>'
              }
              // foreign_tag - before
              if (elm.tagName === 'foreign' && elm.attributes && elm.attributes['type'] && elm.attributes['xml:lang']) {
                aTxt += '<span class="fx-foreign"> &lt;' + elm.attributes['type'].value + elm.attributes['xml:lang'].value + '&gt; </span>'
              }
              if (elm.attributes && elm.attributes['type'] && elm.attributes['type'].value === 'other_continuation') {
                aTxt += '<span class="fx-other-continuation"> = </span>'
              }
              // unintelligible - before
              if (elm.tagName === 'supplied' && elm.attributes && elm.attributes['reason'] && elm.attributes['reason'].value === 'unintelligible') {
                aTxt += '<span class="fx-unintelligible-tag"> &lt;un&gt; </span>'
              }
              }
            }
            if (elm.childNodes && elm.childNodes.length > 0 && (elm.childNodes.length > 1 || elm.childNodes[0].nodeType !== 3)) {
              aTxt +=  this.renderText(elm.childNodes, trimThis)
            } else {
              if (elm.tagName === 'w') {
                console.log(elm.attributes)
              }
              if (elm.attributes && elm.attributes['spelt_orig'] && elm.attributes['spelt_orig'].value) {
                aTxt += elm.attributes['spelt_orig'].value
              } else {
                aTxt += elm.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
              }
            }
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
              // spel - after
              if (elm.attributes && elm.attributes['spelt_orig']) {
                aTxt += '<span class="fx-spel"> &lt;/spel&gt; </span>'
              }
              // foreign_tag - after
              if (elm.tagName === 'foreign' && elm.attributes && elm.attributes['type'] && elm.attributes['xml:lang']) {
                if (elm.attributes['voice:translation']) {
                  aTxt += '<span class="fx-foreign-t"> {' + elm.attributes['voice:translation'].value + '} </span>'
                }
                aTxt += '<span class="fx-foreign"> &lt;/' + elm.attributes['type'].value + elm.attributes['xml:lang'].value + '&gt; </span>'
              }
              // unintelligible - after
              if (elm.tagName === 'supplied' && elm.attributes && elm.attributes['reason'] && elm.attributes['reason'].value === 'unintelligible') {
                aTxt += '<span class="fx-unintelligible-tag"> &lt;/un&gt; </span>'
              }
              }
            }
            aTxt += '</span>'
          } else if (elm.nodeType === 3) { // TEXT_NODE
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
.line-con.typ-voice >>> .fx-overlap, .line-con.typ-voice >>> .type-overlap {
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

.line-con.typ-voice >>> .tag-vocal {
  color: #AA0066;
}
.line-con.typ-voice:not(.s-vsn) >>> .tag-vocal {
  display: none;
}

.line-con.typ-voice >>> .fx-spel {
  color: #AA0066;
}
.line-con.typ-voice:not(.s-spl) >>> .fx-spel {
  display: none;
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

/* Plain */
.line-con.typ-plain >>> .has-n {
  color: #00f;
}
/* Pos */
</style>
