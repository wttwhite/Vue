spa.shell = (function () {
/* 
  作用域内的变量 
*/
  var configMap = {
    main_html: String()  //整体布局
    +'<div class="spa-shell-head">'
      +'<div class="spa-shell-head-logo"></div>'
      +'<div class="spa-shell-head-acct"></div>'
      +'<div class="spa-shell-head-search"></div>'
    +'</div>'  
    +'<div class="spa-shell-main spa-x-closed">'
      +'<div class="spa-shell-main-nav"></div>'
      +'<div class="spa-shell-main-content"></div>'
    +'</div> ' 
    +'<div class="spa-shell-foot"></div>'
    +'<div class="spa-shell-chat"></div>'
    +'<div class="spa-shell-modal"></div>',
    // 滑块的时间和高度
    chat_extend_time: 1000,
    chat_retract_time: 300,
    chat_extend_height: 450,
    chat_retract_height: 15,
    chat_extended_title: 'click to retract',
    chat_retracted_title: 'click to extend'
  },
  stateMap = {
    $container: null,
    is_chat_retracted: true // 列出所有会用到的键
  }, //存放整个模块中共享的动态信息
  jqueryMap = {}, //jquery集合缓存
  setJqueryMap, initModule,
  // 滑块的事件
  toggleChat, onClickChat;
  /*
    utility methods start 保留区域,这些函数不和页面元素交互 
  */
  //
  /* utility methods end */
  /*
    Dom methods start 创建和操作页面元素 
  */
  // setJqueryMap缓存jQuery集合,几乎每个shell和功能模块都应该有这个函数
  // 用途是可以大大减少jQuery对文档的遍历次数,能够提高性能
  setJqueryMap = function (){
    var $container = stateMap.$container;
    jqueryMap = {
      $container: $container,
      $chat: $container.find('.spa-shell-chat')
    };
  }
  toggleChat = function(do_extend, callback){
    var px_chat_ht = jqueryMap.$chat.height(),
        is_open = px_chat_ht === configMap.chat_extend_height,
        is_close = px_chat_ht === configMap.chat_retract_height,
        is_sliding = !is_close && !is_open;
    // 避免出现同时展开和收起    
    if (is_sliding) {return false;}
    if (do_extend) {
      jqueryMap.$chat.animate(
        {height: configMap.chat_extend_height},configMap.chat_extend_time,function(){
          jqueryMap.$chat.attr(
            'title', configMap.chat_extended_title
          );
          stateMap.is_chat_retracted = false
          if (callback) {callback(jqueryMap.$chat)}
        }
      )
      return true;
    }
    jqueryMap.$chat.animate(
      {height: configMap.chat_retract_height},configMap.chat_retract_time,function(){
        jqueryMap.$chat.attr(
            'title', configMap.chat_retracted_title
          );
          stateMap.is_chat_retracted = true
        if (callback) {callback(jqueryMap.$chat)}
      }
    )
    return true;
  }
  /* Dom methods end */
  /* 
    event handlers start 为jQuery事件处理函数保留区块
  */
  onClickChat = function (event) {
    if (toggleChat (stateMap.is_chat_retracted)) {
      // 改变URI参数 #!chat = open
      // 跟在哈希后的!,用于告诉搜索引擎,这个URI可被搜索索引
      $.uriAnchor.setAnchor({
        chat: (stateMap.is_chat_retracted? 'open': 'closed')
      })
    }
    return false;
  }
  /* event handlers end */
  /* 
    public methods start 公开方法 
  */
  initModule = function ($container) {
    stateMap.$container = $container;
    $container.html(configMap.main_html);
    setJqueryMap();
    // 测试滑块功能
    //setTimeout(function(){toggleChat(true);},3000)
    //setTimeout(function(){toggleChat(false);},8000)
    stateMap.is_chat_retracted = true
    jqueryMap.$chat.attr('title', configMap.chat_retracted_title).click(onClickChat)
  }
  /* public methods end */
  return {initModule: initModule};
})()