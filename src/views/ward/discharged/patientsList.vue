<template>
  <div>
    <head-ward ref="headerWard" :renderInit = '$renderInit'></head-ward>
    <div class="am-page-full bg-main">
      <div class="hbox">
          <div v-show="loading==1">
              <div class="am-condition am-nmtlr-20">
                  <div class="am-calendar-step">
                      <span class="txt">起</span><input type="text" class="Wdate" onClick="WdatePicker({skin:'twoer',maxDate:'%y-%M-%d',isShowClear:false,errDealMode:1,readOnly:true,onpicked:removeOthers})" @focus="changeTime('from')" v-model="from" readonly>
                      <a class="calendar-pre" @click="$prev(0)" id="pre_from"></a><a class="calendar-next" @click="$next(0)" id="next_from"></a>
                      <span class="txt">止</span><input type="text" class="Wdate" onClick="WdatePicker({skin:'twoer',maxDate:'%y-%M-%d',isShowClear:false,errDealMode:1,readOnly:true,onpicked:removeOthers})" @focus="changeTime('to')" v-model="to" readonly>
                      <a class="calendar-pre" @click="$prev(1)" id="pre_to"></a><a class="calendar-next last" @click="$next(1)" id="next_to"></a>
                  </div>
                  <div class="am-btn-rdo am-ml-10" name="date">
                      <a class="active" @click="$getData(1)" name="week">一周 </a>
                      <a @click="$getData(2)">一月</a>
                      <a @click="$getData(3)">三月</a>
                  </div>
                  <div class="am-ctr-sel am-ml-10" style="vertical-align: top; width: 100px;" v-if="isShowCase==1">
                      <a class="caption" href="javascript:void(0)" data-toggle="dropdown">
                          {{archivedName}}
                      </a>
                      <div class="am-dropdown">
                          <ul>
                              <li @click="changeArchivedStatus('','全部')">全部</li>
                              <li @click="changeArchivedStatus(0,'未归档')">未归档</li>
                              <li @click="changeArchivedStatus(1,'已归档')">已归档</li>
                          </ul>
                      </div>
                  </div>
                  <div class="am-ctr-sel am-ml-10" style="vertical-align: top; width: 100px;">
                      <a class="caption" href="javascript:void(0)" data-toggle="dropdown">
                          {{followUp.statusName}}
                      </a>
                      <div class="am-dropdown">
                          <ul>
                              <li @click="changeFollowUpStatus('','全部')">全部</li>
                              <li @click="changeFollowUpStatus(1,'已随访')">已随访</li>
                              <li @click="changeFollowUpStatus(0,'未随访')">未随访</li>
                          </ul>
                      </div>
                  </div>
                  <div class="cm-right">
                      住院号：<input type="text" class="input-text w80" maxlength="16" v-model="mrn"/>
                      <span class="am-ml-10">姓名：</span><input type="text" class="input-text w80" maxlength="10" v-model="name"/>
                      <a class="am-btn am-btn-primary am-ml-10" @click="$query_data(1)">查询</a>
                  </div>
              </div>
              <div class="am-mt-20 am-page-content bg-white">
                <div class="am-tb-fixed-hd">
                  <table class="am-tb am-tb-layout am-tb-sort">
                    <colgroup>
                      <col style="width: 80px;">
                      <col style="width: 80px;">
                      <col style="width: 100px;">
                      <col style="width: 60px;">
                      <col style="width: 100px;">
                      <col style="width: 180px;">
                      <col style="width: 180px;">
                      <col style="width: 200px;">
                      <!-- <col style="width: 100px;"> -->
                      <col style="width: 100px;">
                      <col style="width: 130px;">
                      <col style="width: 80px;" v-if="isShowCase==1">
                      <col style="width: 80px;">
                      <col style="width: 150px;">
                    </colgroup>
                    <thead>
                      <tr>
                        <th>床位
                          <div class="am-sort">
                            <i class="up" :class="{active:listSort.sort=='ASC'&&listSort.column=='bedNo'}" @click="$listSort('bedNo')"></i>
                            <i class="down" :class="{active:listSort.sort=='DESC'&&listSort.column=='bedNo'}" @click="$listSort('bedNo')"></i>
                          </div>
                        </th>
                        <th>姓名</th>
                        <th>住院号</th>
                        <th>性别</th>
                        <th>年龄</th>
                        <th>入院时间
                          <div class="am-sort">
                            <i class="up" :class="{active:listSort.sort=='ASC'&&listSort.column=='admissionTime'}" @click="$listSort('admissionTime')"></i>
                            <i class="down" :class="{active:listSort.sort=='DESC'&&listSort.column=='admissionTime'}" @click="$listSort('admissionTime')"></i>
                          </div>
                        </th>
                        <th>出院时间
                          <div class="am-sort">
                            <i class="up" :class="{active:listSort.sort=='ASC'&&listSort.column=='dischargeTime'}" @click="$listSort('dischargeTime')"></i>
                            <i class="down" :class="{active:listSort.sort=='DESC'&&listSort.column=='dischargeTime'}" @click="$listSort('dischargeTime')"></i>
                          </div>
                        </th>
                        <th>出院诊断</th>
                        <!-- <th>手术费用</th> -->
                        <th>总费用</th>
                        <th>联系电话</th>
                        <th v-if="isShowCase==1">归档状态</th>
                        <th>随访状态</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                  </table>
                </div>
                <div class="am-tb-fixed-bd">
                  <table class="am-tb am-tb-layout" v-if="data_list.length>0">
                    <colgroup>
                      <col style="width: 80px;">
                      <col style="width: 80px;">
                      <col style="width: 100px;">
                      <col style="width: 60px;">
                      <col style="width: 100px;">
                      <col style="width: 180px;">
                      <col style="width: 180px;">
                      <col style="width: 200px;">
                      <!-- <col style="width: 100px;"> -->
                      <col style="width: 100px;">
                      <col style="width: 130px;">
                      <col style="width: 80px;" v-if="isShowCase==1">
                      <col style="width: 80px;">
                      <col style="width: 150px;">
                    </colgroup>
                    <tbody>
                      <tr @click="$gotoP(el)" v-for="(el, index) in data_list" :key="index">
                          <td>{{el.bedNo}}</td>
                          <td>{{el.name}}</td>
                          <td>{{el.displayId}}</td>
                          <td>{{el.physiSexName}}</td>
                          <td>{{el.ageHis | calculateAge()}}</td>
                          <td>{{el.admissionTime}}</td>
                          <td>{{el.dischargeTime}}</td>
                          <td style="text-align:left;">{{el.diagnosis}}</td>
                          <!-- <td>元</td> -->
                          <td>{{el.totalCost || '--'}}<span v-if="el.totalCost">元</span></td>
                          <td>{{el.contactNumber || "--"}}</td>
                          <td v-if="isShowCase==1">
                              <span v-if="!el.archivedStatus || el.archivedStatus=='0'">未归档</span>
                              <span v-if="el.archivedStatus=='1'">已归档</span>
                              <span v-if="el.archivedStatus=='2'">已解锁</span>
                          </td>
                          <td>
                              <span v-if="!el.followUpStatus || el.followUpStatus=='0'">未随访</span>
                              <span v-if="el.followUpStatus=='1'">已随访</span>
                          </td>
                          <td>
                            <!-- 未归档时只能操作病历归档 -->
                            <a class="am-mr-10" @click="openLayer(el,$event)" v-if="isShowCase==1&&el.archivedStatus!='1'">病历归档</a>
                            <!-- 已归档的需先进行病历解锁后才能再次进行归档 -->
                            <a class="am-mr-10" v-if="isShowCase==1&&el.archivedStatus=='1' && isCanUnlock" @click="toUnlock(el.patIndexNo,$event)">病历解锁</a>
                            <a @click="followUpPop(el, $event)">随访信息</a>
                          </td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="no-data no-data-smile no-data-fixed" v-if="data_list.length == 0 && afterSearch">
                    <div class="img"></div>
                    <div class="responsive-txt">
                      <div class="txt"><span>没有符合条件的患者哦~</span></div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- <div class="ui-page" ms-widget="pager,papOutList,papOutList"></div> -->
              <div class="pagination" id="papOutList" v-show="data_list.length>0"></div>
              <caseLayer ref="caseFile"></caseLayer>
              <!-- <div ms-include-src="queryPageUrl" data-include-replace="true" data-include-rendered="init"></div> -->
            </div>

          <div class="loading_up no-data-fixed loading-data" v-if="loading==0">
              <div class="bird">
                  <div class="body"></div>
                  <div class="light"></div>
              </div>
              <span class="txt">加载中..<em>.</em></span>
          </div>

          <!-- 随访信息 start -->
          <div id="pop-content-followup" style="display: none;">
            <div class="bd">
              <div style="position: absolute; top:00; bottom: 80px;right: 0px;padding: 20px 20px 0px;overflow:auto;">
                <div class="am-form-item clearfix">
                    <div class="am-form-label am-col-3">病人姓名</div>
                    <div class="am-col-3">
                        <input type="text" class="input-text input-disabeld" disabled v-model="followUp.patient.name">
                    </div>
                    <div class="am-form-label am-col-3">性别</div>
                    <div class="am-col-3">
                        <input type="text" class="input-text input-disabeld" disabled v-model="followUp.patient.physiSexName">
                    </div>
                    <div class="am-form-label am-col-3">年龄</div>
                    <div class="am-col-3">
                        <input type="text" class="input-text input-disabeld" disabled v-model="followUp.patient.ageHis">
                    </div>
                    <div class="am-form-label am-col-3">住院号</div>
                    <div class="am-col-3">
                        <input type="text" class="input-text input-disabeld" disabled v-model="followUp.patient.displayId">
                    </div>
                </div>
                <div class="am-form-item clearfix">
                    <div class="am-form-label am-col-3">出院诊断</div>
                    <div class="am-col-21">
                        <input type="text" class="input-text" maxlength="200" v-model="followUp.dischargeDiagnosis">
                    </div>
                </div>
                <div class="am-form-item clearfix">
                    <div class="am-form-label am-col-3">出院日期</div>
                    <div class="am-col-6">
                        <input type="text" class="input-text input-date w200" onClick="WdatePicker({skin:'twoer',dateFmt:'yyyy-MM-dd HH:mm:ss', minDate: getMinDate(), maxDate:'%y-%M-%d %H-%m-%s',isShowClear:false,errDealMode:1,readOnly:true})" v-model="followUp.dischargeTime" readonly>
                    </div>
                    <div class="am-form-label am-col-3">联系电话</div>
                    <div class="am-col-6">
                        <input type="text" class="input-text" maxlength="20" v-model="followUp.contactNumber">
                    </div>
                </div>
                <div class="am-form-item clearfix">
                    <div class="am-form-label am-col-5">病人出院后恢复情况</div>
                    <div class="am-col-19">
                        <textarea class="input-textarea" v-model="followUp.recoverySituation" maxlength="500"></textarea>
                    </div>
                </div>
                <div class="am-form-item clearfix">
                    <div class="am-form-label am-col-5">健康指导（包括饮食、用药、康复指导）</div>
                    <div class="am-col-19">
                        <textarea class="input-textarea" v-model="followUp.healthGuidance" maxlength="500"></textarea>
                    </div>
                </div>
                <div class="am-form-item clearfix">
                    <div class="am-form-label am-col-5">住院期间对所接触的医生、护士的服务是否满意</div>
                    <div class="am-col-19">
                        <textarea class="input-textarea" v-model="followUp.satisfaction" maxlength="500"></textarea>
                    </div>
                </div>
                <div class="am-form-item clearfix">
                    <div class="am-form-label am-col-5">对医院服务的评价与合理化建议</div>
                    <div class="am-col-19">
                        <textarea class="input-textarea" v-model="followUp.evaluationAndAdv" maxlength="500"></textarea>
                    </div>
                </div>
                <div class="am-form-item clearfix">
                    <div class="am-form-label am-col-3">随访标志</div>
                    <div class="am-col-21">
                      <div class="item-tb-chk-list">
                          <label class="am-ctr-rdo am-mr-20" style="vertical-align:top;" v-for="(flag, index) in followUp.followUpFlagList" :key="index" @click="checkFollowUpFlag(flag)">
                              <input type="radio" name="followUpFlag" class="judge-checked" :value="flag.constantValue" :checked="flag.constantValue===followUp.followUpFlag"/>
                              <i></i>
                              <span class="txt">{{flag.constantName}}</span>
                          </label>
                      </div>
                    </div>
                </div>
                <div class="am-form-item clearfix">
                    <div class="am-form-label am-col-3">回访人签字</div>
                    <div class="am-col-3">
                        <input type="text" class="input-text" maxlength="20" v-model="followUp.visitorSign">
                    </div>
                    <div class="am-form-label am-col-3">回访时间</div>
                    <div class="am-col-6">
                        <input type="text" class="input-text input-date w200" onClick="WdatePicker({skin:'twoer',dateFmt:'yyyy-MM-dd HH:mm:ss', minDate: getMinDateDis(),  maxDate:'%y-%M-%d %H-%m-%s',isShowClear:false,errDealMode:1,readOnly:true})" v-model="followUp.visitTime" readonly>
                    </div>
                    <div class="am-form-label am-col-3">责任护士</div>
                    <div class="am-col-3">
                        <input type="text" class="input-text" maxlength="20" v-model="followUp.nurseName">
                    </div>
                </div>
              </div>
              <div class="am-btn-fixed-area" style="padding-bottom:0;">
                <div class="am-form-item clearfix">
                    <div class="am-form-label am-col-3">创建时间</div>
                    <div class="am-col-6">
                        <input type="text" class="input-text input-date w200" :class="{'input-disabeld':followUp.patient.followUpStatus=='1'}" onClick="WdatePicker({skin:'twoer',dateFmt:'yyyy-MM-dd HH:mm:ss', minDate: getMinDateDis(),  maxDate:'%y-%M-%d %H-%m-%s',isShowClear:false,errDealMode:1,readOnly:true})" v-model="followUp.recordTime" readonly :disabled="followUp.patient.followUpStatus=='1'">
                    </div>
                    <div class="am-form-label am-col-3">创建人</div>
                    <div class="am-col-3">
                        <input type="text" class="input-text" maxlength="20" v-model="followUp.operatorName">
                    </div>
                    <div class="am-col-9" style="text-align:right;">
                      <a class="am-btn am-btn-info w160 am-btn-lg confirm-add am-mr-20" @click="saveFollowUp()">保存</a>
                    </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 随访信息 end -->
      </div>
    </div>
  </div>
