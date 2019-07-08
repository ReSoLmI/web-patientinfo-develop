<template>
	<div id="roomManageContainer">
		<div class="am-condition-top" style="min-height: 50px;">
			<span v-if="!isEdit">房间：<em class="am-txt-secondary">{{roomNumInfo.roomNum}}间</em></span>
			<span class="am-ml-20" v-if="!isEdit">床位：<em class="am-txt-secondary">{{roomNumInfo.bedNum}}张</em></span>
			<div class="right">
				<a class="am-link-success" v-if="!isEdit" @click="editRoomData()">配置</a>
				<a class="am-btn am-btn-plain-primary am-mr-10" v-if="isEdit" @click="cancelSaveData()">取消</a>
				<a class="am-btn am-btn-primary" v-if="isEdit" @click="saveRoomData()">保存</a>
				<!-- <a class="am-btn am-btn-primary am-ml-10" @click="showDevTools()">客户端调试</a> -->
				<a class="am-btn am-btn-primary am-ml-10" :class="{'disabled':checkedRoomId.length==0}" v-if="!isEdit" @click="printRoomLabel()">打印</a>
				<a class="am-btn am-btn-primary am-ml-10" :class="{'disabled':checkedRoomId.length==0}" @click="delRoom()">删除</a>
			</div>
		</div>
		<div class="order-cont">
			<!-- 房间列表 start -->
			<table class="am-tb am-tb-tr-even am-tb-hover bg-white">
				<colgroup>
					<col style="width: 60px;" />
					<col />
				</colgroup>
				<thead>
					<tr>
						<th class="td-center">
              <label class="am-ctr-chk checkAll" v-if="(!isEdit&&roomList.length>0)||(isEdit&&roomList_copy.length>0)" @click="checkAllRoom($event)">
                <input type="checkbox" name="rdo-01"><i style="width: 16px;height: 16px;"></i>
              </label>
            </th>
						<th style="min-width: 150px;width: 150px;">房间号</th>
						<th>床位号</th>
					</tr>
				</thead>
				<tbody v-if="!isEdit&&!loading">
					<tr v-if="roomList.length>0" v-for="(room,outerIndex) in roomList" :key="outerIndex">
						<td class="td-center">
							<label class="am-ctr-chk" @click="checkRoom($event,room.roomId, outerIndex)">
                <input type="checkbox" name="rdo-01"><i style="width: 16px;height: 16px;"></i>
              </label>
						</td>
						<td>
							<span>{{room.roomName}}</span>
						</td>
						<td>
							<div class="inner-with-right" style="padding-right: 0;">
								<div class="control-item-list quote-el-tag">
									<span class="el-tag control-item" v-for="(bed,index) in room.bedList" :key="index">{{bed}}床</span>
								</div>
							</div>
						</td>
					</tr>
				</tbody>
				<tbody v-if="isEdit&&!loading">
					<tr v-if="roomList_copy.length>0" v-for="(room,outerIndex) in roomList_copy" :key="outerIndex">
						<td class="td-center">
							<label class="am-ctr-chk" @click="checkRoom($event,room.roomId, outerIndex)"><input type="checkbox" name="rdo-01"><i style="width: 16px;height: 16px;"></i></label>
						</td>
						<td>
							<input type="text" class="input-text" maxlength="20" v-model="room.roomName" @blur="checkIsNull(outerIndex)" />
						</td>
						<td>
							<div class="inner-with-right">
								<span class="label" v-if="room.bedList.length==0">点击+分配床位</span>
								<div class="control-item-list quote-el-tag">
									<span class="el-tag control-item" v-for="(bed,index) in room.bedList" :key="index">{{bed}}床 <span class="el-tag__close el-icon-close" @click="delBed(outerIndex, index)">x</span></span>
								</div>
								<a class="right am-btn am-btn-plain-info" style="min-width: 30px;" @click="addRoomBed(outerIndex)">+</a>
							</div>
						</td>
					</tr>
				</tbody>
			</table>

			<div class="am-mt-10">
				<a class="am-btn am-btn-plain-info" @click="addRoom()" v-if="isEdit">+房间</a>
			</div>
			<!-- 房间列表 end -->

			<!-- 暂无数据 start -->
			<div class="no-data no-data-smile no-data-fixed" v-if="!isEdit&&!loading&&roomList.length==0">
				<div class="img"></div>
				<div class="responsive-txt">
					<div class="txt">该科室暂未配置房间及床位哦~</div>
				</div>
			</div>
			<!-- 暂无数据 end -->
		</div>
		<!-- 添加床位 start -->
		<div id="pop-content-bedList" style="display: none;">
			<div class="am-pd-20" style="height: 300px;overflow: auto;">
				<ul class="num-rdo-list" v-if="bedList.length>0 && !loadingBeds">
					<li v-for="(bed,index) in bedList" :key="index" :class="{'active':bed.checked,'disabled':!bed.canCheck}" @click="checkBed(bed, index)"><a>{{bed.bedNo}}</a></li>
				</ul>
				<div class="no-data no-data-search no-data-fixed" v-show="bedList.length==0 && !loadingBeds" style="display:none;">
					<div class="img"></div>
					<div class="responsive-txt">
						<div class="txt">暂无床位</div>
					</div>
				</div>
				<div class="loading-data" v-if="loadingBeds">
					数据加载中....
				</div>
			</div>
			<div class="change-bed-ft">
				<div class="right">
					已选：{{selectBedsLength}}<a class="am-btn-confirm am-ml-20" style="margin-top: -3px;" @click="addBedSubmit()">确定</a>
				</div>
			</div>
		</div>
		<!-- 添加床位 end -->

		<!-- 确认删除弹框 -->
		<div id="del-room-info" class="pop-content text-center" style="display: none;">
			<div class="bd">
				<div class="am-msg-lg-info">
					<div class="inner">
						<i class="i-question-lg"></i>
						<h3>确认删除该数据吗？</h3>
					</div>
				</div>
				<div class="am-btn-area">
					<a class="am-btn am-btn-plain-info am-btn-lg w120" @click="closePop()">取消</a>
					<a class="am-btn am-btn-info am-btn-lg w120 am-ml-20" @click="delRoomSubmit()">确定</a>
				</div>
			</div>
		</div>
		<!-- 确认删除弹框 -->

		<div class="loading-data" v-if="loading">
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
      wardName: this.common.queryParam('wardName'), // 科室名称
      loading: true, // 加载中标志
      printTemplate: {}, // 打印模板
      roomList: [], // 房间列表
      roomList_copy: [], // 房间列表数据备份
      roomNumInfo: {
        roomNum: 0, // 房间数量
        bedNum: 0 // 床位数量
      },
      isEdit: false,
      checkedRoomId: [], // 选中房间ID
      checkedRoomIndex: [], // 选中房间数据index值
      loadingBeds: false, // 床位加载标识
      bedList: [], // 床位列表
      selectBedsLength: 0, // 已选中床位数量
      roomIndex: '' // 当前操作房间数据对应index值
    }
  },
  mounted () {
    var islogin = this.common.isLogin()
    if (!islogin) {
      return false
    }
    this.init()
  },
  methods: {
    init: function () {
      // 默认展示加载中标志
      this.loading = true
      this.wardCode = this.common.getUrlParam('wardCode')
      // 查询房间列表
      this.queryRoomList()
      // 查询巡视单打印模板
      this.queryPrintTemp()
    },
    // 退出登录方法封装
    logout: function () {
      this.common.logout()
    },
    // 查询打印模板
    queryPrintTemp: function () {
      this.common.ajax({
        url: 'common-service/config/template/client',
        type: 'get',
        dataType: 'json',
        data: {
          'wardCode': this.wardCode,
          'printerConfig': 'wardRoomBandPrinter'
        },
        callback: function (result) {
          if (result && result.length > 0) {
            var templateInfo = result[0]
            this.printTemplate = {
              printerName: templateInfo.printerConfig,
              printerType: templateInfo.printerModel,
              displayXml: templateInfo.displayXML
            }
            // console.log(this.printTemplate)
          } else {
            this.printTemplate = {}
          }
        }
      })
    },
    showDevTools: function () {
      parent.showDevTools()
    },
    // 打印巡视单
    printRoomLabel: function () {
      if (this.common.$getLength(this.printTemplate) > 0) {
        // console.log('temp', JSON.stringify(this.printTemplate.$model));
        for (var i = 0; i < this.checkedRoomIndex.length; i++) {
          var data = this.roomList[this.checkedRoomIndex[i]]
          // console.log('data', JSON.stringify(data));
          // 调用客户端打印方法
          parent.ewellBrowserLabel.printLabel(JSON.stringify(this.printTemplate), JSON.stringify(data))
        }
      } else {
        this.common.tip_msg('请先配置打印模板！')
      }
    },
    // 查询房间列表
    queryRoomList: function () {
      var that = this
      var param = {
        organCode: this.common.getOrganCode(),
        wardCode: this.wardCode
      }
      this.common.ajax({
        url: 'patientinfo-service/inspection/room/query',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (data) {
          that.roomNumInfo = {
            roomNum: data.roomNum || 0,
            bedNum: data.bedNum || 0
          }
          that.roomList = data.roomResList || []
          that.loading = false
        }
      })
    },
    // 编辑房间数据
    editRoomData: function () {
      // debugger
      // 复制房间数据保存为副本 编辑时操作数据均为副本数据
      var roomList = $.extend([], this.roomList)
      this.roomList_copy = roomList
      // console.log(this.roomList_copy)
      this.isEdit = true
      this.resetCheckBox()
    },
    // 重置checkbox样式
    resetCheckBox: function () {
      this.checkedRoomId = []
      this.checkedRoomIndex = []
      $('.checkAll > input').prop('checked', false)
      $('.td-center input').prop('checked', false)
    },
    // 校验数据
    validData: function () {
      var that = this
      var $input = $('.input-text')
      $input.each(function (index) {
        that.checkIsNull(index)
      })
      var errorE = $('.input-error')
      if (errorE.length > 0) {
        this.common.tip_msg('房间号设置有误~')
        return false
      }
      return true
    },
    // 校验数据是否为为空&数据是否重复
    checkIsNull: function (roomIndex) {
      var ele = $('.input-text').eq(roomIndex)
      var val = $.trim(this.roomList_copy[roomIndex].roomName)
      if (val) {
        ele.removeClass('input-error')
        // 校验数据是否重复
        var isRepeat = -1
        for (var i = 0; i < this.roomList_copy.length; i++) {
          if (i !== roomIndex && this.roomList_copy[i].roomName === val) {
            ele.addClass('input-error')
            // $('.input-text').eq(i).addClass('input-error')
            this.common.tip_msg('已存在相同房间号，请重新输入！')
            isRepeat = i
            break
          }
        }
        if (isRepeat > -1) {
          // $('.input-text').eq(isRepeat).addClass('input-error')
        } else {
          ele.removeClass('input-error')
        }
      } else {
        this.common.tip_msg('请输入房间号！')
        ele.addClass('input-error')
      }
    },
    // 保存房间数据
    saveRoomData: function () {
      if (!this.validData()) {
        return false
      }
      var param = {
        organCode: this.common.getOrganCode(),
        roomList: this.roomList_copy,
        wardCode: this.wardCode,
        wardName: this.wardName
      }
      var that = this
      this.common.ajax({
        url: 'patientinfo-service/inspection/room/save',
        dataType: 'text',
        type: 'post',
        data: JSON.stringify(param),
        callback: function () {
          that.loading = true
          that.isEdit = false
          that.$nextTick(_ => {
            that.roomList_copy = []
          })
          that.common.tip_msg('保存成功~')
          that.queryRoomList()
        }
      })
    },
    // 取消保存房间数据
    cancelSaveData: function () {
      this.isEdit = false
      this.roomList_copy = []
      this.resetCheckBox()
    },
    // 全选房间
    checkAllRoom: function (event) {
      var checkbox = $(event.target).prop('checked')
      if (checkbox) {
        var list = this.isEdit ? this.roomList_copy : this.roomList
        for (var i = 0; i < list.length; i++) {
          this.checkedRoomId.push(list[i].roomId)
          this.checkedRoomIndex.push(i)
        }
        console.log(this.checkedRoomId)
        $('.td-center input').prop('checked', 'checked')
      } else {
        this.resetCheckBox()
      }
    },
    // 选中某个房间
    checkRoom: function (event, roomId, roomIndex) {
      var checkbox = $(event.target).prop('checked')
      if (checkbox) {
        this.checkedRoomId.push(roomId)
        this.checkedRoomIndex.push(roomIndex)
      } else if (this.checkedRoomId.indexOf(roomId) > -1) {
        this.checkedRoomId.splice(this.checkedRoomId.indexOf(roomId), 1)
        this.checkedRoomIndex.splice(this.checkedRoomIndex.indexOf(roomIndex), 1)
      }
      // 编辑模式下 校验全选
      if (this.isEdit) {
        if (this.checkedRoomId.length === this.roomList_copy.length) {
          $('.checkAll > input').prop('checked', 'checked')
        } else {
          $('.checkAll > input').prop('checked', false)
        }
      } else { // 非编辑模式下 校验全选
        if (this.checkedRoomId.length === this.roomList.length) {
          $('.checkAll > input').prop('checked', 'checked')
        } else {
          $('.checkAll > input').prop('checked', false)
        }
      }
    },
    // 删除选中床位
    delBed: function (pIndex, index) {
      this.roomList_copy[pIndex].bedList.splice(index, 1)
    },
    // 新增房间
    addRoom: function () {
      var room = {
        roomId: '',
        roomName: '',
        bedList: []
      }
      this.roomList_copy.push(room)
      // console.log(111)
      // console.log(this.roomList_copy)
    },
    // 删除房间
    delRoom: function () {
      var that = this
      // 编辑模式下
      if (this.isEdit) {
        var checkedL = this.checkedRoomIndex.length
        while (checkedL--) {
          this.roomList_copy.splice(that.checkedRoomIndex[checkedL], 1)
        }
        this.resetCheckBox()
      } else {
        // 确认删除弹窗
        layer.open({
          type: '1',
          title: '删除房间信息',
          content: $('#del-room-info'),
          end: function () {
            that.resetCheckBox()
            that.queryRoomList()
          }
        })
      }
    },
    // 关闭弹窗
    closePop: function () {
      layer.closeAll()
    },
    // 确认删除房间
    delRoomSubmit: function () {
      var param = {
        organCode: this.common.getOrganCode(),
        roomIdList: this.checkedRoomId.toString()
      }
      var that = this
      this.common.ajax({
        url: 'patientinfo-service/inspection/room/delete',
        dataType: 'text',
        type: 'get',
        data: param,
        callback: function (data) {
          layer.closeAll()
          that.common.tip_msg('删除成功~')
        }
      })
    },
    // 新增床位
    addRoomBed: function (roomIndex) {
      var that = this
      this.loadingBeds = true
      this.roomIndex = roomIndex
      this.queryBedList()
      layer.open({
        type: 1,
        title: '选择床位',
        area: ['600px', '400px'],
        fixed: true,
        shadeClose: true,
        maxmin: true,
        content: $('#pop-content-bedList'),
        end: function () {
          that.roomIndex = ''
          that.selectBedsLength = 0
        }
      })
    },
    // 查询床位列表
    queryBedList: function () {
      var param = {
        organCode: this.common.getOrganCode(),
        wardCode: this.wardCode,
        sortField: 'bedNo',
        direction: 'ASC'
      }
      var that = this
      this.common.ajax({
        url: 'baseinfo2.0/beds/beds',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (data) {
          // 处理床位是否能选
          // 如果当前房间的床位 需要选中对应床位
          // 如果是其他房间已选的床位 当前房间不能选择该床位
          // 其他房间已选床位信息
          var bedListOther = []
          for (var i = 0; i < that.roomList_copy.length; i++) {
            if (that.roomIndex !== i) {
              bedListOther = bedListOther.concat(that.roomList_copy[i].bedList)
            }
          }
          // console.log(bedListOther)
          for (var j = 0; j < data.length; j++) {
            // 当前床位是否能选择 默认为可以选择
            data[j].canCheck = true
            // 当前床位是否已选择 默认为未选择
            data[j].checked = false
            for (var k = 0; k < bedListOther.length; k++) {
              // 判断当前床位为其他房间已选床位时，该床位不可选择
              if (data[j].bedNo === bedListOther[k]) {
                data[j].canCheck = false
              }
            }
            if (that.roomList_copy[that.roomIndex].bedList && that.roomList_copy[that.roomIndex].bedList.length > 0) {
              for (var m = 0; m < that.roomList_copy[that.roomIndex].bedList.length; m++) {
                // 判断当前床位是否为当前科室已选择床位 是的话界面需选中该床位
                if (data[j].bedNo === that.roomList_copy[that.roomIndex].bedList[m]) {
                  data[j].checked = true
                  that.selectBedsLength += 1
                }
              }
            }
          }
          // console.log(data)
          that.bedList = data
          that.loadingBeds = false
        }
      })
    },
    // 选中床位
    checkBed: function (bed, bedIndex) {
      if (bed.canCheck) {
        this.bedList[bedIndex].checked = !bed.checked
        if (this.bedList[bedIndex].checked) {
          this.selectBedsLength += 1
        } else {
          this.selectBedsLength -= 1
        }
      }
    },
    // 确认新增床位
    addBedSubmit: function () {
      var bedList = []
      for (var i = 0; i < this.bedList.length; i++) {
        if (this.bedList[i].checked) {
          bedList.push(this.bedList[i].bedNo)
        }
      }
      this.roomList_copy[this.roomIndex].bedList = bedList
      // console.log(this.roomList_copy)
      layer.closeAll()
    }
  }
}
</script>

<style scoped>
.el-icon-close{
  line-height: 13px;
}
.el-icon-close:before{
  content: ''
}
</style>
