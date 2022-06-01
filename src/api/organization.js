import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/department';

/**
 * 获取所有部门
 * @param {*} params
 * {
  "id": "部门id ",
  "name": "部门名称",
  "parentId": "父节点id "
}
 */
export function getTree(params) {
  return request({
    url: service + '/list',
    params
  });
}
