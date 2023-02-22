<template>
  <div class="group-item">
    <div :class="`group-info${expandGroupFlag ? ' expand-group' : ''}`" @click="() => expandGroup(item)">
      <div class="group-name">
        <van-icon name="play" class="arrow-icon" />
        {{ item.name }}
      </div>
    </div>
    <slot />
    <div v-show="expandGroupFlag" class="intelligent-form-content">
      <IntelligentFormItem
        v-for="(formItem, formIndex) in formsList"
        :key="formIndex"
        :form-item="formItem"
        :type="type"
      />
      <div class="extra-tool">
        <span v-if="!loading && showMore" class="show-more-list" @click="() => loadMore(item)">查看更多</span>
        <div v-if="loading" class="isloading-text">
          <van-loading type="spinner" size="18" />
          <span>正在加载</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getFormPageList } from '@/api/form';
import IntelligentFormItem from './intelligentFormItem.vue';
import { PAGE_LIMIT, INTELLIGENT_FORM_TYPE, FIRST_PAGE } from '@/utils/constants';
export default {
  name: '',
  components: {
    IntelligentFormItem
  },
  props: {
    /**
     * 表单分组内容
     */
    item: {
      type: Object,
      default: () => {}
    },
    treeData: {
      type: Array,
      default: () => []
    },
    /**
     * 表单类型
     */
    type: {
      type: Number,
      default: INTELLIGENT_FORM_TYPE['personal']
    },
    /**
     * 增加展开的分组id
     */
    pushExpandGroup: {
      type: Function,
      default: () => {}
    },
    // 是否展开了分组
    expandGroupFlag: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 表单加载状态
      loading: false,
      // 表单列表
      formsList: [],
      // 搜索条件
      query: {
        pageSize: PAGE_LIMIT,
        pageNum: FIRST_PAGE
      },
      INTELLIGENT_FORM_TYPE,
      // 显示查看更多
      showMore: false
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    /**
     * 展开分组
     */
    expandGroup(item) {
      this.pushExpandGroup();
      const nowId = item.id;
      if (this.formsList.length === 0) {
        this.getFormsListByNewParams({ groupId: nowId });
      }
    },
    /**
     * @description: 拼接参数，获取表单数据
     * @param {*} params
     * @return {*}
     */
    getFormsListByNewParams(params) {
      const newParams = {
        pageSize: this.query.pageSize,
        pageNum: this.query.pageNum,
        enableFlag: true, // 只展示启用的表单
        sourceType: this.type,
        unNeedChildFlag: true, // 不需要查询存在于子分组的表单
        ...params
      };
      this.getFormsList(newParams);
    },
    async getFormsList(params) {
      this.loading = true;
      const formRes = await getFormPageList(params);
      if (formRes) {
        // 请求成功则赋值请求页码
        this.query.pageNum = params.pageNum;
        this.formsList = params.pageNum === FIRST_PAGE ? [...formRes.rows] : [...this.formsList, ...formRes.rows];
        const total = (formRes.total && Number(formRes.total)) || 0;
        this.showMore = total > this.formsList.length;
        this.loading = false;
      }
    },
    /**
     * 加载更多
     */
    loadMore(item) {
      this.getFormsListByNewParams({ pageNum: this.query.pageNum + 1, groupId: item.id });
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
  .intelligent-form-content {
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
}

</style>
