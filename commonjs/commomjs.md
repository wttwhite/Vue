


### 概述
CommonJS规范是为了解决javascript的作用域问题而定义的模块形式。根据这个规范，每个文件就是一个模块，有自己的作用域。在一个文件里面定义的变量、函数、类，都是私有的，对其他文件不可见。
服务器端的Node.js遵循CommonJS规范。核心思想是允许模块通过require 方法来同步加载所要依赖的其他模块，然后通过 exports或module.exports来导出需要暴露的变量或接口。
CommonJS是同步加载模块，但其实也有浏览器端的实现，其原理是将所有模块都定义好并通过id进行索引，这样就可以浏览器进行解析了
如果想在多个文件分享变量，必须定义为`global`对象的属性,但不推荐使用。

导出:
```javascript
 module.exports = function(value){
	Return value*2
}
```
导入:
```javascript
var multiply = require(‘./moduleA’);
```

### module对象
Node内部提供一个Module构建函数。所有模块都是Module的实例。每个模块内部，都有一个module对象，代表当前模块。它的exports属性（即module.exports）是对外的接口。加载某个模块，其实是加载该模块的module.exports属性。
它有以下属性:
    `module.id` 模块的识别符，通常是带有绝对路径的模块文件名。
    `module.filename` 模块的文件名，带有绝对路径。
    `module.loaded` 返回一个布尔值，表示模块是否已经完成加载。
    `module.parent` 返回一个对象，表示调用该模块的模块。
    `module.children` 返回一个数组，表示该模块要用到的其他模块。
    `module.exports` 表示模块对外输出的值。
  
如果在命令行下调用某个模块，比如`node something.js`，那么`module.parent`就是`undefined`。如果是在脚本之中调用，比如`require('./something.js')`，那么`module.parent`就是调用它的模块。利用这一点，可以判断当前模块是否为入口脚本。
### exports 变量
为了方便，Node为每个模块提供一个exports变量，指向module.exports。在对外输出模块接口时，可以向exports对象添加方法。
```javascript
exports.area = function (r) {
  return Math.PI * r * r;
};

exports.circumference = function (r) {
  return 2 * Math.PI * r;
};
```
**注意**，不能直接将exports变量指向一个值，因为这样等于切断了exports与module.exports的联系。
如果一个模块的对外接口，就是一个单一的值，不能使用exports输出，只能使用module.exports输出。
如果你觉得，exports与module.exports之间的区别很难分清，一个简单的处理方法，就是放弃使用exports，只使用module.exports。

### require
require命令用于加载文件，后缀名默认为.js。

#### require的内部处理流程
`require`命令是CommonJS规范之中，用来加载其他模块的命令。它其实不是一个全局命令，而是指向当前模块的`module.require`命令，而后者又调用Node的内部命令`Module._load`。
```javascript
Module._load = function(request, parent, isMain) {
  // 1. 检查 Module._cache，是否缓存之中有指定模块
  // 2. 如果缓存之中没有，就创建一个新的Module实例
  // 3. 将它保存到缓存
  // 4. 使用 module.load() 加载指定的模块文件，
  //    读取文件内容之后，使用 module.compile() 执行文件代码
  // 5. 如果加载/解析过程报错，就从缓存删除该模块
  // 6. 返回该模块的 module.exports
};
```
上面的第4步，采用`module.compile()`执行指定模块的脚本，逻辑如下。
```javascript
Module.prototype._compile = function(content, filename) {
  // 1. 生成一个require函数，指向module.require
  // 2. 加载其他辅助方法到require
  // 3. 将文件内容放到一个函数之中，该函数可调用 require
  // 4. 执行该函数
};
```
上面的第1步和第2步，require函数及其辅助方法主要如下。

`require()`: 加载外部模块
`require.resolve()`：将模块名解析到一个绝对路径
`require.main`：指向主模块
`require.cache`：指向所有缓存的模块
`require.extensions`：根据文件的后缀名，调用不同的执行函数
一旦`require`函数准备完毕，整个所要加载的脚本内容，就被放到一个新的函数之中，这样可以避免污染全局环境。该函数的参数包括`require`、`module`、`exports`，以及其他一些参数。
```javascript
(function (exports, require, module, __filename, __dirname) {
  // YOUR CODE INJECTED HERE!
});
```
`Module._compile`方法是同步执行的，所以`Module._load`要等它执行完成，才会向用户返回`module.exports`的值。

#### 加载规则
1.参数字符串以“/”开头，则表示加载的是一个位于绝对路径的模块文件。
比如，`require('/home/marco/foo.js')`将加载`/home/marco/foo.js`。
2.参数字符串以“./”开头，则表示加载的是一个位于相对路径（跟当前执行脚本的位置相比）的模块文件。
比如，`require('./circle')`将加载当前脚本同一目录的`circle.js`。
3.参数字符串不以“./“或”/“开头，则表示加载的是一个默认提供的核心模块（位于Node的系统安装目录中），或者一个位于各级`node_modules`目录的已安装模块（全局安装或局部安装）。
举例来说，脚本`/home/user/projects/foo.js`执行了`require('bar.js')`命令，Node会依次搜索以下文件。

