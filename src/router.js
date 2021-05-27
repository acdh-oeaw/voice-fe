import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/tool',
      name: 'tool',
      component: () => import(/* webpackChunkName: "tool" */ './views/Tool.vue'),
      props: (route) => ({
        bookmarks: route.query.bookmarks
      })
    }
  ]
})
