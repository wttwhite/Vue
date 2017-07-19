


### 概述
CMD规范和AMD相似，尽量保持简单，并且与CommonJS和NodeJS的Modules规范保持了很大的兼容性。
AMD和CMD都是用`difine`和`require`，但是CMD标准倾向于在使用过程中提出依赖，就是不管代码写到哪突然发现需要依赖另一个模块，那就在当前代码用`require`引入就可以了，规范会帮你搞定预加载，你随便写就可以了。但是AMD标准让你必须提前在头部依赖参数部分写好（没有写好？ 倒回去写好咯）。这就是最明显的区别。

### AMD和CMD的区别
下面这几点是玉伯在知乎上说的。
1. 对于依赖的模块，AMD 是提前执行，CMD 是延迟执行。不过 RequireJS 从 2.0 开始，也改成可以延迟执行（根据写法不同，处理方式不同）。CMD 推崇 as lazy aspossible.
2. CMD 推崇依赖就近，AMD 推崇依赖前置。
3. AMD 的 API 默认是一个当多个用，CMD 的 API 严格区分，推崇职责单一。比如 AMD 里，`require` 分全局 `require` 和局部 `require`，都叫 `require`。CMD 里，没有全局 `require`，而是根据模块系统的完备性，提供 `seajs.use` 来实现模块系统的加载启动。CMD 里，每个 API 都简单纯粹。
 
### AMD和CMD的一些相同
都有`difine`和`require`，而且调用方式实际都可以添加依赖参数，也就是说都可以用提供依赖参数的方式来实现预加载依赖模块（但是不推荐因为  **注意**：带 `id` 和 `deps` 参数的 `define` 用法不属于 CMD 规范，而属于 `Modules/Transport` 规范。
AMD也可以在`factory`中使用`require`来现加载用到的模块，但是这个模块就不会预先加载，属于用到才加载的同步加载了。

### 优点
依赖就近，延迟执行
很容易在node中运行

### 缺点
依赖SPM打包，模块的加载逻辑偏重