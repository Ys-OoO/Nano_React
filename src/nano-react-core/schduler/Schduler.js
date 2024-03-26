import { performWorkOfUnit, rootFiber, workInProgress } from '../React.js';
import { shouldYieldWork } from './SchdulerWork.js';


export function workLoop() {
  while (!shouldYieldWork() && workInProgress !== null) {
    //在时间发分片和工作可中断基础上，实现支持可中断渲染
    //将Fiber节点构造工作未完成的任务返回
    const continuationWork = performWorkOfUnit(workInProgress);

    //源码中有Fiber构造可中断
    // if (continuationWork) {
    //   performWorkOfUnit(continuationWork)
    // } 

    if (!workInProgress) { //一次性挂载  统一提交
      commitRoot()
    }

  }
  if (workInProgress) {
    return true;
  } else {
    return false;
  }
}


function commitRoot() {
  commitWork(rootFiber.child);
}


function commitWork(fiberNode) {
  if (!fiberNode) return;

  //兼容函数式组件，因为函数组件本身不对应Dom,因此内部的元素应该要向上查找
  let fiberParent = fiberNode.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }
  //挂载 如果 fiberNode 是函数组件，fiberNode.dom是null，因此不用添加
  fiberNode.dom && fiberParent.dom.append(fiberNode.dom);
  commitWork(fiberNode.child);
  commitWork(fiberNode.sibling);
}