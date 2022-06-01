<!--
 * @Description: 文件摘要
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<script>
import { filterSize } from '@/utils/index';
import { MEDIA_TYPE } from '@/utils/constants';

export default {
  name: 'FileInfo',
  components: {},
  props: {
    item: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      MEDIA_TYPE
    };
  },
  computed: {},
  watch: {},
  created() {

  },
  mounted() {},
  methods: {
    /**
     * 计算文件大小
     */
    fileSizeText(fileSize) {
      return filterSize(Number(fileSize)) || '';
    }
  }
};
</script>

<template>
  <div class="file-size-info line2-toe">
    <span v-if="[MEDIA_TYPE['POSTER'], MEDIA_TYPE['FILE'], MEDIA_TYPE['VIDEO']].includes(item.mediaType) && item.content">{{ fileSizeText(item.content) }}</span>
    <span v-else-if="item.mediaType === MEDIA_TYPE['IMG_LINK'] && item.digest" class="toe">{{ item.digest }}</span>
  </div>
</template>

<style lang="less" scoped>
.file-size-info {
    color: @fontColor;
    font-size: 12px;
    margin-top: 5px;
    word-break: break-word;
}
</style>

