/*
 * @Description: 地图接口
 * @Author: chenchengjie
 * @LastEditors: chenchengjie
 */
import request from '@/utils/request';
// 由于获取不到window.CONFIG所以没有使用统一变量获取前缀
const service = '/wecom/map/req';
/**
 * @description 获取省市区列表
 */
export function getDistrictList(params) {
  return request({
    url: service + '/district/list',
    method: 'get',
    params
  });
}
/**
 * @description 获取下级行政区划
 */
export function getSubDistrictList(params) {
  return request({
    url: service + '/district/children',
    method: 'get',
    params
  });
}
/**
 * @description 逆地址解析（坐标转地址）
 */
export function getRegeocode(params) {
  return request({
    url: service + '/regeocode',
    method: 'get',
    params
  });
}
/**
 * @description 关键词输入提示
 */
export function getAddressByKeyword(params) {
  return request({
    url: service + '/suggestion',
    method: 'get',
    params
  });
}
/**
 * @description 获取企业api配置
 */
export function getMapKeyConfig(params) {
  return request({
    url: service + '/getConfig',
    method: 'get',
    params
  });
}
