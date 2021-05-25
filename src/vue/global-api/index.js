import initMixin from './mixin'
import initCDF from './initcdf'
export function initGlobalAPI(Vue){
  // 处理mixin混入
  initMixin(Vue)
  // 全局组件、指令、过滤器处理
  initCDF(Vue)
}