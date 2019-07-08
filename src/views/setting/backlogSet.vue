<template>
  <div>
    <!-- 筛选条件 start -->
    <div class="text-right condition-mt">
      <div class="am-search w260">
        <input class="input-text" type="text" v-model="keyWord" placeholder="请输入应用名称/应用code搜索">
        <i class="i-search"></i>
      </div>
      <a class="am-btn am-btn-plain-primary am-ml-10" @click="addFormPop('')">新增</a>
    </div>
    <!-- 筛选条件 end -->

    <div class="scrollbar-after-condition am-mt-20">
      <!-- 列表展示 start -->
      <div class="bg-white h100F">
        <!-- 表格头部 start -->
        <div id="am-tb-fixed-hd" class="am-tb-fixed-hd">
          <table class="am-tb am-tb-fixed" style="table-layout: fixed">
            <colgroup>
              <col style="width: 60px">
              <col style="width: 60px">
              <col style="width: 80px">
              <col style="width: 80px">
              <col style="width: 80px">
              <col style="width: 80px">
              <col style="width: 160px">
            </colgroup>
            <thead>
              <tr>
                <th>应用名称</th>
                <th>应用code</th>
                <th>备注</th>
                <th>应用类型</th>
                <th>接入类型</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
          </table>
        </div>
        <!-- 表格头部 end -->
        <!-- 表格正文 start -->
        <div
          id="am-tb-fixed-bd"
          class="am-tb-fixed-bd"
          style="top: 37px;display: none"
          v-show="!loading"
        >
          <table
            class="am-tb-fixed am-tb"
            style="table-layout: fixed"
            v-if="appListAccessed.length>0"
          >
            <colgroup>
              <col style="width: 60px">
              <col style="width: 60px">
              <col style="width: 80px">
              <col style="width: 80px">
              <col style="width: 80px">
              <col style="width: 80px">
              <col style="width: 160px">
            </colgroup>
            <tbody>
              <template v-for="(item, index) in appListAccessed">
                <tr :class="[item.appCode]" :key="index">
                  <td :rowspan="item.appResList.length">{{item.appName}}</td>
                  <td :rowspan="item.appResList.length">{{item.appCode}}</td>
                  <td>{{item.appResList[0].aliasName}}</td>
                  <td>{{item.appResList[0].appType}}</td>
                  <td>{{showUrlTypeName(item.appResList[0].urlType)}}</td>
                  <td>
                    <span class="am-txt-success" v-if="item.appResList[0].validFlag==1">已启用</span>
                    <span class="am-txt-danger" v-if="item.appResList[0].validFlag==0">已停用</span>
                  </td>
                  <td>
                    <a @click="previewFormPop(item.appResList[0].tmpId)">详情</a>
                    <i class="muted-line-txt">|</i>
                    <a @click="addFormPop(item.appResList[0].tmpId)">编辑</a>
                    <i class="muted-line-txt">|</i>
                    <a
                      @click="enableDisable(item.appResList[0].tmpId, 1)"
                      v-if="item.appResList[0].validFlag==0"
                    >启用</a>
                    <i class="muted-line-txt" v-if="item.appResList[0].validFlag==0">|</i>
                    <a
                      @click="enableDisable(item.appResList[0].tmpId, 0)"
                      v-if="item.appResList[0].validFlag==1"
                    >停用</a>
                    <i class="muted-line-txt" v-if="item.appResList[0].validFlag==1">|</i>
                    <a
                      class="menu-sort-tool-list-i i-menu-sort-down"
                      v-if="item.appResList.length>1"
                      title="向下排序"
                      @click="upDown(item.appResList[0].tmpId, index, 0, 'down')"
                    ></a>
                    <i class="muted-line-txt" v-if="item.appResList.length>1">|</i>
                    <a
                      class="am-link-danger"
                      @click="deleteFormPop(item.appResList[0].tmpId)"
                      v-if="item.appResList[0].validFlag==0"
                    >删除</a>
                  </td>
                </tr>
                <template v-for="(el, $index) in item.appResList">
                  <tr :class="[item.appCode]" v-if="$index>0" :key="$index">
                    <td>{{el.aliasName}}</td>
                    <td>{{el.appType}}</td>
                    <td>{{showUrlTypeName(el.urlType)}}</td>
                    <td>
                      <span class="am-txt-success" v-if="el.validFlag==1">已启用</span>
                      <span class="am-txt-danger" v-if="el.validFlag==0">已停用</span>
                    </td>
                    <td>
                      <a @click="previewFormPop(el.tmpId)">详情</a>
                      <i class="muted-line-txt">|</i>
                      <a @click="addFormPop(el.tmpId)">编辑</a>
                      <i class="muted-line-txt">|</i>
                      <a @click="enableDisable(el.tmpId, 1)" v-if="el.validFlag==0">启用</a>
                      <i class="muted-line-txt" v-if="el.validFlag==0">|</i>
                      <a @click="enableDisable(el.tmpId, 0)" v-if="el.validFlag==1">停用</a>
                      <i class="muted-line-txt" v-if="el.validFlag==1">|</i>
                      <a
                        class="menu-sort-tool-list-i i-menu-sort-up"
                        title="向上排序"
                        @click="upDown(el.tmpId, index, $index, 'up')"
                      ></a>
                      <i class="muted-line-txt">|</i>
                      <a
                        class="menu-sort-tool-list-i i-menu-sort-down"
                        title="向下排序"
                        v-if="item.appResList.length - 1 != $index"
                        @click="upDown(el.tmpId, index, $index, 'down')"
                      ></a>
                      <i class="muted-line-txt" v-if="item.appResList.length - 1 != $index">|</i>
                      <a
                        class="am-link-danger"
                        @click="deleteFormPop(el.tmpId)"
                        v-if="el.validFlag==0"
                      >删除</a>
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
          <div class="no-data no-data-smile no-data-fixed" v-if="appListAccessed.length==0">
            <div class="img"></div>
            <div class="responsive-txt">
              <div class="txt">暂无相关数据哦~</div>
            </div>
          </div>
        </div>
        <!-- 表格正文 end -->
      </div>
      <!-- 列表展示 end -->

      <!-- 分页 start -->
      <div class="pagination" id="papApp" v-if="appListAccessed.length>0"></div>
      <!-- 分页 end -->
    </div>

    <!-- 加载中 start -->
    <div class="loading-data" v-if="loading">数据加载中....</div>
    <!-- 加载中 end -->

    <!-- 新增弹窗 start -->
    <div id="pop-content-add" style="display: none">
      <div style="padding:20px 0 0 20px;max-height:450px;overflow:auto;">
        <div class="am-form-item">
          <div class="am-form-label am-col-5">接入应用</div>
          <div class="am-col-9" ref="reportType">
            <div class="am-panel-error" style="display: inline-block">
              <div class="am-ctr-sel w200">
                <select id="appListSelect2" style="width:100%;display:none">
                  <option value=" ">{{appAccessInfo.appName != '' ? appAccessInfo.appName : '请选择'}}</option>
                  <option
                    v-for="(item, index) in appList"
                    :key="index"
                    :title="item.appName+'('+item.appCode+')'"
                    :value="item.appCode"
                    :select="item.appCode==appAccessInfo.appCode"
                  >{{item.appName}}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="am-form-item">
          <div class="am-form-label am-col-5">备注</div>
          <div class="am-col-14">
            <div class="am-panel-error" style="display: inline-block">
              <input
                type="text"
                class="input-text w400"
                maxlength="20"
                id="aliasName"
                @blur="checkAliasName()"
                v-model="appAccessInfo.aliasName"
              >
            </div>
          </div>
        </div>
        <div class="am-form-item">
          <div class="am-form-label am-col-5">应用类型</div>
          <div class="am-col-14">
            <div class="am-btn-rdo">
              <a :class="{active:appAccessInfo.appType=='pc'}" @click="checkedAppType('pc')">PC</a>
              <a :class="{active:appAccessInfo.appType=='app'}" @click="checkedAppType('app')">APP</a>
              <a :class="{active:appAccessInfo.appType=='pad'}" @click="checkedAppType('pad')">PAD</a>
            </div>
          </div>
        </div>
        <div class="am-form-item">
          <div class="am-form-label am-col-5">接入类型</div>
          <div class="am-col-14">
            <div class="am-btn-rdo">
              <a
                :class="{disabled:appAccessInfo.tmpId, active:appAccessInfo.urlType=='template'}"
                @click="checkedUrlType('template')"
              >病人</a>
              <a
                :class="{disabled:appAccessInfo.tmpId, active:appAccessInfo.urlType==='backlog'}"
                @click="checkedUrlType('backlog')"
              >病区</a>
            </div>
          </div>
        </div>
        <div class="am-form-item templateCon" v-show="appAccessInfo.urlType=='template'">
          <div class="am-form-label am-col-5">接口地址</div>
          <div class="am-col-19">
            <div class="am-panel-error" style="display: inline-block">
              <input
                type="text"
                class="input-text w400"
                id="urlP"
                maxlength="300"
                v-model="appAccessInfo.url"
              >
            </div>
            <!-- 病人级别参数映射 start -->
            <div class="control-row-editabeld" id="paramsMapPatient" style="width:420px">
              <div class="control-row" v-for="(paramsmap, $index) in appAccessInfo.paramsMapPatient" :key="$index">
                <div class="control-explain">
                  <input
                    type="text"
                    class="input-text w160 paramName"
                    :id="'paramNameP' + $index"
                    maxlength="20"
                    v-model="paramsmap.paramName"
                    placeholder="参数名称"
                    @blur="checkParam()"
                  >
                </div>
                <div class="control-explain">-</div>
                <div class="control-explain">
                  <div class="am-ctr-sel w160 am-mr-10">
                    <a
                      class="caption"
                      href="javascript:void(0)"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="true"
                    >{{paramsmap.paramDictName != '' ? paramsmap.paramDictName : '请选择对应的参数'}}</a>
                    <div class="am-dropdown" style="border-top: 1px solid #D2D2D2">
                      <ul>
                        <li
                          v-for="(paramp, index1) in paramsPatient"
                          :key="index1"
                          @click="checkedParam('paramsMapPatient', $index, paramp)"
                        >
                          <a>{{paramp}}</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <a class="i-row-plus" @click="addParam('paramsMapPatient')"></a>
                <a
                  class="i-row-minus am-ml-5"
                  v-if="$index>0"
                  @click="removeParam($index, 'paramsMapPatient')"
                ></a>
              </div>
            </div>
            <!-- 病人级别参数映射 end -->
          </div>
        </div>
        <div class="am-form-item templateCon" v-show="appAccessInfo.urlType=='template'">
          <div class="am-form-label am-col-5">模板信息</div>
          <div class="am-col-18">
            <div class="am-panel-error" style="display: inline-block;">
              <textarea
                class="input-text w400"
                style="height:150px;resize:none;"
                v-model="appAccessInfo.template"
                id="templateP"
                @blur="checkTemplate()"
              ></textarea>
            </div>
          </div>
        </div>
        <div class="am-form-item backlogCon" v-show="appAccessInfo.urlType=='backlog'">
          <div class="am-form-label am-col-5">接口地址</div>
          <div class="am-col-19">
            <div class="am-panel-error" style="display: inline-block;">
              <input
                type="text"
                class="input-text w400"
                id="urlW"
                maxlength="300"
                v-model="appAccessInfo.url"
                @blur="checkUrl()"
              >
            </div>
            <!-- 病区级别参数映射 start -->
            <div class="control-row-editabeld" style="width:420px">
              <div class="control-row" v-for="(paramsmap, $index) in appAccessInfo.paramsMapWard" :key="$index">
                <div class="control-explain">
                  <input
                    type="text"
                    class="input-text w160"
                    maxlength="20"
                    v-model="paramsmap.paramName"
                    placeholder="参数名称"
                    @blur="checkParam()"
                  >
                </div>
                <div class="control-explain">-</div>
                <div class="control-explain">
                  <div class="am-ctr-sel w160 am-mr-10">
                    <a
                      class="caption"
                      href="javascript:void(0)"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="true"
                    >{{paramsmap.paramDictName != '' ? paramsmap.paramDictName : '请选择对应的参数'}}</a>
                    <div class="am-dropdown" style="border-top: 1px solid #D2D2D2">
                      <ul>
                        <li
                          v-for="(paramp, index1) in paramsWard"
                          :key="index1"
                          @click="checkedParam('paramsMapWard', index, paramp)"
                        >
                          <a>{{paramp}}</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <a class="i-row-plus" @click="addParam('paramsMapWard')"></a>
                <a
                  class="i-row-minus am-ml-5"
                  v-if="$index>0"
                  @click="removeParam($index, 'paramsMapWard')"
                ></a>
              </div>
            </div>
            <!-- 病区级别参数映射 end -->
          </div>
        </div>
        <div class="am-form-item backlogCon" v-show="appAccessInfo.urlType=='backlog'">
          <div class="am-form-label am-col-5">跳转地址</div>
          <div class="am-col-19">
            <div class="am-panel-error" style="display: inline-block">
              <input
                type="text"
                class="input-text w400"
                maxlength="300"
                id="templateW"
                v-model="appAccessInfo.template"
                @blur="checkTemplate()"
              >
            </div>
          </div>
        </div>
      </div>
      <div class="am-btn-area last">
        <a class="am-pop-btn am-btn-cancel" @click="closePop()">取消</a>
        <a class="am-pop-btn am-btn-confirm am-ml-20" @click="addFormSubmit()">保存</a>
      </div>
    </div>
    <!-- 新增弹窗 end -->

    <!-- 详情弹窗 start -->
    <div id="pop-content-preview" style="display: none">
      <div class="am-pd-20">
        <div class="am-form-item am-mb-10">
          <div class="am-form-label am-col-6">接入应用</div>
          <div class="am-col-18" ref="reportType">
            <div class="am-ctr-sel">{{appAccessInfo.appName}} -- {{appAccessInfo.appCode}}</div>
          </div>
        </div>
        <div class="am-form-item am-mb-10">
          <div class="am-form-label am-col-6">备注</div>
          <div class="am-col-18">
            <div class="am-ctr-sel">{{appAccessInfo.aliasName}}</div>
          </div>
        </div>
        <div class="am-form-item am-mb-10">
          <div class="am-form-label am-col-6">应用类型</div>
          <div class="am-col-18">
            <div class="am-ctr-sel">{{appAccessInfo.appType}}</div>
          </div>
        </div>
        <div class="am-form-item am-mb-10">
          <div class="am-form-label am-col-6">接入类型</div>
          <div class="am-col-18">
            <div class="am-ctr-sel">{{showUrlTypeName(appAccessInfo.urlType)}}</div>
          </div>
        </div>
        <div class="am-form-item am-mb-10" v-show="appAccessInfo.urlType=='template'">
          <div class="am-form-label am-col-6">接口地址</div>
          <div class="am-col-18">
            <div class="am-ctr-sel">
              <span>{{appAccessInfo.url}}</span>
              <div
                v-for="(item, index) in appAccessInfo.paramsMapPatient"
                :key="index"
              >{{item.paramName}} - {{item.paramDictName}}</div>
            </div>
          </div>
        </div>
        <div class="am-form-item am-mb-10" v-show="appAccessInfo.urlType=='template'">
          <div class="am-form-label am-col-6">模板信息</div>
          <div class="am-col-18">
            <textarea
              class="input-text w400"
              style="height:150px;resize:none;"
              readonly
              v-model="appAccessInfo.template"
            ></textarea>
          </div>
        </div>
        <div class="am-form-item am-mb-10" v-show="appAccessInfo.urlType=='backlog'">
          <div class="am-form-label am-col-6">接口地址</div>
          <div class="am-col-18">
            <div class="am-ctr-sel">
              <span>{{appAccessInfo.url}}</span>
              <div
                v-for="(item, index) in appAccessInfo.paramsMapWard"
                :key="index"
              >{{item.paramName}} - {{item.paramDictName}}</div>
            </div>
          </div>
        </div>
        <div class="am-form-item am-mb-10" v-show="appAccessInfo.urlType=='backlog'">
          <div class="am-form-label am-col-6">跳转地址</div>
          <div class="am-col-18">
            <div class="am-ctr-sel">{{appAccessInfo.template}}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- 详情弹窗 end -->

    <!-- 删除确认弹窗 start-->
    <div id="pop-content-del" class="pop-content text-center" style="display: none">
      <div class="bd">
        <div class="am-msg-lg-info">
          <div class="inner">
            <i class="i-question-lg"></i>
            <h3>确认删除该数据吗？</h3>
          </div>
        </div>
        <div class="am-btn-area">
          <a class="am-btn am-btn-plain-info am-btn-lg w120" @click="closePop()">取消</a>
          <a class="am-btn am-btn-info am-btn-lg w120 am-ml-20" @click="deleteFormSubmit()">确定</a>
        </div>
      </div>
    </div>
    <!--删除确认弹窗 end-->
  </div>
