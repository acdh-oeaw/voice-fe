<template>
  <div ref="main">
    <template v-if="xmlObjLines">
      <div ref="lines"
        v-for="(uObj, uIdx) in searchResultsU" class="line-frm" :key="uObj.idx + '-' + uIdx"
        :data-uid="uIdx"
        :style="inView.indexOf(uIdx) === -1 && xmlObjLines[uObj.idx] ? 'min-height:' + xmlObjLines[uObj.idx][(mainData.search.view.kwic && mainData.search.view.type !== 'xml-view' ? 'kwic' : view) + 'Height'] + 'px;' : null"
      >
        <div @click="openDocument(uObj.xmlId)" class="line-document" v-if="uIdx < 1 || uObj.xmlId !== searchResultsU[uIdx-1].xmlId">
          {{ uObj.xmlId }}
        </div>
        <div :class="'d-flex' + (mainData.search.view.type === 'xml-view' ? ' flex-wrap' : '')" v-if="xmlObjLines">
          <div class="line-uid pr-6" v-if="show_utI">
            <button @click="goToUtterance(uObj.uId)" class="c-uid">{{ uObj.uId.split('_')[0] + ':' + uObj.uId.split('_')[2] }}</button>
            <span class="u-hits" title="Hits">{{ uObj.hits.length }}</span>
          </div>
          <div class="line-jump" v-else>
            <button @click="goToUtterance(uObj.uId)" class="c-uid jump-btn"></button>
          </div>
          <template v-if="!xmlObjLines[uObj.idx].uObj.loading">
            <div class="line-speaker" v-if="xmlObjLines[uObj.idx].uObj.obj.attributes && xmlObjLines[uObj.idx].uObj.obj.attributes.who"><button @click="showSpeaker(uObj)">{{ xmlObjLines[uObj.idx].uObj.obj.attributes.who.split('_').slice(-1)[0] }}</button></div>
            <button @click="editBookmark(uObj.uId, $event)" v-if="mainData.bookmarks.active && mainData.search.view.type === 'xml-view'" :class="'ml-auto bookmark' + (Object.keys(mainData.bookmarks.elements).indexOf(uObj.uId) > -1 ? '-check' : '') + (shiftKeyDown ? ' bookmark-fast' : '')"></button>
            <div class="flex-break" v-if="mainData.search.view.type === 'xml-view'"></div>
            <template v-if="inView.indexOf(uIdx) > - 1">
              <div class="kwic-frm flex-grow-1" v-if="mainData.search.view.kwic && mainData.search.view.type !== 'xml-view'">
                <div v-html="xmlObjLines[uObj.idx][view]" :class="classes" :data-highlighted="'#s_' + h.join(',#s_')" v-for="h in uObj.hits" :key="'h' + h"></div>
              </div>
              <div v-html="xmlObjLines[uObj.idx][view]" :class="'flex-grow-1 ' + classes" v-else></div>
            </template>
            <div :class="'flex-grow-1 ' + (mainData.search.view.kwic && mainData.search.view.type !== 'xml-view' ? 'kwic-prev' : null)" v-else>{{ xmlObjLines[uObj.idx].uObj.obj.text }}</div>
          </template>
          <div class="line-loading flex-grow-1" v-else>
            Loading ...
          </div>
          <button @click="editBookmark(uObj.uId, $event)" v-if="mainData.bookmarks.active && mainData.search.view.type !== 'xml-view'" :class="'bookmark' + (Object.keys(mainData.bookmarks.elements).indexOf(uObj.uId) > -1 ? '-check' : '') + (shiftKeyDown ? ' bookmark-fast' : '')"></button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import renderer from '../functions/Renderer'
import bookmarks from '../functions/Bookmarks'

