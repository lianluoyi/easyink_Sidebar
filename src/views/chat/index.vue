<script>
import Material from './material.vue';
import VerbalTrick from './verbalTrick.vue';
const MATERIAL_TYPE = 'material';
const WORDS_TYPE = 'words';
export default {
  components: { Material, VerbalTrick },
  props: {},
  data() {
    return {
      MATERIAL_TYPE,
      WORDS_TYPE,
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
