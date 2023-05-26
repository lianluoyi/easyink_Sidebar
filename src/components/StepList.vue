<template>
  <div class="step-list-div">
    <div v-if="loading && wList.length === 0" class="loading-div"><van-loading /></div>
    <EmptyDefaultIcon v-else :length="wList.length" class="step-list">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        loading-text="上划加载更多"
        @load="onPage"
      >
        <van-steps
          :active="active"
          direction="vertical"
          class="week-list"
        >
          <van-step v-for="(item, index) in wList" :key="index" class="msg week-step-item">
            <!-- 时间 -->
            <p v-if="item[0]" class="f12 week-time" style="position:relative; ">
              {{ transferTime(item[0].createDate) }}
              {{ getTime3(transferTime(item[0].createDate)) }}
              <span v-if="item[0].isSOP" class="sop-sign">SOP</span>
            </p>
            <van-steps
              v-for="(item1, stepIndex) in item"
              :key="stepIndex"
              direction="vertical"

              :active="active"
              :class="`day-list${item1.trajectoryType == TRAJECTORY_TYPE['backlog'] ? ' todo-cell' : ''}`"
            >
              <van-step class="msg day-step-item">
                <div class="msg-top">
                  <div class="msg-time-title">
                    <div v-if="item1.trajectoryType == TRAJECTORY_TYPE['backlog']" class="f12 po">
                      <template v-if="!item1.isSOP">
                        {{ getTimeNotSeconds(item1.startTime) + '~' + getTimeNotSeconds(item1.endTime) }}
                      </template>
                      <template v-else>
                        {{ getTimeNotSeconds(item1.startTime) }}
                      </template>
                    </div>
                    <div v-else class="f12 po">{{ getTimeNotSeconds(item1.startTime) }}</div>
                    <div v-if="item1.trajectoryType == TRAJECTORY_TYPE['backlog'] && item1.status != COMPELETE_TYPE" class="status-circle" />
                  </div>
                  <span v-if="item1.trajectoryType == TRAJECTORY_TYPE['backlog']" class="finish-box">
                    <span
                      :class="`${item1.status != COMPELETE_TYPE ? 'finish' : 'finished'}`"
                      @click="item1.status != COMPELETE_TYPE && finDynamic(item1)"
                    >{{ item1.status != COMPELETE_TYPE ? '完成' : '已完成' }}</span>
                    <span v-if="item1.trajectoryType == TRAJECTORY_TYPE['backlog'] && !item1.isSOP" class="deldynamic" @click="delDynamic(item1.id)">删除</span>
                  </span>
                </div>

                <div class="fs14 con content-div">
                  <!-- 待办事项 -->
                  <span v-if="item1.trajectoryType == TRAJECTORY_TYPE['backlog']" class="content-text">
                    <template v-if="!item1.isSOP">
                      {{ item1.content }}
                    </template>
                    <template v-else>
                      <VerbalTrickItem
                        :word-item="item1"
                        :word-index="stepIndex"
                        :words-list.sync="wList"
                        :show-tool="true"
                        :type="type"
                      />
                    </template>
                  </span>
                  <!-- 信息动态 -->
                  <NewsContent v-if="item1.trajectoryType == TRAJECTORY_TYPE['news']" :news-item="item1" />
                  <!-- 活动轨迹 -->
                  <template v-if="item1.trajectoryType == TRAJECTORY_TYPE['activity']">
                    <template v-if="[ADD_USER, DEL_USER].includes(item1.subType)">
                      <div class="flex aic" v-html="dealActivity(item1)" />
                    </template>
                    <span v-else class="text-span">{{ item1.content }}</span>
                  </template>
                </div>
              </van-step>
            </van-steps>
          </van-step>
        </van-steps>
      </van-list>
    </EmptyDefaultIcon>
  </div>
</template>

<script>
import { removeTrajectory, handleWait, finishTask } from '@/api/portrait';
import { TRAJECTORY_TYPE, TWO_DIGITS, SUCCESS_CODE } from '@/utils/constants';
import NewsContent from './NewsContent.vue';
import { transferTime } from '@/utils/index';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import VerbalTrickItem from '@/views/chat/component/VerbalTrickItem.vue';

// 待办类型（完成）
const COMPELETE_TYPE = 3;
const MAX_LENGTH = 10;

