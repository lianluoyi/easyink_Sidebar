/*
 * @Description: 雷达接口
 * @Author: xulinbin
 * @LastEditors: broccoli
 */
import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/radar';
// 新增雷达
export function addRadarInfo(data) {
  return request({
    url: service + '/add',
    method: 'post',
    data
  });
}

//  查询雷达列表
export function getRadarList(params) {
  return request({
    url: service + '/list',
    params
  });
}

//  修改雷达
export function updateRadar(data) {
  return request({
    url: service + '/update',
    method: 'put',
    data
  });
}

// 批量删除雷达
export function deleteRadar(data) {
  return request({
    url: service + '/remove',
    method: 'delete',
    data
  });
}

// 获取雷达详情
export function getRadarDetails(params) {
  return request({
    url: service + '/get',
    params
  });
}

// 获取雷达渠道序列
export function getRadarChannelList(params) {
  return request({
    url: service + '/channel/list',
    params
  });
}

// 获取雷达渠道详情
export function getRadarChannelDetails(params) {
  return request({
    url: service + '/channel/get',
    params
  });
}

// 新增雷达渠道
export function addRadarChannel(data) {
  return request({
    url: service + '/channel/add',
    method: 'post',
    data
  });
}

// 批量删除雷达渠道
export function deleteRadarChannel(data) {
  return request({
    url: service + '/channel/remove',
    method: 'delete',
    data
  });
}

//  修改雷达渠道
export function updateRadarChannel(data) {
  return request({
    url: service + '/channel/update',
    method: 'put',
    data
  });
}

// 获取渠道点击记录详情
export function getRadarRecordDetails(params) {
  return request({
    url: service + '/record/getChannelClickRecordDetail',
    params
  });
}

// 雷达详情数据总览
export function getRadarTotal(params) {
  return request({
    url: service + '/record/getTotal',
    params
  });
}

// 客户点击记录
export function getCustomerClickRecord(params) {
  return request({
    url: service + '/record/getCustomerClickRecord',
    params
  });
}

// 客户点击记录详情 (步骤条弹窗)
export function getCustomerClickRecordDetail(params) {
  return request({
    url: service + '/record/getCustomerClickRecordDetail',
    params
  });
}

// 时间段内雷达点击数据统计 (步骤条弹窗 beginTime  endTime)
export function getTimeRangeAnalyseCount(params) {
  return request({
    url: service + '/record/getTimeRangeAnalyseCount',
    params
  });
}

/**
 * 侧边栏获取雷达短链
 * @param {*} params
 * @returns
 */
export function getRadarShortUrl(params) {
  return request({
    url: service + '/getRadarShortUrl',
    params
  });
}

