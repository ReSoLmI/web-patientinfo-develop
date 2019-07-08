<template>
  <div class="container-patient-index">
    <head-ward ref="headerWard" @renderInit="renderInit"></head-ward>
    <div class="noLeftMenu am-page-rcont-parent" style="left:0px;">
      <!-- patient-rside lside-min lside-secondary -->
      <div class="am-page-lside-second" style="position:fixed;left:0px;top:60px;overflow-x:hidden;">
        <div class="gn-scroll">
          <!-- <h4>患者待办</h4> -->
          <ul class="lside-secondary-menu" id="leftMenu">
            <!-- <li ms-class="active:FMenuId==''"><a ms-href="#!/patientinfo/html/patient/pageContainer?wardCode={{wardCode}}&patIndexNo={{patIndexNo}}">患者详情</a></li> -->
            <li v-for="(first,index) in patientMenus" :key="index" :class="{'li-angle':first.subList.length>0}">
              <!-- 一级菜单 -->
              <a class="showTip bigLabel" :class="{'active':first.menuId==FMenuId&&!SMenuId}" :data-title="first.menuName" @click="goToPageF(first)">{{first.menuName}}<i class="angle"></i></a>
              <!-- 二级菜单 -->
              <ul v-if="first.subList&&first.subList.length>0" :id="`son2_${first.menuId}`">
                <li v-for="(second,index) in first.subList" :key="index" @click="showPage()" class="son" :class="{'li-angle':second.subList.length>0}">
                  <a class="showTip" :class="{'active':SMenuId==second.menuId&&!TMenuId,'on':SMenuId==second.menuId&&TMenuId}" :data-title="second.menuName" @click="goToPageS(first,second)">{{second.menuName}}</a>
                  <!-- 三级菜单 -->
                  <ul class="ul-third" style="display: block;" v-if="second.subList.length>0" :id="`son3_${second.menuId}`">
                    <li v-for="(third,index) in second.subList" :key="index" @click="showPage()" class="son">
                      <a @click="goToPageT(first,second,third)" class="showTip bigLabel" :data-title="third.menuName" :class="{'active':TMenuId==third.menuId}">{{third.menuName}}</a>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
      <a class="patient-fixed-tool" v-if="emcOut!=1" :class="{'active':isShowList}" @click="showList()">患者列表</a>
      <div class="patient-fixed-details" v-if="emcOut!=1" :class="{'active':isShowList}" id="patient-fixed-details">
        <ul class="strip-inner-half" v-if="appCode.indexOf('patientinfo') > -1">
          <li :class="{'active':patientType == 'MP'}" @click="queryPatientByPatientType('MP')">我的 {{patientNumber.myPatNum}}</li>
          <li :class="{'active':patientType == ''}" @click="queryPatientByPatientType('')">全部 {{patientNumber.allPatNum}}</li>
        </ul>
        <div class="scrollbar-inner" :class="{'top38':appCode.indexOf('patientinfo') > -1}">
          <ul v-if="patientList.length>0">
            <li :class="{'active':patIndexNo==first.patIndexNo}" v-for="(first,index) in patientList" :key="index" @click="changePatient(first)"><a><span>{{first.bedNo}}床</span>{{first.name || first.patientName}}</a></li>
          </ul>
          <div class="no-data no-data-smile" v-if="patientList.length==0">
            <div class="img"></div>
            <div class="responsive-txt">
              <div class="txt">暂无相关患者哦~</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 右侧内容区域 -->
      <menu-content ref="patientContent" :emcOut="emcOut" :patientMenus = 'patientMenus'></menu-content>
    </div>
  </div>
</template>

