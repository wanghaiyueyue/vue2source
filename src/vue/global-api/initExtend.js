import { mergeOptions } from "../util/index";
// Vue.component('prev',{
//   template: '<div></div>'
// })
export default function initExtend(Vue){
  // let cid = 0
  // // extendOptions就是配置项
  // // 这里的Sub就相当于Vue
  // Vue.extend = function(extendOptions){
  //   const Sub = function VueComponent(options){
  //     this._init(options)
  //   }
  //   Sub.cid = cid++
  //   // 这里的this指向的是父类
  //   Sub.prototype = Object.create(Vue.prototype)
  //   // 将构造方法指向自己
  //   Sub.prototype.constructor = Sub
  //   Sub.options = mergeOptions(this.options,extendOptions)
  //   return Sub
  // }
  let cid = 0; //组件的唯一标识
  // 创建子类继承Vue父类 便于属性扩展
  Vue.extend = function (extendOptions) {
    // 创建子类的构造函数 并且调用初始化方法
    const Sub = function VueComponent(options) {
      this._init(options); //调用Vue初始化方法
    };
    Sub.cid = cid++;
    Sub.prototype = Object.create(this.prototype); // 子类原型指向父类
    Sub.prototype.constructor = Sub; //constructor指向自己
    Sub.options = mergeOptions(this.options, extendOptions); //合并自己的options和父类的options
    return Sub;
  };
}