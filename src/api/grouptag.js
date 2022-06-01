/*
 * @Description: 客户群标签相关接口
 * @Author: broccoli
 * @LastEditors: broccoli
 */

import request from '@/utils/request';
const wecom = window.CONFIG.services.wecom;
const service = wecom + '/grouptag';

/**
 * 客户群标签列表获取
 * @param {*} params
 * {
    "pageNum": "当前页",
    "pageSize": "每页显示条数",
    "groupName": "标签组名"
}
 * @returns
 */
export function getGroupTagList(params) {
  return request({
    url: service + '/list',
    params
  });
}

/**
 * 批量打标签
 * @param {*} data
 */
export function batchAddTagRel(data) {
  return request({
    url: service + '/batchAddTagRel',
    method: 'post',
    data
  });
}

/**
 * 批量移除标签
 * @param {*} data
 */
export function batchDelTagRel(data) {
  return request({
    url: service + '/batchDelTagRel',
    method: 'post',
    data
  });
}

