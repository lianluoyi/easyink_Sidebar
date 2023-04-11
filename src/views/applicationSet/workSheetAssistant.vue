<!--
 * @Description: 青鸾智能工单助手界面
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="work-sheet-assistant-page">
    <div class="user-info-div">
      <van-image class="avatar-img mr10" :src="userInfo.avatar" width="34" height="34" />
      <div class="user-welcome">
        <div class="welcome-title">HI，{{ timeWel }}！ <span>{{ userInfo.userName }}</span></div>
        <div class="welcome-content">
          <div>欢迎使用{{ appDetail.name }}！</div>
          <van-icon v-if="!loading" name="replay" color="#1890FF" @click="onReload" />
          <van-loading v-else color="#1989fa" />
        </div>
      </div>
    </div>
    <div class="order-list-div">
      <template v-if="portraitType === 'customer'">
        <EmptyDefaultIcon :length="0" text="暂不支持管理好友的工单" class="warn-tip-div customer-warn-tip" :empty-icon="require('@/assets/icon/un-support.svg')" />
      </template>
      <template v-if="portraitType === 'group'">
        <!-- 未绑定工单账号/未绑定客户 -->
        <EmptyDefaultIcon
          v-if="!configInfo.networkId || !bindInfo.orderUserId || !bindInfo.orderCustomerId"
          :length="0"
          :text="!configInfo.networkId?'未获取到网点信息' : !bindInfo.orderUserId ? '未绑定工单账号': '未绑定客户'"
          :desc="!configInfo.networkId?'请联系管理员在应用中心绑定工单网点' : !bindInfo.orderUserId ? '处理工单前需先绑定工单账号': '处理工单前需先为当前群聊绑定客户'"
          class="warn-tip-div group-warn-tip"
        >
          <van-button
            v-if="configInfo.networkId && !bindInfo.orderUserId"
            slot="customBtn"
            class="bind-btn"
            color="#6BB4AB"
            @click="bindAccount"
          >绑定账号</van-button>
          <van-button
            v-if="configInfo.networkId && bindInfo.orderUserId && !bindInfo.orderCustomerId"
            slot="customBtn"
            color="#6BB4AB"
            class="bind-btn"
            @click="onBindCustomer"
          >绑定客户</van-button>

        </EmptyDefaultIcon>
        <!-- 工单列表 -->
        <div v-else class="order-list-content-div">
          <div class="customer-info-div">
            <div>
              客户：{{ bindInfo.orderCustomerName }}
              <van-tag plain type="primary" style="cursor:pointer;" @click="handleUnBind">解绑</van-tag>
            </div>
            <div>工单数：{{ orderCountInfo.total }}</div>
          </div>
          <OrderList
            ref="orderListRef"
            :chat-id="externalUsechatrid"
            :bind-info="bindInfo"
            :network-id="configInfo.networkId || ''"
            :order-count-info="orderCountInfo"
            :app-detail="appDetail"
            @getTotalNumOrder="totalNumOrder"
          />
        </div>
      </template>
    </div>
    <ListPopup
      :bind-account-show.sync="bindAccountShow"
      :title="popupSelectTitle"
      :popup-placeholder="popupPlaceholder"
      :show-list="popupShowList"
      :ok-handle="bindType === 'customer' ? okBindCustomer :okBindAccount"
      :user-name-key="bindType === 'customer' ? 'customerName' : 'orderUserName'"
      :user-id="bindType === 'customer' ? 'customerId': 'orderUserId'"
    />
  </div>
</template>
<script>
import { getInfo } from '@/api/common';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import { getApplicationDetail } from '@/api/application';
import ListPopup from './listPopup.vue';
import { networkUser, networkCustomer, getBindInfo, bindUser, bindCustomer, unbindCustomer, totalNumOrder } from '@/api/order';
import OrderList from './orderList.vue';
import { Dialog } from 'vant';
import moment from 'moment';

