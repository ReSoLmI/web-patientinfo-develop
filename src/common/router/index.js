// 病区-首页
const wardIndex = resolve => {
  require.ensure(['../../views/ward/inPatient/wardIndex.vue'], () => {
    resolve(require('../../views/ward/inPatient/wardIndex.vue'))
  })
}
// 病区-病人列表
const patientList = resolve => {
  require.ensure(['../../views/ward/inPatient/patientList.vue'], () => {
    resolve(require('../../views/ward/inPatient/patientList.vue'))
  })
}
// 病区-护理巡视
const nursingTour = resolve => {
  require.ensure(['../../views/ward/inPatient/nursingTour.vue'], () => {
    resolve(require('../../views/ward/inPatient/nursingTour.vue'))
  })
}
// 病区-病房巡视
const wardTour = resolve => {
  require.ensure(['../../views/ward/inPatient/wardTour.vue'], () => {
    resolve(require('../../views/ward/inPatient/wardTour.vue'))
  })
}
// 病区-待办
const backlog = resolve => {
  require.ensure(['../../views/ward/inPatient/backlog.vue'], () => {
    resolve(require('../../views/ward/inPatient/backlog.vue'))
  })
}
// 病人-患者详情首页
const patientIndex = resolve => {
  require.ensure(['../../views/patient/inPatient/patientIndex.vue'], () => {
    resolve(require('../../views/patient/inPatient/patientIndex.vue'))
  })
}
// 病人-第三方
const pageThird = resolve => {
  require.ensure(['../../views/patient/inPatient/pageThird.vue'], () => {
    resolve(require('../../views/patient/inPatient/pageThird.vue'))
  })
}
// 病人-患者信息详情
const patientInfo = resolve => {
  require.ensure(['../../views/patient/inPatient/patientInfo.vue'], () => {
    resolve(require('../../views/patient/inPatient/patientInfo.vue'))
  })
}
// 病人-过敏信息配置
const allery = resolve => {
  require.ensure(['../../views/patient/inPatient/allery.vue'], () => {
    resolve(require('../../views/patient/inPatient/allery.vue'))
  })
}
// 客户端
const popWard = resolve => {
  require.ensure(['../../views/popPage/popWard.vue'], () => {
    resolve(require('../../views/popPage/popWard.vue'))
  })
}
// 病人列表弹框--供和客户端打开
const patientListPop = resolve => {
  require.ensure(['../../views/popPage/patientList.vue'], () => {
    resolve(require('../../views/popPage/patientList.vue'))
  })
}
// 住院待办
const backlogSet = resolve => {
  require.ensure(['../../views/setting/backlogSet.vue'], () => {
    resolve(require('../../views/setting/backlogSet.vue'))
  })
}
// 住院待办
const pageIndex = resolve => {
  require.ensure(['../../views/setting/pageIndex.vue'], () => {
    resolve(require('../../views/setting/pageIndex.vue'))
  })
}
// 出院患者配置
const caseConfig = resolve => {
  require.ensure(['../../views/ward/discharged/caseFile/caseConfig.vue'], () => {
    resolve(require('../../views/ward/discharged/caseFile/caseConfig.vue'))
  })
}
// 出院患者归档弹框
const caseLayer = resolve => {
  require.ensure(['../../views/ward/discharged/caseFile/caseLayer.vue'], () => {
    resolve(require('../../views/ward/discharged/caseFile/caseLayer.vue'))
  })
}
// 出院患者列表
const patientsListD = resolve => {
  require.ensure(['../../views/ward/discharged/patientsList.vue'], () => {
    resolve(require('../../views/ward/discharged/patientsList.vue'))
  })
}
// 出院患者详情
const patientviewD = resolve => {
  require.ensure(['../../views/patient/discharged/patientview.vue'], () => {
    resolve(require('../../views/patient/discharged/patientview.vue'))
  })
}
// 住院入口
const inpatient = resolve => {
  require.ensure(['../../views/inpatient.vue'], () => {
    resolve(require('../../views/inpatient.vue'))
  })
}
// 出院入口
const discharged = resolve => {
  require.ensure(['../../views/discharged.vue'], () => {
    resolve(require('../../views/discharged.vue'))
  })
}
// 转科入口
const transfered = resolve => {
  require.ensure(['../../views/transfered.vue'], () => {
    resolve(require('../../views/transfered.vue'))
  })
}
// 转科患者列表
const patientsListT = resolve => {
  require.ensure(['../../views/ward/transfered/patientsList.vue'], () => {
    resolve(require('../../views/ward/transfered/patientsList.vue'))
  })
}
// 转科患者详情
const patientviewT = resolve => {
  require.ensure(['../../views/patient/transfered/patientview.vue'], () => {
    resolve(require('../../views/patient/transfered/patientview.vue'))
  })
}
const routers = [{
  path: '/inpatient',
  name: 'inpatient',
  component: inpatient,
  children: [{
    path: 'ward/wardIndex',
    name: 'wardIndex',
    component: wardIndex
  }, {
    path: 'ward/patientList',
    name: 'patientList',
    component: patientList
  }, {
    path: 'ward/nursingTour',
    name: 'nursingTour',
    component: nursingTour
  }, {
    path: 'ward/wardTour',
    name: 'wardTour',
    component: wardTour
  }, {
    path: 'ward/backlog',
    name: 'backlog',
    component: backlog
  }, {
    path: 'patient/patientIndex',
    name: 'patientIndex',
    component: patientIndex
  }, {
    path: 'patient/pageThird',
    name: 'pageThird',
    component: pageThird
  }, {
    path: 'patient/patientInfo',
    name: 'patientInfo',
    component: patientInfo
  }, {
    path: 'patient/allery',
    name: 'allery',
    component: allery
  }, {
    path: 'setting/backlogSet',
    name: 'backlogSet',
    component: backlogSet
  }, {
    path: 'setting/pageIndex',
    name: 'pageIndex',
    component: pageIndex
  }, {
    path: 'popPage/patientList',
    name: 'patientListPop',
    component: patientListPop
  }, {
    path: 'popPage/popWard',
    name: 'popWard',
    component: popWard
  }]
}, {
  path: '/discharged',
  name: 'discharged',
  component: discharged,
  children: [{
    path: 'setting/caseConfig',
    name: 'caseConfig',
    component: caseConfig
  }, {
    path: 'caseLayer',
    name: 'caseLayer',
    component: caseLayer
  }, {
    path: 'patientList',
    name: 'patientsListD',
    component: patientsListD
  }, {
    path: 'patientview',
    name: 'patientviewD',
    component: patientviewD
  }]
}, {
  path: '/transfered',
  name: 'transfered',
  component: transfered,
  children: [{
    path: 'patientList',
    name: 'patientsListT',
    component: patientsListT
  }, {
    path: 'patientview',
    name: 'patientviewT',
    component: patientviewT
  }]
}]

export default routers
