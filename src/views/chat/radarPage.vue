<!--
 * @Description: 雷达页面
 * @Author: xulinbin
 * @LastEditors: xulinbin
-->
<template>
  <div class="verbal-trick-div">
    <van-tabs v-model="active" color="#6BB4AB" title-active-color="#6BB4AB">
      <van-tab title="企业雷达" :name="RADAR_TYPE['enterprise']">
        <RadarContent v-if="active===RADAR_TYPE['enterprise']" :type="active" />
      </van-tab>
      <van-tab title="部门雷达" :name="RADAR_TYPE['department']">
        <RadarContent v-if="active===RADAR_TYPE['department']" :type="active" />
      </van-tab>
      <van-tab title="我的雷达" :name="RADAR_TYPE['personal']">
        <RadarContent v-if="active===RADAR_TYPE['personal']" :type="active" />
      </van-tab>
    </van-tabs>
  </div>
</template>
<script>
import RadarContent from './component/RadarContent.vue';
import { RADAR_TYPE } from '@/utils/constants';
export default {
  name: '',
  components: { RadarContent },
  props: {},
  data() {
    return {
      RADAR_TYPE,
      active: RADAR_TYPE['personal']
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
