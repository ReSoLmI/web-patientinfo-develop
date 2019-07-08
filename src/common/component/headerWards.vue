<template>
<div>
  <div class="platform-header-place hasSon clearfix">
    <div class="platform-header-place-left hasSon">
        <div class="platform-logo hasSon">
            <span class="hasSon"></span>
        </div>
        <i class="platform-icon-list hasSon"></i>
    </div>
  </div>
	<div class="header">
		<div class="hd-r" style="margin-left:0px;" id="header-ward">
			<div class="hd-title header-pop-source clearfix"  id="zz" v-if="deList.length>0&&isShowDepart" :wardCode="wardCode">
				<span class="departName" @click="toPages(wardCode,depart_name,0)" :title="depart_name">{{depart_name}}</span>
        <span class="departIcon hasne" @click="showDepartList()" v-if="showDeparts"><i class="icon-angle-down hasne"></i></span>
				<div class="header-pop" id="www" style="width: 650px;max-height: calc(100vh - 60px);overflow: auto;">
					<div class="gastrlogy-body">
						<div class="tags" :class="{'tagsnoborder': index==0}" v-for="(val,key,index) in deListCH" :key="index" v-if="val.length>0">
							<label>{{key}}</label>
							<div>
								<a v-for="(el,index) in val" :key="index" class="departSelect" :class="{'curDep':el.wardCode==wardCode}" :wardCode="el.wardCode" @click="toPages(el.wardCode,el.wardName,1)">{{el.wardName}}</a>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="hd-nav-control" id="tabList" v-show="tabList.length>0">
				<i class="nav-pre" id="tab-nav-pre" @click="prevChange()"></i>
				<ul class="hd-nav" id="tab-hd-nav">
					<li v-for="(item,index) in tabList" :key="index" :class="{'active':curTabId==item.tabId}" @click="tabChange(item,true, true)">
						<a class="tab">{{item.bedNo}}床 {{item.tabName}}<i class="close" @click.stop="closeTab(item,index)"></i></a>
					</li>
				</ul>
				<i class="nav-next" id="tab-nav-next" @click="nextChange()"></i>
			</div>
			<!-- <div ms-controller="userCenter" ms-include-src="ucUrl" data-include-replace="true"></div> -->
		</div>
	</div>
</div>
</template>