</template>

<script>
export default {
  name: 'backlogSet',
  data () {
    return {
      loading: true, // 加载中标志
      organCode: this.common.getLocalStorage('PAT_organCode') || this.common.queryParam('organCode'),
      appListAccessed: [], // 已接入应用列表
      pagerApp: { // 分页信息
        ele: '#papApp', // 分页元素
        totalItems: 0, // 总数据
        currentPage: 1, // 当前页
        items_per_page: 50, // 每页展示数据
        totalPages: 0, // 总页数
        callback: (pageIndex, jq) => {
          this.pagerApp.currentPage = pageIndex + 1
          this.queryAppListAccessed()
        }
      },
      keyWord: '', // 搜索关键字（按应用名称或应用code搜索）
      paramsPatient: ['organCode', 'wardCode', 'patIndexNo', 'patientId', 'mrn'], // 病人级别参数列表
      paramsWard: ['organCode', 'wardCode'], // 病区级别参数列表
      appList: [], // 已开通应用列表
      appAccessInfo: {
        tmpId: '',
        appName: '',
        appCode: '',
        aliasName: '', // 接入名称
        appType: 'pc', // 应用类型 pc/app/pad
        urlType: 'template', // 接入类型 病人/病区
        url: '', // 接口地址
        template: '', // 模板信息
        paramsMapPatient: [ // 参数映射列表-病人级别
          {
            paramName: '', // 应用参数名称
            paramDictName: '' // 患者信息参数名
          }
        ],
        paramsMapWard: [ // 参数映射列表-病区级别
          {
            paramName: '', // 应用参数名称
            paramDictName: '' // 患者信息参数名
          }
        ]
      }
    }
  },
  mounted () {
    // 加载view后需要做的事情
    var islogin = this.common.isLogin()
    if (!islogin) {
      return false
    }
    this.renderInit()
  },
  watch: {
    keyWord (newValue, oldValue) {
      if ($.trim(newValue) !== $.trim(oldValue)) {
        this.queryAppListAccessed(true)
      }
    }
  },
  methods: {
    renderInit () {
      this.loading = true
      // 查询已开通应用列表
      this.queryAppList()
      // 查询已接入应用列表
      this.queryAppListAccessed(true)
    },
    // 初始化参数
    resetInfo () {
      this.appAccessInfo = {
        tmpId: '',
        appName: '',
        appCode: '',
        aliasName: '', // 接入名称
        appType: 'pc', // 应用类型 pc/app/pad
        urlType: 'template', // 接入类型 病人/病区
        url: '', // 接口地址
        template: '', // 模板信息
        paramsMapPatient: [ // 参数映射列表-病人级别
          {
            paramName: '',
            paramDictName: ''
          }
        ],
        paramsMapWard: [ // 参数映射列表-病区级别
          {
            paramName: '',
            paramDictName: ''
          }
        ]
      }
      $('.input-error').removeClass('input-error')
      $('.i-error').remove()
      $('#appListSelect2').val('').unbind('change')
    },
    /**
     * 查询已接入应用列表
     * @param {number} isShowPageOne 是否展示第一页数据
     */
    queryAppListAccessed (isShowPageOne) {
      // 从第一页开始展示时 当前页参数赋值为1
      if (isShowPageOne) {
        this.pagerApp.currentPage = 1
      }

      var param = {
        'organCode': this.organCode,
        'strLike': this.keyWord
      }
      this.common.ajax({
        url: 'patientinfo-service/template/lis',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: (data) => {
          this.appListAccessed = data
          this.loading = false
          this.$nextTick(function () {
            // 计算滚动区域高度
            var h = $('.bg-white').height() - $('.am-tb-fixed-hd').height()
            $('.am-tb-fixed-bd').height(h)
            $('.am-tb-fixed-bd').scroll(function () {
              $('.am-tb-fixed-hd').scrollLeft($(this).scrollLeft())
            })
            $(window).resize(function () {
              var h = $('.bg-white').height() - $('.am-tb-fixed-hd').height()
              $('.am-tb-fixed-bd').height(h)
              $('.am-tb-fixed-bd').scroll(function () {
                $('.am-tb-fixed-hd').scrollLeft($(this).scrollLeft())
              })
            })
            // 表格单行添加背景色
            for (var i = 0; i < this.appListAccessed.length; i++) {
              if (i % 2 !== 0) {
                $('.' + this.appListAccessed[i].appCode).addClass('tr-double')
              }
            }
          })
        }
      })
    },
    // 展示应用接入类型
    showUrlTypeName (urlType) {
      if (urlType === 'template') {
        return '病人待办'
      } else if (urlType === 'backlog') {
        return '病区待办'
      } else {
        return '--'
      }
    },
    // 查询已开通应用列表
    queryAppList () {
      this.common.ajax({
        url: 'common-service/openapp/enabled',
        type: 'get',
        dataType: 'json',
        data: {
          hospitalId: this.organCode
        },
        callback: (result) => {
          this.appList = result
        }
      })
    },
    // 新增弹窗
    addFormPop (tmpId) {
      if (tmpId) {
        this.queryAppInfo(tmpId)
      }
      layer.open({
        type: 1,
        title: '待办接入配置',
        area: ['600px', ''],
        shadeClose: true,
        maxmin: true,
        content: $('#pop-content-add'),
        success: () => {
          var appListSelect2 = $('#appListSelect2').select2({
            noResults: '未搜索到相关数据',
            placeholder: '请选择'
          })
          appListSelect2.on('change', (e) => {
            var data = $('#appListSelect2').select2('data')
            if (data.length > 0) {
              this.appAccessInfo.appCode = $.trim(data[0].id)
              this.appAccessInfo.appName = data[0].text
            }
            this.checkApp()
          })
          if (tmpId) {
            setTimeout(() => {
              appListSelect2.val(this.appAccessInfo.appCode).trigger('change')
            }, 100)
          } else {
          }
        },
        end: () => {
          this.resetInfo()
          this.queryAppListAccessed()
        }
      })
    },
    /**
     * 查询详情接口
     * @param {string} tmpId 模板ID
     */
    queryAppInfo (tmpId) {
      var param = {
        'tmpId': tmpId
      }
      this.common.ajax({
        url: 'patientinfo-service/template/detail',
        dataType: 'json',
        type: 'get',
        async: false,
        data: param,
        callback: (data) => {
          this.appAccessInfo = {
            tmpId: data.tmpId,
            appName: data.appName,
            appCode: data.appCode,
            aliasName: data.aliasName,
            appType: data.appType, // 应用类型 pc/app/pad
            urlType: data.urlType, // 接入类型 病人/病区
            url: data.url, // 接口地址
            template: data.template, // 模板信息
            paramsMapPatient: [],
            paramsMapWard: []
          }
          if (data.urlType === 'template') {
            this.appAccessInfo.paramsMapPatient = data.urlParamList
          } else if (data.urlType === 'backlog') {
            this.appAccessInfo.paramsMapWard = data.urlParamList
          }
          console.log(this.appAccessInfo)
        }
      })
    },
    // 详情弹窗
    previewFormPop (tmpId) {
      this.queryAppInfo(tmpId)
      layer.open({
        type: 1,
        title: '待办接入详情',
        area: ['600px', ''],
        shadeClose: true,
        maxmin: true,
        content: $('#pop-content-preview'),
        success: () => {
          this.appAccessInfo = this.appAccessInfo
        },
        end: () => {
          this.resetInfo()
          this.queryAppListAccessed()
        }
      })
    },
    // 删除弹窗
    deleteFormPop (tmpId) {
      this.appAccessInfo.tmpId = tmpId
      layer.open({
        type: 1,
        title: '删除',
        area: ['600px', ''],
        shadeClose: true,
        content: $('#pop-content-del'),
        end: () => {
          this.resetInfo()
          this.queryAppListAccessed()
        }
      })
    },
    // 关闭弹窗
    closePop () {
      layer.closeAll()
    },
    /**
     * 选择应用类型
     * @param {string} appType 应用类型
     */
    checkedAppType (appType) {
      if ($(event.currentTarget).hasClass('disabled')) {
        return
      }
      this.appAccessInfo.appType = appType
    },
    /**
     * 选择接入类型
     * @param {string} urlType 接入类型
     */
    checkedUrlType (urlType) {
      if ($(event.currentTarget).hasClass('disabled') || $(event.currentTarget).hasClass('active')) {
        return
      }
      this.appAccessInfo.urlType = urlType
      $('.templateCon').find('.i-error').remove()
      $('.templateCon').find('.input-error').removeClass('input-error')
      $('.backlogCon').find('.i-error').remove()
      $('.backlogCon').find('.input-error').removeClass('input-error')
    },
    /**
     * 选择参数映射
     * @param {number} index 当前操作元素index值
     * @param {string} ele 当前操作元素
     * @param {string} param 当前选择参数值
     */
    checkedParam (ele, index, param) {
      this.appAccessInfo[ele][index].paramDictName = param
      this.checkParam()
    },
    /**
     * 新增参数映射
     * @param {string} ele 当前操作元素
     */
    addParam (ele) {
      this.appAccessInfo[ele].push({
        paramName: '',
        paramDictName: ''
      })
    },
    /**
     * 移除参数映射
     * @param {number} index 当前操作元素index值
     * @param {string} ele 当前操作元素
     */
    removeParam (index, ele) {
      this.appAccessInfo[ele].splice(index, 1)
    },
    // 显示错误提示
    showError (el, error, parents) {
      var $parent = $(el).parents('.am-panel-error')
      if (parents) {
        $parent = $(el).parents(parents)
      }
      $(el).addClass('input-error')
      if ($parent.find('.i-error').length === 0) {
        $parent.append('<i class="i-error" title="' + error + '"></i>')
      } else {
        $parent.find('.i-error').attr('title', error)
      }

      $parent.find('.i-error').tooltip('destroy')
      $('.i-error').tooltip({
        container: 'body',
        placement: 'auto top'
      }).on('shown.bs.tooltip', function (event) {
        $(this).parents('body').find('div.tooltip').css({zIndex: layer.zIndex})
      })
    },
    // 移除错误提示
    removeError (el, parents) {
      var $parent = $(el).parents('.am-panel-error')
      if (parents) {
        $parent = $(el).parents(parents)
      }
      $(el).removeClass('input-error')
      $parent.find('.i-error').remove()
    },
    // 校验接入应用信息
    checkApp () {
      // 校验接入应用信息
      if (!this.appAccessInfo.appCode) {
        this.showError('#appListSelect2', '请选择接入应用')
      } else {
        this.removeError('#appListSelect2')
      }
    },
    // 校验接入名称
    checkAliasName () {
      // 校验接入名称
      if (!this.appAccessInfo.aliasName) {
        this.showError('#aliasName', '请填写接入名称')
      } else {
        this.removeError('#aliasName')
      }
    },
    // 校验接口地址
    checkUrl () {
      if (this.appAccessInfo.urlType === 'template') {
      } else if (this.appAccessInfo.urlType === 'backlog') {
        // 校验接口地址
        if (!$.trim(this.appAccessInfo.url)) {
          this.showError('#urlW', '请填写接口地址')
        } else {
          this.removeError('#urlW')
        }
      }
    },
    // 校验接口参数
    checkParam () {
      if (this.appAccessInfo.urlType === 'template') {
        // 校验接口参数
        this.appAccessInfo.paramsMapPatient.map((param, index) => {
          if (($.trim(param.paramName) && !param.paramDictName) || (!$.trim(param.paramName) && param.paramDictName)) {
            this.showError('#paramNameP' + index, '请填写完整的参数信息', '.control-row')
          } else {
            this.removeError('#paramNameP' + index, '.control-row')
          }
        })
      } else if (this.appAccessInfo.urlType === 'backlog') {
        // 校验接口参数 只要两边参数有一个填写了即校验信息
        this.appAccessInfo.paramsMapPatient.map((param, index) => {
          if (($.trim(param.paramName) && !param.paramDictName) || (!$.trim(param.paramName) && param.paramDictName)) {
            this.showError('#paramNameP' + index, '请填写完整的参数信息', '.control-row')
          } else {
            this.removeError('#paramNameP' + index, '.control-row')
          }
        })
      }
    },
    // 校验模板
    checkTemplate () {
      if (this.appAccessInfo.urlType === 'template') {
        // 校验模板
        if (!$.trim(this.appAccessInfo.template)) {
          this.showError('#templateP', '请填写模板信息')
        } else {
          this.removeError('#templateP')
        }
      } else if (this.appAccessInfo.urlType === 'backlog') {
        // 校验模板
        if (!$.trim(this.appAccessInfo.template)) {
          this.showError('#templateW', '请填写跳转地址')
        } else {
          this.removeError('#templateW')
        }
      }
    },
    // 校验输入项
    checkInfo () {
      this.checkApp()
      this.checkAliasName()
      this.checkUrl()
      this.checkParam()
      this.checkTemplate()
    },
    // 确认新增
    addFormSubmit () {
      this.checkInfo()

      if ($('#pop-content-add').find('.i-error').length > 0) {
        return false
      }

      var param = {
        'tmpId': this.appAccessInfo.tmpId,
        'appCode': this.appAccessInfo.appCode,
        'appName': this.appAccessInfo.appName,
        'aliasName': this.appAccessInfo.aliasName,
        'appType': this.appAccessInfo.appType,
        'organCode': this.organCode,
        'template': this.appAccessInfo.template,
        'url': this.appAccessInfo.url,
        'urlType': this.appAccessInfo.urlType
      }
      if (this.appAccessInfo.urlType === 'template') {
        var paramsMapPatient = []
        this.appAccessInfo.paramsMapPatient.map(function (param) {
          if ($.trim(param.paramName) && param.paramDictName) {
            param.paramName = $.trim(param.paramName)
            paramsMapPatient.push(param)
          }
        })
        param.paramMapper = paramsMapPatient
      } else if (this.appAccessInfo.urlType === 'backlog') {
        var paramsMapWard = []
        this.appAccessInfo.paramsMapWard.map(function (param) {
          if ($.trim(param.paramName) && param.paramDictName) {
            param.paramName = $.trim(param.paramName)
            paramsMapWard.push(param)
          }
        })
        param.paramMapper = paramsMapWard
      }
      this.common.ajax({
        url: 'patientinfo-service/template/save',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(param),
        callback: (result) => {
          this.closePop()
          this.common.tip_msg(param.tmpId ? '修改成功~' : '新增成功~')
          this.queryAppListAccessed(1)
        }
      })
    },
    // 确认删除
    deleteFormSubmit () {
      var param = {
        tmpId: this.appAccessInfo.tmpId
      }
      this.common.ajax({
        url: 'patientinfo-service/template/del',
        type: 'get',
        dataType: 'text',
        data: param,
        callback: (result) => {
          this.closePop()
          this.common.tip_msg('删除成功~')
          this.queryAppListAccessed(1)
        }
      })
    },
    // 启用/停用
    enableDisable (tmpId, status) {
      var param = {
        tmpId: tmpId,
        validFlag: status
      }
      this.common.ajax({
        url: 'patientinfo-service/template/update/shortcut',
        type: 'get',
        dataType: 'text',
        data: param,
        callback: (result) => {
          this.closePop()
          this.common.tip_msg('操作成功~')
          this.queryAppListAccessed(1)
        }
      })
    },
    // 排序
    upDown (tmpId, pIndex, cIndex, sortType) {
      var param = {
        tmpId: tmpId
      }
      if (sortType === 'up') {
        param.oTmpId = this.appListAccessed[pIndex].appResList[cIndex - 1].tmpId
      } else if (sortType === 'down') {
        param.oTmpId = this.appListAccessed[pIndex].appResList[cIndex + 1].tmpId
      }
      this.common.ajax({
        url: 'patientinfo-service/template/update/shortcut',
        type: 'get',
        dataType: 'text',
        data: param,
        callback: (result) => {
          this.closePop()
          this.common.tip_msg('操作成功~')
          this.queryAppListAccessed(1)
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
