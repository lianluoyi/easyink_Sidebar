<!--
 * @Description: 移动工具样式
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <van-popover
    v-if="dropdownTool"
    v-model="showPopover"
    trigger="click"
    class="group-popover"
    :placement="placement"
  >
    <template #reference>
      <i class="iconfont icon-more" @click="handleTool" />
    </template>
    <template>
      <div class="dropdown-list">
        <div v-if="showAddVerbalTrick" class="dropdown-item" @click="addVerbalTrick">
          <van-icon name="add-o" />话术
        </div>
        <div v-if="editVerbalTrick" class="dropdown-item" @click="handleEdit"><i class="iconfont icon-edit" />编辑</div>
        <div :class="`dropdown-item${(index === 0 ? ' disabled-tool' : '')}`" @click="moveGroup('placedAtTop', index, item)">
          <van-icon name="back-top" size="16" />置顶
        </div>
        <div :class="`dropdown-item${(index === 0 ? ' disabled-tool' : '')}`" @click="moveGroup('moveTop', index, item)">
          <van-icon class="move-top" name="down" />
          上移
        </div>
        <div :class="`dropdown-item${(checkLastItem(index, list) ? ' disabled-tool' : '')}`" @click="moveGroup('moveBottom', index, item)">
          <van-icon name="down" />
          下移
        </div>
        <div class="dropdown-item" @click="moveGroup('remove', index, item)"><i class="iconfont icon-remove" />删除</div>
      </div>
    </template>
  </van-popover>
  <div v-else class="move-tool-circle">
    <van-icon :class="`${(index === 0 ? 'disabled-tool' : '')}`" name="back-top" @click="moveGroup('placedAtTop', index, item)" />
    <van-icon :class="`move-top${(index === 0 ? ' disabled-tool' : '')}`" name="down" @click="moveGroup('moveTop', index, item)" />
    <van-icon :class="`${(checkLastItem(index, list) ? ' disabled-tool' : '')}`" name="down" @click="moveGroup('moveBottom', index, item)" />
    <i class="iconfont icon-remove_circle" @click="moveGroup('remove', index, item)" />
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    editVerbalTrick: {
      type: Boolean,
      default: false
    },
    showAddVerbalTrick: {
      type: Boolean,
      default: false
    },
    addVerbalTrick: {
      type: Function,
      default: () => {}
    },
    index: {
      type: Number,
      default: 0
    },
    list: {
      type: Array,
      default: () => []
    },
    item: {
      type: Object,
      default: () => {}
    },
    dropdownTool: {
      type: Boolean,
      default: true
    },
    placement: {
      type: String,
      default: 'bottom-end'
    }
  },
  data() {
    return {
      showPopover: false,
      removeList: []
    };
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * 显示下拉菜单
     */
    handleTool(e) {
      e.stopPropagation();
      this.showPopover = !this.showPopover;
    },
    /**
     * 判断是否为最后一个
     */
    checkLastItem(index, list) {
      return index === list.length - 1;
    },
    /**
     * 移动子分组
     */
    moveGroup(type, index, item) {
      const newList = [...this.list];
      switch (type) {
        // 置顶
        case 'placedAtTop': {
          newList.splice(index, 1);
          newList.unshift(item);
          break;
        }
        // 上移
        case 'moveTop': {
          newList.splice(index - 1, 0, newList.splice(index, 1)[0]);
          break;
        }
        // 下移
        case 'moveBottom': {
          newList.splice(index, 0, newList.splice(index + 1, 1)[0]);
          break;
        }
        // 移除
        case 'remove': {
          newList.splice(index, 1);
          const list = [...this.removeList];
          list.push(item);
          this.removeList = list;
          this.$emit('removeItem', item, newList);
          break;
        }
      }
      this.$emit('updateList', newList, type);
    },
    /**
     * 点击编辑
     */
    handleEdit() {
      this.$emit('editFunction');
    }
  }

};
</script>
<style scoped lang='less'>
.dropdown-list {
  width: 75px;
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
