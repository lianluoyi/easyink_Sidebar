import request from '@/utils/request';
const wecom = window.CONFIG.services.wecom;
const service = wecom + '/group';

/**
 * 查看群列表
 * @param {*} params
 * @returns
 */
export function getChatList(params) {
  return request({
    url: service + '/chat/list',
    params
  });
}

/**
 * 获取群成员数量
 * @param {*} params
 * @returns
 */
export function getMemberCount(params) {
  return request({
    url: service + '/chat/getMemberCount',
    params
  });
}