<script>
import event from '../js/event.js'
window.iframeMessage = {}
export default {
  name: '',
  data () {
    return {
      baseUrl: this.common.baseUrl, // 该变量定义在app.js中
      pageUrl: '', // 默认为mine.html
      bgcls: 'bg-white',
      first: true,
      depart_name: '', // 当前科室名称
      deList: [],
      deListCH: {}, // 所属科室列表-字母
      wardCode: this.common.getUrlParam('wardCode'),

      isShowDepart: true, // 是否显示科室选择列表tab
      isShowTabs: false, // 是否显示tab列表
      bodyClass: '',
      loginId: this.common.getLoginId(),
      roleList: {}, // 权限列表
      appList: [], // 应用列表
      tabList: [], // 标签列表
      curTabId: window.sessionStorage.getItem('curTabId') || '', // 当前打开tabID -1代表待办项

      appCode: this.common.getAppCode(),
      platformUrl: this.common.getPlatformUrl() === '' ? '' : this.common.getPlatformUrl() + '/',
      showDeparts: true,
      version: '',
      isShowShade: false,
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
                  // this.initIframeClick()
                }
              } else {
                this.iframes[i].hasTracked = false
              }
            }
          }
        }
      },
      oldCookie: window.sessionStorage.getItem('tabs') || ''
    }
  },
  watch: {
    appCode (newVal, oldVal) {
      this.clearTab()
    }
  },
  mounted () {
    this.queryWardList()
    this.jdugeWardType()
    this.$nextTick(() => {
      // 把数据发送给其他组件
      event.$emit('deList', this.deList)
      this.appCode = this.common.getAppCode()
      // 如果能从URL取到appCode值代表从微应用入口进入 清除tab标签 用于住院/急诊相互切换时处理tab
      if (this.common.getUrlParam('appCode')) {
        this.clearTab()
      }
      $('#logo,#icon-th-list').fadeIn()
      if ($('body').find('.platform-header').length === 0) {
        $.getScript(this.common.getPlatformUrl() + '/static/js/header/header.js', function () {
          $('body').initHeader()
        })
      }
      if (typeof shellApi !== 'undefined') {
        // 监听地址变化
        $(window).bind('hashchange', function () {
          shellApi.windowsControlsHost.close('')
        })
      }
      layer.closeAll('loading')
      this.checkLength()
    })
    // 加载页面时从缓存中获取tab列表数据
    var tabList = []
    if (window.sessionStorage.getItem('tabs')) {
      tabList = JSON.parse(window.sessionStorage.getItem('tabs'))
    }
    if (tabList) {
      this.tabList = tabList
    }
    // 监听事件处理
    var that = this
    window.addEventListener('message', that.patientListener, false)
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('message', that.patientListener, false)
    })
    // 处理是否显示选择科室列表按钮
    var url = window.location.href
    if (url.indexOf('/patient/') > -1 || url.indexOf('transfered/patientview') > -1 || url.indexOf('discharged/patientview') > -1) {
      this.showDeparts = false
    } else {
      this.showDeparts = true
    }
  },
  methods: {
    // 监听并接受病人列表发送过来的信息
    patientListener (e) {
      var that = this
      if (e && e.data) {
        if (e.data.event) {
          if (e.data.event === 'pageSwitch') {
            window.iframeMessage.isRemind = e.data.isRemind || false
            window.iframeMessage.remindMsg = e.data.remindMsg || ''
          } else if (e.data.event === 'goToPatient') {
            var tab = {
              'type': 'patient',
              'tabId': e.data.patIndexNo,
              'tabName': e.data.patientName,
              'emcOut': e.data.emcOut,
              'bedNo': e.data.bedNo
            }
            that.tabsAdd(tab, false)
            var param = {
              wardCode: that.wardCode,
              patIndexNo: e.data.patIndexNo,
              emcOut: e.data.emcOut,
              refresh: 1
            }
            if (e.data.emcOut) {
              param.emcOut = 1
            }
            that.$router.push({
              path: '/inpatient/patient/patientIndex',
              query: param
            })
          } else if (e.data.event === 'logout') {
            this.common.logout()
          }
        }
        if (typeof e.data !== 'undefined') {
          if (typeof e.data.isRemind !== 'undefined') {
            window.iframeMessage.isRemind = e.data.isRemind || false
          }
          if (typeof e.data.logout !== 'undefined') {
            window.iframeMessage.logout = e.data.logout || false
            if (window.iframeMessage.logout === 'true' || window.iframeMessage.logout === true) {
              this.common.logout()
            }
          }
        }
      }
    },
    // 获取病区列表
    queryWardList () {
      var that = this
      var param = {
        'loginId': this.loginId
      }
      this.common.ajax({
        url: 'common-service/user/v1/units',
        dataType: 'json',
        type: 'get',
        async: false,
        data: param,
        callback: function (data) {
          that.deListCH = data
        }
      })
    },
    jdugeWardType () {
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
            this.depart_name = ward.wardName
            this.common.setLocalStorage('PAT_wardName', this.depart_name)
          }
        }
      }
      /**
       *
       *  当前应用为住院患者
       *   如果当前展示科室列表数量大于0
       *    当前科室为住院类型科室 可正常进入应用
       *    当前科室为其他类型科室
       *     住院科室列表数量大于0 默认取第一个科室code进入应用
       *     住院科室列表数量等于0 提示无住院科室权限然后退出到平台
       *   如果当前展示科室列表数量等于0
       *    提示无住院科室权限然后退出到平台
       *  当前应用为急诊患者
       *   如果当前展示科室列表数量大于0
       *    当前科室为急诊类型科室 可正常进入应用
       *    当前科室为其他类型科室
       *     急诊科室列表数量大于0 默认取第一个科室code进入应用
       *     急诊科室列表数量等于0 提示无急诊科室权限然后退出到平台
       *   如果当前展示科室列表数量等于0
       *    提示急诊院科室权限然后退出到平台
       */
      var url = window.location.href
      var wardCode = url.split('wardCode=')[1].slice(0, url.split('wardCode=')[1].indexOf('&'))
      if (this.common.getAppCode() === 'patientinfo') {
        if (this.deList.length > 0) {
          if (wardInfo.wardType !== 2) {
            if (wardInfo.inpatientWards.length > 0) {
              this.wardCode = wardInfo.inpatientWards[0].wardCode
              url = url.replace('wardCode=' + wardCode, 'wardCode=' + this.wardCode)
              window.location.href = url
            } else {
              this.common.tip_msg('您暂无住院病区权限，请联系管理员为您开通！', null, () => {
                window.location.href = this.common.getPlatformUrl() + '/#/index/appIndex?wardCode=' + this.common.getUrlParam('wardCode')
              })
            }
          }
        } else {
          this.common.tip_msg('您暂无住院病区权限，请联系管理员为您开通！', null, () => {
            window.location.href = this.common.getPlatformUrl() + '/#/index/appIndex?wardCode=' + this.common.getUrlParam('wardCode')
          })
        }
      } else if (this.common.getAppCode() === 'emergencyNursing') { // 如果是急诊应用 查询急诊科室列表
        if (this.deList.length > 0) {
          if (wardInfo.wardType !== 0) {
            if (wardInfo.emergencyWards.length > 0) {
              this.wardCode = wardInfo.emergencyWards[0].wardCode
              url = url.replace('wardCode=' + wardCode, 'wardCode=' + this.wardCode)
              window.location.href = url
            } else {
              this.common.tip_msg('您暂无急诊病区权限，请联系管理员为您开通！', null, () => {
                window.location.href = this.common.getPlatformUrl() + '/#/index/appIndex?wardCode=' + this.common.getUrlParam('wardCode')
              })
            }
          }
        } else {
          this.common.tip_msg('您暂无急诊病区权限，请联系管理员为您开通！', null, () => {
            window.location.href = this.common.getPlatformUrl() + '/#/index/appIndex?wardCode=' + this.common.getUrlParam('wardCode')
          })
        }
      }
      this.common.setLocalStorage('PAT_deList', JSON.stringify(this.deList))
      this.selectDepart()
    },
    // 切换科室
    selectDepart () {
      if (this.deList.length > 0) {
        $('#zz').fadeIn()
      } else {
        $('#zz').hide()
      }
    },
    // 是否展示选择科室
    showTabDepartList: function () {
      var hash = window.location.hash
      var appCode = this.common.getAppCode()
      if (appCode) {
        if ((appCode.indexOf('Group') === -1 && (this.roleList.power)) || appCode === 'outpatient') {
          this.isShowDepart = true
          if (hash.indexOf('patients_list') > -1) {
            $('#zz').addClass('active').siblings('li').removeClass('active')
          }
          $('#zz').fadeIn()
        } else {
          this.isShowDepart = false
        }
      } else {
        this.isShowDepart = false
      }
    },
    // 显示科室列表
    showDepartList () {
      if (typeof shellApi === 'undefined') {
        $('#www').slideToggle()
      } else if (window.location.href.indexOf('discharged') === -1 && window.location.href.indexOf('transfered') === -1) {
        shellApi.eventBus.unregister('wardList')
        shellApi.eventBus.register('wardList', (message) => {
          message = JSON.parse(message)
          this.$parent.goToPage('', message.id)
          this.changeWard(message)
        }, 'wardList')
      } else if (location.href.indexOf('/discharged/patientList') > -1) {
        shellApi.eventBus.unregister('wardList')
        shellApi.eventBus.register('wardList', (message) => {
          this.$router.push({
            path: '/discharged/patientList',
            query: {
              wardCode: message.id
            }
          })
          this.$parent.renderInit()
        }, 'wardList')
      } else {
        shellApi.eventBus.unregister('wardList')
        shellApi.eventBus.register('wardList', (message) => {
          this.$router.push({
            path: '/transfered/patientList',
            query: {
              wardCode: message.id
            }
          })
          this.$parent.renderInit()
        }, 'wardList')
      }
      $('#zz').toggleClass('active')
      if ($('#zz').hasClass('active')) {
        var iframes = document.getElementsByTagName('iframe')
        if (iframes.length > 0) {
          this.IframeOnClickOut.track(iframes[0], function () {
            if (typeof shellApi === 'undefined') {
              $('#www').slideUp()
            }
            $('#zz').removeClass('active')
          })
        }
        var url = 'http://' + this.common.joinUrl(location.host + this.baseUrl + '#/inpatient/popPage/popWard')
        if (typeof shellApi !== 'undefined') {
          var hostEl = document.getElementById('header-ward')
          var rect = hostEl.getBoundingClientRect()
          var index = shellApi.screen.getScale()
          var top = rect.top + rect.height + window.screenTop
          var left = rect.left + window.screenLeft
          var height
          var width
          if ((document.body.clientHeight - $('.platform-header').height()) * index - 20 < 546) {
            height = (document.body.clientHeight - $('.platform-header').height()) * index - 20
          } else {
            height = 546
          }
          if (document.body.clientWidth * index - 350 < 650 * index) {
            width = document.body.clientWidth * index - 350
          } else {
            width = 650 * index
          }
          var options = {
            'url': this.common.joinUrl(url),
            'isDialog': 'false',
            'show-titlebar': 'false',
            'title': '医惠护士',
            'hasOwner': true,
            'position': left + ',' + top,
            'width': parseInt(width),
            'height': parseInt(height),
            'showLeftBorder': 'false',
            'showTopBorder': 'false',
            'showBottomBorder': 'false',
            'showRightBorder': 'false',
            'autoClose': 'true'
          }
          shellApi.childForm.open('wardList', options)
        }
      } else {
        // this.initIframeClick()
      }
    },
    showTabList: function () {
      this.isShowTabs = true
      $('#tabList').fadeIn()
    },
    // 新增tab标签
    tabsAdd: function (obj, isChangeUrl) {
      var count = -1
      var tabList = []
      for (var i = 0; i < this.tabList.length; i++) {
        if (this.tabList[i].tabId === obj.tabId) {
          count = i
          break
        }
      }
      this.curTabId = obj.tabId
      window.sessionStorage.setItem('curTabId', obj.tabId)

      // 住院护理
      if (window.location.href.indexOf('discharged') === -1 && window.location.href.indexOf('transfered') === -1) {
        if (count === -1) {
          if (Number(obj.tabId) === -2) {
            this.tabList.unshift(obj)
          } else if (Number(obj.tabId) === -1) {
            if (this.tabList.length > 0 && Number(this.tabList[0].tabId) === -2) {
              this.tabList.splice(1, 0, obj)
            } else {
              this.tabList.unshift(obj)
            }
          } else {
            var oldList = []
            if (window.sessionStorage.getItem('tabs')) {
              oldList = JSON.parse(window.sessionStorage.getItem('tabs'))
            }
            if (oldList) {
              tabList = oldList
            }
            tabList.push(obj)
          }
          this.checkLength()
        } else {
          this.tabChange(this.tabList[count], isChangeUrl)
        }
      } else {
        tabList.push(obj)
      }

      for (var j = 0; j < this.tabList.length; j++) {
        var tab = {
          'type': this.tabList[j].type,
          'tabId': this.tabList[j].tabId,
          'tabName': this.tabList[j].tabName,
          'bedNo': this.tabList[j].bedNo
        }
        if (this.tabList[j].emcOut) {
          tab.emcOut = this.tabList[j].emcOut
        }
      }
      window.sessionStorage.setItem('tabs', this.oldCookie)
      if (tabList.length > 0) {
        this.tabList = tabList
        this.checkLength()
        window.sessionStorage.setItem('tabs', JSON.stringify(tabList))
      }
    },
    /* 关闭病页面 */
    closePaitent: function () {
      this.wardCode = this.common.getUrlParam('wardCode')
      if (window.location.href.indexOf('discharged') === -1 && window.location.href.indexOf('transfered') === -1) {
        window.location.href = '#/inpatient/ward/wardIndex?wardCode=' + this.wardCode + '&clear=1'
      } else if (window.location.href.indexOf('discharged') > -1) {
        window.location.href = '#/discharged/patientList?wardCode=' + this.wardCode + '&clear=1'
      } else {
        window.location.href = '#/transfered/patientList?wardCode=' + this.wardCode + '&clear=1'
      }
    },
    // tab标签左移
    prevChange: function () {
      var el = $('#tab-hd-nav')
      var left = parseInt(el.css('marginLeft'))
      left += 150
      left = left > 0 ? 0 : left
      el.attr('style', 'margin-left:' + left + 'px')
    },
    // tab标签右移
    nextChange: function () {
      var el = $('#tab-hd-nav')
      var left = parseInt(el.css('marginLeft'))
      var width = 0
      el.find('li').each(function () {
        width += $(this).width()
      })
      var max = width - el.parent().width()
      max = max < 0 ? 0 : max
      left -= 150
      left = -left > max ? -max : left
      el.attr('style', 'margin-left:' + left + 'px;')
    },
    tabChangeFun: function (tab, isChangeUrl) {
      this.curTabId = tab.tabId
      this.checkLength()
      window.sessionStorage.setItem('curTabId', this.curTabId)
      if (window.location.href.indexOf('discharged') === -1 && window.location.href.indexOf('transfered') === -1) {
        var param = {
          wardCode: this.common.getUrlParam('wardCode'),
          patIndexNo: this.curTabId,
          refresh: 1
        }
        if (tab.emcOut) {
          param.emcOut = 1
        }
        this.$router.push({
          path: '/inpatient/patient/patientIndex',
          query: param
        })
        this.$emit('renderInit', '')
        // 通知iframe页面以刷新数据
        var iframe = $('#patientIframe')[0]
        if (iframe) {
          iframe.contentWindow.postMessage({curTabId: this.curTabId}, '*')
        }
        event.$emit('curTabId', this.curTabId)
      } else if (window.location.href.indexOf('discharged') > -1) {
        this.$router.push({
          path: '/discharged/patientview',
          query: {
            wardCode: this.common.getUrlParam('wardCode'),
            patIndexNo: this.curTabId
          }
        })
      } else {
        this.$router.push({
          path: '/transfered/patientview',
          query: {
            wardCode: this.common.getUrlParam('wardCode'),
            patIndexNo: this.curTabId
          }
        })
      }
    },
    // tab标签切换
    tabChange: function (tab, isChangeUrl, showPageSwitch) {
      if (showPageSwitch) {
        this.common.pageSwitchConfirm(() => {
          this.tabChangeFun(tab, isChangeUrl)
        })
      } else {
        this.tabChangeFun(tab, isChangeUrl)
      }
    },
    // 关闭tab标签
    closeTab: function (currentTab, index) {
      this.common.pageSwitchConfirm(() => {
        if (this.curTabId === currentTab.tabId && this.tabList.length > 1) {
          if (index === 0) {
            this.curTabId = this.tabList[index + 1].tabId
            this.tabChange(this.tabList[index + 1], true, false)
          } else {
            this.curTabId = this.tabList[index - 1].tabId
            this.tabChange(this.tabList[index - 1], true, false)
          }
          window.sessionStorage.setItem('curTabId', this.curTabId)
        } else if (this.tabList.length === 1) {
          window.sessionStorage.removeItem('curTabId')
          window.sessionStorage.removeItem('tabs')
          this.closePaitent()
        }
        this.tabList.splice(index, 1)
        this.$nextTick(_ => {
          this.checkLength()
        })
        window.sessionStorage.setItem('tabs', JSON.stringify(this.tabList))
      })
    },
    // 清除tab
    clearTab () {
      window.sessionStorage.removeItem('curTabId')
      window.sessionStorage.removeItem('tabs')
      this.tabList = []
      this.checkLength()
    },
    // 检测长度
    checkLength () {
      this.$nextTick(() => {
        var width = 0
        var widthLeft = 0
        var m = 0
        $('#tabList').find('li').each(function () {
          width += $(this).width()
          if ($(this).hasClass('active')) {
            m += 1
          }
          if (m === 0) {
            widthLeft += $(this).width()
          }
        })
        widthLeft = -widthLeft
        var max = width - $('#tabList').width()
        max = max < 0 ? 0 : max
        widthLeft = -widthLeft > max ? -max : widthLeft
        $('#tab-hd-nav').attr('style', 'margin-left:' + widthLeft + 'px;')
        var pWidth = $('#tabList').width()
        if (width > pWidth) {
          $('#tab-nav-pre,#tab-nav-next').fadeIn()
        } else {
          $('#tab-nav-pre,#tab-nav-next').hide()
          $('#tab-hd-nav').removeAttr('style')
        }
      })
    },
    logout: function () {
      this.common.logout()
    },
    headerShadeClick: function () {
      this.common.pageSwitchConfirm(() => {
        this.isShowShade = false
      })
    },
    changeWard (message) {
      this.depart_name = message.name
      this.wardCode = message.id
      this.clearTab()
    },
    toPages (id, name, type) {
      this.common.pageSwitchConfirm(() => {
        if ($(event.currentTarget).hasClass('curDep')) {
          return false
        }
        this.curTabId = ''
        if (Number(type) === 0) {
          window.sessionStorage.setItem('curTabId', '')
        } else {
          this.clearTab()
        }
        this.depart_name = name
        this.wardCode = id
        this.common.setLocalStorage('PAT_wardName', this.depart_name)
        $('#www').hide()
        $('#zz').removeClass('active')
        if (window.location.href.indexOf('discharged') === -1 && window.location.href.indexOf('transfered') === -1) {
          if (window.location.hash.indexOf('/patient/') > -1) {
            var href = this.baseUrl + '#/inpatient/ward/wardIndex?wardCode=' + id + '&clear=1'
            window.location.href = href
          } else {
            this.$parent.goToPage('', id)
          }
        } else if (window.location.href.indexOf('discharged') > -1) {
          this.$router.push({
            path: '/discharged/patientList',
            query: {
              wardCode: this.wardCode
            }
          })
          this.$parent.$renderInit()
        } else {
          this.$router.push({
            path: '/transfered/patientList',
            query: {
              wardCode: this.wardCode
            }
          })
        }
      })
    },
    judgePower: function () {
      if (this.deList.length === 0) {
        window.location.href = this.platformUrl + '/#/ward/wardIndex'
        return false
      }
      if (!this.common.getUrlParam('wardCode')) {
        this.common.tip_msg('请先选择科室！', null, () => {
          window.location.href = this.common.getPlatformUrl() + '/#/ward/wardIndex'
        })
        return false
      }
    },
    initIframeClick () {
      document.activeElement.blur()
      this.IframeOnClickOut.iframes = []
      window.clearInterval(this.IframeOnClickOut.interval)
      this.IframeOnClickOut.interval = null
    }
  }
}
</script>
