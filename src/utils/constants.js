/*
 * @Description: 公共常量
 * @Author: broccoli
 * @LastEditors: wJiaaa
 */

// 接口请求成功状态码
export const SUCCESS_CODE = 200;
// 产品已存在状态码
export const EXIST_CODE = 201;

// 触发显示按钮的长按时长
export const TOUCH_DELAY = 750;

const SOP_TASK = 2;
// taskType 0: 全部  1: 老客标签建群  2: 群SOP
export const TASK_TYPE = {
  'old': 1,
  'sop': SOP_TASK
};

// 两位数
export const TWO_DIGITS = 10;

// 信息动态
const INFORMATION_TYPE = 1;
// 社交动态
const SOCIAL_TYPE = 2;
// 活动规则
const ACTIVITY_TYPE = 3;
// 待办动态
const BACKLOG_TYPE = 4;

// trajectoryType: 轨迹类型
export const TRAJECTORY_TYPE = {
  'news': INFORMATION_TYPE,
  'social': SOCIAL_TYPE,
  'activity': ACTIVITY_TYPE,
  'backlog': BACKLOG_TYPE
};
// trajectoryType: 轨迹类型对应的英文
export const TRAJECTORY_TYPE_FIELD = {
  [INFORMATION_TYPE]: 'News',
  [SOCIAL_TYPE]: 'Social',
  [ACTIVITY_TYPE]: 'Activity',
  [BACKLOG_TYPE]: 'Backlog'
};

// 消息类型 文本(“text”)，图片(“image”)，视频(“video”)，文件(“file”)，H5(“news”）和小程序(“miniprogram”)
// 海报
const MEDIA_TYPE_POSTER = 0;
// 语音
const MEDIA_TYPE_AUDIO = 1;
// 视频
const MEDIA_TYPE_VIDEO = 2;
// 普通文件
const MEDIA_TYPE_FILE = 3;
// 文字
const MEDIA_TYPE_TEXT = 4;
// 图文链接
const MEDIA_TYPE_IMGLINK = 5;
// 小程序
const MEDIA_TYPE_MINIAPP = 6;
// 素材类型
export const MEDIA_TYPE = {
  // 海报
  'POSTER': MEDIA_TYPE_POSTER,
  // 语音
  'AUDIO': MEDIA_TYPE_AUDIO,
  // 视频
  'VIDEO': MEDIA_TYPE_VIDEO,
  // 普通文件
  'FILE': MEDIA_TYPE_FILE,
  // 图文链接
  'IMG_LINK': MEDIA_TYPE_IMGLINK,
  // 小程序
  'MINI_APP': MEDIA_TYPE_MINIAPP,
  'TEXT': MEDIA_TYPE_TEXT
};

// 链接默认摘要
export const IMG_LINK_DIGEST = '请点击查看链接';

// 图标名与文件后缀名一致的后缀名列表
export const ICON_LIST = ['ai', 'pdf', 'zip', 'exe', 'csv', 'html', 'ppt', 'mp4', 'psd', 'txt', 'xml', 'doc'];

// 企业话术
const ENTERPRISE_VERBAL_TRICK = 0;
// 部门话术
const DEPARTMENT_VERBAL_TRICK = 1;
// 我的话术
const PERSONAL_VERBAL_TRICK = 2;

// 话术类型
export const VERBAL_TRICK_TYPE = {
  'enterprise': ENTERPRISE_VERBAL_TRICK,
  'department': DEPARTMENT_VERBAL_TRICK,
  'personal': PERSONAL_VERBAL_TRICK
};

// 每页大小
export const PAGE_LIMIT = 10;

// 各类素材默认图片
export const DEFAULT_IMG = {
  'video': 'https://wecomsaas-1253559996.cos.ap-guangzhou.myqcloud.com/2022/01/19/defauluVedio.jpg',
  'link': 'https://wecomsaas-1253559996.cos.ap-guangzhou.myqcloud.com/2022/01/19/飞书20220119-204645.jpg'
};

// 客户类型
// 微信客户
export const WX_TYPE = 1;
// 外部企业客户
export const CORP_TYPE = 2;

export const GENDER_OF_MALE = 1;
export const GENDER_OF_FEMALE = 2;
export const GENDER_OF_UNKNOWN = 3;
// 性别
export const GENDER_TYPE = {
  [GENDER_OF_MALE]: '男',
  [GENDER_OF_FEMALE]: '女',
  [GENDER_OF_UNKNOWN]: '未知'
};

const UNKNOW_SOURCE = 0;
const ADD_BY_QRCODE = 1;
const ADD_BY_PHONE = 2;
const ADD_BY_BUSINESS_CARD = 3;
const ADD_BY_GROUP = 4;
const ADD_BY_PHONE_CONTACT = 5;
const ADD_BY_WX_CONTACT = 6;
const ADD_BY_WX = 7;
const ADD_BY_THIRD_APP_AUTO = 8;
const ADD_BY_MAIL = 9;
const ADD_BY_INTERNAL_SHARE = 201;
const ADD_BY_ADMIN = 202;
export const ADD_WAY_MAP = {
  [UNKNOW_SOURCE]: '未知来源',
  [ADD_BY_QRCODE]: '通过扫描二维码添加',
  [ADD_BY_PHONE]: '通过搜索手机号添加',
  [ADD_BY_BUSINESS_CARD]: '通过名片分享添加',
  [ADD_BY_GROUP]: '通过群聊添加',
  [ADD_BY_PHONE_CONTACT]: '通过手机通讯录添加',
  [ADD_BY_WX_CONTACT]: '通过微信联系人添加',
  [ADD_BY_WX]: '通过来自微信的添加好友申请添加',
  [ADD_BY_THIRD_APP_AUTO]: '通过安装第三方应用时自动添加的客服人员添加',
  [ADD_BY_MAIL]: '通过搜索邮箱添加',
  [ADD_BY_INTERNAL_SHARE]: '通过内部成员共享添加',
  [ADD_BY_ADMIN]: '通过管理员/负责人分配添加'
};

