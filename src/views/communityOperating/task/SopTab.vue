<!--
 * @Description: sop每个类型的界面
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="task-tab-div">
    <div class="header-container flex mt10">
      <span class="total-task">共{{ total }}个任务</span>
      <van-checkbox v-model="hasDeal" @change="filterUnDeal">待处理</van-checkbox>
    </div>
    <div class="task-list">
      <van-list
        v-model="loading"
        :finished="finished"
        :finished-text="taskList.length ? '没有更多了' : ''"
        @load="onLoad"
      >
        <SopTaskItem v-for="(item, index) in taskList" :key="index" :item="item" :index="index" />
        <EmptyDefaultIcon v-if="total===0" :length="0" text="暂无任务" class="warn-tip-div customer-warn-tip" :empty-icon="require('@/assets/icon/empty-icon.svg')" />
      </van-list>
    </div>
  </div>
</template>

<script>
import { sopTaskDetailByUserId } from '@/api/community';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import { SOP_TYPE, PAGE_LIMIT } from '@/utils/constants';
import SopTaskItem from './SopTaskItem.vue';

export default {
  components: { SopTaskItem, EmptyDefaultIcon },
  props: {
    type: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      loading: false, // 加载状态
      taskList: [],
      finished: false,
      query: {
        detailId: null,
        pageSize: PAGE_LIMIT
      },
      SOP_TYPE,
      total: 0,
      hasDeal: true
    };
  },

  computed: {
    userId() {
      return this.$store.state.userId;
    }
  },
  watch: {
    userId(val) {
      if (val) this.getTaskList();
    }
  },

  created() {
  },

  methods: {
    /**
     * 获取sop任务列表
     */
    getTaskList(pageNum) {
      const userId = this.$store.state.userId;
      if (!userId) return;
      sopTaskDetailByUserId(userId, { ...this.query, type: this.type, isFinish: this.hasDeal ? false : null }).then(res => {
        this.loading = false;
        if (res) {
          this.taskList = pageNum === 1 ? [...res.rows] : ([...this.taskList, ...res.rows] || []);
          this.finished = this.taskList.length >= res.total;
          this.total = res.total;
        }
      });
    },
    /**
     * 滚动条到底部触发加载
     */
    onLoad() {
      const taskList = [...this.taskList];
      if (taskList.length > 0) this.query.detailId = taskList[taskList.length];
      this.getTaskList();
    },
    /**
     * 筛选待处理
     */
    filterUnDeal(val) {
      this.getTaskList(1);
    }
  }
};
</script>

<style lang="less" scoped>
.task-tab-div {
  .header-container {
    justify-content: space-between;
    .total-task {
      color: @fontColor;
    }
  }
}
</style>
