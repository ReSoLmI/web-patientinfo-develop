<template>
  <div class="container-ward-index">
    <head-ward ref="headerWard" :goToPage ="goToPage"></head-ward>
    <div class="am-page-lside" :class="{'spread':isOpen}">
      <a class="status-switch" @click="controlMenu()">
        <span class="line-1"></span>
        <span class="line-2"></span>
        <span class="line-3"></span>
      </a>
      <!-- 菜单展示区域 start -->
      <ul class="lside-menu-min">
        <li v-for="(menu,index) in menusList" :key="index" :class="{'active':menu.menuId==FMenuId}">
          <!-- <a @click="goToPage(menu)" v-if="(menu.subList.length==0 && menu.menuUrl)||menu.menuUrlType=='3'" :href="`/#/inpatient/ward/wardIndex?wardCode=${wardCode}&FMenuId=${menu.menuId}&refresh=1`" @mouseover="showMenuTitle" @mouseleave="resetMenuTitle()"> -->
          <a @click="goToPage(menu)" v-if="(menu.subList.length==0 && menu.menuUrl)||menu.menuUrlType=='3'"  @mouseover="showMenuTitle" @mouseleave="resetMenuTitle()">
            <img :src="menu.logo" />
            <div class="txt" :title="menu.menuName">{{menu.menuName}}</div>
          </a>
          <a v-if="menu.subList.length>0" @click="goToSon(menu.subList,menu.menuId,0)" @mouseover="showMenuTitle" @mouseleave="resetMenuTitle()">
            <img :src="menu.logo" />
            <div class="txt" :title="menu.menuName">{{menu.menuName}}</div>
          </a>
        </li>
      </ul>
      <!-- 菜单展示区域 end -->
    </div>
    <!-- 右侧内容区域 -->
    <menu-content :indexMenus="menusList" ref="wardContent"></menu-content>
  </div>
</template>
<script>
import headWard from '../../../common/component/headerWards'
import menuContent from './wardContainer'
export default {
  name: 'wardIndex',
  components: {headWard, menuContent},
  data () {
    return {
      isOpen: false, // 控制菜单是否展开
      pageUrl: '', // 当前引入URL地址
      wardCode: this.common.getUrlParam('wardCode'), // 科室code
      menusList: [], // 菜单列表
      backlogTotalNum: 0, // 待办项个数
      first: true,
      FMenuId: this.common.getUrlParam('FMenuId') // 一级菜单ID
    }
  },
  created () {
    this.queryMenus()
  },
  methods: {
    // 从配置中心读取菜单数据
    queryMenus () {
      var that = this
      var param = {
        'category': '1', // 1-病区，2-患者
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
          var menusList = []
          for (var i = 0; i < data.length; i++) {
            data[i].subList = data[i].subList ? data[i].subList : []
            if (data[i].menuUrl || data[i].subList) {
              menusList.push(data[i])
            }
          }
          that.menusList = menusList
          if (!that.FMenuId && that.menusList.length > 0) {
            that.FMenuId = that.menusList[0].menuId
          }
        }
      })
    },
    // 跳转到对应的菜单
    goToPage (menu, id) {
      if (!menu) {
        menu = this.menusList[0]
        this.wardCode = id
      }
      this.FMenuId = menu.menuId
      this.$router.push({
        path: '/inpatient/ward/wardIndex',
        query: {
          wardCode: this.wardCode,
          FMenuId: menu.menuId,
          refresh: 1
        }
      })
      this.$refs.wardContent.queryMenusNew()
      this.$refs.wardContent.getPageUrl()
    },
    /* 界面跳转
    * @param {array} menuList 当前操作一级菜单对应子类菜单列表
    * @param {string} menuId 当前操作一级菜单ID
    * @param {number} index 当前默认要打开的菜单index值
    */
    goToSon (menuList, menuId, index) {
      if (menuList.length > 0) {
        // 二级菜单
        var son = menuList[index]
        // 含有三级菜单时 界面跳转 传入一、二、三级菜单code
        if (son.subList && son.subList.length > 0) {
          window.location.href = this.common.baseUrl + '#/inpatient/ward/wardIndex?wardCode=' + this.wardCode + '&FMenuId=' + menuId + '&SMenuId=' + son.menuId + '&TMenuId=' + son.subList[0].menuId + '&refresh=1'
        } else if (son.menuUrl || son.menuType === 3) { // 不含有三级菜单时 界面跳转 传入一、二级菜单code
          window.location.href = this.common.baseUrl + '#/inpatient/ward/wardIndex?wardCode=' + this.wardCode + '&FMenuId=' + menuId + '&SMenuId=' + son.menuId + '&refresh=1'
        } else { // 以上条件都不满足时 递归查询下一个菜单是否满足条件
          this.goToSon(menuList, menuId, index + 1)
        }
      }
      this.FMenuId = menuId
      this.$refs.wardContent.queryMenusNew()
      this.$refs.wardContent.showSonMenu()
      this.$refs.wardContent.getPageUrl()
    },
    // 控制菜单是否展开
    controlMenu () {
      if (this.isOpen === true) {
        this.isOpen = false
      } else {
        this.isOpen = true
      }
      // 如果是客户端的需要调整位置
      window.setTimeout(() => {
        this.$refs.wardContent.openWinform()
      }, 200)
    },
    // 控制菜单名称悬浮展示
    showMenuTitle () {
      var $this = $(event.currentTarget)
      // 菜单折叠时方可控制菜单悬浮展示
      if (!$('.am-page-lside').hasClass('spread')) {
        var offsetTop = $this.offset().top
        var titleEle = $this.find('.txt')
        titleEle.css({top: offsetTop})
      }
    },
    // 重置菜单名称展示
    resetMenuTitle () {
      var $this = $(event.currentTarget)
      var titleEle = $this.find('.txt')
      titleEle.removeAttr('style')
    }
  },
  mounted () {
    var that = this
    $(window).resize(() => {
      that.$refs.wardContent.openWinform()
    })
    if (typeof shellApi !== 'undefined') {
      // 订阅消息
      // shellApi.eventBus.unregister('wardList')
      // shellApi.eventBus.register('wardList', (message) => {
      //   message = JSON.parse(message)
      //   this.goToPage('', message.id)
      //   this.$refs.headerWard.changeWard(message)
      // }, 'wardList')
      // 关闭弹框的回调
      shellApi.childForm.on('wardListFormClosed', function () {
        $('#zz').removeClass('active')
      })
    }
  }
}
</script>
<style scoped>
</style>
