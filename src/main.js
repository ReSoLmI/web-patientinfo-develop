// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueRouter from 'vue-router'
import routers from './common/router'
import loadHeader from './common/js/loadHeader'
import common from './common/js/common'
import layer from 'vue-layer'

/* eslint-disable */
import $ from 'jquery'
// import 'jquery.cookie'
import './common/js/vendor/layer/layer.js'
import './common/js/vendor/layer/skin/layer.css'
import  './common/js/vendor/bootstrap/bootstrap-tooltips.min'
import  './common/js/vendor/bootstrap/bootstrap-dropdowns.min'
import './common/js/vendor/My97DatePicker/WdatePicker'
import './common/js/vendor/select2/js/select2'
import './common/js/vendor/select2/css/select2.css'

// import './common/css/inPatient/global.css'
// import './common/css/inPatient/default.css'
Vue.use(VueRouter)
Vue.config.productionTip = false
Vue.prototype.common = common
Vue.prototype.$layer = layer(Vue)
common.setUserInfo()
const router = new VueRouter({
  routes: routers
})
router.beforeEach((to, from, next) => {
  if (window.location.href.indexOf('discharged') === -1 && window.location.href.indexOf('transfered') === -1) {
    require('./common/css/inPatient/global.css')
    require('./common/css/inPatient/default.css')
  } else if (window.location.href.indexOf('discharged') > -1) {
    // require('./common/css/discharged/global.css')
    // require('./common/css/discharged/default.css')
    // require('./common/css/discharged/transfer.css')
    // require('./common/css/discharged/layout.css')
  }
  next()
})

/* eslint-disable no-new */
var vm = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  created () {
    var url = window.location.href
    // loadHeader()
    if(url.indexOf ('ward/patientList') === -1 && url.indexOf ('allery') === -1 && url.indexOf ('patientInfo') === -1 && url.indexOf ('wardTour') === -1 && url.indexOf ('nursingTour') === -1 && url.indexOf ('backlog') === -1 && url.indexOf ('popPage') === -1 && url.indexOf ('setting') === -1 && url.indexOf ('pageThird') === -1) {
      loadHeader()
    }
  }
})
