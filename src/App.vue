<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  created () {
    if (window.location.href.indexOf('discharged') === -1 && window.location.href.indexOf('transfered') === -1) {
      require('./common/css/inPatient/global.css')
      require('./common/css/inPatient/default.css')
    } else if (window.location.href.indexOf('discharged') > -1) {
      require('./common/css/discharged/global.css')
      require('./common/css/discharged/default.css')
      require('./common/css/discharged/transfer.css')
      require('./common/css/discharged/layout.css')
    }
  }
}
</script>