</template>

<script>
import common from '../../../common/js/common'
import caseLayer from './caseFile/caseLayer'
import '../../../common/js/vendor/pager/jquery.pagination.js'
import '../../../common/js/vendor/pager/pagination.css'
import headWard from '../../../common/component/headerWards'
window.removeOthers = function () {
  $('div[name="date"]').find('a').removeClass('active')
}
export default {
  components: {headWard, caseLayer},
  data () {
    return {
      $id: 'patients_out_list',
      from: this.common.getAnotherDay('date', -6, true, new Date()),
      to: new Date().format('yyyy-MM-dd'),
      data_list: [],
      mrn: '',
      name: '',
      queryPageUrl: '/caseFile/html/caseLayer.html',
      afterSearch: false,
      wardCode: this.common.getUrlParam('wardCode'), // 7.28新增-lutt
      loading: 0,
      isShowCase: 0,
      archivedStatus: '', // 归档状态 0:未归档 1：已归档
      archivedName: '全部',
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
      organCode: '', // 组织机构码
      listSort: {column: 'dischargeTime', sort: 'DESC'}, // 排序信息
      isCanUnlock: false, // 是否能病历解锁
      followUp: {
        status: '', // 随访状态值
        statusName: '全部', // 随访状态名
        patient: {}, // 当前操作病人
        dischargeDiagnosis: '', // 出院诊断
        dischargeTime: '', // 出院日期
        contactNumber: '', // 联系电话
        recoverySituation: '', // 病人出院后恢复情况
        healthGuidance: '', // 健康指导
        satisfaction: '', // 满意度
        evaluationAndAdv: '', // 评价与建议
        followUpFlagList: [], // 随访标志列表
        followUpFlag: '', // 随访标志
        visitorSign: '', // 回访人签字
        visitTime: '', // 回访时间
        nurseName: '', // 责任护士
        recordTime: '', // 创建时间
        operatorCode: '', // 创建人-工号
        operatorName: '' // 创建人-姓名
      }
    }
  },
  mounted () {
    this.$renderInit()
  },
  methods: {
    changeTime: function (type) {
      this[type] = $(event.currentTarget).val()
    },
    pagination (options) {
      $(options.ele).pagination(options.totalItems, {
        num_edge_entries: 1, // 边缘页数
        num_display_entries: 4, // 主体页数
        items_per_page: options.perPages,
        callback: options.callback,
        current_page: options.currentPage - 1,
        prev_text: '上一页',
        next_text: '下一页'
      })
    },
    removeOthers () {
      $('div[name="date"]').find('a').removeClass('active')
    },
    getMinDate () {
      return this.followUp.patient.admissionTime
    },
    getMinDateDis () {
      return this.followUp.patient.dischargeTime
    },
    changeArchivedStatus: function (type, name) {
      this.archivedStatus = type
      this.archivedName = name
      this.$query_data(0)
    },
    $getData (params) {
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
    $gotoP (patient) {
      this.$router.push({
        path: '/discharged/patientview',
        query: {
          wardCode: this.wardCode,
          patIndexNo: patient.patIndexNo
        }
      })
      var tab = {
        'type': 'patient_out',
        'tabId': patient.patIndexNo,
        'tabName': patient.name,
        'bedNo': patient.bedNo
      }
      this.$refs.headerWard.tabsAdd(tab, true)
    },
    $query_config: function () {
      this.common.ajax({
        url: 'baseinfo2.0/rule/getSingle?organCode=' + this.common.getOrganCode() + '&ruleName=MedicalRecordFiling',
        type: 'get',
        dataType: 'json',
        callback: (r) => {
          this.isShowCase = r.rule
          if (Number(this.isShowCase) === 1) {
            this.queryArchiveLimitRoles()
          }
        },
        failure: () => {
          this.isShowCase = 0
        }
      })
    },
    $query_data (isShowPageOne) {
      if (this.papOutList.currentPage === 0) {
        return
      }
      if (isShowPageOne === 1) {
        this.papOutList.currentPage = 1
      }
      var that = this
      var param = {
        status: 'out',
        sourceType: 'IH',
        dischargeBeginTime: this.from + ' 00:00:00',
        dischargeEndTime: this.to + ' 23:59:59',
        pageNumber: this.papOutList.currentPage - 1,
        pageSize: this.papOutList.perPages,
        nameLike: this.name,
        displayIdLike: this.mrn,
        wardCode: this.common.getUrlParam('wardCode'),
        organCode: this.common.getOrganCode(),
        sortField: this.listSort.column,
        direction: this.listSort.sort,
        archivedStatus: this.archivedStatus,
        followUpStatus: this.followUp.status
      }
      this.common.ajax({
        url: 'patientinfo-service/followup/patient/page',
        type: 'get',
        data: param,
        callback: (r) => {
          if (param.pageNumber >= r.totalPages && param.pageNumber > 0) {
            this.papOutList.currentPage = r.totalPages
            this.papOutList.totalItems = r.totalElements
            this.$query_data()
            return
          }
          // 病人编号列表
          var patIndexNoList = []
          // 病人对应index值
          var patIndex = {}
          for (var i = 0; i < r.content.length; i++) {
            // 收集病人列表编号
            patIndexNoList.push(r.content[i].patIndexNo)
            // 收集当前循环病人index值信息
            patIndex[r.content[i].patIndexNo] = i
            r.content[i].diagnosis = ''
          }
          this.data_list = r.content
          // 请求病人诊断数据
          if (patIndexNoList.length > 0) {
            this.queryPatientsDiagnosis(patIndexNoList, patIndex)
          }
          this.afterSearch = true
          this.papOutList.totalItems = r.totalElements
          this.pagination(this.papOutList)
          this.loading = 1
          this.$nextTick(() => {
            this.calculateContentHeight()
            $(window).resize(function () {
              that.calculateContentHeight()
            })
            // 表格展示区域添加滚动监听，用于控制表头跟随内容体一起滚动
            $('.am-tb-fixed-bd').scroll(function () {
              $('.am-tb-fixed-hd').scrollLeft($(this).scrollLeft())
            })
          })
        }
      })
    },
    /**
     * 查询患者出院诊断信息
     * @param {array} patIndexNoList 查询病人编号列表
     * @param {object} patIndex 查询病人对应病人列表中index值集合
     */
    queryPatientsDiagnosis (patIndexNoList, patIndex) {
      var param = {
        organCode: this.common.getOrganCode(),
        // 1-主诊断 2-次诊断 3-初步诊断 4-当前诊断 5-门诊诊断 6-入院诊断 7-更正诊断 8-术前诊断 9-术中诊断 10-术后诊断 11-病理诊断 12-死亡诊断 13-出院诊断
        diagTypeCodeList: 13,
        patIndexNoList: patIndexNoList.toString()
      }
      this.common.ajax({
        url: 'baseinfo2.0/inhospdiagnosis/inhospdiagnosis',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: (data) => {
          var diagnosis = {}
          if (data && data.length > 0) {
            // 收集诊断集合数据 病人诊断数据有多条时，用逗号拼接
            data.map(function (patient) {
              if (!diagnosis[patient.patIndexNo]) {
                diagnosis[patient.patIndexNo] = ''
              }
              diagnosis[patient.patIndexNo] += (diagnosis[patient.patIndexNo] ? '，' : '') + patient.diagName
            })
          }
          // 诊断赋值给对应病人数据
          for (var dia in diagnosis) {
            this.data_list[patIndex[dia]].diagnosis = diagnosis[dia]
          }
        }
      })
    },
    $initPage: function () {
      // if(avalon.vmodels.papOutList){
      //     avalon.vmodels.papOutList.totalItems = 0
      //     avalon.vmodels.papOutList.currentPage =1
      // }
      this.papOutList.totalItems = 0
      this.papOutList.currentPage = 1
    },
    $renderInit: function () {
      // if(Number(this.common.getUrlParam('clear')) === 1){
      //   avalon.vmodels.root.clearTab()
      // }
      this.loading = 0
      this.organCode = this.common.getOrganCode()
      this.from = this.common.getAnotherDay('date', -6, true, new Date())
      this.to = new Date().format('yyyy-MM-dd')
      $('#next_to').addClass('disabled')
      this.name = ''
      this.mrn = ''
      $('a[name="week"]').addClass('active')
      $('a[name="week"]').siblings().removeClass('active')
      this.wardCode = this.common.getUrlParam('wardCode') // 7.28新增-lutt
      // avalon.vmodels.root.wardCode = this.wardCode//7.28新增-lutt
      this.afterSearch = false
      // 查询当前帐号能否进行病历解锁
      this.isCanUnlock = false
      this.$query_config()
      this.$initPage()
      this.$query_data(1)
      this.queryConstants()
      // avalon.vmodels.root.selectDepart()//7.28新增-lutt
      // if (avalon.vmodels.outpatient_view) {
      //   avalon.vmodels.outpatient_view.menus = []
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
          this.from = this.common.getAnotherDay('date', 1, true, new Date(this.from))
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
    openLayer: function (patient, ev) {
      ev.stopPropagation()
      this.$ref.caseFile.openLayer(patient.patIndexNo)
      layer.open({
        type: 1,
        title: '病历归档',
        scrollbar: false,
        area: ['700px', ''],
        // shadeClose: true, //点击遮罩关闭
        content: $('#pop-content-01'),
        end: () => {
          this.$ref.caseFile.initType(false)
          this.$query_data()
        }
      })
    },
    // 根据屏幕高度计算内容展示区域高度
    calculateContentHeight: function () {
      var fullHeight = $('.am-page-full').height()
      var conditionHeight = $('.am-condition').height()
      var paginationHeight = $('.pagination').height()
      var contentHeight = fullHeight - conditionHeight - 20 - paginationHeight - 20 - 20 - 25
      $('.am-page-content').height(contentHeight)
      var amTbFixedHd = $('.am-tb-fixed-hd').height()
      $('.am-tb-fixed-bd').height(contentHeight - amTbFixedHd)
      if (this.data_list.length === 0) {
        $('.am-page-content').height(contentHeight)
      } else {
        $('.am-page-content').removeAttr('style')
      }
    },
    // 病例解锁
    toUnlock: function (id, ev) {
      var that = this
      this.common.confirm_g(function () {
        this.common.ajax({
          url: 'archive/archive/archiveUnlock?patIndexNo=' + id + '&organCode=' + that.common.getOrganCode() + '&sourceType=IH',
          dataType: 'text',
          type: 'get',
          callback: (r) => {
            layer.msg('操作成功！')
            that.$query_data()
          }
        })
      }, function () {
        layer.closeAll()
      }, '是否进行病历解锁？')
      ev.stopPropagation()
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
        } else { // 否则排序顺序改为降序
          sort = 'DESC'
        }
      }
      // 记录当前排序信息
      this.listSort = {column: type, sort: sort}
      // 查询患者
      this.$query_data(1)
    },
    // 查询病历解锁权限开放角色列表
    queryArchiveLimitRoles: function () {
      this.common.ajax({
        url: 'archive/archive/readLimit',
        dataType: 'json',
        type: 'get',
        callback: (r) => {
          // 从cookie中获取当前帐号分配角色code列表
          var attachedRoles = $.cookie('_USER_BIND_ROLES_')
          if (attachedRoles) {
            attachedRoles = JSON.parse(attachedRoles)
          }
          // 判断当前帐号是否有权限操作病历解锁
          if (r && r.length > 0) {
            for (var i = 0; i < r.length; i++) {
              if (attachedRoles.indexOf(r[i].code) > -1) {
                this.isCanUnlock = true
                break
              }
            }
          }
        }
      })
    },
    changeFollowUpStatus: function (status, statusName) {
      this.followUp.status = status
      this.followUp.statusName = statusName
      this.$query_data(0)
    },
    // 查询常量值
    queryConstants: function () {
      var param = {
        organCode: this.organCode,
        constantTypeList: 'FOLLOWUPFLAG'
      }
      this.common.ajax({
        url: 'patientinfo-service/dict/constant/batch',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: (data) => {
          if (data && data.FOLLOWUPFLAG) {
            this.followUp.followUpFlagList = data.FOLLOWUPFLAG
          }
        }
      })
    },
    checkFollowUpFlag: function (flag) {
      this.followUp.followUpFlag = flag.constantValue
    },
    /**
    * 查询患者随访信息
    * @param {string} patIndexNo 患者唯一号
    */
    queryFollowUp: function (patIndexNo) {
      var param = {
        organCode: this.organCode,
        wardCode: this.wardCode,
        patIndexNo: patIndexNo
      }
      this.common.ajax({
        url: 'patientinfo-service/followup/one',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: (r) => {
          if (r && r.length > 0) {
            var followUpInfo = r[0]
            this.followUp.dischargeDiagnosis = followUpInfo.dischargeDiagnosis // 出院诊断
            this.followUp.dischargeTime = followUpInfo.dischargeTime || new Date().format('yyyy-MM-dd hh:mm:ss') // 出院日期
            this.followUp.contactNumber = followUpInfo.contactNumber // 联系电话
            this.followUp.recoverySituation = followUpInfo.recoverySituation // 病人出院后恢复情况
            this.followUp.healthGuidance = followUpInfo.healthGuidance // 健康指导
            this.followUp.satisfaction = followUpInfo.satisfaction // 满意度
            this.followUp.evaluationAndAdv = followUpInfo.evaluationAndAdv // 评价与建议
            this.followUp.followUpFlag = followUpInfo.followUpFlag // 随访标志
            this.followUp.visitorSign = followUpInfo.visitorSign // 回访人签字
            this.followUp.visitTime = followUpInfo.visitTime // 回访时间
            this.followUp.nurseName = followUpInfo.nurseName // 责任护士
            this.followUp.recordTime = followUpInfo.recordTime // 创建时间
            this.followUp.operatorCode = followUpInfo.operatorCode // 创建人-工号
            this.followUp.operatorName = followUpInfo.operatorName // 创建人-姓名
          }
        }
      })
    },
    // 初始化随访数据
    initFollowData: function () {
      this.followUp.dischargeDiagnosis = '' // 出院诊断
      this.followUp.dischargeTime = '' // 出院日期
      this.followUp.contactNumber = '' // 联系电话
      this.followUp.recoverySituation = '' // 病人出院后恢复情况
      this.followUp.healthGuidance = '' // 健康指导
      this.followUp.satisfaction = '' // 满意度
      this.followUp.evaluationAndAdv = '' // 评价与建议
      this.followUp.followUpFlag = '' // 随访标志
      this.followUp.visitorSign = '' // 回访人签字
      this.followUp.visitTime = '' // 回访时间
      this.followUp.nurseName = '' // 责任护士
      this.followUp.recordTime = '' // 创建时间
      this.followUp.operatorCode = '' // 创建人-工号
      this.followUp.operatorName = '' // 创建人-姓名
    },
    /**
      * 随访信息弹窗
      * @param {object} patient 当前操作患者对象信息
      * @param {object} event 当前操作元素
      */
    followUpPop: function (patient, event) {
      event.stopPropagation()
      this.followUp.patient = patient
      // 病人已被随访 查询随访详情
      if (patient.followUpStatus === '1') {
        this.queryFollowUp(patient.patIndexNo)
      } else {
        // 出院时间
        this.followUp.dischargeTime = patient.dischargeTime || new Date().format('yyyy-MM-dd hh:mm:ss')
        // 出院诊断
        this.followUp.dischargeDiagnosis = patient.diagnosis
        // 联系电话
        this.followUp.contactNumber = patient.contactNumber
        // 责任护士
        this.followUp.nurseName = patient.primaryNurseName
        // 回访时间
        this.followUp.visitTime = new Date().format('yyyy-MM-dd hh:mm:ss')
        // 创建时间
        this.followUp.recordTime = new Date().format('yyyy-MM-dd hh:mm:ss')
        // 创建人
        this.followUp.operatorCode = $.cookie('_loginName_')
        this.followUp.operatorName = $.cookie('_staffName_')
      }
      layer.open({
        type: 1,
        title: '随访信息',
        area: ['800px', '100%'],
        offset: 'rb',
        fixed: true,
        content: '#pop-content-followup',
        shadeClose: true, // 点击遮罩关闭
        success: function () {
          $('.ui-sys-bar').hide()
        },
        end: () => {
          this.initFollowData()
          $('.ui-sys-bar').show()
        }
      })
    },
    // 保存随访标志
    saveFollowUp: function () {
      var param = {
        'contactNumber': this.followUp.contactNumber,
        'dischargeDiagnosis': this.followUp.dischargeDiagnosis,
        'dischargeTime': this.followUp.dischargeTime,
        'evaluationAndAdv': this.followUp.evaluationAndAdv,
        'followUpFlag': this.followUp.followUpFlag,
        'healthGuidance': this.followUp.healthGuidance,
        'nurseName': this.followUp.nurseName,
        'operatorCode': this.followUp.operatorCode,
        'operatorName': this.followUp.operatorName,
        'organCode': this.organCode,
        'patIndexNo': this.followUp.patient.patIndexNo,
        'recordTime': this.followUp.recordTime,
        'recoverySituation': this.followUp.recoverySituation,
        'satisfaction': this.followUp.satisfaction,
        'visitTime': this.followUp.visitTime,
        'visitorSign': this.followUp.visitorSign,
        'wardCode': this.wardCode
      }
      this.common.ajax({
        url: 'patientinfo-service/followup/record',
        dataType: 'text',
        type: 'post',
        data: JSON.stringify(param),
        callback: (r) => {
          layer.closeAll()
          this.common.tip_msg('更新成功~')
          this.$query_data()
        }
      })
    }
  },
  filters: {
    showSex (str) {
      if (Number(str) === 1) {
        return '男'
      } else if (Number(str) === 0) {
        return '女'
      } else {
        return '未知'
      }
    },
    showAge (str, args, args2) {
      return common.showAge(str, args, args2)
    },
    calculateAge (str) {
      return common.calculateAge(str).age
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
