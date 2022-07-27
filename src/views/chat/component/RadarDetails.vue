<!--
 * @Description: 点击详情
 * @Author: xulinbin
 * @LastEditors: xulinbin
-->
<template>
  <van-popup :value="radarDetailsIsShow" class="radar-details-page">
    <ReturnHeader @goBack="goBack" />
    <div class="data-overview-container">
      <div class="title">数据总览</div>
      <div class="data">
        <div class="data-item">
          <div class="data-item-msg">总点击人数</div>
          <div class="data-item-count">{{ dataOverview.sumClickPersonNum ? formatNumber(dataOverview.sumClickPersonNum) : 0 }}</div>
        </div>
        <div class="data-item">
          <div class="data-item-msg">总点击次数</div>
          <div class="data-item-count">{{ dataOverview.sumClickNum ? formatNumber(dataOverview.sumClickNum) : 0 }}</div>
        </div>
        <div class="data-item">
          <div class="data-item-msg">今日点击人数</div>
          <div class="data-item-count">{{ dataOverview.nowadaysClickPersonNum ? formatNumber(dataOverview.nowadaysClickPersonNum) : 0 }}</div>
        </div>
        <div class="data-item">
          <div class="data-item-msg">今日点击次数</div>
          <div class="data-item-count">{{ dataOverview.nowadaysClickNum ? formatNumber(dataOverview.nowadaysClickNum) : 0 }}</div>
        </div>
      </div>
    </div>
    <div class="my-client-container">
      <div class="title">我的客户</div>
      <div class="time-tab">
        <van-radio-group v-model="timeChecked" direction="horizontal">
          <van-radio :name="TIME_CHECKED_TYPE.TODAY">
            <template #icon="props">
              <van-button v-if="props.checked" :color="ACTIVE_COLOR">今日</van-button>
              <van-button v-else plain hairline color="gray">今日</van-button>
            </template>
          </van-radio>
          <van-radio :name="TIME_CHECKED_TYPE.ALL">
            <template #icon="props">
              <van-button v-if="props.checked" :color="ACTIVE_COLOR">全部</van-button>
              <van-button v-else plain hairline color="gray">全部</van-button>
            </template>
          </van-radio>
        </van-radio-group>
      </div>
      <van-search
        v-model="query.customerName"
        class="search-input"
        placeholder="请输入客户昵称，回车搜索"
        @search="search"
      />
    </div>
    <EmptyDefaultIcon class="client-list-empty" :length="clickRecordList.length" text="暂无数据">
      <van-pull-refresh
        v-model="refreshing"
        success-text="刷新成功"
        @refresh="getList(1)"
      >
        <van-list
          v-model="loading"
          :finished="finished"
          finished-text="没有更多了"
          :error.sync="error"
          error-text="请求失败，点击重新加载"
          @load="getList()"
        >
          <div class="client-list">
            <div v-for="(item,index) of clickRecordList" :key="index" class="client-list-item">
              <div class="item-top">
                <img :src="item.headImageUrl">
                <div class="info">
                  <div class="info-nickname">
                    <div>{{ item.customerName }}</div>
                    <div class="info-detail" @click="openCustomerClickRecordDetail(item.externalId)">></div>
                  </div>
                  <div class="info-clicknum">点击次数: {{ item.clickNum }}</div>
                </div>
              </div>
              <div class="item-bottom">
                <div class="info">
                  <div class="info-clickchannel">最近点击渠道: {{ item.channelName }} </div>
                  <div class="info-clicktime">最近点击时间: {{ item.clickTime }}</div>
                </div>
                <van-button type="primary" size="small" class="open-dialog" color="#6BB4AB" @click="openChat(item.externalId)">打开会话</van-button>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </EmptyDefaultIcon>
    <van-popup
      v-model="showRecord"
      closeable
      position="bottom"
      :style="{ height: '75%' }"
    >
      <div class="popup-title">点击记录</div>
      <div class="popup-content">
        <van-steps direction="vertical" :active="-1">
          <van-step v-for="(item,index) of recordDetailList" :key="index">
            <h3>{{ item.recordText }}</h3>
            <p>{{ item.clickTime }}</p>
          </van-step>
        </van-steps>
      </div>
    </van-popup>
  </van-popup>
