
import Dep from './observer/dep'
import {observe} from './observer/index'
import Watcher from './observer/watcher'
export function initState(vm){
  // 根据参数不同做具体配置
  const opts = vm.$options
  if(opts.props) initProps(vm)
  if(opts.data) initData(vm)
  if(opts.methods) initMethods(vm)
  if(opts.computed) initComputed(vm)
  if(opts.watch) initWatch(vm)
}

// 初始化methods
/**
 * Vue({
 *  methods:{
 *    handleShow(){...},
 *    handleClose(){...}
 *  }
 * })
 */
function initMethods(vm){
  const props = vm.$options.props
  const methods = vm.$options.methods
  for(let key in methods){
    vm[key] = typeof methods[key] !== 'function'?function(){console.log('...')}:methods[key].bind(vm) 
  }
}


// 初始化computed-------------------------------------
// Vue({
//   ...Vue
//   computed:{
//     computedName(){
//       return this.a + this.b
//     }
//   }
// })
function initComputed(vm){
  const computed = vm.$options.computed
  const watchers = (vm._computedWatchers = {})
  for(let k in computed){
    // 获取用户自定义的计算属性
    const userDef = computed[k]
    const getter = typeof userDef === 'function'?userDef:userDef.get
    // 创建计算watcher
    watchers[k] = new Watcher(vm,getter,()=>{},{lazy: true})
    defineComputed(vm,k,userDef)
  }
}

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get:() => {},
  set:() => {}
}
function defineComputed(target, key, userDef){
  if(typeof userDef === 'function'){
    sharedPropertyDefinition.get = createComputedGetter(key)
  }else{
    sharedPropertyDefinition.get = createComputedGetter(key);
    sharedPropertyDefinition.set = userDef.set;
  }
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function createComputedGetter(key){
  return function(){
    const watcher = this._computedWatchers[key]
    if(watcher){
      if(watcher.dirty){
        watcher.evaluate()
        if(Dep.target){
          watcher.depend()
        }
      }
      return watcher.value
    }
  }
}

// 初始化watch----------------------------------
function initWatch(vm){
  let watch = vm.$options.watch
  for(let k in watch){
    const handler = watch[k]
    if(Array.isArray(handler)){
      handler.forEach(handle => {
        createWatcher(vm,k,handle)
      })
    }else{
      createWatcher(vm,k,handler)
    }
  }
}

function createWatcher(vm,exprOrFn, handler, options={}){
  
  if(typeof handler === 'object'){
    options = handler
    handler = handler.handler
  }
  if(typeof handler === 'string'){
    handler = vm[handler]
  }
  return vm.$watch(exprOrFn, handler, options)
}
// -初始化data------------------------------------
function initData(vm){
  // 将data内数据代理到vm上
  let data = vm.$options.data
  data = vm._data = typeof data === 'function'?data.call(vm):data||{}
  const keys = Object.keys(data)
  for(let key in data){
    proxy(vm,'_data',key)
  }
  observe(data)
}

function proxy(obj,sourceKey,key){
  Object.defineProperty(obj,key,{
    get(){
      return obj[sourceKey][key]
    },
    set(newValue){
      obj[sourceKey][key] = newValue
    }
  })
}