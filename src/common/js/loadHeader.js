/**
 * @file 加载平台header 2017-12-20
 * @author lutingting(lutingting@ewell.cc)
 */
import common from '@/common/js/common'

const loadHeader = () => {
  // 引入头部header
  let platformUrl = common.getPlatformUrl()
  let appCode = common.getAppCode('appCode')
  common.setLocalStorage('PAT_platformUrl', platformUrl)
  common.setLocalStorage('PAT_appCode', appCode)
  if ($('body').find('.platform-header').length === 0) {
    $.getScript(platformUrl + '/static/js/header/header.js', function () {
      if ($('body').find('.platform-header').length === 0) {
        $('body').initHeader()
      }
    })
  }

  // icon URL改为从平台引入
  $('link[type="image/x-icon"]').each(function () {
    $(this).attr('href', platformUrl + '/static/images/default/favicon.ico')
    $(this).attr('mce_href', platformUrl + '/static/images/default/favicon.ico')
  })
  common.removeLocalStorage(['PAT_pageFrom', 'PAT_transPage', 'PAT_transFun'])

  let token = common.getUrlParam('token') || common.getLocalStorage('PAT_token')
  if (token !== '') {
    common.setLocalStorage('PAT_token', token)
    common.ajax({
      url: 'common-service/user/userdetail',
      dataType: 'json',
      type: 'get',
      async: false,
      callback: function (data) {
        common.setLocalStorage('PAT_loginId', data.loginId)
        common.setLocalStorage('PAT_organCode', data.organCode)
        common.setLocalStorage('PAT_userType', data.userType)
        common.setLocalStorage('PAT_loginName', data.loginName)
        common.setLocalStorage('PAT_staffName', data.staffName)
      }
    })
  } else {
    common.tip_msg('请重新登录!', 2000, () => {
      window.location.href = common.getPlatformUrl() + '/#/login'
    })
  }
}

export default loadHeader
