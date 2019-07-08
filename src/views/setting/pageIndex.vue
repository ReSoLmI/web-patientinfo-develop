<template>
  <div>
    <div class='condition-strip-top'>
      <ul class='strip-top am-ml-20'>
        <li class="active">
          <a href='#/inpatient/setting/pageIndex'>待办接入</a>
        </li>
      </ul>
    </div>
    <backlogSet></backlogSet>
  </div>
</template>

<script>
import backlogSet from './backlogSet'
export default {
  name: 'pageIndex',
  components: { backlogSet },
  data () {
    return {
      pageUrl: ''
    }
  },
  mounted () {
    var islogin = this.common.isLogin()
    if (!islogin) {
      return false
    }
    var locationStr = window.location.hash
    var index = locationStr.indexOf('?')
    if (index > 0) {
      locationStr = locationStr.substring(0, index)
    }
    var htmlUrl = locationStr.replace('#/', '')
    this.pageUrl = this.common.baseUrl + htmlUrl + '.html'
  },
  methods: {}
}
</script>

<style scoped>
</style>
