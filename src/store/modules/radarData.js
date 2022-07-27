/*
 * @Description: 雷达板块需要的数据
 * @Author: xulinbin
 * @LastEditors: xulinbin
 */
export default {
  namespaced: true,
  state: () => {
    return {
      radarId: '', // 雷达ID
      radarDetailsIsShow: false, // 雷达详情模块是否展示
      radarChannelIsShow: false // 雷达自定义渠道是否展示
    };
  },
  actions: {
  },
  mutations: {

    changeRadarId(state, radarId) {
      state.radarId = radarId;
    },

    changeRadarDetailsIsShow(state, bool) {
      state.radarDetailsIsShow = bool;
    },

    changeRadarChannelIsShow(state, bool) {
      state.radarChannelIsShow = bool;
    }
  }
};
