import { workLoop } from "./schduler/Schduler";
import { requestWork } from "./schduler/SchdulerWork";

export const TEXT_ElEMENT_TYPE = 'TEXT_ElEMENT';
export let workInProgress = null;
export let currentRootFiber = null; //当前的根Fiber节点，创建时是新的，更新时是老的
export let nextRootFiber = null;

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
  let oldFiberChild = fiberNode.alternate?.child; //每个Fiber节点通过alternate指向他对应的老Fiber节点,这个变量初始化是老Fiber的第一个孩子
  let prevFiberNode = null;
  let parentFiberNode = fiberNode;
  children.forEach((child, index) => {
    let curFiberNode;
    //判断是否需要更新
    if (isNeedUpdate(oldFiberChild, child)) {
      curFiberNode = {
        type: child.type,
        props: child.props,
        child: null,
        parent: parentFiberNode, //父节点
        sibling: null,
        dom: oldFiberChild.dom,
        effectTag: "update",
        alternate: oldFiberChild,
      }
    } else {
      curFiberNode = {
        type: child.type,
        props: child.props,
        child: null,
        parent: parentFiberNode, //父节点
        sibling: null,
        dom: null,
        effectTag: "palacement"
      }
    }

    if (oldFiberChild) { //由于这里处于children的遍历内，因此老的Fiber只需要找兄弟节点即可，他会在找到空兄弟时与children循环一同结束
      oldFiberChild = oldFiberChild.sibling;
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

//是否需要更新
function isNeedUpdate(oldFiber, curFiber) {
  //判断节点类型
  let isSame;
  //如果是相同类型且触发更新，则需要更新，不同类型的是创建流程
  isSame = oldFiber && oldFiber.type === curFiber.type;

  return isSame;
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
    updateProps(dom, fiberNode.props, {}); //初始创建，没有老的props
  }

  const children = fiberNode.props.children;
  initChildren(fiberNode, children);
}

//创建或更新props 将新的props添加到对应DOM上
export function updateProps(dom, nextProps, prevProps) {
  //赋值props，处理事件
  Object.keys(nextProps).forEach((key) => {
    if (key !== 'children') {

    }
  })
  // 情况分类：  
  // 1. next 没有，pre有——>删 
  Object.keys(prevProps).forEach(key => {
    if (!(key in nextProps) && key !== 'children') {
      dom.removeAttribute(key);
    }
  })
  // 2. next有，prev没有——>增
  // 3. next有，prev有——>判断更新
  Object.keys(nextProps).forEach(key => {
    if (key !== 'children') {
      if (nextProps[key] !== prevProps[key]) {
        if (key.startsWith("on", 0)) { //通过是否有on开头的props判断是否需要绑定事件
          // todo 这种方式实际上和React中的合成事件不同, 后续深入了解尝试替换
          const eventType = key.slice(2).toLowerCase();
          dom.removeEventListener(eventType, prevProps[key]);
          dom.addEventListener(eventType, nextProps[key]);
        } else if (dom) {
          dom[key] = nextProps[key];
        }
      }
    }
  })
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
  nextRootFiber = {
    dom: domContainer,
    props: {
      children: [vDom]
    }
  }
  workInProgress = nextRootFiber;
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

/**
 * 
 * @param {*} vDom 
 * @param {*} domContainer 
 */
function update() {
  currentRootFiber = nextRootFiber;

  nextRootFiber = {
    dom: currentRootFiber.dom,
    props: currentRootFiber.props,
    alternate: currentRootFiber
  }

  workInProgress = nextRootFiber;
  requestWork(workLoop);
}
const React = {
  update,
  createElement,
  createTextNode,
  render
}

export default React 