<!--
 * @Description: 话术库
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="verbal-trick-div">
    <van-tabs v-model="active" color="#6BB4AB" title-active-color="#6BB4AB">
      <van-tab title="我的话术" :name="VERBAL_TRICK_TYPE['personal']">
        <VerbalTrickContent :type="active" />
      </van-tab>
      <van-tab title="部门话术" :name="VERBAL_TRICK_TYPE['department']">
        <VerbalTrickContent :type="active" />
      </van-tab>
      <van-tab title="企业话术" :name="VERBAL_TRICK_TYPE['enterprise']">
        <VerbalTrickContent :type="active" />
      </van-tab>
    </van-tabs>
  </div>
</template>
<script>
import VerbalTrickContent from './component/VerbalTrickContent.vue';
import { VERBAL_TRICK_TYPE } from '@/utils/constants';
export default {
  name: '',
  components: { VerbalTrickContent },
  props: {},
  data() {
    return {
      VERBAL_TRICK_TYPE,
      active: VERBAL_TRICK_TYPE['personal']
    };
  },
  created() {},
  mounted() {}

};
</script>
<style scoped lang='less'>
.verbal-trick-div {
    padding-bottom: 50px;
    height: 100%;
}
</style>
