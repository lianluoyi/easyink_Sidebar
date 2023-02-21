import { getToken } from '@/utils/auth';

const config = {
  /**
   * @description token在Cookie中存储的天数，默认1天
   */
  cookieExpires: 1,
  /**
   * @description 默认打开的首页的路由name值，默认为home
   */
  homeName: 'home',
  get headers() {
    return { Authorization: 'Bearer ' + getToken() };
  }
};

config.services = {
  wecom: '/wecom',
  common: '/common',
  wechatopen: '/wechatopen'
};

export default config;
