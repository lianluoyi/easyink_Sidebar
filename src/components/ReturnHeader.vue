<!--
 * @Description: 返回组件
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="header-container">
    <van-icon name="revoke" size="18" @click="goBack" />
    <span>返回</span>
  </div>
</template>
<script>
export default {
  name: 'ReturnHeader',
  components: {},
  props: {},
  data() {
    return {
    };
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * 返回
     */
    goBack() {
      this.$emit('goBack');
    }
  }

};
</script>
<style scoped lang='less'>
 .header-container {
        height: 36px;
        display: flex;
        align-items: center;
        padding: 0 10px;
        border-bottom: 1px solid #eee;
        background-color: #fff;
        .van-icon-revoke {
            margin-right: 10px;
            cursor: pointer;
        }
    }
</style>
