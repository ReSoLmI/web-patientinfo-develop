<template>
	<div id="tourListContainer">
		<div class="am-condition-top">
			<div class="am-btn-rdo am-mr-10">
				<a :class="{'active':dateType=='today'}" @click="changeDate('today')">当日</a>
				<a :class="{'active':dateType=='week'}" @click="changeDate('week')">一周</a>
			</div>
			<input type="text" class="input-text input-date" style="width: 130px;" placeholder="开始时间" @focus="changeTime('startDate')" onClick="WdatePicker({skin:'twoer',maxDate:'#F{$dp.$D(\'endDate\')}',isShowClear:false,errDealMode:1,readOnly:true})" v-model="startDate" id="startDate" readonly> -
			<input type="text" class="input-text input-date" style="width: 130px;" placeholder="结束时间" @focus="changeTime('endDate')" onClick="WdatePicker({skin:'twoer',minDate:'#F{$dp.$D(\'startDate\')}',maxDate:'%y-%M-%d',isShowClear:false,errDealMode:1,readOnly:true})" v-model="endDate" id="endDate" readonly>
			<div class="right">
				<a class="am-btn am-btn-print" @click="printTourList()">打印巡视单</a>
			</div>
		</div>
		<div class="order-cont">
			<!-- 左侧患者列表 start -->
			<div class="order-lside">
				<div class="btn-order-is-expand" @click="toggleExpand()"></div>
				<ul class="order-lr-menu">
					<li :class="{'active':!patIndexNo}" @click="changePatient('')">全部</li>
				</ul>
				<div class="order-name-list-cont" style="top: 36px;">
					<ul class="order-lr-menu">
						<li :class="{'active':patIndexNo==patient.patIndexNo}" v-for="(patient,index) in patientList" :key="index" @click="changePatient(patient.patIndexNo)">
              <span class="no">{{patient.bedNo}}床</span>{{patient.name}}
            </li>
					</ul>
				</div>
			</div>
			<!-- 左侧患者列表 end -->

			<!-- 右侧巡视列表 start -->
			<div class="order-rcont bg-white">
        <div style='overflow-y: scroll'>
				<div id="am-tb-fixed-hd" class="am-tb-fixed-hd" style="overflow:scroll;">
					<table class="am-tb am-tb-fixed" style="table-layout: fixed;">
						<colgroup>
							<col style="width: 60px;">
							<col style="width: 80px;">
							<col style="width: 80px;">
							<col style="width: 50px;">
							<col style="width: 80px;">
							<col style="width: 80px;">
							<col style="width: 80px;">
							<col style="width: 130px;">
							<col style="width: 160px;">
						</colgroup>
						<thead>
							<tr>
								<th>床号</th>
								<th>姓名</th>
								<th>住院号</th>
								<th>性别</th>
								<th>年龄</th>
								<th>护理等级</th>
								<th>巡视护士</th>
								<th>巡视时间</th>
								<th>备注</th>
							</tr>
						</thead>
					</table>
				</div>
        </div>
				<div id="am-tb-fixed-bd" class="am-tb-fixed-bd" style="top: 37px;height: 200px;" v-if="loading==1">
					<table class="am-tb-fixed am-tb am-tb-tr-even am-tb-hover" style="table-layout: fixed;" v-if="tourList.length>0">
						<colgroup>
							<col style="width: 60px;">
							<col style="width: 80px;">
							<col style="width: 80px;">
							<col style="width: 50px;">
							<col style="width: 80px;">
							<col style="width: 80px;">
							<col style="width: 80px;">
							<col style="width: 130px;">
							<col style="width: 160px;">
						</colgroup>
						<tr v-for="(item,index) in tourList" :key="index">
							<td>{{item.bedNo}}</td>
							<td>{{item.name}}</td>
							<td>{{item.mrn}}</td>
							<td>{{item.physiSexName}}</td>
							<td>{{item.age}}</td>
							<td>{{item.nursingClass}}</td>
							<td>{{item.inspectionNurse}}</td>
							<td>{{item.inspectionTime}}</td>
							<td>{{item.remark}}</td>
						</tr>
					</table>
					<div class="no-data no-data-smile no-data-fixed" v-if="tourList.length==0">
						<div class="img"></div>
						<div class="responsive-txt">
							<div class="txt">暂无相关巡视记录哦~</div>
						</div>
					</div>
				</div>
			</div>
			<!-- 右侧巡视列表 end -->
		</div>

		<div class="loading-data" v-if="loading==0">
			数据加载中....
		</div>
	</div>
</template>

