<template>
  <div class="bg-main am-page-rcont-caseFile">
    <div class="am-pd-20">
      <div class="strip-tz-top-cont">
        <ul class="strip-tz-top">
          <!-- <li :class="active:setType == 1" @click="changeType(1)">数据源设置</li> -->
          <li :class="{active:setType == 2}" @click="changeType(2)">参数设置</li>
        </ul>
      </div>
      <div class="loading_up no-data-fixed loading-data" v-show="loading">
        <div class="bird">
            <div class="body"></div>
            <div class="light"></div>
        </div>
        <span class="txt">加载中..<em>.</em></span>
      </div>
      <!-- 数据源设置 -->
      <div v-show="setType == 1 && !loading" style="display: none;">
        <div class="panel-dot first" v-if="dataType == 1">
            <div class="hd">数据源设置
              <div class="tool-right" v-if="handleType==1">
                <ul class="tool-list" >
                  <li class="tool-upd" @click="$handleType"></li>
                </ul>
              </div>
              <div class="right" v-if="handleType==2">
                <a class="am-ml-10" @click="saveData">保存</a>
                <a class="txt-cancel am-ml-10" @click="cancleDate">取消</a>
              </div>
            </div>
            <div class="bd">
              <div class="am-form" style="max-width: 800px;margin-top: -20px;">
                <div class="am-form-item">
                  <div class="am-form-label am-col-4">数据源</div>
                  <div class="am-col-20">
                    <div class="control-row-addabeld-list">
                      <div class="control-row-addabeld">
                        <div class="control-item am-mr-10">
                          <input type="text" class="input-text w160" placeholder="请输入数据源名称"/>
                        </div>
                        <div class="control-item am-mr-10">
                          <input type="text" class="input-text" style="width: 260px;" placeholder="请输入数据源地址"/>
                        </div>
                        <a class="i-link-del" style="margin-top: 7px;"></a>
                      </div>
                      <div class="control-row-addabeld">
                        <div class="control-item am-mr-10">
                          <input type="text" class="input-text w160" placeholder="请输入数据源名称"/>
                        </div>
                        <div class="control-item am-mr-10">
                          <input type="text" class="input-text" style="width: 260px;" placeholder="请输入数据源地址"/>
                        </div>
                        <a class="i-link-del" style="margin-top: 7px;"></a>
                      </div>
                      <div class="am-mt-20"><a>+数据源</a></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
        <!--panel-->
        <div class="panel-dot first" v-if="dataType == 2">
          <div class="hd">数据源设置
            <div class="tool-right">
              <ul class="tool-list">
                <li class="tool-upd" @click="toSet"></li>
              </ul>
            </div>
          </div>
        </div>
        <!--panel end-->
      </div>
      <!-- 参数设置 -->
      <div v-show="setType == 2 && !loading" style="display: none;">
        <div class="panel-dot first" v-if="dataType == 1">
          <div class="hd">归档设置
            <div class="right">
              <a class="am-ml-10" @click="saveConfig">保存</a>
              <a class="txt-cancel am-ml-10" @click="cancleVar">取消</a>
            </div>
          </div>
          <div class="bd">
            <div class="am-form" style="max-width: 800px;margin-top: -20px;">
              <div class="am-form-item">
                <div class="am-form-label am-col-4">自动归档设置</div>
                <div class="am-col-20">
                  <div class="btn-switch" style="margin: 4px 10px 4px 0;" :class="{active:configList.autoSwitch==1}" @click="$autoSet"><span></span></div>
                  <span style="line-height: 30px;">出院</span>
                  <div class="am-sel-edit w130 am-ml-5">
                    <input id="txt-sel-edit" @blur="checkOutTime" type="text" maxlength="5" style="ime-mode:disabled" onpaste="return false;" onKeyUp="this.value=this.value.replace(/[^\.\d]/g,'');this.value=this.value.replace('.','');" class="input-text" placeholder="请输入" v-model="configList.leaveDays"/>
                    <label for="txt-sel-edit" class="btn-angle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true"></label>
                    <div class="am-dropdown">
                      <ul>
                        <li @click="checkTime(7)">7天</li>
                        <li @click="checkTime(14)">14天</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div class="am-form-item">
                <div class="am-form-label am-col-4">归档文书</div>
                <div class="am-col-20 select2-data">
                    <select id="select2-01" class="js-example-basic-single" style="width: 400px;display: none;" multiple="">
                      <option v-for="(item, $index) in docList" :value="$index" :title="item.fileName" :key="$index">{{item.fileName}}</option>
                    </select>
                    <input id="select2-data" style="display:none;">
                  <!-- <span class="am-ml-10"></span>请先设置数据源<a class="am-ml-5" @click="changeType(1)">去设置</a><input id="select2-data" style="display:none;"> -->
                </div>
              </div>
            </div>
          </div>
        </div>
        <!--panel-->
        <div class="panel-dot" v-if="dataType == 2">
          <div class="hd">归档设置
            <div class="tool-right">
              <ul class="tool-list">
                <li class="tool-upd" @click="toSet"></li>
              </ul>
            </div>
          </div>
          <div class="bd">
            <div class="am-form" style="max-width: 800px;margin-top: -20px;">
              <div class="am-form-item">
                <div class="am-form-label am-col-4 static" v-if="configList.autoSwitch==1">自动归档设置</div>
                <div class="am-form-label am-col-4 static" v-if="configList.autoSwitch==0">未设置自动归档</div>
                <div class="am-col-20" v-if="configList.autoSwitch==1">
                  出院{{configList.leaveDays}}天
                </div>
              </div>
              <div class="am-form-item">
                <div class="am-form-label am-col-4 static">归档文书</div>
                <div class="am-col-20" ms-each-el="allFiles">
                  <div :class="{'am-mt-10': $index!=0}" v-for="(el, $index) in allFiles" :key="$index">{{el.fileName}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!--panel end-->
        <div class="panel-dot" v-if="configList.excepitonFlag==0">
          <div class="hd">程序异常日志<span class="small am-txt-primary">正常</span></div>
          <!-- <a class="right am-link-default" target="_self" :href="logURL" download="archive.log">查看日志</a> -->
        </div>
        <div class="panel-dot" v-if="configList.excepitonFlag==1">
          <div class="hd">程序异常日志<span class="small am-txt-danger">异常</span>
            <a class="right am-link-default" target="_self" :href="logURL" download="">查看日志</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
var selectList
export default {
  data () {
    return {
      setType: 2, // 1:数据源设置 2：归档设置
      handleType: 1, // 1:操作图标 2:文字
      dataType: 2, // 1：设置 2：展示
      docList: [], // 需要配置的文书
      dataList: [], // 数据源列表
      loading: true,
      configListOld: {},
      logURL: '',
      configList: {
        allFiles: [],
        autoSwitch: '',
        destFileDir: '',
        excepitonFlag: '',
        leaveDays: ''
      }, // 配置列表
      allFiles: []
    }
  },
  mounted () {
    this.$renderInit()
  },
  methods: {
    // 初始化接口
    $renderInit: function () {
      this.queryDocList()
      this.queryConfigList()
      this.getLogURL()
      selectList = $('#select2-01').select2()
      selectList.on('change', (e) => {
        var data = $('#select2-01').select2('data')
        if (data.length < 1) {
          this.showError('#select2-data')
        } else {
          this.removeError('#select2-01')
        }
      })
    },
    // 初始化状态参数
    initType: function () {
      this.handleType = 1
      this.dataType = 2
      $('.explain-error').remove()
      $('.input-error').removeClass('input-error')
    },
    getLogURL: function () {
      this.common.ajax({
        url: 'archive/unsafepass/log?access_token=' + this.common.getLocalStorage('PAT_token'),
        dataType: 'text',
        type: 'get',
        showLoading: false,
        callback: (r) => {
          this.logURL = r
        }
      })
    },
    // 查询归档列表
    queryConfigList: function () {
      this.common.ajax({
        url: 'archive/archive/readConfig',
        dataType: 'json',
        type: 'get',
        showLoading: false,
        callback: (r) => {
          this.loading = false
          this.configList = r
          this.configListOld = r
          this.allFiles = r.allFiles
          this.dataType = 2
        }
      })
    },
    // 查询文书列表
    queryDocList: function () {
      this.common.ajax({
        url: 'archive/archive/allEvaluationType',
        dataType: 'json',
        type: 'get',
        showLoading: false,
        callback: (r) => {
          this.docList = r
        }
      })
    },
    // 提交参数设置
    saveConfig: function () {
      var list = $('#select2-01').select2('data')
      var selectDocList = []
      this.configList.allFiles = []
      list.map(function (value) {
        selectDocList.push({
          evalutionType: this.docList[value.id].evalutionType,
          fileName: this.docList[value.id].fileName,
          fileType: this.docList[value.id].fileType,
          module: this.docList[value.id].module
        })
      })
      if (selectDocList.length < 1) {
        this.showError('#select2-data')
      }
      if (this.configList.leaveDays === '') {
        this.showError('#txt-sel-edit')
      }
      if ($('.explain-error').length > 0) {
        return false
      }
      var param = {
        allFiles: selectDocList,
        autoSwitch: this.configList.autoSwitch,
        destFileDir: this.configList.destFileDir,
        excepitonFlag: this.configList.excepitonFlag,
        leaveDays: this.configList.leaveDays
      }
      this.common.ajax({
        url: 'archive/archive/config',
        dataType: 'text',
        type: 'post',
        data: JSON.stringify(param),
        callback: (r) => {
          this.common.tip_msg()
          this.queryConfigList()
        }
      })
    },
    // 切换是否自动归档
    $autoSet: function (type) {
      this.configList.autoSwitch = this.configList.autoSwitch ? 0 : 1
    },
    // 选择出院时间
    checkTime: function (time) {
      this.configList.leaveDays = time
    },
    // 切换设置页面
    changeType: function (type) {
      this.setType = type
      this.initType()
      if (this.setType === 2) {
        this.queryDocList()
        this.queryConfigList()
      }
    },
    // 操作按钮状态切换
    $handleType: function () {
      this.handleType = 2
    },

    // 切换数据源展示状态
    saveData: function () {
      this.dataType = 2
    },
    cancleDate: function () {
      this.dataType = 2
      this.handleType = 1
    },
    cancleVar: function () {
      this.dataType = 2
      this.configList = this.configListOld
    },
    // 编辑数据
    toSet: function () {
      this.initType()
      this.dataType = 1
      var selectlist = []
      this.configList.allFiles.map(function (value, index) {
        for (var i = 0; i < this.docList.length; i++) {
          if (value.evalutionType === this.docList[i].evalutionType) {
            selectlist.push(i)
            break
          }
        }
      })
      selectList.val(selectlist).trigger('change')
    },
    // 显示错误提示
    showError: function (el, msg) {
      $(el).addClass('input-error')
      if (msg) {
        $(el).after('<div class="explain-error">' + msg + '</div>')
      } else {
        $(el).after('<div class="explain-error">不允许为空！</div>')
      }
    },
    // 删除错误提示
    removeError: function (el) {
      $(el).removeClass('input-error')
      $(el).siblings('.explain-error').remove()
    },
    // 检查是否输入了
    checkOutTime: function () {
      if (this.configList.leaveDays !== '') {
        this.removeError('#txt-sel-edit')
      } else {
        this.showError('#txt-sel-edit')
      }
    }
  }
}
</script>

<style scoped>
</style>
