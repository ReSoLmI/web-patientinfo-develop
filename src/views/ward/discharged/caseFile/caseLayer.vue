<template>
  <!-- 病例归档 -->
  <div class="ms-controller">
    <div id="pop-content-01" style="display: none;">
      <div  v-if="loading">
        <div class="loading_up no-data-fixed loading-data">
            <div class="bird">
                <div class="body"></div>
                <div class="light"></div>
            </div>
            <span class="txt">加载中..<em>.</em></span>
        </div>
      </div>
      <div class="am-pd-20" :class="{'opacity-5': loading}" style="min-height: 287px;">
        <div class="archiving-summary">
          <div class="inner">
            <h4>归档项目：{{dataObject.count}}个</h4>
            <p>归档成功数据将不可修改<span style="margin-left: 30px;">上一次归档时间：{{dataObject.lastArchiveTime | format('yyyy-MM-dd hh:mm:ss')}}</span></p>
          </div>
          <div class="right-txt">
            <div class="inner">
              <!-- 已归档或归档中不能进行再次归档，但病历解锁后可再次进行归档 -->
              <a class="am-btn am-btn-primary am-ml-10" :class="{'am-btn-disabled':archiveInfo.archiveState===0||archiveInfo.archiveState===1||!archiveInfo.isCanArchive}" @click="toFile" v-if="dataObject.archivePicList.length > 0">归档</a>
            </div>
          </div>
        </div>
        <div class="no-data" v-if="dataObject.count == 0 && !loading">
          <div class="img"></div>
          <div class="responsive-txt">
            <div class="txt">没有符合条件的归档项目!</div>
          </div>
        </div>
        <div class="inner-scroll-pd" style="max-height: 400px">
          <ul class="list-bline list-has-right am-mt-10" v-if="dataObject.count > 0">
            <li v-for='(el, $index) in dataObject.archivePicList' :key="$index">
              <!-- <span class="auxiliary auxiliary-warn am-mr-10" v-if="el.status == 0">未审核</span> -->
              {{el.fileName}}
              <span class="no-sign" v-if="el.signed===0">签章未完成</span>
              <div style="display: none;">
                <p v-for='(item, $index1) in el.signedTip' :key="$index1" style="margin:0;padding:5px 0;">{{item}}</p>
              </div>
              <!-- <a class="right" @click="openFile(el.link)">详情</a> -->
              <span :class="['right showTips iconStatus' + showArchiveState(el.evalutionType).class]" :title="showArchiveState(el.evalutionType).name"></span>
            </li>
          </ul>
        </div>
        <div class="archiving-summary" style="margin-top: 20px;" v-if="archiveInfo.archiveState !== -1">
          <div class="inner">
            <h4>归档项目：{{dataObject.count}}个</h4>
            <p v-if="archiveInfo.archiveState === 2">已归档{{archiveInfo.successNum}}个</p>
          </div>
          <div class="right-txt">
            <div class="inner">
              <h4 v-if="archiveInfo.archiveState === 0">归档中...</h4>
              <h4 v-if="archiveInfo.archiveState === 1">归档成功</h4>
              <h4>
                <span class="am-txt-success" v-if="archiveInfo.archiveState === 0">{{archiveInfo.progress}}%</span>
                <span class="am-txt-danger" v-if="archiveInfo.archiveState === 2">归档失败</span>
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="pop-content-url" style="display: none;height: 100%;">
      <div class="scrollbar-condition-after" style="overflow: hidden;height: 100%;">
          <iframe id="load" class="iframeContainer" marginheight="0" marginwidth="0" frameborder="0" scrolling="auto" :src="showUrl"></iframe>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loading: true, // 弹框样式加载
      dataObject: {
        archivePicList: []
      }, // 页面数据
      showUrl: '', // 详情url
      patIndexNo: '', // 病人索引号
      patient: {}, // 病人信息
      archiveInfo: {
        archivePicList: [], // 备份归档文件列表
        isSetInterval: true, // 是否需要创建定时查询任务
        archiveState: -1, // 归档状态,  -1.未归档 0.未完成 1.已完成 2.异常中断
        progress: 0, // 归档进度
        successNum: 0, // 归档成功个数
        finishedEvaluationType: [], // 已成功归档的评估单
        timeInterval: '', // 定时任务
        isUnclock: false, // 解锁后是否已操作归档 添加此变量的目的为病历解锁后进入归档页面查询病人归档状态为1归档成功，此时是要可以再次操作归档按钮的，点击归档，归档成功后，归档状态也为1 无法区分这两种情况的处理 所以加此变量用以区分 此变量值默认为FALSE，病历解锁后再次点击归档后置为TRUE
        isCanArchive: true // 是否能进行归档 归档文件列表中有未准备就绪的(未进行CA签名) 则不可进行归档
      }
    }
  },
  mounted () {},
  methods: {
    // 初始化数据
    initData: function (isSetInterval) {
      this.archiveInfo.isSetInterval = isSetInterval // 是否需要创建定时查询任务
      this.archiveInfo.archiveState = -1 // 归档状态,  -1.未归档 0.未完成 1.已完成 2.异常中断
      this.archiveInfo.progress = 0 // 归档进度
      this.archiveInfo.successNum = 0 // 归档成功个数
      this.archiveInfo.finishedEvaluationType = [] // 已成功归档的评估单
      this.archiveInfo.isUnclock = false // 解锁后是否已操作归档
      this.archiveInfo.isCanArchive = true // 是否能进行归档 归档文件列表中有未准备就绪的(未进行CA签名) 则不可进行归档
      // 清除定时查询任务
      window.clearInterval(this.archiveInfo.timeInterval)
    },
    // 手动归档
    toFile: function () {
      // 已归档或归档中或归档文件中有未准备就绪文件不能再次归档
      if (this.archiveInfo.archiveState === 0 || this.archiveInfo.archiveState === 1 || !this.archiveInfo.isCanArchive) {
        return false
      }
      this.initData(true)
      // 开始归档
      this.archiveInfo.archiveState = 0
      // 如果当前病人状态为已解锁状态 点击归档后 将此变量状态置为true 代表已操作过归档
      if (this.patient.archivedStatus === '2') {
        this.archiveInfo.isUnclock = true
      }

      var params = {
        nurseCode: this.patient.primaryNurseCode || '',
        nurseName: this.patient.primaryNurseName || '',
        organCode: this.common.getOrganCode(),
        patIndexNo: this.patient.patIndexNo,
        physiSexCode: this.patient.physiSexCode,
        mrn: this.patient.mrn,
        name: this.patient.name,
        sourceType: 'IH',
        patientId: this.patient.patientId,
        visitCardNo: this.patient.visitCardNo || '',
        archivePicList: this.dataObject.archivePicList.$model
      }
      this.common.ajax({
        url: 'archive/archive/async',
        dataType: 'json',
        type: 'post',
        data: JSON.stringify(params),
        timeout: 99999999,
        nocloseLayer: true,
        callback: (r) => {
          this.processArchiveInfo(r, true)
        },
        failure: () => {
          // 归档失败
          this.archiveInfo.archiveState = 2
        }
      })
    },
    // 查询病人数据
    queryPatientInfo: function () {
      var param = {
        organCode: this.common.getOrganCode(),
        sourceType: 'IH',
        patIndexNo: this.patIndexNo
      }
      this.common.ajax({
        url: 'baseinfo2.0/allType/patients',
        type: 'get',
        data: param,
        callback: (r) => {
          if (r && r.length > 0) {
            this.patient = r[0]
            this.queryfilelist()
          }
        }
      })
    },
    // 查询页面数据
    queryfilelist: function () {
      var params = {
        organCode: this.common.getOrganCode(),
        patIndexNo: this.patient.patIndexNo
      }
      this.common.ajax({
        url: 'archive/archive/fileList',
        dataType: 'json',
        type: 'post',
        timeout: 60000,
        data: JSON.stringify(params),
        showLoading: false,
        callback: (r) => {
          this.archiveInfo.archivePicList = $.extend(true, [], r.archivePicList)
          this.dataObject = r
          if (this.archiveInfo.archivePicList.length > 0) {
            for (var i = 0; i < this.archiveInfo.archivePicList.length; i++) {
              if (this.archiveInfo.archivePicList[i].signed === 0) {
                this.archiveInfo.isCanArchive = false
                break
              }
            }
          }
          this.loading = false
          this.$nextTick(function () {
            // tooltips 卡片鼠标悬浮展示病人更多信息卡片处理
            $('.no-sign').tooltip({
              container: 'body',
              html: true,
              placement: 'auto top',
              title: function () {
                return $(this).next('div').html()
              }
            }).on('shown.bs.tooltip', function (event) {
              $(this).parents('body').find('div.tooltip').css({zIndex: layer.zIndex})
            })
          })
          this.queryArchiveLastRecord()
        }
      })
    },
    // 查询患者归档状态
    queryArchiveLastRecord: function () {
      var params = {
        patIndexNo: this.patient.patIndexNo
      }
      this.common.ajax({
        url: 'archive/archive/lastrecord',
        dataType: '',
        type: 'get',
        data: params,
        showLoading: false,
        callback: (r) => {
          // 如果病人归档状态为已解锁，重新查询一遍病人归档状态 防止时间差导致病人归档状态未查询到最新
          if (this.patient.archivedStatus === '2') {
            var param = {
              organCode: this.common.getOrganCode(),
              sourceType: 'IH',
              patIndexNo: this.patIndexNo
            }
            this.common.ajax({
              url: 'baseinfo2.0/allType/patients',
              type: 'get',
              data: param,
              callback: (data) => {
                if (data && data.length > 0) {
                  this.patient = data[0]
                }
                // 有返回值时 代表已经开始在归档
                if (r) {
                  // 处理归档展示数据
                  this.processArchiveInfo(r, true)
                } else { // 没有返回值时 代表还未开始归档
                  this.archiveInfo.archiveState = -1
                }
              }
            })
          } else { // 如果病人归档状态不为已解锁 直接进行处理
            // 有返回值时 代表已经开始在归档
            if (r) {
              // 处理归档展示数据
              this.processArchiveInfo(r, true)
            } else { // 没有返回值时 代表还未开始归档
              this.archiveInfo.archiveState = -1
            }
          }
        }
      })
    },
    /**
     * 查询归档进度
     * @param {number} id 当前归档进程ID
     */
    queryArchiveProgress: function (id) {
      var params = {
        id: id
      }
      this.common.ajax({
        url: 'archive/archive/record',
        dataType: 'json',
        type: 'get',
        data: params,
        showLoading: false,
        callback: (r) => {
          // 处理归档展示数据
          this.processArchiveInfo(r, false)
        }
      })
    },
    /**
     * 处理归档展示数据
     * @param {object} r 归档查询数据
     * @param {boolean} isSetInterval 是否设置定时查询任务
     */
    processArchiveInfo: function (r, isSetInterval) {
      // 如果病人是病历解锁状态&当前状态不是已完成时，代表解锁后已操作过归档 需将操作标志置为TRUE
      if (this.patient.archivedStatus === '2' && r.archiveState !== 1) {
        this.archiveInfo.isUnclock = true
      }
      // 如果病人是病历解锁状态&当前归档状态为已完成时 重置归档状态
      if (this.patient.archivedStatus === '2' && r.archiveState === 1) {
        // 当前已操作过归档
        if (this.archiveInfo.isUnclock) {
          // 将病人归档状态置为已归档 流程继续往下走
          this.patient.archivedStatus = '1'
        } else { // 当前未操作过归档 处理归档数据 流程终止
          // 归档状态置为未归档
          this.archiveInfo.archiveState = -1
          // 归档进度置为0
          this.archiveInfo.progress = 0
          // 已归档成功的评估单置为空
          this.archiveInfo.finishedEvaluationType = []
          // 归档成功个数
          this.archiveInfo.successNum = 0
          return false
        }
      }
      // 归档状态 0.未完成 1.已完成 2.异常中断
      this.archiveInfo.archiveState = r.archiveState
      // 归档进度
      this.archiveInfo.progress = r.progress
      // 已归档成功的评估单
      this.archiveInfo.finishedEvaluationType = r.finishedEvaluationType ? r.finishedEvaluationType : []
      this.dataObject.archivePicList = []
      this.dataObject.archivePicList = $.extend(true, [], this.archiveInfo.archivePicList)
      // 归档成功个数
      this.archiveInfo.successNum = this.archiveInfo.finishedEvaluationType.length
      // 如果当前弹窗已关闭 该变量会置为false 需清空定时任务事件
      if (this.archiveInfo.isSetInterval) {
        // 归档未完成时 每隔2s查询一次归档进度
        if (r.archiveState === 0 && isSetInterval) {
          this.archiveInfo.timeInterval = window.setInterval(function () {
            this.queryArchiveProgress(r.id)
          }, 2000)
        } else if (this.archiveInfo.archiveState !== 0) {
          // 归档成功或中断时 清除定时查询任务
          window.clearInterval(this.archiveInfo.timeInterval)
        }
      } else {
        window.clearInterval(this.archiveInfo.timeInterval)
      }
    },
    /**
     * 查询当前评估单归档状态
     * @param {string} evalutionType 评估单类型
     */
    showArchiveState: function (evalutionType) {
      var archive = {
        class: '',
        name: ''
      }
      // 未开始归档时 返回未归档
      if (this.archiveInfo.archiveState === -1) {
        archive = {
          class: 'iconStatus-unfinished',
          name: '未归档'
        }
        return archive
      } else if (this.archiveInfo.archiveState === 0) {
        // 归档未完成时 判断已在完成清单中的代表已完成 其他为归档中
        if (this.archiveInfo.finishedEvaluationType.indexOf(evalutionType) > -1) {
          archive = {
            class: 'iconStatus-finished',
            name: '已归档'
          }
          return archive
        } else {
          archive = {
            class: 'iconStatus-loading',
            name: '归档中'
          }
          return archive
        }
      } else if (this.archiveInfo.archiveState === 1) {
        // 归档已完成时 代表全部归档成功
        archive = {
          class: 'iconStatus-finished',
          name: '已归档'
        }
        return archive
      } else if (this.archiveInfo.archiveState === 2) {
        // 归档失败时 判断已在完成清单中的代表已完成 其他为未归档(归档失败)
        archive = {
          class: 'iconStatus-unfinished',
          name: '未归档'
        }
        return archive
      }
    },
    // 打开弹框
    openLayer: function (patIndexNo) {
      this.loading = true
      this.patIndexNo = patIndexNo
      this.dataObject = {}
      this.initData(true)
      this.queryPatientInfo()
    },
    // 打开文档详情页
    openFile: function (url) {
      this.showUrl = url.split('?')[0] + '?patIndexNo=' + this.patient.patIndexNo + '&wardCode=' + this.common.getUrlParam('wardCode') + '&token=' + $.cookie('_token_')
      layer.open({
        type: 1,
        title: '详情',
        scrollbar: false,
        area: ['80%', '90%'],
        shadeClose: true, // 点击遮罩关闭
        content: $('#pop-content-url')
      })
    }
  },
  filters: {
    format (value, str) {
      return new Date(value).format(str)
    }
  }
}
</script>

<style scoped>
</style>
