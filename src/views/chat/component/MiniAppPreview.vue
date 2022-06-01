<!--
 * @Description: 文件预览样式
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="appid-preview-div">
    <div class="title">{{ detailItem.title }}</div>
    <div class="cover-div">
      <van-image
        fit="cover"
        class="cover-img"
        :src="detailItem.coverUrl"
      >
        <template v-slot:error>
          <svg class="icon-mini-app" :width="25" :height="25">
            <use href="#icon-mini-app" />
          </svg>
        </template>
      </van-image>
    </div>
    <div class="desc">
      <i class="iconfont icon-mini-app" />
      <span>小程序</span>
    </div>
  </div>
</template>
<script>
import { MEDIA_TYPE } from '@/utils/constants';

export default {
  name: '',
  components: {},
  props: {
    detailItem: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      MEDIA_TYPE
    };
  },
  created() {},
  mounted() {}
};
</script>
<style scoped lang='less'>
.appid-preview-div {
    border: 1px solid @borderColor;
    width: 200px;
    border-radius: 3px;
    text-align: left;
    padding: 10px;
    .title, .desc {
        line-height: 16px;
    }
    .cover-div {
        margin-top: 10px;
        width: 178px;
        border: 1px solid @borderColor;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 3px;
        /deep/ .van-image {
          height: 92px;
        }
    }
    .desc {
        margin-top: 5px;
        .icon-mini-app {
          margin-right: 5px;
        }
    }
}
</style>
