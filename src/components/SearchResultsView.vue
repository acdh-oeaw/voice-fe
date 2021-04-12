<template>
  <div ref="main">
    <template v-if="xmlObjLines">
      <div ref="lines"
        v-for="(uObj, uIdx) in searchResultsU" class="line-frm" :key="uObj.idx + '-' + uIdx"
        :data-uid="uIdx"
        :style="inView.indexOf(uIdx) === -1 && xmlObjLines[uObj.idx] ? 'min-height:' + xmlObjLines[uObj.idx][view + 'Height'] + 'px;' : null"
      >
        <div @click="openDocument(uObj.xmlId)" class="line-document" v-if="uIdx < 1 || uObj.xmlId !== searchResultsU[uIdx-1].xmlId">
          {{ uObj.xmlId }}
        </div>
        <div :class="'d-flex' + (mainData.search.view.type === 'xml-view' ? ' flex-wrap' : '')" v-if="xmlObjLines">
          <div class="line-uid" v-if="show_utI"><button @click="goToUtterance(uObj.uId)" class="c-uid">{{ uObj.uId.split('_')[0] + ':' + uObj.uId.split('_')[2] }}</button> <span class="u-hits">Hits:<br/>{{uObj.hits}}</span></div>
          <template v-if="!xmlObjLines[uObj.idx].uObj.loading">
            <div class="line-speaker" v-if="xmlObjLines[uObj.idx].uObj.obj.attributes && xmlObjLines[uObj.idx].uObj.obj.attributes.who">{{ xmlObjLines[uObj.idx].uObj.obj.attributes.who.split('_').slice(-1)[0] }}</div>
            <div class="flex-break" v-if="mainData.search.view.type === 'xml-view'"></div>
            <div v-if="inView.indexOf(uIdx) > - 1" v-html="xmlObjLines[uObj.idx][view]" :class="classes"></div>
            <div v-else>{{ xmlObjLines[uObj.idx].uObj.obj.text }}</div>
          </template>
          <div class="line-loading" v-else>
            Loading ...
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import renderer from '../functions/Renderer'

