import axios from 'axios';
import { Dialog } from 'vant';
import { SUCCESS_CODE, EXIST_CODE } from '@/utils/constants';
import { getToken } from '@/utils/auth';

const TIMEOUT = 100000;
function createAxios(baseURL) {
  const instance = axios.create({
    baseURL,
    headers: {
      Auth_token: ''
    },
    timeout: TIMEOUT
  });
  // 请求拦截
  instance.interceptors.request.use(
    (config) => {
      // console.log('request config: ' + JSON.stringify(config))
      if (getToken()) {
        config.headers = window.CONFIG.headers; // 让每个请求携带自定义token 请根据实际情况自行修改
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  // 响应拦截
  instance.interceptors.response.use(
    (res) => {
      // console.log('res: ' + res)
      const { data, status } = res;
      // code 0:成功，-1/其它:错误
      if (status === SUCCESS_CODE && data.code === SUCCESS_CODE) {
        return data;
      } else if (data.code === EXIST_CODE) {
        // Message.error({
        //   content: `产品已存在`,
        //   duration: 3
        // })
      } else {
        addErrorLog(res);
      }
      return Promise.reject(data);
    },
    (error) => {
      if (error.response) {
        addErrorLog(error.response);
      } else {
        Dialog({ message: '服务器未启动或连接超时' });
        console.error('服务器未启动或连接超时');
      }
      return Promise.reject(error);
    }
  );
  // 错误日志
  const addErrorLog = (errorInfo) => {
    const {
      request: { responseText, responseURL }
    } = errorInfo;
    // let info = {
    //   type: 'ajax',
    //   code: status,
    //   mes: statusText,
    //   url: responseURL
    // }
    // if (!responseURL.includes('save_error_logger')) store.dispatch('addErrorLog', info)
    process.env.NODE_ENV === 'development'
      ? console.error(`错误: 路径: ${responseURL}, 返回值 : ${responseText}`)
      : console.error(`${JSON.parse(responseText).msg}`);
    const disableErrMsg = errorInfo.config.disableErrMsg;
    if (!disableErrMsg) Dialog({ message: `${JSON.parse(responseText).msg}` });
  };

  return instance;
}

// 第二个代理基础路径配置
export const instance = axios.create({
  baseURL: process.env.VUE_APP_BASE_LOCK_API
});
instance.defaults.timeout = TIMEOUT;

export default createAxios(process.env.VUE_APP_BASE_API);
