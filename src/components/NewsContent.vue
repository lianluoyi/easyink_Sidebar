<!--
 * @Description: 信息动态
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div :class="['content-wrapper', newsItem.subType === EDIT_PIC ? 'content-img' : '']">
    <span>{{ newsItem.content }}</span>
    <template v-if="newsItem.subType === EDIT_TAG">
      <van-tag
        v-for="(tagItem, tagIndex) in dealContent(newsItem.detail)"
        :key="tagIndex"
        plain
        class="gray-tag-item"
      >{{ tagItem }}
      </van-tag>
    </template>
    <template v-else-if="newsItem.subType === EDIT_MULTI">
      <van-tag
        v-for="(tagItem, tagIndex) in dealContent(newsItem.detail)"
        :key="tagIndex"
        plain
        class="orange-tag-item"
      >{{ tagItem }}
      </van-tag>
    </template>
    <template v-else-if="newsItem.subType === EDIT_PIC">
      <van-image
        v-for="(imgItem, imgIndex) in dealContent(newsItem.detail)"
        :key="imgIndex"
        width="70"
        height="70"
        fit="cover"
        :src="imgItem"
      />
    </template>
    <template v-else-if="newsItem.subType === EDIT_FILE">
      <div v-for="(fileItem, fileIndex) in dealFile(newsItem.detail)" :key="fileIndex" class="file-name" @click="downloadFile(fileItem)">
        {{ fileItem.name }}
        <template v-if="fileIndex !== dealFile(newsItem.detail).length - 1">、</template>
      </div>
    </template>
    <template v-else>{{ newsItem.detail }}</template>
  </div>
</template>
<script>
import { downloadFile } from '@/utils/index';
// 修改标签
const EDIT_TAG = 'edit_tag';
// 修改多选
const EDIT_MULTI = 'edit_multi';
// 修改图片
const EDIT_PIC = 'edit_pic';
// 修改文件
const EDIT_FILE = 'edit_file';
// 修改备注
const EDIT_REMARK = 'edit_remark';
// 修改单选
const EDIT_CHOICE = 'edit_choice';

export default {
  name: 'NewsContent',
  components: {},
  props: {
    newsItem: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      EDIT_TAG,
      EDIT_MULTI,
      EDIT_PIC,
      EDIT_FILE,
      EDIT_REMARK,
      EDIT_CHOICE
    };
  },
  methods: {
    dealFile(value) {
      const list = value.split('|');
      const newList = [];
      try {
        list.map(item => {
          item && newList.push(JSON.parse(item));
        });
      } catch (e) { console.error('处理文件异常', e); }
      return newList;
    },
    dealContent(value) {
      return (value && value.split(',')) || '';
    },
    downloadFile(file) {
      downloadFile(file.url, file.name);
    }
  }
};
</script>
<style scoped lang='less'>
.content-wrapper {
  display: flex;
  align-items: center;
  line-height: 16px;
  &.content-img {
    align-items: flex-start;
  }
  flex-wrap: wrap;
  span {
    padding-top: 3px;
    padding-right: 3px;
  }
}
.van-image {
  margin-right: 2px;
  margin-bottom: 5px;
}
.file-name {
  color: #377aff;
  cursor: pointer;
}
</style>
