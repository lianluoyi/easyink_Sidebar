<!--
 * @Description: 主页
 * @Author: xulinbin
 * @LastEditors: xulinbin
-->
<script>
import Material from './material.vue';
import VerbalTrick from './verbalTrick.vue';
import RadarPage from './radarPage.vue';
import IntelligentForm from './intelligentForm.vue';
import { MATERIAL_TYPE, WORDS_TYPE, RADARS_TYPE, FORM_TYPE } from '@/utils/constants';
export default {
  components: { Material, VerbalTrick, RadarPage, IntelligentForm },
  props: {},
  data() {
    return {
      MATERIAL_TYPE,
      WORDS_TYPE,
      RADARS_TYPE,
      FORM_TYPE,
      active: WORDS_TYPE,
      // 外部联系人userId
      externalUserId: undefined
    };
  },
  provide() {
    return {
      getExternalUserId: () => this.externalUserId
    };
  },
  computed: {},
  watch: {
    '$store.state.agentConfigStatus'(val) {
      val && this.init();
    }
  },
  methods: {
    init() {
      const _this = this;
      wx.invoke('getContext', {}, function(res) {
        if (res.err_msg === 'getContext:ok') {
          const entry = res.entry;
          _this.portraitType = entry === 'group_chat_tools' ? 'group' : 'customer';
          switch (_this.portraitType) {
            case 'customer': {
              wx.invoke('getCurExternalContact', {}, (res) => {
                if (res.err_msg === 'getCurExternalContact:ok') {
                  _this.externalUserId = res.userId; // 返回当前外部联系人userId
                }
              });
              break;
            }
            case 'group': {
              wx.invoke('getCurExternalChat', {}, (res) => {
                if (res.err_msg === 'getCurExternalChat:ok') {
                  _this.externalUserId = res.chatId; // 返回当前客户群id
                }
              });
              break;
            }
          }
        }
      });
    }
  }
};
</script>

<template>
  <div class="material-verbal-main">
    <Material v-if="active === MATERIAL_TYPE" />
    <VerbalTrick v-if="active === WORDS_TYPE" />
    <RadarPage v-if="active === RADARS_TYPE" />
    <IntelligentForm v-if="active === FORM_TYPE" />
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
      <van-tabbar-item :name="FORM_TYPE" icon="search">
        <span>智能表单</span>
        <template #icon="props">
          <i class="iconfont icon-formMenu" :style="props.active ? 'color:#6BB4AB' : ''" />
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
