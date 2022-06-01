import request from '@/utils/request';

// 查询员工列表
export function listStaff(query) {
  return request({
    url: '/wecom/user/listOfUser',
    method: 'get',
    params: query
  });
}
