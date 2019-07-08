<template>
	<div id="patientAllery">
		<!-- 过敏信息弹框 -->
		<div>
			<div class="amp-confirm-scroll bg-white">
				<div class="panel-hd-lline-primary">
					<h4>已有过敏信息</h4>
				</div>
				<div style="position:relative;">
					<table class="am-tb text-center am-tb-layout am-tb-pd5">
						<thead>
							<tr>
								<th class="text-center" width="120">分类名称</th>
								<th class="text-center" width="80">类型备注</th>
								<th class="text-center" width="70">登记结果</th>
								<th class="text-center" width="110">症状描述</th>
								<th class="text-center" width="90">其他描述</th>
								<th class="text-center" width="170">登记时间</th>
								<th class="text-center" width="100">登记人员</th>
								<th class="text-center" width="60">操作</th>
							</tr>
						</thead>
						<tbody v-if="!loadingAllery&&savedAllergyList.length>0">
							<tr v-for="(item,index) in savedAllergyList" :key="index" @click="changeCurrentAllergy(index)" :class="{'tr-active':currentAllergyIndex==index}">
								<td style="width:92px;">{{item.allergyName}}</td>
								<td>{{item.allergyRemark}}</td>
								<td>{{item.registerResult}}</td>
								<td>{{item.symptomDescription}}</td>
								<td>{{item.otherDescription}}</td>
								<td>{{item.registerTime}}</td>
								<td>{{item.registrantName}}</td>
								<td>
									<a @click="delAllergy(item)">删除</a>
								</td>
							</tr>
						</tbody>
					</table>

					<div class="loading-data" v-if="loadingAllery" style="position:relative;left: 0;margin-top: 0;margin-left: 0;">
						数据加载中....
					</div>
				</div>

				<div class="no-data no-data-smile" v-if="!loadingAllery&&savedAllergyList.length==0">
					<div class="img"></div>
					<div class="responsive-txt">
						<div class="txt"><span>暂无过敏信息哦~</span></div>
					</div>
				</div>
				<div class="border-split"></div>
				<div class="panel-hd-lline-primary am-mt-10">
					<h4 v-if="allergyMode=='edit'">编辑过敏信息</h4>
					<h4 v-if="allergyMode=='new'">新增过敏信息</h4>
				</div>
				<div class="bd">
					<div class="am-form-item clearfix">
						<div class="am-form-label am-col-3 choice-allergy-type" data-toggle="tooltip" data-title="请选择过敏类型">过敏类型</div>
						<div class="am-col-21">
							<div class="am-ctr-list-sel w170">
								<a class="caption" href="javascript:void(0)" data-toggle="dropdown" aria-expanded="true">{{allergyInfo.allergyName}}</a>
								<div class="am-dropdown" style="min-width: 270px;">
									<div class="am-search-picker">
										<input type="text" class="input-text" v-model="searchKey" />
										<i class="i-search"></i>
									</div>

									<table class="tb-dd">
										<colgroup>
											<col style="width: 56px;" />
											<col style="width: 130px;" />
										</colgroup>
										<tr>
											<th>分类ID</th>
											<th>分类名称</th>
											<th>是否药物</th>
										</tr>
									</table>
									<div class="dd-tb-scroll" style="text-align:center;">
										<div class="dd-no-data" v-if="allergyTypeList.length==0">没有数据</div>
										<table class="tb-dd">
											<colgroup>
												<col style="width: 56px;" />
												<col style="width: 130px;" />
											</colgroup>
											<tr v-for="(el,index) in allergyTypeList" :key="index" @click="changeAllergyType(el)" :class="{'active':currentAllergyCode==el.allergyCode}">
												<td>{{el.allergyCode}}</td>
												<td>{{el.allergyName}}</td>
												<td>{{el.isDrugAllergy | isDrugAllergy}}</td>
											</tr>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="am-form-item clearfix">
					<div class="am-form-label am-col-3">类型备注</div>
					<div class="am-col-21">
						<input type="text" class="input-text w530" maxlength="20" v-model="allergyInfo.allergyRemark">
					</div>
				</div>
				<div class="am-form-item clearfix">
					<div class="am-form-label am-col-3 choice-register-result" data-toggle="tooltip" data-title="请输入登记结果">登记结果</div>
					<div class="am-col-6">
						<div class="am-ctr-sel w170">
							<a class="caption" href="javascript:void(0)" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true">{{allergyInfo.registerResult}}</a>
							<div class="am-dropdown">
								<ul>
									<li @click="choiceRegisterResult(item.dictValue,item.dictItem)" v-for="(item,index) in resultList" :key="index">{{item.dictValue}}</li>
								</ul>
							</div>
						</div>
					</div>
					<div class="am-form-label am-col-3 am-ml-20">登记时间</div>
					<div class="am-col-11">
						<input type="text" class="input-text input-date choice-register-time" onClick="WdatePicker({startDate:'%y-%M-01 00:00:00',skin:'twoer',maxDate:'%y-%M-%d %H:%m',isShowClear:false,errDealMode:1,readOnly:true,dateFmt:'yyyy-MM-dd HH:mm:ss'})" v-model="allergyInfo.registerTime" id="registerDate" readonly data-toggle="tooltip" data-title="请选择登记时间" style="width:200px;">
					</div>
				</div>
				<div class="am-form-item clearfix">
					<div class="am-form-label am-col-3 choice-symptom-describe" data-toggle="tooltip" data-title="请选择症状描述">症状描述</div>
					<div class="am-col-21">
						<div class="item-tb-chk-list">
							<label class="am-ctr-chk am-mr-20" style="vertical-align:top;" v-for="(el,index) in symptomList" :key="index">
								<input type="checkbox" class="judge-checked" :value="el.dictValue" @click="changeAllergyInfo($event,index)" />
								<i></i>
								<span class="txt">{{el.dictValue}}</span>
							</label>
						</div>
					</div>
				</div>
				<div class="am-form-item clearfix">
					<div class="am-form-label am-col-3">其他描述</div>
					<div class="am-col-21">
						<input type="text" class="input-text w400" maxlength="20" v-model="allergyInfo.otherDescription" />
					</div>
				</div>
			</div>
			<div class="am-btn-fixed-area">
				<a class="am-btn am-btn-info w160 am-btn-lg" v-if="allergyMode=='edit'" @click="saveModifyAllergy()">保存修改</a>
				<a class="am-btn am-btn-info w160 am-btn-lg confirm-add" v-if="allergyMode=='new'" @click="addNewAllergy()">确认新增</a>
				<a class="am-btn am-btn-cancel w160 am-btn-lg am-ml-20" v-if="allergyMode=='edit'" @click="cancelEditAllergy()">取消</a>
			</div>
		</div>
		<!-- 过敏信息弹框 -->

		<!-- 确认删除过敏信息弹框 -->
		<div id="del-allergy-info" style="display:none;">
			<h4>
				<i></i>确认删除该条过敏信息？
			</h4>
			<button class="cancel" @click="cancelDelAllergy">取消</button>
			<button class="confirm" @click="confirmDelAllergy">确认</button>
		</div>
		<!-- 确认删除过敏信息弹框 -->
	</div>
