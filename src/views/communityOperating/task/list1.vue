<template>
  <div>
    <van-tabs v-model="isDone">
      <van-tab :title="'待处理(' + todo.length + ')'" :name="0" />
      <van-tab :title="'已处理(' + done.length + ')'" :name="1" />
    </van-tabs>

    <div class="type-area">
      <van-button round size="small" :type="taskType === 0 ? 'info' : 'default'" @click="taskType = 0">全部</van-button>
      <van-button round size="small" :type="taskType === 1 ? 'info' : 'default'" @click="taskType = 1">老客标签建群</van-button>
      <van-button round size="small" :type="taskType === 2 ? 'info' : 'default'" @click="taskType = 2">群SOP</van-button>
    </div>

    <template v-if="!tasks || tasks.length === 0">
      <van-empty description="暂无数据" />
    </template>
    <template v-else>
      <template
        v-for="task in tasks"
      >
        <template v-if="task.type === 1">
          <OldCustomerPanel :key="task.taskId" :task="task" :state="isDone ? true : false" @refresh="getTasks" />
        </template>
        <template v-else>
          <SOPPanel :key="task.ruleId" :task="task" :state="isDone ? true : false" @refresh="getTasks" />
        </template>
      </template>
    </template>

    <van-overlay :show="loading" class-name="overlay">
      <van-loading type="spinner" />
    </van-overlay>
  </div>
</template>

<script>
import { getTasks } from '@/api/community';
import OldCustomerPanel from '../oldCustomer/panel';
import SOPPanel from '../SOP/panel';

export default {
  components: { OldCustomerPanel, SOPPanel },

  data() {
    return {
      isDone: 0, // 0: 待处理  1: 已处理
      taskType: 0, // 任务类型  0:全部  1:老客标签建群  2:群SOP
      loading: false, // 加载状态
      todo: [], // 待处理数据
      done: [] // 已处理数据
    };
  },

  computed: {
    userId() {
      return this.$store.state.userId;
    },

    tasks() {
      if (this.isDone === 1) return this.done;
      return this.todo;
    }
  },

  watch: {
    taskType(val) {
      if (this.userId) this.getTasks();
    },

    userId(val) {
      if (val) {
        this.getTasks();
      }
    }
  },

  created() {
    this.taskType = parseInt(this.$route.query.type);
  },

  methods: {
    // 获取老客标签建群和群SOP任务数据
    getTasks() {
      this.loading = true;
      getTasks(this.$store.state.userId, this.taskType).then((res) => {
        // if (res.code === 200) {
        this.todo = res.todo || [];
        this.done = res.done || [];
        // }
        this.loading = false;
      }).catch((error) => {
        if (error) console.error(error);
        this.loading = false;
      });
    }
  }
};
</script>

<style lang="less" scoped>
  .type-area {
    padding: 8px;
    background-color: #f2f2f2;

    .van-button {
      margin: 0 3px;
    }
  }

  .overlay {
    display: flex;
    align-items: center;

    .van-loading {
      margin: auto;
    }
  }

</style>
