<!--
 * @Description: 工单详情
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <van-popup v-model="show" class="order-detail-div">
    <ReturnHeader @goBack="goBack" />
    <div class="content-container">
      <div class="order-message">
        <div class="title">工单信息</div>
        <div class="content-div">
          <div class="field-row">
            <div class="field-item">
              <div class="label">反馈单号</div>
              <div class="content">{{ orderItem.orderNum }}</div>
            </div>
            <div class="field-item">
              <div class="label">反馈类型</div>
              <div class="content">{{ ORDERTYPE_TEXT[orderItem.orderType] }}</div>
            </div>
          </div>
          <div class="field-row">
            <div class="field-item">
              <div class="label">紧急程度</div>
              <div class="content">{{ URGENCYLEVEL_TYPE[orderItem.urgencyLevel] }}</div>
            </div>
            <div class="field-item">
              <div class="label">反馈次数</div>
              <div v-if="!!orderItem.feedback" class="content">x{{ orderItem.feedback }}</div>
            </div>
          </div>
          <div class="field-row">
            <div class="field-item">
              <div class="label">工  单  号</div>
              <div class="content">{{ orderItem.orderId }}</div>
            </div>
            <div class="field-item">
              <div class="label">工单状态</div>
              <div class="content"><van-tag plain type="primary" :color="STATUS_COLOR[orderItem.orderStatus]">{{ orderItem.orderStatus }}</van-tag></div>
            </div>
          </div>
          <div class="field-row one-line-row">
            <div class="label">创建时间</div>
            <div class="content">{{ parseTime(orderItem.createTime) }}</div>
          </div>
          <div class="field-row one-line-row">
            <div class="label">反馈内容</div>
            <div class="content" style="line-height: 16px;">{{ orderItem.content }}</div>
          </div>
        </div>
      </div>
      <div v-if="['处理中', '已处理'].includes(orderItem.orderStatus)" class="deal-record">
        <van-collapse v-model="recordActiveNames">
          <van-collapse-item title="" name="1">
            <template #title>
              <span class="title">处理记录</span>
            </template>
            <div class="record-list">
              <van-steps direction="vertical" :active="0" active-color="#1890FF">
                <van-step v-for="(logItem, logIndex) in orderItem.orderLog.slice(0, 5)" :key="logIndex">
                  <div v-html="logItem.content" />
                  <div>{{ parseTime(logItem.time) }}</div>
                </van-step>
              </van-steps>
              <div v-if="orderItem.orderLog.length > 5" class="go-check-more" @click="goLink">前往工单系统查看更多</div>
            </div>
          </van-collapse-item>
        </van-collapse>

      </div>
      <div v-if="orderItem.orderStatus !== '已处理'" class="order-deal-content">
        <div class="title mb5">处理内容</div>
        <van-field
          v-model="dealContent"
          autosize
          type="textarea"
          placeholder="请输入工单处理内容"
        />
        <div class="deal-result-div mt10">
          <div class="label">处理结果</div>
          <van-radio-group v-model="dealResultStatus" class="status-radio" direction="horizontal">
            <van-radio :name="UPDATE_ORDER">{{ `${orderItem.orderStatus === '未处理' ? '处理': '更新'}工单` }}</van-radio>
            <van-radio :name="CLOSE_ORDER">关闭工单</van-radio>
          </van-radio-group>
        </div>
      </div>
      <div v-if="orderItem.orderStatus !== '已处理'" class="operate-btn">
        <van-button size="small" type="default" class="mr10" @click="handleCancel">
          取 消
        </van-button>
        <van-button color="#1890FF" size="small" type="primary" :disabled="!dealResultStatus" @click="handleConfirm">
          更新工单
        </van-button>
      </div>
    </div>
  </van-popup>
</template>
<script>
import ReturnHeader from '@/components/ReturnHeader.vue';
import { ORDERTYPE_TEXT } from '@/utils/constants';
// import moment from 'moment';
import { parseDateToTime } from '@/utils/index';
import { handleOrder } from '@/api/order';

