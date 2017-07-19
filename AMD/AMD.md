


### 概述
AMD规范其实只有一个主要接口 `define(id,dependencies,factory)`，它要在声明模块的时候指定所有的依赖`dependencies`，并且还要当做形参传到`factory`中，对于依赖的模块提前执行，依赖前置
```javascript
define("module", ["dep1", "dep2"], function(d1, d2) {  
  return someExportedValue;  
});  
require(["module", "../file"], function(module, file) { /* ... */ });  
```

### require函数调用模块
AMD也采用`require()`语句加载模块
```javascript
require(['math'], function (math) {
　　math.add(2, 3);
});
```
第一个参数是一个数组，里面的成员就是要加载的模块；第二个参数`callback`，则是加载成功之后的回调函数。
`math.add()`与`math`模块加载不是同步的，浏览器不会发生假死。所以很显然，AMD比较适合浏览器环境。

### define()函数定义模块
```javascript
define(
    //这个模块的名称
    "types/Manager",
    //依赖的模块
    ["types/Employee"],
    //函数执行时，所有依赖项加载。这个函数的参数依赖上述模块。
    function (Employee) {
        function Manager () {
            this.reports = [];
        }
        //开始执行
        Manager.prototype = new Employee();
        //返回经理构造函数可以由其他模块的应用。
        return Manager;
    }
);
```
#### example
创建一个名为"alpha"的模块，使用了require，exports，和名为"beta"的模块:
```javascript
define("alpha", ["require", "exports", "beta"], function (require, exports, beta) {
   exports.verb = function() {
       return beta.verb();
       //或者:
       //return require("beta").verb();
   }
});
```

一个返回对象的匿名模块：
```javascript
define(["alpha"], function (alpha) {
   return {
     verb: function(){
       return alpha.verb() + 2;
     }
   };
});
```

一个使用了简单CommonJS转换的模块定义：
```javascript
define(function (require, exports, module) {
    var a = require('a'),
        b = require('b');

    exports.action = function () {};
});
```

### 优点
适合在浏览器环境异步加载
并行加载多个模块

### 缺点
提高开发成本，代码阅读和书写比较困难
不符合通用的模块思维方式，是一种妥协的实现