<template>
  <div ref="lineContent" :class="'rl-lc ' + classes" v-html="aText" data-testid="lineContent"></div>
</template>

<script>
import renderer from '../functions/Renderer'

export default {
  name: 'RenderLine',
  props: {
    'xmlObjLine': Object,
    'highlight': Map,
    'type': String,
    'mainData': Object
  },
  data: () => ({
    aText: '',
    aType: 'plain',
    xmlIdCache: {},
    shouldAddSpace: ''
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
    updateXmlObjLine () {
      if (this.xmlObjLine) {
        this.aType = this.type === 'xml' ? 'xml-view' : this.type || 'plain'
        // console.log(this.aType)
        if (!this.xmlObjLine[this.aType]) {
          this.$set(this.xmlObjLine, this.aType, null)
          let text = this.xmlObjLine.dom.textContent
          if (this.xmlObjLine.dom.childNodes && this.xmlObjLine.dom.childNodes.length > 0) {
            this.xmlIdCache = {}
            text = this.renderText(this.xmlObjLine.dom.childNodes)
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
        if (this.aType === 'xml-view') {
          let aXml = this.xmlObjLine.xml.split('\n')
          aXml = aXml.filter(l => l.trim().length > 0)
          let lS = aXml.length > 0 && aXml[aXml.length - 1] ? aXml[aXml.length - 1].search(/\S/) : -1
          if (lS > 0) {
            aXml = aXml.map((l, i) => i > 0 ? l.substring(lS) : l)
          }
          aTxt = renderer.w3CodeColor(aXml.join('\n'))
        } else {
        domArray.forEach((elm, idx, domArray) => {
          if (elm.nodeType === 1) { // ELEMENT_NODE
            let trimThis = !(elm.attributes && elm.attributes['xml:space'] && elm.attributes['xml:space'].value === 'preserve')
            let aClasses = ['tag-' + elm.tagName]
            let attrClasses = {'type': {}, 'n': { has: true }, 'voice:desc': {}, 'reason': {}, 'new': {}}
            if ((!elm.attributes['part'] || elm.attributes['part'].value === 'I') && this.shouldAddSpace === ' ') {
               aTxt += ' '
               this.shouldAddSpace = ''
            }
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
                if (this.highlight && elm.attributes['xml:id'] && elm.attributes['xml:id'].value && this.highlight.has(elm.attributes['xml:id'].value)) {
                aClasses.push('highlight')
              }
              if (elm.tagName === 'shift' && elm.attributes['new'] && elm.attributes['new'].value === 'neutral') {
                if (elm.attributes['corresp'] && elm.attributes['corresp'].value && this.xmlIdCache[elm.attributes['corresp'].value]) {
                  aClasses.push('neutral-' + this.xmlIdCache[elm.attributes['corresp'].value]) // new-laugh
                }
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
                aTxt += '<span class="fx-overlap">'
                if (elm.nextElementSibling && elm.nextElementSibling.tagName === 'seg') {
                  aTxt += ' '
                }
                aTxt += '&lt;'
                if (elm.attributes['n'] && elm.attributes['n'].value) {
                  aTxt += elm.attributes['n'].value
                } else {
                  console.log('overlap tags - No "n" attribute!!!!')
                }
                aTxt += '&gt;'
                if (!elm.previousElementSibling || (elm.previousElementSibling && elm.previousElementSibling.tagName === 'seg')) {
                  aTxt += ' '
                }
                aTxt += '</span>'
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
                aTxt += ') '
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
                aTxt += '&lt;'
                if (elm.attributes && elm.attributes['new']) {
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
                  if (elm.attributes['new'].value === 'neutral') {
                    if (elm.attributes['corresp'] && elm.attributes['corresp'].value && this.xmlIdCache[elm.attributes['corresp'].value]) {
                      aTxt += '/' + (nList[this.xmlIdCache[elm.attributes['corresp'].value]] || this.xmlIdCache[elm.attributes['corresp'].value].replace(/^([^_]+)_(.+)/, '$1 $2'))
                    } else {
                      aTxt += '/' + elm.attributes['new'].value.replace(/^([^_]+)_(.+)/, '$1 $2')
                    }
                  } else if (elm.attributes['new'].value === 'normal') {
                    aTxt += '/@'
                  } else if (elm.attributes['new'].value) {
                    if (elm.attributes['xml:id'] && elm.attributes['xml:id'].value) {
                      this.xmlIdCache['#' + elm.attributes['xml:id'].value] = elm.attributes['new'].value
                    }
                    aTxt += nList[elm.attributes['new'].value] || elm.attributes['new'].value.replace(/^([^_]+)_(.+)/, '$1 $2')
                  }
                }
                aTxt += '&gt; '
              }
              // vocal
              if (elm.tagName === 'vocal' && elm.attributes && elm.attributes['voice:desc'] && elm.attributes['voice:desc'].value !== 'laughing') {
                aTxt += '&lt;' + elm.attributes['voice:desc'].value + '&gt;'
              }
              // spel - before
              if (elm.attributes && elm.attributes['voice:mode'] && elm.attributes['voice:mode'] === 'spelt') {
                aTxt += '<span class="fx-spel"> &lt;spel&gt; </span>'
              }
              // foreign_tag - before
              if (elm.tagName === 'foreign' && elm.attributes && elm.attributes['voice:type'] && elm.attributes['xml:lang']) {
                aTxt += '<span class="fx-foreign"> &lt;' + elm.attributes['voice:type'].value + elm.attributes['xml:lang'].value + '&gt; </span>'
              }
              if (elm.attributes && elm.attributes['type'] && elm.attributes['type'].value === 'other_continuation') {
                aTxt += '<span class="fx-other-continuation">=</span>'
              }
              // unintelligible - before
              if (elm.tagName === 'supplied' && elm.attributes && elm.attributes['reason'] && elm.attributes['reason'].value === 'unintelligible') {
                aTxt += '<span class="fx-unintelligible-tag"> &lt;un&gt; </span>'
              }
              // ono - before
              if (elm.tagName === 'seg' && elm.attributes && elm.attributes['type'] && elm.attributes['type'].value === 'onomatopoeia') {
                aTxt += '<span class="fx-ono"> &lt;ono&gt; </span>'
              }
              // pvc - before
              if (elm.tagName === 'voice:pvc') {
                aTxt += '<span class="fx-pvct"> &lt;pvc&gt; </span>'
              }
              // unclear - before
              if (elm.tagName === 'unclear') {
                aTxt += '<span class="fx-unclear"> (</span>'
              }
            }
            if (elm.childNodes && elm.childNodes.length > 0 && (elm.childNodes.length > 1 || elm.childNodes[0].nodeType !== 3)) {
              aTxt +=  this.renderText(elm.childNodes, trimThis)
            } else {
              if (this.aType === 'voice' && elm.tagName === 'seg' && elm.attributes && elm.attributes['type'] && elm.attributes['type'].value === 'ws' && elm.parentElement.tagName === 'unclear' && (!elm.previousElementSibling || !elm.nextElementSibling)) {
                aTxt += ''
              } else if (elm.attributes && elm.attributes['voice:mode'] && elm.attributes['voice:mode'] === 'spelt' && elm.attributes['orig'] && elm.attributes['orig'].value) {
                aTxt += elm.attributes['orig'].value
              } else {
                let aTC = elm.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                if (!(elm.attributes && elm.attributes['type'] && elm.attributes['type'].value === 'ws')) {
                  aTC = aTC.trim()
                }
                aTxt += aTC
              }
            }
            // voice - layout
            if (this.aType === 'voice') {
              // overlap tags - after
              if (elm.tagName === 'seg' && elm.attributes && elm.attributes['type'] && elm.attributes['type'].value === 'overlap') {
                aTxt += '<span class="fx-overlap">'
                if (!elm.nextElementSibling || (elm.nextElementSibling && elm.nextElementSibling.tagName === 'seg')) {
                  aTxt += ' '
                }
                aTxt += '&lt;/'
                if (elm.attributes['n'] && elm.attributes['n'].value) {
                  aTxt += elm.attributes['n'].value
                }
                aTxt += '&gt;'
                if (elm.previousElementSibling && elm.previousElementSibling.tagName === 'seg') {
                  aTxt += ' '
                }
                aTxt += '</span>'
              }
              // spel - after
              if (elm.attributes && elm.attributes['voice:mode'] && elm.attributes['voice:mode'] === 'spelt') {
                aTxt += '<span class="fx-spel"> &lt;/spel&gt; </span>'
              }
              // foreign_tag - after
              if (elm.tagName === 'foreign' && elm.attributes && elm.attributes['voice:type'] && elm.attributes['xml:lang']) {
                if (elm.attributes['voice:translation']) {
                  aTxt += '<span class="fx-foreign-t"> {' + elm.attributes['voice:translation'].value + '} </span>'
                }
                aTxt += '<span class="fx-foreign"> &lt;/' + elm.attributes['voice:type'].value + elm.attributes['xml:lang'].value + '&gt; </span>'
              }
              // unintelligible - after
              if (elm.tagName === 'supplied' && elm.attributes && elm.attributes['reason'] && elm.attributes['reason'].value === 'unintelligible') {
                aTxt += '<span class="fx-unintelligible-tag"> &lt;/un&gt; </span>'
              }
              // ono - after
              if (elm.tagName === 'seg' && elm.attributes && elm.attributes['type'] && elm.attributes['type'].value === 'onomatopoeia') {
                aTxt += '<span class="fx-ono"> &lt;/ono&gt; </span>'
              }
              // pvc - after (before ipa)
              if (elm.tagName === 'voice:pvc' && elm.attributes && elm.attributes['comment']) {
                aTxt += '{' + elm.attributes['comment'].value + '}'
              }
              // ipa - after
              if (elm.attributes && elm.attributes['voice:ipa']) {
                aTxt += '<span class="tag-seg type-ipa"><span class="fx-ipa"> &lt;ipa&gt; </span>' + elm.attributes['voice:ipa'].value + '<span class="fx-ipa"> &lt;/ipa&gt; </span></span>'
              }
              // pvc - after
              if (elm.tagName === 'voice:pvc') {
                aTxt += '<span class="fx-pvct"> &lt;/pvc&gt; </span>'
              }
              // c - after
              if (elm.tagName === 'c' && elm.attributes && elm.attributes['type']) {
                if (elm.attributes['type'].value === 'lengthening') {
                  aTxt += ':'
                } else if (elm.attributes['type'].value === 'intonation') {
                  if (elm.attributes['function'] && elm.attributes['function'].value === 'fall') {
                    aTxt += '.'
                  } else if (elm.attributes['function'] && elm.attributes['function'].value === 'rise') {
                    aTxt += '?'
                  }
                }
              }
              // unclear - after
              if (elm.tagName === 'unclear') {
                aTxt += '<span class="fx-unclear">)</span>'
              }
            }
            aTxt += '</span>'
            if (elm.tagName === 'w') {
               if (!elm.attributes['part'] || elm.attributes['part'].value === 'F') {
               this.shouldAddSpace = ' '
            }}
          } else if (elm.nodeType === 3) { // TEXT_NODE
            let bTxt = elm.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()
            if (trimIt) {
              bTxt = bTxt.trim()
            }
            aTxt += bTxt
          }
        })
      }
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
    },
    'mainData.search.searched' () {
      this.$set(this.xmlObjLine, this.aType, null)
      this.updateXmlObjLine()
    }
  },
  components: {
  }
}
</script>

<style scoped>
</style>
