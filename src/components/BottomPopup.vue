<!--
 * @Description: 底部弹出层
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <van-popup
    v-model="popupVisible"
    v-bind="$attrs"
    class="bottom-popup"
    closeable
    position="bottom"
  >
    <div class="top-container">
      <div class="popup-title">{{ title }}</div>
      <slot />
    </div>
    <div class="btn-div">
      <van-button size="small" type="default" @click="cancelPopup">
        取 消
      </van-button>
      <van-button color="#6BB4AB" size="small" type="primary" @click="confirmPopup">
        保 存
      </van-button>
    </div>
  </van-popup>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    cancelFunc: {
      type: Function,
      default: () => {}
    },
    confirmFunc: {
      type: Function,
      default: () => {}
    },
    title: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    };
  },
  computed: {
    popupVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    }
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * 取消
     */
    cancelPopup() {
      this.popupVisible = false;
      this.$emit('cancelFunc');
    },
    /**
     * 保存
     */
    confirmPopup() {
      this.popupVisible = false;
      this.$emit('confirmFunc');
    }
  }

};
</script>
<style scoped lang='less'>
.bottom-popup {
  padding: 20px;
  display: flex;
  flex-direction: column;
  .top-container {
    flex: 1;
    .popup-title {
      font-size: 16px;
      margin-bottom: 20px;
    }
  }
  .btn-div {
    text-align: right;
    margin-top: 10px;
    button {
      margin-left: 10px;
      width: 56px;
    }
  }
}
</style>
