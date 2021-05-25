import {patch} from '../vdom/patch'
import Watcher from '../observer/watcher'
export function mountComponent(vm,el){
  // 模板编译会生成一个render函数
  // 执行vm._render方法调用生成的render函数生成虚拟dom
  // 使用vm._update()方法把虚拟dom渲染到页面
  vm.$el = el
  callHook(vm, "beforeMount"); //初始渲染之前
  let updateComponent = () => {
    vm._update(vm._render());
  };
  new Watcher(vm, updateComponent,  () => {
    callHook(vm, "beforeUpdate"); //更新之前
  },
  true)
  callHook(vm, "mounted"); //渲染完成之后
}

// src/lifecycle.js

export function lifecycleMixin(Vue) {
  // 把_update挂载在Vue的原型
  Vue.prototype._update = function (vnode) {
    
    const vm = this;
    // patch是渲染vnode为真实dom核心
    // const container = document.querySelector(vm.$options.el)
    // 重新赋值
    const prevNode = vm._vnode// 保留上一次的vnode
    vm._vnode = vnode
    if(!prevNode){
      vm.$el = patch(vm.$el, vnode);
    }else{
      vm.$el = patch(prevNode,vnode)
    }
  };
}


export function callHook(vm,hook){
  const handlers = vm.$options[hook]
  if(handlers){
    for(let i=0;i<handlers.length;i++){
      handlers[i].call(vm)
    }
  }
}