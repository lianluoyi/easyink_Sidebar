
<template>
  <div class="recent-forms-div">
    <div :class="`group-name${expandFlag ? ' expand-group' : ''}`" @click="expandGroup">
      <van-icon name="play" class="arrow-icon" />
      最近使用
    </div>
    <div v-show="expandFlag" class="recent-forms-content">
      <IntelligentFormItem
        v-for="(recentItem, recentIndex) in recentFormsList"
        :key="recentIndex"
        :form-item="recentItem"
        :type="type"
        :is-recent="true"
      />
    </div>
  </div>
</template>
<script>
import { INTELLIGENT_FORM_TYPE } from '@/utils/constants';
import { getFormRecord } from '@/api/form';
import IntelligentFormItem from './intelligentFormItem.vue';
export default {
  name: '',
  components: { IntelligentFormItem },
  props: {
    /**
     * 话术类型
     */
    type: {
      type: Number,
      default: INTELLIGENT_FORM_TYPE['personal']
    },
    userId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // 最近使用表单列表
      recentFormsList: [],
      loading: false,
      // 是否展开最近使用(默认展开)
      expandFlag: true
    };
  },
  watch: {
    // userId改变后再次获取最近使用列表
    userId(val) {
      if (val) {
        this.getRecentForms();
      }
    },
    type(val) {
      if (val || val === 0) {
        this.getRecentForms();
      }
    }
  },
  created() {
    if (this.userId) this.getRecentForms();
  },
  mounted() {},
  methods: {
    /**
     * 展开最近使用
     */
    expandGroup() {
      const expandFlag = this.expandFlag;
      if (!expandFlag) this.getRecentForms();
      this.expandFlag = !expandFlag;
    },
    /**
     * 获取最近使用表单列表
     */
    async getRecentForms() {
      this.loading = true;
      const getRes = await getFormRecord({
        sourceType: this.type
      });
      if (getRes) {
        this.loading = false;
        this.recentFormsList = [...getRes.rows];
      }
    }
  }

};
</script>
<style scoped lang='less'>
.recent-forms-div {
  margin-bottom: 10px;
  .recent-forms-content {
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
