<template>
  <div>
    <head-ward ref="headerWard" :renderInit = '$renderInit'></head-ward>
    <div>
      <div class="am-page-lside-second" style="left: 0;">
          <div class="lside-info" v-show="patient.name" style="display:none;">
              <h4>{{patient.name}}</h4>
              <div class="ldi-responsive-items">
                  <span class="responsive-item">{{patient.ageHis | calculateAge()}}</span>
                  <span class="responsive-item">{{patient.displayId}}</span>
              </div>
              <div class="more-cont">
                  <a>更多</a>
                  <div style="display: none;">
                      <p class="p-tooltip"><span class="am-txt-muted am-mr-10">入院时间:</span>{{patient.admissionTime | date('yyyy-MM-dd hh:mm:ss')}}</p>
                      <p class="p-tooltip" v-if="patient.dischargeTime"><span class="am-txt-muted am-mr-10">出院时间:</span>{{patient.dischargeTime | date('yyyy-MM-dd hh:mm:ss')}}</p>
                      <p class="p-tooltip"><span class="am-txt-muted am-mr-10">联系电话:</span>{{patient.mobileNo||'--'}}</p>
                  </div>
              </div>
          </div>
          <ul class="lside-secondary-menu clearfix" v-show="menus.length>0" style="display:none;">
              <li v-for="(first, index) in menus" :key="index" :class="{'li-angle':first.subList.length>0}"  @click="showSonMenu()">
                <!-- 一级菜单 -->
                <a class="showTip bigLabel" :class="{active:first.menuId==FMenuId&&!SMenuId}"  :data-title="first.menuName" @click="goToPageF(first)">{{first.menuName}}<i class="angle"></i></a>
                <!-- 二级菜单 -->
                <ul v-if="first.subList&&first.subList.length>0" :id="'son2_' + first.menuId">
                    <li v-for="(second, index1) in first.subList" :key="index1" @click="showPage()" class="son">
                        <a class="showTip" :class="{active:SMenuId==second.menuId&&!TMenuId,on:SMenuId==second.menuId&&TMenuId}" :data-title="second.menuName" @click="goToPageS(first,second)">{{second.menuName}}</a>
                        <!-- 三级菜单 -->
                        <ul class="ul-third" style="display: block;" v-if="second.subList.length>0" :id="'son3_' + second.menuId">
                            <li v-for="(third, index2) in second.subList" :key="index2" @click="showPage()" class="son">
                                <a @click="goToPageT(first,second,third)" class="showTip bigLabel" :data-title="third.menuName" :class="{active:TMenuId==third.menuId}">{{third.menuName}}</a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </li>
          </ul>
      </div>
      <div class="am-page-rcont" style="left: 170px;">
          <div v-show="loading_iframe==1" style="display:none;height:100%;overflow: hidden;">
              <iframe :src="pageUrl" class="iframeContainer" marginheight="0" marginwidth="0" frameborder="0" scrolling="auto" v-if="pageUrl"></iframe>
              <div class="no-data no-data-smile no-data-fixed" v-if="!pageUrl">
                <div class="img"></div>
                <div class="responsive-txt">
                  <div class="txt"><span>暂未配置相关界面哦~</span></div>
                </div>
              </div>
          </div>
          <div class="loading_up no-data-fixed loading-data" v-if="loading_iframe==0">
              <div class="bird">
                  <div class="body"></div>
                  <div class="light"></div>
              </div>
              <span class="txt">加载中..<em>.</em></span>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import '../../../common/js/filter'
