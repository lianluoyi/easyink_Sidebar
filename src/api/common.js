import request from '@/utils/request';
import config from '@/config';
const service = config.services.wecom;
const commonService = config.services.common;
/**
 * 获取应用的jsapi_ticket
 * @param {*} url 页面url
 */
export function getAgentTicket(url, agentId) {
  return request({
    url: service + '/ticket/getAgentTicket',
    params: {
      url,
      agentId
    }
  });
}

/**
 * 获取企业的jsapi_ticket
 * @param {*} url 页面url
 */
export function getAppTicket(url) {
  return request({
    url: service + '/ticket/getAppTicket',
    params: {
      url
    }
  });
}

/**
 * 获取登录用户id
 * @param {*} url 页面url
 */
export function getUserInfo(code, agentId) {
  return request({
    url: service + '/user/getUserInfo',
    params: {
      code,
      agentId
    }
  });
}

/**
 * 获取企业微信配置
 */
export function getCorpInfo(params) {
  return request({
    url: service + '/chat/side/getCorpInfo',
    params
  });
}

/**
 * 上传文件到云存储
 */
export function uploadFile2Cos(data) {
  return request({
    url: commonService + '/uploadFile2Cos',
    method: 'POST',
    data
  });
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/getInfo',
    method: 'get'
  });
}
/**
 * @description 获取登录token
 */
export function lockToken(params) {
  return request({
    url: '/lockToken',
    method: 'get',
    params
  });
}

/**
 * @description 获取lockApi appid和appsecret
 */
export function getLockApiParams(params) {
  return request({
    url: service + '/lockSideBar/get',
    params
  });
}

/**
 * 获取当前服务器类型：是否三方
 */
export function getServerType() {
  return request({
    url: service + '/3rdapp/getServerType',
    method: 'get'
  });
}
