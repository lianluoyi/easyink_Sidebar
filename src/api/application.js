import request from '@/utils/request';
const wecom = window.CONFIG.services.wecom;
const service = wecom + '/application';

/**
 * 获取我的应用列表-侧边栏
 * @param {*} params
 * @returns
 */
export function getMyApplicationList2Sidebar(params) {
  return request({
    url: service + '/getMyApplicationList2Sidebar',
    params
  });
}

/**
 * 获取应用中心应用详情
 */
export function getApplicationDetail(params) {
  return request({
    url: service + '/getApplicationDetail',
    params
  });
}
