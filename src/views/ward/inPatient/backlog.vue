<template>
	<div id="backlogContainer">
		<div class="am-condition-top">
			<div class="am-btn-rdo">
				<a :class="{'active':patientType=='MP'}" @click="changePatientList('MP')">我的患者 {{patientNumber.myPatNum}}</a>
				<a :class="{'active':patientType==''}" @click="changePatientList('')">全部患者 {{patientNumber.allPatNum}}</a>
			</div>
			<div style="display: inline-block; float: right; margin-right: 5px;">
				<input type="text" class="input-text input-date" style="width: 130px;" placeholder="开始时间" @click="datePicker('startDate', 'endDate')" v-model="backlogStartTime" id="startDate" readonly> -
				<input type="text" class="input-text input-date" style="width: 130px;" placeholder="结束时间" @click="datePicker('endDate', 'startDate')" v-model="backlogEndTime" id="endDate" readonly>
			</div>
		</div>
		<div class="order-cont" style="right: 0;">
			<!-- 左侧患者列表 start -->
			<div class="order-lside">
				<div class="btn-order-is-expand" @click="toggleExpand()"></div>
				<ul class="order-lr-menu">
					<li :class="{'active':!patIndexNo}" @click="goToPatientPos('')">回到顶部</li>
				</ul>
				<div class="order-name-list-cont" style="top: 36px;">
					<ul class="order-lr-menu">
						<li :class="{'active':patIndexNo==patient.patIndexNo}" v-for="(patient,index) in patientList" :key="index" @click="goToPatientPos(patient.patIndexNo)"><span class="no">{{patient.bedNo}}床</span>{{patient.name}}</li>
					</ul>
				</div>
			</div>
			<!-- 左侧患者列表 end -->

			<!-- 右侧待办列表 start -->
			<div class="order-rcont order-rcont-backlog" style="display:none; overflow:auto" v-show="!loading">
				<div style="min-width:820px;">
					<div class="wy-per-panel" :class="{'first':index==0}" v-if="backlogList.length>0" v-for="(patientinfo,index) in backlogList" :key="index">
						<div :class="`hd bedNo_${patientinfo.patIndexNo}`">{{patientinfo.bedNo}}<span class="am-ml-10">{{patientinfo.name}}</span><span class="small">{{patientinfo.displayId}}</span></div>
						<div class="bd">
							<!-- 待办-复旦版本 start -->
							<table class="am-tb bg-white" v-if="backlogVersion==='0'&&patientinfo.detailResList.length>0" v-for="(questioninfo,index) in patientinfo.detailResList" :key="index">
								<colgroup v-if="index==0">
									<col style="width: 150px;">
								</colgroup>
								<tr>
									<td :rowspan="questioninfo.detailResList.length" class="wy-th td-center">{{questioninfo.questionName}}</td>
									<td class="td-wy-auxiliary" v-if="questioninfo.detailResList.length>0">
										{{questioninfo.detailResList[0].backlogName}}
										<a class="wy-auxiliary" :class="showBacklogOper(questioninfo.detailResList[0].classCode).className" @click="executeBacklog(patientinfo, questioninfo, questioninfo.detailResList[0])">{{showBacklogOper(questioninfo.detailResList[0].classCode).btnName}}</a>
									</td>
								</tr>
								<tr v-if="questioninfo.detailResList.length>1 && index>0" v-for="(measureinfo,index) in questioninfo.detailResList" :key="index">
									<td class="td-wy-auxiliary">
										{{measureinfo.backlogName}}
										<a class="wy-auxiliary" :class="showBacklogOper(measureinfo.classCode).className" @click="executeBacklog(patientinfo, questioninfo, measureinfo)">{{showBacklogOper(measureinfo.classCode).btnName}}</a>
									</td>
								</tr>
							</table>
							<!-- 待办-复旦版本 end -->

							<!-- 待办-江苏版本 start -->
							<div class="condition-strip-top" v-if="backlogVersion==='1'">
								<ul class="strip-top strip-top-36">
									<li v-for="(backlogclass,innerIndex) in patientinfo.backlogClass" :key="innerIndex" :class="{'active':patientinfo.currentClassCode==backlogclass.classCode}" @click="queryBacklogByClass(index, innerIndex, backlogclass.classCode)">{{backlogclass.className}}<span class="wy-badge-danger am-ml-5">{{backlogclass.count}}</span></li>
								</ul>
								<div class="right-36">
									<a @click="executePRN(index)" class="prn" :class="{'active':patientinfo.frequencyName=='prn'}">PRN</a>
									<a class="am-ml-10" v-if="patientinfo.canOperateCount>0&&patientinfo.frequencyName!='prn'" @click="executionAllPop('1', '延迟执行', index)">全部延迟执行</a>
									<a class="am-ml-10" v-if="patientinfo.canOperateCount>0&&patientinfo.frequencyName!='prn'" @click="executionAllPop('2', '不执行', index)">全部不执行</a>
									<span class="am-ml-10" style="cursor:not-allowed;" v-if="patientinfo.canOperateCount==0 || patientinfo.frequencyName=='prn'">全部延迟执行</span>
									<span class="am-ml-10" style="cursor:not-allowed;" v-if="patientinfo.canOperateCount==0 || patientinfo.frequencyName=='prn'">全部不执行</span>
								</div>
							</div>
							<div class="am-pd-10" v-if="backlogVersion==='1'">
								<table class="am-tb am-tb-layout">
									<colgroup>
										<col style="width:200px;" />
										<col />
										<col style="width:400px;" />
										<col style="width:50px;" />
									</colgroup>
									<thead>
										<tr>
											<th>时间</th>
											<th>执行内容</th>
											<th>延迟 /不执行</th>
											<th>操作</th>
										</tr>
									</thead>
									<tr v-if="patientinfo.detailResList.length>0" v-for="(backlog,innerIndex) in patientinfo.detailResList" :key="innerIndex">
										<td class="text-left">{{backlog.preExecuteTime | date('yyyy-MM-dd hh:mm')}}
											<div class="am-mt-5">
												<input type="text" :id="'input_'+index" class="input-text input-date" style="max-width: 180px;" :outIndex='index' :backlogIndex="innerIndex" :class="{'input-disabled':!backlog.isCanOprate}" :disabled="!backlog.isCanOprate" @click="datePicker('input_'+index, '', index, innerIndex)" v-model="backlog.executeTime" readonly>
											</div>
										</td>
										<td>
											<span class="txt-delay-circle showTip" v-if="backlog.delayExeTimes&&backlog.delayExeTimes>0" data-tooltip="true" :title='`已延迟${backlog.delayExeTimes}次`'>延</span>{{backlog.backlogName}}
										</td>
										<td>
											<div class="am-btn-rdo">
												<a :class="{'active':backlog.delayOrInexecut==='1','disabled':(!backlog.isCanOprate||backlog.frequencyName=='prn')}" @click="selectDelayOrInexecut(index, innerIndex, '1')">延迟执行</a>
												<a :class="{'active':backlog.delayOrInexecut==='2','disabled':(!backlog.isCanOprate||backlog.frequencyName=='prn')}" @click="selectDelayOrInexecut(index, innerIndex, '2')">不执行</a>
											</div>
											<div v-if="backlog.delayOrInexecut" style="height:30px;line-height: 30px;">
												<label class="am-ctr-rdo am-mr-10" v-for="(execution,subinnerIndex) in backlog.executionList" :key="subinnerIndex" :class="{'active':backlog.executionInfo.name==execution.constantValue}" @click="selectExecution(index, innerIndex, execution)">
                          <input type="radio" :name="`rdo-list-${index}-${innerIndex}`"><i></i>
                          <span class="txt">{{execution.constantValue}}</span>
                        </label>
												<input type="text" class="input-text" v-if="backlog.executionInfo.customize==='1'" v-model="backlog.executionInfo.otherInfo" style="width: 100px;" maxlength="20" />
											</div>
										</td>
										<td>
											<a v-if="backlog.isCanOprate" @click="submitBacklog(index, innerIndex)">提交</a>
											<span class="am-txt-label" style="cursor:not-allowed;" v-if="!backlog.isCanOprate">提交</span>
										</td>
									</tr>
								</table>
							</div>

							<!-- 全部延迟执行或不执行选择 start -->
							<div id="pop-content-execution" style="display: none;">
								<div class="am-pdlr-20">
									<div class="am-msg-lg-info">
										<div class="inner">
											<i class="i-question-lg"></i>
											<h3 v-if="executionInfo.code==='1'">确定要全部延迟执行？</h3>
											<h3 v-if="executionInfo.code==='2'">确定要全部不执行？</h3>
										</div>
									</div>
									<div class="after-msg-cont cause-rdo-items" style="height:45px;">
										<span class="am-txt-label">原因：</span>
										<label class="am-ctr-rdo" v-for="(execution,index) in executionList" :key="index" :class="{'active':executionInfo.name==execution.constantValue}" @click="selectExecution('', '', execution)">
                      <input type="radio" name="rdo-01"><i></i><span class="txt">{{execution.constantValue}}</span>
                    </label>
										<input type="text" class="input-text" v-if="executionInfo.customize==='1'" v-model="executionInfo.otherInfo" style="width: 100px;" maxlength="20" />
									</div>
								</div>
								<div class="am-btn-area">
									<!--<a class="am-pop-btn">取消</a>-->
									<a class="am-btn am-btn-confirm" :class="{'disabled':loadingSubmit}" @click="submitExecutionAll()">确定</a>
								</div>
							</div>
							<!-- 全部延迟执行或不执行选择 end -->
							<!-- 待办-江苏版本 end -->
							<div class="item-panel" v-if="patientinfo.detailResList.length==0">
								<div class="no-data-txt">暂无待办</div>
							</div>
						</div>
					</div>
					<div class="no-data no-data-smile no-data-fixed" v-if="backlogList.length==0">
						<div class="img"></div>
						<div class="responsive-txt">
							<div class="txt">暂无相关待办任务哦~</div>
						</div>
					</div>
				</div>
			</div>
			<!-- 右侧待办列表 end -->
		</div>

		<div class="loading-data" v-if="loading">
			数据加载中....
		</div>
	</div>
