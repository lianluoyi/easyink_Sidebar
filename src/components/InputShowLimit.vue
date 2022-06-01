<!--
 * @Description: 待限制字数样式的单行输入框
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <van-field
    v-model="showInputValue"
    v-bind="$attrs"
    class="popup-input"
    show-word-limit
  />
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    /**
     * 输入值
     */
    inputValue: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  },
  computed: {
    showInputValue: {
      get() {
        return this.inputValue;
      },
      set(val) {
        this.$emit('update:inputValue', val);
      }
    }
  }
};
</script>
<style scoped lang='less'>
.popup-input {
    border: 1px solid #DCE0E7;
    padding: 5px 10px;
    /deep/ .van-cell__value {
        display: flex;
    }
    /deep/ .van-field__body {
        flex: 1;
    }
    /deep/ .van-field__word-limit {
        color: #FA7216;
    }
}
</style>
