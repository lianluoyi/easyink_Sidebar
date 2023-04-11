<script>
import { getUserInfo, getCorpInfo, getAgentTicket, lockToken, getLockApiParams, getServerType } from '@/api/common';
import { param2Obj, isWxWork, getTicketAndConfig } from '@/utils/index';
import { SUCCESS_CODE, LOCK_ERROR_MSG, FREQUENT_ERR_MSG } from '@/utils/constants';
import { setToken } from '@/utils/auth';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import '@/assets/styles/index.less';
import '@/assets/fonts/iconfont.css';
import { mapMutations } from 'vuex';
const TIP_DURATION = 2000;

export default {
  name: 'App',
  provide() {
    return {
      reload: this.reload
    };
  },
  components: { EmptyDefaultIcon },
  data() {
    return {
      corpId: '',
      agentId: '',
      isRouterAlive: true,
      showOverLay: false,
      // 是否是内外部联系人 true 外部
      isExternal: true
    };
  },
  watch: {
    // 通过config接口注入权限验证配置
    // 所有需要使用JS-SDK的页面必须先注入配置信息，否则将无法调用（同一个url仅需调用一次，对于变化url的SPA（single-page application）的web app可在每次url变化时进行调用）
    $route(route) {
      if (!this.isLock) {
        const noAuth = route.meta ? route.meta.noAuth : false;
        !!this.$store.state.userId && !noAuth && this.wxConfig();
      }
    },
    '$store.state.userId'() {
      if (this.isLock) {
        this.showOverLay = true;
        this.reload();
      } else {
        const routeMeta = (this.$router && this.$router.app) ? this.$router.app.$route.meta : null;
        const noAuth = routeMeta ? routeMeta.noAuth : false;
        !noAuth && this.wxConfig();
      }
    }
  },
  destroyed() {
    window.removeEventListener('message');
  },
  async created() {
    if (this.isLock) {
      window.addEventListener('message', (event) => {
        // 好友变更type为changeNowActiveFriend
        if (event.data.type === 'realChangeNowActiveFriend') {
          console.log('--监听到会话窗联系人切换', event.data);
          this.$dialog.close();
          this.reload();
          this.changeRadarDetailsIsShow(false);
          this.initLockEnv(true);
        }
      });
      this.initLockEnv(false);
      this.getServerType();
    } else {
      // this.$dialog({ message: 'url' + JSON.stringify(window.location) })
      let query = param2Obj(window.location.search);
      const hash = param2Obj(window.location.hash);

      query = Object.assign(query, hash);

      const code = query.code;
      const corpId = query.state;
      // 有corpId时缓存到storage里
      if (corpId && corpId !== 'undefined') {
        sessionStorage.setItem('appid', corpId);
      }
      const location = window.location;
      const locationUrl = `${location.protocol}//${location.host}${location.pathname}${location.hash}`;
      this.$router.onReady(() => {
        const noAuth = this.$router.app.$route.meta
          ? this.$router.app.$route.meta.noAuth
          : false;

        if (!code && !noAuth) {
          const appid = sessionStorage.getItem('appid');
          window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${
            appid
          }&redirect_uri=${encodeURIComponent(
            locationUrl
          )}&response_type=code&scope=snsapi_base&state=${appid}#wechat_redirect`;
        }
      });
      window.history.pushState(
        null,
        '',
        locationUrl
      );
      // 未进行登录授权过
      if (!code) {
        return;
      }
      // console.log('code --------', code);
      const infoRes = await this.getCurrentCorpInfo({ code, corpId });
      if (!infoRes) {
        this.$toast('获取企微配置异常');
        return;
      }
      // 设置token到cookie
      setToken(infoRes.data.token);
      this.agentId = infoRes.agentId;
      this.corpId = infoRes.corpId;
      const { data } = await getUserInfo(code, this.agentId);
      this.$store.state.userId = data.userId;
    // this.$toast('userId:' + this.$store.state.userId)
    }
  },
  methods: {
    ...mapMutations('radarData', { changeRadarDetailsIsShow: 'changeRadarDetailsIsShow' }),
    reload() {
      this.isRouterAlive = false;
      // 等待dom更新完再显示页面
      this.$nextTick(() => {
        this.showOverLay = false;
        this.isRouterAlive = true;
      });
    },
    /**
     * @description 获取服务商类型
     */
    getServerType() {
      getServerType().then((res) => {
        this.$store.state.serverType = res.data.serverType;
      });
    },
    /**
     * @description 初始化Lock环境
     * @param isHasInjection 是否已经注入
     */
    async initLockEnv(isHasInjection) {
      this.isRouterAlive = false;
      const { appId } = param2Obj(window.location.href);
      this.$store.state.agentConfigStatus = false;
      const lockinjectInfo = await getLockApiParams({ appId });
      try {
        !isHasInjection && await getTicketAndConfig({ appId, appSecret: lockinjectInfo.data.appSecret, _this: this });
      } catch (error) {
        return this.$dialog({ message: 'AppID或AppSecret错误，请重新配置' });
      }
      this.$api.getNowActiveWechat().then((res) => {
        const { corpId, userId, isExternal } = res.data;
        this.isExternal = isExternal;
        if (this.isExternal) {
          this.getLockToken({ corpId, userId }).then((token) => {
            this.$store.state.userId = userId;
            this.$store.state.corpId = corpId;
            this.$store.state.agentConfigStatus = true;
            sessionStorage.setItem('appid', corpId);
            setToken(token);
            this.$nextTick(() => {
              this.showOverLay = false;
              this.isRouterAlive = true;
            });
          });
        } else {
          this.$toast.clear();
        }
      }).catch(() => {
        this.$dialog({ message: LOCK_ERROR_MSG[FREQUENT_ERR_MSG] });
        this.$toast.clear();
      });
    },
    // 获取企业微信配置
    async getCurrentCorpInfo(params = {}) {
      const infoRes = await getCorpInfo(params);
      if (infoRes.code === SUCCESS_CODE) {
        const resData = {
          ...infoRes,
          agentId: infoRes.data ? infoRes.data.agentId : '',
          corpId: infoRes.data ? infoRes.data.corpId : ''
        };
        this.$store.state.corpId = resData.corpId;
        return resData;
      }
      return null;
    },
    async wxConfig() {
      // 不是在企微浏览器打开的话进行提示
      if (!isWxWork()) {
        this.$toast({
          message: '请在企业微信打开页面',
          duration: TIP_DURATION
        });
        return;
      }
      this.$store.state.agentConfigStatus = false;
      try {
        const { data } = await getAgentTicket(
          window.location.href.split('#')[0],
          this.agentId
        );
        const { timestamp, nonceStr, signature } = data;
        wx.agentConfig({
          beta: true, // 必须这么写，否则wx.invoke调用形式的jsapi会有问题
          debug: true,
          corpid: this.corpId, // 必填，企业微信的corpid，必须与当前登录的企业一致
          agentid: this.agentId, // 必填，企业微信的应用id （e.g. 1000247）
          timestamp, // 必填，生成签名的时间戳
          nonceStr, // 必填，生成签名的随机串
          signature, // 必填，签名，见附录-JS-SDK使用权限签名算法
          jsApiList: [
            'sendChatMessage',
            'getContext',
            'getCurExternalContact',
            'getCurExternalChat',
            'openEnterpriseChat',
            'shareToExternalContact',
            'shareToExternalChat',
            'previewFile',
            'shareToExternalMoments'
          ], // 必填
          success: (res) => {
            // 回调
            this.$store.state.agentConfigStatus = true;
          },
          fail: (res) => {
            console.log('注入应用权限失败: ', res);
            this.$toast('agentId失败:' + JSON.stringify(res));
            if (res.errMsg.indexOf('function not exist') > -1) {
              alert('版本过低请升级');
            }
          }
        });
      } catch (error) {
        console.error('注入应用失败', error);
      }
    },
    async getLockToken(params) {
      const tokenRes = await lockToken(params);
      return tokenRes.data?.token;
    }
  }
};
</script>
<template>
  <div id="app">
    <template v-if="isExternal">
      <van-overlay :show="showOverLay" @click="show = false">
        <van-loading type="spinner" vertical style="margin-top: 50%;">加载中...</van-loading>
      </van-overlay>
      <router-view v-if="isRouterAlive" class="page" />
    </template>
    <EmptyDefaultIcon v-else :length="0" text="内部联系人/群聊暂不支持该功能" class="warn-tip-div customer-warn-tip" :empty-icon="require('@/assets/denyAccess.png')" />
  </div>
</template>

<style lang="less">
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
