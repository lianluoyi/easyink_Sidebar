import request from '@/utils/request';

/**
 * 在职继承
 */
export const transfer = (data) => {
  return request({
    url: '/wecom/transfer',
    method: 'post',
    data
  });
};

/**
 * 获取继承设置
 */
export const getTransferConfig = () => {
  return request({
    url: '/wecom/transfer/config',
    method: 'get'
  });
};
