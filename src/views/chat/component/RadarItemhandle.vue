<!--
 * @Description: 雷达item详情
 * @Author: xulinbin
 * @LastEditors: wJiaaa
-->
<template>
  <van-popover
    v-if="dropdownTool"
    v-model="showPopover"
    trigger="click"
    :placement="placement"
    get-container=".radar-item"
  >
    <template #reference>
      <i class="iconfont icon-more" @click="handleTool" />
    </template>
    <template>
      <div class="dropdown-list">
        <div v-if="isPersonal" class="dropdown-item" @click="handleEdit(radarId)"><i class="iconfont icon-edit" />编辑</div>
        <div v-if="isPersonal" class="dropdown-item" @click="handleRemove"><i class="iconfont icon-remove" />删除</div>
        <div class="dropdown-item" @click="customChannel"><i class="iconfont icon-edit" />自定义渠道</div>
      </div>
    </template>
  </van-popover>
</template>
<script>

import { mapMutations } from 'vuex';
export default {
  name: '',
  props: {
    // 是否是个人雷达
    isPersonal: {
      type: Boolean,
      default: true
    },
    // 雷达id
    radarId: {
      type: String,
      default: '0'
    },
    // 展示操作框
    dropdownTool: {
      type: Boolean,
      default: true
    },
    // 弹出位置
    placement: {
      type: String,
      default: 'bottom-end'
    }
  },
  data() {
    return {
      showPopover: false
    };
  },
  computed: {},
  created() {},
  mounted() {},
  methods: {
    ...mapMutations('radarData', { changeRadarId: 'changeRadarId', changeRadarChannelIsShow: 'changeRadarChannelIsShow' }),
    /**
     * 显示下拉菜单
     */
    handleTool(e) {
      e.stopPropagation();
      this.showPopover = !this.showPopover;
      this.changeRadarId(this.radarId);
    },
    /**
     * 点击编辑
     */
    handleEdit(radarId) {
      this.$emit('editFunction', radarId);
    },
    /**
     * @description:点击删除
     * @return {*}
     */
    handleRemove() {
      this.$emit('delete');
    },
    /**
     * @description:自定义渠道
     * @return {*}
     */
    customChannel() {
      this.changeRadarChannelIsShow(true);
    }
  }

};
</script>
<style scoped lang='less'>
.dropdown-list {
  width: 117px;
  .dropdown-item {
    display: flex;
    align-items: center;
    padding: 5px 10px;
    cursor: pointer;
    .iconfont {
      font-size: 14px;
    }
    .van-icon, .iconfont {
      margin-right: 5px;
    }
  }
  .disabled-tool {
        cursor: not-allowed;
        color: #888;
    }
}
.move-tool-circle {
    .van-icon, .iconfont {
        margin-left: 5px;
        font-size: 18px;
    }
    .disabled-tool {
        cursor: not-allowed;
        color: #888;
    }
}
.move-top {
  transform: rotate(180deg);
}
</style>
