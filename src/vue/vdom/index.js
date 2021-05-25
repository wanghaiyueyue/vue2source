// src/vdom/index.js

import { isReservedTag,isObject } from "../util/index";

// 定义Vnode类
export default class Vnode {
  constructor(tag, data, key, children, text) {
    this.tag = tag;
    this.data = data;
    this.key = key;
    this.children = children;
    this.text = text;
  }
}

// 创建元素vnode 等于render函数里面的 h=>h(App)
export function createElement(vm, tag, data = {}, ...children) {
  let key = data.key;
  if(isReservedTag(tag)){
    // 常规标签
    return new Vnode(tag,data,key,children)
  }else{
    // 如果是组件，获取对应的构造函数 VueComponent(options)
    let Ctor = vm.options.components[tag]
    return createComponent(vm, tag, data, key, children, Ctor)
  }
}

function createComponent(vm,tag,data,key,children,Ctor){
  // 如果没有被改造成构造函数的话，在重新构造下
  if(isObject(Ctor)){
    vm.options._base.extend(Ctor)
  }
  // 生命组件自己内部的生命周期
  data.hook = {
    // 组件创建过程自身的初始化方法
    init(vnode){
      // 实例化组件
      let child = (vnode.componentInstance = new Ctor({_isComponent: true}))
      // 因为没有传入el属性，需要手动挂载，为了在组件实例上面增加$el方法可用于生成组件的真实渲染节点
      child.$mount()
    }
  }
  return new Vnode(
    `vue-component-${Ctor.cid}-${tag}`,
    data,
    key,
    undefined,
    undefined,
    {
      Ctor,
      children
    }
  )
}

// 创建文本vnode
export function createTextNode(text) {
  return new Vnode(undefined, undefined, undefined, undefined, text);
}
