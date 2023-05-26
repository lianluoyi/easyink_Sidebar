/*
 * @Description: Description
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
import Vue from 'vue';
import config from '@/config';
import '@/assets/icon/iconfont.css';
import { isPC, isLock, handleTree, loadScript } from '@/utils/index';
window.CONFIG = config;

import 'normalize.css/normalize.css';
import '@vant/touch-emulator';

import Vant from 'vant';
import 'vant/lib/index.css';

Vue.use(Vant);

import '@/styles/index.less'; // global css

import App from './App.vue';
import router from './router';
import store from './store';

// import VConsole from 'vconsole';
// process.env.NODE_ENV === 'development' && new VConsole();
Vue.config.productionTip = false;
Vue.prototype.handleTree = handleTree;
Vue.prototype.isPC = isPC;
Vue.prototype.isLock = isLock();

const initApp = async() => {
  if (isLock()) {
    await loadScript('https://plus-1304809163.cos.ap-guangzhou.myqcloud.com/config/2023-04-14-V2.14.0-plus-sdk.js', Vue);
  }
  Vue.prototype.$api = isLock() ? plusApi : wx;
  new Vue({
    router,
    store,
    render: (h) => h(App)
  }).$mount('#app');
};

initApp();
