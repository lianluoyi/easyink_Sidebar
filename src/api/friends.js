/*
 * @Description: 获取朋友圈
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/moment';
/**
 * 获取朋友圈任务基础信息
 * @param {*} params
 * @returns
 */
export function getMomentTaskBasicInfo(params) {
  return request({
    url: service + '/getMomentTask',
    method: 'get',
    params
  });
}
/**
 * 修改员工朋友圈执行详情（h5个人朋友圈）
 * @param {*} data
 */
export function updateUserMoment(data) {
  return request({
    url: service + '/updateUserMoment',
    method: 'put',
    params: data
  });
}

