<template>
	<div id="wardPageContainer" class="am-page-rcont-parent">
		<div class="am-page-lside-second" v-show="menus.length>0" id="pageMenus">
			<div class="gn-scroll">
				<ul class="lside-secondary-menu">
					<li v-for="(item,index) in menus" :key="index" v-if="item.menuUrl||item.subList" :class="getClass(item)">
						<a @click.stop="isShowSonPage(item)" :class="{'active':SMenuId==item.menuId&&!TMenuId}">
							<div class="item-badge showTip bigLabel" @click.stop="isShowSonPage(item)" :title="item.menuName"> {{item.menuName}} </div>
						</a>
						<ul v-if="item.subList&&item.subList.length>0" :id="`son_${item.menuId}`">
							<li class="son" v-for="(submenu,index) in item.subList" :key="index" :title="submenu.menuName" v-if="submenu.menuUrl">
								<a :href="getHrefUrl(item,submenu)" @click="showPage($event)" class="showTip" :class="{'active':TMenuId == submenu.menuId}" :data-title="submenu.menuName">{{submenu.menuName}}</a>
							</li>
						</ul>
					</li>
				</ul>
			</div>
		</div>
		<div class="am-page-rcont" :class="{'ml-170':menus.length>0}" id="am-page-rcont">
			<div v-if="loading==1 || urlInfo.menuUrlType!=3" style="overflow:hidden;height:100%;" id="pageCon">
        <iframe :src="pageUrl" class="iframeContainer" id="wardIframe" marginheight="0" marginwidth="0" frameborder="0" scrolling="auto" style="height:100%;vertical-align: top;"></iframe>
			</div>
			<div class="loading-data" v-if="loading==0 || urlInfo.menuUrlType==3"> 数据加载中.... </div>
      <div class="no-data no-data-smile no-data-fixed" v-if="!pageUrl && loading==1">
        <div class="img"></div>
        <div class="responsive-txt">
          <div class="txt"><span> 暂未配置相关界面哦~ </span></div>
        </div>
      </div>
		</div>
	</div>
</template>

