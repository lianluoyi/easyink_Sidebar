import { ICON_LIST, MEDIA_TYPE, DEFAULT_IMG, WX_TYPE, CORP_TYPE, TWO_DIGITS, MS_TO_SECONDS, NUMBER_UNIT, FREQUENT_ERR_MSG, LOCK_ERROR_MSG } from './constants';
import moment from 'moment';
import md5 from 'js-md5';
import { instance } from '@/utils/request';
const MAX_BYTE = 1024;
/**
 * query请求路径参数转为对象
 * @param {*} url
 */
export function param2Obj(url) {
  url = url == null ? window.location.href : url;

  let search = decodeURIComponent(url).split('?')[1];
  search = search && search.split('#')[0];
  if (!search) {
    return {};
  }
  return JSON.parse(
    '{"' +
    search
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"') +
    '"}'
  );
}

/**
 * 计算文件大小
 * @param {*} size
 * @returns
 */
export function filterSize(size) {
  const FIX = 2;
  const POW_B = 1;
  const POW_KB = 2;
  const POW_MB = 3;
  const POW_GB = 4;
  if (!size) return '';
  if (size < pow1024(POW_B)) return size + ' B';
  if (size < pow1024(POW_KB)) return (size / pow1024(POW_B)).toFixed(FIX) + ' KB';
  if (size < pow1024(POW_MB)) return (size / pow1024(POW_KB)).toFixed(FIX) + ' MB';
  if (size < pow1024(POW_GB)) return (size / pow1024(POW_MB)).toFixed(FIX) + ' GB';
  return (size / pow1024(POW_GB)).toFixed(FIX) + ' TB';
}

export function pow1024(num) {
  return Math.pow(MAX_BYTE, num);
}

/**
 * 根据标签id匹配出标签名
 * @param {*} tagList 标签泪奔
 * @param {*} store
 * @returns
 */
export function matchDealtagName(tagList, store) {
  const allTagObj = store.state.materialInfo && store.state.materialInfo.allTagObj;
  const newList = [];
  tagList.map(item => {
    newList.push({ ...item, tagName: allTagObj[item.materialTagId]?.tagName });
  });
  return newList;
}

/**
 * 获取文件后缀名
 * @param {*} url 文件链接
 * @returns 后缀名
 */
export function getSuffix(url) {
  const index = url.lastIndexOf('.');
  const suffix = url.substr(index + 1);
  return suffix;
}

/**
 * 根据url截取文件名
 * @param {*} url
 * @returns
 */
export function getFilename(url) {
  const index = url.lastIndexOf('/');
  const fileName = url.substr(index + 1);
  return fileName;
}

/**
 * 获取文件类型图标class
 */
export function getFileIcon(url) {
  const suffix = getSuffix(url);
  if (ICON_LIST.includes(suffix)) {
    return suffix;
  }
  return dealExtraIcon(suffix);
}

/**
 * 处理后缀与图标名不同的文件类型
 */
export function dealExtraIcon(suffix) {
  const fileObj = {
    'mp2': 'audio',
    'mp3': 'audio',
    'qy2': 'audio',
    'ra': 'audio',
    'ram': 'audio',
    'xlsx': 'excel',
    'xls': 'excel',
    'xlsb': 'excel',
    'xlt': 'excel',
    'xlk': 'excel',
    'xll': 'excel',
    'xlv': 'excel',
    'xlw': 'excel',
    'pptx': 'ppt',
    'mov': 'video',
    'png': 'image',
    'gif': 'image',
    'jpg': 'image',
    'jpeg': 'image',
    'img': 'image',
    'svg': 'image',
    'docx': 'doc',
    'rar': 'zip',
    'tz': 'zip',
    'jsp': 'html',
    'js': 'html',
    'json': 'html',
    'php': 'html',
    'phtml': 'html',
    'py': 'html',
    'pyw': 'html',
    'pyc': 'html',
    'pyd': 'html',
    'shtml': 'html',
    'rm': 'mov',
    'vob': 'mov'
  };
  const suffixName = fileObj[suffix] || 'unknown';
  return suffixName;
}

/**
 * 下载文件
 * @param {*} url 文件路径
 * @param {*} fileName 文件名
 */
