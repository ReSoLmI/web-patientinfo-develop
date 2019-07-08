<template>
	<div id="patientInfo">
		<div class="am-page-rcont-fixed ml-170" :class="{'bt-52':patient.firstAssessment==='0'&&workList.mode===0&&workList.unfinish.length>0}" v-show="loading==1" style="display:none;" id="patientInfoCon">
			<div class="am-hbox">
				<!-- 患者信息展示 start -->
				<div class="am-nmtlr-20">
					<div class="am-patient-item">
						<div class="first">{{patient.bedNo}}</div>
						<div class="second">
							<h3>{{patient.name}}</h3>
							<div class="h3-small">{{patient.displayId}}
								<i>|</i>{{showSex(patient.physiSexCode).name}}
								<i>|</i>{{patient.ageHis | calculateAge()}}
								<span class="am-ml-10"></span>
								<span data-tooltip="true" v-for="(proper,index) in patient.propers" :key="index" v-if="proper.logogram" :title="proper.properName" class="showTip txt-plain-type-staging am-ml-5" :style="{color:proper.color,border: '1px solid '+ proper.color}">{{proper.logogram}}</span>
							</div>
						</div>
						<div class="third">
							更多信息
							<br />
							<i class="am-angle"></i>
						</div>
						<div class="fifth" v-if="isShowWristBand">
							<a class="am-btn am-btn-plain-secondary" id="wristPrint" @click="wristPrint()">打印腕带</a>
						</div>
						<div class="fifth" v-if="isShowAllergyManage">
							<a class="am-btn am-btn-plain-secondary" id="pop-01" @click="configAllergy()">过敏信息</a>
						</div>
						<div class="fifth" v-if="isShowCDR">
							<a class="am-btn am-btn-plain-secondary" @click="showCDR()">CDR查看</a>
						</div>
						<div class="fourth" v-if="isShowEnr">
							<a class="am-btn am-btn-plain-secondary" @click="openPage('firstEva')">新增评估</a>
						</div>
					</div>
					<div class="am-patient-item-details" style="display:none;">
						<table style="margin-bottom:0;">
							<tr>
								<th>入院时间</th>
								<td>{{patient.admissionTime | date('yyyy-MM-dd hh:mm')}}
									<i class="badge-text-sm">{{showInDays(patient.admissionTime)}}天</i>
								</td>
								<th>临床科室</th>
								<td>{{patient.wardName||'--'}}</td>
								<th>主治医生</th>
								<td>{{patient.attendDrName||'--'}}</td>
								<th>过敏史</th>
								<td>{{patient.allergy||'--'}}</td>
								<th>医保费别</th>
								<td>{{patient.chargeTypeName||'--'}}</td>
							</tr>
							<tr>
								<th>预交款项</th>
								<td>{{patient.prePayment | number(2)}}元</td>
								<th>费用合计</th>
								<td>{{patient.totalCost | number(2)}}元</td>
								<th>联系电话</th>
								<td>{{patient.mobileNo || '--'}}</td>
								<th>诊断</th>
								<td colspan="3">{{patient.diagnosis|| '--'}}</td>
							</tr>
							<tr>
								<th>饮食</th>
								<td colspan="7">{{patient.diet||'--'}}</td>
							</tr>
						</table>
					</div>
					<div class="am-patient-item-details2">
						<table>
							<tr v-if="isShowEnr">
								<th>患者问题</th>
								<td>
									<span v-if="patient.firstAssessment==='0'&&patient.focusProperList.length>0" v-for="(focus,index) in patient.focusProperList" :key="index" class="am-mr-20">{{focus.catalogueName}}</span>
									<span v-if="patient.firstAssessment==='0'&&patient.focusProperList.length==0">暂无问题</span>
									<span v-if="patient.firstAssessment!=='0'">暂未评估，请先做评估。</span>
								</td>
							</tr>
							<tr v-if="isShowEnr">
								<th>患者主述</th>
								<td>{{patient.patChiefDescr || '--'}}</td>
							</tr>
							<tr>
								<th>诊断</th>
								<td>{{patient.diagnosis|| '--'}}</td>
							</tr>
						</table>
					</div>
				</div>
				<!-- 患者信息展示 end -->

				<!-- 病人待办(混合版) 复旦版本 start -->
				<div class="iteration-info-panel am-mt-20" v-if="backlogVersion==='0'">
					<div class="hd">护理任务清单
						<div style="display: inline-block; float: right; margin-right: 10px;">
							<input type="text" class="input-text input-date" style="width: 130px;" placeholder="开始时间" @click="datePicker('startDate', 'endDate')" v-model="backlogStartTime" id="startDate" readonly> -
							<input type="text" class="input-text input-date" style="width: 130px;" placeholder="结束时间" @click="datePicker('endDate', 'startDate')" v-model="backlogEndTime" id="endDate" readonly>
						</div>
					</div>
					<div class="bd">
						<div class="inner-b-tb" v-if="backlogList.length>0">
							<div v-for="(questioninfo,index) in backlogList" :key="index">
								<table class="am-tb bg-white" :class="{'tb-remove-tline':index==0}">
									<colgroup>
										<col style="width: 150px;" />
									</colgroup>
									<tr>
										<td :rowspan="questioninfo.detailResList.length" class="wy-th td-center">{{questioninfo.questionName}}</td>
										<td class="td-wy-auxiliary" v-if="questioninfo.detailResList.length>0">
											{{questioninfo.detailResList[0].backlogName}}
											<a class="wy-auxiliary" :class="showBacklogOper(questioninfo.detailResList[0].classCode).className" @click="executeBacklog(questioninfo, questioninfo.detailResList[0])">{{showBacklogOper(questioninfo.detailResList[0].classCode).btnName}}</a>
										</td>
									</tr>
									<tr v-if="questioninfo.detailResList.length>1 && index>0" v-for="(measureinfo,index) in questioninfo.detailResList" :key="index">
										<td class="td-wy-auxiliary">
											{{measureinfo.backlogName}}
											<a class="wy-auxiliary" :class="showBacklogOper(measureinfo.classCode).className" @click="executeBacklog(questioninfo, measureinfo)">{{showBacklogOper(measureinfo.classCode).btnName}}</a>
										</td>
									</tr>
								</table>
							</div>
						</div>
						<div class="no-data-txt" v-if="backlogList.length==0">暂无相关任务清单</div>
					</div>
				</div>
				<!-- 病人待办(混合版) 复旦版本 end -->

				<!-- 病人待办(混合版) 江苏版本 start -->
				<!-- 待办列表 start -->
				<div class="iteration-info-panel am-mt-20" v-if="backlogVersion==='1'">
					<div class="hd">护理任务清单
						<div style="display: inline-block; float: right; margin-right: 10px;">
							<input type="text" class="input-text input-date" style="width: 130px;" placeholder="开始时间" @click="datePicker('startDate1', 'endDate1')" v-model="backlogStartTime" id="startDate1" readonly> -
							<input type="text" class="input-text input-date" style="width: 130px;" placeholder="结束时间" @click="datePicker('endDate1', 'startDate1')" v-model="backlogEndTime" id="endDate1" readonly>
						</div>
					</div>
					<div class="bd">
						<div class="condition-strip-top">
							<ul class="strip-top strip-top-36">
								<li v-for="(backlogclass,index) in backlogClass" :key="index" :class="{'active':currentClassCode==backlogclass.classCode}" @click="queryBacklogByClass(backlogclass.classCode)">{{backlogclass.className}}<span class="wy-badge-danger am-ml-5">{{backlogclass.count}}</span></li>
							</ul>
							<div class="right-36">
								<a class="prn" @click="executePRN()" :class="{'active':frequencyName=='prn'}">PRN</a>
								<a v-if="canOperateCount>0&&frequencyName!='prn'" @click="executionAllPop('1', '延迟执行')">全部延迟执行</a>
								<a class="am-ml-10" v-if="canOperateCount>0&&frequencyName!='prn'" @click="executionAllPop('2', '不执行')">全部不执行</a>
								<span class="am-ml-10" style="cursor:not-allowed;" v-if="canOperateCount==0 || frequencyName=='prn'">全部延迟执行</span>
								<span class="am-ml-10" style="cursor:not-allowed;" v-if="canOperateCount==0 || frequencyName=='prn'">全部不执行</span>
							</div>
						</div>
						<div class="am-pd-10">
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
								<tr v-if="backlogList.length>0" v-for="(backlog,index) in backlogList" :key="index">
									<td class="text-left">{{backlog.preExecuteTime | date('yyyy-MM-dd hh:mm')}}
										<div class="am-mt-5">
											<input type="text" class="input-text input-date" :id='"input_"+index' style="max-width: 180px;" :class="{'input-disabled':!backlog.isCanOprate}" :disabled="!backlog.isCanOprate"  @click="datePicker('input_'+index, '', index)" v-model="backlog.executeTime" readonly>
										</div>
									</td>
									<td>
										<span class="txt-delay-circle showTip" v-if="backlog.delayExeTimes&&backlog.delayExeTimes>0" data-tooltip="true" :title="`已延迟${backlog.delayExeTimes}次`">延</span>{{backlog.backlogName}}
									</td>
									<td>
										<div class="am-btn-rdo">
											<a :class="{'active':backlog.delayOrInexecut==='1','disabled':(!backlog.isCanOprate||backlog.frequencyName=='prn')}" @click="selectDelayOrInexecut(index, '1')">延迟执行</a>
											<a :class="{'active':backlog.delayOrInexecut==='2','disabled':(!backlog.isCanOprate||backlog.frequencyName=='prn')}" @click="selectDelayOrInexecut(index, '2')">不执行</a>
										</div>
										<div v-if="backlog.delayOrInexecut" style="height:30px;line-height: 30px;">
											<label class="am-ctr-rdo am-mr-10" v-for="(execution,index) in backlog.executionList" :key="index" :class="{'active':backlog.executionInfo.name==execution.constantValue}" @click="selectExecution($outer.index, execution)">
												<input type="radio" :name="`rdo-list-${backlog.index}`"><i></i><span class="txt">{{execution.constantValue}}</span>
											</label>
											<input type="text" class="input-text" v-if="backlog.executionInfo.customize==='1'" v-model="backlog.executionInfo.otherInfo" style="width: 100px;" maxlength="20" />
										</div>
									</td>
									<td>
										<a v-if="backlog.isCanOprate" @click="submitBacklog(index)">提交</a>
										<span class="am-txt-label" style="cursor:not-allowed;" v-if="!backlog.isCanOprate">提交</span>
									</td>
								</tr>
							</table>
						</div>
						<div class="no-data-txt" v-if="backlogList.length==0" style="padding-top:0;">暂无相关任务清单</div>
					</div>
				</div>
				<!-- 待办列表 end -->

				<!-- 全部延迟执行或不执行选择 start -->
				<div id="pop-content-execution" style="display: none;position: relative;">
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
							<label class="am-ctr-rdo" v-for="(execution,index) in executionList" :key="index" :class="{'active':executionInfo.name==execution.constantValue}" @click="selectExecution('', execution)">
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
				<!-- 病人待办(混合版) 江苏版本 end -->

				<!-- 病人待办(微应用拆分版) start -->
				<div class="iteration-info-panel am-mt-20" v-for="(item,index) in appList" :key="index">
					<div class="hd">{{item.appName}}</div>
					<div class="bd" :id="`${item.appCode}_tempCon`">
						<div v-if="item.idList && item.idList.length > 0" v-for="(tmpid,index) in item.idList" :key="index" :id="`${item.appCode}_${tmpid}_tempCon`">
							<div class="no-data-txt text-center">加载中...</div>
						</div>
						<div v-if="!item.idList || item.idList.length == 0" class="no-data-txt text-center">加载中...</div>
					</div>
				</div>
				<!-- 病人待办(微应用拆分版) end -->
			</div>
		</div>
	</div>
