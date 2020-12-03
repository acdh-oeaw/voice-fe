<template>
  <div class="linescroll" v-on:scroll="scrolling">
    <div class="xml-prev" :style="'height: ' + (xmlLines.length * lineHeight) + 'px;'" v-if="xmlLines">
      <div ref="xmlviewarea" class="xml-viewarea px-3 py-1" :style="'top: ' + (lineTop * lineHeight) + 'px; min-width: ' + minWidth + 'px;'"
        v-if="xmlFormated"
        v-html="xmlFormated"
      />
    </div>
    <div ref="lineheight" class="xml-prev" style="color:#fff;">.</div>
  </div>
</template>

<script>
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
    // console.log(this.$refs)
    this.$nextTick(() => {
      this.lineHeight = this.$refs.lineheight.clientHeight
      if (this.lineHeight < 10) {
        this.lineHeight = 10
      }
    })
  },
  beforeDestroy () {
  },
  computed: {
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
        let xmlF = this.w3CodeColor(this.xmlLines.slice(this.lineTop, this.lineTop + this.lineLenght).join('\n'))
        // console.log('xmlFormated - w3CodeColor', performance.now() - t1)
        return xmlF
      }
      return null
    }
  },
  methods: {
    scrolling (e) {
      let aTop = e.srcElement.scrollTop
      let aBottom = e.srcElement.scrollTop + e.srcElement.clientHeight
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
    w3CodeColor (elmntTxt) {
      // let t1 = performance.now()
      elmntTxt = elmntTxt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r?\n/g, '<br>')
      elmntTxt = htmlMode(elmntTxt);
      // console.log('w3CodeColor', performance.now() - t1)
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
        result = '<span class="tc">&lt;</span>' + result.substring(4);
        if (result.substr(result.length - 4, 4) == '&gt;') {
          result = result.substring(0, result.length - 4) + '<span class="tc">&gt;</span>';
        }
        return '<span class="tnc">' + result + '</span>';
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
        return '<span class="ac">' + done + rest + '</span>';
      }
      function attributeValueMode(txt) {
        return '<span class="avc">' + txt + '</span>';
      }
      function commentMode(txt) {
        return '<span class="cc">' + txt + '</span>';
      }
    }
  },
  watch: {
  },
  components: {
  }
}
</script>

<style scoped>
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
