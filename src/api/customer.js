/*
 * @Author: broccoli
 * @LastEditors: broccoli
 */
import request from '@/utils/request';
const wecom = window.CONFIG.services.wecom;
const service = wecom + '/customer';
/**
 * 客户资料编辑
 * @param {*} data
 * {
  "externalUserid": "",
  "birthday": ""
}
 */
export function updateCustomerDetail(data) {
  return request({
    url: service,
    method: 'PUT',
    data
  });
}
