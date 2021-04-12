import Vue from 'vue'
import Imprint from './Imprint.vue'
import VueResource from 'vue-resource'
import VueMatomo from 'vue-matomo'
import vuetify from '../plugins/vuetify'

Vue.config.productionTip = false

Vue.use(VueResource)

Vue.use(VueMatomo, {
  host: "https://matomo.acdh.oeaw.ac.at",
  siteId: "194",
  // TODO build a good conesnt UI
  requireConsent: false,
  trackInitialView: true,
  enableHeartBeatTimer: true,
  debug: true,
})

new Vue({
  vuetify,
  render: h => h(Imprint)
}).$mount('#imprint')