<!--
 * @Description: 主页
 * @Author: xulinbin
 * @LastEditors: xulinbin
-->
<script>
import Material from './material.vue';
import VerbalTrick from './verbalTrick.vue';
import RadarPage from './radarPage.vue';
import { MATERIAL_TYPE, WORDS_TYPE, RADARS_TYPE } from '@/utils/constants';
export default {
  components: { Material, VerbalTrick, RadarPage },
  props: {},
  data() {
    return {
      MATERIAL_TYPE,
      WORDS_TYPE,
      RADARS_TYPE,
      active: WORDS_TYPE
    };
  },
  computed: {
  },
  watch: {
  },
  beforeCreate() {},
  created() {
  },
  mounted() {},
  methods: {
  }
};
</script>

<template>
  <div class="material-verbal-main">
    <Material v-if="active === MATERIAL_TYPE" />
    <VerbalTrick v-if="active === WORDS_TYPE" />
    <RadarPage v-if="active === RADARS_TYPE" />
    <van-tabbar v-model="active" active-color="#6BB4AB">
      <van-tabbar-item :name="WORDS_TYPE">
        <span>话术库</span>
        <template #icon="props">
          <i class="iconfont icon-verbal-trick" :style="props.active ? 'color:#6BB4AB' : ''" />
        </template>
      </van-tabbar-item>
      <van-tabbar-item :name="MATERIAL_TYPE" icon="search">
        <span>素材库</span>
        <template #icon="props">
          <i class="iconfont icon-material" :style="props.active ? 'color:#6BB4AB' : ''" />
        </template>
      </van-tabbar-item>
      <van-tabbar-item :name="RADARS_TYPE" icon="search">
        <span>雷达库</span>
        <template #icon="props">
          <i class="iconfont icon-radar" :style="props.active ? 'color:#6BB4AB' : ''" />
        </template>
      </van-tabbar-item>
    </van-tabbar>
  </div>

</template>

<style lang="less" scoped>
.material-verbal-main {
  height: 100%;
  .van-tabbar {
    z-index: 999;
  }
}
</style>
