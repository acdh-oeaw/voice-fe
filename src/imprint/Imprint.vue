<template>
  <v-app>
    <v-container class="home-width">
      <img :src="publicPath + 'images/vc-logo-0-676.png'" class="img-fluid w-100 mt-7" />
    </v-container>
    <v-main>
      <div v-html="imprint"/>
    </v-main>
    <v-overlay :value="loading">
      <v-progress-circular
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
    <v-footer color="white" class="py-0 footer">
      <v-container class="py-0 px-2 text-right">
        <div class="d-flex justify-space-between">
          <div>
            <v-chip class="mx-1 mb-1" label small>Version: {{ version }}</v-chip>
            <v-chip class="mx-1 mb-1" label small>API: {{ apiVersion }}</v-chip>
          </div>
          <div>
            <v-chip class="mx-1 mb-1" label link small v-on:click="revokeCookieAndTrackingConsent" v-if="userOptedTracking">Stop tracking me</v-chip>
            <v-chip class="mx-1 mb-1" label link small color="primary" href="https://www.oeaw.ac.at/en/oeaw/data-protection">Privacy Policy</v-chip>
          </div>
        </div>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script>

export default {
  name: 'App',
  data: () => ({
    loading: false,
    publicPath: process.env.BASE_URL,
    dev: process.env.NODE_ENV === 'development',
    version: process.env.VUE_APP_VERSION,
    apiVersion: '?',
    branch: process.env.VUE_APP_BRANCH,
    userOptedTracking: false
  }),
  mounted () { 
      this.$http
        .get(process.env.VUE_APP_API_URL)
        .then((response) => {
          this.apiVersion = response.bodyText
        })
        .catch((err) => {
          console.log(err)
        })
    window.addEventListener('resize', this.resized)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.resized)
  },
  timers: {
     checkMatomo: { time: 400, autostart: true, repeat: true }
  },
  methods: {
    revokeCookieAndTrackingConsent () {
      this.$matomo && this.$matomo.forgetConsentGiven() && this.$matomo.orgetCookieConsentGiven() && this.$matomo.optUserOut()
    },
    checkMatomo() {
      if (this.$matomo) {
        this.userOptedTracking = this.$matomo && !this.$matomo.isUserOptedOut()
      }
    }
  },
  computed: {
    imprint () {
      return `{{ imprint }}`
    }
  }
}
</script>

<style>
  .footer {
    font-size: 0.9rem;
    margin-top: -5px;
  }
  .img-fluid {
    max-width: 100%;
    height: auto;
  }
  .w-100 {
    width: 100%;
  }
  .logo-small {
    width: 200px;
  }
  .fx-bt {
    border-top: 1px solid #ddd;
  }
  .fx-bb {
    border-bottom: 1px solid #ddd;
  }
  .fx-bl {
    border-left: 1px solid #ddd;
  }
  .fx-br {
    border-right: 1px solid #ddd;
  }
  .underline {
    text-decoration: underline;
  }
  .v-main {
    position: relative;
    min-height: 500px;
  }
  .v-main > .v-main__wrap {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: auto;
  }
  .scroll-content {
    position: relative;
    height: 100%;
    width: 100%;
  }
  .linescroll, .scroll-content > div {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: auto;
  }
  .flex-break {
    flex-basis: 100%;
    height: 0;
  }
  .fx-icon-red {
    background: #b00!important;
  }
  .cur-help {
    cursor: help;
  }
  @media (min-width: 1264px) {
    .container {
      max-width: 1785px!important;
    }
    .container.max-width {
      max-width: 1185px!important;
    }
  }
  @media (min-width: 960px) {
    .home-width {
      max-width: 700px!important;
    }
  }
</style>
