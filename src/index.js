
import Vue from './vue/index'
Vue.mixin({
  created(){
    // console.log('全局mixin-created')
  }
})
Vue.component('global-comp',{
  data(){
    return {
      globalComp: '我是globalComp'
    }
  },
  template:'<div><p>sdfglobalComp-{{globalComp}}</p></div>'
})
let vm = new Vue({
  el:'#app',
  data(){
    return {
      name: 'hello',
      age: 'world'
    }
  },
  created(){
    // console.log('created')
  },
  mounted(){
    // console.log('mounted')
  },
  template: '<div><span>{{ name }} - {{ age }}</span><p>{{computedName}}</p><global-comp></global-comp></div>',
  computed:{
    computedName(){
      return this.name + '我是computed'
    }
  },
  watch:{
    name:function(newVal,oldVal){
      console.log('我是watch',newVal,oldVal)
    },
    // name: {
    //   handle(newVal， oldVal) {
    //     console.log(newVal);
    //   },
    //   deep: true
    // },
    // name: 'doSomething',
    // name: [{
    //   handle(newVal， oldVal) {
    //     console.log(newVal);
    //   },
    //   deep: true
    // }]
  }
})
console.log(vm)
// setTimeout(() => {
//   vm.name = 456;
//   // 此方法是刷新视图的核心
//   vm._update(vm._render());
// }, 1000);
function createE(){
  const btn = document.createElement('button')
  btn.innerHTML = 'button'
  btn.onclick = function(){
    vm.name = 'lucy'
    vm.age = 12
    // vm._update(vm._render())
  }
  return btn
}
const btn = createE()
document.body.appendChild(btn)