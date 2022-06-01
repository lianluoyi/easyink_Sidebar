/*
 * @Description: 素材库相关全局变量
 * @Author: broccoli
 * @LastEditors: broccoli
 */
import { getMaterialTagList } from '@/api/material';

const materialInfo = {

  state: {
    // 所有素材标签，以素材id为key
    allTagObj: {}
  },

  mutations: {
    SET_MATERIAL_TAG: (state, tagList) => {
      const tagObj = {};
      tagList.map(item => {
        tagObj[item.id] = item;
      });
      state.allTagObj = tagObj;
    }
  },

  actions: {
    // 获取素材类目
    // 获取所有素材标签列表
    GetMaterialTag({ commit, state }) {
      return new Promise((resolve, reject) => {
        getMaterialTagList({}).then(res => {
          try {
            commit('SET_MATERIAL_TAG', res.data);
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

export default materialInfo;
