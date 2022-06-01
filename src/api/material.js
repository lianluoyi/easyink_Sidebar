import request from '@/utils/request';
// 由于获取不到window.CONFIG所以没有使用统一变量获取前缀
const service = '/wecom/material';

/**
 * 获取素材标签列表
 * @param {*} params { tagName(标签名) }
 * @returns
 */
export function getMaterialTagList(params) {
  return request({ url: service + '/listTagByName', params });
}
