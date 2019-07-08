/**
 * @file 公共方法封装 2017-12-20
 * @author lutingting(lutingting@ewell.cc)
 */
//      使用方法
//      var now = new Date();
//      var nowStr = now.format("yyyy-MM-dd hh:mm:ss");
//      //使用方法2:
//      var testDate = new Date();
//      var testStr = testDate.format("YYYY年MM月dd日hh小时mm分ss秒");
//      alert(testStr);
//      //示例：
//      alert(new Date().Format("yyyy年MM月dd日"));
//      alert(new Date().Format("MM/dd/yyyy"));
//      alert(new Date().Format("yyyyMMdd"));
//      alert(new Date().Format("yyyy-MM-dd hh:mm:ss"));
// eslint-disable-next-line
Date.prototype.format = function (format) {
  var that = this
  var o = {
    'M+': that.getMonth() + 1,
    // month
    'd+': that.getDate(),
    // day
    'h+': that.getHours(),
    // hour
    'm+': that.getMinutes(),
    // minute
    's+': that.getSeconds(),
    // second
    'q+': Math.floor((that.getMonth() + 3) / 3),
    // quarter
    'S': that.getMilliseconds() // millisecond
  }

  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  }

  for (var k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
    }
  }
  return format
}
const common = {
  // baseUrl: '/patientinfoPC/',
  baseUrl: '/',
  tipMsg: function (msg, time, callbackFun) {
    layer.msg(msg || '操作成功！', {
      time: time || 2000,
      offset: '20px'
    }, function () {
      if (callbackFun) {
        callbackFun()
      }
    })
  },
  /**
   * 确认弹出框
   * @param okFun
   * @param cancleFun
   * @param msg
   */
  confirm_g: function (okFun, cancleFun, msg) {
    layer.confirm('<div class="am-msg-h3">' +
      '<div class="inner">' + msg + '</div>' +
      '</div>',
    {
      title: '提示',
      btn: ['确定', '取消'], // 按钮,
      shadeClose: false // 点击遮罩关闭
    }, function () {
      layer.closeAll()
      okFun()
    }, function () {
      if (cancleFun) {
        cancleFun()
      }
    })
  },
  /**
   * ajax方法封装
   * @param {*} options 参数对象
   */
  ajax: function (options) {
    if (!window.navigator.onLine) {
      layer.msg('当前网络不通，请稍后再试！', {
        time: 1000,
        offset: '20px'
      }, function () {

      })
      return
    }
    // layer.load(2, {offset: ['50%', '50%']})
    options.hideLayer = options.hideLayer === undefined ? true : options.hideLayer
    options.token = options.token === undefined ? true : options.token
    if (common.getLocalStorage('PAT_token')) {
      options.headers = {
        'Authorization': (common.getUrlParam('token') || common.getLocalStorage('PAT_token'))
      }
    } else {
      options.headers = {}
    }
    // 请求头封装token参数
    if (options.token) {
      var locationUrl = window.location.href
      if (locationUrl.indexOf('/pageThird') > -1) {
        if (common.queryParam('token_t')) {
          options.headers = {
            'Authorization': 'Bearer ' + common.queryParam('token_t')
          }
        }
      } else {
        if (common.getLocalStorage('PAT_token')) {
          options.headers = {
            'Authorization': 'Bearer ' + common.getLocalStorage('PAT_token')
          }
        }
      }
    }
    var random = options.url.indexOf('?') > -1 ? '&random=' + Math.random() : '?random=' + Math.random()
    options.logout = options.logout === undefined ? true : options.logout
    $.ajax({
      type: options.type || 'post',
      url: '/patientinfoPC/' + options.url + random,
      dataType: options.dataType === undefined ? 'json' : options.dataType,
      beforeSend: function () {
        // todo
      },
      contentType: options.content_type || 'application/json',
      timeout: options.timeout || 20000,
      async: (options.async !== undefined) ? options.async : true,
      data: options.data || {},
      headers: options.headers,
      complete: function () {
        // todo
      },
      success: function (result) {
        layer.closeAll('loading')
        if (result) {
          if (result.error_code || result.error_code === '') {
            if (options.failure) {
              options.failure(result)
            }
          } else {
            if (options.callback) {
              options.callback(result)
            }
          }
        } else {
          if (options.callback) {
            options.callback(result)
          }
        }
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        layer.closeAll('loading')
        if (options.hideLayer) {
          layer.closeAll()
        }
        if (XMLHttpRequest.status === 500 || XMLHttpRequest.status === 401) {
          var obj = JSON.parse(XMLHttpRequest.responseText)
          if (obj.code === '10000') {
            if (options.failure) {
              options.failure(obj)
            } else {
              layer.open({
                type: 1,
                title: 'Reminder',
                area: ['480px', ''],
                shadeClose: true, // 点击遮罩关闭
                content: '<div class="am-msg-h3 msg-h3-fail">' +
                            '<div class="inner">系统异常，请稍后再试！</div>' +
                          '</div>'
              })
            }
          } else if (obj.code === '10007') {
            common.tipMsg('请重新登录！', 2000, function () {
              if (options.logout) {
                common.relogin()
              }
            })
          } else {
            if (options.failure) {
              options.failure(obj)
            } else {
              common.tipMsg(obj.message)
            }
          }
        } else {
          if (options.failure) {
            options.failure(obj)
          } else {
            layer.closeAll()
            layer.open({
              type: 1,
              title: 'Reminder',
              area: ['480px', ''],
              shadeClose: true, // 点击遮罩关闭
              content: '<div class="am-msg-h3 msg-h3-fail">' +
                        '<div class="inner">调用数据失败，请稍后再试！</div>' +
                      '</div>'
            })
          }
        }
      }
    })
  },
  /**
   * 根据年月日显示年龄  1岁以下显示几个月 几天  以上显示 几岁几月
   * @param y
   * @param m
   * @param d
   */
  showAge: function (str, args, args2) {
    if (str === '0') {
      if (args === '0') {
        return args2 + '天'
      } else {
        return args + '个月' + args2 + '天'
      }
    } else if (str > 0 && str <= 13) {
      if (args === '0' && args2 !== '0') {
        return str + '岁' + args2 + '天'
      } else if (args === '0' && args2 === '0') {
        return str + '岁'
      } else {
        return str + '岁' + args + '个月'
      }
    } else if (str > 13) {
      return str + '岁'
    } else {
      return '未知'
    }
  },
  /**
   * [getAnotherDay 获取距离某个日期的指定类型的某一天]
   * @param  {[type]} type     [类型]
   * @param  {[type]} num      [差值]
   * @param  {[type]} isFormat [是否需要格式化]
   * @param  {[Date]} startDay [指定日期]
   * @return {[type]}          [description]
   * getAnotherDay('date', -1, true) 获取昨天+格式化
   */
  getAnotherDay: function (type, num, isFormat, startDay) {
    var _day = startDay || new Date()
    switch (type) {
      case 'year':
        _day = _day.setFullYear(_day.getFullYear() + num)
        break
      case 'month':
        _day = _day.setMonth(_day.getMonth() + num)
        break
      case 'date':
        _day = _day.setDate(_day.getDate() + num)
        break
      case 'hour':
        _day = _day.setHours(_day.getHours() + num)
        // _day = new Date(_day+num*60*60*1000);
        break
    }
    _day = new Date(_day)
    return !isFormat ? _day : _day.format('yyyy-MM-dd')
  },
  getPlatformUrl: function () {
    var platformUrl = common.getUrlParam('platformUrl') || common.getLocalStorage('PAT_platformUrl')
    return decodeURIComponent(platformUrl)
  },
  // 获取当前应用appCode
  getAppCode: function () {
    var appCode = ''
    var locationUrl = window.location.href
    if (locationUrl.indexOf('/pageThird') > -1) {
      appCode = common.queryParam('appCode_t')
    } else {
      appCode = common.queryParam('appCode')
    }
    return appCode
  },
  getLoginId: function () {
    var loginId = common.getLocalStorage('PAT_loginId')
    return decodeURIComponent(loginId)
  },
  relogin: function (transFunParam) {
    var iframeMessage = {
      logout: true // 是否退出登录
    }
    var pageFrom = common.getUrlParam('pageFrom')
    if (pageFrom) {
      window.parent.postMessage(iframeMessage, '*')
    } else {
      common.removeLocalStorage(['PAT_loginId', 'PAT_loginName', 'PAT_staffName', 'PAT_token', 'PAT_organCode', 'PAT_token_p'])
      window.sessionStorage.removeItem('curTabId')
      window.sessionStorage.removeItem('tabs')
      window.location.href = common.getPlatformUrl() + '/#/login'
    }
  },
  getPatientSourceType: function () {
    var appCode = common.getAppCode()
    var sourceType = {
      'patientinfo': 'IH',
      'emergencyNursing': 'ET'
    }
    return sourceType[appCode]
  },
  setUserInfo: function () {
    common.setLocalStorage('PAT_organCode', common.getUrlParam('organCode'))
    var token = common.getUrlParam('token')
    var url = window.location.href
    if (url.indexOf('/pageThird') > -1) {
      common.saveParam('appCode_t', common.getUrlParam('appCode'))
      common.saveParam('category_t', common.getUrlParam('category'))
      common.saveParam('pageFrom_t', common.getUrlParam('pageFrom'))
      // 2018.11.21 庄永贝提出规则：三方调阅 住院可用patientid和mrn取病人信息 急诊只用mrn取病人信息
      if (common.queryParam('appCode_t') === 'patientinfo') {
        common.saveParam('patientId_t', common.getUrlParam('patientId'), true)
      } else {
        common.saveParam('patientId_t', '', true)
      }
      common.saveParam('mrn_t', common.getUrlParam('mrn'), true)
      // 定制的接口先去除
      common.ajax({
        url: 'common-service/token/third/generate',
        dataType: 'json',
        type: 'get',
        async: false,
        token: false,
        callback: function (data) {
          if (data && data.access_token) {
            common.saveParam('token_t', data.access_token)
          }
        }
      })
      if (common.queryParam('mrn_t') || common.queryParam('patientId_t')) {
        var patientParam = {
          organCode: common.getOrganCode(),
          sourceType: 'IH',
          mrn: common.queryParam('mrn_t'),
          wardCode: common.getUrlParam('wardCode')
        }
        // 2018.11.21 庄永贝提出规则：三方调阅 住院可用patientid和mrn取病人信息 急诊只用mrn取病人信息
        if (common.queryParam('appCode_t') === 'patientinfo' && common.queryParam('patientId_t')) {
          patientParam.patientId = common.queryParam('patientId_t')
        }
        common.ajax({
          url: 'baseinfo2.0/allType/patients',
          dataType: 'json',
          type: 'get',
          async: false,
          data: patientParam,
          callback: function (data) {
            if (data && data.length > 0) {
              common.saveParam('patIndexNo_t', data[0].patIndexNo)
            } else {
              common.saveParam('patIndexNo_t', '', true)
            }
          },
          failure: function () {
            common.saveParam('patIndexNo_t', '', true)
          }
        })
      } else {
        common.saveParam('patIndexNo_t', '', true)
        common.tip_msg('请先传入病人信息！')
      }
    } else {
      if (token !== '') {
        common.setLocalStorage('PAT_token', token)
        common.ajax({
          url: 'common-service/user/userdetail',
          dataType: 'json',
          type: 'get',
          async: false,
          callback: function (data) {
            common.setLocalStorage('PAT_loginId', data.loginId)
            common.setLocalStorage('PAT_loginName', data.loginName)
            common.setLocalStorage('PAT_staffName', data.staffName)
            common.setLocalStorage('PAT_organCode', data.organCode)
          }
        })
      }
    }
  },
  /**
   * 查询参数 方法封装
   * @param {string} paramName 要获取的参数名
   * @returns {string} param 参数值
   */
  queryParam: function (paramName) {
    var param = common.getUrlParam(paramName) || common.getLocalStorage('PAT_' + paramName)
    return param
  },
  /**
   * 存储参数
   * @param {string} 参数名
   * @param {string} 参数值
   * @param {string} 是否允许为空 默认为不允许
   */
  saveParam: function (paramName, paramValue, isAllowNull) {
    // 不允许为空时，判断参数值有值时再存储
    if (!isAllowNull) {
      if (paramValue) {
        common.setLocalStorage('PAT_' + paramName, paramValue)
      }
    } else { // 允许为空时，直接存储参数值
      common.setLocalStorage('PAT_' + paramName, paramValue)
    }
  },
  removeParam: function (paramName) {
    common.removeLocalStorage('PAT_' + paramName)
  },
  /**
   * 从URL上获取参数对应值
   * @param {string} name 参数名
   */
  getUrlParam: function (name) {
    var result = ''
    var url = window.location.href
    if (url.indexOf('?') > -1) {
      var param = url.substring(url.indexOf('?') + 1)
      name += '='
      if (param.indexOf(name) > -1) {
        var r = param.substr(param.indexOf(name) + name.length)
        if (r.indexOf('&') !== -1) {
          r = r.substring(0, r.indexOf('&'))
        }
        result = r
      }
    }
    return result
  },
  /**
   * 查询病人信息
   * @param {object} options 参数对象
   */
  queryPatientInfo: function (options) {
    var option = {
      url: 'patientinfo-service/patients/info/original',
      dataType: 'json',
      type: 'get'
    }

    $.extend(option, options)
    option.data = option.data || {}
    option.data.organCode = common.getOrganCode()
    common.ajax(option)
  },
  /**
   * 日期字符串转日期 此方法仅适用于dd/MM/yyyy类型日期转换
   * @param {string} dateStr 日期字符串
   */
  strToDate: function (dateStr) {
    if (dateStr) {
      var dateFull = []
      if (dateStr.indexOf(' ') > -1) {
        dateFull = dateStr.split(' ')
      } else {
        dateFull = [dateStr]
      }
      var strArray = dateFull[0].split('/')
      dateStr = strArray.reverse().join('/')
      if (dateFull.length > 1) {
        dateStr += ' ' + dateFull[1]
      }
      return new Date(dateStr)
    }
  },
  getOrganCode: function () {
    var organCode = common.getLocalStorage('PAT_organCode')
    if (!organCode) {
      common.ajax({
        url: 'common-service/user/userdetail',
        dataType: 'json',
        type: 'get',
        async: false,
        callback: function (data) {
          organCode = data.organCode
          common.setLocalStorage('PAT_organCode', organCode)
        }
      })
    }

    return organCode
  },
  // 获取token信息
  getToken: function () {
    var token = ''
    var locationUrl = window.location.href
    if (locationUrl.indexOf('/pageThird') > -1) {
      token = common.queryParam('token_t')
    } else {
      token = common.getLocalStorage('PAT_token')
    }
    return token
  },
  pagination: function (options) {
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
  /**
   * 获取obj的长度
   * @param obj
   * @returns {*}
   */
  $getLength: function (obj) {
    var len = 0
    // eslint-disable-next-line
    for (var i in obj) {
      len++
    }
    return len
  },
  // 查询全院科室列表
  queryAllWards: function () {
    return new Promise((resolve, reject) => {
      common.ajax({
        url: 'sys-service/sys/v1/units',
        type: 'get',
        async: false,
        dataType: 'json',
        data: {
          organCode: common.getOrganCode()
        },
        callback: (result) => {
          var wardList = []
          for (var ward in result) {
            wardList = wardList.concat(result[ward])
          }
          console.log(wardList)
          resolve(wardList)
        }
      })
    })
  },
  /**
   * 根据护理等级返回对应的等级标志和样式名
   * @param {string} nursingClass 护理等级值
   * @param {number} type 类型
   */
  showNursingClass: function (nursingClass, type) {
    var nursingInfo = {}
    if (nursingClass === '0') {
      nursingInfo.name = '特级护理'
      nursingInfo.simpleName = '特'
      nursingInfo.className = ['card-nurse-second', 'txt-type-staging-4', 'txt-plain-type-staging-4'][type]
    } else if (nursingClass === '1') {
      nursingInfo.name = '一级护理'
      nursingInfo.simpleName = 'I'
      nursingInfo.className = ['card-nurse-premium', 'txt-type-staging-1', 'txt-plain-type-staging-1'][type]
    } else if (nursingClass === '2') {
      nursingInfo.name = '二级护理'
      nursingInfo.simpleName = 'II'
      nursingInfo.className = ['card-nurse-third', 'txt-type-staging-2', 'txt-plain-type-staging-2'][type]
    } else if (nursingClass === '3') {
      nursingInfo.name = '三级护理'
      nursingInfo.simpleName = 'III'
      nursingInfo.className = ['card-nurse-first', 'txt-type-staging-3', 'txt-plain-type-staging-3'][type]
    } else {
      nursingInfo.name = ''
      nursingInfo.simpleName = ''
      nursingInfo.className = ['card-nurse-default', 'txt-type-staging-3', 'txt-plain-type-staging-3'][type]
    }
    return nursingInfo
  },
  /**
   * 根据性别code展示对应性别名称和样式
   * @param {string} sexCode 性别code
   */
  showSex: function (sexCode) {
    var sexInfo = {}
    if (sexCode === '1') {
      sexInfo.name = '男'
      sexInfo.className = 'i-sex-male'
    } else if (sexCode === '2') {
      sexInfo.name = '女'
      sexInfo.className = 'i-sex-female'
    } else {
      sexInfo.name = '未知'
      sexInfo.className = 'i-sex-unknow'
    }
    return sexInfo
  },
  /**
   * 根据护理等级展示不同床号样式
   * @param {string} nursingClass 护理等级
   */
  showBedNo: function (nursingClass) {
    var bedNo = {}
    if (nursingClass === '0') {
      bedNo.className = 'flag-staging-4c'
    } else if (nursingClass === '1') {
      bedNo.className = 'flag-staging-1c'
    } else if (nursingClass === '2') {
      bedNo.className = 'flag-staging-2c'
    } else if (nursingClass === '3') {
      bedNo.className = 'flag-staging-3c'
    }
    return bedNo
  },
  /**
   * 根据病人入院时间计算入院天数
   * @param {string} admissionTime 入院时间
   */
  showInDays: function (admissionTime) {
    var nowDate = new Date()
    var inTime = new Date(admissionTime)
    var time = nowDate.getTime() - inTime.getTime()
    var day = Math.ceil(time / (24 * 3600 * 1000))
    day = day < 1 ? 1 : day
    return day
  },
  // 获取用户类型
  getUserType: function () {
    var loginId = common.getLoginId()
    var userType = ''
    common.ajax({
      url: 'common-service/user/v1/users/' + loginId + '/userType',
      dataType: 'text',
      type: 'get',
      async: false,
      callback: function (data) {
        userType = data
      }
    })
    // userType="MANAGER";
    return userType
  },
  // 根据cookie判断用户是否登录
  isLogin: function () {
    var flag = false
    var token = ''
    var url = window.location.href
    if (url.indexOf('/pageThird') > -1) {
      token = common.queryParam('token_t')
    } else {
      token = common.getLocalStorage('PAT_token')
    }
    if (!token || token === '') {
      common.tipMsg('请重新登录！', null, function () {
        common.logout()
      })
      flag = false
    } else {
      flag = true
    }
    return flag
  },
  findDocumentHight: function () {
    // // 获取窗口高度
    // if (window.innerHeight) { winHeight = window.innerHeight } else if ((document.body) && (document.body.clientHeight)) { winHeight = document.body.clientHeight }
    // 通过深入Document内部对body进行检测，获取窗口大小
    if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth) {
      return document.documentElement.clientHeight
    } else {
      return 0
    }
  },
  autoHeight: function (el, height) {
    height = height || 20
    var needHeight = common.findDocumentHight() - $(el + ' .cal-scroll-minus').height() - 60 - height // 20是底部留白
    $(el + ' .cal-scroll-need').css('height', needHeight + 'px')
    $(el + ' .iframeContainer').css('height', needHeight + 'px')

    window.onresize = function () {
      var needHeight = common.findDocumentHight() - $(el + ' .cal-scroll-minus').height() - 60 - height // 20是底部留白
      $(el + ' .cal-scroll-need').css('height', needHeight + 'px')
      $(el + ' .iframeContainer').css('height', needHeight + 'px')
    }
  },
  getBtnUrl: function (name) {
    var urls = {
      'firstEva': '/#/firstPg', // 首次评估
      'addEva': '/#/firstPg?mode=again', // 立即评估
      'dayEva': '', // 每日评估
      'workListPat': '/#/taskDetail', // 工作清单-病人
      'workListDep': '/#/taskList'// 工作清单-科室
    }
    var rootUrl = ''
    common.ajax({
      url: 'enr-service/util/domain',
      dataType: 'text',
      type: 'get',
      async: false,
      callback: function (data) {
        rootUrl = data
      }
    })
    if (rootUrl) {
      return rootUrl + urls[name]
    } else {
      return ''
    }
  },
  logout: function (postMessage) {
    // 从第三方界面进入时 退出登录需通知iframe外层容器退出，否则直接退出到登录页
    var pageFrom = common.getUrlParam('pageFrom')
    var iframeMessage = {
      logout: true // 是否退出登录
    }
    if (pageFrom) {
      window.parent.postMessage(iframeMessage, '*')
    } else {
      common.removeLocalStorage(['PAT_loginId', 'PAT_loginName', 'PAT_staffName', 'PAT_token', 'PAT_token_p', 'PAT_organCode'])
      window.sessionStorage.removeItem('curTabId')
      window.sessionStorage.removeItem('tabs')
      window.location.href = common.getPlatformUrl() + '/#/login'
    }
  },
  joinUrl: function (url) {
    var param = 'token=' + common.getLocalStorage('PAT_token_p') + '&organCode=' + common.getOrganCode() + '&platformUrl=' + common.getPlatformUrl() + '&pageFrom=' + common.getAppCode()
    if (common.getUrlParam('patIndexNo')) {
      param += '&patIndexNo=' + common.getUrlParam('patIndexNo')
    }
    if (common.getUrlParam('wardCode')) {
      param += '&wardCode=' + common.getUrlParam('wardCode')
    }
    // var host = window.location.protocol + '//' + window.location.host
    // var transPage = host + common.baseUrl + 'transfer/transfer.html'
    // param += '&transPage=' + transPage + '&transLogoutFun=execFun_logout'
    url += url.indexOf('?') > -1 ? '&' + param : '?' + param
    return url
  },
  joinUrlNew: function (menu, dataInfo) {
    if (dataInfo) {
      dataInfo.loginName = common.getLocalStorage('PAT_loginName')
      dataInfo.staffName = common.getLocalStorage('PAT_staffName_')
      dataInfo.token = window.location.href.indexOf('/pageThird') > -1 ? common.queryParam('token_t') : common.getLocalStorage('PAT_token')
    }
    var url
    // 普通类型菜单 拼接参数
    if (menu.menuUrlType === '1') {
      let param = ''
      // 根据菜单配置参数映射列表进行对应参数拼接
      if (menu.mappingList && menu.mappingList.length > 0 && dataInfo) {
        menu.mappingList.map(function (map) {
          if (map.localColumn in dataInfo && map.paramType === '1') {
            param += (param ? '&' : '') + map.remoteColumn + '=' + dataInfo[map.localColumn]
          } else if (map.paramType === '2') {
            param += (param ? '&' : '') + map.remoteColumn + '=' + map.localColumn
          }
        })
      }
      // 拼接组织机构码参数
      if (param.indexOf('organCode=') === -1 && common.getOrganCode()) {
        param += '&organCode=' + common.getOrganCode()
      }
      // 拼接wardCode参数
      if (param.indexOf('wardCode=') === -1 && common.getUrlParam('wardCode')) {
        param += (param ? '&' : '') + 'wardCode=' + common.getUrlParam('wardCode')
      }
      // // 拼接wardName参数
      // if (param.indexOf('wardName=') === -1 && avalon.vmodels.root.depart_name) {
      //   param += (param ? '&' : '') + 'wardName=' + avalon.vmodels.root.depart_name
      // }
      var locationUrl = window.location.href
      if (locationUrl.indexOf('/pageThird') > -1) {
        // 拼接token参数
        if (param.indexOf('token=') === -1 && common.queryParam('token_t')) {
          param += (param ? '&' : '') + 'token=' + common.queryParam('token_t')
        }
        // 拼接patIndexNo参数
        if (param.indexOf('patIndexNo=') === -1 && common.queryParam('patIndexNo_t')) {
          param += (param ? '&' : '') + 'patIndexNo=' + common.queryParam('patIndexNo_t')
        }
        if (param.indexOf('patientId=') === -1 && common.queryParam('patientId_t')) {
          param += '&patientId=' + common.queryParam('patientId_t')
        }
        if (param.indexOf('series=') === -1 && common.queryParam('series_t')) {
          param += '&series=' + common.queryParam('series_t')
        }
        if (param.indexOf('mrn=') === -1 && common.queryParam('mrn_t')) {
          param += '&mrn=' + common.queryParam('mrn_t')
        }
        if (param.indexOf('pageFrom=') === -1 && common.getAppCode()) {
          param += '&pageFrom=' + common.getAppCode()
        }
      } else {
        // 拼接token参数
        if (param.indexOf('token=') === -1 && common.getLocalStorage('PAT_token')) {
          param += (param ? '&' : '') + 'token=' + common.getLocalStorage('PAT_token')
        }
        // 拼接patIndexNo参数
        if (param.indexOf('patIndexNo=') === -1 && common.getUrlParam('patIndexNo')) {
          param += (param ? '&' : '') + 'patIndexNo=' + common.getUrlParam('patIndexNo')
        }
        // 拼接其余固定参数
        param += '&platformUrl=' + common.getPlatformUrl() + '&pageFrom=' + common.getAppCode()
        // var host = window.location.protocol + '//' + window.location.host
        // var transPage = host + common.baseUrl + 'transfer/transfer.html'
        // param += '&transPage=' + transPage
      }
      url += '&_=' + Math.random()
      url = menu.menuUrl + (menu.menuUrl.indexOf('?') > -1 ? '&' + param : '?' + param)
    } else if (menu.menuUrlType === '2') { // webService类型参数 需请求接口获取菜单URL地址
      let param = {
        'mappingList': menu.mappingList,
        'menuUrl': menu.menuUrl,
        'outputNode': menu.outputNode,
        'map': dataInfo
      }
      common.ajax({
        url: 'common-service/menu/webservice',
        type: 'post',
        dataType: 'text',
        async: false,
        data: JSON.stringify(param),
        callback: function (data) {
          url = data
        }
      })
      url += '&_=' + Math.random()
    } else {
      url = {}
      // 接客户端方法
      if (menu.mappingList && menu.mappingList.length > 0 && dataInfo) {
        menu.mappingList.map(function (map) {
          if (map.localColumn in dataInfo && map.paramType === 1) {
            url[map.remoteColumn] = dataInfo[map.localColumn]
          } else if (map.paramType === 2) {
            url[map.remoteColumn] = map.localColumn
          }
        })
      }
      // url.WardCode= '1220400'
      // url.Patientuid = 'P-277571277571-011'
      url = JSON.stringify(url)
    }
    return url
  },
  getPageUrlNew: function (menus, FMenuId, SMenuId, TMenuId, dataInfo) {
    var urlInfo = {
      pageUrl: '', // url or 客户端入参
      uid: '',
      methodName: '', // 客户端的方法名
      appName: '', // 客户端的应用名
      sceneName: '', // 客户端的应用场景名
      menuUrlType: ''
    }
    if (FMenuId || SMenuId || TMenuId) {
      for (var i = 0; i < menus.length; i++) {
        if (Number(FMenuId) === Number(menus[i].menuId)) {
          if (menus[i].subList && SMenuId) {
            for (var j = 0; j < menus[i].subList.length; j++) {
              if (Number(menus[i].subList[j].menuId) === Number(SMenuId)) {
                if (!TMenuId) {
                  urlInfo.pageUrl = common.joinUrlNew(menus[i].subList[j], dataInfo)
                  urlInfo.uid = menus[i].subList[j].appPatientType
                  urlInfo.methodName = menus[i].subList[j].methodName
                  urlInfo.appName = menus[i].subList[j].appName
                  urlInfo.sceneName = menus[i].subList[j].sceneName
                  urlInfo.menuUrlType = menus[i].subList[j].menuUrlType
                  break
                } else {
                  if (menus[i].subList[j].subList) {
                    for (var m = 0; m < menus[i].subList[j].subList.length; m++) {
                      if (Number(menus[i].subList[j].subList[m].menuId) === Number(TMenuId)) {
                        urlInfo.pageUrl = common.joinUrlNew(menus[i].subList[j].subList[m], dataInfo)
                        urlInfo.uid = menus[i].subList[j].subList[m].appPatientType
                        urlInfo.methodName = menus[i].subList[j].methodName
                        urlInfo.appName = menus[i].subList[j].appName
                        urlInfo.sceneName = menus[i].subList[j].sceneName
                        urlInfo.menuUrlType = menus[i].subList[j].menuUrlType
                        break
                      }
                    }
                  }
                }
              }
            }
          } else if (menus[i].menuUrl || menus[i].menuUrlType === '3') {
            urlInfo.pageUrl = common.joinUrlNew(menus[i], dataInfo)
            urlInfo.uid = menus[i].appPatientType
            urlInfo.methodName = menus[i].methodName
            urlInfo.appName = menus[i].appName
            urlInfo.sceneName = menus[i].sceneName
            urlInfo.menuUrlType = menus[i].menuUrlType
          }
          break
        }
      }
    } else {
      if (menus.length > 0) {
        var menu = menus[0]
        if (menu.subList && menu.subList.length > 0) {
          urlInfo.pageUrl = common.joinUrlNew(menu.subList[0], dataInfo)
          urlInfo.uid = menu.subList[0].appPatientType
          urlInfo.methodName = menu.subList[0].methodName
          urlInfo.appName = menu.subList[0].appName
          urlInfo.sceneName = menu.subList[0].sceneName
          urlInfo.menuUrlType = menu.subList[0].menuUrlType
        }
      }
    }
    return urlInfo
  },
  queryAccessAppsFromPatient: function () {
    var appList = {
      appList: [],
      accessApps: {}
    }
    common.ajax({
      url: 'patientinfo-service/template/query/app',
      dataType: 'json',
      type: 'get',
      data: {
        'organCode': common.getOrganCode(),
        'appType': 'pc'
      },
      async: false,
      callback: function (data) {
        appList.appList = data
        for (var i = 0; i < data.length; i++) {
          appList.accessApps[data[i].appCode] = true
        }
      }
    })
    return appList
  },
  /**
   * 根据年龄字符串 计算年龄对应字段信息
   * @param {string} age 年龄
   * @returns {object} year-岁 month-月 day-天 age-完整年龄展示
   */
  calculateAge: function (age) {
    // 年龄信息
    var ageInfo = {
      year: '0', // 岁
      month: '0', // 月
      day: '0', // 天
      age: '' // 完整年龄展示
    }
    // 年龄为空时 认为成年人
    if (!age) {
      ageInfo.year = '0'
      ageInfo.age = '0岁'
      return ageInfo
    }
    // 将字符串中所有「个」替换为空
    age = age.replace(/个/g, '')
    // 年字符串所在位置
    var yearFlag = age.indexOf('岁')
    // 月字符串所在位置
    var monthFlag = age.indexOf('月')
    // 天字符串所在位置
    var dayFlag = age.indexOf('天')
    // 截取年字符串后内容
    var yearEnd = age.substring(yearFlag + 1, age.length)
    // 截取月字符串后内容
    var monthEnd = age.substring(monthFlag + 1, age.length)

    // 年龄字符为纯数字或者只含有岁字符时 认为年龄为X岁 示例：X、X岁
    if ((yearFlag === -1 && monthFlag === -1 && dayFlag === -1) || (yearFlag > -1 && monthFlag === -1 && dayFlag === -1 && !yearEnd)) {
      ageInfo.year = yearFlag > -1 ? age.substring(0, yearFlag) : age

      ageInfo.age = ageInfo.year + '岁'
      return ageInfo
    }
    // 年龄字符同时含有岁和月字符或者只含有岁字符但是岁字符后面还有数字时 认为年龄为X岁X月 示例：X岁X月 X岁X
    if ((yearFlag > -1 && monthFlag > -1 && dayFlag === -1 && !monthEnd) || (yearFlag > -1 && monthFlag === -1 && dayFlag === -1 && yearEnd)) {
      ageInfo.year = age.substring(0, yearFlag)
      ageInfo.month = monthFlag > -1 ? age.substring(yearFlag + 1, monthFlag) : yearEnd

      ageInfo.age = ageInfo.year + '岁' + ageInfo.month + '个月'
      return ageInfo
    }
    // 年龄字符同时含有岁和天字符时 认为年龄为X岁X天 示例：X岁X天
    if (yearFlag > -1 && monthFlag === -1 && dayFlag > -1) {
      ageInfo.year = age.substring(0, yearFlag)
      ageInfo.month = '0'
      ageInfo.day = age.substring(yearFlag + 1, dayFlag)

      ageInfo.age = ageInfo.year + '岁' + ageInfo.day + '天'
      return ageInfo
    }
    // 年龄字符同时含有岁、月、天字符或者只含有岁、月字符但是月字符后面还有数字时 认为年龄为X岁X月X天 示例：X岁X月X天 X岁X月X
    if ((yearFlag > -1 && monthFlag > -1 && dayFlag > -1) || (yearFlag > -1 && monthFlag > -1 && dayFlag === -1 && monthEnd)) {
      ageInfo.year = age.substring(0, yearFlag)
      ageInfo.month = age.substring(yearFlag + 1, monthFlag)
      ageInfo.day = dayFlag > -1 ? age.substring(monthFlag + 1, dayFlag) : monthEnd

      ageInfo.age = ageInfo.year + '岁' + ageInfo.month + '个月' + ageInfo.day + '天'
      return ageInfo
    }
    // 年龄字符只含有月字符时 认为年龄为0岁X个月 示例：X月
    if (yearFlag === -1 && monthFlag > -1 && dayFlag === -1 && !monthEnd) {
      ageInfo.year = '0'
      ageInfo.month = age.substring(0, monthFlag)

      ageInfo.age = ageInfo.month + '个月'
      return ageInfo
    }
    // 年龄字符同时含有月和天字符或者只含有月字符但是月字符后面还有数字时 认为年龄为X月X天 示例：X月X天 X月X
    if ((yearFlag === -1 && monthFlag > -1 && dayFlag > -1) || (yearFlag === -1 && monthFlag > -1 && dayFlag === -1 && monthEnd)) {
      ageInfo.year = '0'
      ageInfo.month = age.substring(0, monthFlag)
      ageInfo.day = dayFlag > -1 ? age.substring(monthFlag + 1, dayFlag) : monthEnd

      ageInfo.age = ageInfo.month + '个月' + ageInfo.day + '天'
      return ageInfo
    }
    // 年龄字符只含有天字符时 认为年龄为0岁0个月X天
    if (yearFlag === -1 && monthFlag === -1 && dayFlag > -1) {
      ageInfo.year = '0'
      ageInfo.month = '0'
      ageInfo.day = age.substring(0, dayFlag)

      ageInfo.age = ageInfo.day + '天'
      return ageInfo
    }

    return ageInfo
  },
  // 查询腕带打印模板
  queryPrintTemplete: function (wardCode, data) {
    var printTemplete = {}
    var that = this
    common.ajax({
      url: 'common-service/config/template/client',
      type: 'get',
      dataType: 'json',
      async: false,
      data: {
        'wardCode': wardCode,
        'printerConfig': 'inpatientWristbandPrinter'
      },
      callback: function (result) {
        // result = []
        if (result && result.length > 0) {
          // eslint-disable-next-line
          var datas = $.extend({}, data)
          datas.age = that.calculateAge(data.ageHis).year
          // console.log('datas', datas)
          var templateInfo = ''
          for (var i = 0; i < result.length; i++) {
            var expression = ''
            for (var j = 0; j < result[i].labelRules.length; j++) {
              if (result[i].labelRules[j].dataBinding) {
                expression += expression ? '&' : ''
                expression += 'datas.' + result[i].labelRules[j].dataBinding + (result[i].labelRules[j].compareSymbol === '=' ? '==' : result[i].labelRules[j].compareSymbol)
                if (result[i].labelRules[j].dataType === 'string') {
                  expression += '"' + result[i].labelRules[j].value + '"'
                }
              }
            }
            // eslint-disable-next-line
            if (expression && eval(expression)) {
              templateInfo = result[i]
              break
            }
          }
          printTemplete = {
            printerName: templateInfo.printerConfig,
            printerType: templateInfo.printerModel,
            displayXml: templateInfo.displayXML
          }
          console.log(printTemplete)
        } else {
          printTemplete = {}
          common.tipMsg('请先配置打印模板！')
        }
      }
    })
    return printTemplete
  },
  // 切换界面提示
  pageSwitchConfirm: function (confirmFun, cancleFun) {
    if (window.iframeMessage && (window.iframeMessage.isRemind === true || window.iframeMessage.isRemind === 'true')) {
      common.confirm_g(confirmFun, cancleFun, window.iframeMessage.remindMsg || '您有数据未保存，是否确定直接离开？')
    } else if (confirmFun) {
      confirmFun()
    }
  },
  /**
   * 查询数据规则
   * @param {array} ruleName 要查询的数据规则code列表
   * @returns {object} ruleList 所查询数据规则值集合
   */
  queryRuleList: function (ruleName, callbackFun) {
    var ruleList = {}
    ruleName = ruleName || []
    common.ajax({
      url: 'baseinfo2.0/rule/getList',
      dataType: 'json',
      type: 'get',
      data: {
        organCode: common.getOrganCode(),
        ruleNameList: ruleName.toString()
      },
      callback: function (data) {
        if (data && data.length > 0) {
          data.map(function (rule) {
            ruleList[rule.ruleName] = rule.rule
          })
        }

        if (callbackFun) {
          callbackFun(ruleList)
        }
      }
    })
    // return ruleList
  },
  /**
   * 根据时间规则查询新病人和新医嘱对应时间范围
   * @param {object} ruleList 时间规则
   * @returns {object} timeInfo 计算得到时间范围信息
   */
  queryTimeCondition: function (ruleList) {
    var timeInfo = {}
    // 默认按照配置规则获取新病人入院时间开始范围
    if (ruleList.newPatient) {
      // 如果配置规则为0 默认从当天0点开始查询
      if (ruleList.newPatient === '0') {
        timeInfo.admissionBeginTime = new Date().format('yyyy-MM-dd') + ' 00:00:00'
      } else {
        // 配置规则不为0时 按照配置规则时间往前推
        let hour = -parseInt(ruleList.newPatient)
        timeInfo.admissionBeginTime = common.getAnotherDay('hour', hour, false).format('yyyy-MM-dd hh:mm:ss')
      }
    } else {
      // 不配置规则时 默认取24小时内新病人
      timeInfo.admissionBeginTime = common.getAnotherDay('hour', -24, false).format('yyyy-MM-dd hh:mm:ss')
    }
    if (ruleList.newOrder) {
      // 如果配置规则为0 默认从当天0点开始查询
      if (ruleList.newOrder === '0') {
        timeInfo.enterBeginTime = new Date().format('yyyy-MM-dd') + ' 00:00:00'
      } else {
        // 配置规则不为0时 按照配置规则时间往前推
        let hour = -parseInt(ruleList.newOrder)
        timeInfo.enterBeginTime = common.getAnotherDay('hour', hour, false).format('yyyy-MM-dd hh:mm:ss')
      }
    } else {
      // 不配置规则时 默认取4小时内新医嘱
      timeInfo.enterBeginTime = common.getAnotherDay('hour', -4, false).format('yyyy-MM-dd hh:mm:ss')
    }
    // 结束时间默认取当前系统时间
    timeInfo.endTime = new Date().format('yyyy-MM-dd hh:mm:ss')
    return timeInfo
  },
  /**
   * 查询常量值
   * @param {string} constantType 查询常量key值
   * @param {bool} async 是否异步查询
   * @param {function} callbackFun 执行回调方法
   */
  queryConstants: function (constantType, async, callbackFun) {
    var param = {
      organCode: common.getOrganCode(),
      constantTypeList: constantType.toString()
    }
    common.ajax({
      url: 'patientinfo-service/dict/constant/batch',
      dataType: 'json',
      type: 'get',
      data: param,
      async: async,
      callback: function (data) {
        if (callbackFun) {
          callbackFun(data)
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
    var classInfo = {
      '3': {
        className: 'wy-auxiliary-success',
        btnName: '通知'
      },
      '0': {
        className: 'wy-auxiliary-primary',
        btnName: '评估'
      },
      '1': {
        className: 'wy-auxiliary-warn',
        btnName: '执行'
      },
      '2': {
        className: 'wy-auxiliary-danger',
        btnName: '宣教'
      }
    }
    if (classInfo[classCode]) {
      return classInfo[classCode]
    }
    return {
      className: 'wy-auxiliary-success',
      btnName: '查看'
    }
  },
  /**
   * 提示弹窗
   * @param {*} msg 提示语
   * @param {*} time 弹窗消失时间
   * @param {*} callbackFun 弹窗关闭回调方法
   */
  tip_msg: function (msg, time, callbackFun) {
    layer.msg(msg || '操作成功！', {
      time: time || 1000,
      offset: '20px'
    }, function () {
      if (callbackFun) {
        callbackFun()
      }
    })
  },
  // 获取localstorage
  getLocalStorage: function (name) {
    return window.localStorage.getItem(name) ? window.localStorage.getItem(name) : ''
  },
  // 设置localstorage
  setLocalStorage: function (name, value) {
    window.localStorage.setItem(name, value)
  },
  // 移除localstorage
  removeLocalStorage: function (names) {
    for (var i = 0; i < names.length; i++) {
      window.localStorage.removeItem(names[i])
    }
  },
  // JavaScript Document
  loadjscssfile (filename, filetype) {
    var fileref
    if (filetype === 'js') {
      fileref = document.createElement('script')
      fileref.setAttribute('type', 'text/javascript')
      fileref.setAttribute('src', filename)
    } else if (filetype === 'css') {
      fileref = document.createElement('link')
      fileref.setAttribute('rel', 'stylesheet')
      fileref.setAttribute('type', 'text/css')
      fileref.setAttribute('href', filename)
    }
    if (typeof fileref !== 'undefined') {
      document.getElementsByTagName('head')[0].appendChild(fileref)
    }
  }
}

export default common
