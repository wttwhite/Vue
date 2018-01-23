spa.chat = (function(){
  var configMap = {
    main_html: String()
    +'<div>'
      +'say hello'
    +'</div>',
    settable_map: {}
  },
    stateMap = {  //存放整个模块中共享的动态信息
      $container: null,
    }, 
    jqueryMap = {}, //jquery集合缓存
    setJqueryMap, configModule, initModule;
  setJqueryMap = function (){
    var $container = stateMap.$container;
    jqueryMap = {
      $container: $container
    };
  },
  configModule = function( input_map ){
    spa.util.setConfigMap({
      input_map: input_map,
      settable_map: configMap.settable_map,
      config_map: configMap
    })
    return true;
  }
  initModule = function ($container) {
    stateMap.$container = $container;
    $container.html(configMap.main_html);
    setJqueryMap();
    return true;
  }
  return {  //这两个方法几乎是所有功能模块的标配方法
    configModule: configModule,
    initModule: initModule
  }
})()