<template>
  <div>
    <v-container class="home-width">
      <div class="py-5">
        <h1 class="text-subtitle-1 font-weight-bold">A computer corpus of English as a lingua franca</h1>
        <p>The most wide-spread contemporary use of English throughout the world is that of <i>English as a lingua franca (ELF)</i>, i.e. English used as a common means of communication among speakers from different first-language backgrounds. <b>VOICE</b>, the <b>V</b>ienna-<b>O</b>xford <b>I</b>nternational <b>C</b>orpus of <b>E</b>nglish, is a collection of language data, the first computer-readable corpus capturing spoken ELF interactions of this kind.</p>
      </div>
    </v-container>
    <div class="text-center py-10 indigo lighten-5" v-if="mainData.hideCookieConsent">
      <h3 class="text-h5 font-weight-bold">Explore VOICE</h3>
      <div class="d-flex align-center search-frm mt-4">
        <v-text-field @keyup.enter.native="search" v-model="mainData.search.value" label="Search the VOICE Corpus" class="mr-3" data-testid="quickSearch"></v-text-field>
        <v-btn @click="search" color="indigo darken-4 white--text">Search</v-btn>
      </div>
      or
      <div class="mt-4">
        <v-btn to="/tool" color="indigo darken-4 white--text">Browse</v-btn>
      </div>
    </div>
    <div class="text-center py-10 indigo lighten-5" v-else>
      <h3 class="text-h5 font-weight-bold">VOICE-CLARIAH needs your help to improve</h3>
      <p>This project uses <b>website tracking and cookies</b> to collect statistical infomation about our users.<br/>
      This information is only used to enhance the user experience. The information is not shared with any third party.<br/>
      We need your consent to gather this information.<br/>
      Knowing how you use our website is especially valuable for our beta phase.</p>
      <p>You can find more information in the "Data privacy notice" of our "Site Notice".</p>
      <v-btn color="indigo darken-4 white--text" v-bind:x-large="true" v-on:click="cookiesAndTrackingAccepted" data-testid="acceptTracking">I accept</v-btn><br/><br/>
      <v-btn color="indigo darken-4 white--text" v-bind:small="true" v-on:click="cookiesAndTrackingRejected" data-testid="rejectTracking">I dont't want this</v-btn>
    </div>
  </div>
</template>

<script>
import { timer } from 'vue-timers'

export default {
  name: 'Home',
  props: {
    'mainData': Object
  },
  data: () => ({
    publicPath: process.env.BASE_URL
  }),
  mounted () {
    this.mainData.hideCookieConsent = this.$matomo && this.$matomo.hasRememberedConsent()
  },
  timers: {
    checkMatomo: { time: 100, autostart: true, repeat: true }
  },
  methods: {
    search () {
      this.$router.push('/tool')
      this.mainData.search.now = true
    },
    cookiesAndTrackingAccepted () {
      this.$matomo &&
      this.$matomo.rememberConsentGiven(720) &&
      this.$matomo.rememberCookieConsentGiven(720) &&
      this.$matomo.forgetUserOptOut()
      this.mainData.hideCookieConsent = true
    },
    cookiesAndTrackingRejected () {
      this.$matomo &&
      this.$matomo.optUserOut()
      this.mainData.hideCookieConsent = true
    },
    checkMatomo () {
      if (this.$matomo) {
        this.mainData.hideCookieConsent ||= this.$matomo.hasRememberedConsent()
        this.$timer.stop('checkMatomo')
      }
    },
  },
}
</script>

<style scoped>
  .search-frm {
    margin-left: auto;
    margin-right: auto;
    max-width: 400px;
  }
</style>
