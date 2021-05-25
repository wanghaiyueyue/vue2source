import { createElement, createTextNode } from "./vdom/index";
import {nextTick} from './util/next-tick'
export function renderMixin(Vue){
  // 主要在原型定义了_render 方法 然后执行了 render 函数 我们知道模板编译出来的 render 函数核心代码主要 return 了 类似于_c('div',{id:"app"},_c('div',undefined,_v("hello"+_s(name)),_c('span',undefined,_v("world"))))这样的代码 那么我们还需要定义一下_c _v _s 这些函数才能最终转化成为虚拟 dom
  Vue.prototype._render = function(){
    const vm = this
    const {render} = vm.$options
    const vnode = render.call(vm)
    
    return vnode
  }
  Vue.prototype._c = function(...args){
    return createElement(Vue,...args)
  }
  Vue.prototype._v = function(text){
    return createTextNode(text)
  }
  Vue.prototype._s = function(val){
    // 如果模板里面的是一个对象  需要JSON.stringify
    if(val === null){
      return ''
    }
    if(typeof val === 'object'){
      return JSON.stringify(val)
    }
    return val
  }
  Vue.prototype.$nextTick = nextTick
}