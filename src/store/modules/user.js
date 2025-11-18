import { getInfo } from '@/api/common';
const user = {
  state: {
    permissions: []
  },
  mutations: {
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions;
    }
  },
  actions: {
    GetInfo({ commit }) {
      return new Promise((resolve, reject) => {
        getInfo().then(res => {
          try {
            const resUser = res.data;
            commit('SET_PERMISSIONS', resUser.permissions);
            resolve(res);
          } catch (err) {
            throw new Error();
          }
        }).catch(error => {
          reject(error);
        });
      });
    }
  }
};

export default user;