export default {
  name: 'SearchResultsView',
  props: {
    'mainData': Object,
    'filteredSearchResults': Array,
    'scrollerRef': HTMLDivElement,
    'view': String,
    'downloadSearchResults': Object
  },
  data: () => ({
    xmlObjLines: null,
    lastParsedLine: 0,
    inView: [],
    loadingNext: false,
    scrollTop: 0,
    clientHeight: 800,
    shiftKeyDown: false
  }),
  created () {
    window.addEventListener('keydown', this.keyDown)
    window.addEventListener('keyup', this.keyUp)
  },
  beforeDestroy () {
    window.removeEventListener('keydown', this.keyDown)
    window.removeEventListener('keyup', this.keyUp)
  },
  mounted () {
    this.updateXmlObjLines()
    this.$nextTick(() => {
      this.loadScrollPos()
      this.scrolling()
    })
  },
  computed: {
    loadList () {
      return this.filteredSearchResults.slice(this.lastParsedLine, this.lastParsedLine + (this.downloadSearchResults ? 400 : 100)).filter(u => this.xmlObjLines[u.idx].uObj.loading).map(u => u.uId)
    },
    searchResultsU () {
      return this.filteredSearchResults.slice(0, this.lastParsedLine + 10)
    },
    show_utI () {
      let show = true
      Object.keys(this.mainData.search.view.views).some(v => {
        if (this.view === v) {
          show = !this.mainData.search.view.views[v].utI || this.mainData.search.view.views[v].utI.val
        }
      })
      return show
    },
    classes () {
      let aClasses = 'line-con typ-' + this.view
      Object.keys(this.mainData.search.view.views).some(v => {
        if (this.view === v) {
          Object.keys(this.mainData.search.view.views[v]).forEach(vo => {
            if (this.mainData.search.view.views[v][vo].val) {
              aClasses += ' s-' + vo.toLowerCase()
            }
          })
          return true
        }
      })
      return aClasses
    }
  },
  methods: {
    editBookmark (uId, e) {
      bookmarks.editBookmark(this, this.mainData.bookmarks, uId, e.shiftKey)
    },
    keyDown (e) {
      if (e.key === 'Shift') {
        this.shiftKeyDown = true
      }
    },
    keyUp (e) {
      if (e.key === 'Shift') {
        this.shiftKeyDown = false
      }
    },
    updateLastParsedLine () {
      this.lastParsedLine = 0
      this.filteredSearchResults.some(u => {
        if (this.xmlObjLines[u.idx].uObj.loading) {
          return true
        }
        this.lastParsedLine += 1
      })
    },
    showSpeaker (l) {
      // console.log(l.xmlId, this.xmlObjLines[l.idx].uObj.obj.attributes.who.split('_').slice(-1)[0])
      this.mainData.showSpeaker = {id: l.xmlId, speaker: this.xmlObjLines[l.idx].uObj.obj.attributes.who.split('_').slice(-1)[0]}
    },
    goToUtterance (u) {
      this.$emit('goToUtterance', u)
    },
    scrollEvent (e) {
      this.scrollTop = e.srcElement.scrollTop || 0
      this.clientHeight = e.srcElement.clientHeight || 500
      this.scrolling()
    },
    scrolling () {
      let vT = this.scrollTop
      let vH = this.clientHeight
      this.mainData.search.scrollPos = vT
      this.inView = []
      if (this.$refs.lines) {
        this.$refs.lines.forEach((line) => {
          let aH = line.offsetHeight || 0
          let aT = line.offsetTop
          if (aT + aH >= vT && aT <= vT + vH) {
            if (line.dataset && line.dataset.uid) {
              let uId = parseInt(line.dataset.uid)
              if (this.searchResultsU[uId]) {
                let aU = this.xmlObjLines[this.searchResultsU[uId].idx]
                if ((!this.mainData.search.view.kwic || this.mainData.search.view.type === 'xml-view') && aU[this.view + 'Height'] !== aH) {
                  aU[this.view + 'Height'] = aH
                }
                if (aU.uObj.loading) {
                  this.loadNext()
                } else if (!aU[this.view]) {
                  aU[this.view] = renderer.renderUtterance(aU.uObj.obj, {...aU.uObj, xml: aU.uObj.obj.xml}, this.view, this.mainData.search.highlights, true)
                }
                if (this.mainData.search.view.kwic && this.mainData.search.view.type !== 'xml-view') {
                  this.$nextTick(() => {
                    [].forEach.call(line.querySelectorAll('.kwic-frm > div'), function(div) {
                      if (div.dataset && div.dataset.highlighted) {
                        let hitTags = div.querySelectorAll(div.dataset.highlighted)
                        if (hitTags.length > 0) {
                          let frmHalfWidth = div.offsetWidth / 2
                          let hitMiddle = hitTags[0].offsetLeft
                          for (let hit of hitTags.entries()) {
                            hitMiddle += hit[1].offsetWidth / 2
                          }
                          div.style.left = parseInt(frmHalfWidth - hitMiddle) + 'px'
                        } else {
                          div.style.left = ''
                        }
                      }
                    })
                    if (aU['kwicHeight'] !== line.offsetHeight || 0) {
                      aU['kwicHeight'] = line.offsetHeight || 0
                    }
                  })
                }
                this.inView.push(uId)
              }
            }
          }
        })
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
            kwicHeight: 24,
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
      this.updateLastParsedLine()
    },
    loadScrollPos () {
      if (this.scrollerRef) {
        this.scrollerRef.scrollTop = this.mainData.search.scrollPos
      }
    },
    loadNext () {
      if (!this.loadingNext) {
        this.updateLastParsedLine()
        // console.log('loadNext ->', this.loadingNext, this.lastParsedLine, JSON.parse(JSON.stringify(this.filteredSearchResults)), loadList)
        if (this.loadList.length > 0) {
          this.loadingNext = true
          this.$http
            .get(this.mainData.apiUrl + 'xml/*/uid/' + this.loadList.join(';'))
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
              this.updateLastParsedLine()
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
    'filteredSearchResults' () {
      this.updateLastParsedLine()
      this.scrolling()
    },
    'mainData.search.results': {
      deep: true,
      handler() {
        this.updateXmlObjLines()
      }
    },
    view () {
      this.updateLastParsedLine()
      this.$nextTick(() => {
        this.scrolling()
      })
    },
    'mainData.search.view.kwic' () {
      this.updateLastParsedLine()
      this.$nextTick(() => {
        this.scrolling()
      })
    },
    'mainData.search.view.views': {
      deep: true,
      handler() {
        this.updateLastParsedLine()
        this.$nextTick(() => {
          this.scrolling()
        })
      }
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
  position: relative;
  min-width: 8.5rem;
}
.line-jump {
  min-width: 2rem;
  height: 24px;
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
  display: block;
  text-align: center;
  border-radius: 7px;
  background: #eee;
  height: 14px;
  min-width: 14px;
  position: absolute;
  right: 5px;
  top: 4px;
  color: #666;
  padding: 0 3px;
}

</style>