<script>
import headWard from '../../../common/component/headerWards'
import menuContent from './patientContainer'
export default {
  name: 'patientIndex',
  components: {headWard, menuContent},
  data () {
    return {
      version: '',
      pageUrl: '', // 默认为mine.html
      wardCode: this.common.getUrlParam('wardCode'),
      patIndexNo: this.common.getUrlParam('patIndexNo'),
      FMenuId: this.common.getUrlParam('FMenuId'),
      SMenuId: this.common.getUrlParam('SMenuId'),
      TMenuId: this.common.getUrlParam('TMenuId'),
      patientMenus: [],
      patientList: [],
      patientNumber: {
        allPatNum: '', // 全部患者数量
        myPatNum: '' // 我的患者数量
      },
      first: true,
      isShowList: false,
      appCode: this.common.getAppCode(),
      patientType: '',
      emcOut: this.common.getUrlParam('emcOut'),
      IframeOnClickOut: {
        resolution: 200,
        iframes: [],
        interval: null,
        Iframe: function () {
          this.element = arguments[0]
          this.cb = arguments[1]
          this.hasTracked = false
        },
        track: function (element, cb) {
          this.iframes.push(new this.Iframe(element, cb))
          if (!this.interval) {
            var _this = this
            window.clearInterval(this.interval)
            this.interval = setInterval(function () { _this.checkClick() }, this.resolution)
          }
        },
        checkClick: function () {
          if (document.activeElement) {
            var activeElement = document.activeElement
            for (var i in this.iframes) {
              if (activeElement === this.iframes[i].element) { // user is in this Iframe
                if (this.iframes[i].hasTracked === false) {
                  this.iframes[i].cb.apply(window, [])
                  // window.vm.initIframeClick()
                }
              } else {
                this.iframes[i].hasTracked = false
              }
            }
          }
        }
      }
    }
  },
  mounted () {
    // var iframeMessage = {
    //   isRemind: true, // 弹出提醒
    //   logout: false // 是否退出登录
    // }
    // window.parent.postMessage(iframeMessage, '*')
    /* 加载view后需要做的事情 */
    var islogin = this.common.isLogin()
    if (!islogin) {
      return false
    }
    this.patIndexNo = this.common.getUrlParam('patIndexNo')
    this.renderInit()
    var that = this
    $(window).resize(() => {
      that.$refs.patientContent.openWinform()
    })
    // 二级菜单的展开与收起
    this.$nextTick(() => {
      $('#leftMenu li').click(function () {
        $(this).find('ul').eq(0).slideToggle()
        $(this).toggleClass('open')
      })
    })
    // var that = this
    // window.addEventListener('message', that.patientInfoListener, false)
    // this.$once('hook:beforeDestroy', () => {
    //   window.removeEventListener('message', that.patientInfoListener, false)
    // })
  },
  methods: {
    // patientInfoListener (e) {
    //   console.log(11)
    //   if (e.data.curTabId) {
    //     this.$refs.patientContent.queryPatientMenu()
    //     this.$refs.patientContent.getPageUrl()
    //   }
    // },
    renderInit: function () {
      this.wardCode = this.common.getUrlParam('wardCode')
      this.emcOut = this.common.getUrlParam('emcOut')
      this.isShowList = false
      this.FMenuId = this.common.getUrlParam('FMenuId')
      this.SMenuId = this.common.getUrlParam('SMenuId')
      this.TMenuId = this.common.getUrlParam('TMenuId')
      this.patIndexNo = this.common.getUrlParam('patIndexNo')
      this.destroyTooltip()
      if (this.patientMenus.length === 0 || Number(this.common.getUrlParam('refresh')) === 1) {
        this.queryPatientMenuNew()
        this.$refs.patientContent.getPageUrl()
      } else {
        this.showMenuTooltip()
      }
      // 默认进来没选中任何菜单时 选中第一个菜单打开对应界面
      if (this.patientMenus.length > 0 && !this.FMenuId && !this.SMenuId && !this.TMenuId) {
        this.FMenuId = this.patientMenus[0].menuId
        if (this.patientMenus[0].subList.length > 0) {
          this.SMenuId = this.patientMenus[0].subList[0].menuId
          if (this.patientMenus[0].subList[0].subList.length > 0) {
            this.TMenuId = this.patientMenus[0].subList[0].subList[0].menuId
          }
        }
      }
      /* 根据链接地址加载右边模块 */
      var locationStr = window.location.hash
      var index = locationStr.indexOf('?')
      if (index > 0) {
        locationStr = locationStr.substring(0, index)
      }
      var pathTail = locationStr.replace('#!/', '')
      this.pageUrl = this.common.baseUrl + pathTail + '.html' + this.version
      this.appCode = this.common.getAppCode()
      if (this.appCode === 'patientinfo') {
        this.patientType = 'MP'
      } else {
        this.patientType = ''
      }

      if (Number(this.common.getUrlParam('refresh')) === 1 && Number(this.emcOut) !== 1) {
        this.queryAllPatient()
      }
      //  && ($('body').find('.platform-header').length === 0 || this.first)
      if (typeof shellApi !== 'undefined') {
        // 订阅消息
        // this.first = false
        // shellApi.eventBus.register('patientList', (message) => {
        //   var patient = JSON.parse(message)
        //   this.changePatient(patient)
        // }, 'patientList')
        // 关闭弹框的回调
        shellApi.childForm.on('patientListFormClosed', () => {
          this.isShowList = false
        })
        // 注册方法客户端调用切换地址
        // shellApi.windowsControlsHost.on('openPatientList', function (message) {
        //   this.showList(message)
        // })
      }
      window.showPatientList = function () {
        var url = 'http://' + this.common.joinUrl(location.host + this.common.baseUrl + '#/inpatient/popPage/patientList')
        if (typeof shellApi !== 'undefined') {
          $('#patient-fixed-details').hide()
          // var hostEl = document.getElementById('header-ward')
          // var rect = hostEl.getBoundingClientRect()
          var index = shellApi.screen.getScale()
          var top = $('.platform-header').height() + window.screenTop
          var left = document.body.clientWidth - 150 + window.screenLeft
          var options = {
            'url': this.common.joinUrl(url),
            'isDialog': 'false',
            'show-titlebar': 'false',
            'title': '医惠护士',
            'hasOwner': true,
            'position': left + ',' + top,
            'width': parseInt(150 * index),
            'height': parseInt((document.body.clientHeight - $('.platform-header').height()) * index),
            'showLeftBorder': 'false',
            'showTopBorder': 'false',
            'showBottomBorder': 'false',
            'showRightBorder': 'false',
            'autoClose': 'true'
          }
          shellApi.childForm.open('patientList', options)
        }
      }
    },
    queryPatientMenu: function () {
      var that = this
      this.common.ajax({
        url: 'console-service/menu/1/2',
        dataType: 'json',
        type: 'get',
        async: false,
        data: {
          accessCode: this.common.getAppCode()
        },
        callback: function (data) {
          var list = []
          for (var i = 0; i < data.length; i++) {
            if (data[i].menuList) {
              var count = 0
              for (var m = 0; m < data[i].menuList.length; m++) {
                if (data[i].menuList[m].menuUrl) {
                  count += 1
                }
              }
              data[i].menuCount = count
            } else if (data[i].menuUrl) {
              data[i].menuList = []
              data[i].menuCount = 1
            }
            if (((that.common.getAppCode() === 'patientinfo') || (that.common.getAppCode() === 'emergencyNursing')) && data[i].menuCount > 0) {
              list.push(data[i])
            }
          }
          that.patientMenus = list
          that.showMenuTooltip()
          // console.log('that.patientMenus:', that.patientMenus)
        }
      })
    },
    // 查询菜单
    queryPatientMenuNew: function () {
      var that = this
      var param = {
        'category': '2', // 1-病区，2-患者
        'menuType': 'pc',
        'topMenuCode': this.common.getAppCode(),
        'wardCode': this.wardCode
      }
      this.common.ajax({
        url: 'common-service/menu/access',
        dataType: 'json',
        type: 'post',
        async: false,
        data: JSON.stringify(param),
        callback: function (data) {
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
                    if (data[i].subList[m].subList[k].menuUrl || Number(data[i].subList[m].subList[k].menuUrlType) === 3) {
                      subListS.push(data[i].subList[m].subList[k])
                    }
                  }
                  data[i].subList[m].subList = subListS
                  subList.push(data[i].subList[m])
                } else if (data[i].subList[m].menuUrl || Number(data[i].subList[m].menuUrlType) === 3) {
                  subList.push(data[i].subList[m])
                }
              }
              data[i].subList = subList
              if (data[i].subList.length > 0) {
                list.push(data[i])
              }
            } else if (data[i].menuUrl || Number(data[i].menuUrlType) === 3) {
              // menuUrlType == 3为客户端
              data[i].subList = []
              list.push(data[i])
            }
          }
          that.patientMenus = list
          that.showMenuTooltip()
        }
      })
    },
    destroyTooltip: function () {
      $('.showTip').tooltip('destroy')
      $('.tooltip').remove()
    },
    showMenuTooltip: function () {
      this.$nextTick(_ => {
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
    showPage: function (url) {
      event.stopPropagation()
      // event.preventDefault();
      return false
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
      var that = this
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
        callback: function (data) {
          if (data) {
            that.patientList = data.patResList
            if (that.isShowList) {
              that.goToPatientPos()
            }
            that.patientNumber.allPatNum = data.patNum
            that.patientNumber.myPatNum = data.myPatNum
          }
        }
      })
    },
    // 查询急诊患者列表
    queryEmergencyPatient: function () {
      var that = this
      var param = {
        'organCode': this.common.getOrganCode(),
        'emcWardCode': this.wardCode
      }
      this.common.ajax({
        url: 'emergency-service/emc/patient/getAllBedsWithPatient',
        dataType: 'json',
        type: 'post',
        data: JSON.stringify(param),
        callback: function (data) {
          if (data.data && data.data.length > 0) {
            var patientList = []
            data.data.map(function (patient) {
              if (patient.patinetInfo) {
                patientList.push(patient.patinetInfo)
              }
            })
            that.patientList = patientList
          }
        }
      })
    },
    goToPatientPos: function () {
      this.$nextTick(_ => {
        var container = $('.patient-fixed-details .scrollbar-inner')
        var thatP = container.find('li.active')
        if (thatP.length > 0) {
          var mTop = thatP.offset().top
          var result = mTop - container.offset().top + container.scrollTop()
          container.animate({scrollTop: result}, 500)
        }
      })
    },
    showList: function (type) {
      this.isShowList = !this.isShowList
      if (type) {
        this.isShowList = true
      }
      if (this.isShowList) {
        var iframes = document.getElementsByTagName('iframe')
        if (iframes.length > 0) {
          this.IframeOnClickOut.track(iframes[0], function () {
            this.isShowList = false
          })
        }
        setTimeout(() => {
          this.goToPatientPos()
        }, 100)
        var url = 'http://' + this.common.joinUrl(location.host + this.common.baseUrl + '#/inpatient/popPage/patientList')
        if (typeof shellApi !== 'undefined') {
          // 订阅消息
          shellApi.eventBus.unregister('patientList')
          shellApi.eventBus.register('patientList', (message) => {
            var patient = JSON.parse(message)
            this.changePatient(patient)
          }, 'patientList')
          $('#patient-fixed-details').hide()
          // var hostEl = document.getElementById('header-ward')
          // var rect = hostEl.getBoundingClientRect()
          var index = shellApi.screen.getScale()
          var top = $('.platform-header').height() + window.screenTop
          var left = document.body.clientWidth - 150 + window.screenLeft
          var options = {
            'url': this.common.joinUrl(url),
            'isDialog': 'false',
            'show-titlebar': 'false',
            'title': '医惠护士',
            'hasOwner': true,
            'position': left + ',' + top,
            'width': parseInt(150 * index),
            'height': parseInt((document.body.clientHeight - $('.platform-header').height()) * index),
            'showLeftBorder': 'false',
            'showTopBorder': 'false',
            'showBottomBorder': 'false',
            'showRightBorder': 'false',
            'autoClose': 'true'
          }
          shellApi.childForm.open('patientList', options)
        }
      } else {
        // this.initIframeClick()
      }
    },
    changePatient: function (patient) {
      this.common.pageSwitchConfirm(() => {
        var tab = {
          'type': 'patient',
          'tabId': patient.patIndexNo,
          'tabName': patient.name || patient.patientName,
          'bedNo': patient.bedNo
        }
        this.$refs.headerWard.tabsAdd(tab)
        this.patIndexNo = patient.patIndexNo
        var param = {
          wardCode: this.wardCode,
          patIndexNo: patient.patIndexNo,
          refresh: 1
        }
        if (this.FMenuId) {
          param.FMenuId = this.common.getUrlParam('FMenuId')
        }
        if (this.SMenuId) {
          param.SMenuId = this.common.getUrlParam('SMenuId')
        }
        if (this.TMenuId) {
          param.TMenuId = this.common.getUrlParam('TMenuId')
        }
        this.$router.push({
          path: '/inpatient/patient/patientIndex',
          query: param
        })
        this.$refs.patientContent.getPageUrl()
        // var iframe = $('#patientIframe')[0]
        // if (iframe) {
        //   iframe.contentWindow.postMessage({curTabId: patient.patIndexNo}, '*')
        // }
        this.isShowList = false
      })
    },
    goToPageF: function (item) {
      if (item && item.subList.length === 0 && (item.menuUrl || Number(item.menuUrlType) === 3)) {
        this.common.pageSwitchConfirm(() => {
          /* eslint-disable */
          if (typeof (execFun_pageSwitch_pageContainer) !== 'undefined') {
            execFun_pageSwitch_pageContainer(false)
          }
          /* eslint-disable */
          var href = this.common.baseUrl + '#/inpatient/patient/patientIndex?wardCode=' + this.wardCode + '&patIndexNo=' + this.patIndexNo + '&FMenuId=' + item.menuId
          if (this.emcOut) {
            href += '&emcOut=1'
          }
          window.location.href = href
          this.FMenuId = item.menuId
          this.SMenuId = ''
          // this.$refs.patientContent.queryPatientMenu()
          this.$refs.patientContent.getPageUrl()
        })
      } else {
        return false
      }
    },
    goToPageS: function (first, second) {
      if (second && (second.menuUrl || Number(second.menuUrlType) == 3)) {      
        this.common.pageSwitchConfirm(() => {
          /* eslint-disable */
          if (typeof (execFun_pageSwitch_pageContainer) !== 'undefined') {
            execFun_pageSwitch_pageContainer(false)
          }
          /* eslint-disable */
          var href = this.common.baseUrl + '#/inpatient/patient/patientIndex?wardCode=' + this.wardCode + '&patIndexNo=' + this.patIndexNo + '&FMenuId=' + first.menuId + '&SMenuId=' + second.menuId
          if (this.emcOut) {
            href += '&emcOut=1'
          }
          window.location.href = href
          this.SMenuId = second.menuId
          this.TMenuId = ''
          // this.$refs.patientContent.queryPatientMenu()
          this.$refs.patientContent.getPageUrl()
        }) 
      } else {
        return false
      }
    },
    goToPageT: function (first, second, third) {
      if (third && (third.menuUrl || Number(third.menuUrlType === 3))) {
        this.common.pageSwitchConfirm(() => {
          var href = this.common.baseUrl + '#/inpatient/patient/patientIndex?wardCode=' + this.wardCode + '&patIndexNo=' + this.patIndexNo + '&FMenuId=' + first.menuId + '&SMenuId=' + second.menuId + '&TMenuId=' + third.menuId
          if (this.emcOut) {
            href += '&emcOut=1'
          }
          window.location.href = href
          this.TMenuId = third.menuId
          // this.$refs.patientContent.queryPatientMenu()
          this.$refs.patientContent.getPageUrl()
        })
      } else {
        return false
      }
    },
    initIframeClick () {
      document.activeElement.blur()
      IframeOnClickOut.iframes = []
      window.clearInterval(IframeOnClickOut.interval)
      IframeOnClickOut.interval = null
    }
  }
}
</script>

<style scoped>
</style>
