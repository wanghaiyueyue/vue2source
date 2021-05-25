// src/vdom/patch.js

import { isReservedTag } from "../util/index";

// patch用来渲染和更新视图 今天只介绍初次渲染的逻辑
export function patch(oldVnode, vnode) {
  // 判断传入的oldVnode是否是一个真实元素
  // 这里很关键  初次渲染 传入的vm.$el就是咱们传入的el选项  所以是真实dom
  // 如果不是初始渲染而是视图更新的时候  vm.$el就被替换成了更新之前的老的虚拟dom

  // 如果是组件渲染的话是没有el选项的
  if(!oldVnode){
    return createElm(vnode)
  }else{
    const isRealElement = oldVnode.nodeType;
    if (isRealElement) {
      // 这里是初次渲染的逻辑
      const oldElm = oldVnode;
      const parentElm = oldElm.parentNode;
      // 将虚拟dom转化成真实dom节点
      let el = createElm(vnode);
      // 插入到 老的el节点下一个节点的前面 就相当于插入到老的el节点的后面
      // 这里不直接使用父元素appendChild是为了不破坏替换的位置
      parentElm.insertBefore(el, oldElm.nextSibling);
      // 删除老的el节点
      parentElm.removeChild(oldVnode);
      // 返回新的node节点当做旧的
      return el;
    }else{
      // 标签是否一致，是否是文本节点
      // 如果存在两个节点，先对比tag是否一样，如果不一样直接做替换
      if(oldVnode.tag !== vnode.tag){
        oldVnode.parentNode.replaceChild(createElm(vnode),oldVnode.el)
      }
      if(!oldVnode.tag){
        if(oldVnode.text !== vnode.text){
          oldVnode.el.textContent = vnode.text
        }
      }
      // 如果是组件直接创建
      if(vnode.tag && !isReservedTag(vnode.tag)){
        return createElm(vnode)
      }
      // 进行内部元素比较
      // 为了节点复用，所以直接把旧的虚拟dom对应的真实dom赋值给新的虚拟dom的el属性
      const el = (vnode.el = oldVnode.el)
      updateProperties(vnode,oldVnode.data)
      const oldCh = oldVnode.children || []
      const newCh = vnode.children || []
      if(oldCh.length > 0 && newCh.length > 0){
        updateChildren(el, oldCh,newCh)
      }else if(!oldCh.length){
        el.innerHTML = ''
      } else if(newCh.length){
        for(let i =0;i<newCh.length;i++){
          const child = newCh[i]
          el.appendChild(createElm(child))
        }
      }
      return el
    }
  }
  
}

// 初始化组件，创建组件实例
function createComponent(vnode){
  let i = vnode.data
  if(i.hook && i.hook.init){
    i.hook.init(vnode)
  }
  if(vnode.componentInstance){
    return true
  }
}
// 虚拟dom转成真实dom 就是调用原生方法生成dom树
function createElm(vnode) {
  let { tag, data, key, children, text } = vnode;
  //   判断虚拟dom 是元素节点还是文本节点
  if (typeof tag === "string") {
    if(createComponent(vnode)){
      return vnode.componentInstance.$el
    }
    //   虚拟dom的el属性指向真实dom
    vnode.el = document.createElement(tag);
    // 解析虚拟dom属性
    updateProperties(vnode);
    // 如果有子节点就递归插入到父节点里面
    children.forEach((child) => {
      return vnode.el.appendChild(createElm(child));
    });
  } else {
    //   文本节点
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

// 解析vnode的data属性 映射到真实dom上
function updateProperties(vnode,oldProps={}) {
  let newProps = vnode.data || {};
  let el = vnode.el; //真实节点
  for(const m in oldProps){
    if(!newProps[m]){
      el.removeAttribute(m)
    }
  }
  const newStyle = newProps.style || {};
  const oldStyle = oldProps.style || {};
  for (const key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = "";
    }
  }
  for (let key in newProps) {
    // style需要特殊处理下
    if (key === "style") {
      for (let styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName];
      }
    } else if (key === "class") {
      el.className = newProps.class;
    } else {
      // 给这个元素添加属性 值就是对应的值
      el.setAttribute(key, newProps[key]);
    }
  }
}

