import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueResource from 'vue-resource'
import VueMatomo from 'vue-matomo'
import VueTimers from 'vue-timers'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

Vue.use(VueResource)

Vue.use(VueMatomo, {
  host: "https://matomo.acdh.oeaw.ac.at",
  siteId: "194",
  router: router,
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
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
