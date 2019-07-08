<template>
  <div class="gastrlogy-body-cont" style="background: #fff;" v-if="deList.length>0" :wardCode="wardCode">
      <div class="gastrlogy-body">
        <template v-for="(item, key, $index) in deListCH">
          <div class="tags" :class="{tagsnoborder: $index==0}" :key="$index" v-if="item.length>0">
              <label>{{key}}</label>
              <div>
                <a v-for="(el, index1) in item" :key="index1" class="departSelect" :class="{curDep:el.wardCode ==wardCode}" :wardCode="el.wardCode" @click="toPages(el.wardCode,el.wardName,1)">{{el.wardName}}</a>
              </div>
          </div>
        </template>
      </div>
  </div>
</template>

<script>
export default {
  name: 'popWard',
  data () {
    return {
      baseUrl: window.baseUrl, // 该变量定义在app.js中
      deListCH: {},
      deList: [],
      wardCode: '',
      loginId: this.common.getLoginId(),
      loading: true
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init: function () {
      this.wardCode = this.common.getUrlParam('wardCode')
      this.queryWardList()
      this.jdugeWardType()
    },
    // 获取科室列表
    queryWardList: function () {
      var param = {
        'loginId': this.loginId
      }
      this.common.ajax({
        url: 'common-service/user/v1/units',
        dataType: 'json',
        type: 'get',
        async: false,
        data: param,
        callback: (data) => {
          this.deListCH = data
        }
      })
    },

    jdugeWardType: function () {
      this.wardCode = this.common.getUrlParam('wardCode')
      this.deList = []
      var wardInfo = {
        inpatientWards: [],
        emergencyWards: [],
        wardType: ''
      }
      var data = this.deListCH
      for (var i in data) {
        for (var j = 0; j < data[i].length; j++) {
          var ward = data[i][j]
          // 收集所有住院病区
          if (ward.wardType === 2) {
            wardInfo.inpatientWards.push(ward)
            // 如果当前为住院患者应用 科室列表只展示住院类型科室
            if (this.common.getAppCode().indexOf('patientinfo') > -1) {
              this.deList.push(ward)
            }
          } else if (ward.wardType === 0) { // 收集所有急诊病区
            wardInfo.emergencyWards.push(ward)
            // 如果当前为急诊患者应用 科室列表只展示急诊类型科室
            if (this.common.getAppCode() === 'emergencyNursing') {
              this.deList.push(ward)
            }
          }
          // 收集当前科室信息
          if (ward.wardCode === this.wardCode) {
            wardInfo.wardType = ward.wardType
          }
        }
      }
    },
    toPages: function (id, name, type) {
      var message = {
        id: id,
        name: name
      }
      // 发布消息
      if (typeof shellApi !== 'undefined') {
        shellApi.eventBus.fire('wardList', JSON.stringify(message))
        shellApi.win.close()
      }
    }
  }
}
</script>

<style scoped>
</style>
