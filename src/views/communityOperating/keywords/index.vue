<template>
  <div>
    <div>
      <van-search
        v-model="keyword"
        class="search-input"
        placeholder="搜索活码名或关键词"
        shape="round"
        @search="onSearch"
        @clear="clear"
      />
    </div>

    <div v-if="history.length != 0" class="history-wrapper">
      <template v-for="k of history">
        <van-tag :key="k" size="large" closeable @click="search(k)" @close="removeHistory(k)"> {{ k }} </van-tag>
      </template>
    </div>

    <div class="bottom-line" />

    <div>
      <template v-if="!tasks || tasks.length === 0">
        <van-empty description="暂无数据" />
      </template>
      <template v-else>
        <template v-for="task of tasks">
          <KeywordPanel :key="task.taskId" :task="task" :state="false" />
        </template>
      </template>
    </div>

    <van-overlay :show="loading" class-name="overlay">
      <van-loading type="spinner" />
    </van-overlay>
  </div>
</template>

<script>
import KeywordPanel from './panel';
import { getKeywordTasks } from '@/api/community';
import { SUCCESS_CODE } from '@/utils/constants';

export default {
  components: { KeywordPanel },

  data() {
    return {
      keyword: '',
      storageKey: 'keywords',
      history: [],
      tasks: [],
      loading: false,
      focus: false
    };
  },

  computed: {
    url() {
      return window.location.href;
    }
  },

  created() {
    this.getHistory();

    this.getTasks();
  },

  methods: {
    getTasks() {
      this.loading = true;
      getKeywordTasks(this.keyword).then((res) => {
        if (res.code === SUCCESS_CODE) {
          this.tasks = res.rows;
        }
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },

    setHistory(keyword) {
      if (!keyword) return;

      if (!this.history.includes(keyword)) {
        this.history.push(keyword);
        localStorage.setItem(this.storageKey, JSON.stringify(this.history));
      }
    },

    removeHistory(keyword) {
      if (this.history.includes(keyword)) {
        this.history.splice(this.history.indexOf(keyword), 1);
        localStorage.setItem(this.storageKey, JSON.stringify(this.history));
      }
    },

    getHistory() {
      this.history = JSON.parse(localStorage.getItem(this.storageKey)) || [];
    },

    onSearch() {
      this.setHistory(this.keyword);

      this.getTasks();
    },

    search(keyword) {
      this.keyword = keyword;

      this.getTasks();
    },

    clear() {
      this.getTasks();
    }
  }
};
</script>

<style lang="less" scoped>
  .history-wrapper {
    padding: 0 10px 0px;

    .van-tag {
      margin: 0px 10px 10px 0;
    }
  }

  .bottom-line {
    background-color: #f2f2f2;
    height: 15px;
  }

  .overlay {
    display: flex;
    align-items: center;

    .van-loading {
      margin: auto;
    }
  }
  .search-input {
    padding: 10px;
  }
</style>
