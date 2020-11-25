<template>
  <div class="xml-prev" v-if="xmlFormated">
    <div
      v-for="(aLine, aIdx) in xmlFormated.slice(0, 1000)"
      :key="'xmll' + aIdx"
      v-html="aLine"
    />
  </div>
</template>

<script>
export default {
  name: 'CorpusElementXml',
  props: {
    'element': Object
  },
  data: () => ({
  }),
  mounted () {
  },
  computed: {
    xmlFormated () {
      let xmlF = this.element && this.element.xml && this.w3CodeColor(this.element.xml)
      if (xmlF) {
        let t1 = performance.now()
        xmlF = xmlF.split('<br>')
        console.log('xmlFormated - split', performance.now() - t1)
        return xmlF
      }
      return null
    }
  },
  methods: {
    w3CodeColor(elmntTxt) {
      let t1 = performance.now()
      elmntTxt = elmntTxt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r?\n/g, '<br>')
      console.log('w3CodeColor - replace', performance.now() - t1)
      elmntTxt = htmlMode(elmntTxt);
      console.log('w3CodeColor - htmlMode', performance.now() - t1)
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
