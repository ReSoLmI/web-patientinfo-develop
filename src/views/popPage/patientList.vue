<template>
  <div class="am-container is-vertical" style="height:100vh">
      <div class="am-aside-flex0 bg-white">
        <ul class="strip-inner-half" v-if="appCode.indexOf('patientinfo') > -1">
          <li :class="{active:patientType == 'MP'}" @click = "queryPatientByPatientType('MP')">我的 {{patientNumber.myPatNum}}</li>
          <li :class="{active:patientType == ''}" @click = "queryPatientByPatientType('')">全部 {{patientNumber.allPatNum}}</li>
        </ul>
      </div>
      <div class="am-main scroll-w0 scrollbar-inner">
          <ul class="menu-patient" v-if="patientList.length>0">
              <li :class="{active:patIndexNo==first.patIndexNo}" v-for="(first, index) in patientList" :key="index" @click="changePatient(first)"><a><span>{{first.bedNo}}床</span>{{first.name || first.patientName}}</a></li>
          </ul>
          <div class="no-data no-data-smile" v-if="patientList.length==0">
              <div class="img"></div>
              <div class="responsive-txt">
                <div class="txt">暂无相关患者哦~</div>
              </div>
          </div>
      </div>
  </div>
</template>

<script>
export default {
  name: 'patientListPop',
  data () {
    return {
      wardCode: this.common.getUrlParam('wardCode'),
      patIndexNo: this.common.getUrlParam('patIndexNo'),
      patientList: [],
      patientNumber: {
        allPatNum: '', // 全部患者数量
        myPatNum: '' // 我的患者数量
      },
      appCode: this.common.getAppCode(),
      patientType: ''
    }
  },
  mounted () {
    this.renderInit()
  },
  methods: {
    renderInit: function () {
      this.wardCode = this.common.getUrlParam('wardCode')
      this.patIndexNo = this.common.getUrlParam('patIndexNo')

      if (this.appCode === 'patientinfo') {
        this.patientType = 'MP'
      } else {
        this.patientType = ''
      }
      this.queryAllPatient()
    },
    queryAllPatient: function () {
      // 如果当前为急诊 查询急诊患者列表
      if (this.common.getAppCode() === 'emergencyNursing') {
        this.queryEmergencyPatient()
      } else { // 默认查询住院患者列表
        this.queryInpatient()
      }
    },
    // 根据类型查询患者列表
    queryPatientByPatientType: function (patientType) {
      this.patientType = patientType
      this.queryInpatient()
    },
    // 查询住院患者列表
    queryInpatient: function () {
      var param = {
        'organCode': this.common.getOrganCode(),
        'wardCode': this.wardCode,
        'status': 'in',
        'patientType': this.patientType
      }
      this.common.ajax({
        url: 'patientinfo-service/patients/base',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: (data) => {
          if (data) {
            this.patientList = data.patResList
            if (this.isShowList) {
              this.goToPatientPos()
            }
            this.patientNumber.allPatNum = data.patNum
            this.patientNumber.myPatNum = data.myPatNum
          }
        }
      })
    },
    goToPatientPos: function () {
      this.$nextTick(_ => {
        var container = $('.scrollbar-inner')
        var thatP = container.find('li.active')
        if (thatP.length > 0) {
          var mTop = thatP.offset().top
          var result = mTop - container.offset().top + container.scrollTop()
          container.animate({scrollTop: result}, 500)
        }
      })
    },
    // 切换患者
    changePatient: function (patient) {
      var patIndex = {
        patIndexNo: patient.patIndexNo,
        name: patient.name,
        patientName: patient.patientName,
        bedNo: patient.bedNo
      }
      var patientS = JSON.stringify(patIndex)
      // 发布消息
      if (typeof shellApi !== 'undefined') {
        shellApi.eventBus.fire('patientList', patientS)
        shellApi.win.close()
      }
    }
  }
}
</script>

<style scoped>
</style>
