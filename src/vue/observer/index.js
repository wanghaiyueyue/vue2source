
import {arrayMethods} from './array'
import Dep from './dep'
class Oberver{
  constructor(data){
    this.dep = new Dep()
    Object.defineProperty(data,'_ob_',{
      value: this,
      enumerable: false,
      writable: true,
      configurable: true
    })
    if(Array.isArray(data)){
      data.__proto__ = arrayMethods
      this.observeArray(data)
    }else{
      this.walk(data)
    }
  }
  walk(data){
    let keys = Object.keys(data)
    for(let i=0;i<keys.length;i++){
      let key = keys[i]
      let value = data[key]
      proxy(data, key, value)
    }
  }
  observeArray(data){
    for(let i=0;i<data.length;i++){
      observe(data[i])
    }
  }
}

function proxy(obj,key,value){
  let childOb = observe(value)
  // 为每个属性设置个dep
  let dep = new Dep()
  Object.defineProperty(obj, key, {
    get(){
      // 页面取值的时候 可以把watcher收集到dep里面--依赖收集
      if (Dep.target) {
        // 如果有watcher dep就会保存watcher 同时watcher也会保存dep
        dep.depend();
        if (childOb) {
          // 这里表示 属性的值依然是一个对象 包含数组和对象 childOb指代的就是Observer实例对象  里面的dep进行依赖收集
          // 比如{a:[1,2,3]} 属性a对应的值是一个数组 观测数组的返回值就是对应数组的Observer实例对象
          childOb.dep.depend();
          if (Array.isArray(value)) {
            // 如果数据结构类似 {a:[1,2,[3,4,[5,6]]]} 这种数组多层嵌套  数组包含数组的情况  那么我们访问a的时候 只是对第一层的数组进行了依赖收集 里面的数组因为没访问到  所以五大收集依赖  但是如果我们改变了a里面的第二层数组的值  是需要更新页面的  所以需要对数组递归进行依赖收集
            if (Array.isArray(value)) {
              // 如果内部还是数组
              dependArray(value); // 不停的进行依赖收集
            }
          }
        }
      }
      return value
    },
    set(newValue){
      if(newValue === value) return
      observe(newValue)
      value = newValue
      // 通知派发更新
      dep.notify()
    }
  })
}
// 递归收集数组依赖
function dependArray(value) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i];
    // e.__ob__代表e已经被响应式观测了 但是没有收集依赖 所以把他们收集到自己的Observer实例的dep里面
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      // 如果数组里面还有数组  就递归去收集依赖
      dependArray(e);
    }
  }
}

function gtp(target){
  return Object.prototype.toString.call(target).slice(8,-1).toLowerCase()
}
export function observe(data){
  if(gtp(data) === 'object' || gtp(data) === 'array'){
    return new Oberver(data)
  }
}