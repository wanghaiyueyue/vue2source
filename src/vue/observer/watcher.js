import { isObject } from "../util/index";
import { pushTarget, popTarget } from "./dep";
import {queueWatcher} from './scheduler'
let id = 0
export default class Watcher{
  constructor(vm,exprOrFn,cb,options){
    this.vm = vm
    this.exprOrFn = exprOrFn
    this.cb = cb //回调函数，比如在watcher更新之前可以执行beforeUpdate方法 
    this.options = options //额外的选项true代表渲染watcher
    this.id = id++
    this.deps = []
    this.depsId = new Set()
    // 标识watch
    this.user = options.user
    // 标识computed
    this.lazy = options.lazy
    this.dirty = this.lazy

    if(typeof exprOrFn === 'function'){
      this.getter = exprOrFn
    }else{
      this.getter = function(){
         //用户watcher传过来的可能是一个字符串   类似a.a.a.a.b
         let path = exprOrFn.split(".");
         let obj = vm;
         for (let i = 0; i < path.length; i++) {
           obj = obj[path[i]]; //vm.a.a.a.a.b
         }
         return obj;
      }
    }
    // 将值赋值给value，当oldVal
    this.value = this.lazy?undefined:this.get()
  }
  get(){
    pushTarget(this)//// 在调用方法之前先把当前watcher实例推到全局Dep.target上
    // this.getter()//如果watcher是渲染watcher 那么就相当于执行  vm._update(vm._render()) 这个方法在render函数执行的时候会取值 从而实现依赖收集
    const res = this.getter.call(this.vm)
    popTarget(); // 在调用方法之后把当前watcher实例从全局Dep.target移除
    return res
  }
  addDep(dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.depsId.add(id);
      this.deps.push(dep);
      //   直接调用dep的addSub方法  把自己--watcher实例添加到dep的subs容器里面
      dep.addSub(this);
    }
  }
  //   这里简单的就执行以下get方法  之后涉及到计算属性就不一样了
  // dep通知更新的时候

  update() {
    if(this.lazy){
      this.dirty = true
    }else{
      queueWatcher(this)
    }
  }
  depend(){
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }
  evaluate(){
    this.value = this.get()
    this.dirty = false
  }
  run(){
    // this.get()
    const newVal = this.get()
    const oldVal = this.value
    this.value = newVal
    if(this.user){
      if(newVal !== oldVal || isObject(newVal)){
        this.cb.call(this.vm,newVal,oldVal)
      }
    }else{
      this.cb.call(this.vm)
    }
  }
}