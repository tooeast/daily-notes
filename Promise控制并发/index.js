// 模拟任务，设置任务的时间
var urls = [
  { info: 'link1', time: 3000 },
  { info: 'link2', time: 2000 },
  { info: 'link3', time: 5000 },
  { info: 'link4', time: 1000 },
  { info: 'link5', time: 1200 },
  { info: 'link6', time: 2000 },
  { info: 'link7', time: 800 },
  { info: 'link8', time: 3000 },
];

// 设置我们要执行的任务
function loadImg(url) {
    return new Promise((resolve, reject) => {
      console.log("----" + url.info + " start!");
      setTimeout(() => {
        console.log( url.info + " OK!!!");
        resolve();
      }, url.time)
    })
};


/*
  @ 主函数
  tasks: 任务列表
  func: 任务的方法，执行函数
  limit: 最大并发数
*/
function multiTask(tasks, func, limit) {
  // 先将任务列表拷贝一份，接下来要操作
  let squ = [].concat(tasks);

  // 初始化并发池
  let promises = [];

  // 直接将任务按照并发最大值 放入列表中（还未开始执行）
  promises = squ.splice(0, limit).map((task, index) => {
    return func(task).then(() => {
      return index
    })
  })

  // 这里利用 reduce 来实现并发池的维护
  return squ.reduce((res, task) => {
    // 这里用到 .then 是因为给 reduce 的初始值是 Promise.resolve()
    return res.then(() => {
      // Promise.race 返回第一个执行完毕的任务 的位置
      return Promise.race(promises);
    }).then((num) => {
      // 处理执行完成的任务，并且将新的任务替代 放入并发池，并且开始执行新的任务
      promises[num] = func(task).then(() => {
        // 这里的num是在 并发池 中位置的标识，这样可以更加方便的就行任务的替换
        return num;
      })
    })
  }, Promise.resolve()).then(() => {
    // 这个任务是为了 在所有任务执行完之后添加一个对调方法，不然就会在最后一个任务进入并发池的时候就完成，而不是所有任务都执行完成
    return Promise.all(promises)
  })
}

multiTask(urls, loadImg, 3).then(() => {
  console.log("都完事儿了！")
})