import headWard from '../../../common/component/headerWards'
export default {
  components: {headWard},
  data () {
    return {
      loading: 0,
      loading_iframe: 0,
      patient: {},
      menus: [],
      FMenuId: '',
      SMenuId: '',
      TMenuId: '',
      pageUrl: ''
    }
  },
  mounted () {
    this.$renderInit()
  },
  methods: {
    $renderInit: function () {
      this.loading_iframe = 0
      this.destroyTooltip()
      if (this.menus.length === 0) {
        this.queryPatientMenuNew()
      } else {
        this.showMenuTooltip()
      }
      this.getPageUrl()
      $('.more-cont>a').tooltip({
        container: 'body',
        placement: 'auto right',
        html: true,
        title: function () {
          return $(this).next('div').html()
        }
      })
    },
    // 查询转科患者信息
    getPatientInfo: function (callbackFun) {
      this.common.ajax({
        url: 'baseinfo2.0/allType/patients',
        dataType: 'json',
        type: 'get',
        timeout: 30000,
        data: {
          organCode: this.common.getOrganCode(),
          sourceType: 'IH',
          patIndexNo: this.common.getUrlParam('patIndexNo')
        },
        callback: function (data) {
          if (callbackFun) {
            callbackFun(data)
          }
        }
      })
    },
    // 获取当前菜单对应URL
    getPageUrl: function () {
      // 一级菜单ID
      this.FMenuId = this.common.getUrlParam('FMenuId')
      // 二级菜单ID
      this.SMenuId = this.common.getUrlParam('SMenuId')
      // 三级菜单ID
      this.TMenuId = this.common.getUrlParam('TMenuId')

      // 默认进来没选中任何菜单时 选中第一个菜单打开对应界面
      if (this.menus.length > 0 && !this.FMenuId && !this.SMenuId && !this.TMenuId) {
        this.FMenuId = this.menus[0].menuId
        if (this.menus[0].subList.length > 0) {
          this.SMenuId = this.menus[0].subList[0].menuId
          if (this.menus[0].subList[0].subList.length > 0) {
            this.TMenuId = this.menus[0].subList[0].subList[0].menuId
          }
        }
      }
      this.getPatientInfo((data) => {
        var dataInfo = {}
        if (data.length > 0) {
          dataInfo = data[0]
          // 获取科室数据源 科室数据永远取当前科室数据
          var deList = JSON.parse(this.common.getLocalStorage('PAT_deList')) || []
          if (deList && deList.length > 0) {
            for (var i = 0; i < deList.length; i++) {
              if (deList[i].wardCode === this.common.getUrlParam('wardCode')) {
                for (var key in deList[i]) {
                  dataInfo[key] = deList[i][key]
                }
                break
              }
            }
          }
          this.patient = data[0]
        } else {
          this.common.tip_msg('患者转科信息更新了， 请重新查询！', null, () => {
            // avalon.vmodels.root.closeTab('patient_out', this.common.getUrlParam('patIndexNo'))
            window.location.href = '#/transfered/patientsList?wardCode=' + this.common.getUrlParam('wardCode')
          })
        }
        var urlInfo = this.common.getPageUrlNew(this.menus, this.FMenuId, this.SMenuId, this.TMenuId, dataInfo)
        this.loading_iframe = 1
        this.pageUrl = ''
        if (urlInfo) {
          urlInfo.pageUrl += '&transLogoutFun=execFun_logout'
        }
        // 如果URL的uid为360 用IE浏览器打开该URL页面 否则直接iframe引入该页面
        if (urlInfo.uid === '360') {
          window.startPrject('ie', urlInfo.pageUrl)
        } else {
          this.pageUrl = urlInfo.pageUrl
        }
      })
      this.$nextTick(function () {
        $('#son2_' + this.FMenuId).show()
        $('#son2_' + this.FMenuId).parents('li').addClass('open')
      })
    },
    // 查询菜单
    queryPatientMenuNew: function () {
      var param = {
        'category': '2', // 1-病区，2-患者
        'menuType': 'pc',
        'topMenuCode': 'transferinfoV2', // this.common.getAppCode(),
        'wardCode': this.common.getUrlParam('wardCode')
      }
      this.common.ajax({
        url: 'common-service/menu/access',
        dataType: 'json',
        type: 'post',
        async: false,
        data: JSON.stringify(param),
        callback: (data) => {
          // 以下操作目的为过滤URL为空的菜单
          var list = []
          for (var i = 0; i < data.length; i++) {
            data[i].subList = data[i].subList ? data[i].subList : []
            if (data[i].subList.length > 0) {
              var subList = []
              for (var m = 0; m < data[i].subList.length; m++) {
                data[i].subList[m].subList = data[i].subList[m].subList ? data[i].subList[m].subList : []
                if (data[i].subList[m].subList.length > 0) {
                  var subListS = []
                  for (var k = 0; k < data[i].subList[m].subList.length; k++) {
                    if (data[i].subList[m].subList[k].menuUrl) {
                      subListS.push(data[i].subList[m].subList[k])
                    }
                  }
                  data[i].subList[m].subList = subListS
                  subList.push(data[i].subList[m])
                } else if (data[i].subList[m].menuUrl) {
                  subList.push(data[i].subList[m])
                }
              }
              data[i].subList = subList
              if (data[i].subList.length > 0) {
                list.push(data[i])
              }
            } else if (data[i].menuUrl) {
              data[i].subList = []
              list.push(data[i])
            }
          }
          this.menus = list
          this.showMenuTooltip()
        }
      })
    },
    queryPatientInfo: function (callbackFun) {
      this.common.ajax({
        url: 'baseinfo2.0/allType/patients',
        dataType: 'json',
        type: 'get',
        data: {
          organCode: this.common.getOrganCode(),
          sourceType: 'IH',
          patIndexNo: this.common.getUrlParam('patIndexNo')
        },
        callback: function (data) {
          if (callbackFun) {
            callbackFun(data)
          }
        }
      })
    },
    showSonMenu: function () {
      $(event.currentTarget).find('ul').eq(0).slideToggle()
      $(event.currentTarget).toggleClass('open')
    },
    showPage: function (url) {
      event.stopPropagation()
      return false
    },
    destroyTooltip: function () {
      $('.showTip').tooltip('destroy')
      $('.tooltip').remove()
    },
    showMenuTooltip: function () {
      this.$nextTick(function () {
        // 提示
        $('.showTip').tooltip({
          container: 'body',
          placement: 'auto top',
          title: function () {
            var title = $(this).attr('data-title')
            var length = $(this).hasClass('bigLabel') ? 7 : 8
            if (title.length > length) {
              return title
            }
          }
        })
      })
    },
    goToPageF: function (item) {
      if (item && item.subList.length === 0 && item.menuUrl) {
        var href = '#/transfered/patientview?wardCode=' + this.common.getUrlParam('wardCode') + '&patIndexNo=' + this.common.getUrlParam('patIndexNo') + '&FMenuId=' + item.menuId
        window.location.href = href
        this.getPageUrl()
      } else {
        return false
      }
    },
    goToPageS: function (first, second) {
      if (second && second.menuUrl) {
        var href = '#/transfered/patientview?wardCode=' + this.common.getUrlParam('wardCode') + '&patIndexNo=' + this.common.getUrlParam('patIndexNo') + '&FMenuId=' + first.menuId + '&SMenuId=' + second.menuId
        window.location.href = href
        this.getPageUrl()
      } else {
        return false
      }
    },
    goToPageT: function (first, second, third) {
      if (third && third.menuUrl) {
        var href = '#/transfered/patientview?wardCode=' + this.common.getUrlParam('wardCode') + '&patIndexNo=' + this.common.getUrlParam('patIndexNo') + '&FMenuId=' + first.menuId + '&SMenuId=' + second.menuId + '&TMenuId=' + third.menuId
        window.location.href = href
        this.getPageUrl()
      } else {
        return false
      }
    },
    logout: function () {
      this.common.logout()
    }
  }
}
</script>

<style scoped>
</style>
