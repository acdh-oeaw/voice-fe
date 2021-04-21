<template>
  <v-container :class="{'max-width': !mainData.options.fullWidth, 'py-0': true}" :fluid="!mainData.wideScreen" fill-height align-start>
    <v-row class="fill-height" style="margin-bottom: initial; margin-top: initial">
      <v-col class="col-12 col-md toolsetleft fill-height">
        <ToolsetLeft :mainData="mainData" />
      </v-col>
      <v-col class="col-12 col-md py-0 fill-height">
        <v-row class="fill-height" style="margin-bottom: initial; margin-top: initial">
          <v-col :class="{
            'col-12': true,
            'col-lg-6': dualView
          }" v-if="dualView || mainData.options.singleView === 'search'">
            <v-card class="d-flex flex-column fill-height">
              <SearchSelect :mainData="mainData" :viewNr="0" :dualView="dualView" />
              <SearchResults :mainData="mainData" />
            </v-card>
          </v-col>
          <v-col :class="{
            'col-12': true,
            'col-lg-6': dualView
          }" v-if="dualView || mainData.options.singleView === 'corpus'">
            <v-card class="fill-height d-flex flex-column">
              <SearchSelect :mainData="mainData" :viewNr="1" :dualView="dualView" />
              <CorpusElement :mainData="mainData" />
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ToolsetLeft from '../components/ToolsetLeft';
import SearchSelect from '../components/SearchSelect';
import SearchResults from '../components/SearchResults';
import CorpusElement from '../components/CorpusElement';

export default {
  name: 'Tool',
  props: {
    'mainData': Object
  },
  data: () => ({
    publicPath: process.env.BASE_URL
  }),
  mounted () {
    console.log('Tool', this.mainData)
  },
  timers: {
    checkMatomo: { time: 100, autostart: true, repeat: true }
  },
  methods: {
    checkMatomo () {
      if (this.$matomo) {
        this.mainData.hideCookieConsent ||= this.$matomo.hasRememberedConsent()
        if (!this.mainData.hideCookieConsent) {
          this.$router.replace('/')
        } 
        this.$timer.stop('checkMatomo')
      }
    },
  },
  computed: {
    dualView () {
      return this.mainData.wideScreen && this.mainData.options.fullWidth && this.mainData.options.dualView
    }
  },
  watch: {
  },
  components: {
    ToolsetLeft,
    SearchSelect,
    SearchResults,
    CorpusElement
  }
}
</script>

<style>
@media (min-width: 960px) {
  .toolsetleft {
    max-width: 350px;
  }
}
.line-con .highlight {
  background: #ff0;
}
.line-con .tag-parsererror {
  color: #d00;
  font-weight: bold;
}

/*********/
/* Views */
/*********/
.line-con .fx-spelt-cont {
  display: none;
}

/*********/
/* Voice */
/*********/
.line-con.typ-voice .fx-overlap,
.line-con.typ-voice .type-overlap {
  color: blue;
}
.line-con.typ-voice:not(.s-ot) .fx-overlap {
  display: none;
}

.line-con.typ-voice .tag-pause {
  color: brown;
}
.line-con.typ-voice:not(.s-p) .tag-pause {
  display: none;
}

.line-con.typ-voice .tag-incident {
  color: #808080;
}
.line-con.typ-voice:not(.s-ce) .tag-incident {
  display: none;
}

.line-con.typ-voice .tag-shift {
  color: #AA0066;
}
.line-con.typ-voice:not(.s-sm) .tag-shift:not(.new-laugh):not(.neutral-laugh) {
  display: none;
}

.line-con.typ-voice:not(.s-smls) .new-laugh,
.line-con.typ-voice:not(.s-smls) .neutral-laugh {
  display: none;
}

.line-con.typ-voice .tag-vocal {
  color: #AA0066;
}
.line-con.typ-voice:not(.s-vsn) .tag-vocal:not(.voice-desc-laughing) {
  display: none;
}

.line-con.typ-voice:not(.s-vsnl) .tag-vocal.voice-desc-laughing {
  display: none;
}

.line-con.typ-voice .fx-spel {
  color: #AA0066;
}
.line-con.typ-voice:not(.s-spl) .fx-spel {
  display: none;
}

.line-con.typ-voice .tag-foreign.type-LN, .line-con.typ-voice .tag-foreign.type-L1, .line-con.typ-voice .tag-foreign.type-LQ {
  color: #b13610;
}

.line-con.typ-voice:not(.s-flat) .fx-foreign {
  display: none;
}
.line-con.typ-voice:not(.s-flat) .fx-foreign-t {
  display: none;
}

.line-con.typ-voice:not(.s-oc) .fx-other-continuation {
  display: none;
}

.line-con.typ-voice .tag-supplied.reason-unintelligible {
  color: #00978E;
}
.line-con.typ-voice:not(.s-uit) .fx-unintelligible-tag {
  display: none;
}

.line-con.typ-voice .fx-ono {
  color: #61DDD2;
}
.line-con.typ-voice:not(.s-ono) .fx-ono {
  display: none;
}

.line-con.typ-voice .fx-pvct {
  color: #61DDD2;
}
.line-con.typ-voice:not(.s-pvct) .fx-pvct {
  display: none;
}

.line-con.typ-voice .fx-ipa {
  color: #61DDD2;
}

.line-con.typ-voice.s-lie .tag-emph {
  text-transform: uppercase;
}

.line-con.typ-voice .type-other_continuation {
  color: #8700C1;
}

.line-con.typ-voice:not(.s-ut) .tag-unclear {
  text-transform: lowercase;
}
.line-con.typ-voice:not(.s-ut) .fx-unclear {
  display: none;
}

.line-con.typ-voice:not(.s-lie) .type-lengthening,
.line-con.typ-voice:not(.s-lie) .type-intonation {
  display: none;
}

/*********/
/* Plain */
/*********/
.line-con.typ-plain .has-n {
  color: #00f;
}

/*******/
/* Pos */
/*******/
.line-con.typ-pos span {
  vertical-align: top;
}
.line-con.typ-pos .fx-ana {
  color: #888;
}
.line-con.typ-pos:not(.s-slv) .fx-ana {
  display: block;
  font-size: 0.9rem;
  line-height: 1.2rem;
  padding: 0 1.5px;
}
.line-con.typ-pos:not(.s-slv) .tag-w,
.line-con.typ-pos:not(.s-slv) .tag-emph,
.line-con.typ-pos:not(.s-slv) .fx-ana-frm {
  display: inline-block;
  text-align: center;
}
.line-con.typ-pos:not(.s-slv) .fx-ana-s {
  display: none;
}
.line-con.typ-pos.s-form.s-asft .fx-ana-f {
  display: none;
}
.line-con.typ-pos:not(.s-func) .fx-ana-f {
  display: none;
}
.line-con.typ-pos:not(.s-form) .fx-ana-form {
  display: none;
}

/*******/
/* XML */
/*******/

.line-con.typ-xml-view {
  font-family: Consolas, "Courier New", monospace;
  white-space: pre-wrap;
  position: relative;
  border-top: 1px solid #bbb;
}
.line-con.typ-xml-view .tc {
  color: mediumblue;
}
.line-con.typ-xml-view .tnc {
  color: brown;
}
.line-con.typ-xml-view .ac {
  color: red;
}
.line-con.typ-xml-view .avc {
  color: mediumblue;
}
.line-con.typ-xml-view .cc {
  color: green;
}
</style>
