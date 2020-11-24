<template>
  <div class="flex-grow-1 d-flex flex-column">
    <div class="flex-grow-1 d-flex flex-column">
      <v-tabs v-model="vTab" grow height="30" class="flex-shrink-1 fx-bb">
        <v-tab href="#textheader">Text Header</v-tab>
        <v-tab href="#voice">voice</v-tab>
        <v-tab href="#plain">plain</v-tab>
        <v-tab href="#pos">PoS</v-tab>
        <v-tab href="#xml">XML</v-tab>
      </v-tabs>
      <div class="px-3 py-2 scroll-content flex-grow-1">
        <div>
          VOICE - {{ vTab }}<br>
          {{ aElement ? aElement.id : 'Kein Element ausgewählt ...'}}
          <div style="font-family: Consolas, 'Courier New', monospace; white-space: pre;" v-if="vTab === 'xml' && xmlFormated">
            <div
              v-for="(aLine, aIdx) in xmlFormated.slice(0, 50)"
              :key="'xmll' + aIdx"
              v-html="aLine"
            />
          </div>
          <code v-if="aElement" style="display: block; white-space: pre-wrap;">{{ aElementDev }}</code>
        </div>
      </div>
    </div>
    <Audioplayer class="fx-bt" :audiourl="aAudioUrl" v-if="!refreshAudio && aAudioUrl" />
  </div>
</template>

<script>
import Audioplayer from './Audioplayer';