</template>

<script>
// import '../../common/js/vendor/artTemplate.js'
// import template from 'art-template'
// import moment from 'moment'
import allery from './allery'
import common from '../../../common/js/common'
// import '../../../common/js/filter'
const template = require('art-template/lib/template-web')
export default {
  name: '',
  compoment: {allery},
  data () {
    return {
      wardCode: this.common.getUrlParam('wardCode'), // 科室code
      organCode: this.common.getOrganCode(), // 组织机构码
      patIndexNo: this.common.getUrlParam('patIndexNo'), // 病人编号
      loading: 0, // 加载中标志 0:加载中
      baseUrl: this.common.baseUrl,
      patient: {}, // 当前患者信息
      printTemplete: {}, // 腕带打印模板
      backlogs: {},
      workList: {
        mode: 0, // 0未完成 1已完成
        unfinishCount: 0,
        finishedCount: 0,
        unfinish: [],
        finishedList: []
      }, // 工作清单
      loadUnfinish: 0,
      loadFinished: 0,
      papUnFinish: {
        totalItems: 0,
        currentPage: 1,
        items_per_page: 50,
        totalPages: 0
      },
      papFinish: {
        totalItems: 0,
        currentPage: 1,
        items_per_page: 50,
        totalPages: 0
      },
      appList: [],
      isShowEnr: false,
      isShowAllergyManage: false, // 是否展示过敏管理入口
      timeInfo: {},
      isShowAllergyInfo: true,
      loadingAllery: true, // 过敏数据加载标志
      savedAllergyList: [],
      currentAllergyIndex: 0,
      allergyMode: 'new', // 过敏模式 新增过敏信息|编辑过敏信息
      allergyInfo: {
        allergyName: '选择过敏类型',
        allergyRemark: '',
        registerResult: '选择登记结果',
        registerTime: new Date().format('yyyy-MM-dd hh:mm:ss'),
        symptomDescription: [],
        otherDescription: '',
        allergyCode: '',
        registerResultCode: ''
      },
      symptomList: [], // 症状描述 列表
      resultList: [], // 登记结果 列表
      allergyTypeList: [],
      delAllergyIndex: undefined,
      searchKey: undefined,
      delIndexNo: undefined,
      isShowNoData: false,
      isShowWristBand: false, // 是否启用腕带打印功能
      isShowCDR: false, // 是否展示cdr查看按钮
      CDR_URL: '', // cdr查看URL
      backlogVersion: '', // 待办版本 默认0-复旦版本 1-江苏版本
      backlogList: [], // 待办列表
      backlogStartTime: new Date().format('yyyy-MM-dd'), // 待办查询开始时间
      backlogEndTime: new Date().format('yyyy-MM-dd'), // 待办查询结束时间
      backlogClass: [], // 待办分类
      currentClassCode: '', // 当前待办分类
      frequencyName: '', // 类别编码
      delayExecution: [], // 延迟执行原因
      nonExecution: [], // 不执行原因
      executionList: [], // 执行或不执行原因展示list
      executionInfo: { // 选择的延迟执行或不执行原因及其他输入值
        code: '', // 延迟执行或不执行
        name: '', // 展示名称
        customize: '', // 是否为自定义项
        otherInfo: '' // 其他-输入值
      },
      canOperateCount: 0, // 当前可操作的待办数量
      loadingSubmit: false, // 提交时loading
      backlogMinDate: 0,
      backlogMaxDate: 0
    }
  },
  filters: {
    date (value, format) {
      return new Date(value).format(format)
    },
    calculateAge (value) {
      return common.calculateAge(value).age
    },
    number (value, size) {
      if (value) {
        return value.toFixed(size)
      } else {
        var number = 0
        return number.toFixed(size)
      }
    }
  },
  watch: {
    // 监测待办查询开始时间
    backlogStartTime (newValue, oldValue) {
      console.log(11)
      if (this.backlogStartTime && this.backlogEndTime) {
        this.queryBacklogClass()
      }
    },
    // 监测待办查询结束时间
    backlogEndTime (newValue, oldValue) {
      if (this.backlogStartTime && this.backlogEndTime) {
        this.queryBacklogClass()
      }
    }
  },
  mounted () {
    var islogin = this.common.isLogin()
    if (!islogin) {
      return false
    }
    this.patIndexNo = this.common.getUrlParam('patIndexNo')
    this.common.setLocalStorage('PAT_pageFrom', this.common.getUrlParam('pageFrom'))
    this.common.setLocalStorage('PAT_transPage', this.common.getUrlParam('transPage'))
    this.common.setLocalStorage('PAT_transFun', this.common.getUrlParam('transLogoutFun'))
    this.loading = 0
    this.workList = {
      mode: 0, // 0未完成 1已完成
      unfinishCount: 0,
      finishedCount: 0,
      unfinish: [],
      finishedList: []
    }
    this.wardCode = this.common.getUrlParam('wardCode')
    this.patIndexNo = this.common.getUrlParam('patIndexNo')
    this.initQuery(true)
    // 显示更多信息
    $('.third').click(function () {
      $(this).parents('.am-patient-item').next('.am-patient-item-details').slideToggle()
      $(this).toggleClass('active')
    })
    // 监听切换tab时传过来的patIndexNo以获取对应患者信息
    var that = this
    window.addEventListener('message', that.patientInfoListener, false)
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('message', that.patientInfoListener, false)
    })
  },
  methods: {
    // 日期控件配置处理
    datePicker (elementId, endDate, index) {
      var that = this
      var min = ''
      var max = ''
      var format = ''
      if (index && that.backlogList[index].preExecuteTime) {
        min = that.backlogList[index].preExecuteTime
        max = '%y-%M-%d'
        format = 'yyyy-MM-dd HH:mm'
      } else {
        format = 'yyyy-MM-dd'
        if (elementId === 'startDate' || elementId === 'startDate1') {
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
          if (elementId === 'startDate' || elementId === 'startDate1') {
            that.backlogStartTime = value
          } else {
            that.backlogEndTime = value
          }
        }
      })
    },
    // 监听事件处理
    patientInfoListener (e) {
      if (e.data.curTabId) {
        this.patIndexNo = e.data.curTabId
        this.initQuery(true)
      }
    },
    /**
		 * 初始化时数据查询
		 * @param {bool} isFrist 是否初始化时加载
		 */
    initQuery: function (isFrist) {
      var that = this
      // 查询新病人、新医嘱规则
      this.common.queryRuleList(['newPatient', 'newOrder'], function (ruleList) {
        that.timeInfo = that.common.queryTimeCondition(ruleList)
        // 查询患者详情
        that.queryPatientInfo(isFrist)
      })

      // 初始化enr接入配置为FALSE
      this.isShowEnr = false
      // 初始化过敏管理入口配置为FALSE
      this.isShowAllergyManage = false

      // 查询enr是否接入配置、过敏管理入口配置、腕带打印入口配置、CDR_URL数据、待办展现版本、延迟执行原因、不执行原因
      this.common.queryConstants(['ENR_ACCESS_PATIENT', 'ALLERGY_MANAGE', 'WRIST_BAND_PRINT', 'CDR_URL', 'BACKLOG_VERSION', 'DELAY_EXECUTION', 'NON_EXECUTION', 'BACKLOG_QUERY_MINDATE', 'BACKLOG_QUERY_MAXDATE'], true, function (data) {
        // 查询enr是否接入配置
        if (data && data.ENR_ACCESS_PATIENT && data.ENR_ACCESS_PATIENT.length > 0) {
          if (Number(data.ENR_ACCESS_PATIENT[0].constantValue && data.ENR_ACCESS_PATIENT[0].constantValue) === 1) {
            that.isShowEnr = true
          }
        }
        // 查询过敏管理入口配置
        if (data && data.ALLERGY_MANAGE && data.ALLERGY_MANAGE.length > 0) {
          if (Number(data.ALLERGY_MANAGE[0].constantValue && data.ALLERGY_MANAGE[0].constantValue) === 1) {
            that.isShowAllergyManage = true
          }
        }
        // 是否开启腕带打印入口
        if (data && data.WRIST_BAND_PRINT && data.WRIST_BAND_PRINT.length > 0) {
          if (Number(data.WRIST_BAND_PRINT[0].constantValue && data.WRIST_BAND_PRINT[0].constantValue) === 1) {
            that.isShowWristBand = true
          }
        }
        // 是否开启CDR查看入口
        if (data && data.CDR_URL && data.CDR_URL.length > 0) {
          if (data.CDR_URL[0].constantValue) {
            that.isShowCDR = true
            that.CDR_URL = data.CDR_URL[0].constantValue
          }
        }
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

      // 复旦版本待办
      if (this.backlogVersion === '0') {
        // 查询患者待办
        this.queryPatientBacklog()
      } else { // 江苏版本待办
        // 查询待办分类
        this.queryBacklogClass(true)
      }
    },
    queryPatientInfo: function (isFrist) {
      var that = this
      var param = {
        wardCode: this.wardCode, // 科室code
        organCode: this.organCode, // 组织机构码
        status: 'in', // 病人状态 in-在院 out-出院
        patIndexNo: this.patIndexNo, // 病人唯一码
        // 医嘱查询开始时间 该字段用来查是否有新医嘱
        enterBeginTime: this.timeInfo.enterBeginTime,
        // 入院查询开始时间 该字段用来查询是否为新病人
        admissionBeginTime: this.timeInfo.admissionBeginTime,
        // 查询结束时间 默认为当前系统时间
        endTime: this.timeInfo.endTime
      }

      this.common.ajax({
        url: 'patientinfo-service/patients/v2/info/page',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (data) {
          var list = data.content
          if (list.length > 0) {
            list[0].focusProperList = list[0].focusProperList ? list[0].focusProperList : []
            list[0].firstAssessment = list[0].firstAssessment ? list[0].firstAssessment : ''
            // 病人对应属性收集
            var propersObj = {}
            // 先收集默认属性
            for (var j = 0; j < list[0].propers.length; j++) {
              propersObj[list[0].propers[j].properCode] = list[0].propers[j]
            }
            // 收集欠费标志属性
            if (Number(list[0].arrearFlag) === 1) {
              propersObj['arrearFlag'] = {
                indexNo: null,
                patIndexNo: list[0].patIndexNo,
                properCode: 'arrearFlag',
                properName: '欠费',
                logogram: '欠',
                color: '#FF9F01'
              }
            }
            list[0].propersObj = propersObj
            that.patient = list[0]
            that.loading = 1
            // that.getWorkListCount();
            // 查询患者标识
            that.queryPatientsPropers(param)
            // 查询患者诊断信息
            that.queryPatientsDiagnosis(that.patient.patIndexNo)
            // 查询患者过敏信息
            that.queryPatientsAllergy(that.patient.patIndexNo)

            // 初始化加载时查询接入应用列表
            if (isFrist) {
              var appList = that.common.queryAccessAppsFromPatient()
              that.appList = appList.appList
            }

            that.$nextTick(_ => {
              that.queryAppList()
            })
          } else {
            that.common.tip_msg('找不到该病人', 1000, function () {
              window.location.href = this.common.baseUrl + '#/inpatient/ward/wardIndex?wardCode=' + that.wardCode
            })
          }
        },
        failure: function () {
          that.loading = 1
        }
      })
    },
    /**
     * 查询患者诊断信息
     * @param {string} patIndexNo 查询病人编号
     */
    queryPatientsDiagnosis: function (patIndexNo) {
      var that = this
      var param = {
        organCode: this.common.getOrganCode(),
        diagTypeCodeList: 6,
        patIndexNo: patIndexNo
      }
      this.common.ajax({
        url: 'baseinfo2.0/inhospdiagnosis/inhospdiagnosis',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (data) {
          var diagnosis = ''
          if (data && data.length > 0) {
            data.map(function (patient) {
              diagnosis += (diagnosis ? '，' : '') + patient.diagName
            })
          }
          that.patient.diagnosis = diagnosis
        }
      })
    },
    /**
     * 查询患者过敏信息
     * @param {string} patIndexNo 查询病人编号
     */
    queryPatientsAllergy: function (patIndexNo) {
      var that = this
      var param = {
        organCode: this.common.getOrganCode(),
        patIndexNo: patIndexNo,
        registerResultCode: 1 // 只查询阳性项
      }
      this.common.ajax({
        url: 'baseinfo2.0/allergy/allergy',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (data) {
          var allergy = ''
          if (data && data.length > 0) {
            data.map(function (patient) {
              allergy += (allergy ? '，' : '') + patient.allergyName
            })
          }
          that.patient.allergy = allergy
          // 收集过敏标志属性
          if (that.patient.allergy) {
            that.patient.propers.push({
              indexNo: null,
              patIndexNo: patIndexNo,
              properCode: 'allergy',
              properName: '过敏',
              logogram: '敏',
              color: '#D81DDA'
            })
          }

          that.$nextTick(_ => {
            that.controlPage()
          })
        }
      })
    },
    /**
			 * 查询病人属性数据
			 * @param {object} param 查询参数
			 */
    queryPatientsPropers: function (param) {
      var that = this
      this.common.ajax({
        url: 'patientinfo-service/patients/v2/proper',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (data) {
          if (data) {
            if (data[that.patient.patIndexNo]) {
              if (data[that.patient.patIndexNo].properList) {
                // 先将原propers字段合并到一起
                that.patient.propers.push.apply(that.patient.propers, data[that.patient.patIndexNo].properList)
                // 再将属性值转换为对象存储 用以去重
                for (var i = 0; i < that.patient.propers.length; i++) {
                  var proper = that.patient.propers[i]
                  that.patient.propersObj[proper.properCode] = proper
                }
              }
              if (data[that.patient.patIndexNo].focusProperList && data[that.atient.patIndexNo].focusProperList.length > 0) {
                that.patient.focusProperList.push.apply(that.patient.focusProperList, data[that.patient.patIndexNo].focusProperList)
              }
              // 再将对象转换为数组赋值
              var propers = []
              for (var k in that.patient.propersObj) {
                propers.push(that.patient.propersObj[k])
              }
              that.patient.propers = propers
            }
          }
          that.$nextTick(_ => {
            that.controlPage()
          })
        }
      })
    },
    // 移除tooltips插件效果
    destroyTooltip: function () {
      $('[data-tooltip="true"]').tooltip('destroy')
      $('.tooltip').remove()
    },
    // 控制界面展示
    controlPage: function () {
      // 移除tooltips插件效果
      this.destroyTooltip()

      // 提示
      $('.showTip').tooltip({
        container: 'body',
        placement: 'auto top'
      })
    },
    queryAppList: function () {
      for (var i = 0; i < this.appList.length; i++) {
        var app = this.appList[i]
        if (app.idList && app.idList.length > 0) {
          for (var j = 0; j < app.idList.length; j++) {
            this.queryAppTemplate(app.appCode, app.idList[j])
          }
        } else {
          this.queryAppTemplate(app.appCode)
        }
      }

      $('#patientInfo').unbind('click').on('click', '.operElemTemp', function () {
        var url = $(this).attr('data-url')
        var popType = $(this).attr('pop-type')
        /**
         * popType 0:弹框右侧弹出 1:弹框屏幕居中弹出
         * 右侧弹出时 弹框宽度从参数取，默认值7855px,高度不可改默认100%
         * 屏幕居中时 弹框宽高从参数取，宽度默认值480px,高度自适应
         */
        var popWidth = $(this).attr('pop-width')
        var popHeight = $(this).attr('pop-height')
        this.openPage(null, url, popType, popWidth, popHeight)
      })
    },
    queryAppTemplate: function (appCode, tmpId) {
      var that = this
      var param = {
        organCode: this.organCode,
        wardCode: this.wardCode,
        patientId: this.patient.patientId,
        mrn: this.patient.mrn,
        patIndexNo: this.patIndexNo,
        appCode: appCode,
        appType: 'pc',
        tmpId: tmpId
      }
      this.common.ajax({
        url: 'patientinfo-service/template/query',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (result) {
          var tempDatas = {
            tempDatas: JSON.parse(result.data) // 此data变量为模板所需后台接口返回数据
          }
          that.renderTemplate(
            result.template,
            appCode,
            tempDatas,
            tmpId
          )
        },
        failure: function (r) {
          var errorInfo =
						'<div class="no-data">' +
						'<div class="img"></div>' +
						'<div class="responsive-txt">' +
						'<div class="txt"><span>应用存在异常~</span></div>' +
						'</div>' +
						'</div>'
          if (tmpId !== null && tmpId !== undefined) {
            $('#' + appCode + '_' + tmpId + '_tempCon').html(errorInfo)
          } else {
            $('#' + appCode + '_tempCon').html(errorInfo)
          }
        }
      })
    },
    renderTemplate: function (templateStr, appCode, data, tmpId) {
      var render = template.compile(templateStr)
      var html = render(data)
      // 打印渲染结果
      // console.log(html);
      if (tmpId != null && tmpId !== undefined) {
        $('#' + appCode + '_' + tmpId + '_tempCon').html(html)
      } else {
        $('#' + appCode + '_tempCon').html(html)
      }
    },
    showNursingClass: function (nursingClass, type) {
      return this.common.showNursingClass(nursingClass, type)
    },
    showSex: function (sexCode) {
      return this.common.showSex(sexCode)
    },
    showInDays: function (admissionTime) {
      return this.common.showInDays(admissionTime)
    },
    showBedNo: function (nursingClass) {
      return this.common.showBedNo(nursingClass)
    },
    wristPrint: function () {
      this.print(this.patIndexNo)
    },
    print: function (patIndexNo) {
      var that = this
      this.common.queryPatientInfo({
        data: {
          patIndexNo: patIndexNo,
          status: 'in'
        },
        callback: function (data) {
          if (data && data.length > 0) {
            var patient = data[0]
            // console.log(JSON.stringify(this.printTemplete));
            // console.log(JSON.stringify(patient));
            // var age = this.common.calculateAge(patient.ageHis).year;
            // age = age === 'adult' ? '18' : age;
            // this.queryTemplete(age);
            that.printTemplete = that.common.queryPrintTemplete(
              that.wardCode,
              patient
            )
            if (that.common.$getLength(that.printTemplete) > 0) {
              // WristStrapPrint(JSON.stringify(this.printTemplete), JSON.stringify(patient));
              // parent.ewellBrowserLabel.printLabel(JSON.stringify(this.printTemplete), JSON.stringify(patient));
              parent.ewellBrowserLabel.printLabel(
                JSON.stringify(that.printTemplete),
                JSON.stringify(that.patient)
              )
              that.printCallback(patIndexNo)
            }
          }
        }
      })
    },
    printCallback: function (patIndexNo) {
      var param = {
        wardCode: this.wardCode,
        patIndexNos: [patIndexNo]
      }
      this.common.ajax({
        url: 'patientinfo-service/patients/bands/result?organCode=' +
					this.organCode,
        dataType: 'json',
        type: 'post',
        data: JSON.stringify(param),
        callback: function (data) { }
      })
    },
    getWorkListCount: function () {
      var that = this
      this.common.ajax({
        url: 'enr-service/backlog/measure/count/' +
					this.patIndexNo +
					'/new',
        dataType: 'json',
        type: 'get',
        callback: function (data) {
          that.workList.unfinishCount = data[0]
          that.workList.finishedCount = data[1]
        }
      })
    },
    loadMoreWorkList: function () {
      if (this.workList.mode === 0) {
        if (
          this.papUnFinish.currentPage <
					this.papUnFinish.totalPages
        ) {
          this.papUnFinish.currentPage += 1
          this.getWorkList()
        }
      } else {
        if (
          this.papFinish.currentPage <
					this.papFinish.totalPages
        ) {
          this.papFinish.currentPage += 1
          this.getWorkList()
        }
      }
    },
    getWorkList: function (isShowPageOne) {
      var param = {}
      if (isShowPageOne === 1) {
        if (this.workList.mode === 0) {
          this.papUnFinish.currentPage = 1
          // this.workList.unfinish=[];
          this.loadUnfinish = 0
        } else {
          this.papFinish.currentPage = 1
          // this.workList.finishedList=[];
          this.loadFinished = 0
        }
      }

      var url = ''
      if (this.workList.mode === 0) {
        param.pageNumber = this.papUnFinish.currentPage - 1
        param.pageSize = this.papUnFinish.items_per_page
        url =
					'enr-service/backlog/measure/page/' +
					this.patIndexNo +
					'/isNotExe'
      } else {
        param.pageNumber = this.papFinish.currentPage - 1
        param.pageSize = this.papFinish.items_per_page
        url =
					'enr-service/backlog/measure/page/' +
					this.patIndexNo +
					'/isExe'
      }
      var that = this
      this.common.ajax({
        // url:"enr-service/backlog/measure/page/"+this.patIndexNo+"/"+this.workList.mode,
        url: url,
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (data) {
          if (isShowPageOne === 1) {
            if (that.workList.mode === 0) {
              that.workList.unfinish = []
            } else {
              that.workList.finishedList = []
            }
          }
          if (that.workList.mode === 0) {
            that.workList.unfinish.push.apply(
              that.workList.unfinish,
              data.content
            )
            that.loadUnfinish = 1
            that.$nextTick(_ => {
              that.papUnFinish.totalPages = data.totalPages
            })
          } else {
            that.workList.finishedList.push.apply(
              that.workList.finishedList,
              data.content
            )
            that.loadFinished = 1
            that.nextTick(_ => {
              that.papFinish.totalPages = data.totalPages
            })
          }
          // this.common.autoHeight("#patientInfo");
        }
      })
    },
    changeMode: function (mode) {
      this.workList.mode = mode
      // if((this.workList.mode === 0 && this.workList.unfinish.length===0)||(this.workList.mode === 1 && this.workList.finishedList.length===0)){
      this.getWorkList(1)
      // }
    },
    /**
     * 打开URL界面
     * @param {string} urlName URL code 根据code匹配对应的URL值（非必传）
     * @param {string} url 当前界面URL值
     * @param {string} popType 弹窗打开形式 0-屏幕右侧弹出(默认值) 1-屏幕居中显示
     * @param {string} popWidth 弹窗打开宽度值
     * @param {string} popHeight 弹窗打开高度值
     */
    openPage: function (urlName, url, popType, popWidth, popHeight) {
      if (urlName) {
        url = this.common.getBtnUrl(urlName)
      }
      if (!url) {
        return false
      }
      url += url.indexOf('?') > -1 ? '&' : '?'
      // var host = window.location.protocol + "//" + window.location.host;
      // var transPage = host + baseUrl + "transfer/transfer.html";
      $('.ui-sys-bar').css('display', 'none')

      /**
			 * postMessage监听
			 * @param {object} e 返回值
			 */
      popType = popType || 0
      var layerOption = {
        width: popType === 0 ? popWidth || '785px' : popWidth || '480px',
        height: popType === 0 ? '100%' : popHeight || '240px',
        offset: popType === 0 ? 'rb' : ''
      }

      var that = this
      layer.open({
        type: 2,
        title: false,
        closeBtn: 0,
        area: [layerOption.width, layerOption.height],
        offset: layerOption.offset,
        fixed: true,
        shadeClose: true,
        // maxmin: true,
        content: url +
					'wardCode=' + that.common.getUrlParam('wardCode') +
					'&patIndexNo=' + that.patIndexNo +
					'&token=' + that.common.getToken() +
					'&organCode=' + that.common.getOrganCode() +
					// + "&transPage=" + transPage
					// + "&transFun=execFun_partientInfo&transLogoutFun=execFun_logout"
					'&entrance=backlogTemp&pageFrom=' + that.common.getAppCode(),
        success: function () {
          window.addEventListener('message', that.backlogTempPostMessageListener, false)
        },
        end: function () {
          $('.ui-sys-bar').css('display', 'block')
          setTimeout(() => {
            // this.init();
            that.initQuery()
          }, 10)
          window.removeEventListener('message', that.backlogTempPostMessageListener, false)
        }
      })
    },
    backlogTempPostMessageListener (e) {
      if (e && e.data) {
        var result = e.data
        if (result.event && this[result.event]) {
          this[result.event]()
        }
      }
    },
    pageSwitch: function (pageSwitch) {
      var transPage = this.common.getUrlParam('transPage')
      var transFun = this.common.getUrlParam('transPageSwitchFun')

      $('#transIframe').remove()
      var execObj = document.createElement('iframe')
      execObj.id = 'transIframe'
      execObj.name = 'transIframe'
      execObj.src =
				transPage +
				'?transFun=' +
				transFun +
				'&param1=' +
				pageSwitch +
				'&param2=您有数据未保存，是否确定直接离开？'
      execObj.style.display = 'none'
      document.body.appendChild(execObj)
    },
    execFun_closeLayer: function () {
      layer.closeAll()
    },
    execFun_logout: function () {
      // this.common.logout()
      window.parent.postMessage({ from: 'allergy', event: 'logout' }, '*')
    },
    // 配置过敏信息
    configAllergy: function () {
      var that = this
      var host = window.location.protocol + '//' + window.location.host
      var url = host + this.common.baseUrl + '/#/patient/allery?' + 'wardCode=' + this.common.getUrlParam('wardCode') + '&patIndexNo=' + this.patIndexNo + '&token=' + this.common.getToken() + '&organCode=' + this.common.getOrganCode() + '&pageFrom=' + this.common.getAppCode()
      layer.open({
        type: 2,
        title: '过敏信息',
        area: ['850px', '100%'],
        offset: 'rb',
        fixed: true,
        shadeClose: true,
        maxmin: true,
        content: url,
        end: function () {
          setTimeout(() => {
            that.initQuery()
          }, 10)
        }
      })
      // this.$layer.iframe({
      //   type: 2,
      //   title: '过敏信息',
      //   area: ['850px', '100%'],
      //   offset: 'rb',
      //   fixed: true,
      //   yes: '',
      //   cancel: '',
      //   shade: true,
      //   shadeClose: true,
      //   maxmin: true,
      //   content: {
      //     content: allery, // 传递的组件对象
      //     parent: this, // 当前的vue对象
      //     data: {}// props
      //   }
      // })
    },
    // cdr查看
    showCDR: function () {
      var that = this
      if (!this.CDR_URL) {
        return false
      }
      var url = this.CDR_URL + (this.CDR_URL.indexOf('?') > -1 ? '&' : '?') + 'patientId=' + this.patient.visitCardNo

      $('.ui-sys-bar').css('display', 'none')
      layer.open({
        type: 2,
        title: 'CDR查看',
        // closeBtn: 0,
        area: ['85%', '100%'],
        offset: 'rb',
        fixed: true,
        shadeClose: true,
        maxmin: true,
        content: url,
        end: function () {
          $('.ui-sys-bar').css('display', 'block')
          setTimeout(function () {
            // this.init();
            that.initQuery()
          }, 10)
        }
      })
    },
    // 查询病人待办
    queryPatientBacklog: function () {
      var param = {
        patIndexNo: this.patIndexNo,
        organCode: this.organCode,
        wardCode: this.wardCode,
        startTime: this.backlogStartTime + ' 00:00:00',
        endTime: this.backlogEndTime + ' 23:59:59',
        classCode: this.currentClassCode, // 类别编码
        frequencyName: this.frequencyName // 频次名称
      }
      if (this.frequencyName === 'prn') {
        param.startTime = ''
        param.endTime = ''
      }
      var that = this
      this.common.ajax({
        url: 'patientinfo-service/backlog/query',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (data) {
          if (that.backlogVersion === '0') {
            that.backlogList = data
          } else {
            var backlogList = []
            var canOperateCount = 0
            data.map(function (backlog) {
              if (backlog.detailResList) {
                for (var i = 0; i < backlog.detailResList.length; i++) {
                  backlog.detailResList[i].executionList = [] // 延迟执行或不执行原因
                  backlog.detailResList[i].delayOrInexecut = '' // 延迟执行或不执行
                  backlog.detailResList[i].executionInfo = {
                    name: '',
                    customize: '',
                    otherInfo: ''
                  }
                  backlog.detailResList[i].executeTime = new Date().format('yyyy-MM-dd hh:mm') // 执行时间默认为当前时间
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
            that.backlogList = backlogList
            that.canOperateCount = canOperateCount

            that.$nextTick(_ => {
              that.controlPage()
            })
            // console.log(that.backlogList)
          }
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
      // window.parent.postMessage({from:'allergy',event:'logout'}, '*')
    },
    logout: function () {
      this.common.logout()
    },
    /**
		 * 执行待办-复旦版本
		 * @param {object} questionInfo 当前操作待办对应问题信息
		 * @param {object} measureInfo 当前操作待办对应措施信息
		 */
    executeBacklog: function (questionInfo, measureInfo) {
      var that = this
      // 评估或宣教类的待办 点击弹出对应操作界面
      if ((measureInfo.classCode === '0' || measureInfo.classCode === '2')) {
        if (measureInfo.jumpLink) {
          var jumpLink = measureInfo.jumpLink += (measureInfo.jumpLink.indexOf('?') > -1 ? '&' : '?')
          // 拼接病人及其他基础参数
          jumpLink +=
						'organCode=' + this.organCode + // 组织机构码
						'&token=' + this.common.getToken() + // 用户token
						'&wardCode=' + this.wardCode + // 病区code
						'&patIndexNo=' + this.patIndexNo + // 病人编号
						'&patientId=' + this.patient.patientId + // 病人ID
						'&mrn=' + this.patient.mrn + // 病案号
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
          var backlogPostMessageListener = function (e) {
            // 返回格式 {
            //   messageFrom: '' 消息来源
            //   event: '' 执行事件 关闭界面[closeFrame] 退出登录[logout]
            //   end: true, 执行是否结束
            //   executeTime: '' 执行时间
            // }
            if (e && e.data) {
              var result = e.data
              // 如果未接收到执行时间，则取系统当前时间
              if (!result.executeTime) {
                result.executeTime = new Date().format('yyyy-MM-dd hh:mm:ss')
              } else {
                result.executeTime = result.executeTime.replace(/-/g, '/')
                result.executeTime = new Date(result.executeTime).format('yyyy-MM-dd hh:mm:ss')
              }
              // 执行结束 删除待办
              if (result.end) {
                var param = {
                  'executeTime': result.executeTime, // 待办执行时间
                  'id': measureInfo.id, // 待办ID
                  'mrn': this.patient.mrn, // 病人mrn
                  'organCode': this.organCode, // 组织机构码
                  'patientId': this.patient.patientId, // 病人ID
                  'operatorId': this.common.getLocalStorage('PAT_loginName'), // 当前操作人工号
                  'operatorName': this.common.getLocalStorage('PAT_staffName'), // 当前操作人姓名
                  'resultType': 'end' // 处理完毕，通知后台删除待办
                }
                this.common.ajax({
                  url: 'patientinfo-service/backlog/process',
                  dataType: 'text',
                  type: 'post',
                  data: JSON.stringify(param),
                  callback: function () {
                    if (result.event && this[result.event]) {
                      that[result.event]()
                    }
                  }
                })
              } else if (result.event && this[result.event]) {
                this[result.event]()
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
            // maxmin: true,
            content: jumpLink,
            success: function () {
              window.addEventListener('message', backlogPostMessageListener, false)
            },
            end: function () {
              // 重新请求数据
              setTimeout(function () {
                that.initQuery()
              }, 10)
              window.removeEventListener('message', backlogPostMessageListener, false)
            }
          })
        } else {
          that.common.tip_msg('当前操作功能暂未开放~', 1000)
        }
      } else { // 其他类型的通知后台去处理
        var param = {
          'executeTime': new Date().format('yyyy-MM-dd hh:mm:ss'), // 待办执行时间
          'id': measureInfo.id, // 待办ID
          'mrn': this.patient.mrn, // 病人mrn
          'organCode': this.organCode, // 组织机构码
          'patientId': this.patient.patientId, // 病人ID
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
              that.initQuery()
            })
          }
        })
      }
    },
    // 查询待办分类
    queryBacklogClass: function (isInit) {
      var that = this
      var param = {
        organCode: this.organCode,
        patIndexNo: this.patIndexNo,
        wardCode: this.wardCode,
        startTime: this.backlogStartTime + ' 00:00:00',
        endTime: this.backlogEndTime + ' 23:59:59'
      }
      this.common.ajax({
        url: 'patientinfo-service/backlog/count/class',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (result) {
          if (result && result[that.patIndexNo]) {
            that.backlogClass = result[that.patIndexNo]
            // 第一次查询时 当前待办分类默认为第一个
            if (isInit) {
              that.currentClassCode = that.backlogClass[0].classCode
            }
            that.queryPatientBacklog()
          }
        }
      })
    },
    // 根据待办分类查看待办
    queryBacklogByClass: function (classCode) {
      this.frequencyName = ''
      this.currentClassCode = classCode
      this.queryBacklogClass()
    },
    /**
     * 选择延迟执行或不执行
     * @param {index} index 当前操作对象index值
     * @param {*} value 当前选中值
     */
    selectDelayOrInexecut: function (index, value) {
      if ($(this).hasClass('disabled')) {
        return false
      }
      // 清空已选中原因数据
      this.backlogList[index].executionInfo.name = ''
      this.backlogList[index].executionInfo.customize = ''
      this.backlogList[index].executionInfo.otherInfo = ''
      // 如果已选中已执行或不执行 再次点击时取消选中
      if (this.backlogList[index].delayOrInexecut === value) {
        this.backlogList[index].delayOrInexecut = ''
        this.backlogList[index].executionList = []
      } else { // 否则选中当前操作项 并进行数据处理
        this.backlogList[index].delayOrInexecut = value
        if (this.backlogList[index].delayOrInexecut === '1') {
          this.backlogList[index].executionList = this.delayExecution
        } else if (this.backlogList[index].delayOrInexecut === '2') {
          this.backlogList[index].executionList = this.nonExecution
        }
      }
    },
    /**
     * 选择延迟执行或不执行原因
     * @param {object} execution 原因对象
     */
    selectExecution: function (index, execution) {
      if (index !== '') {
        this.backlogList[index].executionInfo.name = execution.constantValue
        this.backlogList[index].executionInfo.customize = execution.customize
        this.backlogList[index].executionInfo.otherInfo = ''
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
    getIsDisabled: function (index) {
      if (this.backlogList.length > 0 && this.backlogList[index].preExecuteTime) {
        var preExecuteTime = new Date(this.backlogList[index].preExecuteTime).getTime()
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
    validBacklogInfo: function (index) {
      // 如果已选择延迟执行或不执行但未选择原因时，进行提醒
      if (this.backlogList[index].delayOrInexecut && !this.backlogList[index].executionInfo.name) {
        this.common.tip_msg('请先选择' + (this.backlogList[index].delayOrInexecut === '1' ? '延迟执行' : '不执行') + '原因！')
        return false
      }
      // 如果已选择延迟执行或不执行原因，且选择了其他项但未输入其他项值时，进行提醒
      if (this.backlogList[index].executionInfo.name && this.backlogList[index].executionInfo.customize === '1' && !this.backlogList[index].executionInfo.otherInfo) {
        this.common.tip_msg('请先填写其他原因！')
        return false
      }
      return true
    },
    /**
     * 提交待办
     * @param {int} index 当前操作对象index
     */
    submitBacklog: function (index) {
      if ($(this).hasClass('disabled')) {
        return false
      }
      // 校验通过时 再提交待办
      if (this.validBacklogInfo(index)) {
        var param = {
          'executeTime': new Date(this.backlogList[index].executeTime).format('yyyy-MM-dd hh:mm:ss'), // 待办执行时间
          'id': this.backlogList[index].id, // 待办ID
          'mrn': this.patient.mrn, // 病人mrn
          'organCode': this.organCode, // 组织机构码
          'patientId': this.patient.patientId, // 病人ID
          'operatorId': this.common.getLocalStorage('PAT_loginName'), // 当前操作人工号
          'operatorName': this.common.getLocalStorage('PAT_staffName'), // 当前操作人姓名
          'delayOrInexecut': this.backlogList[index].delayOrInexecut, // 延迟执行或不执行
          'delayOrInexecutReason': this.backlogList[index].executionInfo.name, // 延迟执行或不执行原因
          'resultType': 'end' // 处理完毕，通知后台删除待办
        }
        // 如果选择了其他原因 原因取其他框输入值
        if (this.backlogList[index].executionInfo.customize === '1') {
          param.delayOrInexecutReason = this.backlogList[index].executionInfo.otherInfo
        }
        var that = this
        this.common.ajax({
          url: 'patientinfo-service/backlog/process',
          dataType: 'text',
          type: 'post',
          data: JSON.stringify(param),
          callback: function () {
            that.common.tip_msg('提交成功~')
            that.queryBacklogClass()
          }
        })
      }
    },
    // 筛选prn类型待办
    executePRN: function () {
      this.frequencyName = 'prn'
      this.currentClassCode = ''
      this.queryPatientBacklog()
    },
    /**
     * 全部延迟执行或不执行 弹窗
     * @param {string} code 延迟执行或不执行 code值
     * @param {string} title 弹窗标题
     */
    executionAllPop: function (code, title) {
      var that = this
      layer.open({
        type: 1,
        title: '全部' + title,
        area: ['500px', ''],
        shadeClose: true,
        content: $('#pop-content-execution'),
        success: function () {
          that.executionInfo.code = code
          if (code === '1') {
            that.executionList = that.delayExecution
          } else if (code === '2') {
            that.executionList = that.nonExecution
          }
        },
        end: function () {
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
      layer.load(2, { offset: ['50%', '50%'] })
      this.loadingSubmit = true
      var idList = []
      this.backlogList.map(function (backlog) {
        if (backlog.isCanOprate) {
          idList.push(backlog.id)
        }
      })
      var param = {
        'executeTime': new Date().format('yyyy-MM-dd hh:mm:ss'), // 待办执行时间
        'idList': idList, // 待办ID
        'mrn': this.patient.mrn, // 病人mrn
        'organCode': this.organCode, // 组织机构码
        'patientId': this.patient.patientId, // 病人ID
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
      var that = this
      this.common.ajax({
        url: 'patientinfo-service/backlog/process',
        dataType: 'text',
        type: 'post',
        data: JSON.stringify(param),
        callback: function () {
          that.loadingSubmit = false
          layer.closeAll()
          that.common.tip_msg('操作成功~')
          that.queryBacklogClass()
        }
      })
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
	left: 0px;
	right: 0;
	top: 0;
	bottom: 0;
	overflow: auto;
}
.am-page-rcont-fixed.bt-52 {
	bottom: 52px;
}
</style>
<style>
.vl-notify-iframe{
  /* left: unset;
  right: 0px;
  transform: translateY(-50%) */
}
</style>