export function downloadFile(url, fileName) {
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName); // 下载文件的名称及文件类型后缀
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function dealAllDeviceDownload(url, name, size, _this) {
  if (isPC() && isWindows()) {
    downloadFile(url, name);
  }
  // 移动端采用企微api中预览文件的功能
  if (!isPC()) {
    _this.$api.invoke(
      'previewFile',
      {
        url: url, // 需要预览文件的地址(必填，可以使用相对路径)
        name: name, // 需要预览文件的文件名，必须有带文件格式的后缀，例如.doc(不填的话取url的最后部分，最后部分是个包含格式后缀的文件名)
        size: size && Number(size) // 需要预览文件的字节大小(必填，而且大小必须正确，否则会打开失败)
      });
  }
}

/**
 * 是否为pc端
 * @returns
 */
export function isPC() {
  var userAgentInfo = navigator.userAgent;
  var Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}

/**
 * 是否为windows系统
 * @returns
 */
export function isWindows() {
  return /windows|win32/i.test(navigator.userAgent);
}

/**
 * 是否为windows系统
 * @returns
 */
export function isMac() {
  return /macintosh|mac os x/i.test(navigator.userAgent);
}

/**
 * 是否为企业微信浏览器
 * @returns
 */
export function isWxWork() {
  return /wxwork/i.test(navigator.userAgent?.toLowerCase());
}

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
export function handleTree(data, id, parentId, children) {
  id = id || 'id';
  parentId = parentId || 'parentId';
  children = children || 'children';
  const result = [];
  data = JSON.parse(JSON.stringify(data));
  if (!Array.isArray(data)) {
    return result;
  }
  data.forEach(item => {
    delete item[children];
  });
  const map = {};
  data.forEach(item => {
    map[item[id]] = item;
  });
  data.forEach(item => {
    const parent = map[item[parentId]];
    if (parent) {
      parent[children] || (parent[children] = []);
      parent[children].push(item);
    } else {
      result.push(item);
    }
  });
  return result;
}
export function dealFormat(type, file, _this) {
  let isFormat = true;
  switch (type) {
    case MEDIA_TYPE['POSTER']: {
      isFormat = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
      if (!isFormat) _this.$toast('不支持上传该类型文件，请重新选择');
      return isFormat;
    }
    case MEDIA_TYPE['VIDEO']: {
      isFormat = file.type === 'video/mp4';
      if (!isFormat) _this.$toast('上传文件只能是 mp4 格式!');
      return isFormat;
    }
    default:
      return isFormat;
  }
}

/**
 * 校验上传文件大小
 */
export function dealUploadSize(type, file, _this) {
  const MAX_BYTE = 1024;
  const IMG_BYTE = 2;
  const VIDEO_BYTE = 10;
  const FILE_BYTE = 20;
  let isSize = true;
  switch (type) {
    case MEDIA_TYPE['POSTER']:
    case MEDIA_TYPE['AUDIO']: {
      isSize = file.size / MAX_BYTE / MAX_BYTE < IMG_BYTE;
      if (!isSize) _this.$toast('上传文件大小不能超过 2MB!');
      return isSize;
    }
    case MEDIA_TYPE['VIDEO']: {
      isSize = file.size / MAX_BYTE / MAX_BYTE < VIDEO_BYTE;
      if (!isSize) _this.$toast('上传文件大小不能超过 10MB!');
      return isSize;
    }
    case MEDIA_TYPE['FILE']: {
      isSize = file.size / MAX_BYTE / MAX_BYTE < FILE_BYTE;
      if (!isSize) _this.$toast('上传文件大小不能超过 20MB!');
      return isSize;
    }
    default:
      return isSize;
  }
}

/**
 * @description: 截取掉文件名超出限制的部分
 * @param {*} oldFileName 原有文件名
 * @return {*} 截取后文件名
 */
export function dealImgName(oldFileName, limitFileName) {
  const index = oldFileName.lastIndexOf('.');
  const ext = oldFileName.substring(index);
  const fileName = oldFileName.substring(0, index);
  let newFileName = fileName + ext;
  if (limitFileName) newFileName = fileName.slice(0, limitFileName - ext.length) + ext;
  return newFileName;
}

