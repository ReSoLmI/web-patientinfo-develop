<template>
  <div class="index_sheet">
    <div class="noLeftMenu am-page-rcont-parent bg-main" style="left:0px;">
      <div class="am-page-lside-second am-page-lside-pageThird" style="position:fixed;left:0px;top:0px;overflow-x:hidden;">
        <div class="gn-scroll">
          <ul class="lside-secondary-menu">
              <li v-for="(first, $index) in patientMenus" :key="$index" :class="{'li-angle': first.subList.length>0}"  @click="showSonMenu()">
                  <!-- 一级菜单 -->
                  <a class="showTip bigLabel" :class="{active:first.menuId==FMenuId&&!SMenuId}"  :data-title="first.menuName" @click="goToPageF(first)">{{first.menuName}}<i class="angle"></i></a>
                  <!-- 二级菜单 -->
                  <ul v-if="first.subList&&first.subList.length>0" :id="'son2_'+first.menuId">
                      <li v-for="(second, $index1) in first.subList" :key="$index1"  @click="showPage()" class="son">
                          <a class="showTip" :class="{active:SMenuId==second.menuId&&!TMenuId,on:SMenuId==second.menuId&&TMenuId}" :data-title="second.menuName" @click="goToPageS(first,second)">{{second.menuName}}</a>
                          <!-- 三级菜单 -->
                          <ul class="ul-third" style="display: block;" v-if="second.subList.length>0" :id="'son3_' + second.menuId">
                              <li v-for="(third, $index2) in second.subList" :key="$index2" @click="showPage()" class="son">
                                  <a @click="goToPageT(first,second,third)" class="showTip bigLabel" :data-title="third.menuName" :class="{active:TMenuId==third.menuId}">{{third.menuName}}</a>
                              </li>
                          </ul>
                      </li>
                  </ul>
              </li>
          </ul>
        </div>
      </div>
      <div class="am-page-rcont ml-170">
        <div v-show="!loading" style="display:none;overflow:hidden;height:100%;" id="pageBackCon">
            <iframe :src="pageUrl" class="iframeContainer" marginheight="0" marginwidth="0" frameborder="0" scrolling="auto" v-if="pageUrl" style="height:100%!important;vertical-align: top;background: #fff;"></iframe>
            <div class="no-data no-data-smile no-data-fixed" v-if="!pageUrl">
              <div class="img"></div>
              <div class="responsive-txt">
                <div class="txt" v-if="patIndexNo"><span>暂未配置相关界面哦~</span></div>
                <div class="txt" v-if="!patIndexNo"><span>未查找到相关病人信息哦~</span></div>
              </div>
            </div>
        </div>
        <div class="loading-data" v-if="loading">
            数据加载中....
        </div>
      </div>
    </div>
  </div>
</template>

