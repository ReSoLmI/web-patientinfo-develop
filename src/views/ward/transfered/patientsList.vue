<template>
  <div class="bg-main">
    <head-ward ref="headerWard" :renderInit="$renderInit"></head-ward>
    <div class="am-page-full bg-main">
      <div class="hbox">
        <div v-show="loading==1">
          <div class="am-condition am-nmtlr-20">
            <div class="am-calendar-step">
              <span class="txt">起</span>
              <input
                type="text"
                class="Wdate"
                onClick="WdatePicker({skin:'twoer',maxDate:'%y-%M-%d',isShowClear:false,errDealMode:1,readOnly:true,onpicked:removeOthers})"
                v-model="from"
                @focus="changeTime('from')"
                readonly
              >
              <a class="calendar-pre" @click="$prev(0)" id="pre_from"></a>
              <a class="calendar-next" @click="$next(0)" id="next_from"></a>
              <span class="txt">止</span>
              <input
                type="text"
                class="Wdate"
                onClick="WdatePicker({skin:'twoer',maxDate:'%y-%M-%d',isShowClear:false,errDealMode:1,readOnly:true,onpicked:removeOthers})"
                v-model="to"
                @focus="changeTime('to')"
                readonly
              >
              <a class="calendar-pre" @click="$prev(1)" id="pre_to"></a>
              <a class="calendar-next last" @click="$next(1)" id="next_to"></a>
            </div>
            <div class="am-btn-rdo am-ml-10" name="date">
              <a class="active" @click="$getData(1)" name="week">一周</a>
              <a @click="$getData(2)">一月</a>
              <a @click="$getData(3)">三月</a>
            </div>

            <div class="cm-right">
              住院号：
              <input type="text" class="input-text w150" maxlength="16" v-model="mrn">
              <span class="am-ml-10">姓名：</span>
              <input type="text" class="input-text w150" maxlength="10" v-model="name">
              <a class="am-btn am-btn-primary am-ml-10" @click="$query_data(1)">查询</a>
            </div>
          </div>
          <div class="am-mt-20 am-page-content bg-white">
            <div class="am-tb-fixed-hd">
              <table class="am-tb am-tb-layout am-tb-sort">
                <colgroup>
                  <col style="width: 60px;">
                  <col style="width: 80px;">
                  <col style="width: 100px;">
                  <col style="width: 60px;">
                  <col style="width: 100px;">
                  <col style="width: 200px;">
                  <col style="width: 200px;">
                  <col style="width: 200px;">
                  <col style="width: 200px;">
                </colgroup>
                <thead>
                  <tr>
                    <th>
                      床位
                      <div class="am-sort">
                        <i
                          class="up"
                          :class="{active:listSort.sort=='ASC'&&listSort.column=='bedNo'}"
                          @click="$listSort('bedNo')"
                        ></i>
                        <i
                          class="down"
                          :class="{active:listSort.sort=='DESC'&&listSort.column=='bedNo'}"
                          @click="$listSort('bedNo')"
                        ></i>
                      </div>
                    </th>
                    <th>姓名</th>
                    <th>住院号</th>
                    <th>性别</th>
                    <th>年龄</th>
                    <th>
                      入院时间
                      <div class="am-sort">
                        <i
                          class="up"
                          :class="{active:listSort.sort=='ASC'&&listSort.column=='admissionTime'}"
                          @click="$listSort('admissionTime')"
                        ></i>
                        <i
                          class="down"
                          :class="{active:listSort.sort=='DESC'&&listSort.column=='admissionTime'}"
                          @click="$listSort('admissionTime')"
                        ></i>
                      </div>
                    </th>
                    <th>
                      转科前科室
                      <div class="am-sort">
                        <i
                          class="up"
                          :class="{active:listSort.sort=='ASC'&&listSort.column=='turnOutWardCode'}"
                          @click="$listSort('turnOutWardCode')"
                        ></i>
                        <i
                          class="down"
                          :class="{active:listSort.sort=='DESC'&&listSort.column=='turnOutWardCode'}"
                          @click="$listSort('turnOutWardCode')"
                        ></i>
                      </div>
                    </th>
                    <th>
                      转入后科室
                      <div class="am-sort">
                        <i
                          class="up"
                          :class="{active:listSort.sort=='ASC'&&listSort.column=='turnInWardCode'}"
                          @click="$listSort('turnInWardCode')"
                        ></i>
                        <i
                          class="down"
                          :class="{active:listSort.sort=='DESC'&&listSort.column=='turnInWardCode'}"
                          @click="$listSort('turnInWardCode')"
                        ></i>
                      </div>
                    </th>
                    <th>
                      转科时间
                      <div class="am-sort">
                        <i
                          class="up"
                          :class="{active:listSort.sort=='ASC'&&listSort.column=='turnInTime'}"
                          @click="$listSort('turnInTime')"
                        ></i>
                        <i
                          class="down"
                          :class="{active:listSort.sort=='DESC'&&listSort.column=='turnInTime'}"
                          @click="$listSort('turnInTime')"
                        ></i>
                      </div>
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            <div class="am-tb-fixed-bd">
              <table class="am-tb am-tb-layout" v-if="data_list.length>0">
                <colgroup>
                  <col style="width: 60px;">
                  <col style="width: 80px;">
                  <col style="width: 100px;">
                  <col style="width: 60px;">
                  <col style="width: 100px;">
                  <col style="width: 200px;">
                  <col style="width: 200px;">
                  <col style="width: 200px;">
                  <col style="width: 200px;">
                </colgroup>
                <tbody>
                  <tr @click="$gotoP(el)" v-for="(el, index) in data_list" :key="index">
                    <td>{{el.bedNo}}</td>
                    <td>{{el.name}}</td>
                    <td>{{el.displayId}}</td>
                    <td>{{el.physiSexName}}</td>
                    <td>{{el.ageHis | calculateAge()}}</td>
                    <td>{{el.admissionTime}}</td>
                    <td>{{el.turnOutWardName}}</td>
                    <td>{{el.turnInWardName}}</td>
                    <td>{{el.turnInTime}}</td>
                  </tr>
                </tbody>
              </table>
              <div
                class="no-data no-data-smile no-data-fixed"
                v-if="data_list.length == 0 && afterSearch"
              >
                <div class="img"></div>
                <div class="responsive-txt">
                  <div class="txt">
                    <span>没有符合条件的患者哦~</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- <div class="ui-page" ms-widget="pager,papOutList,papOutList"></div> -->
          <div class="pagination" id="papOutList" v-show="data_list.length>0"></div>
        </div>
        <div class="loading_up no-data-fixed loading-data" v-if="loading==0">
          <div class="bird">
            <div class="body"></div>
            <div class="light"></div>
          </div>
          <span class="txt">
            加载中..
            <em>.</em>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import '../../../common/js/vendor/pager/jquery.pagination.js'