const JOIN_GROUP = 'join_group';
const QUIT_GROUP = 'quit_group';
const ADD_USER = 'add_user';
const DEL_USER = 'del_user';

export default {
  components: { NewsContent, EmptyDefaultIcon, VerbalTrickItem },
  props: {
    stepList: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  inject: ['findTrajectory', 'changeListVal', 'removeCount'],
  data() {
    return {
      // 步骤条
      active: -1,
      //   轨迹外层按时间
      wlist: [],
      // 轨迹内层
      nlist: [],
      oldele: [],
      content: '',
      type: 0,
      wList: [],
      finished: false,
      loading: true,
      JOIN_GROUP,
      QUIT_GROUP,
      ADD_USER,
      DEL_USER,
      TRAJECTORY_TYPE,
      COMPELETE_TYPE
    };
  },
  watch: {
    /**
     * 客户轨迹对应类型的列表数据变化监听
     */
    stepList(newVal, oldVal) {
      if (newVal !== oldVal) {
        //   debugger
        this.wlist = [];
        this.nlist = [];
        this.oldele = [];
        this.loading = true;
      }
      newVal.forEach((ele) => {
        this.oldele.push(parseInt(this.getTime(ele.createDate)));
      });
      //   console.log(this.oldele);
      // oldele为对应轨迹列表的createDate，并进行去重
      this.oldele = this.newArr(this.oldele);
      // 按照日期相同的把对应的列表进行分组
      for (let i = 0; i < this.oldele.length; i++) {
        for (let j = 0; j < newVal.length; j++) {
          if (this.oldele[i].toString() === this.getTime(newVal[j].createDate)) {
            this.nlist.push(newVal[j]);
          }
        }

        // 为了复用 VerbalTrickItem 组件
        this.nlist.forEach(nItem => {
          if (nItem.detailId && nItem.detailId !== '-1') {
            nItem.weWordsDetailList = nItem.materialList;
            nItem.title = nItem.content;
            nItem.isSOP = true;
          }
        });

        this.wlist.push(this.nlist);
        this.nlist = [];
      }
      this.onLoad();
    }
  },
  methods: {
    onPage() {
      const baseIndex = this.wList.length;
      for (let i = 0; i < MAX_LENGTH; i++) {
        const w = this.wlist[baseIndex + i];
        if (w) {
          this.wList.push(w);
        }
      }
      // 加载状态结束
      this.loading = false;

      // 数据全部加载完成
      if (this.wlist.length > 0 && this.wList.length >= this.wlist.length) {
        this.finished = true;
      }
    },
    onLoad() {
      const ONE_SECOND = 1000;
      // 异步更新数据
      // setTimeout 仅做示例，真实场景中一般为 ajax 请求
      setTimeout(() => {
        //   debugger
        const total = this.wlist.length > MAX_LENGTH ? MAX_LENGTH : this.wlist.length;
        this.wList = [];
        // 前端分页
        for (let i = 0; i < total; i++) {
          this.wList.push(this.wlist[i]);
        }
        // 加载状态结束
        this.loading = false;

        // 数据全部加载完成
        if (this.wList.length >= this.wlist.length) {
          this.finished = true;
        }
      }, ONE_SECOND);
    },
    //   根据数字判断类型
    chargeType(num) {
      if (num === TRAJECTORY_TYPE['news']) {
        return (this.type = '信息动态');
      } else if (num === TRAJECTORY_TYPE['social']) {
        return (this.type = '社交动态');
      } else if (num === TRAJECTORY_TYPE['activity']) {
        return (this.type = '活动规则');
      } else if (num === TRAJECTORY_TYPE['backlog']) {
        return (this.type = '待办动态');
      }
    },
    //   数组去重
    newArr(arr) {
      return Array.from(new Set(arr));
    },
    // 时间处理器
    getTime(data) {
      const date = new Date(data);
      // console.log(timer.getFullYear());
      var Y = date.getFullYear();
      var M =
        date.getMonth() + 1 < TWO_DIGITS
          ? '0' + (date.getMonth() + 1)
          : date.getMonth() + 1;
      var D = date.getDate() < TWO_DIGITS ? '0' + date.getDate() : date.getDate();
      return Y.toString() + M.toString() + D.toString();
    },
    transferTime(data) {
      return transferTime(data);
    },
    getTime2(data) {
      const date = new Date(data);
      // console.log(timer.getFullYear());
      var h =
        (date.getHours() < TWO_DIGITS ? '0' + date.getHours() : date.getHours()) + ':';
      var m =
        date.getMinutes() < TWO_DIGITS ? '0' + date.getMinutes() : date.getMinutes();
      return h + m.toString();
    },
    // 处理星期几
    getTime3(time) {
      var dateArray = time.split('-');
      var date = new Date(
        dateArray[0],
        parseInt(dateArray[1] - 1),
        dateArray[2]
      );
      var week = '星期' + '日一二三四五六'.charAt(date.getDay());
      return week;
    },
    // 去掉时间中的秒
    getTimeNotSeconds(time) {
      const timeArray = time.split(':');

      if (timeArray.length <= 0) {
        return time;
      }
      const newTime = timeArray[0] + ':' + timeArray[1];
      return newTime;
    },
    // 删除轨迹
    delDynamic(id) {
      removeTrajectory(id)
        .then((data) => {
          if (data.code === SUCCESS_CODE) {
            //   提示删除成功
            // this.msgSuccess("删除成功");
            // debugger
            // location.reload();
            const _this = this;
            this.findTrajectory().then(res => {
              _this.$toast.success('删除成功');
            });
            // 重新获取全部数据
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 点击完成
    async finDynamic({ id, detailId }) {
      try {
        await finishTask(detailId);
        const data = await handleWait(id);

        if (data.code === SUCCESS_CODE) {
          // this.delDynamic(id);
          // this.findTrajectory()
          this.removeCount();
          this.changeListVal(id, 'status', COMPELETE_TYPE);
        }
      } catch (error) {
        console.log(error);
      }
    },
    /**
     * 处理信息动态中图片内容
     */
    dealActivity(item) {
      let showHtml = item.content || '';
      showHtml = showHtml.replace('${picUrl}', item.detail ? `<img style="height:20px; width:20px; fit:cover; margin: 0 5px;" src=${item.detail} />` : `<i style="margin:0 5px;color:#A9A9A9;font-size:20px" class='iconfont icon-card-avatar'></i>`);
      return showHtml;
    }
  }
};
</script>

<style lang="less" scoped>
.f12 {
  color: #9c9c9c;
  font-size: 12px;
  font-weight: 600;
}
/deep/.msg {
  padding-right: 0;
  .van-step__title {
    position: relative;
  }
  &::after {
    border: none;
  }
  .po {
    position: relative;
    color: #AEB4BF;
  }
  .msg-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .msg-time-title {
      display: flex;
      align-items: center;
      .status-circle {
        background-color: #FA7216;
        height: 8px;
        width: 8px;
        border-radius: 50%;
        margin-left: 3px;
      }
    }
  }

}
.fs14 {
  color: #333;
  font-size: 14px;
  position: relative;
  left: 20px;
  line-height: 13px;
  .file-name {
    color: #377AFF;
  }
  .text-span, .file-name {
    line-height: 16px;
  }
}
.content-div {
  display: flex;
  .content-text {
    line-height: 16px;
    width: 100%;
  }
  .orange-tag-item, .gray-tag-item {
    white-space: nowrap;
  }
}
.deldynamic {
  color: #666;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.con {
  left: 0px;
  margin-top: 10px;
  // width: calc(100% - 51px);
  border: 1px solid #E1F0EE;
  padding: 10px;
}
.finish-box {
  display: inline-block;
  position: relative;
  width: 25%;
  text-align: right;
}
.finish, .finished {
  font-size: 12px;
  font-weight: 600;
  margin-right: 10px;
}
.finish {
  color: @green;
  cursor: pointer;
}
.finished {
  color: #aaa;
}
.step-list-div {
  flex: 1;
  .loading-div {
    height: 100%;;
    min-height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .week-list{
    padding-right: 10px;
    .week-step-item{
      padding-bottom: 0;
      .week-time {
        color: @black;
      }
    }
  }
  .day-list {
    padding-left: 0;
    /deep/ .van-steps {
      padding: 0px;
    }
    /deep/ .van-step__circle-container {
      left: 25px;
    }
    /deep/.van-step__circle {
      display: none;
    }
    /deep/.van-step__line {
      display: none;
    }
  }

}

.sop-sign{
  background-color: red;
  color: white;
  border: red 2px solid;
  border-radius: 5px;
}
</style>
