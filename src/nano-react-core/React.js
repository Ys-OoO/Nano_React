import { workLoop } from "./schduler/Schduler";
import { requestWork } from "./schduler/SchdulerWork";

export const TEXT_ElEMENT_TYPE = 'TEXT_ElEMENT';
export let workInProgress = null;
export let rootFiber = null;


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
        //除了 string 之外都是是为了兼容组件中使用 {prop} 渲染变量，{prop} 被视为一个新的节点
        if ((typeof child === 'string') || (typeof child === 'number') || (typeof child === 'boolean')) {
          return createTextNode(child);
        } else {
          return child;
        }
      })
    }
  }
}

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
function initChildren(fiberNode, children) {
  let prevFiberNode = null;
  let parentFiberNode = fiberNode;
  children.forEach((child, index) => {
    const curFiberNode = {
      type: child.type,
      props: child.props,
      child: null,
      parent: parentFiberNode, //父节点
      sibling: null,
      dom: null
    }

    if (index === 0) { //第一个孩子
      parentFiberNode.child = curFiberNode;
    } else { //第一个兄弟
      prevFiberNode.sibling = curFiberNode;
    }
    prevFiberNode = curFiberNode;
  })

  //寻找下一个节点，子节点/兄弟节点/叔叔节点
  if (parentFiberNode.child) {
    workInProgress = fiberNode.child;
  } else if (parentFiberNode.sibling) {
    workInProgress = fiberNode.sibling;
  } else {
    //针对多个连续函数组件，寻找叔叔节点
    let nextFiber = fiberNode;
    while (nextFiber) {
      if (nextFiber.sibling) {
        workInProgress = nextFiber.sibling;
        break;
      } else {
        nextFiber = nextFiber.parent || null;
        workInProgress = nextFiber;
      }
    }
  }
}

//更新和初始化函数组件
function updateFunctionComponent(fiberNode) {
  //调用函数组件，传递props
  const children = [fiberNode.type(fiberNode.props)]
  //构造子Fiber
  initChildren(fiberNode, children);
}

//更新和初始化基本元素
function updateHostComponent(fiberNode) {
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

  const children = fiberNode.props.children;
  initChildren(fiberNode, children);
}


/**
 * 构造Fiber树，这里实际上就是将React.js 中的 render 函数的 VDom -> Dom 拦截，并实现VDom -> Fiber Tree -> Dom
 * 将Dom 的构造 和 Fiber的构造一起完成。
 * @param {Object} vDom 
 */
export function performWorkOfUnit(fiberNode) {
  const isFunctionComponent = typeof fiberNode.type === "function";

  //构造Fiber的结构
  if (isFunctionComponent) {
    updateFunctionComponent(fiberNode);
  } else {
    updateHostComponent(fiberNode)
  }

  return workInProgress;
}

/**
 * 递归，每一次就是将当前的虚拟DOM转换成真实DOM
 * @param {Object} vDom 虚拟DOM,也就是通过ReactElement.js中提供的方法所创建的结构
 * @param {HTMLElement} domContainer 真实DOM
 */
function render(vDom, domContainer) {
  //初始化根Fiber节点
  rootFiber = {
    dom: domContainer,
    props: {
      children: [vDom]
    }
  }
  workInProgress = rootFiber;
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

  // //处理children
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