import React from './React.js';
/**
 * 对其React API
 * @param {HTMLElement} domContainer 真实DOM,组件的根容器
 * @returns render函数，接收组件的虚拟DOM
 */
function createRoot(domContainer) {
  return {
    render: function (vDom) {
      React.render(vDom, domContainer);
    }
  }
}
const ReactDOM = {
  createRoot,
}

export default ReactDOM;
