import request from '@/utils/request';
const service = window.CONFIG.services.wechatopen;

/**
 * 获取中间页域名
 * @param {*} params
 */
export function getMiddlePageDomainName(params) {
  return request({
    url: service + '/getDomain',
    method: 'get',
    params
  });
}

/**
 * 获取开放平台配置
 * @param {*} params
 * @returns
 */
export function getConfig(params) {
  return request({
    url: service + '/config',
    params
  });
}