/**
 * 对排序后的列表重新设置sort
 */
export function dealChildIdList(list, hasNameFlag) {
  const idList = [];
  let sortList = [...list];
  sortList = sortList.reverse();
  sortList.map((item, index) => {
    // 编辑分组时需要带上名字
    if (hasNameFlag) {
      idList.push({
        childId: item.id,
        name: item.name,
        sort: index + 1
      });
    } else {
      idList.push({
        id: item.id,
        sort: index + 1
      });
    }
  });
  return idList;
}
/**
 * 处理超过10M的视频改为用图文链接发送
 */
function dealOverSizeVideo(mes, data, msgtype) {
  const newMes = { ...mes };
  newMes.news = {
    link: data.materialUrl, // H5消息页面url 必填
    title: data.materialName, // H5消息标题
    desc: '点击查看视频', // H5消息摘要
    // H5消息封面图片URL
    imgUrl: data.coverUrl || DEFAULT_IMG['video']
  };
  newMes.msgtype = msgtype[MEDIA_TYPE['IMG_LINK']];
  return newMes;
}
/**
 * @description 修改发送url
 */
function changeSendUrl(item, _this) {
  if ((item.mediaType === MEDIA_TYPE['IMG_LINK'] || item.mediaType === MEDIA_TYPE['MINI_APP']) && item.coverUrl?.startsWith('/profile')) {
    item.coverUrl = window.location.origin + item.coverUrl;
  }
  if (_this.isLock && [MEDIA_TYPE['POSTER'], MEDIA_TYPE['VIDEO'], MEDIA_TYPE['FILE']].includes(item.mediaType) && item.materialUrl?.startsWith('/profile')) {
    item.materialUrl = window.location.origin + item.materialUrl;
  }
  return item;
}
/**
 * 调用企微jsapi进行发消息
 * @param {*} data 消息内容
 * @param {*} _this
 * @param {*} getMaterialMediaId 素材媒体id
 * @param {*} enterChat 为true时表示发送完成之后顺便进入会话，仅移动端3.1.10及以上版本支持该字段
 * @returns
 */
