<!--
 * @Author: broccoli
 * @LastEditors: xulinbin
-->
<template>
  <div class="group-item">
    <div :class="`group-info${expandGroupFlag ? ' expand-group' : ''}`" @click="() => expandGroup(item)">
      <div class="group-name">
        <van-icon name="play" class="arrow-icon" />
        {{ item.name }}
      </div>
      <MoveTool
        v-if="canManage"
        ref="moveTool"
        :index="index"
        :list="treeData"
        :edit-verbal-trick="true"
        :show-add-verbal-trick="true"
        :add-verbal-trick="addVerbalTrick"
        :item="item"
        @updateList="updateList"
        @removeItem="removeItem"
        @editFunction="editGroup"
      />
    </div>
    <slot />
    <div v-show="expandGroupFlag" class="verbal-trick-content">
      <VerbalTrickItem
        v-for="(wordItem, wordIndex) in wordsList"
        :key="wordIndex"
        :word-item="wordItem"
        :word-index="wordIndex"
        :words-list.sync="wordsList"
        :show-tool="true"
        :type="type"
        @showEditVerbalTrick="showEditVerbalTrick"
      />
      <div class="extra-tool">
        <span v-if="!loading && showMore" class="show-more-list" @click="() => loadMore(item)">查看更多</span>
        <div v-if="loading" class="isloading-text">
          <van-loading type="spinner" size="18" />
          <span>正在加载</span>
        </div>
      </div>
    </div>
    <AddVerbalTrickPage
      ref="addVerbalTrickPage"
      :show.sync="showAddVerbal"
      :group-tree-data="treeData"
      :category-obj="{id: item.id, name: item.name}"
      :type="type"
      @reGetList="reGetList"
    />
    <BottomPopup
      :visible.sync="showEditGroup"
      title="编辑分组"
      @cancelFunc="cancelEditGroup"
      @confirmFunc="confirmEditGroup"
    >
      <div class="edit-group-info">
        <InputShowLimit
          :input-value.sync="editGroupName"
          maxlength="12"
          label-width="0"
          placeholder="请填写分组名称"
        />
        <template v-for="(lowerItem, lowerIndex) in lowerGroupList">
          <div :key="lowerIndex" class="lower-group-item">
            <van-field
              v-model="lowerItem.name"
              class="child-group-input"
              placeholder="请填写下级分组名称"
            />
            <MoveTool
              ref="moveToolCircle"
              :dropdown-tool="false"
              :index="lowerIndex"
              :list="lowerGroupList"
              :item="lowerItem"
              @updateList="updateLowerList"
              @removeItem="removeLowerItem"
            />
          </div>
        </template>
        <div v-if="!item.parentId || item.parentId === '0'" class="add-lower-group" @click="addLowerGroup">
          <van-icon name="add-o" class="add-icon" />
          添加下级分组
        </div>
      </div>
    </BottomPopup>
  </div>
