<!--
 * @Description: 列表选择弹窗
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <van-popup v-model="accountShow" round position="bottom" v-bind="$attrs">
    <div class="popup">
      <div class="header">
        <van-button type="text" square @click="accountShow = false">取消</van-button>
        <span>{{ title }}</span>
        <van-button type="text" square @click="onOk">确定</van-button>
      </div>
      <van-search v-model="queryUserName" :placeholder="popupPlaceholder" />
      <van-list class="list-container">
        <van-cell
          v-for="item in showList"
          v-show="item[userNameKey] && item[userNameKey].includes(queryUserName)"
          :key="item[userNameKey]"
          :title="item[userNameKey]"
          class="cell"
          title-class="van-ellipsis"
          center
          @click="() => onSelectedUser(item)"
        >
          <van-checkbox
            slot="right-icon"
            checked-color="#6BB4AB"
            :value="checkedUser(item)"
          />
        </van-cell>
      </van-list>
    </div>
  </van-popup>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    bindAccountShow: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    popupPlaceholder: {
      type: String,
      default: ''
    },
    showList: {
      type: Array,
      default: () => []
    },
    okHandle: {
      type: Function,
      default: () => {}
    },
    userNameKey: {
      type: String,
      default: 'userName'
    },
    userId: {
      type: String,
      default: 'userId'
    }
  },
  data() {
    return {
      queryUserName: '',
      selectedUser: {}
    };
  },
  computed: {
    accountShow: {
      get() {
        return this.bindAccountShow;
      },
      set(val) {
        this.$emit('update:bindAccountShow', val);
      }
    }
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * 点击确认
     */
    onOk() {
      this.okHandle(this.selectedUser);
    },
    onSelectedUser(item) {
      this.selectedUser = { ...item };
    },
    /**
     * 对应项是否被选中
     */
    checkedUser(item) {
      return this.selectedUser[this.userId] === item[this.userId];
    }
  }
};
</script>
<style scoped lang='less'>
.popup {
    height: 80vh;
    position: relative;
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 0.4em;
      font-size: 16px;
      height: 3em;
      .van-button {
        color: @green;
        height: 2em;
      }
    }
    /deep/ .van-search {
      height: 54px;
    }
    .list-container {
      height: calc(100% - 3em - 59px);
      overflow: auto;
    }
  }
</style>
