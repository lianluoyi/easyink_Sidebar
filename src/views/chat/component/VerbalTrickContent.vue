<!--
 * @Author: broccoli
 * @LastEditors: xulinbin
-->
<template>
  <div class="verbal-trick-content-div">
    <van-search
      v-model="keyword"
      class="search-input"
      placeholder="请输入话术标题或内容，回车搜索"
      @search="search"
    />
    <van-notice-bar
      v-if="type === VERBAL_TRICK_TYPE['personal'] && !isPC()"
      class="notice-div"
      left-icon="bell"
      wrapable
      text="移动端暂不支持编辑个人话术，请前往PC端操作"
    />
    <EmptyDefaultIcon v-if="showSearchList" :length="wordsList.length" text="暂无话术">
      <div class="verbal-trick-content">
        <VerbalTrickItem
          v-for="(wordItem, wordIndex) in wordsList"
          :key="wordIndex"
          :word-item="wordItem"
          :word-index="wordIndex"
          :words-list="wordsList"
          :show-tool="false"
          :type="type"
          :total.sync="total"
        />
        <div class="extra-tool">
          <span v-if="!loading && total > wordsList.length" class="show-more-list" @click="loadMore">查看更多</span>
          <div v-if="loading" class="isloading-text">
            <van-loading type="spinner" size="18" />
            <span>正在加载</span>
          </div>
        </div>
      </div>
    </EmptyDefaultIcon>
    <EmptyDefaultIcon v-else class="verbal-list-empty" :length="treeData.length" text="暂无话术">
      <template v-if="canManage" slot="desc">
        <div class="empty-tip">
          话术可以提高回复效率，先<span @click="addGroup">添加分组</span>
        </div>
      </template>
      <div v-if="canManage" class="add-group" @click="addGroup"><van-icon name="add-o" />添加分组</div>
      <RecentWordsList :type="type" :user-id="userId" />
      <div class="all-verbal-trick-list">
        <VerbalTrickGroupItem
          v-for="(item, index) in treeData"
          :key="index"
          :item.sync="item"
          :index="index"
          :tree-data.sync="treeData"
          :type="type"
          :push-expand-group="() => pushExpandGroup(item)"
          :expand-group-flag="showVerbalTrickContent(item)"
          :can-manage="canManage"
        >
          <div v-show="showVerbalTrickContent(item)" class="child-group-item">
            <VerbalTrickGroupItem
              v-for="(childrenItem, childIndex) in item.children"
              :key="childIndex"
              :item.sync="childrenItem"
              :index="childIndex"
              :tree-data.sync="item.children"
              :type="type"
              :push-expand-group="() => pushExpandGroup(childrenItem)"
              :expand-group-flag="showVerbalTrickContent(childrenItem)"
              :can-manage="canManage"
            />
          </div>
        </VerbalTrickGroupItem>
      </div>
    </EmptyDefaultIcon>

    <BottomPopup
      :visible.sync="showAddGroup"
      title="添加分组"
      @cancelFunc="cancelAddGroup"
      @confirmFunc="confirmAddGroup"
    >
      <InputShowLimit
        :input-value.sync="groupName"
        maxlength="12"
        label-width="0"
        placeholder="请填写渠道名称,方便标记使用"
      />
    </BottomPopup>
  </div>
