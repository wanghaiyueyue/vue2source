import {nextTick} from '../util/next-tick'
let queue = []
let has = {}

function flushSchedulerQueue(){
  for(let index = 0;index < queue.length;index++){
    queue[index].run()
  }
  queue = []
  has = false
}

export function queueWatcher(watcher){
  const id = watcher.id
  if(has[id] === undefined){
    // 把全部的watcher都放到队列里面去
    queue.push(watcher)
    has[id] = true
    // flushSchedulerQueue 存放watcher，watcher.run()
    nextTick(flushSchedulerQueue)
  }
}