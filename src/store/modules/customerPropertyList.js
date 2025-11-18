/*
 * @Description: 客户自定义字段列表全局变量
 * @Author: broccoli
 * @LastEditors: broccoli
 */
import { getExtendPropertyList } from '@/api/extendProperty';
import { CUSTOMER_PROPERTY_VALUE } from '@/utils/constants';
import { getDistrictList, getMapKeyConfig } from '@/api/map';
const customerPropertyList = {

  state: {
    // 客户自定义字段列表
    customerProperList: [],
    // 地图接口key
    apiKey: '',
    // 省市区列表
    districtList: []
  },

  mutations: {
    SET_PROPERTY_LIST: (state, list) => {
      state.customerProperList = list;
    },
    SET_DISTRICT_LIST: (state, data) => {
      state.districtList = data;
    },
    SET_API_KEY: (state, data) => {
      state.apiKey = data;
    }
  },

  actions: {
    // 获取客户自定义字段列表
    GetCustomerProperty({ commit, state, rootState }, data = {}) {
      return new Promise((resolve, reject) => {
        getExtendPropertyList(data).then(res => {
          try {
            let resData = [...res.data];
            resData = resData.filter(item => !!item.status);
            commit('SET_PROPERTY_LIST', resData);
            if (resData.some(item => item.type === CUSTOMER_PROPERTY_VALUE['address'])) {
              // 若包含地址字段，调用接口获取data
              getAddressData(commit, rootState);
            }
            resolve(res);
          } catch (err) {
            throw new Error(err);
          }
        }).catch(error => {
          reject(error);
        });
      });
    }
  }
};

const getAddressData = (commit, rootState) => {
  getMapKeyConfig({ corpId: rootState.corpId }).then((res) => {
    commit('SET_API_KEY', res.data?.iframeApiKey || '');
  });
  getDistrictList({ corpId: rootState.corpId })
    .then((res) => {
      commit('SET_DISTRICT_LIST', res.data.result);
    })
    .catch((err) => {
      console.log('地址数据获取失败', err);
    });
};

export default customerPropertyList;
