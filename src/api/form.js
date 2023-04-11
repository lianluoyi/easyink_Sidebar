/*
 * @Description: 智能表单接口
 * @Author: xulinbin
 * @LastEditors: wJiaaa
 */
import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/form';

/**
 * 表单分组树
 * @param {*} params
 * @returns
 */
export function getGroupTree(params) {
  return request({
    url: service + '/group/tree',
    method: 'get',
    params
  });
}

/**
 * 获取表单数据
 * @param {*} params
 * @returns
 */
export function getFormPageList(params) {
  return request({
    url: service + '/page',
    method: 'get',
    params
  });
}

/**
 * 获取表单使用记录
 * @param {*} params
 * @returns
 */
export function getFormRecord(params) {
  return request({
    url: service + '/use/record/page/record',
    method: 'get',
    params
  });
}

/**
 * 添加表单最近发送记录
 * @param {*} params
 */
export function addSendFormRecord(params) {
  return request({
    url: service + '/use/record/add',
    method: 'get',
    params
  });
}

/**
 * @description 获取表单链接
 * @param params
 */
export function getSendFormUrl(params) {
  return request({
    url: service + '/genFormUrl',
    method: 'get',
    params
  });
}
