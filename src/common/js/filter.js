import Vue from 'vue'
import common from './common'

const indays = function (val) {
  if (val) {
    let list = val.split(' ')
    let date = list[0].split('-')
    let time = list[1].split(':')

    let y = parseInt(date[0])
    let m = parseInt(date[1] - 1)
    let d = parseInt(date[2])

    let h = parseInt(time[0])
    let min = parseInt(time[1])
    let s = parseInt(time[2])

    let inTime = new Date(y, m, d, h, min, s)
    let time_ = new Date().getTime() - inTime.getTime()
    let day = Math.ceil(time_ / (24 * 3600 * 1000))
    day = day < 1 ? 1 : day
    return day
  }
  return '--'
}

/**
 * 根据年月日显示年龄  1岁以下显示几个月 几天  以上显示 几岁几月
 * @param y
 * @param m
 * @param d
 */
Vue.filter('showAge', (y, m, d) => {
  if (y === 0) {
    if (m === 0) {
      return d + 'd'
    } else {
      return m + 'm' + d + 'd'
    }
  } else if (y > 0 && y <= 13) {
    if (m === 0 && d !== 0) {
      return y + 'y' + d + 'd'
    } else if (m === 0 && d === 0) {
      return y + 'y'
    } else {
      return y + 'y' + m + 'm'
    }
  } else if (y > 13) {
    return y + 'y'
  } else {
    return 'unkonwn'
  }
})

/**
 * 根据入院时间获取入院天数
 * @admissionTime
 */
Vue.filter('indays', (admissionTime) => {
  return indays(admissionTime)
})

/**
 * 格式化日期 需以yyyy-MM-dd hh:mm:ss格式传入
 * @param y
 * @param m
 * @param d
 */
Vue.filter('date', (date, type) => {
  if (date) {
    date = date.toString()
    let time = ''
    if (date.indexOf('-') > -1 || date.indexOf(':') > -1) {
      let list = date.split(' ')
      if (list.length > 0) {
        let dates = list[0].split('-')
        let times = []
        if (list[1]) {
          times = list[1].split(':')
        }

        let y = parseInt(dates[0])
        let m = parseInt(dates[1] - 1)
        let d = parseInt(dates[2])

        if (times.length > 0) {
          let h = parseInt(times[0])
          let min = parseInt(times[1])
          let s = parseInt(times[2])
          time = new Date(y, m, d, h, min, s)
        } else {
          time = new Date(y, m, d)
        }
      }
    } else {
      date = parseInt(date)
      time = new Date(date)
    }
    return time.format(type)
  }
})

/**
 * 显示性别
 * @param y
 * @param m
 * @param d
 */
Vue.filter('showSex', (str, args, args2) => {
  // str为管道符之前计算得到的结果，默认框架会帮你传入，此方法必须返回一个值
  if (str === '1') {
    return 'M'
  } else if (str === '2') {
    return 'F'
  } else {
    return 'unknown'
  }
})
Vue.filter('calculateAge', (str) => {
  return common.calculateAge(str).age
})
