import { emptifyDeleteList, nextRootFiber, performWorkOfUnit, shouldDeleteNodeList, updateProps, workInProgress } from '../React.js';
import { shouldYieldWork } from './SchdulerWork.js';


export function workLoop() {
  while (!shouldYieldWork() && workInProgress !== null) {
    //在时间发分片和工作可中断基础上，实现支持可中断渲染
    //将Fiber节点构造工作未完成的任务返回
    const continuationWork = performWorkOfUnit(workInProgress);

    if (continuationWork) {
      performWorkOfUnit(continuationWork)
    }

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

/**
 * 提交根节点，即从根节点开始将DOM挂载到DOM Tree上
 * 1. 删除需要删除的节点
 * 2. 提交其他节点，更新 或 新增
 */
function commitRoot() {
  //删除所需删除的节点
  shouldDeleteNodeList.forEach(commitDelete);
  //清空删除节点
  emptifyDeleteList();
  //挂载节点
  commitWork(nextRootFiber.child);
}

function commitWork(fiberNode) {
  if (!fiberNode) return;

  //兼容函数式组件，因为函数组件本身不对应Dom,因此内部的元素应该要向上查找
  let fiberParent = fiberNode.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }
  //处理更新逻辑
  if (fiberNode.effectTag === 'update') {
    updateProps(fiberNode.dom, fiberNode.props, fiberNode.alternate?.props);
  } else if (fiberNode.effectTag === 'palacement') {
    //挂载 如果 fiberNode 是函数组件，fiberNode.dom是null，因此不用添加
    fiberNode.dom && fiberParent.dom.append(fiberNode.dom);
  }

  //递归执行初始化/更新
  commitWork(fiberNode.child);
  commitWork(fiberNode.sibling);
}

/**
 * 删除Fiber 对应的 DOM
 * @param {Object} deleteFiberNode 
 */
function commitDelete(deleteFiberNode) {
  let parentFiberNode = deleteFiberNode.parent;

  const isFunctionComponent = typeof deleteFiberNode.type === 'function';
  if (isFunctionComponent) { //如果是函数组件，则要删除该Fiber节点的所有子节点
    let child = deleteFiberNode.child;
    while (typeof child.type === 'function') { //一直向下寻找第一个不是函数组件的节点
      child = child.child;
    }
    child.dom.remove()
  } else {
    const parentDom = parentFiberNode.dom;
    const deleteChildDom = deleteFiberNode.dom;
    parentDom.removeChild(deleteChildDom)
  }
}