import request from '@/utils/request';
import config from '@/config';
const service = config.services.wecom + '/order';
/**
 * 获取工单账号列表接口
 * @param {*} params
 * @returns
 */
export function networkUser(params) {
  return request({
    url: service + '/networkUser',
    method: 'get',
    params
  });
}

/**
 * 获取网点客户列表接口
 * @param {*} params
 * @returns
 */
export function networkCustomer(params) {
  return request({
    url: service + '/networkCustomer',
    method: 'get',
    params
  });
}

/**
 * 获取员工客户绑定信息
 * @param {*} params
 * @returns
 */
export function getBindInfo(params) {
  return request({
    url: service + '/getBindInfo',
    method: 'get',
    params
  });
}

/**
 * 绑定员工工单账号
 * @param {*} data
 * @returns
 */
export function bindUser(data) {
  return request({
    url: service + '/bindUser',
    method: 'post',
    data,
    disableErrMsg: true
  });
}

/**
 * 绑定客户
 * @param {*} data
 * @returns
 */
export function bindCustomer(data) {
  return request({
    url: service + '/bindCustomer',
    method: 'post',
    data
  });
}

/**
 * 工单列表接口
 * @param {*} data
 * @returns
 */
export function listOrder(data) {
  return request({
    url: service + '/listOrder',
    method: 'post',
    data
  });
}

/**
 * 解绑客户
 * @param {*} data
 * @returns
 */
export function unbindCustomer(data) {
  return request({
    url: service + '/unbindCustomer',
    method: 'post',
    data
  });
}

/**
 * 工单详情接口
 * @param {*} data
 * @returns
 */
export function descOrder(data) {
  return request({
    url: service + '/descOrder',
    method: 'post',
    data
  });
}

/**
 * 工单状态变更接口
 * @param {*} data
 * @returns
 */
export function handleOrder(data) {
  return request({
    url: service + '/handleOrder',
    method: 'post',
    data
  });
}

/**
 * 工单数统计接口
 * @param {*} data
 * @returns
 */
export function totalNumOrder(data) {
  return request({
    url: service + '/totalNumOrder',
    method: 'post',
    data
  });
}
