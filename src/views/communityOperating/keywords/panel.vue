<template>
  <div>
    <div class="task-wrapper">
      <div class="header">
        <span> {{ task.taskName }} </span>
      </div>

      <div v-if="keywords.length != 0" class="keywords">
        <template v-for="keyword of keywords">
          <van-tag :key="keyword" size="medium"> {{ keyword }} </van-tag>
        </template>
      </div>

      <div v-if="task.welcomeMsg" class="guide">
        <div class="guide-content" @touchstart.prevent="touchStart" @touchend="touchEnd">
          {{ task.welcomeMsg }}
        </div>
        <div v-show="showCopy" class="copy-wrapper">
          <van-button
            :class="'copy-btn_' + task.taskId"
            :data-clipboard-text="task.welcomeMsg"
          >
            复制
          </van-button>
        </div>
      </div>

      <div class="content">
        <div v-if="task.groupCodeInfo && task.groupCodeInfo.codeUrl">
          <van-image width="50" :src="task.groupCodeInfo.codeUrl" />
        </div>

        <div class="group">
          <span class="group-taskname line3-toe"> {{ task.keywords }} </span>
        </div>
      </div>

      <div class="bottom-area">
        <span class="time"> {{ task.createTime }} </span>

        <van-button type="info" size="mini" @click="send">发送</van-button>
      </div>
    </div>

    <div class="bottom-line" />
  </div>
</template>

<script>
import ClipboardJS from 'clipboard';
import { TOUCH_DELAY } from '@/utils/constants';
export default {
  name: 'KeywordPanel',
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showCopy: false, // 展示复制按钮
      touchDelay: TOUCH_DELAY, // 触发显示按钮的长按时长
      copyEvent: null,
      touch: false
    };
  },
  computed: {
    keywords() {
      if (!this.task || !this.task.keywordList) return [];
      const keywords = this.task.keywordList.map((k) => k.keyword);
      return keywords;
    },
    groupCodeUrl() {
      if (window.location.hash[0] === '#') {
        return (
          window.location.origin +
          window.location.pathname +
          '#/groupCode?id=' +
          this.task.groupCodeInfo.id
        );
      }

      return (
        window.location.origin +
        window.location.pathname +
        'groupCode?id=' +
        this.task.groupCodeInfo.id
      );
    },
    imgUrl() {
      if (this.task.groupCodeInfo && this.task.groupCodeInfo.codeUrl) { return this.task.groupCodeInfo.codeUrl; }
      return '';
    }
  },
  mounted() {
    this.clipboard = new ClipboardJS('.copy-btn_' + this.task.taskId);

    this.clipboard.on('success', (e) => {
      this.showCopy = false;
    });

    this.clipboard.on('error', (e) => {
      this.showCopy = false;
    });
  },
  methods: {
    // 将链接设置到输入框
    setLinkToTextarea(groupCodeUrl, imgUrl, taskName) {
      const toast = this.$toast;
      wx.invoke(
        'sendChatMessage',
        {
          msgtype: 'news',
          news: {
            link: groupCodeUrl,
            title: taskName,
            desc: ' ',
            imgUrl: imgUrl
          }
        },
        function(res) {
          if (res.err_msg !== 'sendChatMessage:ok') {
            toast('链接设置失败');
          }
        }
      );
    },
    send() {
      const groupCodeUrl = this.groupCodeUrl;
      const welcomeMsg = this.task.welcomeMsg;
      const taskName = this.task.taskName;
      const imgUrl = this.imgUrl;
      const setLinkToTextarea = this.setLinkToTextarea;
      const toast = this.$toast;
      wx.invoke(
        'sendChatMessage',
        {
          msgtype: 'text', // 消息类型，必填
          text: {
            content: welcomeMsg // 文本内容
          }
        },
        function(res) {
          if (res.err_msg === 'sendChatMessage:ok') {
            setLinkToTextarea(groupCodeUrl, imgUrl, taskName);
          } else {
            toast('文字设置失败');
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

    span {
      font-size: 14px;
      font-weight: bold;
    }
  }

  .keywords {
    margin-bottom: 15px;

    .van-tag {
      margin-right: 10px;
      background-color: #f2f2f2;
      color: rgba(0, 0, 0, 0.6);
    }
  }

  .guide {
    padding: 10px;
    background-color: #f2f2f2;
    font-size: 16px;
    line-height: 20px;
    color: #999999;
    margin-bottom: 15px;
    margin-top: 10px;
    min-height: 30px;
    position: relative;
    .guide-content {
      font-size: 14px;
    }

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

  .content {
    padding: 10px;
    background-color: #f2f2f2;
    display: flex;

    .group {
      padding: 0 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .group-taskname {
        font-size: 14px;
        height: 48px;
      }
      .group-name {
        color: #999999;
      }
    }
  }

  .van-cell {
    padding: 10px 6px;
  }

  .bottom-area {
    padding: 10px 5px 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .time {
      color: #999;
    }

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