export default {
  name: 'SearchResultsView',
  props: {
    'mainData': Object,
    'filteredSearchResults': Array,
    'scrollerRef': HTMLDivElement,
    'view': String
  },
  data: () => ({
    xmlObjLines: null,
    lastParsedLine: 0,
    inView: [],
    loadingNext: false
  }),
  mounted () {
    this.updateXmlObjLines()
    this.$nextTick(() => {
      this.loadScrollPos()
      this.scrolling()
    })
    if (this.scrollerRef) {
      this.scrollerRef.addEventListener('scroll', this.scrolling)
    }
  },
  beforeDestroy () {
    if (this.scrollerRef) {
      this.scrollerRef.removeEventListener('scroll', this.scrolling)
    }
  },
  computed: {
    searchResultsU () {
      return this.filteredSearchResults.slice(0, this.lastParsedLine + 10)
    },
    show_utI () {
      return this.mainData.search.view.type !== 'voice' || this.mainData.views.voice.utI.val
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
    goToUtterance (u) {
      this.$emit('goToUtterance', u)
    },
    scrolling () {
      if (this.scrollerRef) {
        let vT = this.scrollerRef.scrollTop
        let vH = this.scrollerRef.clientHeight
        this.mainData.search.scrollPos = vT
        this.inView = []
        if (this.$refs.lines) {
          this.$refs.lines.forEach((line) => {
            let aH = line.offsetHeight || 0
            let aT = line.offsetTop
            if (aT + aH >= vT && aT <= vT + vH) {
              if (line.dataset && line.dataset.uid) {
                let uId = parseInt(line.dataset.uid)
                let aU = this.xmlObjLines[uId]
                if (aU[this.view + 'Height'] !== aH) {
                  aU[this.view + 'Height'] = aH
                }
                if (aU.uObj.loading) {
                  this.loadNext()
                } else if (!aU[this.view]) {
                  aU[this.view] = renderer.renderUtterance(aU.uObj.obj, {...aU.uObj, xml: aU.uObj.obj.xml}, this.view, this.mainData.search.highlights)
                }
                this.inView.push(uId)
              }
            }
          })
        }
      }
    },
    openDocument (xmlId) {
      console.log('openDocument', xmlId)
      this.mainData.corpus.selectedElement = xmlId
      if (xmlId) {
        this.mainData.options.singleView = 'corpus'
        if (this.mainData.corpus.elements.filter(e => e.id === xmlId).length === 0) {
          if (this.mainData.corpus.obj[xmlId]) {
            this.$set(this.mainData.corpus.obj[xmlId], 'open', true)
            this.mainData.corpus.elements.unshift(this.mainData.corpus.obj[xmlId])
          }
        }
      }
    },
    updateXmlObjLines () {
      this.xmlObjLines = null
      this.lastParsedLine = 0
      if (this.mainData.search.results && this.mainData.search.results.u && this.mainData.search.results.u.length > 0) {
        // console.log('SearchResults - updateXmlObjLines', this.mainData.search.results.u)
        let aLines = this.mainData.search.results.u.map((aU, i) => {
          let uObj = {
            loading: true,
            obj: {},
            list: []
          }
          Object.seal(uObj)
          Object.preventExtensions(uObj)
          if (typeof aU.xml === 'string' && aU.xml.length > 5) {
            this.mainData.corpus.saxParserFunc.parseIt(aU.xml, null, null, uObj)
            this.deepSeal(uObj)
            this.lastParsedLine = i
          }
          const ret = {
            uId: aU.uId,
            xml: aU.xml,
            uObj,
            voice: null,
            voiceHeight: 24,
            plain: null,
            plainHeight: 24,
            pos: null,
            posHeight: 24,
            'xml-view': null,
            'xml-viewHeight': 300
          }
          Object.seal(ret)
          Object.preventExtensions(ret)
          return ret
        })
        Object.seal(aLines)
        this.xmlObjLines = aLines
      }
    },
    loadScrollPos () {
      if (this.scrollerRef) {
        this.scrollerRef.scrollTop = this.mainData.search.scrollPos
      }
    },
    loadNext () {
      if (!this.loadingNext) {
        let loadList = this.filteredSearchResults.slice(this.lastParsedLine + 1, this.lastParsedLine + 101).map(u => u.uId)
        if (loadList.length > 0) {
          this.loadingNext = true
          this.$http
            .get(this.mainData.apiUrl + 'xml/*/uid/' + loadList.join(';'))
            .then((response) => {
              if (response.data && response.data.u) {
                response.data.u.forEach(aU => {
                  let xolObj = null
                  this.xmlObjLines.some(xol => {
                    if (xol.uId === aU.uId) {
                      xolObj = xol
                      return true
                    }
                  })
                  if (xolObj) {
                    if (typeof aU.xml === 'string' && aU.xml.length > 5) {
                      let uObj = {
                        loading: true,
                        obj: {},
                        list: []
                      }
                      this.mainData.corpus.saxParserFunc.parseIt(aU.xml, null, null, uObj)
                      this.deepSeal(uObj)
                      xolObj.xml = aU.xml
                      Object.seal(xolObj.xml)
                      Object.preventExtensions(xolObj.xml)
                      xolObj.uObj = uObj
                    }
                  }
                })
              }
              this.lastParsedLine += 100
              this.$nextTick(() => {
                this.scrolling()
                this.loadingNext = false
              })
            })
            .catch((err) => {
              console.log(err)
              this.mainData.search.errors.push({ status: err.status, txt: err.body.error, q: err.body.query })
              this.loadingNext = false
            })
        }
      }
    },
    deepSeal (o) {
      const self = this
      Object.seal(o)
      Object.preventExtensions(o)
      if (o === undefined) {
        return o
      }
      Object.getOwnPropertyNames(o).forEach(function (prop) {
        if (
          o[prop] !== null &&
          (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
          !Object.isSealed(o[prop])
        ) {
          self.deepSeal(o[prop])
        }
      })
      return o
    }
  },
  watch: {
    'mainData.search.results': {
      deep: true,
      handler() {
        this.updateXmlObjLines()
      }
    },
    view () {
      this.scrolling()
    }
  },
  components: {
  }
}
</script>

<style scoped>
.line-frm {
  border-top: 1px solid #ddd;
  padding: 2px 0.5rem;
}
.line-frm:last-child {
  border-bottom: 1px solid #ddd;
}
.line-document {
  background: #eee;
  margin: -2px -0.5rem 3px -0.5rem;
  padding: 0 0.5rem 0 0.5rem;
  font-weight: bold;
  cursor: pointer;
}
.line-document:hover, .line-document:focus {
  background: #eef;
}
.line-uid {
  min-width: 8.5rem;
}
.c-uid {
  cursor: pointer;
}
.c-uid:hover, .c-uid:focus {
  background: #eef;
}
.line-speaker {
  min-width: 4rem;
  font-weight: bold;
}
.line-loading {
  flex-grow: 1;
  background: #f1f3ff;
  padding: 0 4px;
  font-style: italic;
}
.u-hits {
  font-size: xx-small;
  display: inline-block;
  text-align: center;
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
