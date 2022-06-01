<!--
 * @Description:最近使用话术列表
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="recent-words-div">
    <div :class="`group-name${expandFlag ? ' expand-group' : ''}`" @click="expandGroup">
      <van-icon name="play" class="arrow-icon" />
      最近使用
    </div>
    <div v-show="expandFlag" class="recent-verbal-trick-content">
      <VerbalTrickItem
        v-for="(recentItem, recentIndex) in recentWordsList"
        :key="recentIndex"
        :word-item="recentItem"
        :word-index="recentIndex"
        :words-list="recentWordsList"
        :show-tool="false"
        :type="type"
      />
    </div>
  </div>
</template>
<script>
import { VERBAL_TRICK_TYPE } from '@/utils/constants';
import { getLastUse } from '@/api/wordsGroup';
import VerbalTrickItem from './VerbalTrickItem.vue';
export default {
  name: '',
  components: { VerbalTrickItem },
  props: {
    /**
     * 话术类型
     */
    type: {
      type: Number,
      default: VERBAL_TRICK_TYPE['personal']
    },
    userId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      recentWordsList: [],
      loading: false,
      // 展开最近使用
      expandFlag: true
    };
  },
  watch: {
    // 获取到userId后再获取最近使用列表
    userId(val) {
      if (val) {
        this.getRecentWords();
      }
    },
    type(val) {
      if (val || val === 0) {
        this.getRecentWords();
      }
    }
  },
  created() {
    if (this.userId) this.getRecentWords();
  },
  mounted() {},
  methods: {
    /**
     * 展开最近使用
     */
    expandGroup() {
      const expandFlag = this.expandFlag;
      if (!expandFlag) this.getRecentWords();
      this.expandFlag = !expandFlag;
    },
    /**
     * 获取最近使用话术列表
     */
    async getRecentWords() {
      this.loading = true;
      const getRes = await getLastUse({
        type: this.type
      });
      if (getRes) {
        this.loading = false;
        this.recentWordsList = [...getRes.data];
      }
    }
  }

};
</script>
<style scoped lang='less'>
.recent-words-div {
    margin-bottom: 10px;
    .recent-verbal-trick-content {
      max-height: 300px;
      overflow: auto;
    }
    .expand-group {
      margin-bottom: 10px;
        .van-icon-play {
            transform: rotate(90deg)
        }
    }
}
</style>
