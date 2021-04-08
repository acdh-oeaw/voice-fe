import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueResource from 'vue-resource'
import VueMatomo from 'vue-matomo'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

Vue.use(VueResource)

Vue.use(VueMatomo, {
  host: "https://matomo.acdh.oeaw.ac.at",
  siteId: "194",
  router: router,
  // TODO build a good conesnt UI
  requireConsent: false,
  trackInitialView: true,
  enableHeartBeatTimer: true,
  debug: true,
})

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
