<!--
 * @Description: 链接预览
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="file-item">
    <div class="file-info">
      <div class="file-title line2-toe">{{ detailItem.title }}</div>
    </div>
    <div class="cover-img">
      <van-image
        fit="contain"
        :src="dealCoverUrl(detailItem, detailItem.mediaType)"
      >
        <template v-slot:error>
          <svg class="icon-img-link" :width="25" :height="25">
            <use href="#icon-img-link" />
          </svg>
        </template>
      </van-image>
    </div>
  </div>
</template>
<script>
import { getFileIcon, filterSize } from '@/utils/index';
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
  mounted() {},
  methods: {
    /**
     * 获取文件类型图标class
     */
    getFileIconClass(item) {
      return getFileIcon(item.url);
    },
    /**
     * 获取封面地址
     */
    dealCoverUrl(item, type) {
      if ([MEDIA_TYPE['IMG_LINK'], MEDIA_TYPE['MINI_APP']].includes(type)) {
        return item.coverUrl;
      } else {
        return item.url;
      }
    },
    /**
     * 获取摘要内容
     */
    dealContent(content, type) {
      if ([MEDIA_TYPE['POSTER'], MEDIA_TYPE['VIDEO'], MEDIA_TYPE['FILE']].includes(type)) {
        return filterSize(content);
      } else {
        return content;
      }
    }
  }

};
</script>
<style scoped lang='less'>
.file-item {
    display: flex;
    padding: 5px;
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
        .line2-toe {
            -webkit-line-clamp: 3;
            margin-left: 7px;
        }
    }
}
</style>

