/*
 * @Description: 话术库
 * @Author: broccoli
 * @LastEditors: wJiaaa
 */
import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/wordsGroup';

/**
 * 获取话术列表
 * @param {*} data
 * @returns
 */
export function getWordsList(data) {
  return request({
    url: service + '/listOfWords',
    method: 'post',
    data
  });
}

/**
 * 添加话术
 * @param {*} data
 * @returns
 */
export function addWords(data) {
  return request({
    url: service + '/add',
    method: 'post',
    data
  });
}

/**
 * 修改话术
 * @param {*} data
 * @returns
 */
export function updateWords(data) {
  return request({
    url: service + '/update',
    method: 'post',
    data
  });
}
/**
 * 修改话术排序
 * @param {*} data
 * @returns
 */
export function changeWordsSort(data) {
  return request({
    url: service + '/changeSort',
    method: 'post',
    data
  });
}
/**
 * 保存或更新最近使用
 * @param {*} data
 * @returns
 */
export function addOrUpdateLastUse(data) {
  return request({
    url: service + '/addOrUpdateLastUse',
    method: 'post',
    data
  });
}

/**
 * 获取最近使用话术列表
 * @param {*} data
 * @returns
 */
export function getLastUse(params) {
  return request({
    url: service + '/getLastUse',
    params
  });
}

/**
 * 删除话术
 * @param {*} data
 * @returns
 */
export function deleteWords(data) {
  return request({
    url: service + '/delete',
    method: 'delete',
    data
  });
}
/**
 * 话术获取链接信息
 * @param {*} params
 * @returns
 */
export function getWordsUrlContent(params) {
  return request({
    url: service + '/getUrlContent',
    method: 'get',
    params
  });
}
