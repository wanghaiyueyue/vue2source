const arrayProto = Array.prototype

export const arrayMethods = Object.create(arrayProto)
let methodsToPatch=[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'reverse',
  'sort'
]
methodsToPatch.forEach(method => {
  arrayMethods[method] = function(...args){
    const result = arrayProto[method].call(this,...args)
     // this代表的是数据本身
     const ob = this.__ob__
     // 这里标志就是代表数组有新增操作
     let inserted
     switch (method) {
       case 'push':
       case 'unshift':
         inserted = args
         break
       case 'splice':
         inserted = args.slice(2)
       default:
         break;
     }
     if(inserted) ob.observeArray(inserted)
     ob.dep.notify(); //数组派发更新 ob指的就是数组对应的Observer实例 我们在get的时候判断如果属性的值还是对象那么就在Observer实例的dep收集依赖 所以这里是一一对应的  可以直接更新
     return result
  }
})