import Vue from 'vue'
import Imprint from './Imprint.vue'
import VueResource from 'vue-resource'
import VueMatomo from 'vue-matomo'
import VueTimers from 'vue-timers'
import vuetify from '../plugins/vuetify'

Vue.config.productionTip = false

Vue.use(VueResource)

Vue.use(VueMatomo, {
  host: "https://matomo.acdh.oeaw.ac.at",
  siteId: "194",
  requireConsent: true,
  trackInitialView: true,
  enableHeartBeatTimer: true,
  debug: process.env.NODE_ENV === 'development',
  preInitActions: [
    ['setSecureCookie', window.location.protocol === 'https:'],
    ['setCookieSameSite', 'Strict']
  ]
})

Vue.use(VueTimers)

new Vue({
  vuetify,
  render: h => h(Imprint)
}).$mount('#imprint')