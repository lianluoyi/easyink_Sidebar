import Vue from 'vue';
import Vuex from 'vuex';
import getters from './getters';
import materialInfo from './modules/materialInfo';
import customerProperty from './modules/customerProperty';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    userId: '',
    agentConfigStatus: false,
    // 企业ID
    corpId: ''
  },
  modules: {
    materialInfo,
    customerProperty
  },
  getters
});
