<!--
 * @Description: 应用工具界面
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="app-tool-page">
    <EmptyDefaultIcon :length="appList.length" text="暂无应用工具" class="app-list">
      <div :style="`position:relative;height:calc(100% - ${tabList.length > 0 ? '50px' : '0px'});`" class="app-container">
        <div v-if="activeItem.sidebarRedirectUrl === ALL_APP" class="all-app">
          <div v-show="showSetting" class="show-setting-div">
            <div class="app-tool-setting">
              <div class="title mb15">应用工具</div>
              <div>将需要经常用到的工具设为标签页，方便从侧边栏直接进入查看和使用。最多可设置3个</div>
            </div>
            <van-checkbox-group v-model="appShowList" checked-color="#6BB4AB">
              <van-cell-group>
                <div v-for="(item, index) in appList" :key="index" class="flex checkout-item">
                  <van-checkbox ref="checkboxes" :name="item.appid" />
                  <AppItem :item="item" />
                </div>
              </van-cell-group>
            </van-checkbox-group>
          </div>
          <div v-show="!showSetting">
            <div v-for="(item, index) in appList" :key="index">
              <AppItem :item="item" :go-to-url="goToUrl" :is-link="true" />
            </div>
          </div>
        </div>
        <template v-if="activeItem.sidebarRedirectUrl === WORKSHEET_ASSISTANT_URL">
          <WorkSheetAssistant :appid="activeItem.appid" />
        </template>
        <div v-show="!showSetting && activeItem.sidebarRedirectUrl === ALL_APP" class="setting-circle" @click="handleSetting">
          <i class="iconfont icon-setting" />
        </div>
        <div v-show="showSetting" class="setting-btn">
          <van-button style="border-color:#bbb;" class="mr10" @click="showSetting = false">取消</van-button>
          <van-button
            :color="`${canSetTab ? '#6BB4AB': '#D9D9D9'}`"
            type="primary"
            :disabled="!canSetTab"
            @click="handleSetTag"
          >设为标签页</van-button>
        </div>
      </div>
      <van-tabbar v-if="tabList.length > 0 && !showSetting" v-model="active" active-color="#6BB4AB" @change="changeTab">
        <van-tabbar-item v-for="(tabItem, tabIndex) in tabList" :key="tabIndex" :name="tabItem.appid">{{ tabItem.name }}</van-tabbar-item>
        <van-tabbar-item :name="ALL_APP">全部应用</van-tabbar-item>
      </van-tabbar>
    </EmptyDefaultIcon>
  </div>
</template>
<script>
import { getMyApplicationList2Sidebar } from '@/api/application';
import WorkSheetAssistant from './workSheetAssistant.vue';
import { Toast } from 'vant';
import AppItem from './appItem.vue';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';

const TIMEOUT = 2000;
const ALL_APP = 'all';
const WORKSHEET_ASSISTANT_URL = 'workSheetAssistant';

export default {
  name: '',
  components: { WorkSheetAssistant, AppItem, EmptyDefaultIcon },
  props: {},
  data() {
    return {
      ALL_APP,
      WORKSHEET_ASSISTANT_URL,
      appList: [],
      // 是否为设置应用工具为标签页的模式
      showSetting: false,
      appShowList: [],
      active: ALL_APP,
      tabList: [],
      activeItem: {
        sidebarRedirectUrl: ALL_APP
      }
    };
  },
  computed: {
    userId() {
      return this.$store.state.userId;
    },
    canSetTab() {
      return this.appShowList && this.appShowList.length > 0;
    }
  },
  watch: {
    userId(val) {
      if (val) this.getMyApplicationList2Sidebar();
    }
  },
  mounted() {
    // 从缓存中读取标签页列表
    const list = localStorage.getItem('tabList');
    if (list) this.tabList = JSON.parse(list);
    // 跳转到第一个标签页
    this.jumpToFirstApp();
  },
  methods: {
    /**
     * 进入“设置应用工具为标签页”模式
     */
    handleSetting() {
      this.showSetting = true;
      this.appShowList = this.tabList.map(item => item.appid);
    },
    /**
     * 获取应用列表
     */
    getMyApplicationList2Sidebar() {
      getMyApplicationList2Sidebar({}).then(res => {
        this.appList = [...res.data];
      });
    },
    /**
     * 设为标签页
     */
    handleSetTag() {
      // 未选择应用时不可设置标签页
      if (this.appShowList.length === 0) return;
      this.dealTabList();
      Toast.loading({
        message: '设置中...',
        forbidClick: true,
        loadingType: 'spinner'
      });
      setTimeout(() => {
        this.jumpToFirstApp();
        this.showSetting = false;
      }, TIMEOUT);
    },
    /**
     * 跳转到第一个应用
     */
    jumpToFirstApp() {
      this.active = this.tabList && this.tabList.length > 0 && this.tabList[0].appid;
      this.changeTab(this.active);
    },
    /**
     * 将标签页存储到浏览器缓存
     */
    dealTabList() {
      const tabList = [];
      this.appShowList.map(appItem => {
        const index = this.appList.findIndex(item => item.appid === appItem);
        if (index > -1) tabList.push(this.appList[index]);
      });
      if (tabList && tabList.length > 0) localStorage.setItem('tabList', JSON.stringify(tabList));
      this.tabList = tabList;
    },
    /**
     * 跳转应用
     */
    goToUrl(item) {
      // 跳转工单助手界面
      if (item.sidebarRedirectUrl === WORKSHEET_ASSISTANT_URL) {
        this.$router.push({
          path: item.sidebarRedirectUrl,
          query: {
            appid: item.appid
          }
        });
      }
    },
    /**
     * 切换应用
     */
    changeTab(item) {
      const findItem = this.tabList.find(tabItem => tabItem.appid === item);
      this.activeItem = findItem ? { ...findItem } : { sidebarRedirectUrl: ALL_APP };
    }
  }
};
</script>
<style scoped lang='less'>
.app-tool-page {
    height: 100%;
    background-color: #fff;
    .app-list {
        height: 100%;
    }
    /deep/ .slot-div {
        height: 100%;
    }
    .show-setting-div {
        .app-tool-setting {
            padding: 15px;
            .title {
                color: #101010;
                font-weight: bold;
                font-size: 16px;
            }
        }
        .checkout-item {
            padding: 0 10px;
            /deep/ .van-checkbox {
                width: 22px;
            }
            /deep/ .van-cell {
                padding: 10px;
            }
        }
    }
    .info-div {
        flex: 1;
    }
    .setting-circle {
        background-color: @green;
        color: #fff;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: absolute;
        bottom: 10px;
        right: 10px;
    }
    .setting-btn {
        width: 100%;
        position: fixed;
        bottom: 10px;
        text-align: center;
        button {
            width: 120px;
            height: 32px;
        }
    }
}
</style>
