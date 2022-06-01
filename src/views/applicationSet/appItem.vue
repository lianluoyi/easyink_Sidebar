<!--
 * @Description: 单个应用样式
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <van-cell
    :class="item.sidebarRedirectUrl"
    :is-link="isLink"
    @click="goToUrl(item)"
  >
    <template #title>
      <div class="app-content">
        <div class="mr10">
          <van-image
            :src="item.logoUrl"
            width="100px"
            height="76px"
          >
            <template v-slot:error>
              <van-image
                :src="require('@/assets/defaultAppLogo.png')"
                width="100px"
                height="76px"
              />
            </template>
          </van-image>
        </div>
        <div class="info-div">
          <div class="toe title mb10" :title="item.name">{{ item.name }}</div>
          <div class="line2-toe desc" :title="item.description">{{ item.description }}</div>
        </div>
      </div>
    </template>
  </van-cell>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    isLink: {
      type: Boolean,
      default: false
    },
    goToUrl: {
      type: Function,
      default: () => {}
    }
  }
};
</script>
<style scoped lang='less'>
.app-content {
    display: flex;
    .info-div {
      .title {
        font-size: 16px;
      }
      .desc {
        color: #666666;
        line-height: 18px;;
      }
    }
}
</style>
