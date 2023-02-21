<template>
  <div class="intelligent-form-content-wrap">
    <van-search
      v-model="keyword"
      class="search-input"
      placeholder="请输入表单名称，回车搜索"
      @search="search"
    />
    <!-- 搜索出来的表单 -->
    <EmptyDefaultIcon v-if="showSearchList" :length="formsList.length" text="暂无表单">
      <div class="search-form-content">
        <IntelligentFormItem
          v-for="formItem in formsList"
          :key="formItem.id"
          :form-item="formItem"
          :type="type"
          :total.sync="total"
        />
        <div class="extra-tool">
          <div v-if="!loading && total > formsList.length" class="show-more-list" @click="loadMore">查看更多</div>
          <div v-if="loading" class="isloading-text">
            <van-loading type="spinner" size="18" />
            <span>正在加载</span>
          </div>
        </div>
      </div>
    </EmptyDefaultIcon>
    <!-- 基础树结构 -->
    <EmptyDefaultIcon v-else class="form-list-empty" :length="groupData.length" text="暂无表单">
      <!-- 最近使用 -->
      <RecentFormList ref="recentFormRef" :type="type" :user-id="userId" />
      <div class="all-form-list">
        <IntelligentFormGroupItem
          v-for="(item, index) in groupData"
          :key="index"
          :item.sync="item"
          :tree-data.sync="groupData"
          :type="type"
          :push-expand-group="() => pushExpandGroup(item)"
          :expand-group-flag="showIntelligentFormContent(item)"
        >
          <div v-show="showIntelligentFormContent(item)" class="child-group-item">
            <IntelligentFormGroupItem
              v-for="(childrenItem, childIndex) in item.children"
              :key="childIndex"
              :item.sync="childrenItem"
              :tree-data.sync="item.children"
              :type="type"
              :push-expand-group="() => pushExpandGroup(childrenItem)"
              :expand-group-flag="showIntelligentFormContent(childrenItem)"
            />
          </div>
        </IntelligentFormGroupItem>
      </div>
    </EmptyDefaultIcon>
  </div>
</template>
<script>
import { getGroupTree, getFormPageList } from '@/api/form';
import { INTELLIGENT_FORM_TYPE, FIRST_PAGE } from '@/utils/constants';
import IntelligentFormGroupItem from './intelligentFormGroupItem.vue';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import IntelligentFormItem from './intelligentFormItem.vue';
import { PAGE_LIMIT } from '@/utils/constants';
import RecentFormList from './RecentFormList.vue';
import { computed } from 'vue';

export default {
  name: '',
  components: {
    IntelligentFormGroupItem,
    EmptyDefaultIcon,
    IntelligentFormItem,
    RecentFormList
  },
  props: {
    /**
     * 话术类型
     */
    type: {
      type: Number,
      default: INTELLIGENT_FORM_TYPE['personal']
    },
    // 用户所属部门id
    departmentId: {
      type: String,
      default: ''
    }
  },
  provide() {
    return {
      recentFormRef: computed(() => this.$refs.recentFormRef)
    };
  },
  data() {
    return {
      FIRST_PAGE,
      // 表单分组列表
      groupData: [],
      // 搜索关键词
      keyword: '',
      // 分组名
      groupName: '',
      // 是否显示搜索的表单列表
      showSearchList: false,
      // 搜索出来的表单列表
      formsList: [],
      query: {
        pageSize: PAGE_LIMIT,
        pageNum: FIRST_PAGE
      },
      // 搜索的表单总数
      total: 0,
      // 加载表单状态
      loading: false,
      // 展开的分组id列表
      expandGroupIds: [],
      INTELLIGENT_FORM_TYPE
    };
  },
  computed: {
    // 第一层分组id
    categoryIds() {
      return this.groupData.map(item => item.id);
    },
    userId() {
      return this.$store.state.userId;
    }
  },
  watch: {
    // 搜索完回来，展开的分组下面的数据被清空了，故搜索时把展开的分组id列表清空
    showSearchList(val) {
      if (val) {
        this.expandGroupIds = [];
      }
    },
    // 用户id改变时调用请求新表单分组树
    userId(val) {
      if (val) {
        this.getGroupTreeByType(this.type);
      }
    }
  },
  created() {
    if (this.userId) this.getGroupTreeByType(this.type);
  },
  mounted() {},
  methods: {
    /**
     * @description: 是否展示分组下的表单
     * @param {*} item
     * @return {*}
     */
    showIntelligentFormContent(item) {
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
     * 搜索表单
     */
    async search() {
      // 没有分组直接退出
      if (this.categoryIds.length === 0) return;
      this.showSearchList = !!this.keyword;
      this.getAllFormList({});
    },
    /**
     * 获取表单列表数据
     */
    async getAllFormList(params) {
      const newParams = {
        pageSize: this.query.pageSize,
        pageNum: this.query.pageNum,
        formName: this.keyword,
        enableFlag: true, // 只展示启用的表单
        sourceType: this.type,
        departmentId: this.type === INTELLIGENT_FORM_TYPE['department'] ? this.departmentId : undefined,
        ...params
      };
      this.loading = true;
      getFormPageList(newParams).then(res => {
        this.total = res.total;
        this.formsList = newParams.pageNum === FIRST_PAGE ? [...res.rows] : [...this.formsList, ...res.rows];
      }).finally(() => {
        this.loading = false;
      });
    },
    /**
     * 获取对应类型的表单分组列表
     */
    async getGroupTreeByType(type) {
      const getGroupTreeRes = await getGroupTree({
        sourceType: type,
        departmentId: type === INTELLIGENT_FORM_TYPE['department'] ? this.departmentId : undefined
      });
      if (getGroupTreeRes) {
        const formsGroupTreeList = [...getGroupTreeRes.data];
        // 对分组进行排序
        formsGroupTreeList.sort(function(a, b) {
          return (b.sort - a.sort);
        });
        this.groupData = formsGroupTreeList;
      }
    },
    /**
     * 加载更多表单
     */
    loadMore() {
      this.getAllFormList({ pageNum: this.query.pageNum + 1 });
    }
  }
};
</script>
<style scoped lang='less'>
.intelligent-form-content-wrap {
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
    .search-form-content{
      .extra-tool {
        width: 100%;
        padding: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .show-more-list {
        color: #6BB4AB;
        cursor: pointer;
      }
      .isloading-text{
        display: flex;
        span {
          margin-left: 5px;
        }
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
    .all-form-list {
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
    .form-list-empty {
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