export default {
  name: 'CorpusElement',
  props: {
    'mainData': Object
  },
  data: () => ({
    vTab: 0,
    refreshAudio: false
  }),
  mounted () {
    console.log('CorpusElement', this.mainData)
  },
  computed: {
    aAudioUrl () {
      return this.aElement && this.aElement.audioAvailable && this.aElement.refs && this.aElement.refs.audio
    },
    aElement () {
      return this.mainData.corpus.selectedElement && this.mainData.corpus.obj[this.mainData.corpus.selectedElement]
    },
    aElementDev () {
      let aElDev = {}
      Object.keys(this.aElement).forEach(p => {
        aElDev[p] = (p === 'xml' || p === 'header') ? ('size ' + this.aElement[p].length.toLocaleString() + ' Byte') : this.aElement[p]
      })
      return aElDev
    },
    xmlFormated () {
      return this.aElement && this.aElement.xml && this.w3CodeColor(this.aElement.xml).split(/\r?\n/)
    }
  },
  methods: {
    w3CodeColor(elmntTxt) {
      var tagcolor = "mediumblue";
      var tagnamecolor = "brown";
      var attributecolor = "red";
      var attributevaluecolor = "mediumblue";
      var commentcolor = "green";
      elmntTxt = elmntTxt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      console.log({x: elmntTxt})
      elmntTxt = htmlMode(elmntTxt);
      return elmntTxt;

      function extract(str, start, end, func, repl) {
        var s, e, d = "", a = [];
        while (str.search(start) > -1) {
          s = str.search(start);
          e = str.indexOf(end, s);
          if (e == -1) {e = str.length;}
          if (repl) {
            a.push(func(str.substring(s, e + (end.length))));      
            str = str.substring(0, s) + repl + str.substr(e + (end.length));
          } else {
            d += str.substring(0, s);
            d += func(str.substring(s, e + (end.length)));
            str = str.substr(e + (end.length));
          }
        }
        this.rest = d + str;
        this.arr = a;
      }
      function htmlMode(txt) {
        var rest = txt, done = "", comment, startpos, endpos, i;
        comment = new extract(rest, "&lt;!--", "--&gt;", commentMode, "W3HTMLCOMMENTPOS");
        rest = comment.rest;
        while (rest.indexOf("&lt;") > -1) {
          startpos = rest.indexOf("&lt;");
          endpos = rest.indexOf("&gt;", startpos);
          if (endpos == -1) {endpos = rest.length;}
          done += rest.substring(0, startpos);
          done += tagMode(rest.substring(startpos, endpos + 4));
          rest = rest.substr(endpos + 4);
        }
        rest = done + rest;
        for (i = 0; i < comment.arr.length; i++) {
            rest = rest.replace("W3HTMLCOMMENTPOS", comment.arr[i]);
        }
        return rest;
      }
      function tagMode(txt) {
        var rest = txt, done = "", startpos, endpos, result;
        while (rest.search(/(\s|<br>)/) > -1) {    
          startpos = rest.search(/(\s|<br>)/);
          endpos = rest.indexOf("&gt;");
          if (endpos == -1) {endpos = rest.length;}
          done += rest.substring(0, startpos);
          done += attributeMode(rest.substring(startpos, endpos));
          rest = rest.substr(endpos);
        }
        result = done + rest;
        result = "<span style=color:" + tagcolor + ">&lt;</span>" + result.substring(4);
        if (result.substr(result.length - 4, 4) == "&gt;") {
          result = result.substring(0, result.length - 4) + "<span style=color:" + tagcolor + ">&gt;</span>";
        }
        return "<span style=color:" + tagnamecolor + ">" + result + "</span>";
      }
      function attributeMode(txt) {
        var rest = txt, done = "", startpos, endpos, singlefnuttpos, doublefnuttpos, spacepos;
        while (rest.indexOf("=") > -1) {
          endpos = -1;
          startpos = rest.indexOf("=");
          singlefnuttpos = rest.indexOf("'", startpos);
          doublefnuttpos = rest.indexOf('"', startpos);
          spacepos = rest.indexOf(" ", startpos + 2);
          if (spacepos > -1 && (spacepos < singlefnuttpos || singlefnuttpos == -1) && (spacepos < doublefnuttpos || doublefnuttpos == -1)) {
            endpos = rest.indexOf(" ", startpos);      
          } else if (doublefnuttpos > -1 && (doublefnuttpos < singlefnuttpos || singlefnuttpos == -1) && (doublefnuttpos < spacepos || spacepos == -1)) {
            endpos = rest.indexOf('"', rest.indexOf('"', startpos) + 1);
          } else if (singlefnuttpos > -1 && (singlefnuttpos < doublefnuttpos || doublefnuttpos == -1) && (singlefnuttpos < spacepos || spacepos == -1)) {
            endpos = rest.indexOf("'", rest.indexOf("'", startpos) + 1);
          }
          if (!endpos || endpos == -1 || endpos < startpos) {endpos = rest.length;}
          done += rest.substring(0, startpos);
          done += attributeValueMode(rest.substring(startpos, endpos + 1));
          rest = rest.substr(endpos + 1);
        }
        return "<span style=color:" + attributecolor + ">" + done + rest + "</span>";
      }
      function attributeValueMode(txt) {
        return "<span style=color:" + attributevaluecolor + ">" + txt + "</span>";
      }
      function commentMode(txt) {
        return "<span style=color:" + commentcolor + ">" + txt + "</span>";
      }
    },
    loadElementData () {
      if (this.mainData.apiUrl && this.aElement) {
        if (this.vTab === 'textheader') {
          if (!this.aElement.headerLoaded && !this.aElement.headerLoading) {
            // header headerLoaded headerLoading
            console.log('Load Header ...', this.mainData.apiUrl, this.mainData.corpus.selectedElement)
            this.aElement.headerLoading = true
            this.$http
              .get(this.mainData.apiUrl + 'xml/' + this.mainData.corpus.selectedElement + '/header')
              .then((response) => {
                if (response.data && response.data.xmlId && this.mainData.corpus.selectedElement && this.mainData.corpus.obj[response.data.xmlId]) {
                  let lElement = this.mainData.corpus.obj[response.data.xmlId]
                  if (!response.data.error) {
                    lElement.header = response.data.xml
                    lElement.headerLoaded = true
                  } else {
                    alert(response.data.error)
                    console.log(response.data.error, response)
                  }
                  lElement.headerLoading = false
                }
              })
              .catch((err) => {
                console.log(err)
                this.aElement.headerLoading = true
              })
          }
        } else {
          if (!this.aElement.xmlLoaded && !this.aElement.xmlLoading) {
            // xml xmlLoaded xmlLoading
            console.log('Load XML ...', this.mainData.apiUrl)
            this.aElement.xmlLoading = true
            this.$http
              .get(this.mainData.apiUrl + 'xml/' + this.mainData.corpus.selectedElement + '/file')
              .then((response) => {
                if (response.data && response.data.xmlId && this.mainData.corpus.selectedElement && this.mainData.corpus.obj[response.data.xmlId]) {
                  let lElement = this.mainData.corpus.obj[response.data.xmlId]
                  if (!response.data.error) {
                    lElement.xml = response.data.xml
                    lElement.xmlLoaded = true
                    if (!lElement.headerLoaded && !lElement.headerLoading) {
                      console.log('extract header from xml file')
                      let parser = new DOMParser()
                      let xmlDoc = parser.parseFromString(lElement.xml,"text/xml")
                      let aHeader = xmlDoc.getElementsByTagName('teiHeader')
                      if (aHeader && aHeader[0]) {
                        aHeader = aHeader[0]
                        lElement.header = aHeader.outerHTML.replace(/<([a-zA-Z0-9 ]+)(?:xml)ns=".*"(.*)>/g, '<$1$2>')
                        lElement.headerLoaded = true
                      } else {
                        alert('Can\'t extract header!');
                      }
                    }
                  } else {
                    alert(response.data.error)
                    console.log(response.data.error, response)
                  }
                  lElement.xmlLoading = false
                }
              })
              .catch((err) => {
                console.log(err)
                this.aElement.xmlLoading = true
              })
          }
        }
      }
    }
  },
  watch: {
    aAudioUrl () {
      this.refreshAudio = true
      this.$nextTick(() => {
        this.refreshAudio = false
      })
    },
    aElement () {
      this.loadElementData()
    },
    vTab () {
      this.loadElementData()
    }
  },
  components: {
    Audioplayer
  }
}
</script>

<style scoped>
</style>