import '../../../common/js/vendor/pager/pagination.css'
import '../../../common/js/filter'
import headWard from '../../../common/component/headerWards'
window.removeOthers = function () {
  $('div[name="date"]')
    .find('a')
    .removeClass('active')
}
export default {
  components: { headWard },
  data () {
    return {
      from: this.common.getAnotherDay('date', -6, true, new Date()),
      to: new Date().format('yyyy-MM-dd'),
      data_list: [],
      mrn: '',
      name: '',
      afterSearch: false,
      wardCode: this.common.getUrlParam('wardCode'), // 7.28新增-lutt
      loading: 0,
      papOutList: {
        ele: '#papOutList',
        totalItems: 0,
        currentPage: 1,
        perPages: 20,
        callback: (pageIndex, jq) => {
          this.papOutList.currentPage = pageIndex + 1
          this.$query_data()
        }
      },
      listSort: {column: 'turnInTime', sort: 'DESC'} // 排序信息
    }
  },
  mounted () {
    this.$renderInit()
  },
  methods: {
    changeTime: function (type) {
      this[type] = $(event.currentTarget).val()
    },
    $getData: function (params) {
      this.dateType = params
      this.to = new Date().format('yyyy-MM-dd')
      if (params === 1) {
        this.from = this.common.getAnotherDay('date', -6, true, new Date())
      } else if (params === 2) {
        this.from = this.common.getAnotherDay('month', -1, true, new Date())
      } else {
        this.from = this.common.getAnotherDay('month', -3, true, new Date())
      }
      window.removeOthers()
      $(event.currentTarget).addClass('active')
    },
    $gotoP: function (patient) {
      window.location.href =
        '#/transfered/patientview?wardCode=' +
        this.wardCode +
        '&patIndexNo=' +
        patient.patIndexNo

      var tab = {
        type: 'patient_transfer',
        tabId: patient.patIndexNo,
        tabName: patient.name,
        bedNo: patient.bedNo
      }
      this.$refs.headerWard.tabsAdd(tab, true)
    },

    $query_data: function (isShowPageOne) {
      if (this.papOutList.currentPage === 0) {
        return
      }
      if (isShowPageOne === 1) {
        this.papOutList.currentPage = 1
      }
      var param = {
        turnInTimeBegin: this.from + ' 00:00:00',
        turnInTimeEnd: this.to + ' 23:59:59',
        pageNumber: this.papOutList.currentPage - 1, // vm.BQMod ? () :(vm.papall.currentPage -1),
        pageSize: this.papOutList.perPages,
        nameLike: this.name,
        displayIdLike: this.mrn,
        sortField: this.listSort.column,
        direction: this.listSort.sort,
        turnInWardCode: this.common.getUrlParam('wardCode'),
        turnOutWardCode: this.common.getUrlParam('wardCode'),
        organCode: this.common.getOrganCode(),
        turnType: 2
      }
      this.common.ajax({
        url: 'baseinfo2.0/inpatienttransfer/inpatienttransfer/patient/page',
        type: 'get',
        data: param,
        callback: (r) => {
          if (param.pageNumber >= r.totalPages && param.pageNumber > 0) {
            this.papOutList.currentPage = r.totalPages
            this.papOutList.totalItems = r.totalElements
            this.$query_data()
            return
          }
          this.data_list = r.content
          this.afterSearch = true
          this.papOutList.totalItems = r.totalElements
          this.common.pagination(this.papOutList)
          this.loading = 1
          var that = this
          this.$nextTick(function () {
            that.calculateContentHeight()
            $(window).resize(function () {
              that.calculateContentHeight()
            })
          })
        }
      })
    },

    $initPage: function () {
      // if (avalon.vmodels.papOutList) {
      //   avalon.vmodels.papOutList.totalItems = 0
      //   avalon.vmodels.papOutList.currentPage = 1
      // }
      this.papOutList.totalItems = 0
      this.papOutList.currentPage = 1
    },
    $renderInit: function () {
      // if (this.common.getUrlParam('clear') == 1) {
      //   avalon.vmodels.root.clearTab()
      // }
      this.loading = 0

      this.from = this.common.getAnotherDay('date', -6, true, new Date())
      this.to = new Date().format('yyyy-MM-dd')
      $('#next_to').addClass('disabled')

      this.name = ''
      this.mrn = ''

      $('a[name="week"]').addClass('active')
      $('a[name="week"]')
        .siblings()
        .removeClass('active')

      this.wardCode = this.common.getUrlParam('wardCode') // 7.28新增-lutt
      // avalon.vmodels.root.wardCode = this.common.getUrlParam('wardCode') // 7.28新增-lutt
      this.afterSearch = false
      this.$initPage()
      this.$query_data(1)
      // avalon.vmodels.root.selectDepart() //7.28新增-lutt

      // if (avalon.vmodels.transferpatient_view) {
      //   avalon.vmodels.transferpatient_view.menus = []
      // }
    },
    $prev: function (param) {
      if ($(event.currentTarget).hasClass('disabled')) {
        return
      }
      window.removeOthers()
      if (param === 0) {
        this.from = this.common.getAnotherDay('date', -1, true, new Date(this.from))
      } else {
        this.to = this.common.getAnotherDay('date', -1, true, new Date(this.to))
      }
    },
    $next: function (param) {
      if ($(event.currentTarget).hasClass('disabled')) {
        return
      }
      window.removeOthers()
      if (param === 0) {
        if (this.from < new Date().format('yyyy-MM-dd')) {
          this.from = this.common.getAnotherDay(
            'date',
            1,
            true,
            new Date(this.from)
          )
        }
      } else {
        if (this.to < new Date().format('yyyy-MM-dd')) {
          this.to = this.common.getAnotherDay('date', 1, true, new Date(this.to))
        }
      }
    },
    // 日期筛选  两者的最大日期都是当天 最小日期没有限制  起始日期小于等于终止日期
    $setDate: function (param) {
      var startDate = new Date(this.from)
      var endtDate = new Date(this.to)
      // todo 如果==今天  则next不可点
      var obj
      if (param === 0) {
        obj = this.from
      } else {
        obj = this.to
      }

      var str = {
        0: 'from',
        1: 'to'
      }

      if (obj >= new Date().format('yyyy-MM-dd')) {
        $('#next_' + str[param]).addClass('disabled')
        obj = new Date().format('yyyy-MM-dd')
      } else {
        $('#next_' + str[param]).removeClass('disabled')
      }

      if (startDate > endtDate) {
        if (param === 0) {
          this.to = this.from
        } else {
          this.from = this.to
        }
      }
      this.$initPage()
      this.$query_data(1)
    },
    // 根据屏幕高度计算内容展示区域高度
    calculateContentHeight: function () {
      var fullHeight = $('.am-page-full').height()
      var conditionHeight = $('.am-condition').height()
      var paginationHeight = $('.pagination').height()
      var contentHeight =
        fullHeight - conditionHeight - 20 - paginationHeight - 20 - 20 - 25
      $('.am-page-content').height(contentHeight)
      var amTbFixedHd = $('.am-tb-fixed-hd').height()
      $('.am-tb-fixed-bd').height(contentHeight - amTbFixedHd)
      if (this.data_list.length === 0) {
        $('.am-page-content').height(contentHeight)
      } else {
        $('.am-page-content').removeAttr('style')
      }
    },
    /**
     * 列表排序
     * @param {string} type 列表排序字段
     */
    $listSort: function (type) {
      // 默认按照升序排序
      var sort = 'ASC'
      // 当前选择排序字段与上次选择排序字段相同时
      if (type === this.listSort.column) {
        // 如果上次排序顺序为降序 默认改成按照床号升序排序
        if (this.listSort.sort === 'DESC') {
          type = 'bedNo'
        } else {
          // 否则排序顺序改为降序
          sort = 'DESC'
        }
      }
      // 记录当前排序信息
      this.listSort = { column: type, sort: sort }

      // 查询患者
      this.$query_data(1)
    }
  },
  watch: {
    from (newValue, oldValue) {
      this.$setDate(0)
    },
    to (newValue, oldValue) {
      this.$setDate(1)
    }
  }
}
</script>

<style scoped>
</style>