// diff对比
// 采用双指针的方式，对比新老vnode的儿子节点
function updateChildren(el,oldCh,newCh){
  // 定义新旧node开始/结束位置
  let oldStartIndex = 0
  let oldStartVnode = oldCh[0]
  let oldEndIndex = oldCh.length - 1
  let oldEndVnode = oldCh[oldEndIndex]

  let newStartIndex = 0
  let newStartVnode = newCh[0]
  let newEndIndex = newCh.length - 1
  let newEndVnode = newCh[newEndIndex]
  // 创建index映射表，类似 {'a':0,'b':1} 代表key为'a'的节点在第一个位置 key为'b'的节点在第二个位置
  function makeIndexByKey(children){
    let map = {}
    children.forEach((item,index) => {
      map[item.key] = index
    })
    return map
  }
  let map = makeIndexByKey(oldCh)
  // 循环做差异比较
  // 只有新老双指标位置不大于结束位置的时候，才能循环，
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 旧节点不存在，取下一个节点
    if(!oldStartVnode){
      oldStartVnode = oldCh[++oldStartIndex]
    }else if(!oldEndVnode){
      oldEndVnode = oldCh[--oldEndIndex]
    }else if(isSameVnode(oldStartVnode,newStartVnode)){
      // 头和头比较
      // 是相同的节点，递归比较
      patch(oldStartVnode, newStartVnode)
      oldStartVnode = oldCh[++oldStartIndex]
      newStartVnode = newCh[++newStartIndex]
    }else if(isSameVnode(oldEndVnode,newEndVnode)){
      // 尾和尾比较
      // 递归子节点
      patch(oldEndVnode, newEndVnode)
      oldEndVnode = oldCh[--oldEndIndex]
      newEndVnode = newCh[--newEndIndex]
    }else if(isSameVnode(oldStartVnode,newEndVnode)){
      // 老的头和新的尾比较,吧老的头移动到尾部
      patch(oldStartVnode,newEndVnode)
      el.insertBefore(oldStartVnode.el,oldEndVnode.el.nextSibling)
      oldStartVnode = oldCh[++oldStartIndex]
      newEndVnode = newCh[--newEndIndex]
    }else if(isSameVnode(oldEndVnode, newStartVnode)){
      // 老的尾和新的头做比较
      patch(oldEndVnode,newStartVnode)
      el.insertBefore(oldEndVnode.el,oldStartVnode.el)
      oldEndVnode = oldCh[--oldEndIndex]
      newStartVnode = newCh[++newStartIndex]
    }else{
      // 以上情况都不满足，进行暴力对比
      // 根据老的子节点的key和index的映射表，从新的开始子节点进行查找，如果可以找到就进行移动，找不到则进行插入
      let moveIndex = map[newStartVnode.key]
      if(!moveIndex){
        // 老的节点找不到，直接插入
        el.insertBefore(createElm(newStartVnode),oldStartVnode.el)
      }else{
        let moveVnode = oldCh[moveIndex]
        oldCh[moveIndex] = undefined // 是个占位符，避免数组塌陷，防止老节点移走后破坏了初始数据
        el.insertBefore(moveVnode.el, oldStartVnode)
        patch(moveVnode,newStartVnode)
      }
    }
  }
  // 如果节点循环完毕，但是新节点还有，证明节点需要被添加到头部或者尾部
  if(newStartIndex <= newEndIndex){
    for(let i = newStartIndex;i<newEndIndex;i++){
      const ele = newCh[newEndIndex+1]==null?null:newCh[newEndIndex+1].el
      el.insertBefore(createElm(newCh[i]),ele)
    }
  }
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      let child = oldCh[i];
      if (child != undefined) {
        parent.removeChild(child.el);
      }
    }
  }
}

function isSameVnode(oldVnode, newVnode){
  return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key
}