import initExtend from './initExtend'
import initAssetRegisters from './asset'
const ASSETS_TYPE = ['component', 'directive','filter']
export default function initCDF(Vue){
  Vue.options = {} // 全局的组件、指令、过滤器
  ASSETS_TYPE.forEach(type => {
    Vue.options[type + 's'] = {}
  })
  Vue.options._base = Vue
  // 定义extend方法
  initExtend(Vue)
  // 注册组件指令过滤器
  initAssetRegisters(Vue)
}