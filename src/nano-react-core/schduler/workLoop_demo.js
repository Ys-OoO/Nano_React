import { requestWork, shouldYieldWork } from './SchdulerWork.js';


//模拟Fiber构造工作
function fiberConstructWork() {
  for (let i = 0; i < 1000; i++) {
    console.log("构造Fiber——" + i);
  }
}

//模拟work调度，10个work
function workLoop() {
  let taskCount = 10;
  while (taskCount) {
    if (shouldYieldWork()) { break }
    //执行一个任务
    taskCount--;
    fiberConstructWork();
  }

  //返回执行状态
  if (taskCount) {
    return true;
  } else {
    return false;
  }
}

requestWork(workLoop);