export function sendMessage(data, _this, getMaterialMediaId = () => { }, enterChat = false) {
  if (Array.isArray(data.sendContentList)) {
    data.sendContentList = data.sendContentList.map((k) => {
      return changeSendUrl(k, _this);
    });
  } else {
    data = changeSendUrl(data, _this);
  }
  return new Promise((resolve, reject) => {
    let flag = false;
    let entry;
    const VIDEO_MAX_SIZE = 10;
    // 未配置客户联系权限
    const UN_PERMISSION_TIP_MAC = 'sendChatMessage:permission denied';
    const UN_PERMISSION_TIP_WIN = 'fail_no permission';
    // eslint-disable-next-line complexity
    _this.$api.invoke('getContext', {}, async function(res) {
      if (res.err_msg === 'getContext:ok') {
        entry = res.entry; // 返回进入H5页面的入口类型，目前 contact_profile、single_chat_tools、group_chat_tools
        let mes = { enterChat };
        try {
          if (
            !['single_chat_tools', 'group_chat_tools', 'normal'].includes(
              entry
            )
          ) {
            // _this.$toast.clear()
            _this.$toast('入口错误：' + entry);
            reject('入口错误：' + entry);
            return;
          }

          // mediaType 0 图片（image）、1 语音（voice）、2 视频（video），3 普通文件(file) 4 文本 5 海报
          // msgtype 文本(“text”)，图片(“image”)，视频(“video”)，文件(“file”)，H5(“news”）和小程序(“miniprogram”)
          if (!_this.isLock) {
            const msgtype = {
              [MEDIA_TYPE['POSTER']]: 'image',
              [MEDIA_TYPE['VIDEO']]: 'video',
              [MEDIA_TYPE['FILE']]: 'file',
              [MEDIA_TYPE['IMG_LINK']]: 'news',
              [MEDIA_TYPE['MINI_APP']]: 'miniprogram',
              [MEDIA_TYPE['TEXT']]: 'text'
            };
            mes.msgtype = msgtype[data.mediaType];
            switch (data.mediaType) {
              case MEDIA_TYPE['TEXT']:
                mes.text = {
                  content: data.content // 文本内容
                };
                break;
              case MEDIA_TYPE['POSTER']:
              case MEDIA_TYPE['VIDEO']:
              case MEDIA_TYPE['FILE']: {
                const dataMediaId = {
                  url: data.materialUrl,
                  type: msgtype[data.mediaType],
                  name: data.materialName
                };

                const fileSize = data.content / MAX_BYTE / MAX_BYTE;
                // 视频大于10M则以图文链接形式发出
                if (data.mediaType === MEDIA_TYPE['VIDEO'] && fileSize > VIDEO_MAX_SIZE) {
                  mes = dealOverSizeVideo(mes, data, msgtype);
                } else {
                  const resMaterialId = await getMaterialMediaId(dataMediaId);
                  if (!resMaterialId.data) {
                    _this.$toast('获取素材id失败');
                    reject('获取素材id失败');
                    return;
                  }
                  mes[msgtype[data.mediaType]] = {
                    mediaid: resMaterialId.data.media_id //
                  };
                }
                break;
              }
              case MEDIA_TYPE['IMG_LINK']:
                mes.news = {
                  link: data.materialUrl, // H5消息页面url 必填
                  title: data.materialName, // H5消息标题
                  desc: data.digest, // H5消息摘要
                  // H5消息封面图片URL
                  imgUrl: data.coverUrl || DEFAULT_IMG['link']
                };
                break;
              case MEDIA_TYPE['MINI_APP']:
                mes.miniprogram = {
                  appid: data.appid, // 小程序的appid
                  title: data.materialName, // 小程序消息的title
                  imgUrl: data.coverUrl, // 小程序消息的封面图。必须带http或者https协议头，否则报错 $apiName$:fail invalid imgUrl
                  page: data.materialUrl // 小程序消息打开后的路径，注意要以.html作为后缀，否则在微信端打开会提示找不到页面
                };
                break;
            }
          }
          // _this.$dialog({ message: 'mes：' + JSON.stringify(mes) })
        } catch (err) {
          _this.$dialog({ message: 'err' + JSON.stringify(err) });
        }
        // 响应超时则直接跳过
        const TIME_OUT = 8000;
        const timer = setTimeout(() => {
          reject(`超时抛出${JSON.stringify(mes)}`);
          clearTimeout(timer);
        }, TIME_OUT);
        _this.$api.invoke('sendChatMessage', isLock() ? data : mes, function(resSend) {
          clearTimeout(timer);
          if (resSend.err_msg === 'sendChatMessage:ok') {
            // 发送成功 sdk会自动弹出成功提示，无需再加
            // _this.$toast('发送成功')
            flag = true;
            resolve(resSend);
          } else {
            reject('发送失败');
            // 由于mac和windows返回的错误字段不一样，所以需要做区分。
            const failResType = isMac() ? 'err_msg' : 'errmsg';
            if (data.mediaType === MEDIA_TYPE['MINI_APP']) {
              switch (resSend[failResType]) {
                case 'sendChatMessage:fail, not allow to cross corp': {
                  _this.$toast.fail({
                    message: '小程序未关联企业，发送失败',
                    className: 'miniapp-error-tip'
                  });
                  break;
                }
                case 'sendChatMessage:fail_invalid miniprogram info': {
                  _this.$toast.fail('小程序不存在');
                  break;
                }
                case UN_PERMISSION_TIP_WIN:
                case UN_PERMISSION_TIP_MAC: {
                  _this.$toast.fail('联系管理员配置客户权限');
                  break;
                }
                default: {
                  _this.$toast.fail('发送失败');
                }
              }
              return;
            }
            if ([UN_PERMISSION_TIP_MAC, UN_PERMISSION_TIP_WIN].includes(resSend[failResType])) {
              _this.$toast.fail('联系管理员配置客户权限');
              return;
            }
            _this.$toast.fail('发送失败');
            // 错误处理
            // _this.$dialog({ message: '发送失败：' + JSON.stringify(resSend) })
          }
        });
        _this.$toast.clear();
      } else {
        _this.$toast.clear();
        // 错误处理
        if (_this.isLock && res.err_msg === FREQUENT_ERR_MSG) {
          _this.$dialog({ message: LOCK_ERROR_MSG[FREQUENT_ERR_MSG] });
          reject(LOCK_ERROR_MSG[FREQUENT_ERR_MSG]);
        } else {
          _this.$dialog({ message: '进入失败：' + JSON.stringify(res) });
          reject('进入失败：' + JSON.stringify(res));
        }
      }
    });
    return flag;
  });
}