`/usr/local/lib/node/bar.js`
`/home/user/projects/node_modules/bar.js`
`/home/user/node_modules/bar.js`
`/home/node_modules/bar.js`
`/node_modules/bar.js`
这样设计的目的是，使得不同的模块可以将所依赖的模块本地化。

4.参数字符串不以“./“或”/“开头，而且是一个路径，比如`require('example-module/path/to/file')`，则将先找到`example-module`的位置，然后再以它为参数，找到后续路径。

5.如果指定的模块文件没有发现，Node会尝试为文件名添加`.js`、`.json`、`.node`后，再去搜索。`.js`件会以文本格式的`JavaScript`脚本文件解析，`.json`文件会以`JSON`格式的文本文件解析，`.node`文件会以编译后的二进制文件解析。

6.如果想得到`require`命令加载的确切文件名，使用`require.resolve()`方法。

#### 目录加载规则
通常，我们会把相关的文件会放在一个目录里面，便于组织。这时，最好为该目录设置一个**入口文件**，让`require`方法可以通过这个入口文件，加载整个目录。

在目录中放置一个`package.json`文件，并且将入口文件写入`main`字段。下面是一个例子。
```javascript
// package.json
{ "name" : "some-library",
  "main" : "./lib/some-library.js" }
```
`require`发现参数字符串指向一个目录以后，会自动查看该目录的`package.json`文件，然后加载`main`字段指定的入口文件。如果`package.json`文件没有`main`字段，或者根本就没有`package.json`文件，则会加载该目录下的`index.js`文件或`index.node`文件。

#### 模块的缓存
第一次加载某个模块时，Node会缓存该模块。以后再加载该模块，就直接从缓存取出该模块的`module.exports`属性。
所有缓存的模块保存在`require.cache`之中，如果想删除模块的缓存，可以像下面这样写。
```javascript
// 删除指定模块的缓存
delete require.cache[moduleName];

// 删除所有模块的缓存
Object.keys(require.cache).forEach(function(key) {
  delete require.cache[key];
})
```
**注意**，缓存是根据绝对路径识别模块的，如果同样的模块名，但是保存在不同的路径，require命令还是会重新加载该模块。

#### 环境变量NODE_PATH
Node执行一个脚本时，会先查看环境变量`NODE_PATH`。它是一组以冒号分隔的绝对路径。在其他位置找不到指定模块时，Node会去这些路径查找。

可以将`NODE_PATH`添加到`.bashrc`。

`export NODE_PATH="/usr/local/lib/node"`

所以，如果遇到复杂的相对路径，比如下面这样。
`var myModule = require('../../../../lib/myModule');`

有两种解决方法，一是将该文件加入`node_modules`目录，二是修改`NODE_PATH`环境变量，`package.json`文件可以采用下面的写法。
```javascript
{
  "name": "node_path",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "NODE_PATH=lib node index.js"
  },
  "author": "",
  "license": "ISC"
}
```
`NODE_PATH`是历史遗留下来的一个路径解决方案，通常不应该使用，而应该使用`node_modules`目录机制。

#### 模块的循环加载
如果发生模块的循环加载，即A加载B，B又加载A，则B将加载A的不完整版本。
```javascript
// a.js
exports.x = 'a1';
console.log('a.js ', require('./b.js').x);
exports.x = 'a2';

// b.js
exports.x = 'b1';
console.log('b.js ', require('./a.js').x);
exports.x = 'b2';

// main.js
console.log('main.js ', require('./a.js').x);
console.log('main.js ', require('./b.js').x);
```
上面代码是三个JavaScript文件。其中，a.js加载了b.js，而b.js又加载a.js。这时，Node返回a.js的不完整版本，所以执行结果如下。
```
$ node main.js
b.js  a1
a.js  b2
main.js  a2
main.js  b2
```

#### require.main
`require`方法有一个`main`属性，可以用来判断模块是直接执行，还是被调用执行。

直接执行的时候（`node module.js`），`require.main`属性指向模块本身。
```javascript
require.main === module
// true
```
调用执行的时候（通过`require`加载该脚本执行），上面的表达式返回`false`。

### 模块的加载机制
CommonJS模块的加载机制是，输入的是被输出的值的拷贝。也就是说，一旦输出一个值，模块内部的变化就影响不到这个值。a模块中导出一个变量和一个更改这个变量的函数，b模块中导入这个变量和函数，在b模块中执行这个函数，变量的值不会改变，因为这个变量已经被a模块导出来了。

### CommonJS模块的特点
1.所有代码都运行在模块作用域，不会污染全局作用域。
2.模块可以多次加载，但是只会在第一次加载时运行一次，然后运行结果就被缓存了，以后再加载，就直接读取缓存结果。要想让模块再次运行，必须清除缓存。
3.模块加载的顺序，按照其在代码中出现的顺序。

### CommonJS模块的优点
1.服务器端便于重用
2.NPM中已经将近20w个模块包
3.简单并容易使用

### CommonJS模块的缺点
1.同步的模块方式不适合不适合在浏览器环境中，同步意味着阻塞加载，浏览器资源是异步加载的
2.不能非阻塞的并行加载多个模块

**注**:以上都是整理阮一峰大神的