</template>
<script>
import { RADAR_TYPE, TIME_CHECKED_TYPE, PAGE_LIMIT } from '@/utils/constants';
import { formatNumber, returnTodayFormat } from '@/utils';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import ReturnHeader from '@/components/ReturnHeader.vue';
import { getRadarTotal, getCustomerClickRecord, getCustomerClickRecordDetail } from '@/api/radar';
import { mapState, mapMutations } from 'vuex';
const ACTIVE_COLOR = '#6BB4AB';
export default {
  name: '',
  components: { ReturnHeader, EmptyDefaultIcon },
  props: {
    /**
     * 雷达类型
     */
    type: {
      type: Number,
      default: RADAR_TYPE['personal']
    }
  },
  data() {
    return {
      // 下拉刷新
      refreshing: false,
      // 上滑刷新
      loading: false,
      // 是否加载完毕
      finished: false,
      // 加载错误 点击可重新请求
      error: false,
      timeChecked: TIME_CHECKED_TYPE.TODAY, // 时间选择
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        customerName: '', // 客户昵称
        beginTime: returnTodayFormat('YYYY-MM-DD'),
        endTime: returnTodayFormat('YYYY-MM-DD')
      },
      ACTIVE_COLOR,
      TIME_CHECKED_TYPE,
      showRecord: false, // 记录详情弹窗是否展示
      dataOverview: {
        sumClickNum: 0, // 总点击次数
        sumClickPersonNum: 0, // 总点击人数
        nowadaysClickPersonNum: 0, // 今日点击人数
        nowadaysClickNum: 0 // 今日总点击次数
      },
      clickRecordList: [], // 点击记录列表
      recordDetailList: [], // 记录详情列表
      externalId: '' // 记录id
    };
  },
  computed: {
    ...mapState('radarData', {
      radarId: (state) => state.radarId,
      radarDetailsIsShow: (state) => state.radarDetailsIsShow
    })
  },
  watch: {
    radarDetailsIsShow(val) {
      if (val) {
        // 数据
        this.getRadarTotal();
        // 客户点击记录
        this.getCustomerClickRecord();
      }
    },
    timeChecked(val) {
      this.query.pageNum = 1;
      this.finished = false;
      this.$set(this.query, 'customerName', ''); // 搜索置空
      if (val === TIME_CHECKED_TYPE.TODAY) {
        this.query.beginTime = returnTodayFormat('YYYY-MM-DD');
        this.query.endTime = returnTodayFormat('YYYY-MM-DD');
      } else {
        this.query.beginTime = '';
        this.query.endTime = '';
      }
      const params = { ...this.query, radarId: this.radarId };
      getCustomerClickRecord(params)
        .then(({ rows }) => {
          this.clickRecordList = rows;
        })
        .catch((err) => {
          console.log(err);
        });
    }
  },
  mounted() {},
  methods: {
    formatNumber,
    openChat(externalId) {
      wx.invoke('openEnterpriseChat', {
        externalUserIds: externalId,
        groupName: ''
      }, function(res) {
      });
    },
    /**
     * 返回
     */
    goBack() {
      this.openRadarDetails(false);
      this.resetForm();
    },
    /**
     * 清空数据
     */
    resetForm() {
      Object.assign(this.$data, this.$options.data.call(this));
    },
    ...mapMutations('radarData', { openRadarDetails: 'changeRadarDetailsIsShow' }),
    /**
     * @description: 点击搜索
     * @return {*}
     */
    search() {
      this.query.pageNum = 1;
      this.finished = false;
      const params = { ...this.query, radarId: this.radarId };
      getCustomerClickRecord(params)
        .then(({ rows }) => {
          this.clickRecordList = rows;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    /**
     * @description:获取详情数据
     * @return {*}
     */
    getRadarTotal() {
      getRadarTotal({ radarId: this.radarId })
        .then(({ data }) => {
          this.$set(this.dataOverview, 'sumClickNum', data.sumClickNum);
          this.$set(this.dataOverview, 'sumClickPersonNum', data.sumClickPersonNum);
          this.$set(this.dataOverview, 'nowadaysClickPersonNum', data.nowadaysClickPersonNum);
          this.$set(this.dataOverview, 'nowadaysClickNum', data.nowadaysClickNum);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    /**
     * @description: 进来时获取客户点击记录
     * @return {*}
     */
    getCustomerClickRecord() {
      getCustomerClickRecord({ radarId: this.radarId, beginTime: returnTodayFormat('YYYY-MM-DD'), endTime: returnTodayFormat('YYYY-MM-DD') })
        .then(({ rows }) => {
          if (rows.length) {
            this.clickRecordList = rows;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    /**
     * @description: 点击记录详情
     * @param {*} externalId 记录id
     * @return {*}
     */
    openCustomerClickRecordDetail(externalId) {
      this.externalId = externalId;
      this.showRecord = true;
      getCustomerClickRecordDetail({ externalId: this.externalId, radarId: this.radarId })
        .then(({ data }) => {
          this.recordDetailList = data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    /**
     * @description: 刷新请求点击记录列表
     * @return {*}
     */
    getList(page) {
      if (page === 1) {
        this.query.pageNum = 1;
        const params = { ...this.query, radarId: this.radarId };
        this.finished = false;
        getCustomerClickRecord(params).then((res) => {
          this.$toast.success('刷新成功');
          this.refreshing = false;
          this.clickRecordList = res.rows;
        });
      } else {
        const params = { ...this.query, radarId: this.radarId };
        getCustomerClickRecord(params).then((res) => {
          this.loading = false; // 加载状态结束
          if (this.query.pageNum !== 1) {
            this.clickRecordList.push(...res.rows);
          }
          // 当雷达数量刚好是10的倍数时
          if (res.rows && res.rows.length !== 0) {
            if (res.rows.length < PAGE_LIMIT) {
              this.finished = true;
            } else {
              this.query.pageNum++;
            }
          } else {
            this.finished = true; // 全部加载完成
          }
        }).catch(() => {
          this.error = true;
        });
      }
    }
  }

};
</script>
<style scoped lang='less'>
.radar-details-page {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;

    .data-overview-container{
        height: 105px;
        width: 100%;
        background-color: white;
        margin-bottom: 10px;
        padding: 11px 9px;
        .title{
            font-family: Arial-bold;
            font-weight: 900;
            margin-bottom: 18px;
        }
        .data{
            display: flex;
            .data-item{
                width: 25%;
                display: flex;
                flex-direction: column;
                .data-item-msg{
                    color: #9c9c9c;
                    text-align: center;
                    font-size: 12px;
                    margin-bottom: 12px;
                }
                .data-item-count{
                    text-align: center;
                    font-size: 18px;
                    font-family: Arial-bold;
                    font-weight: 900;
                }
            }
        }
    }
    .my-client-container{
        background-color: white;
        padding: 13px 9px;
        .title{
            font-family: Arial-bold;
            font-weight: 900;
            margin-bottom: 10px;
        }
        .time-tab{
            .van-radio-group{
              width: 120px;
              height: 28px;
              .van-radio{
                margin-right:0 ;
                height: 100%;
                width: 50%;
                padding: 0;
                /deep/ .van-radio__icon{
                  height: 28px;
                  width: 60px;
                 .van-button{
                    height: 28px;
                    width: 60px;
                  }
                }
                &:nth-child(1) .van-button {
                  border-radius: 4px 0 0 4px;
                }
                &:nth-last-child(1) .van-button{
                  border-radius: 0 4px 4px 0;
                }
              }
            }
        }
        .search-input {
          margin-top: 10px;
          padding: 0;
          border-radius: 4px;
          border: 1px solid #ccc;
          .van-search__content {
              background-color: #fff;
          }
        }
    }
    .client-list-empty{
      flex: 1;
      overflow-y: scroll;
      background-color: white;
    }
    .client-list{
      padding: 0 10px;
      .client-list-item{
        padding: 10px 0;
        border-bottom:1px solid #F4F4F4;
        .item-top{
          width: 100%;
          height: 35px;
          display: flex;
          margin-bottom: 6px;
          img{
            height: 35px;
            width: 35px;
            object-fit: cover;
            border-radius:3px ;
            margin-right: 4px;
          }
          .info{
            flex:1;
            .info-nickname{
              width: 100%;
              height: 21px;
              line-height: 21px;
              display: flex;
              justify-content: space-between;
              .info-detail{
                width:21px;
                height:21px;
                cursor: pointer;
              }
            }
            .info-clicknum{
              font-size: 12px;
              color: #666;
            }
          }
        }

        .item-bottom{
          width: 100%;
          display: flex;
          justify-content: space-between;
          .info{
            font-size: 12px;
            color: #666;
            .info-clickchannel{
              margin-bottom: 5px;
            }
          }
          .open-dialog{
            width: 70px;
            height: 28px;
            border-radius:3px ;
          }
        }
      }
    }
    .popup-title {
      font-size: 16px;
      padding: 20px;
    }

    .van-step__title{
      h3{
        color: #101010;
        font-size: 12px;
        font-weight: 500;
      }
      p{
        color: #AEAEAE;
        font-size: 12px;
      }
    }
}
</style>