<script>
window.iframeMessage = {}
export default {
  name: 'pageThird',
  data () {
    return {
      patientMenus: [],
      wardCode: '',
      pageUrl: '',
      loading: 0,
      dataInfo: {},
      FMenuId: this.common.getUrlParam('FMenuId'),
      SMenuId: this.common.getUrlParam('SMenuId'),
      TMenuId: this.common.getUrlParam('TMenuId'),
      patIndexNo: ''
    }
  },
  mounted () {
    var islogin = this.common.isLogin()
    if (!islogin) {
      return false
    }
    this.renderInit()
    var that = this
    window.addEventListener('message', that.patientListener, false)
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('message', that.patientListener, false)
    })
  },
  methods: {
    patientListener (e) {
      if (e && e.data) {
        if (e.data.event === 'pageSwitch') {
          window.iframeMessage.isRemind = e.data.isRemind || false
          window.iframeMessage.remindMsg = e.data.remindMsg || ''
        } else if (e.data.event === 'logout') {
          this.common.logout()
        }
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
    },
    renderInit () {
      this.loading = true
      this.wardCode = this.common.getUrlParam('wardCode')
      this.FMenuId = this.common.getUrlParam('FMenuId')
      this.SMenuId = this.common.getUrlParam('SMenuId')
      this.TMenuId = this.common.getUrlParam('TMenuId')

      this.patIndexNo = this.common.queryParam('patIndexNo_t')
      if (!this.patIndexNo) {
        this.loading = false
        return false
      }
      if (this.patientMenus.length === 0 || (this.common.getUrlParam('refresh') && Number(this.common.getUrlParam('refresh')) === 1)) {
        this.queryPatientMenuNew()
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
      this.getPageUrl()
    },
    // 查询菜单
    queryPatientMenuNew () {
      var param = {
        'category': this.common.queryParam('category_t') || '2', // 1-病区，2-患者
        'menuType': 'pc',
        'topMenuCode': this.common.getAppCode(),
        'wardCode': this.wardCode
      }
      this.common.ajax({
        url: 'common-service/external/thirdparty/access',
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
          this.patientMenus = list
          this.showMenuTooltip()
        }
      })
    },
    getPageUrl () {
      this.FMenuId = this.common.getUrlParam('FMenuId')
      this.SMenuId = this.common.getUrlParam('SMenuId')
      this.TMenuId = this.common.getUrlParam('TMenuId')
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
      this.pageUrl = ''
      var urlInfo = this.common.getPageUrlNew(this.patientMenus, this.FMenuId, this.SMenuId, this.TMenuId, this.dataInfo)
      // 如果URL的uid为360 用IE浏览器打开该URL页面 否则直接iframe引入该页面
      if (urlInfo.uid === '360') {
        window.startPrject('ie', urlInfo.pageUrl)
      } else {
        this.pageUrl = urlInfo.pageUrl
      }
      this.loading = false
      layer.closeAll()

      this.$nextTick(function () {
        $('#son2_' + this.FMenuId).show()
        $('#son2_' + this.FMenuId).parents('li').addClass('open')
      })
    },
    destroyTooltip () {
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
    showSonMenu () {
      $(event.currentTarget).find('ul').eq(0).slideToggle()
      $(event.currentTarget).siblings('li').find('ul').eq(0).slideUp()
      $(event.currentTarget).toggleClass('open')
    },
    showPage: function () {
      event.stopPropagation()
      return false
    },
    goToPageF: function (item) {
      if (item && item.subList.length === 0 && item.menuUrl) {
        this.common.pageSwitchConfirm(() => {
          var href = this.common.baseUrl + '#/inpatient/patient/pageThird?wardCode=' + this.wardCode + '&patIndexNo=' + this.patIndexNo + '&FMenuId=' + item.menuId
          if (this.common.queryParam('mrn_t')) {
            href += '&mrn=' + this.common.queryParam('mrn_t')
          }
          if (this.common.queryParam('patientId_t')) {
            href += '&patientId=' + this.common.queryParam('patientId_t')
          }
          window.location.href = href
          this.getPageUrl()
        })
      } else {
        return false
      }
    },
    goToPageS (first, second) {
      if (second && second.menuUrl) {
        this.common.pageSwitchConfirm(() => {
          var href = this.common.baseUrl + '#/inpatient/patient/pageThird?wardCode=' + this.wardCode + '&patIndexNo=' + this.patIndexNo + '&FMenuId=' + first.menuId + '&SMenuId=' + second.menuId
          if (this.common.queryParam('mrn_t')) {
            href += '&mrn=' + this.common.queryParam('mrn_t')
          }
          if (this.common.queryParam('patientId_t')) {
            href += '&patientId=' + this.common.queryParam('patientId_t')
          }
          window.location.href = href
          this.getPageUrl()
        })
      } else {
        return false
      }
    },
    goToPageT: function (first, second, third) {
      if (third && third.menuUrl) {
        this.common.pageSwitchConfirm(() => {
          var href = this.common.baseUrl + '#/inpatient/patient/pageThird?wardCode=' + this.wardCode + '&patIndexNo=' + this.patIndexNo + '&FMenuId=' + first.menuId + '&SMenuId=' + second.menuId + '&TMenuId=' + third.menuId
          if (this.common.queryParam('mrn_t')) {
            href += '&mrn=' + this.common.queryParam('mrn_t')
          }
          if (this.common.queryParam('patientId_t')) {
            href += '&patientId=' + this.common.queryParam('patientId_t')
          }
          window.location.href = href
          this.getPageUrl()
        })
      } else {
        return false
      }
    }
  }
}
</script>

<style scoped>
</style>
