<template>
  <div>
    <div class="task-wrapper">
      <div class="header">
        <span> 群SOP </span>
        <div> {{ task.createTime }} </div>
      </div>

      <div class="group">
        <van-cell class="group-tags" title="发送给客户群">
          <template #default>
            <template v-for="group of task.groupList.slice(0, 2)">
              <van-tag :key="group.chatId" size="large"> {{ group.groupName }} </van-tag>
            </template>
            <template v-if="task.groupList.length > 2">
              <van-tag size="large"> ... </van-tag>
            </template>
          </template>
        </van-cell>
        <van-cell title="发送时间" :value="sendRange" />
      </div>

      <div class="content">
        <div @touchstart.prevent="touchStart" @touchend="touchEnd">
          {{ task.content }}
        </div>
        <div v-show="showCopy" class="copy-wrapper">
          <van-button :class="'copy-btn_' + task.ruleId" :data-clipboard-text="task.content"> 复制 </van-button>
        </div>
      </div>

      <div class="image-list">
        <template v-for="material of task.materialList">
          <!-- mediaType:  0 图片（image）、1 语音（voice）、2 视频（video），3 普通文件(file) 4 文本 5 海报 6 海报字体 -->
          <van-image v-if="material.mediaType === 0" :key="material.id" width="80" :src="material.materialUrl" />
        </template>
        <template v-for="pic of task.picList">
          <van-image :key="pic" width="80" :src="pic" />
        </template>
      </div>

      <div>
        <!-- <van-cell title="发送给" is-link value="张三、李四、王五等11人"></van-cell> -->
        <van-cell title="已完成成员" is-link :value="showDone" @click="goState(1)" />
        <van-cell title="未完成成员" is-link :value="showTodo" @click="goState" />
      </div>

      <div v-if="!state" class="send-button">
        <van-button type="info" size="mini" @click="send">发送</van-button>
      </div>
    </div>

    <div class="bottom-line" />
  </div>
</template>

<script>
import ClipboardJS from 'clipboard';
import { changeStatus } from '@/api/community';
import { TOUCH_DELAY, TASK_TYPE } from '@/utils/constants';
const MARK_LENGTH = 2;

export default {
  name: 'SOPPanel',

  props: {
    task: {
      type: Object,
      required: true
    },

    // true: 已处理  false: 未处理
    state: {
      type: Boolean,
      required: true
    },

    isAdmin: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      showCopy: false, // 展示复制按钮
      touchDelay: TOUCH_DELAY, // 触发显示按钮的长按时常
      copyEvent: null,
      touch: false
    };
  },

  computed: {
    sendRange() {
      if (!this.task.startExeTime || !this.task.stopExeTime) return '';

      return this.task.startExeTime + ' - ' + this.task.stopExeTime;
    },

    todoMembers() {
      if (!(this.task && this.task.scopeList && this.task.scopeList.length > 0)) return [];

      const members = [];
      for (const member of this.task.scopeList) {
        if (!member.done) members.push(member);
      }

      return members;
    },

    showTodo() {
      if (this.todoMembers.length === 0) return '无';

      const names = this.todoMembers.map(m => m.name);

      if (this.todoMembers.length <= MARK_LENGTH) return names.join('、');
      return names[0] + '、' + names[1] + '等' + this.todoMembers.length + '人';
    },

    doneMembers() {
      if (!this.task || !this.task.scopeList || this.task.scopeList.length === 0) return [];

      const members = [];
      for (const member of this.task.scopeList) {
        if (member.done) members.push(member);
      }

      return members;
    },

    showDone() {
      if (this.doneMembers.length === 0) return '无';

      const names = this.doneMembers.map(m => m.name);

      if (this.doneMembers.length <= MARK_LENGTH) return names.join('、');
      return names[0] + '、' + names[1] + '等' + this.doneMembers.length + '人';
    }
  },

  mounted() {
    this.clipboard = new ClipboardJS('.copy-btn_' + this.task.ruleId);

    this.clipboard.on('success', (e) => {
      this.showCopy = false;
    });

    this.clipboard.on('error', (e) => {
      this.showCopy = false;
    });
  },

  methods: {
    goState(active) {
      if (!this.isAdmin) return;

      this.$router.push({
        name: 'taskState',
        query: {
          taskId: this.task.ruleId,
          active: active === 1 ? 1 : 0,
          taskType: TASK_TYPE['sop']
        }
      });
    },

    send() {
      const userId = this.$store.state.userId;
      const taskId = this.task.ruleId;
      const textContent = this.task.content;
      const picList = this.task.picList;
      const newPic = [];
      picList.map(item => {
        newPic.push({
          msgtype: 'image', // 消息类型，必填
          image: {
            imgUrl: item
          }
        });
      });
      const params = {};
      if (textContent) {
        params['text'] = {
          content: textContent
        };
      }
      if (newPic.length > 0) params['attachments'] = newPic;
      wx.invoke('shareToExternalChat', params, function(res) {
        if (res.err_msg === 'shareToExternalChat:ok') {
          console.log(res);
          changeStatus(userId, taskId, 1).then(() => {
            this.$emit('refresh');
          }).catch(() => {
            this.$emit('refresh');
          });
        } else {
          console.error(res);
        }
      }
      );
    },

    touchStart() {
      clearTimeout(this.copyEvent);

      this.copyEvent = setTimeout(() => {
        this.touch = true;
      }, this.touchDelay);
    },

    touchEnd() {
      clearTimeout(this.copyEvent);
      if (this.touch) this.showCopy = true;
      this.touch = false;
    }
  }
};

</script>

<style lang="less" scoped>
  .task-wrapper {
    padding: 10px 8px;

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 5px 0 12px;

      span {
        font-size: 18px;
        font-weight: bold;
      }
    }

    .group {
      .group-tags {
        :nth-child(n+2) {
          margin-left: 5px;
        }

        .van-tag {
          background-color: #f2f2f2;
          color: black;
          padding: 6px 10px;
        }
      }
    }

    .content {
      padding: 15px;
      background-color: #f2f2f2;
      font-size: 16px;
      line-height: 20px;
      color: #999999;
      // margin-bottom: 15px;
      min-height: 30px;
      position: relative;

      .copy-wrapper {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: space-around;
      }
    }

    .image-list {
      .van-image {
        padding: 10px 10px 0 0;
      }
    }

    .van-cell {
      padding: 10px 6px;
    }

    .send-button {
      padding: 10px 5px 5px;
      display: flex;
      flex-direction: row-reverse;

      .van-button {
        padding: 0 12px;
        margin-right: 12px;
        border-radius: 4px;
        font-size: 12px;
      }
    }
  }

  .bottom-line {
    background-color: #f2f2f2;
    height: 15px;
  }
</style>