// 处理客户类型（@后面的显示内容）
// todo 将其他处理统一为调用该方法
export function dealAtInfo(item, typeKey = 'type') {
  return { [WX_TYPE]: '@微信', [CORP_TYPE]: '@' + (item.corpFullName || item.corpName) }[item[typeKey]] || '';
}

/**
 * 处理各种类型自定义字段的显示
 * @param {*} colunmItem
 * @param {*} row
 * @param {*} type
 * @returns
 */
export function dealShowText(colunmItem, row, type) {
  const optionList = colunmItem.optionList;
  if (!row.extendProperties) return;

  switch (type) {
    // 单选类型
    case 'singleType': {
      const proIndex = row.extendProperties.findIndex(item => item.extendPropertyId.toString() === colunmItem.id);
      if (proIndex < 0) return;
      const index = optionList.findIndex(item => item.id === row.extendProperties[proIndex].propertyValue);
      if (index > -1) {
        return { value: optionList[index].multipleValue, optionValue: row.extendProperties[proIndex].propertyValue };
      }
      return { optionValue: null };
    }
    // 多选类型
    case 'mulType': {
      const propertyList = row.extendProperties.filter(item => item.extendPropertyId.toString() === colunmItem.id);
      const valueList = propertyList.map(item => item.propertyValue);
      const propertyValueList = [...valueList] || [];
      const propertyNameList = [];
      propertyValueList.map(valItem => {
        const index = optionList.findIndex(optionItem => optionItem.id === valItem);
        if (index > -1) {
          propertyNameList.push(optionList[index].multipleValue);
        }
      });
      return { value: propertyNameList, optionValue: propertyValueList };
    }
    // 图片/文件（以逗号隔开存储在value）
    case 'imgFile': {
      const propertyList = row.extendProperties.filter(item => item.extendPropertyId.toString() === colunmItem.id);
      const valueList = propertyList.map(item => item.propertyValue);
      const fileList = [];
      valueList.map(valItem => {
        fileList.push({ url: valItem });
      });
      return { value: valueList, fileList };
    }
    case 'fileType': {
      const propertyList = row.extendProperties.filter(item => item.extendPropertyId.toString() === colunmItem.id);
      const valueList = propertyList.map(item => item.propertyValue);
      const newList = [];
      try {
        valueList.map(item => {
          newList.push(JSON.parse(item));
        });
      } catch (e) { console.error('文件信息解析失败', e); }
      return { value: newList };
    }
    // 只存储文字的类型
    case 'textType': {
      const proIndex = row.extendProperties.findIndex(item => item.extendPropertyId.toString() === colunmItem.id);
      if (proIndex < 0) return;
      return { value: row.extendProperties[proIndex].propertyValue };
    }
  }
}

/**
 * 时间转换方法（将date类型转换为 'YYYY-MM-DD'）
 * @param {*} data
 * @returns
 */
export function transferTime(data) {
  const date = new Date(data);
  var Y = date.getFullYear() + '-';
  var M =
    (date.getMonth() + 1 < TWO_DIGITS
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1) + '-';
  var D = date.getDate() < TWO_DIGITS ? '0' + date.getDate() : date.getDate();
  return Y + M + D.toString();
}

const TIME_LENGTH = 10;

// 日期格式化
export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) {
    return null;
  }
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}';
  let date;
  if (typeof time === 'object') {
    date = time;
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time);
    } else if (typeof time === 'string') {
      time = time.replace(new RegExp(/-/gm), '/');
    }
    if ((typeof time === 'number') && (time.toString().length === TIME_LENGTH)) {
      time = time * MS_TO_SECONDS;
    }
    date = new Date(time);
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  };
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    const VAL = 10;
    let value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value]; }
    if (result.length > 0 && value < VAL) {
      value = '0' + value;
    }
    return value || 0;
  });
  return time_str;
}