const URGENCYLEVEL_TYPE = {
  0: '可延后',
  1: '一般',
  // eslint-disable-next-line no-magic-numbers
  2: '紧急'
};
const STATUS_COLOR = {
  '未处理': '#FF4D4F',
  '处理中': '#F5A829',
  '已处理': '#1890FF'
};
const UPDATE_ORDER = '1';
const CLOSE_ORDER = '2';
export default {
  name: '',
  components: { ReturnHeader },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    orderItem: {
      type: Object,
      default: () => {}
    },
    userId: {
      type: String,
      default: ''
    },
    appDetail: {
      type: Object,
      default: () => {}
    },
    networkId: {
      type: String,
      default: ''
    },
    customerId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dealContent: '',
      dealResultStatus: null,
      ORDERTYPE_TEXT,
      CLOSE_ORDER,
      URGENCYLEVEL_TYPE,
      STATUS_COLOR,
      recordActiveNames: ['1'],
      UPDATE_ORDER
    };
  },
  watch: {
    show(val) {
      // 显示工单详情的时候清空处理内容的输入值
      if (val) {
        this.dealContent = '';
        this.dealResultStatus = null;
      }
    }
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * 点击更新工单
     */
    handleConfirm() {
      this.handleOrder(this.dealResultStatus === CLOSE_ORDER ? '已处理' : '处理中');
    },
    /**
     * 取消更新工单
     */
    handleCancel() {
      this.$emit('update:show', false);
    },
    /**
     * 返回工单列表页
     */
    goBack() {
      this.$emit('update:show', false);
    },
    /**
     * 时间格式化
     */
    parseTime(time) {
      return parseDateToTime(time, 'YYYY-MM-DD HH:mm:ss');
    },
    /**
     * 更新/关闭工单
     */
    handleOrder(orderStatus) {
      handleOrder({
        content: this.dealContent,
        orderId: this.orderItem.orderId,
        messageId: this.orderItem.messageId,
        orderStatus,
        userId: this.userId
      }).then(res => {
        this.dealContent = '';
        this.$emit('handleShowDetail', this.orderItem);
        this.$emit('reGetOrderList');
        this.$toast.success('更新成功');
      });
    },
    /**
     * 打开系统页面
     */
    goLink() {
      // 调用第三方接口，直接跳转到工单详情页面
      window.open(`${this.appDetail.applicationEntranceUrl}/${this.networkId}/yg/OrderApi/orderDetails?networkId=
      ${this.networkId}&customerId=${this.customerId}&userId=${this.userId}&orderId=${this.orderItem.orderId}`);
    }
  }
};
</script>
<style scoped lang='less'>
.order-detail-div {
    height: 100%;
    width: 100%;
    .content-container {
        .order-message, .order-deal-content {
            padding: 15px;
        }
        .order-message, .deal-record {
            .title {
                color: #1890FF;
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 10px;
            }
        }
        .order-message {
            border-bottom: 1px solid #eee;

            .content-div {
                .field-row {
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    .field-item {
                        display: flex;
                        align-items: center;
                        width: 50%;
                    }
                    .label {
                        display: inline-block;
                        overflow: hidden;
                        text-align: justify;
                        height: 15px;
                    }
                    .label:after {
                        content: '';
                        display: inline-block;
                        width: 100%;
                        height: 0;
                        overflow: hidden;
                    }
                    .content {
                      flex: 1;
                      word-break: break-word;
                    }
                }
                .one-line-row {
                    justify-content: flex-start;
                }
            }
        }
        .deal-record {
            .go-check-more {
                text-align: right;
                color: #1890FF;
                cursor: pointer;
            }
            /deep/ .van-hairline--top-bottom::after {
              border-width: 0;
            }
            /deep/ .van-collapse {
                .van-collapse-item {
                    .van-collapse-item__title--expanded::after {
                        display: none;
                    }
                    .van-collapse-item__wrapper {
                        .van-collapse-item__content {
                            padding: 0 5px 12px 5px;
                        }
                    }
                }
            }
        }
        .order-deal-content {
            border-top: 1px solid #eee;
            .title {
                color: #9C9C9C;
                font-size: 12px;
            }
            /deep/ .van-cell {
                border: 1px solid #BBBBBB;
                border-radius: 2px;
                padding: 5px 10px;
                min-height: 100px;
            }
            .deal-result-div {
                display: flex;
                align-items: center;
                .status-radio {
                    flex: 1;
                }
                .label {
                    width: 58px;
                }
            }
        }
    }
    .operate-btn {
        width: 100%;
        text-align: center;
        padding-bottom: 46px;
        button {
            width: 120px;
            height: 32px;
        }
    }
    .label {
        color: #9C9C9C;
        margin-right: 10px;
        width: 48px;
    }
}
</style>

