<template>
	<div id="patientPageContainer">
		<div class="am-page-rcont ml-170" id="am-page-rcont">
			<div v-show="loading==1" style="display:none;overflow:hidden;height:100%;" id="pageBackCon">
				<!-- <iframe :src="pageUrl" class="iframeContainer" id="patientIframe" marginheight="0" marginwidth="0" frameborder="0" scrolling="auto" v-if="pageUrl" style="height:100%!important;vertical-align: top;"></iframe> -->
				<div class="no-data no-data-smile no-data-fixed" v-if="!pageUrl">
					<div class="img"></div>
					<div class="responsive-txt">
						<div class="txt"><span>暂未配置相关界面哦~</span></div>
					</div>
				</div>
		</div>
		<div class="loading-data" v-if="loading==0">
			数据加载中....
		</div>
	</div>
  </div>
</template>

<script>
import event from '../../../common/js/event.js'
export default {
  name: '',
  props: ['emcOut', 'patientMenus'],
  data () {
    return {
      wardCode: this.common.getUrlParam('wardCode'),
      organCode: this.common.getOrganCode(),
      patIndexNo: this.common.getUrlParam('patIndexNo'),
      patientName: '',
      menus: [],
      pageUrl: '',
      FMenuId: '',
      SMenuId: '',
      TMenuId: '',
      loading: 0,
      isRemind: false,
      remindMsg: '',
      dataInfo: {},
      urlInfo: {}
    }
  },
  mounted () {
    var islogin = this.common.isLogin()
    if (!islogin) {
      return false
    }
    this.patIndexNo = this.common.getUrlParam('patIndexNo')
    this.init()

    event.$on('deList', (list) => {
      this.deList = list
      // 获取对应的界面地址
      this.getPageUrl()
    })

    // 移除其余监听
    // if (typeof (wardPageContainerListener) !== 'undefined') {
    //   window.removeEventListener('message', wardPageContainerListener, false)
    // }
    // window.removeEventListener('message', patientPageContainerListener, false)
  },
  methods: {
    init: function () {
      this.loading = 0
      this.pageUrl = ''
      this.isRemind = false
      this.remindMsg = ''
      this.wardCode = this.common.getUrlParam('wardCode')
      this.patIndexNo = this.common.getUrlParam('patIndexNo')
      this.menus = this.patientMenus.concat()
      var tabList = []
      if (window.sessionStorage.getItem('tabs')) {
        tabList = JSON.parse(window.sessionStorage.getItem('tabs'))
      }
      for (var i = 0; i < tabList.length; i++) {
        if (tabList[i].tabId === this.patIndexNo) {
          this.patientName = tabList[i].tabName
          break
        }
      }
      if (this.menus.length === 0) {
        this.queryPatientMenuNew()
      }
      if (Number(this.common.getUrlParam('refresh')) === 1 || !this.dataInfo.patIndexNo) {
        this.queryPatientInfo()
      } else {
        this.getPageUrl()
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
          that.menus = list
        }
      })
    },
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
          that.menus = list
        }
      })
    },
    getPageUrl: function () {
      this.FMenuId = this.common.getUrlParam('FMenuId')
      this.SMenuId = this.common.getUrlParam('SMenuId')
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

      // 获取科室数据源 科室数据永远取当前科室数据
      var deList = this.deList
      if (deList && deList.length > 0) {
        for (var i = 0; i < deList.length; i++) {
          if (deList[i].wardCode === this.common.getUrlParam('wardCode')) {
            for (var key in deList[i]) {
              this.dataInfo[key] = deList[i][key]
            }
            break
          }
        }
      }

      var urlInfo = this.common.getPageUrlNew(this.menus, this.FMenuId, this.SMenuId, this.TMenuId, this.dataInfo)
      if (Number(urlInfo.menuUrlType) !== 3) {
        if (urlInfo.pageUrl) {
          urlInfo.pageUrl += '&patientName=' + this.patientName // + '&transLogoutFun=execFun_logout_pageContainer&transPageSwitchFun=execFun_pageSwitch_pageContainer'
        }
        if (this.emcOut) {
          urlInfo.pageUrl += '&emcOut=1'
        }
      }
      // 打开过客户端先关闭
      if (Number(this.urlInfo.menuUrlType) === 3) {
        shellApi.windowsControlsHost.close(urlInfo.sceneName)
      }
      // 如果URL的uid为360 用IE浏览器打开该URL页面 否则直接iframe引入该页面
      if (urlInfo.uid === '360') {
        // eslint-disable-next-line
        startPrject('ie', urlInfo.pageUrl)
      } else {
        if (Number(urlInfo.menuUrlType) === 3) {
          var hostEl = document.getElementById('am-page-rcont')
          var rect = hostEl.getBoundingClientRect()
          var index = shellApi.screen.getScale()
          shellApi.windowsControlsHost[urlInfo.methodName](urlInfo.sceneName, urlInfo.appName, urlInfo.pageUrl, parseInt(rect.left * index), parseInt(rect.top * index), parseInt((window.innerWidth - rect.left) * index), parseInt((window.innerHeight - rect.top) * index))
        } else {
          this.pageUrl = urlInfo.pageUrl
          $('#patientIframe').remove()
          $('#pageBackCon').append('<iframe class="iframeContainer" id="patientIframe" marginheight="0" marginwidth="0" frameborder="0" scrolling="auto" style="height:100%;vertical-align: top;" src="' + urlInfo.pageUrl + '"></iframe>')
        }
      }
      this.urlInfo = urlInfo

      this.loading = 1
      layer.closeAll()

      this.$nextTick(() => {
        $('#son2_' + this.FMenuId).show()
        $('#son2_' + this.FMenuId).parents('li').addClass('open')
      })
    },
    // 重新计算打开客户端方法
    openWinform: function () {
      if (Number(this.urlInfo.menuUrlType) === 3) {
        var hostEl = document.getElementById('am-page-rcont')
        var rect = hostEl.getBoundingClientRect()
        var index = shellApi.screen.getScale()
        shellApi.windowsControlsHost.moveTo(this.urlInfo.sceneName, parseInt(rect.left * index), parseInt(rect.top * index))
        shellApi.windowsControlsHost.resizeTo(this.urlInfo.sceneName, parseInt((window.innerWidth - rect.left) * index), parseInt((window.innerHeight - rect.top) * index))
        // shellApi.windowsControlsHost.resizeTo(wardPageContainerVm.urlInfo.sceneName, parseInt(rect.left * index), parseInt(rect.top * index));
      }
    },
    queryPatientInfo: function (callbackFun) {
      var that = this
      this.common.ajax({
        url: 'baseinfo2.0/allType/patients',
        dataType: 'json',
        type: 'get',
        data: {
          organCode: this.organCode,
          sourceType: 'IH',
          patIndexNo: this.patIndexNo
        },
        callback: function (data) {
          if (data && data.length > 0) {
            that.dataInfo = data[0]
            that.getPageUrl()
          } else {
            that.common.tip_msg('查不到相关病人信息！')
          }
        }
      })
    },
    logout: function () {
      this.common.logout()
    },
    pageSwitch: function (data) {
      // console.log('isRemind:', data.isRemind)
      // console.log('msg:', data.remindMsg)
      this.isRemind = data.isRemind
      this.remindMsg = data.remindMsg
      // avalon.vmodels.root.isShowShade = data.isRemind
    }
  }
}

</script>

<style scoped>
.fixed-patient-b {
	position: absolute;
	left: 170px;
	right: 0;
	bottom: 0;
	padding: 10px 0;
	text-align: center;
	background: #f7f7f7;
	border: 1px solid #e5e5e5;
}
.am-page-rcont {
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
}
.am-page-rcont-fixed {
	position: absolute;
	left: 170px;
	right: 0;
	top: 0;
	bottom: 0;
	overflow: auto;
}
.am-page-rcont-fixed.bt-52 {
	bottom: 52px;
}
</style>