<script>
import event from '../../../common/js/event.js'
// import common from '../../common/js/common.js'
export default {
  name: '',
  props: ['indexMenus'],
  data () {
    return {
      wardCode: this.common.getUrlParam('wardCode'), // 科室code
      loading: 0, // 加载中标志
      pageUrl: '', // iframe页面URL地址
      FMenuId: '', // 一级菜单ID
      SMenuId: '', // 二级菜单ID
      TMenuId: '', // 三级菜单ID
      deList: [], // 病区信息列表
      menus: [], // 当前页面菜单列表变量
      urlInfo: {} // 当前菜单变量
    }
  },
  mounted () {
    // 公共组件发送过来的数据
    event.$on('deList', (list) => {
      this.deList = list
      // 获取对应的界面地址
      this.getPageUrl()
    })
    // 默认清空iframeURL地址
    // this.pageUrl = ''
    // 获取wardCode参数
    // this.wardCode = this.common.getUrlParam('wardCode')
    // 获取菜单ID
    // this.getMenuIds()

    // 第一次进入界面时 或 菜单数量为0时 获取菜单数据
    if (this.common.getUrlParam('refresh') === 1 || this.common.getUrlParam('clear') === 1 || this.menus.length === 0) {
      this.loading = 0
      this.queryMenusNew()
    } else {
      this.showMenuTooltip()
    }
    // 菜单的展开与收起
    this.$nextTick(_ => {
      this.showSonMenu()
    })
  },
  methods: {
    // 获取菜单
    queryMenusNew () {
      this.getMenuIds()
      if (!this.FMenuId) {
        return false
      }
      var data = []
      for (var o = 0; o < this.indexMenus.length; o++) {
        if (Number(this.indexMenus[o].menuId) === Number(this.FMenuId)) {
          data = this.indexMenus[o].subList
          break
        }
      }
      var list = []
      for (var i = 0; i < data.length; i++) {
        data[i].subList = data[i].subList ? data[i].subList : []
        var dataE = data[i]
        if (dataE.subList && dataE.subList.length > 0) {
          var count = 0
          for (var m = 0; m < dataE.subList.length; m++) {
            if (dataE.subList[m].menuUrl) {
              count += 1
            }
            data[i].subList[m].subList = data[i].subList[m].subList ? data[i].subList[m].subList : []
          }
          dataE.menuCount = count
        } else if (dataE.menuUrl) {
          dataE.menuCount = 1
        }
        if (dataE.menuCount > 0) {
          list.push(dataE)
        }
      }
      this.menus = list
      this.showMenuTooltip()
      if (this.menus.length > 0) {
        $('#pageMenus').stop().fadeIn()
      } else {
        $('#pageMenus').stop().fadeOut()
      }
    },
    // 展示tooltips插件
    showMenuTooltip () {
      this.$nextTick(_ => {
        $('.showTip').tooltip({
          container: 'body',
          placement: 'auto top',
          title: function () {
            // 二级菜单字数超过6个 三级菜单字数超过8个时 鼠标放上去展示展示全部菜单名称
            var length = $(this).hasClass('bigLabel') ? 6 : 8
            var title = $(this).attr('data-title')
            if (title.length > length) {
              return title
            }
          }
        })
      })
    },
    /**
    * 根据菜单属性 获取对应的样式名称
    * @param {object} item 菜单对象
    */
    getClass (item) {
      var className = ''
      if (item && item.subList && item.subList.length > 0) {
        className += 'li-angle'
      }
      return className
    },
    // 菜单的收展
    showSonMenu () {
      $('.li-angle').click(function () {
        $(event.currentTarget).find('ul').stop().slideToggle()
        $(event.currentTarget).toggleClass('open')
        // event.stopPropagation()
        // event.preventDefault()
      })
    },
    /**
		 * 打开菜单对应的二级菜单页面
		 * @param {object} item 菜单对象
		 */
    isShowSonPage (item) {
      if (!item.subList || item.subList.length === 0) {
        window.location.href = this.common.baseUrl + '#/inpatient/ward/wardIndex?wardCode=' + this.common.getUrlParam('wardCode') + '&FMenuId=' + this.FMenuId + '&SMenuId=' + item.menuId
        this.queryMenusNew()
        this.getPageUrl()
      }
    },
    /**
		 * 拼接三级菜单参数
		 * @param {object} item 当前父类菜单对象
		 * @param {object} el 当前菜单对象
		 */
    getHrefUrl (item, el) {
      if (!item || !el) {
        return ''
      }
      var href = this.common.baseUrl + '#/inpatient/ward/wardIndex?wardCode=' + this.common.getUrlParam('wardCode') + '&FMenuId=' + this.FMenuId + '&SMenuId=' + item.menuId + '&TMenuId=' + el.menuId
      return href
    },

    // 阻止父类事件冒泡
    showPage (event) {
      // this.queryMenusNew()
      window.location.href = $(event.currentTarget).attr('href')
      this.getMenuIds()
      this.getPageUrl()
      // event.stopPropagation()
      // event.preventDefault();
      // return false
    },

    // 获取当前选中菜单对应界面URL
    getPageUrl () {
      // 获取菜单ID
      this.getMenuIds()
      // 获取科室数据源
      var dataInfo = {}
      var deList = this.deList
      if (deList && deList.length > 0) {
        for (var i = 0; i < deList.length; i++) {
          if (deList[i].wardCode === this.common.getUrlParam('wardCode')) {
            dataInfo = deList[i]
            break
          }
        }
      }
      // 获取URL信息
      var urlInfo = this.common.getPageUrlNew(this.indexMenus, this.FMenuId, this.SMenuId, this.TMenuId, dataInfo)
      // 判断是url还是客户端方法
      // if (urlInfo.pageUrl && Number(urlInfo.menuUrlType) !== 3) {
      //   urlInfo.pageUrl += '&transFun=execFun_pageContainer&transLogoutFun=execFun_logout_pageContainer'
      // }
      // 打开过客户端先关闭
      if (Number(this.urlInfo.menuUrlType) === 3) {
        shellApi.windowsControlsHost.close(urlInfo.sceneName)
      }
      // 如果URL的uid为360 用IE浏览器打开该URL页面 否则直接iframe引入该页面
      if (urlInfo.uid === '360') {
        // eslint-disable-next-line
        startPrject('ie', urlInfo.pageUrl)
        this.loading = 1
      } else {
        if (Number(urlInfo.menuUrlType) === 3) {
          var hostEl = document.getElementById('am-page-rcont')
          var rect = hostEl.getBoundingClientRect()
          var index = shellApi.screen.getScale()
          shellApi.windowsControlsHost[urlInfo.methodName](urlInfo.sceneName, urlInfo.appName, urlInfo.pageUrl, parseInt(rect.left * index), parseInt(rect.top * index), parseInt((window.innerWidth - rect.left) * index), parseInt((window.innerHeight - rect.top) * index))
          this.loading = 0
        } else {
          this.pageUrl = urlInfo.pageUrl
          this.$forceUpdate()
          $('#wardIframe').remove()
          $('#pageCon').append('<iframe class="iframeContainer" id="wardIframe" marginheight="0" marginwidth="0" frameborder="0" scrolling="auto" style="height:100%;vertical-align: top;" src="' + urlInfo.pageUrl + '"></iframe>')
          this.loading = 1
        }
      }
      this.urlInfo = urlInfo

      this.$nextTick(_ => {
        // 展开对应的菜单
        $('#son_' + this.SMenuId).show()
        $('#son_' + this.SMenuId).parents('li').addClass('open')
      })
    },

    // 获取菜单ID 主要处理默认界面进来没传入菜单ID时情况
    getMenuIds () {
      // 默认从URL参数上获取一级菜单ID
      this.FMenuId = this.common.getUrlParam('FMenuId')
      // 默认从URL参数上获取二级菜单ID
      this.SMenuId = this.common.getUrlParam('SMenuId')
      // 默认从URL参数上获取三级菜单ID
      this.TMenuId = this.common.getUrlParam('TMenuId')
      // 默认进来没选中任何菜单时 选中第一个菜单打开对应界面
      if (this.indexMenus.length > 0 && !this.FMenuId && !this.SMenuId && !this.TMenuId) {
        // 一级菜单ID 默认为第一个子菜单ID
        this.FMenuId = this.indexMenus[0].menuId
        if (this.indexMenus[0].subList.length > 0) { // 如果第一个一级菜单含有二级菜单 则二级菜单ID默认取此二级菜单第一条数据ID
          this.SMenuId = this.indexMenus[0].subList[0].menuId
          if (this.indexMenus[0].subList[0].subList.length > 0) { // 如果第一个二级菜单含有三级菜单 则三级菜单ID默认取此三级菜单第一条数据ID
            this.TMenuId = this.indexMenus[0].subList[0].subList[0].menuId
          }
        }
      }
    },
    /**
     * 新增tab数据
     * @param {string} patIndexNo 病人编号
     * @param {string} patientName 病人姓名
     * @param {boolean} emcOut 是否为急诊出科患者
     * @param {string} bedNo 病人床号
     */
    tabsAdd: function (patIndexNo, patientName, emcOut, bedNo) {
      // var tab={
      //   'type': 'patient',
      //   'tabId': patIndexNo,
      //   'tabName': patientName,
      //   'emcOut':  emcOut,
      //   'bedNo':  bedNo
      // }
      // avalon.vmodels.root.tabsAdd(tab, false)
      // if (avalon.vmodels.patientPageIndex) {
      //   avalon.vmodels.patientPageIndex.menus = []
      //   avalon.vmodels.patientPageIndex.patientList = []
      // }
      // setTimeout(function(){
      //   var href = '#!/patientinfo/html/patient/pageContainer?wardCode='+wardPageContainerVm.wardCode+'&patIndexNo='+patIndexNo+'&refresh=1'
      //   if (emcOut) {
      //     href += '&emcOut=1'
      //   }
      //   window.location.href = href
      // }, 100)

    },
    /**
     * 跳转到患者详情页
     * @param {object} data 参数值
     */
    goToPatient: function (data) {
      // this.tabsAdd(data.patIndexNo, data.patientName, data.emcOut, data.bedNo)
    },
    // 重新计算打开客户端方法
    openWinform () {
      if (Number(this.urlInfo.menuUrlType) === 3) {
        var hostEl = document.getElementById('am-page-rcont')
        var rect = hostEl.getBoundingClientRect()
        var index = shellApi.screen.getScale()
        shellApi.windowsControlsHost.moveTo(this.urlInfo.sceneName, parseInt(rect.left * index), parseInt(rect.top * index))
        shellApi.windowsControlsHost.resizeTo(this.urlInfo.sceneName, parseInt((window.innerWidth - rect.left) * index), parseInt((window.innerHeight - rect.top) * index))
      }
    }
  }
}
</script>

<style scoped>
</style>
