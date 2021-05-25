
let callbacks = []
let pending = false

let timerFunc; //定义异步方法  采用优雅降级
function flushCallbacks() {
  pending = false; //把标志还原为false
  // 依次执行回调
  for (let i = 0; i < callbacks.length; i++) {
    callbacks[i]();
  }
}

if(typeof Promise !== 'undefined'){
  const p = Promise.resolve()
  timerFunc = () =>{
    p.then(flushCallbacks)
  }
}else if(typeof MutationObserver !== 'undefined'){
  let counter = 1;
  const observer = new MutationObserver(flushCallbacks);
  const textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true,
  });
  timerFunc = () => {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };

} else if (typeof setImmediate !== "undefined") {
  // 如果前面都不支持 判断setImmediate
  timerFunc = () => {
    setImmediate(flushCallbacks);
  };
}else {
  // 最后降级采用setTimeout
  timerFunc = () => {
    setTimeout(flushCallbacks, 0);
  };
}


export function nextTick(cb){
  // 除了渲染watcher，还有手动调用的nextTick，一起呗收集到数组
  callbacks.push(cb)
  if(!pending){
    // 如果多次调用nextick，只会执行一次，
    pending = true
    timerFunc()
  }
}