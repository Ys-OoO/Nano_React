import { workLoop } from "./schduler/Schduler";
import { requestWork } from "./schduler/SchdulerWork";

export const TEXT_ElEMENT_TYPE = 'TEXT_ElEMENT';

/**
 * 视为VDOM Tree的根节点
 * @param {string} textValue 
 */
function createTextNode(textValue) {
  return {
    type: TEXT_ElEMENT_TYPE,
    props: {
      nodeValue: textValue,
      children: []
    }
  }
}

/**
 * 递归创建节点对象 ReactElement
 * @param {string} type 
 * @param {Object} props 
 * @param {Array} children 
 * @returns 
 */
function createElement(type, props, ...children) {
  if (type === TEXT_ElEMENT_TYPE) {
    return createTextNode(props.value);
  }

  return {
    type,
    props: {
      ...props,
      children: children.map(child => {
        if (typeof child === 'string') {
          return createTextNode(child);
        } else {
          return child;
        }
      })
    }
  }
}


export let workInProgress = null;

/**
 *  Fiber树结构如下，每个节点连接其第一个子节点，连接第一个兄弟节点，连接他的父节点
         ********
         * root *
         ********
        ↑↓      ↑
    ********    ********  
    *   A  *  → *   B  *
    ********    ********
 */


/**
 * 构造Fiber树，这里实际上就是将React.js 中的 render 函数的 VDom -> Dom 拦截，并实现VDom -> Fiber Tree -> Dom
 * 将Dom 的构造 和 Fiber的构造一起完成。
 * @param {Object} vDom 
 */
export function performWorkOfUnit(fiberNode) {
  //生成真实Dom
  if (fiberNode.dom === null) {
    let dom = fiberNode.type === TEXT_ElEMENT_TYPE ? document.createTextNode(fiberNode.props.nodeValue) : document.createElement(fiberNode.type);
    //挂载 这里不再每次处理一个Fiber就挂载一次，当Fiber生成完成后 一次性完成挂载
    // fiberNode.parent.dom.append(dom);

    //设置FiberNode 的 dom 属性
    fiberNode.dom = dom;

    //赋值props
    Object.keys(fiberNode.props).forEach((key) => {
      if (key !== 'children') {
        dom[key] = fiberNode.props[key];
      }
    })
  }

  //构造Fiber的结构
  const children = fiberNode.props.children;
  let prevFiberNode = null;
  let parent = fiberNode;
  children.forEach((child, index) => {
    const curFiberNode = {
      type: child.type,
      props: child.props,
      child: null,
      parent, //父节点
      sibling: null,
      dom: null
    }

    if (index === 0) { //第一个孩子
      parent.child = curFiberNode;
    } else { //第一个兄弟
      prevFiberNode.sibling = curFiberNode;
    }
    prevFiberNode = curFiberNode;
  })

  //返回构造下一个
  if (parent.child) {
    workInProgress = parent.child;
  } else if (parent.sibling) {
    workInProgress = parent.sibling;
  } else {
    workInProgress = parent.parent?.sibling || null;
  }

  return workInProgress;
}

export let rootFiber = null;
/**
 * 递归，每一次就是将当前的虚拟DOM转换成真实DOM
 * @param {Object} vDom 虚拟DOM,也就是通过ReactElement.js中提供的方法所创建的结构
 * @param {HTMLElement} domContainer 真实DOM
 */
function render(vDom, domContainer) {
  workInProgress = {
    dom: domContainer,
    props: {
      children: [vDom]
    }
  }
  rootFiber = workInProgress;
  requestWork(workLoop);

  //以下代码是没有使用Schduler之前的逻辑
  // //判断类型，创建对应的DOM节点
  // const dom = vDom.type === TEXT_ElEMENT_TYPE ? document.createTextNode(vDom.props.nodeValue) : document.createElement(vDom.type)

  // //设置props  id/class/style...
  // Object.keys(vDom.props).forEach(key => {
  //   if (key !== 'children') {
  //     dom[key] = vDom.props[key];
  //   }
  // })

  // //children
  // const children = vDom.props.children;
  // children.forEach(child => {
  //   render(child, dom); //递归
  // })

  // //添加
  // domContainer.append(dom);
}


const React = {
  createElement,
  createTextNode,
  render
}

export default React 