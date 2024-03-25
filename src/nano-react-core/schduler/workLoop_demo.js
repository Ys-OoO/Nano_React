import { requestWork, shouldYieldWork } from './SchdulerWork.js';


let taskId = 1;// 类比为Fiber构造的任务

//模拟工作循环
function workLoop() {
  while (!shouldYieldWork()) {
    console.log(`正在执行任务${taskId}`);
  }
  taskId++;
  return Math.random() < 0.5
}
requestWork(workLoop);