</template>

<script>
// import moment from 'moment'
export default {
  name: '',
  data () {
    return {
      organCode: this.common.getUrlParam('organCode'), // 组织机构码
      wardCode: this.common.getUrlParam('wardCode'), // 科室code
      loading: true, // 加载中标志
      patientType: 'MP', // 患者类型 我的患者-'MP' 全部患者-''
      patientList: [], // 患者列表
      patientNumber: {
        myPatNum: '', // 我的患者数量
        allPatNum: '' // 所有患者数量
      },
      backlogList: [], // 待办列表
      backlogStartTime: new Date().format('yyyy-MM-dd'), // 待办查询开始时间
      backlogEndTime: new Date().format('yyyy-MM-dd'), // 待办查询结束时间

      backlogVersion: '', // 待办版本 默认0-复旦版本 1-江苏版本
      backlogClass: {}, // 待办分类
      currentClassCode: '', // 当前待办分类
      frequencyName: '', // 类别编码
      delayExecution: [], // 延迟执行原因
      nonExecution: [], // 不执行原因
      executionList: [], // 执行或不执行原因展示list
      executionInfo: { // 选择的延迟执行或不执行原因及其他输入值
        patientIndex: '', // 当前操作病人index值
        code: '', // 延迟执行或不执行
        name: '', // 展示名称
        customize: '', // 是否为自定义项
        otherInfo: '' // 其他-输入值
      },
      loadingSubmit: false, // 提交时loading
      patIndexNo: '',
      backlogMinDate: 0,
      backlogMaxDate: 0
    }
  },
  mounted () {
    var islogin = this.common.isLogin()
    if (!islogin) {
      return false
    }
    this.init()
  },
  filters: {
    date (value, format) {
      return new Date(value).format(format)
    }
  },
  watch: {
    // 监测待办查询开始时间
    backlogStartTime (newValue, oldValue) {
      if (this.backlogStartTime && this.backlogEndTime) {
        this.queryBacklogClass(true)
      }
    },
    // 监测待办查询结束时间
    backlogEndTime (newValue, oldValue) {
      if (this.backlogStartTime && this.backlogEndTime) {
        this.queryBacklogClass(true)
      }
    }
  },
  methods: {
    init: function () {
      // 默认展示加载中标志
      this.loading = true

      this.wardCode = this.common.getUrlParam('wardCode')

      // 当前查询患者类型默认为我的患者
      this.patientType = 'MP'
      var that = this
      // 查询待办展现版本、延迟执行原因、不执行原因
      this.common.queryConstants(['BACKLOG_VERSION', 'DELAY_EXECUTION', 'NON_EXECUTION', 'BACKLOG_QUERY_MINDATE', 'BACKLOG_QUERY_MAXDATE'], false, function (data) {
        // 查询待办展现版本 默认为复旦版本 0-复旦版本 1-江苏版本
        if (data && data.BACKLOG_VERSION && data.BACKLOG_VERSION.length > 0) {
          if (data.BACKLOG_VERSION[0].constantValue) {
            that.backlogVersion = data.BACKLOG_VERSION[0].constantValue
          } else {
            that.backlogVersion = '0'
          }
        } else {
          that.backlogVersion = '0'
        }
        // 查询延迟执行原因
        if (data && data.DELAY_EXECUTION && data.DELAY_EXECUTION.length > 0) {
          that.delayExecution = data.DELAY_EXECUTION
        }
        // 查询不执行原因
        if (data && data.NON_EXECUTION && data.NON_EXECUTION.length > 0) {
          that.nonExecution = data.NON_EXECUTION
        }
        // 查询待办查询最小日期 默认为7天
        if (data && data.BACKLOG_QUERY_MINDATE && data.BACKLOG_QUERY_MINDATE.length > 0) {
          if (data.BACKLOG_QUERY_MINDATE[0].constantValue) {
            that.backlogMinDate = data.BACKLOG_QUERY_MINDATE[0].constantValue
          } else {
            that.backlogMinDate = 7
          }
        } else {
          that.backlogMinDate = 7
        }
        // 查询待办查询最大日期 默认为10天
        if (data && data.BACKLOG_QUERY_MAXDATE && data.BACKLOG_QUERY_MAXDATE.length > 0) {
          if (data.BACKLOG_QUERY_MAXDATE[0].constantValue) {
            that.backlogMaxDate = data.BACKLOG_QUERY_MAXDATE[0].constantValue
          } else {
            that.backlogMaxDate = 10
          }
        } else {
          that.backlogMaxDate = 10
        }
      })

      // 查询当前科室下病人列表
      this.queryPatientList()
    },
    // 日期控件配置处理
    datePicker (elementId, endDate, outerIndex, innerIndex) {
      var that = this
      var min = ''
      var max = ''
      var format = ''
      if (outerIndex && that.backlogList[outerIndex].detailResList[innerIndex].preExecuteTime) {
        min = that.backlogList[outerIndex].detailResList[innerIndex].preExecuteTime
        max = '%y-%M-%d'
        format = 'yyyy-MM-dd HH:mm'
      } else {
        format = 'yyyy-MM-dd'
        if (elementId === 'startDate') {
          min = `%y-%M-{%d-${that.backlogMinDate}}`
          max = `#F{$dp.$D(${endDate})}`
        } else {
          min = `#F{$dp.$D(${endDate})}`
          max = `%y-%M-{%d+${that.backlogMaxDate}}`
        }
      }
      // eslint-disable-next-line
      WdatePicker({
        el: elementId,
        skin: 'twoer',
        minDate: min,
        maxDate: max,
        dateFmt: format,
        isShowClear: false,
        errDealMode: 1,
        readOnly: true,
        onpicked: function () {
          var value = $('#' + elementId).val()
          if (elementId === 'startDate') {
            that.backlogStartTime = value
          } else {
            that.backlogEndTime = value
          }
        }
      })
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
            that.patientNumber.myPatNum = data.myPatNum
            that.patientNumber.allPatNum = data.patNum

            if (that.patientList.length > 0) {
              // 复旦版本待办
              if (that.backlogVersion === '0') {
                // 查询当前科室待办列表
                that.queryBacklogList()
              } else { // 江苏版本待办
                // 查询待办分类
                that.queryBacklogClass(true)
              }
            } else {
              that.backlogList = []
              that.loading = false
            }
          }
        }
      })
    },
    // 切换患者列表
    changePatientList: function (patientType) {
      this.patientType = patientType
      this.queryPatientList()
    },
    showToolTip: function () {
      this.$nextTick(_ => {
        // 提示
        $('.showTip').tooltip({
          container: 'body',
          placement: 'auto top'
        })
      })
    },
    // 点击病人滚动条定位到对应位置
    goToPatientPos: function (patIndexNo) {
      // 选择回到顶部时 滚动条滚动到顶部
      if (!patIndexNo) {
        var leftContainer = $('.order-name-list-cont')
        var rightContainer = $('.order-rcont-backlog')
        leftContainer.animate({scrollTop: 0}, 500)
        rightContainer.animate({scrollTop: 0}, 500)
      } else {
        var container = $('.order-rcont-backlog')
        var thatP = container.find('.bedNo_' + patIndexNo)
        if (thatP.length > 0) {
          var mTop = thatP.offset().top
          var result = mTop - container.offset().top + container.scrollTop()
          container.animate({scrollTop: result}, 500)
        }
      }
    },
    // 查询待办列表
    queryBacklogList: function () {
      var that = this
      var param = {
        organCode: this.organCode,
        wardCode: this.wardCode,
        patientType: this.patientType, // 患者类别 我的患者或者全部患者
        classCode: this.currentClassCode, // 类别编码
        startTime: this.backlogStartTime + ' 00:00:00',
        endTime: this.backlogEndTime + ' 23:59:59'
      }
      this.common.ajax({
        url: 'patientinfo-service/backlog/ward/query',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (data) {
          if (that.backlogVersion === '0') {
            that.backlogList = data
          } else {
            data.map(function (patient) {
              // 每个病人的待办分类（主要为处理病人分类对应的待办数量）
              patient.backlogClass = that.backlogClass[patient.patIndexNo]
              // 默认待办分类
              patient.currentClassCode = that.currentClassCode
              // 默认频次
              patient.frequencyName = ''
              var backlogList = []
              var canOperateCount = 0
              patient.detailResList.map(function (backlog) {
                if (backlog.detailResList) {
                  for (var i = 0; i < backlog.detailResList.length; i++) {
                    backlog.detailResList[i].executionList = []
                    backlog.detailResList[i].delayOrInexecut = '' // 延迟执行或不执行
                    backlog.detailResList[i].executionInfo = {
                      name: '',
                      customize: '',
                      otherInfo: ''
                    }
                    backlog.detailResList[i].executeTime = new Date().format('yyyy-MM-dd hh:mm') // 执行时间默认为当前时间
                    // 当前时间点是否能操作待办
                    backlog.detailResList[i].isCanOprate = true
                    var preExecuteTime = new Date(backlog.detailResList[i].preExecuteTime).getTime()
                    var now = new Date().getTime()
                    if (preExecuteTime > now) {
                      backlog.detailResList[i].isCanOprate = false
                    } else {
                      backlog.detailResList[i].isCanOprate = true
                      canOperateCount += 1
                    }
                  }
                  backlogList.push.apply(backlogList, backlog.detailResList)
                }
              })
              patient.detailResList = backlogList
              patient.canOperateCount = canOperateCount
            })
            that.backlogList = data
          }
          that.loading = false
          that.showToolTip()
        }
      })
    },
    // 查询单个病人待办
    queryPatientBacklog: function (index) {
      var that = this
      var param = {
        patIndexNo: this.backlogList[index].patIndexNo,
        organCode: this.organCode,
        wardCode: this.wardCode,
        startTime: this.backlogStartTime + ' 00:00:00',
        endTime: this.backlogEndTime + ' 23:59:59',
        classCode: this.backlogList[index].currentClassCode, // 类别编码
        frequencyName: this.backlogList[index].frequencyName // 频次名称
      }
      if (this.backlogList[index].frequencyName === 'prn') {
        param.startTime = ''
        param.endTime = ''
      }
      this.common.ajax({
        url: 'patientinfo-service/backlog/query',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (data) {
          var backlogList = []
          var canOperateCount = 0
          data.map(function (backlog) {
            if (backlog.detailResList) {
              for (var i = 0; i < backlog.detailResList.length; i++) {
                backlog.detailResList[i].executionList = []
                backlog.detailResList[i].delayOrInexecut = '' // 延迟执行或不执行
                backlog.detailResList[i].executionInfo = {
                  name: '',
                  customize: '',
                  otherInfo: ''
                }
                backlog.detailResList[i].executeTime = new Date().format('yyyy-MM-dd hh:mm') // 执行时间默认为当前时间// 当前时间点是否能操作待办
                backlog.detailResList[i].isCanOprate = true
                var preExecuteTime = new Date(backlog.detailResList[i].preExecuteTime).getTime()
                var now = new Date().getTime()
                if (preExecuteTime > now) {
                  backlog.detailResList[i].isCanOprate = false
                } else {
                  backlog.detailResList[i].isCanOprate = true
                  canOperateCount += 1
                }
              }
              backlogList.push.apply(backlogList, backlog.detailResList)
            }
          })
          // 每个病人的待办分类（主要为处理病人分类对应的待办数量）
          that.backlogList[index].backlogClass = that.backlogClass[that.backlogList[index].patIndexNo]
          that.backlogList[index].detailResList = backlogList
          that.backlogList[index].canOperateCount = canOperateCount
          console.log(that.backlogList)
          that.showToolTip()
        }
      })
    },
    /**
     * 根据待办分类展示操作按钮样式和名称
     * @param {string} classCode 待办操作分类code值
     *
     */
    showBacklogOper: function (classCode) {
      return this.common.showBacklogOper(classCode)
    },
    // 关闭弹窗
    closeFrame: function () {
      layer.closeAll()
    },
    /**
     * 执行待办
     * @param {object} patientInfo 当前操作待办对应患者信息
     * @param {object} questionInfo 当前操作待办对应问题信息
     * @param {object} measureInfo 当前操作待办对应措施信息
     */
    executeBacklog: function (patientInfo, questionInfo, measureInfo) {
      var that = this
      // 评估或宣教类的待办 点击弹出对应操作界面
      if ((measureInfo.classCode === '0' || measureInfo.classCode === '2') && measureInfo.jumpLink) {
        if (measureInfo.jumpLink) {
          var jumpLink = measureInfo.jumpLink += (measureInfo.jumpLink.indexOf('?') > -1 ? '&' : '?')
          // 拼接病人及其他基础参数
          jumpLink +=
          'organCode=' + this.organCode + // 组织机构码
          '&token=' + this.common.getToken() + // 用户token
          '&wardCode=' + this.wardCode + // 病区code
          '&patIndexNo=' + patientInfo.patIndexNo + // 病人编号
          '&patientId=' + patientInfo.patientId + // 病人ID
          '&mrn=' + patientInfo.mrn + // 病案号
          '&pageFrom=' + this.common.getAppCode() + // 界面访问来源 住院-patientinfo
          '&entrance=backlog' // 界面入口 backlog代表从待办进入
          // 拼接待办对应问题ID
          if (questionInfo.questionId) {
            jumpLink += '&questionId=' + measureInfo.questionId
          }
          // 拼接待办对应措施ID
          if (measureInfo.indexNo) {
            jumpLink += '&indexNo=' + measureInfo.indexNo
          }
          // 拼接参数1 以文书为基准，对应其文书单子ID
          if (measureInfo.listId) {
            jumpLink += '&listId=' + measureInfo.listId
          }
          // 拼接参数2 以文书为基准，对应其文书单子类型
          if (measureInfo.listType) {
            jumpLink += '&listType=' + measureInfo.listType
          }
          // 拼接参数3 以文书为基准，对应其文书单子选项ID
          if (measureInfo.optionId) {
            jumpLink += '&optionId=' + measureInfo.optionId
          }
          // 拼接参数4 待办预计执行时间
          if (measureInfo.preExecuteTime) {
            jumpLink += '&preExecuteTime=' + measureInfo.preExecuteTime
          }

          /**
           * postMessage监听
           * @param {object} e 返回值
           */
          var postMessageListener = function (e) {
            if (e && e.data) {
              var result = e.data
              // 如果未接收到执行时间，则取系统当前时间
              if (!result.executeTime) {
                result.executeTime = new Date().format('yyyy-MM-dd hh:mm:ss')
              }
              // 执行结束 删除待办
              if (result.end) {
                var param = {
                  'executeTime': result.executeTime, // 待办执行时间
                  'id': measureInfo.id, // 待办ID
                  'mrn': patientInfo.mrn, // 病人mrn
                  'organCode': that.organCode, // 组织机构码
                  'patientId': patientInfo.patientId, // 病人ID
                  'operatorId': that.common.getLocalStorage('PAT_loginName'), // 当前操作人工号
                  'operatorName': that.common.getLocalStorage('PAT_staffName'), // 当前操作人姓名
                  'resultType': 'end' // 处理完毕，通知后台删除待办
                }
                that.common.ajax({
                  url: 'patientinfo-service/backlog/process',
                  dataType: 'text',
                  type: 'post',
                  data: JSON.stringify(param),
                  callback: function () {
                    if (result.event && that[result.event]) {
                      that[result.event]()
                    }
                  }
                })
              } else if (result.event && that[result.event]) {
                that[result.event]()
              }
            }
          }

          layer.open({
            type: 2,
            title: false,
            closeBtn: 0,
            area: ['85%', '100%'],
            offset: 'rb',
            fixed: true,
            shadeClose: true,
            content: jumpLink,
            success: function () {
              window.addEventListener('message', postMessageListener, false)
            },
            end: function () {
              // 重新请求数据
              setTimeout(function () {
                // 查询当前科室待办列表
                that.queryBacklogList()
              }, 10)
              window.removeEventListener('message', postMessageListener, false)
            }
          })
        } else {
          this.common.tip_msg('当前操作功能暂未开放~', 1000)
        }
      } else { // 其他类型的通知后台去处理
        var param = {
          'executeTime': new Date().format('yyyy-MM-dd hh:mm:ss'), // 待办执行时间
          'id': measureInfo.id, // 待办ID
          'mrn': patientInfo.mrn, // 病人mrn
          'organCode': this.organCode, // 组织机构码
          'patientId': patientInfo.patientId, // 病人ID
          'operatorId': this.common.getLocalStorage('PAT_loginName'), // 当前操作人工号
          'operatorName': this.common.getLocalStorage('PAT_staffName'), // 当前操作人姓名
          'resultType': 'request' // 需要后台请求url处理
        }
        this.common.ajax({
          url: 'patientinfo-service/backlog/process',
          dataType: 'text',
          type: 'post',
          data: JSON.stringify(param),
          callback: function () {
            var message = that.showBacklogOper(measureInfo.classCode).btnName
            that.common.tip_msg(message + '成功~', 1000, function () {
              // 查询当前科室待办列表
              that.queryBacklogList()
            })
          }
        })
      }
    },
    // 查询待办分类
    queryBacklogClass: function (isInit, patIndexNo, index) {
      var that = this
      var param = {
        organCode: this.organCode,
        patientType: this.patientType,
        wardCode: this.wardCode,
        startTime: this.backlogStartTime + ' 00:00:00',
        endTime: this.backlogEndTime + ' 23:59:59'
      }
      if (patIndexNo) {
        param.patIndexNo = patIndexNo
      } else {
        param.patientType = this.patientType
      }
      this.common.ajax({
        url: 'patientinfo-service/backlog/count/class',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (result) {
          if (result) {
            that.backlogClass = result
            if (isInit) {
              that.currentClassCode = that.backlogClass[that.patientList[0].patIndexNo][0].classCode
            }
            if (patIndexNo) {
              that.queryPatientBacklog(index)
            } else {
              that.queryBacklogList()
            }
          }
        }
      })
    },
    // 根据待办分类查看待办
    queryBacklogByClass: function (index, classCode) {
      this.backlogList[index].frequencyName = ''
      this.backlogList[index].currentClassCode = classCode
      this.queryBacklogClass(false, this.backlogList[index].patIndexNo, index)
    },
    /**
     * 选择延迟执行或不执行
     * @param {index} index 当前操作对象index值
     * @param {*} value 当前选中值
     */
    selectDelayOrInexecut: function (outIndex, index, value) {
      if ($(event.currentTarget).hasClass('disabled')) {
        return false
      }
      // 清空已选中原因数据
      this.backlogList[outIndex].detailResList[index].executionInfo.name = ''
      this.backlogList[outIndex].detailResList[index].executionInfo.customize = ''
      this.backlogList[outIndex].detailResList[index].executionInfo.otherInfo = ''
      // 如果已选中已执行或不执行 再次点击时取消选中
      if (this.backlogList[outIndex].detailResList[index].delayOrInexecut === value) {
        this.backlogList[outIndex].detailResList[index].delayOrInexecut = ''
        this.backlogList[outIndex].detailResList[index].executionList = []
      } else { // 否则选中当前操作项 并进行数据处理
        this.backlogList[outIndex].detailResList[index].delayOrInexecut = value
        if (this.backlogList[outIndex].detailResList[index].delayOrInexecut === '1') {
          this.backlogList[outIndex].detailResList[index].executionList = this.delayExecution
        } else if (this.backlogList[outIndex].detailResList[index].delayOrInexecut === '2') {
          this.backlogList[outIndex].detailResList[index].executionList = this.nonExecution
        }
      }
    },
    /**
     * 选择延迟执行或不执行原因
     * @param {object} execution 原因对象
     */
    selectExecution: function (outIndex, index, execution) {
      if (outIndex !== '') {
        this.backlogList[outIndex].detailResList[index].executionInfo.name = execution.constantValue
        this.backlogList[outIndex].detailResList[index].executionInfo.customize = execution.customize
        this.backlogList[outIndex].detailResList[index].executionInfo.otherInfo = ''
      } else {
        this.executionInfo.name = execution.constantValue
        this.executionInfo.customize = execution.customize
        this.executionInfo.otherInfo = ''
      }
    },
    /**
     * 查询当前待办是否能操作 规则：预计执行时间在当前时间以前的才能操作，当前时间以后的不能操作
     * @param {int} index 当前操作对象index值
     */
    getIsDisabled: function (outIndex, index) {
      // console.log(this.backlogList[outIndex].detailResList[index])
      if (this.backlogList.length > 0 && this.backlogList[outIndex].detailResList.length > 0 && this.backlogList[outIndex].detailResList[index] && this.backlogList[outIndex].detailResList[index].preExecuteTime) {
        var preExecuteTime = new Date(this.backlogList[outIndex].detailResList[index].preExecuteTime).getTime()
        var now = new Date().getTime()
        if (preExecuteTime > now) {
          return true
        } else {
          return false
        }
      }
    },
    /**
     * 校验待办项是否符合规则
     * @param {int} index 当前操作项
     */
    validBacklogInfo: function (outIndex, index) {
      // 如果已选择延迟执行或不执行但未选择原因时，进行提醒
      if (this.backlogList[outIndex].detailResList[index].delayOrInexecut && !this.backlogList[outIndex].detailResList[index].executionInfo.name) {
        this.common.tip_msg('请先选择' + (this.backlogList[outIndex].detailResList[index].delayOrInexecut === '1' ? '延迟执行' : '不执行') + '原因！')
        return false
      }
      // 如果已选择延迟执行或不执行原因，且选择了其他项但未输入其他项值时，进行提醒
      if (this.backlogList[outIndex].detailResList[index].executionInfo.name && this.backlogList[outIndex].detailResList[index].executionInfo.customize === '1' && !this.backlogList[outIndex].detailResList[index].executionInfo.otherInfo) {
        this.common.tip_msg('请先填写其他原因！')
        return false
      }
      return true
    },
    /**
     * 提交待办
     * @param {int} index 当前操作对象index
     */
    submitBacklog: function (outIndex, index) {
      var that = this
      if ($(event.currentTarget).hasClass('disabled')) {
        return false
      }
      // 校验通过时 再提交待办
      if (this.validBacklogInfo(outIndex, index)) {
        var param = {
          'executeTime': new Date(this.backlogList[outIndex].detailResList[index].executeTime).format('yyyy-MM-dd hh:mm:ss'), // 待办执行时间
          'id': this.backlogList[outIndex].detailResList[index].id, // 待办ID
          'mrn': this.backlogList[outIndex].mrn, // 病人mrn
          'organCode': this.organCode, // 组织机构码
          'patientId': this.backlogList[outIndex].patientId, // 病人ID
          'operatorId': this.common.getLocalStorage('PAT_loginName'), // 当前操作人工号
          'operatorName': this.common.getLocalStorage('PAT_staffName'), // 当前操作人姓名
          'delayOrInexecut': this.backlogList[outIndex].detailResList[index].delayOrInexecut, // 延迟执行或不执行
          'delayOrInexecutReason': this.backlogList[outIndex].detailResList[index].executionInfo.name, // 延迟执行或不执行原因
          'resultType': 'end' // 处理完毕，通知后台删除待办
        }
        // 如果选择了其他原因 原因取其他框输入值
        if (this.backlogList[outIndex].detailResList[index].executionInfo.customize === '1') {
          param.delayOrInexecutReason = this.backlogList[outIndex].detailResList[index].executionInfo.otherInfo
        }
        this.common.ajax({
          url: 'patientinfo-service/backlog/process',
          dataType: 'text',
          type: 'post',
          data: JSON.stringify(param),
          callback: function () {
            that.common.tip_msg('提交成功~')
            that.queryBacklogClass(false, that.backlogList[outIndex].patIndexNo, outIndex)
          }
        })
      }
    },
    // 筛选prn类型待办
    executePRN: function (index) {
      this.backlogList[index].frequencyName = 'prn'
      this.backlogList[index].currentClassCode = ''
      this.queryPatientBacklog(index)
    },
    /**
     * 全部延迟执行或不执行 弹窗
     * @param {string} code 延迟执行或不执行 code值
     * @param {string} title 弹窗标题
     */
    executionAllPop: function (code, title, index) {
      var that = this
      layer.open({
        type: 1,
        title: '全部' + title,
        area: ['500px', ''],
        shadeClose: true,
        content: $('#pop-content-execution'),
        success: function () {
          that.executionInfo.patientIndex = index
          that.executionInfo.code = code
          if (code === '1') {
            that.executionList = that.delayExecution
          } else if (code === '2') {
            that.executionList = that.nonExecution
          }
        },
        end: function () {
          that.executionInfo.patientIndex = ''
          that.executionInfo.code = ''
          that.executionInfo.name = ''
          that.executionInfo.customize = ''
          that.executionInfo.otherInfo = ''
        }
      })
    },
    // 提交全部延迟执行或不执行
    submitExecutionAll: function () {
      if (this.loadingSubmit) {
        return false
      }
      // 未选则原因时 进行提醒
      if (!this.executionInfo.name) {
        this.common.tip_msg('请先选择原因！')
        return false
      }
      if (this.executionInfo.customize === '1' && !this.executionInfo.otherInfo) {
        this.common.tip_msg('请先填写其他原因！')
        return false
      }
      layer.load(2, {offset: ['50%', '50%']})
      this.loadingSubmit = true
      var idList = []
      this.backlogList[this.executionInfo.patientIndex].detailResList.map(function (backlog) {
        if (backlog.isCanOprate) {
          idList.push(backlog.id)
        }
      })
      var param = {
        'executeTime': new Date().format('yyyy-MM-dd hh:mm:ss'), // 待办执行时间
        'idList': idList, // 待办ID
        'mrn': this.backlogList[this.executionInfo.patientIndex].mrn, // 病人mrn
        'organCode': this.organCode, // 组织机构码
        'patientId': this.backlogList[this.executionInfo.patientIndex].patientId, // 病人ID
        'operatorId': this.common.getLocalStorage('PAT_loginName'), // 当前操作人工号
        'operatorName': this.common.getLocalStorage('PAT_staffName'), // 当前操作人姓名
        'delayOrInexecut': this.executionInfo.code, // 延迟执行或不执行
        'delayOrInexecutReason': this.executionInfo.name, // 延迟执行或不执行原因
        'resultType': 'end' // 处理完毕，通知后台删除待办
      }
      // 如果选择了其他原因 原因取其他框输入值
      if (this.executionInfo.customize === '1') {
        param.delayOrInexecutReason = this.executionInfo.otherInfo
      }
      // console.log(param)
      // return false
      var that = this
      this.common.ajax({
        url: 'patientinfo-service/backlog/process',
        dataType: 'text',
        type: 'post',
        data: JSON.stringify(param),
        callback: function () {
          that.loadingSubmit = false
          layer.closeAll()
          that.common.tip_msg('提交成功~')
          that.queryBacklogClass(false, that.backlogList[that.executionInfo.patientIndex].patIndexNo, that.executionInfo.patientIndex)
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
