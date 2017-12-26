import Vue from 'vue'
import Router from 'vue-router'
// 引入创建的4个页面
import Home from '@/view/home/home'
import Explorer from '@/view/explorer/explorer'
import Cart from '@/view/cart/cart'
import Me from '@/view/me/me'

// 使用路由实例插件
Vue.use(Router)

export default new Router({
  // 使用history模式,充分利用history.pushStatus API来完成URL跳转而无须重新加载页面
  // 不使用history模式: http://localhost/#/home(hash模式) ,反之 http://localhost/home
  mode: 'history',
  // 应用的基路径,当在HTML5history模式下使用base选项后,所有的to属性都不需要写基路径了
  // 例如,整个单页应用服务在/app/下,那么base就应该设为'/app/'
  base: '',
  routes: [
    {name: 'Home', path: '/home', component: Home},
    {name: 'Explorer', path: '/explorer', component: Explorer},
    {name: 'Cart', path: '/cart', component: Cart},
    {name: 'Me', path: '/me', component: Me}
    // {
    //   path: '*',
    //   name: 'NotFound',
    //   component: NotFound
    // }
  ]
})