/**
 * 时间格式转换
 * @param {*} time
 * @param {*} pattern
 * @returns
 */
export function parseDateToTime(time, pattern) {
  return moment(time).format(pattern);
}

/**
 * 深拷贝
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'deepClone');
  }
  const targetObj = source.constructor === Array ? [] : {};
  Object.keys(source).forEach((keys) => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys]);
    } else {
      targetObj[keys] = source[keys];
    }
  });
  return targetObj;
}

/**
 * 计算时间差
 * @param {*} dateStart
 * @param {*} dateEnd
 * @returns
 */
export function diffHour(dateStart, dateEnd) {
  const startDate = moment(dateStart, 'YYYY-MM-DD HH:mm:ss');
  const endDate = moment(dateEnd, 'YYYY-MM-DD HH:mm:ss');
  const hours = endDate.diff(startDate, 'hours');
  return hours;
}

/**
 * @description: 数值转K / 万 四舍五入保留一位小数
 * @param {*} num
 * @return {*}
 */
export function formatNumber(num) {
  return num >= NUMBER_UNIT.K && num < NUMBER_UNIT.W
    ? (num / NUMBER_UNIT.K).toFixed(1) + 'k' : num >= NUMBER_UNIT.W
      ? (num / NUMBER_UNIT.W).toFixed(1) + '万' : num;
}

/**
 * @description: 获取今天时间的格式化
 * @param {*} time
 * @return {*}
 */
export function returnTodayFormat(pattern) {
  return moment().format(pattern);
}

/**
 * @description: 获取N天后的时间的格式化
 * @param {*} time
 * @return {*}
 */
export function returnAfterNDayFormat(pattern, n = 1) {
  return moment().add(n, 'd').format(pattern);
}

/**
 * @description: 生成随机数
 * @return {*}
 */
// eslint-disable-next-line no-magic-numbers
function genRandomNum(count = 18) {
  const t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  const a = t.length;
  let nonce = '';
  for (let i = 0; i < count; i++) {
    nonce += t.charAt(Math.floor(Math.random() * a));
  }
  return nonce;
}

/**
 * @description:  获取签名
 * @param {*} ticket
 * @param {*} nonce    18位验证码
 * @param {*} timeStamp 时间戳
 * @return {*}
 */
function getSignature(ticket, nonce, appId, timeStamp) {
  const headerObj = {
    timestamp: timeStamp,
    'app-id': appId,
    nonce: nonce,
    ticket: ticket
  };
  const headerArr = Object.keys(headerObj).sort();

  let signature = '';
  headerArr.map((item, index) => {
    signature += `${index === 0 ? '' : '&'}${item}=${headerObj[item]}`;
  });
  signature = md5(signature).toUpperCase();
  return signature;
}
/**
 * @description 获取ticket并组装注入参数
 */
export function getTicketAndConfig({ appId, appSecret, _this }) {
  return new Promise((resolve, reject) => {
    instance.get('open_api/getTicket', {
      params: {
        appId,
        appSecret
      }
    }).then((res) => {
      const timeStamp = new Date().getTime();
      const nonce = genRandomNum();
      const params = {
        nonce,
        timeStamp: timeStamp,
        appId: appId,
        ticket: res.data.data,
        signature: getSignature(res.data.data, nonce, appId, timeStamp),
        functionList: ['sendFriendChangeNotice']
      };
      _this.$api.config(params).then((configRes) => {
        resolve(configRes);
      }).catch((err) => {
        reject(err);
      });
    });
  });
}
/**
 * @description 判断是否是lock的环境
 */
export function isLock() {
  return param2Obj(window.location.href).type === 'lock';
}

/**
 * @description 动态加载js文件
 */
export function loadScript(url, _this) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');

    script.onload = () => {
      resolve();
    };

    script.onerror = () => reject(new Error(`Load script  ${url} failed`));

    script.src = url;
    const head =
        document.head || document.getElementsByTagName('head')[0]
      ;(document.body || head).appendChild(script);
  });
}
