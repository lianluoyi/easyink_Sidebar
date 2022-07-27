<!--
 * @Description: 每个雷达item
 * @Author: xulinbin
 * @LastEditors: xulinbin
-->
<template>
  <div class="radar-item">
    <div class="radar-item-title">
      <svg class="icon-send" :width="22" :height="22" title="发送" @click="handleSendAll">
        <use href="#icon-send" />
      </svg>
      <div class="title">{{ item.radarTitle }}</div>
      <div v-if="canManage" class="details">
        <RadarItemhandle :is-personal="type === RADAR_TYPE['personal']" :radar-id="item.radarId" @editFunction="changeRadar" @delete="sunClickDelete" />
      </div>
    </div>
    <div class="radar-item-content">
      <div class="item-con-left">
        <img v-if="item.weRadarUrl && item.weRadarUrl.coverUrl" :src="item.weRadarUrl && item.weRadarUrl.coverUrl">
        <i v-else class="iconfont icon-img-link" style="font-size: 37px; color: #6BB4AB;" />
      </div>
      <div class="item-con-right">
        <div class="title">{{ item.weRadarUrl && item.weRadarUrl.title }}</div>
        <div class="info">{{ item.weRadarUrl && item.weRadarUrl.content }}</div>
        <div class="show-details" @click="openRadarDetails">共{{ item.clickNum ? item.clickNum : 0 }}人点击 ></div>
      </div>
    </div>
  </div>
</template>

<script>

import RadarItemhandle from './RadarItemhandle.vue';
import { RADAR_TYPE, MEDIA_TYPE } from '@/utils/constants';
import { mapState, mapMutations } from 'vuex';
import { sendMessage } from '@/utils/index';
import { getRadarShortUrl } from '@/api/radar';
export default {
  components: { RadarItemhandle },
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    type: {
      type: Number,
      default: RADAR_TYPE['personal']
    },
    showRadarDetails: {
      type: Boolean,
      default: false
    },
    canManage: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      RADAR_TYPE
    };
  },
  computed: {
    ...mapState('radarData', {
      radarDetailsIsShow: (state) => state.radarDetailsIsShow
    })
  },
  methods: {
    async handleSendAll() {
      this.$toast.loading({
        message: '正在发送...',
        duration: 0,
        forbidClick: true
      });
      const { weRadarUrl: { title, content, coverUrl }, radarId } = this.item;
      const sendObj = {
        mediaType: MEDIA_TYPE['IMG_LINK'],
        materialName: title,
        digest: content,
        coverUrl
      };
      const sendRes = await getRadarShortUrl({ radarId, userId: this.$store.state.userId });
      sendMessage({
        ...sendObj,
        materialUrl: sendRes?.data?.url
      }, this);
    },
    ...mapMutations('radarData', { changeRadarDetailsIsShow: 'changeRadarDetailsIsShow', changeRadarId: 'changeRadarId' }),
    openRadarDetails() {
      this.changeRadarId(this.item.radarId);
      this.changeRadarDetailsIsShow(true);
    },
    /**
     * @description: 编辑雷达
     * @param {*} radarId  雷达id
     * @return {*}
     */
    changeRadar(radarId) {
      this.$emit('changeRadar', radarId);
    },
    /**
     * @description: itemhandel点击删除
     * @return {*}
     */
    sunClickDelete() {
      this.$emit('delete');
    }
  }
};
</script>

<style lang="less" scoped>
  .radar-item{
    height: 114px;
    width: 100%;
    border-radius: 2px;
    background-color: white;
    margin: 0 auto 5px auto;
    .radar-item-title{
      height: 39px;
      width: 100%;
      display: flex;
      align-items: center;
      padding-left:10px;
      .title{
        flex: 1;
        margin-left: 8px;
        display: -webkit-box;
        overflow: hidden;
        -webkit-box-orient:vertical;
        -webkit-line-clamp:1;
      }
      .icon-send{
        cursor: pointer;
      }
      .details{
        width: 20px;
        height: 20px;
        cursor: pointer;
        text-align: center;
        margin-right: 6px;
        display: none;
      }
      &:hover .details{
        display: block;
      }
    }
    .radar-item-content{
      display: flex;
      .item-con-left{
        margin: 0 10px 0 40px;
        width: 60px;
        height: 60px;
        border-radius: 5px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        img{
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      .item-con-right{
        flex: 1;
        display: flex;
        flex-direction: column;
        .title{
          height: 15px;
          max-width: 217px;
          display: -webkit-box;
          overflow: hidden;
          -webkit-box-orient:vertical;
          -webkit-line-clamp:1;
        }
        .info{
          font-size: 12px;
          max-width: 217px;
          color: #7F7F7F;
          margin-top: 5px;
          display: -webkit-box;
          overflow: hidden;
          -webkit-box-orient:vertical;
          -webkit-line-clamp:1;
        }
        .show-details{
          margin-top: 10px;
          font-size: 12px;
          color: #7F7F7F;
          cursor: pointer;
        }
      }
    }
  }
</style>
