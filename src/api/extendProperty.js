/*
 * @Author: broccoli
 * @LastEditors: broccoli
 */
import request from '@/utils/request';
// 由于获取不到window.CONFIG所以没有使用统一变量获取前缀
const service = '/wecom/extendProperty';

/**
 * 获取客户扩展属性列表
 * @param {*} params
 * @returns
 */
export function getExtendPropertyList(params) {
  return request({
    url: service + '/list',
    params
  });
}