</template>
<script>
import { getWordScategoryList, addGroup } from '@/api/wordscategory';
import { VERBAL_TRICK_TYPE } from '@/utils/constants';
import VerbalTrickGroupItem from './VerbalTrickGroupItem.vue';
import InputShowLimit from '@/components/InputShowLimit.vue';
import BottomPopup from '@/components/BottomPopup.vue';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import VerbalTrickItem from './VerbalTrickItem.vue';
import { getWordsList } from '@/api/wordsGroup';
import { PAGE_LIMIT } from '@/utils/constants';
import RecentWordsList from './RecentWordsList.vue';
export default {
  name: '',
  components: { VerbalTrickGroupItem, InputShowLimit, BottomPopup, EmptyDefaultIcon, VerbalTrickItem, RecentWordsList },
  props: {
    /**
     * 话术类型
     */
    type: {
      type: Number,
      default: VERBAL_TRICK_TYPE['personal']
    }
  },
  data() {
    return {
      // 话术分组列表
      groupData: [],
      // 搜索关键词
      keyword: '',
      // 话术分组树结构列表
      treeData: [],
      // 显示添加分组
      showAddGroup: false,
      // 分组名
      groupName: '',
      // 显示搜索的话术列表
      showSearchList: false,
      // 搜索出来的话术列表
      wordsList: [],
      query: {
        pageSize: PAGE_LIMIT,
        pageNum: 1,
        searchValue: ''
      },
      // 搜索的话术总数
      total: 0,
      // 加载话术状态
      loading: false,
      // 展开的分组id列表
      expandGroupIds: [],
      VERBAL_TRICK_TYPE
    };
  },
  computed: {
    categoryIds() {
      return this.groupData.map(item => item.id);
    },
    /**
     * 能否管理话术
     */
    canManage() {
      return this.type === VERBAL_TRICK_TYPE['personal'] && this.isPC();
    },
    userId() {
      return this.$store.state.userId;
    }
  },
  watch: {
    groupData(val) {
      const allGroupData = [...val];
      const treeData = this.handleTree(allGroupData);
      this.treeData = treeData;
    },
    type(val) {
      this.getWordScategoryListByType(val);
    },
    userId(val) {
      if (val) {
        this.getWordScategoryListByType(this.type);
      }
    }
  },
  created() {
    if (this.userId) this.getWordScategoryListByType(this.type);
  },
  mounted() {},
  methods: {
    showVerbalTrickContent(item) {
      return this.expandGroupIds.includes(item.id);
    },
    /**
     * 展开分组
     */
    pushExpandGroup(item) {
      const list = [...this.expandGroupIds];
      const index = list.findIndex(listItem => listItem === item.id);
      if (index > -1) {
        list.splice(index, 1);
      } else {
        list.push(item.id);
      }
      this.expandGroupIds = list;
    },
    /**
     * 搜索话术
     */
    async search() {
      if (this.categoryIds.length === 0) return;
      this.showSearchList = !!this.keyword;
      this.getAllSearchWordsList({});
    },
    /**
     * 获取所有搜索的话术列表
     */
    async getAllSearchWordsList(params) {
      const newParams = {
        pageSize: this.query.pageSize,
        pageNum: this.query.pageNum,
        content: this.keyword,
        categoryIds: this.categoryIds,
        ...params
      };
      this.loading = true;
      const getRes = await getWordsList(newParams);
      if (getRes) {
        this.loading = false;
        this.total = getRes.total;
        this.wordsList = newParams.pageNum === 1 ? [...getRes.rows] : [...this.wordsList, ...getRes.rows];
      }
    },
    /**
     * 获取对应类型的话术分组列表
     */
    async getWordScategoryListByType(type, params = {}) {
      const wordScategoryRes = await getWordScategoryList({
        type,
        ...params
      });
      if (wordScategoryRes) {
        const wordsList = [...wordScategoryRes.data];
        // 对分组进行排序
        wordsList.sort(function(a, b) {
          return (b.sort - a.sort);
        });
        this.groupData = wordsList;
      }
    },
    addGroup() {
      this.showAddGroup = true;
    },
    /**
     * 确认添加分组
     */
    async confirmAddGroup() {
      const addRes = await addGroup({
        name: this.groupName,
        type: this.type
      });
      if (addRes) {
        this.$toast.success('添加成功');
        this.getWordScategoryListByType(this.type);
        this.showAddGroup = false;
        this.groupName = '';
      }
    },
    /**
     * 取消添加分组
     */
    cancelAddGroup() {
      this.showAddGroup = false;
    },
    /**
     * 加载更多话术
     */
    loadMore() {
      this.getAllSearchWordsList({ pageNum: this.query.pageNum + 1 });
    }
  }
};
</script>
<style scoped lang='less'>
.verbal-trick-content-div {
    padding: 10px 10px 50px 10px;
    .notice-div {
      display: flex;
      align-items: center;
    }
    .search-input {
        margin-bottom: 10px;
        padding: 0;
        border-radius: 4px;
        .van-search__content {
            background-color: #fff;
        }
    }
    .van-notice-bar {
        padding: 5px 10px;
        font-size: 13px;
    }
    .child-group-item {
        padding-left: 10px;
    }
    .add-group {
        display: flex;
        align-items: center;
        margin: 10px 0;
        color: @green;
        cursor: pointer;
        .van-icon-add-o {
            margin-right: 5px;
        }
    }
    .all-verbal-trick-list {
        .expand-group {
            .van-icon-play {
                transform: rotate(90deg)
            }
        }
        .group-name {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
    }
    .verbal-list-empty {
      margin-top: 10px;
      .empty-tip {
        margin-top: 10px;
        span {
          color: @green;
          cursor: pointer;
        }
      }
    }
}
</style>
