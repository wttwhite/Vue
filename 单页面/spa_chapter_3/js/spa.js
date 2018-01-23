var spa = (function ($) {  //自执行匿名函数, 模块模式
  initModule = function($container){                    // 匿名函数,模块模式,闭包
    spa.shell.initModule($container);
  };
  return {initModule: initModule} // 模块模式,作用域链
}())