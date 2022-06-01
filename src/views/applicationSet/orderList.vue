<!--
 * @Description: 订单列表
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="list-content">
    <van-tabs type="card" class="list-tab" color="#1890FF" @change="changeTab">
      <van-tab name="未处理">
        <template #title>
          <span>未处理</span>
          <span class="ml5 num-span" :style="dealColor('未处理')">{{ orderCountInfo.notHandle || 0 }}</span>
        </template>
      </van-tab>
      <van-tab name="处理中">
        <template #title>
          <span>处理中</span>
          <span class="ml5 num-span" :style="dealColor('处理中')">{{ orderCountInfo.inHandle || 0 }}</span>
        </template>
      </van-tab>
      <van-tab name="已处理">
        <template #title>
          <span>已处理</span>
          <span class="ml5 num-span" :style="dealColor('已处理')">{{ orderCountInfo.finish || 0 }}</span>
        </template>
      </van-tab>
    </van-tabs>

    <EmptyDefaultIcon
      :length="orderList.length"
      class="order-list-div"
      :loading="loading"
    >
      <van-list
        v-model="loading"
        class="order-van-list-div"
        :finished="finished"
        finished-text="没有更多数据了"
        loading-text="上拉查看更多"
        @load="onPage"
      >
        <van-cell v-for="(orderItem, orderIndex) in orderList" :key="orderIndex" is-link @click="() => handleShowDetail(orderItem)">
          <template #title>
            <div class="order-number">单号：{{ orderItem.orderNum }}</div>
            <div class="order-time">{{ parseTime(orderItem.createTime) }}</div>
          </template>
          <template #default>
            <span class="order-type">{{ ORDERTYPE_TEXT[orderItem.orderType] }}</span>
          </template>
        </van-cell>
      </van-list>
    </EmptyDefaultIcon>

    <OrderDetail
      :show.sync="detailShow"
      :order-item="currentDetail"
      :user-id="bindInfo.orderUserId"
      :app-detail="appDetail"
      :network-id="networkId"
      :customer-id="bindInfo.orderCustomerId"
      @handleShowDetail="handleShowDetail"
      @reGetOrderList="reGetOrderList"
    />
  </div>
</template>
<script>
import { listOrder, descOrder } from '@/api/order';
import OrderDetail from './orderDetail.vue';
import { parseDateToTime } from '@/utils/index';
import { ORDERTYPE_TEXT } from '@/utils/constants';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';

export default {
  name: 'OrderList',
  components: { OrderDetail, EmptyDefaultIcon },
  props: {
    chatId: {
      type: String,
      default: ''
    },
    bindInfo: {
      type: Object,
      default: () => {}
    },
    networkId: {
      type: String,
      default: ''
    },
    orderCountInfo: {
      type: Object,
      default: () => {}
    },
    appDetail: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      loading: false,
      finished: false,
      pageNum: 0,
      orderList: [],
      ORDERTYPE_TEXT,
      currentDetail: {},
      detailShow: false,
      activeOrderStatus: '未处理'
    };
  },
  created() {},
  mounted() {
    this.getOrderList({ page: 1 });
  },
  methods: {
    /**
     * 滚动条到底部触发加载
     */
    onPage() {
      this.getOrderList();
    },
    /**
     * 调用获取工单列表接口
     */
    getOrderList(params) {
      let pageNum = this.pageNum;
      pageNum = pageNum + 1;
      const newParams = {
        chatId: this.chatId,
        orderStatus: this.activeOrderStatus,
        orderUserId: this.bindInfo.orderUserId,
        page: pageNum,
        ...params
      };
      this.pageNum = newParams.page;
      this.loading = true;
      listOrder(newParams).then(res => {
        this.loading = false;
        this.$parent.loading = false;
        const resData = { ...res.data };
        this.finished = resData.orderList.length === 0 || res.total <= this.orderList.length;
        if (resData) {
          this.orderList = newParams.page === 1 ? [...resData.orderList] : [...this.orderList, ...resData.orderList];
        }
      });
    },
    /**
     * 切换查询工单类型
     */
    changeTab(item) {
      this.orderList = [];
      this.getOrderList({
        orderStatus: item,
        page: 1
      });
      this.activeOrderStatus = item;
    },
    /**
     * 查看对应工单详情
     */
    handleShowDetail(item) {
      this.detailShow = true;
      descOrder({
        customerId: this.bindInfo.orderCustomerId,
        networkId: this.networkId,
        orderId: item.orderId,
        userId: this.bindInfo.orderUserId
      }).then(res => {
        this.currentDetail = { ...res.data };
      });
    },
    parseTime(time) {
      return parseDateToTime(time, 'YYYY-MM-DD HH:mm:ss');
    },
    /**
     * 重新获取工单列表和工单数量统计
     */
    reGetOrderList() {
      this.$emit('getTotalNumOrder');
      this.getOrderList({
        page: 1
      });
    },
    /**
     * 根据不同类型处理工单数量的颜色
     */
    dealColor(orderStatus) {
      if (this.activeOrderStatus !== orderStatus) {
        switch (orderStatus) {
          case '未处理': {
            return `color:red;`;
          }
          case '处理中': {
            return `color:#F59A23;`;
          }
          case '已处理': {
            return `color:#1890FF;`;
          }
        }
      }
      return '';
    }
  }

};
</script>
<style scoped lang='less'>
.list-content {
    height: calc(100% - 35px);
    .list-tab {
        height: 32px;
        /deep/ .van-tabs__nav {
            margin: 0;
        }
        /deep/ .van-tabs__wrap {
            height: 32px;
        }
    }
    .order-number {
        font-size: 13px;
        word-break: break-all;
    }
    .order-time {
        font-size: 12px;
        color: #999999;
    }
    .order-type {
        color: @black;
    }
    .order-van-list-div {
        height: calc(100% - 32px);
    }
    .order-list-div {
      .loading-div {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100px;
      }
    }
}
</style>