export default {
  name: 'WorkSheetAssistant',
  components: { EmptyDefaultIcon, ListPopup, OrderList },
  props: {
    appid: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      portraitType: '',
      userInfo: {},
      appDetail: {},
      // 绑定账号弹窗显示
      bindAccountShow: false,
      popupSelectTitle: '',
      popupPlaceholder: '',
      popupShowList: [],
      externalUsechatrid: '',
      bindType: '',
      bindInfo: {},
      // 工单统计详情
      orderCountInfo: {},
      timeWel: '',
      linkAppid: '',
      loading: false
    };
  },
  computed: {
    configInfo() {
      const config = this.appDetail.config;
      let configObj = {};
      if (config) configObj = JSON.parse(config);
      return configObj;
    }
  },
  watch: {
    '$store.state.agentConfigStatus'(val) {
      val && !this.portraitType && this.checkCustomerType();
    },
    '$store.state.userId'(val) {
      val && this.getApplicationDetail();
    }
  },
  mounted() {
    const routerQuery = this.$route.query;
    this.linkAppid = routerQuery.appid;
    if (this.$store.state.agentConfigStatus && !this.portraitType) this.checkCustomerType();
    if (this.$store.state.userId) this.getApplicationDetail();
  },
  methods: {
    /**
     * 获取员工客户绑定信息
     */
    getBindInfo() {
      getBindInfo({ chatId: this.externalUsechatrid }).then(res => {
        const resData = { ...res.data };
        this.bindInfo = { ...resData };
        if (resData.orderCustomerId && resData.orderUserId) this.totalNumOrder();
      });
    },
    /**
     * 获取应用详情
     */
    getApplicationDetail() {
      getApplicationDetail({ appid: this.appid || this.linkAppid }).then(res => {
        this.appDetail = { ...res.data };
      });
    },
    /**
     * 获取h5入口类型（客户不支持展示工单助手界面）
     */
    checkCustomerType() {
      const _this = this;
      this.api.invoke('getContext', {}, function(res) {
        if (res.err_msg === 'getContext:ok') {
          // 返回进入H5页面的入口类型，目前有normal、contact_profile、single_chat_tools、group_chat_tools
          const entry = res.entry;
          _this.portraitType = entry === 'group_chat_tools' ? 'group' : 'customer';
          _this.getInfo();
          if (_this.portraitType === 'group') {
            _this.getGroupInfo();
          }
        }
      });
    },
    /**
     * 获取客户群详情
     */
    getGroupInfo() {
      const _this = this;
      this.api.invoke('getCurExternalChat', {}, (res) => {
        if (res.err_msg === 'getCurExternalChat:ok') {
          // 返回当前客户群id
          _this.externalUsechatrid = res.chatId;
          _this.getBindInfo();
        }
      });
    },
    /**
     * 获取当前操作的员工详情
     */
    getInfo() {
      getInfo().then(res => {
        this.userInfo = { ...res.data };
        this.dealTimeWelcomeText();
      });
    },
    /**
     * 处理时间欢迎语
     */
    dealTimeWelcomeText() {
      const MORNING = 13;
      const AFTERNOON = 18;
      const hour = moment(new Date()).format('HH');
      let timeWel = '晚上好';
      if (Number(hour) < MORNING) {
        timeWel = '上午好';
      }
      if (Number(hour) < AFTERNOON) {
        timeWel = '下午好';
      }
      this.timeWel = timeWel;
    },
    /**
     * 绑定账号
     */
    bindAccount() {
      this.bindAccountShow = true;
      this.popupSelectTitle = '选择工单账号';
      this.popupPlaceholder = '请输入工单账号';
      this.networkUser();
      this.bindType = 'account';
    },
    /**
     * 绑定客户
     */
    onBindCustomer() {
      this.bindAccountShow = true;
      this.popupSelectTitle = '选择客户';
      this.popupPlaceholder = '请输入客户名称';
      this.bindType = 'customer';
      this.networkCustomer();
    },
    /**
     * 获取工单账号接口
     */
    networkUser() {
      networkUser().then(res => {
        this.popupShowList = [...res.data];
      });
    },
    /**
     * 获取该工单账号下所有客户
     */
    networkCustomer() {
      networkCustomer().then(res => {
        this.popupShowList = [...res.data];
      });
    },
    /**
     * 确认绑定客户
     */
    okBindCustomer(selectedUser) {
      this.bindCustomer({
        chatId: this.externalUsechatrid,
        orderCustomerId: selectedUser.customerId,
        orderCustomerName: selectedUser.customerName
      });
    },
    /**
     * 确认绑定账号
     */
    okBindAccount(selectedUser) {
      this.bindUser({
        orderUserId: selectedUser.orderUserId,
        orderUserName: selectedUser.orderUserName,
        userId: this.userInfo.userId
      });
    },
    /**
     * 绑定工单账号
     */
    bindUser(params) {
      bindUser(params).then(res => {
        this.bindAccountShow = false;
        this.$toast.success('绑定成功');
        this.getBindInfo();
      }).catch((err) => {
        this.$toast.fail(err.msg);
      });
    },
    /**
     * 绑定客户
     */
    bindCustomer(params) {
      bindCustomer(params).then(res => {
        this.bindAccountShow = false;
        this.$toast.success('绑定成功');
        this.bindInfo = { ...this.bindInfo, orderCustomerId: params.orderCustomerId };
        this.getBindInfo();
      });
    },
    /**
     * 点击进行解绑客户
     */
    handleUnBind() {
      const _this = this;
      Dialog.confirm({
        title: '解绑客户',
        message: '将当前会话窗的群聊与客户解除绑定关系？'
      })
        .then(() => {
          _this.unbindCustomer();
        });
    },
    unbindCustomer() {
      unbindCustomer({
        chatId: this.externalUsechatrid
      }).then(res => {
        this.$toast.success('解绑成功');
        this.getBindInfo();
      }).catch(err => {
        this.$toast(err.msg);
      });
    },
    /**
     * 获取工单统计数量
     */
    totalNumOrder() {
      const bindInfo = this.bindInfo;
      totalNumOrder({
        customerId: bindInfo.orderCustomerId,
        userId: bindInfo.orderUserId
      }).then(res => {
        this.orderCountInfo = { ...res.data };
      });
    },
    /**
     * 重新刷新当前列表、工单数
     */
    onReload() {
      this.$refs.orderListRef.orderList = [];
      this.loading = true;
      this.$refs.orderListRef.getOrderList({ page: 1 });
      this.totalNumOrder();
    }
  }
};
</script>
<style scoped lang='less'>
.work-sheet-assistant-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  .user-info-div {
    display: flex;
    padding: 10px;
    border-bottom: 1px solid #eee;
    .avatar-img {
      /deep/ .van-image__img {
        border-radius: 50%;
      }
    }
    .user-welcome {
      font-size: 12px;
      line-height: 16px;
      flex: 1;
      .welcome-title {
        font-size: 14px;
        margin-bottom: 3px;
        span {
          color: #1890FF;
        }
      }
      .welcome-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .van-icon-replay {
          cursor: pointer;
        }
        .van-loading {
          width: 16px;
          height: 16px;
        }
      }
    }
  }
  .order-list-div {
    flex: 1;
    overflow: auto;
    .warn-tip-div {
      /deep/ .empty-div {
        .content {
          top: -20px;
          .text {
            font-weight: 800;
            color: @black;
            font-size: 16px;
          }
          .desc {
            color: @black;
            font-size: 14px;
          }
        }
      }
    }
    .group-warn-tip {
      .bind-btn {
        width: 180px;
        height: 32px;
        margin-top: 20px
      }
    }
    .order-list-content-div {
      height: 100%;
      position: relative;
      .customer-info-div {
        display: flex;
        align-items: center;
        height: 35px;
        justify-content: space-between;
        padding: 0 10px;
        font-size: 12px;
      }
      .list-content {
        /deep/ .empty-list {
          height: initial;
        }
      }

    }
  }
}
</style>