const SYS_FIELD = 1;
const SINGLE_TEXT = 2;
const MUL_TEXT = 3;
const SINGLE_RADIO = 4;
const MUL_RADIO = 5;
const SELECT_SINGLE = 6;
const DATE_FIELD = 7;
const IMG_FIELD = 8;
const FILE_FIELD = 9;

// 客户字段类型值
export const CUSTOMER_PROPERTY_VALUE = {
  'sysField': SYS_FIELD,
  'singleText': SINGLE_TEXT,
  'mulText': MUL_TEXT,
  'singleRadio': SINGLE_RADIO,
  'mulRadio': MUL_RADIO,
  'selectSingle': SELECT_SINGLE,
  'dateField': DATE_FIELD,
  'img': IMG_FIELD,
  'file': FILE_FIELD
};

export const MS_TO_SECONDS = 1000;
export const DEFAULT_LINK = false; // 默认链接
export const CUSTOM_LINK = true; // 自定义链接
export const UPLOAD_ACCEPT = {
  [MEDIA_TYPE['POSTER']]: 'image/*',
  [MEDIA_TYPE['VIDEO']]: 'video/mp4',
  [MEDIA_TYPE['FILE']]: '*'
};

const CUSTOMER_SOP = 0;
const GROUP_SOP = 1;
const GROUPCALENDAR_SOP = 2;

export const SOP_TYPE = {
  'customer': CUSTOMER_SOP,
  'group': GROUP_SOP,
  'groupCalendar': GROUPCALENDAR_SOP
};

export const ORDERTYPE_TEXT = {
  // eslint-disable-next-line no-magic-numbers
  5775: '催件',
  // eslint-disable-next-line no-magic-numbers
  5776: '签收未收到',
  // eslint-disable-next-line no-magic-numbers
  5774: '客诉',
  // eslint-disable-next-line no-magic-numbers
  5778: '拦截退回',
  // eslint-disable-next-line no-magic-numbers
  5781: '破损',
  // eslint-disable-next-line no-magic-numbers
  5806: '拦截改地址',
  // eslint-disable-next-line no-magic-numbers
  5807: '改电话号码',
  // eslint-disable-next-line no-magic-numbers
  5808: '遗失',
  // eslint-disable-next-line no-magic-numbers
  5809: '短少',
  // eslint-disable-next-line no-magic-numbers
  5810: '其他',
  // eslint-disable-next-line no-magic-numbers
  5811: '未收到取件码',
  // eslint-disable-next-line no-magic-numbers
  5812: '签收未收到改地址',
  // eslint-disable-next-line no-magic-numbers
  5813: '未送货上门',
  // eslint-disable-next-line no-magic-numbers
  5814: '提供底单',
  // eslint-disable-next-line no-magic-numbers
  5815: '核实重量',
  // eslint-disable-next-line no-magic-numbers
  5816: '无面单',
  // eslint-disable-next-line no-magic-numbers
  5817: '核实快递当前情况',
  // eslint-disable-next-line no-magic-numbers
  5818: '核实是否揽收',
  // eslint-disable-next-line no-magic-numbers
  5819: '核实为什么退回',
  // eslint-disable-next-line no-magic-numbers
  5820: '空包件，时效件',
  // eslint-disable-next-line no-magic-numbers
  5821: '提供红章',
  // eslint-disable-next-line no-magic-numbers
  5822: '自提',
  // eslint-disable-next-line no-magic-numbers
  5823: '收件人信息错误',
  // eslint-disable-next-line no-magic-numbers
  5824: '超区件',
  // eslint-disable-next-line no-magic-numbers
  5825: '客户拒收'
};
// 链接标题摘要最大限制的长度
export const LINK_TITLE_MAXLENGTH = 16; // 标题最大长度16
export const LINK_CONTENT_MAXLENGTH = 64; // 摘要最大长度64

// 企业雷达
const ENTERPRISE_RADAR = 3;
// 部门雷达
const DEPARTMENT_RADAR = 2;
// 我的雷达
const PERSONAL_RADAR = 1;

// 雷达类型
export const RADAR_TYPE = {
  'enterprise': ENTERPRISE_RADAR,
  'department': DEPARTMENT_RADAR,
  'personal': PERSONAL_RADAR
};

// 素材库
export const MATERIAL_TYPE = 'material';
// 话术库
export const WORDS_TYPE = 'words';
// 雷达库
export const RADARS_TYPE = 'radars';
// 智能表单
export const FORM_TYPE = 'intelligentForm';

// 时间选择类型
export const TIME_CHECKED_TYPE = {
  TODAY: '1',
  ALL: '2'
};

// 数值单位
export const NUMBER_UNIT = {
  // eslint-disable-next-line no-magic-numbers
  K: 1e3,
  // eslint-disable-next-line no-magic-numbers
  W: 1e4
};

// 企业表单
const ENTERPRISE_FORM = 1;
// 部门表单
const DEPARTMENT_FORM = 2;
// 我的表单
const PERSONAL_FORM = 3;

// 智能表单的表单tab类型
export const INTELLIGENT_FORM_TYPE = {
  'enterprise': ENTERPRISE_FORM,
  'department': DEPARTMENT_FORM,
  'personal': PERSONAL_FORM
};

// 第一页
export const FIRST_PAGE = 1;

export const FREQUENT_ERR_MSG = 'operation too frequently';
export const LOCK_ERROR_MSG = {
  [FREQUENT_ERR_MSG]: '操作过于频繁'
};