<script>
export default {
  name: '',
  data () {
    return {
      wardCode: this.common.getUrlParam('wardCode'), // 科室code
      loading: 0, // 加载中标志
      patientList: [], // 患者列表
      patIndexNo: '', // 当前选中患者 为空时默认查询全部
      tourList: [], // 查询巡视记录列表
      startDate: '', // 查询开始日期
      endDate: '', // 查询结束日期
      todayDate: new Date().format('yyyy-MM-dd'),
      dateType: 'today', // 当前日期筛选格式 默认为当天
      printTemplate: {
        'xmlContent': ''
      }, // 打印模板
      printData: {
        'ParamDict': {},
        'DataSource': {
          'docNode': {
            'rows': []
          }
        },
        'TepmlateName': '护理巡视单'
      } // 打印模板数据源
    }
  },
  watch: {
    startDate (newValue, oldValue) {
      if (this.startDate && this.endDate) {
        this.jdugeDateType()
        this.queryTourList()
      }
    },
    endDate (newValue, oldValue) {
      if (this.startDate && this.endDate) {
        this.jdugeDateType()
        this.queryTourList()
      }
    }
  },
  mounted () {
    var islogin = this.common.isLogin()
    if (!islogin) {
      return false
    }
    // 默认展示加载中标志
    this.loading = 0
    this.wardCode = this.common.getUrlParam('wardCode')
    // 日期默认为当日
    this.dateType = 'today'
    this.startDate = this.todayDate
    this.endDate = this.todayDate
    // 查询当前科室下病人列表
    this.queryPatientList()
    // 查询巡视单打印模板
    this.queryPrintTemp()
  },
  methods: {
    changeTime (type) {
      this[type] = event.currentTarget.value
    },
    // 退出登录方法封装
    logout: function () {
      this.common.logout()
    },
    // 折叠或展开左侧患者列表
    toggleExpand: function () {
      $('.order-cont').toggleClass('order-is-collapse')
    },
    // 查询当前科室患者列表
    queryPatientList: function () {
      var that = this
      var param = {
        'organCode': this.common.getOrganCode(),
        'wardCode': this.wardCode,
        'status': 'in',
        'patientType': ''
      }
      this.common.ajax({
        url: 'patientinfo-service/patients/base',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (data) {
          if (data) {
            that.patientList = data.patResList
          }
        }
      })
    },
    // 查询巡视记录
    queryTourList: function () {
      var that = this
      var param = {
        organCode: this.common.getOrganCode(),
        patIndexNo: this.patIndexNo,
        wardCode: this.wardCode,
        inspectionTimeBegin: this.startDate + ' 00:00:00',
        inspectionTimeEnd: this.endDate + ' 23:59:59'
      }
      this.common.ajax({
        url: 'patientinfo-service/inspection/list',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (data) {
          that.tourList = data
          that.loading = 1
          that.controlPageEle()
          that.buildPrintData()
        }
      })
    },
    // 生成打印模板数据
    buildPrintData: function () {
      var that = this
      this.printData.DataSource.docNode.rows = []
      this.tourList.map(function (tour) {
        var rows = {
          'cells': [
          ]
        }
        for (var i in tour) {
          var cell = {
            code: i,
            value: tour[i]
          }
          rows.cells.push(cell)
        }
        that.printData.DataSource.docNode.rows.push(rows)
      })
    },
    // 查询打印模板
    queryPrintTemp: function () {
      var that = this
      var param = {
        organCode: this.common.getOrganCode(),
        constantTypeList: 'INSPECTION_TEMP'
      }
      this.common.ajax({
        url: 'patientinfo-service/dict/constant/batch',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (data) {
          if (data && data.INSPECTION_TEMP && data.INSPECTION_TEMP.length > 0) {
            that.printTemplate.xmlContent = data.INSPECTION_TEMP[0].constantValue
          }
        }
      })
    },
    /**
		 * 切换日期格式
		 * @param {string} dateType 日期格式
		 */
    changeDate: function (dateType) {
      // 切换日期格式
      this.dateType = dateType
      // 日期格式为今天时 开始日期和结束日期均赋值为今日 为一周时 日期调整为最近一周
      if (dateType === 'today') {
        this.startDate = this.todayDate
      } else if (dateType === 'week') {
        this.startDate = this.common.getAnotherDay('date', -6, true)
      }
      this.endDate = this.todayDate
    },
    // 根据日期计算当前日期格式
    jdugeDateType: function () {
      // 开始日期和结束日期均为当日时 日期筛选格式为当日
      if (this.startDate === this.todayDate && this.endDate === this.todayDate) {
        this.dateType = 'today'
      } else if (this.startDate === this.common.getAnotherDay('date', -6, true) && this.endDate === this.todayDate) { // 开始日期为一周前结束日期为今日 日期筛选格式为一周
        this.dateType = 'week'
      } else {
        this.dateType = ''
      }
    },
    // 切换病人查询巡视记录
    changePatient: function (patIndexNo) {
      this.patIndexNo = patIndexNo
      // 选择全部患者时 滚动条滚动到顶部
      if (!patIndexNo) {
        var container = $('.order-name-list-cont')
        container.animate({ scrollTop: 0 }, 500)
      }
      this.queryTourList()
    },
    // 界面元素控制
    controlPageEle: function () {
      this.$nextTick(_ => {
        // 动态计算容器高度并赋值给表格展示区域
        var height = $('.order-cont').height()
        $('.am-tb-fixed-bd').height(height - 40)
        $(window).resize(function () {
          var height = $('.order-cont').height()
          $('.am-tb-fixed-bd').height(height - 40)
        })
        // 表格展示区域添加滚动监听，用于控制表头跟随内容体一起滚动
        $('.am-tb-fixed-bd').scroll(function () {
          $('.am-tb-fixed-hd').scrollLeft($('.am-tb-fixed-bd').scrollLeft())
        })
      })
    },
    // 打印巡视单
    printTourList: function () {
      // console.log(JSON.stringify(this.printTemplate))
      // console.log(JSON.stringify(this.printData.$model))
      parent.ewellBrowserReport.printReport(JSON.stringify(this.printTemplate), JSON.stringify(this.printData), '1')
    }
  }
}
</script>

<style scoped>
</style>
