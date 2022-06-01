<!--
 * @Description: 客户/客户群标签弹窗
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <!-- 点击客户标签里的编辑触发弹出框开始 -->
  <van-action-sheet v-model="Pshow">
    <van-nav-bar
      class="manage-nav"
      :title="portraitType === 'customer' ? '客户标签管理' : '客户群标签管理'"
      right-text="取消"
      @click-right="Pshow = false"
    />
    <div class="content">
      <div class="tag-search-area">
        <div class="group-search">
          <van-popover
            v-model="showPopover"
            placement="bottom-end"
            get-container=".tag-search-area"
            class="tag-group-poppver"
            trigger="click"
            :actions="tagActions"
            @select="changeSelectGroup"
            @opened="showGroupSelect"
          >
            <template #reference>
              <van-field v-model="selectedGroupName" readonly placeholder="所有标签组" right-icon="arrow-down" />
            </template>
          </van-popover>
        </div>
        <van-field v-model="tagName" placeholder="请输入标签" clearable :right-icon="tagName ? '' : 'search'" />
      </div>
      <div class="tag-group-list">
        <div v-for="(item, index) in tagGroups.filter(tagGroupFilterFn)" :key="index">
          <div class="mb10 mt5">{{ item.groupName }}：</div>
          <div class="labelstyle">
            <div
              v-for="(unit, unique) in item.weTags.filter(tagFilterFn)"
              :key="unique"
              class="label"
              style="cursor: pointer"
              :style="addTag.some((e) => e.tagId == unit.tagId) ? isActive : ''"
              @click="userLabel(unit)"
            >
              {{ unit.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <van-button
      class="saveinfo"
      round
      @click="saveInfo"
    >保存</van-button>
  </van-action-sheet>
  <!-- 点击客户标签里的编辑触发弹出框结束 -->
</template>
<script>
import { updateCustomerDetail } from '@/api/customer';
import { batchAddTagRel, batchDelTagRel } from '@/api/grouptag';
import { TRAJECTORY_TYPE } from '@/utils/constants';

export default {
  name: '',
  components: {},
  props: {
    show: {
      type: Boolean,
      default: false
    },
    tagActions: {
      type: Array,
      default: () => []
    },
    tagGroups: {
      type: Array,
      default: () => []
    },
    /**
     * 已选中的标签
     */
    addTag: {
      type: Array,
      default: () => []
    },
    externalUserid: {
      type: String,
      default: ''
    },
    userId: {
      type: String,
      default: ''
    },
    /**
     * 获取客户/群资料
     */
    getCustomerInfo: {
      type: Function,
      default: () => {}
    },
    trajectoryType: {
      type: Number,
      default: null
    },
    portraitType: {
      type: String,
      default: 'customer'
    },
    oldTagList: {
      type: Array,
      default: () => []
    }
  },
  inject: ['findTrajectory'],
  data() {
    return {
      showPopover: false,
      selectedGroupName: '',
      tagName: '',
      isActive: 'background:#6BB4AB;color:#fff'
    };
  },
  computed: {
    Pshow: {
      get() {
        return this.show;
      },
      set(val) {
        this.$emit('update:show', val);
      }
    }
  },
  created() {},
  mounted() {},
  methods: {
    changeSelectGroup(group) {
      this.selectedGroupName = group.value;
    },
    tagGroupFilterFn(group) {
      const isSelectGroup = this.selectedGroupName ? group.groupName === this.selectedGroupName : true;
      if (this.tagName) {
        const isTagInSearch = group.weTags.find(ele => ele.name.includes(this.tagName));
        return isTagInSearch && isSelectGroup;
      }
      return isSelectGroup;
    },
    tagFilterFn(tag) {
      if (!this.tagName) return true;
      return tag.name.includes(this.tagName);
    },
    // 第一层标签
    userLabel(item) {
      const index = this.addTag.findIndex((e) => {
        return item.tagId === e.tagId;
      });
      // 数组里不存在该对象,则添加
      if (index === -1) {
        this.addTag.push({
          groupId: item.groupId,
          name: item.name,
          tagId: item.tagId
        });
      } else {
        // 数组里存在该对象,则删除
        this.addTag.splice(index, 1);
      }
    },
    /**
     * 点击保存
     */
    saveInfo() {
      switch (this.portraitType) {
        case 'customer': {
          // 更新客户画像标签 [{ groupId: this.groupId, name: this.name, tagId: this.tagId }]
          updateCustomerDetail({
            externalUserid: this.externalUserid,
            userId: this.userId,
            editTag: this.addTag
          })
            .then((res) => {
              this.Pshow = false;
              //   重新获取客户标签
              this.getCustomerInfo();
              this.$toast.success('保存成功');
              // 当前tab为信息动态则调用
              this.trajectoryType === TRAJECTORY_TYPE['news'] && this.findTrajectory();
            })
            .catch((err) => {
              console.log(err);
            });
          break;
        }
        case 'group': {
          const selected = [...this.addTag];
          const addList = selected.filter(tag => !this.oldTagList.find(tag_ => tag_.tagId === tag.tagId));
          const delList = this.oldTagList.filter(tag => !selected.find(tag_ => tag_.tagId === tag.tagId));
          const chatIdList = [this.externalUserid];
          if (addList.length) {
            batchAddTagRel({
              chatIdList,
              tagIdList: addList.map(tag => tag.tagId)
            }).then(() => {
              !delList.length && this.$toast('操作成功');
              this.Pshow = false;
              this.getCustomerInfo();
            });
          }
          if (delList.length) {
            batchDelTagRel({
              chatIdList,
              tagIdList: delList.map(tag => tag.tagId)
            }).then(() => {
              this.$toast('操作成功');
              this.Pshow = false;
              this.getCustomerInfo();
            });
          }
        }
      }
    },
    /**
     * 显示标签组下拉框
     */
    showGroupSelect() {
      const popContent = document.getElementsByClassName('van-popover__content')[0];
      // 打开选择框, 若滚动条再最上方，滚动滚动条1px，使其聚焦
      if (popContent.clientHeight < popContent.scrollHeight && popContent.scrollTop === 0) {
        popContent.scrollTop = 1;
      }
      popContent && popContent.focus();
      popContent.addEventListener('scroll', e => {
        const { scrollTop } = e.target;
        // 再滚到最上方时，也使其聚焦
        if (scrollTop === 0) {
          popContent.scrollTop = 1;
        }
      });
    }
  }

};
</script>
<style scoped lang='less'>
.manage-nav {
  /deep/ .van-nav-bar__content {
    .van-nav-bar__right {
      .van-nav-bar__text {
        color: @green;
      }
    }
  }
}
.tag-search-area {
  display: flex;
  align-items: center;
  position: relative;
  margin-bottom: 5px;
  .van-field {
    border: 1px solid #dcdfe6;
    border-radius: 0 4px 4px 0;
    padding: 3px 12px;
  }
  .group-search {
    .van-field {
      border-radius: 4px 0 0 4px;
      border-right: 0;
    }
  }
  .van-cell {
    padding-left: 8px;
  }
  /deep/ .van-popover__content {
    max-height: 40vh;
    overflow: auto;
  }
}
.tag-group-list {
  overflow: auto;
  height: 60vh;
}
.saveinfo {
  width: 90%;
  height: 30px;
  left: 50%;
  bottom: -7px;
  transform: translate(-50%, -50%);
  background-color: @green;
  color: #fff;
}
// 客户标签
.labelstyle {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  .label,
  .label1 {
    display: inline-block;
    min-width: 45px;
    max-width: 100px;
    font-size: 12px;
    padding: 5px 10px;
    background-color: #EDEDED;
    color: @black;
    text-align: center;
    margin: 0 5px 5px 0;
    line-height: 16px;
    border-radius: 4px;
  }
}
.labelstyle {
  padding-top: 5px;
}
.content {
  position: relative;
  margin: 16px 0;
  padding: 0 16px;
}
</style>
