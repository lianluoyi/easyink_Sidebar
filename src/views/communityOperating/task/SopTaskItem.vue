<!--
 * @Description: 单个任务样式
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div :key="index" class="task-item">
    <div class="task-title-div flex" @click="showTarget">
      <div class="title-div"><i v-if="diffHour" class="iconfont icon-new mr5" /><span>{{ item.name }}</span></div>
      <div>
        <span class="mr5">{{ item.alertDate }}</span>
        <van-icon :name="`${showTaskDetail ? 'arrow-up' : 'arrow-down'}`" color="#C2C2C2" />
      </div>
    </div>
    <div v-show="showTaskDetail" class="task-content">
      <div class="task-alert mb5">管理员提醒您 <span class="key-text">「{{ item.alertTime }}」</span> 向以下对象执行SOP</div>
      <div v-for="(userItem, userIndex) in targetList" :key="userIndex" class="user-item flex mb10">
        <UserInfoItem :item="userItem" />
      </div>
      <div class="extra-tool">
        <span v-if="targetList.length < item.detailList.length" class="show-more-list" @click="loadMore">查看更多</span>
      </div>
    </div>
  </div>
</template>
<script>
import UserInfoItem from './components/userInfoItem.vue';
import { PAGE_LIMIT } from '@/utils/constants';
import { diffHour } from '@/utils/index';
import moment from 'moment';

const MAX_HOUR = 24;
export default {
  name: '',
  components: { UserInfoItem },
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    index: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      showTaskDetail: false,
      // 员工加载状态
      userLoading: false,
      total: 0,
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT
      }
    };
  },
  computed: {
    targetList() {
      const query = this.query;
      let list = [];
      const detailList = [...this.item.detailList];
      list = detailList.slice(0, query.pageNum * query.pageSize);
      return list;
    },
    diffHour() {
      const item = this.item;
      const alertTime = `${item.alertDate} ${item.alertTime}`;
      const diffHours = diffHour(alertTime, moment().format('YYYY-MM-DD HH:mm:ss'));
      return diffHours < MAX_HOUR;
    }
  },
  watch: {
    index(val) {
      if (val === 0) {
        this.showTaskDetail = true;
      }
    }
  },
  created() {
    if (this.index === 0) {
      this.showTaskDetail = true;
    }
  },
  mounted() {},
  methods: {
    /**
     * 展开
     */
    showTarget() {
      this.showTaskDetail = !this.showTaskDetail;
    },
    /**
     * 查看更多
     */
    loadMore() {
      const query = this.query;
      query.pageNum = query.pageNum + 1;
    }

  }

};
</script>
<style scoped lang='less'>
.task-item {
    .task-title-div {
        justify-content: space-between;
        border-bottom: 1px solid #F4F4F4;
        height: 43px;
        align-items: center;
        cursor: pointer;
    .title-div {
        display: flex;
        align-items: center;
        .icon-new {
            font-size: 24px;
            color: #FF0000;
        }
        span {
            font-weight: bold;
            line-height: 19px;
        }
    }
    }
    .task-content {
        padding: 10px 0px 0;
        .task-alert {
            color: @fontColor;
        }
        .extra-tool {
            text-align: right;
            color: @green;
            cursor: pointer;
        }
    }
    .key-text {
        color: @green;
        font-weight: bold;
    }
}
</style>
