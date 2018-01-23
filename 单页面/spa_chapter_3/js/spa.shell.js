spa.shell = (function () {
/* 
  作用域内的变量 
*/
  var configMap = {
    anchor_schema_map: {
      //定义给uriAnchor使用的映射,用于验证
      chat: {open: true, closed: true}
    },
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
    anchor_map: {},//将当前锚的值保存在表示模块状态的映射中
    is_chat_retracted: true // 列出所有会用到的键
  }, //存放整个模块中共享的动态信息
  jqueryMap = {}, //jquery集合缓存
  setJqueryMap, initModule,
  copyAnchorMap,changeAnchorPart,onHashchange,  //锚使用到的方法
  // 滑块的事件
  toggleChat, onClickChat;
  /*
    utility methods start 保留区域,这些函数不和页面元素交互 
  */
  copyAnchorMap = function(){ //使用jquery的extend方法来复制对象,这是必须的,因为js的对象都是按引用传递的
    return $.extend(true, {}, stateMap.anchor_map);
  },
  /* utility methods end */
  /*
    Dom methods start 创建和操作页面元素 
  */
  changeAnchorPart = function(arg_map){
    var anchor_map_revise = copyAnchorMap(),
        bool_return = true,
        key_name,key_name_dep;
    KEYVAL:
    for (key_name in arg_map) {
      if(arg_map.hasOwnProperty(key_name)){
        if(key_name.indexOf('_')===0){
          continue KEYVAL;
        }
        anchor_map_revise[key_name] = arg_map[key_name];
        key_name_dep = '_' + key_name;
        if(arg_map[key_name_dep]){
          anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
        } else {
          delete anchor_map_revise[key_name_dep];
          delete anchor_map_revise['_s' +key_name_dep];
        }
      }
    }
    try {   //如果不能让通过模式(schema)验证就不设置锚(uriAnchor会抛出异常),当发生这种情况时,把锚组件回滚到它之前的状态
      $.uriAnchor.setAnchor( anchor_map_revise);
    } catch (error) {
      $.uriAnchor.setAnchor( stateMap.anchor_map,null,true);
      bool_return = false;
    }
    return bool_return;
  },
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
    // if (toggleChat (stateMap.is_chat_retracted)) {
    //   // 改变URI参数 #!chat = open
    //   // 跟在哈希后的!,用于告诉搜索引擎,这个URI可被搜索索引
    //   $.uriAnchor.setAnchor({
    //     chat: (stateMap.is_chat_retracted? 'open': 'closed')
    //   })
    // }
    changeAnchorPart({
      chat: (stateMap.is_chat_retracted? 'open': 'closed')
    })
    return false;
  },
  // 处理URI锚变化,使用uriAnchor插件来将锚转换为映射,与之前的状态比较,以便确定要采用的动作.
  // 如果提议的锚变化是无效的,则将锚重置为之前的值
  onHashchange = function(event) {
    var anchor_map_previous = copyAnchorMap(),
        anchor_map_proposed,
        _s_chat_previous,_s_chat_proposed,
        s_chat_proposed;
    try{
      anchor_map_proposed = $.uriAnchor.makeAnchorMap();
    } catch(error) {
      $.uriAnchor.setAnchor(anchor_map_previous, null, true);
      return false
    }
    stateMap.anchor_map = anchor_map_proposed;
    _s_chat_previous = anchor_map_previous._s_chat;
    _s_chat_proposed = anchor_map_proposed._s_chat;
    if(!anchor_map_previous || _s_chat_previous !== _s_chat_proposed){
      s_chat_proposed = anchor_map_proposed.chat;
      switch(s_chat_proposed){
        case 'open':toggleChat(true);break;
        case 'closed':toggleChat(false);break;
        default:
          toggleChat(false);
          delete anchor_map_proposed.chat;
          $.uriAnchor.setAnchor(anchor_map_proposed,null,true)
      }
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
    // // 测试滑块功能
    // //setTimeout(function(){toggleChat(true);},3000)
    // //setTimeout(function(){toggleChat(false);},8000)
    stateMap.is_chat_retracted = true
    jqueryMap.$chat.attr('title', configMap.chat_retracted_title).click(onClickChat)
    $.uriAnchor.configModule({  //配置uriAnchor插件,用于检测模式(schema)
      schema_map: configMap.anchor_schema_map
    });
    // 绑定hashchange事件处理程序并立即触发它,这样模块在初始加载时就会处理书签
    $(window).bind('hashchange',onHashchange).trigger('hashchange');
  }
  /* public methods end */
  return {initModule: initModule};
})()