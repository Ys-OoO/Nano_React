import { performWorkOfUnit, workInProgress } from '../React.js';
import { shouldYieldWork } from './SchdulerWork.js';


export function workLoop() {
  debugger
  while (!shouldYieldWork() && workInProgress !== null) {
    //在时间发分片和工作可中断基础上，实现支持可中断渲染
    //将Fiber节点构造工作未完成的任务返回
    const continuationWork = performWorkOfUnit(workInProgress);

    //源码中有Fiber构造可中断
    // if (continuationWork) { 
    //   performWorkOfUnit(continuationWork)
    // }
  }
  return workInProgress !== null;
}
