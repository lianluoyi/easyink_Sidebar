/*
 * @Description: 客户自定义字段列表全局变量
 * @Author: broccoli
 * @LastEditors: broccoli
 */
import { getExtendPropertyList } from '@/api/extendProperty';

const customerPropertyList = {

  state: {
    // 客户自定义字段列表
    customerProperList: []
  },

  mutations: {
    SET_PROPERTY_LIST: (state, list) => {
      state.customerProperList = list;
    }
  },

  actions: {
    // 获取客户自定义字段列表
    GetCustomerProperty({ commit, state }, data = {}) {
      return new Promise((resolve, reject) => {
        getExtendPropertyList(data).then(res => {
          try {
            let resData = [...res.data];
            resData = resData.filter(item => !!item.status);
            commit('SET_PROPERTY_LIST', resData);
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

export default customerPropertyList;
