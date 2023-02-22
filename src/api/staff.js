import request from '@/utils/request';

// 查询员工列表
export function listStaff(query) {
  return request({
    url: '/wecom/user/listOfUser',
    method: 'get',
    params: query
  });
}
// 查询用户详细
export function getUserInfo(params) {
  return request({
    url: '/wecom/user/' + params?.userId,
    method: 'get'
  });
}
