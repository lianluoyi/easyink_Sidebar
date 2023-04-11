### easyink操作手册

[自建应用操作手册](https://www.yuque.com/docs/share/9217b462-a4c2-4d4a-97cb-48eebf800784?#hsf4v)

[第三方应用操作手册](https://www.yuque.com/docs/share/591b5dff-f705-413e-b167-e8ef72d519bf?#O35E2)

### :rocket: 项目介绍
该项目为easyink的前端模块之一，负责企微客户端中的侧边栏界面展示（包含侧边栏素材库、话术库、客户画像、SOP任务详情展示等）

### :factory: 关联项目

| 项目名                          | 项目说明                                                    | 项目地址                                               |
| ------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| easyink_System                | easyink后端服务                                           | https://github.com/lianluoyi/easyink_System.git      |
| easyink_Dashboard             | easyink前端服务，主要负责后台UI界面展示                   | https://github.com/lianluoyi/easyink_Dashboard.git   |
| **easyink_Sidebar(当前项目)** | **easyink前端服务，主要负责企微客户端中的侧边栏界面展示** | **https://github.com/lianluoyi/easyink_Sidebar.git** |
| easyink_middleProcessing   | easyink h5前端服务，主要负责雷达、智能表单等营销活动页面的展示（非必要模块） | https://github.com/lianluoyi/easyink_middleProcessing |
| easyink_MiniProgram   | easyink 活码小程序服务，主要负责员工活码、群活码页面的展示（非必要模块） | https://github.com/lianluoyi/easyink_MiniProgram |



### :star2: 体验功能

- 建议使用谷歌浏览器访问

- [多租户体验入口](http://www.easyink.net) （免费体验90天）

- 该环境采用第三方应用+代开发应用模式，可借助[第三方应用操作手册](https://www.yuque.com/docs/share/591b5dff-f705-413e-b167-e8ef72d519bf?#O35E2)辅助体验

- [单租户体验入口](http://119.91.63.136:8091)  账号密码：admin/easyink2021

- 该环境采用自建应用模式，可借助[自建应用操作手册](https://www.yuque.com/docs/share/9217b462-a4c2-4d4a-97cb-48eebf800784?#hsf4v)辅助体验

### :checkered_flag: 开发

```
# 克隆项目
git clone https://github.com/lianluoyi/easyink_Sidebar.git

# 进入项目目录
cd easyink_Sidebar

# 安装依赖
npm install
或 yarn install

# 建议不要直接使用 cnpm 安装依赖，会有各种诡异的 bug。可以使用yarn安装，或者通过如下操作解决 npm 下载速度慢的问题
npm install --registry=https://registry.npm.taobao.org

# 如需修改后端地址，更改根目录中的.env.development 中的 VUE_APP_BASE_API常量

# 启动服务
npm run serve
```

该服务的默认访问端口为8082。

在确保[企微配置](http://localhost/#/system/sysSetting/enterpriseWechat)中“聊天工具栏/Sidebar服务域名”已配置，网页授权文件已放到本项目public文件夹下之后，即可直接在侧边栏访问本地前端页面。


### :checkered_flag: 发布
```
# 构建生产环境
npm run build
```

### :round_pushpin: 开发调试方法
开启调试模式（当点击选中外部联系人/外部群时，右下角会有个“打开侧边栏”的图标）

 - mac版本
   [开启调试模式步骤](https://developer.work.weixin.qq.com/document/path/90315#%E4%BC%81%E4%B8%9A%E5%BE%AE%E4%BF%A1mac%E7%89%88%E6%9C%AC%E8%B0%83%E8%AF%95)。
 - windows版本
   [开启调试模式步骤](https://developer.work.weixin.qq.com/document/path/90315#%E4%BC%81%E4%B8%9A%E5%BE%AE%E4%BF%A1windows%E7%89%88%E6%9C%AC%E8%B0%83%E8%AF%95)。



### :airplane: 技术栈
* vue（基础框架）
* vant（ui组件）
* less（样式语言）
* es6（浏览器脚本语言的标准）

### :house: 目录结构

```javascript
├─src
│  ├─api                // 后端接口定义（文件命名以接口前缀来命名）
│  │  ├─chat
│  │  ├─common
│  │  ├─community
│  │  ├─groupCode
│  │  └─portrait
│  ├─assets             // 静态资源文件
│  │  ├─icon
│  │  └─......
│  ├─components         // 公共组件
│  ├─router             // 路由
│  ├─store              // 全局变量
│  ├─styles             // 全局样式
│  ├─utils              // 公共方法/常量
│  ├─views              // 页面文件
│  ├─App                // 根节点
│  ├─config             // 公共配置
│  ├─main               // 全局组件/方法挂载
├─public
├─.env.development      // 本地环境配置文件
├─.env.production       // 生产环境配置文件
├─package               // 需要安装的依赖文件及对应启动命令
├─vue.config            // 配置文件
```

### :art: 系统图标

本系统界面中的图标存放在[iconfont图标库](https://www.iconfont.cn)里面，若需要添加图标可自己新建一个自用的项目图标库，在里面上传图标，之后再引入一个新的图标链接。具体操作如下：

1. 在项目图标库中上传图标
2. 在 public/index.html中增加引入样式文件。

```
<!-- 普通图标地址 -->
<link rel="stylesheet" href="//at.alicdn.com/t/font_2881475_i2swwbm09r9.css">
<!-- 彩色图标地址 -->
<script src="//at.alicdn.com/t/font_2881475_i2swwbm09r9.js"></script>
```

3. 代码中使用示例如下："icon-tool-edit"为图标库中的类名

```
<!-- 普通图标 -->
<i class="iconfont icon-tool-edit"></i>
<!-- 彩色图标 -->
<svg class="icon-player" :width="25" :height="25">
    <use href="#icon-player" />
</svg>
```

