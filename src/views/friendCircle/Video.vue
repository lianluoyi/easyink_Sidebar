<!--
 * @Description: 视频预览
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="file-item">
    <div class="cover-img">
      <div class="video-img">
        <video :src="detailItem.url" />
        <svg class="icon-player" :width="25" :height="25">
          <use href="#icon-player" />
        </svg>
      </div>
    </div>
    <div class="file-info">
      <div class="file-title line2-toe">{{ detailItem.title }}</div>
      <div class="file-content toe">{{ dealContent(detailItem.size) }}</div>
    </div>
  </div>
</template>
<script>
import { filterSize } from '@/utils/index';

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
    };
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * 获取视频大小
     */
    dealContent(size) {
      return filterSize(size);
    }
  }

};
</script>
<style scoped lang='less'>
.file-item {
    display: flex;
    padding: 10px;
    flex: 1;
    width: 100%;
    .cover-img {
        width: 60px;
        height: 60px;
        border: 1px solid @borderColor;
        margin-right: 5px;
        border-radius: 3px;
        video, .van-image {
            width: 100%;
            height: 100%;
        }
    }
    .file-info {
        font-size: 13px;
        text-align: left;
        flex: 1;
        overflow: hidden;
        .file-title {
            color: #606266;
            margin-bottom: 5px;
        }
        .file-content {
            color: #7F7F7F;
            overflow: hidden;
        }
    }
    .video-img {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
      .icon-player {
        position: absolute;
        opacity: 0.4;
      }
    }
}
</style>
