import {initState} from './state'
import {compileToFunctions} from './compile/index'
import {callHook, mountComponent} from './lifecycle/index'
import { mergeOptions } from './util/index'
import Watcher from './observer/watcher'
export function initMixin(Vue){
  Vue.prototype._init = function(options){
    // 给数据做响应化
    const vm = this
    vm.$options = mergeOptions(vm.constructor.options, options)
    callHook(vm,'beforeCreate')
    initState(vm)
    callHook(vm,'created')
    if(options.el){
      vm.$mount(vm.$options.el)
    }
  }
  Vue.prototype.$mount = function(el){
    const vm = this
    const options = vm.$options
    el = document.querySelector(el)
    if(!options.render){
      let template = options.template
      if(!template && el){
        template = el.outerHTML
      }
      if(template){
        options.render = compileToFunctions(template)
      }
    }
    // 生成虚拟dom渲染到页面
    // 组件挂载，里面会有生命周期钩子执行beforeMount和mounted
    // _update(vm._render())
    // _update核心方法就是patch初始渲染和后续更新都是共用一个方法，只是传入的第一个参数不同。初始渲染总体思路就是根据虚拟dom调用原生js方法创建真实dom，并替换调el选项的位置
    return mountComponent(vm, el)
  }
  Vue.prototype.$watch = function(exprOrFn, cb, options){
    const vm = this
    new Watcher(vm, exprOrFn,cb,{...options,user: true})
    if(options.immediate){
      cb()
    }
  }
}