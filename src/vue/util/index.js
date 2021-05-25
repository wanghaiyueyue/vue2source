export const LIFECYCLE_HOOKS = [
  "beforeCreate",
  "created",
  "beforeMount",
  "mounted",
  "beforeUpdate",
  "updated",
  "beforeDestroy",
  "destroyed"
]

// 合并策略
const strats = {}
// 生命周期合并
function mergeHook(parentVal, childVal){
  if(childVal){
    if(parentVal){
      return parentVal.concat(childVal)
    }else{
      return [childVal]
    }
  }else{
    return parentVal
  }
}

// 为生命周期添加合并策略
LIFECYCLE_HOOKS.forEach(hook=>{
  strats[hook]=mergeHook
})
// console.log(strats,'strats')
// parent/child 是实例选项，和全局的选项
// 此时parent也就是options经过Vue.mixin()后已经是数组类型的
// options:{created:[f]}
export function mergeOptions(parent={},child={}){
  // console.log(parent,child,'parent,child')
  const options = {}
  for(let k in parent){
    mergeFiled(k)
  }
  for(let k in child){
    if(!parent.hasOwnProperty(k)){
      mergeFiled(k)
    }
  }
  function mergeFiled(k){
    if(strats[k]){
      // parent[k]-> [f],children
      options[k] = strats[k](parent[k],child[k])
    }else{
      options[k]=child[k]?child[k]:parent[k]
    }
  }
  return options
}

const ASSETS_TYPE = ['component', 'directive', 'filter']

ASSETS_TYPE.forEach(type => {
  strats[type + 's'] = mergeAssets
})

function mergeAssets(parentVal, childVal){
  // 比如有同名的全局组件和自定义的局部组件，
  // 那么parentVal代表全局组件，自定义的组件是childVal
  // 首先会查找自己局部组件有就用自己的，没有就从原型继承全局组件，res._proto_ === parentVal
  const res = Object.create(parentVal)
  if(childVal){
    for(let k in childVal){
      res[k] = childVal[k]
    }
  }
  return res
}

// 是否是对象
export function isObject(data){
  return Object.prototype.toString.call(data).slice(8,-1).toLowerCase() === 'object'
}

// 是否是常规html标签
export function isReservedTag(tagName){
  let str =
    "html,body,base,head,link,meta,style,title," +
    "address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section," +
    "div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul," +
    "a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby," +
    "s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video," +
    "embed,object,param,source,canvas,script,noscript,del,ins," +
    "caption,col,colgroup,table,thead,tbody,td,th,tr," +
    "button,datalist,fieldset,form,input,label,legend,meter,optgroup,option," +
    "output,progress,select,textarea," +
    "details,dialog,menu,menuitem,summary," +
    "content,element,shadow,template,blockquote,iframe,tfoot"
    let obj = {}
    str.split(',').forEach(tag => {
      obj[tag] = true
    })
    return obj[tagName]
}