</template>

<script>
export default {
  name: '',
  data () {
    return {
      wardCode: this.common.getUrlParam('wardCode'), // 科室code
      organCode: this.common.getOrganCode(), // 组织机构码
      patIndexNo: this.common.getUrlParam('patIndexNo'), // 病人编号

      patient: {}, // 当前患者信息

      loadingAllery: true, // 过敏数据加载标志
      savedAllergyList: [],
      currentAllergyIndex: 0,
      allergyMode: 'new', // 过敏模式 新增过敏信息|编辑过敏信息
      allergyInfo: {
        allergyCode: '', // 过敏类型code
        allergyName: '选择过敏类型', // 过敏类型名称
        allergyCodeType: '', // 过敏类型选项类型 0-不可关联登记结果 默认可关联登记结果
        isDrugAllergy: '', // 是否药物过敏
        allergyRemark: '',
        registerResult: '选择登记结果',
        registerTime: new Date().format('yyyy-MM-dd hh:mm:ss'),
        symptomDescription: [],
        otherDescription: '',
        registerResultCode: ''
      },
      symptomList: [], // 症状描述 列表
      resultList: [], // 登记结果 列表
      allergyTypeList: [],
      delAllergyIndex: undefined,
      searchKey: undefined,
      delIndexNo: undefined,
      currentAllergyCode: ''
    }
  },
  watch: {
    searchKey (newVal, oldVal) {
      this.common.ajax({
        url: 'baseinfo2.0/allergy/dict',
        dataType: 'json',
        type: 'get',
        data: {
          organCode: this.common.getOrganCode(),
          strLike: newVal
        },
        callback: function (data) {
          this.allergyTypeList = data
        }
      })
    }
  },
  filters: {
    // 展示是否药物过敏
    isDrugAllergy (value) {
      if (value === '1') {
        return '是'
      } else {
        return '否'
      }
    },
    // 判断返回值是否为空
    judgeVoid (value) {
      return value || '未提供'
    }
  },
  mounted () {
    this.wardCode = this.common.getUrlParam('wardCode')
    this.patIndexNo = this.common.getUrlParam('patIndexNo')
    this.common.setLocalStorage('PAT_transPage', this.common.getUrlParam('transPage'))
    this.common.setLocalStorage('PAT_transFun', this.common.getUrlParam('transLogoutFun'))
    this.queryPatientInfo()
    this.configAllergy()

    var islogin = this.common.isLogin()
    if (!islogin) {
      return false
    }
    this.patIndexNo = this.common.getUrlParam('patIndexNo')
  },
  methods: {
    queryPatientInfo: function () {
      var that = this
      var param = {
        organCode: this.organCode, // 组织机构码
        sourceType: this.common.getPatientSourceType(), // 病人状态 in-在院 out-出院
        patIndexNo: this.patIndexNo // 病人唯一码
      }
      this.common.ajax({
        url: 'baseinfo2.0/allType/patients',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (data) {
          var list = data
          if (list.length > 0) {
            that.patient = list[0]
          } else {
            that.common.tip_msg('找不到该病人', 1000, function () {
              window.location.href = this.common.baseUrl + '#/inpatient/ward/wardIndex?wardCode=' + that.wardCode
            })
          }
        }
      })
    },
    // 移除tooltips插件效果
    destroyTooltip: function () {
      $('[data-tooltip="true"]').tooltip('destroy')
      $('.tooltip').remove()
    },
    // 配置过敏信息
    configAllergy: function () {
      var that = this
      // 获取过敏字典
      this.common.ajax({
        url: 'baseinfo2.0/allergy/dict',
        dataType: 'json',
        type: 'get',
        data: {
          organCode: this.common.getOrganCode()
        },
        callback: function (data) {
          that.allergyTypeList = data
        }
      })
      // 获取病人过敏信息列表
      this.getSavedAllergy()
      // 获取症状描述字典
      this.common.ajax({
        url: 'baseinfo2.0/dict/ALLERGY_SYMPTOM',
        dataType: 'json',
        type: 'get',
        callback: function (data) {
          that.symptomList = data
        }
      })
      // 获取登记结果字典
      this.common.ajax({
        url: 'baseinfo2.0/dict/ALLERGY_RESULT',
        dataType: 'json',
        type: 'get',
        callback: function (data) {
          that.resultList = data
        }
      })
    },
    // 获取病人过敏信息 列表
    getSavedAllergy: function () {
      var that = this
      this.common.ajax({
        url: 'baseinfo2.0/allergy/allergy',
        dataType: 'json',
        type: 'get',
        data: {
          organCode: this.organCode,
          patIndexNo: this.patIndexNo,
          sourceType: this.common.getPatientSourceType() // 过敏病人类型
        },
        callback: function (data) {
          // console.log('获取病人过敏信息列表成功');
          that.loadingAllery = false
          that.savedAllergyList = data
        }
      })
    },
    // 切换当前选中过敏信息
    changeCurrentAllergy: function (index) {
      this.currentAllergyIndex = index
    },
    // 选择过敏类型
    changeAllergyType: function (item) {
      this.allergyInfo.allergyName = item.allergyName
      this.allergyInfo.allergyCode = item.allergyCode
      this.allergyInfo.allergyCodeType = item.resultFlag
      this.allergyInfo.isDrugAllergy = item.isDrugAllergy
      $('.choice-allergy-type').tooltip('hide')
      // 选项类型不可与登记结果关联时，置空登记结果值，并去除其必填校验
      if (this.allergyInfo.allergyCodeType === '0') {
        this.allergyInfo.registerResult = '选择登记结果'
        this.allergyInfo.registerResultCode = ''
        $('.choice-register-result').tooltip('hide')
        $('.choice-register-result').parent().find('.am-ctr-sel').addClass('sel-disabled')
      } else {
        $('.choice-register-result').tooltip('show')
        $('.choice-register-result').parent().find('.am-ctr-sel').removeClass('sel-disabled')
      }
    },
    // 选择登记结果
    choiceRegisterResult: function (value, code) {
      this.allergyInfo.registerResult = value
      this.allergyInfo.registerResultCode = code
      $('.choice-register-result').tooltip('hide')
    },
    // 选择症状描述
    changeAllergyInfo: function (e, index) {
      if (e.target.checked) {
        this.allergyInfo.symptomDescription.push(e.target.value)
      } else {
        this.allergyInfo.symptomDescription.forEach(function (
          item,
          index,
          arr
        ) {
          if (item === e.target.value) {
            arr.splice(index, 1)
          }
        })
      }

      // if (this.allergyInfo.symptomDescription.length === 0 && !this.allergyInfo.otherDescription) {
      //   $(".choice-symptom-describe").tooltip("show")
      // } else {
      //   $(".choice-symptom-describe").tooltip("hide")
      // }
    },
    // 校验过敏输入项
    checkAlleryInfo: function () {
      var flag = true
      // 校验过敏类型
      if (!this.allergyInfo.allergyCode) {
        $('.choice-allergy-type').tooltip('show')
        flag = false
      }
      // 校验过敏登记时间
      if (!this.allergyInfo.registerTime) {
        $('.choice-register-time').tooltip('show')
        flag = false
      }
      // debugger
      // 校验登记结果 (当前选择过敏类型可关联登记结果项时再校验必填)
      if (this.allergyInfo.allergyCodeType !== '0' && !this.allergyInfo.registerResultCode) {
        $('.choice-register-result').tooltip('show')
        flag = false
      }
      // // 校验症状描述
      // if (!this.allergyInfo.symptomDescription.length && !this.allergyInfo.otherDescription) {
      //   $(".choice-symptom-describe").tooltip("show");
      //   flag = false
      // }
      return flag
    },
    // 确认新增过敏信息
    addNewAllergy: function () {
      if (!this.checkAlleryInfo()) {
        return false
      }
      var sendData = {
        organCode: this.organCode, // 组织机构码
        patIndexNo: this.patIndexNo, // 病人编号
        patientId: this.patient.patientId, // 病人ID
        registerCode: this.common.getLocalStorage('PAT_loginName'), // 操作人姓名
        mrn: this.patient.mrn, // 病人mrn
        allergyCode: this.allergyInfo.allergyCode, // 过敏类型code
        allergyName: this.allergyInfo.allergyName, // 过敏类型名称
        isDrugAllergy: this.allergyInfo.isDrugAllergy, // 是否药物过敏
        allergyRemark: this.allergyInfo.allergyRemark, // 类型备注
        registerResultCode: this.allergyInfo.registerResultCode, // 登记结果code
        registerResult: this.allergyInfo.registerResult, // 登记结果名称
        registerTime: this.allergyInfo.registerTime, // 过敏登记时间
        symptomDescription: this.allergyInfo.symptomDescription.toString(), // 症状描述
        otherDescription: this.allergyInfo.otherDescription, // 其他描述
        sourceType: this.common.getPatientSourceType(), // 过敏病人类型
        createTime: new Date().format('yyyy-MM-dd hh:mm:ss') // 创建时间
      }
      console.log(sendData)
      this.common.ajax({
        url: 'baseinfo2.0/his/write/save/allergy',
        dataType: 'json',
        type: 'post',
        data: JSON.stringify(sendData),
        callback: function (data) {
          this.common.tip_msg('保存成功~', 1000)
          $('.judge-checked').attr('checked', false)
          this.getSavedAllergy()
          this.allergyInfo = {
            allergyCode: '',
            allergyName: '选择过敏类型',
            allergyCodeType: '',
            allergyRemark: '',
            registerResult: '选择登记结果',
            registerTime: new Date().format('yyyy-MM-dd hh:mm:ss'),
            symptomDescription: [],
            otherDescription: ''
          }
          $('.choice-register-result').parent().find('.am-ctr-sel').removeClass('sel-disabled')
          // window.parent.postMessage({from:'allergy',event:'closeFrame'},'*');
        },
        failure: function (r) {
          layer.open({
            type: 1,
            title: '提示',
            area: ['480px', ''],
            shadeClose: true,
            content: '<div class="am-msg-h3 msg-h3-fail">' +
							'<div class="inner">操作失败！</div>' +
							'</div>'
          })
        }
      })
    },
    // 删除保存的过敏信息
    delAllergy: function (item) {
      this.delIndexNo = item.indexNo
      this.delAllergyIndex = layer.open({
        type: '1',
        title: '删除过敏信息',
        content: $('#del-allergy-info')
      })
    },
    // 取消删除过敏信息条目
    cancelDelAllergy: function () {
      layer.close(this.delAllergyIndex)
    },
    // 确认删除过敏信息条目
    confirmDelAllergy: function () {
      console.log(this.delIndexNo)
      this.common.ajax({
        url: 'baseinfo2.0/his/write/del/allergy?' +
					'allergyId=' + this.delIndexNo + '&operatorId=' + this.common.getLocalStorage('PAT_loginName') + '&organCode=' + this.organCode,
        type: 'DELETE',
        callback: function (data) {
          this.common.tip_msg('删除成功~', 1000)
          this.getSavedAllergy()
        },
        failure: function (r) {
          layer.open({
            type: 1,
            title: '提示',
            area: ['480px', ''],
            shadeClose: true,
            content: '<div class="am-msg-h3 msg-h3-fail">' +
							'<div class="inner">操作失败！</div>' +
							'</div>'
          })
        }
      })
      layer.close(this.delAllergyIndex)
    }
  }
}
</script>

<style lang="" scoped>
</style>
