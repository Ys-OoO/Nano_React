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

/**
 * 递归，每一次就是将当前的虚拟DOM转换成真实DOM
 * @param {Object} vDom 虚拟DOM,也就是通过ReactElement.js中提供的方法所创建的结构
 * @param {HTMLElement} domContainer 真实DOM
 */
function render(vDom, domContainer) {
  //判断类型，创建对应的DOM节点
  const dom = vDom.type === TEXT_ElEMENT_TYPE ? document.createTextNode(vDom.props.nodeValue) : document.createElement(vDom.type)

  //设置props  id/class/style...
  Object.keys(vDom.props).forEach(key => {
    if (key !== 'children') {
      dom[key] = vDom.props[key];
    }
  })

  //children
  const children = vDom.props.children;
  children.forEach(child => {
    render(child, dom); //递归
  })

  //添加
  domContainer.append(dom);
}


const React = {
  createElement,
  createTextNode,
  render
}

export default React 