</template>
<script>
import { getWordsList } from '@/api/wordsGroup';
import { changeGroupSort, removeGroup, updateGroup } from '@/api/wordscategory';
import VerbalTrickItem from './VerbalTrickItem.vue';
import { PAGE_LIMIT } from '@/utils/constants';
import AddVerbalTrickPage from './AddVerbalTrickPage.vue';
import MoveTool from './MoveTool.vue';
import BottomPopup from '@/components/BottomPopup.vue';
import InputShowLimit from '@/components/InputShowLimit.vue';
import { VERBAL_TRICK_TYPE } from '@/utils/constants';
import { dealChildIdList } from '@/utils/index';
export default {
  name: '',
  components: { VerbalTrickItem, AddVerbalTrickPage, MoveTool, BottomPopup, InputShowLimit },
  props: {
    /**
     * 话术分组内容
     */
    item: {
      type: Object,
      default: () => {}
    },
    index: {
      type: Number,
      default: 0
    },
    treeData: {
      type: Array,
      default: () => []
    },
    /**
     * 话术类型
     */
    type: {
      type: Number,
      default: VERBAL_TRICK_TYPE['personal']
    },
    /**
     * 增加展开的分组id
     */
    pushExpandGroup: {
      type: Function,
      default: () => {}
    },
    expandGroupFlag: {
      type: Boolean,
      default: false
    },
    /**
     * 能否管理话术
     */
    canManage: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 话术加载状态
      loading: false,
      // 话术列表
      wordsList: [],
      query: {
        pageSize: PAGE_LIMIT,
        searchValue: ''
      },
      // 是否显示新增/编辑话术页面
      showAddVerbal: false,
      categoryIds: [],
      groupName: '',
      // 显示编辑分组
      showEditGroup: false,
      lowerGroupList: [],
      // 移除的下级分组
      removeLowerList: [],
      VERBAL_TRICK_TYPE,
      // 显示查看更多
      showMore: false,
      // 编辑分组名
      editGroupName: ''
    };
  },
  computed: {
  },
  watch: {
    /**
     * 监听编辑分组弹窗是否显示
     */
    showEditGroup(val) {
      if (val) {
        this.editGroupName = this.item.name;
      }
    }
  },
  created() {},
  mounted() {
    this.lowerGroupList = this.item.children ? [...this.item.children] : [];
    this.editGroupName = this.item.name;
  },
  methods: {
    /**
     * 展开分组
     */
    expandGroup(item) {
      this.pushExpandGroup();
      const nowId = [item.id];
      if (this.wordsList.length === 0) this.getAllWordsList({ categoryIds: nowId });
    },
    getAllWordsList(params) {
      const newParams = {
        pageSize: this.query.pageSize,
        content: this.query.searchValue,
        categoryIds: this.categoryIds,
        ...params
      };
      if (newParams.categoryIds.length === 0) return;
      this.categoryIds = [...newParams.categoryIds];
      this.getWordsList(newParams);
    },
    async getWordsList(params) {
      this.loading = true;
      const wordRes = await getWordsList(params);
      if (wordRes) {
        this.wordsList = !params.id ? [...wordRes.rows] : [...this.wordsList, ...wordRes.rows];
        const total = (wordRes.total && Number(wordRes.total)) || 0;
        this.showMore = total > params.pageSize;
        this.loading = false;
      }
    },
    /**
     * 加载更多话术
     */
    loadMore(item) {
      const nowId = [item.id];
      const lastId = this.wordsList[this.wordsList.length - 1].id;
      this.getAllWordsList({ id: lastId, categoryIds: nowId });
    },
    /**
     * 进入新增话术页面
     */
    addVerbalTrick() {
      this.showAddVerbal = true;
    },
    /**
     * 更新话术分组列表
     */
    updateList(list) {
      this.$emit('update:treeData', list);
      const dealSortList = [...dealChildIdList(list)];
      this.changeGroupSort(dealSortList);
    },
    /**
     * 移除分组
     */
    removeItem(item) {
      removeGroup({
        id: item.id
      }).then(res => {
        if (res) {
          this.$toast.success('删除成功');
        }
      });
    },
    /**
     * 重新获取话术列表
     */
    reGetList(params) {
      // 如果话术分组被展开，则需要重新获取话术列表
      if (this.expandGroupFlag) {
        this.getAllWordsList(params);
      }
    },
    /**
     * 文件夹上移-下移-置顶
     */
    changeGroupSort(sortList) {
      if (sortList.length === 0) return;
      changeGroupSort({
        sortList: sortList
      });
    },
    /**
     * 编辑分组
     */
    editGroup() {
      this.lowerGroupList = this.item.children ? [...this.item.children] : [];
      this.showEditGroup = true;
    },
    /**
     * 确认编辑分组
     */
    async confirmEditGroup() {
      let delChildList = [];
      delChildList = this.removeLowerList.map(item => item.id);
      const childIdList = dealChildIdList(this.lowerGroupList, true);
      try {
        const updateRes = await updateGroup({
          // 下级文件夹ID列表
          childIdList,
          delChildList: delChildList,
          id: this.item.id,
          // 文件夹名称
          name: this.editGroupName,
          parentId: this.item.parentId,
          type: this.type
        });
        if (updateRes) {
          this.$toast('操作成功');
          const treeData = [...this.treeData];
          treeData[this.index].children = this.lowerGroupList;
          this.$emit('update:treeData', treeData);
        }
      } catch (e) {
        console.error('更新分组异常', e);
      }
    },
    /**
     * 取消添加分组
     */
    cancelEditGroup() {
      this.showEditGroup = false;
    },
    /**
     * 添加下级分组
     */
    addLowerGroup() {
      const newList = [...this.lowerGroupList];
      newList.push({ name: '' });
      this.lowerGroupList = newList;
    },
    /**
     * 编辑分组时更新下级分组
     */
    updateLowerList(list) {
      this.lowerGroupList = list;
    },
    /**
     * 编辑分组时移除下级分组
     */
    removeLowerItem(item) {
      const list = [...this.removeLowerList];
      list.push(item);
      this.removeLowerList = list;
    },
    showEditVerbalTrick(item) {
      this.showAddVerbal = true;
      this.$refs.addVerbalTrickPage.formData = { ...item };
    }
  }

};
</script>
<style scoped lang='less'>
.group-item{
    .expand-group {
        .van-icon-play {
            transform: rotate(90deg)
        }
    }
    .group-info {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        justify-content: space-between;
        cursor: pointer;
    }
    .verbal-trick-content {
        margin-left: 10px;
        margin-bottom: 10px;
        .extra-tool {
          text-align: right;
          .show-more-list {
            color: @green;
            cursor: pointer;
          }
          .isloading-text {
            color: #888;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            .van-loading {
              margin-right: 5px;
            }
          }
        }
    }
    .edit-group-info {
      .add-lower-group {
        color: @green;
        display: flex;
        align-items: center;
        cursor: pointer;
        .add-icon {
          margin-right: 5px;
        }
      }
      .popup-input {
        margin-bottom: 10px;
      }
      .lower-group-item {
        display: flex;
        align-items: center;
        .child-group-input {
          padding: 5px 10px;
          border: 1px solid #DCE0E7;
          margin-bottom: 10px;
          flex: 1;
        }
      }
    }
}

</style>
