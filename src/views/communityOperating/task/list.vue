<!--
 * @Description: sop列表
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="sop-task-list-page">
    <van-notice-bar
      class="notice-text"
      left-icon="volume-o"
      text="管理员设置了SOP，提醒您完成以下任务，向指定对象发送指定消息"
    />
    <div class="step-demo-div">
      <div class="check-div">
        <div class="check-action" @click="onShowTip"><span class="check-tip">查看执行步骤</span><van-icon :name="`${showTipDetail ? 'arrow-up' : 'arrow'}`" color="#C2C2C2" /></div>

        <van-popover v-model="showPopover" trigger="click" placement="left" get-container=".check-div">
          <div class="popover-div">
            若群聊没有设置名称，则复制群名后在会话列表可能会检索失败
          </div>
          <template #reference>
            <van-icon name="question-o" />
          </template>
        </van-popover>
      </div>
      <div v-show="showTipDetail" class="step-info-div">
        <div>
          ① 点击“打开会话”或“复制群名”，进入与执行对象的聊天框；
        </div>
        <div>
          ② 打开聊天框侧边栏【客户画像 】-【待办事项】，找到待完成的SOP；
        </div>
        <div>
          ③ 点击“一键发送”
          <svg class="icon-send" :width="18" :height="18">
            <use href="#icon-send" />
          </svg>
          或“发送”
          <svg class="icon-send-white" :width="18" :height="18">
            <use href="#icon-send-white" />
          </svg>
          将消息发给聊天对象；
        </div>
        <div>
          ④ 点击“完成”按钮；
        </div>
      </div>
      <div class="main-container mt15">
        <van-tabs type="card">
          <van-tab title="全部"><SopTab /></van-tab>
          <van-tab title="客户SOP"><SopTab title="客户SOP" :type="SOP_TYPE['customer']" /></van-tab>
          <van-tab title="群SOP"><SopTab title="群SOP" :type="SOP_TYPE['group']" /></van-tab>
          <van-tab title="群日历"><SopTab title="群日历" :type="SOP_TYPE['groupCalendar']" /></van-tab>
        </van-tabs>
      </div>
    </div>
  </div>
</template>
<script>
import SopTab from './SopTab';
import { SOP_TYPE } from '@/utils/constants';

export default {
  name: '',
  components: { SopTab },
  props: {},
  data() {
    return {
      SOP_TYPE,
      showTipDetail: false,
      showPopover: false
    };
  },
  created() {
    const enterSop = localStorage.getItem('enterSop');
    if (!enterSop) {
      this.showTipDetail = true;
      localStorage.setItem('enterSop', true);
    }
  },
  mounted() {},
  methods: {
    onShowTip() {
      this.showTipDetail = !this.showTipDetail;
    }
  }

};
</script>
<style scoped lang='less'>
.sop-task-list-page {
    .notice-text {
        font-size: 12px;
    }
    .step-demo-div {
        padding: 15px;
        .check-div {
          display: flex;
            align-items: center;
            justify-content: space-between;
            .popover-div {
              padding: 10px;
              line-height: 20px;
              max-width: 250px;
            }
            .check-action {
              cursor: pointer;
              display: inline-flex;
              align-items: center;
              .check-tip {
                  font-size: 12px;
                  color: #37ADFF;
              }
              i {
                  margin-left: 3px;
              }
            }
        }
        .step-info-div {
            color: @fontColor;
            font-size: 12px;
            margin-top: 10px;
            div {
                line-height: 18px;
                svg {
                    vertical-align: middle;
                }
            }
        }
    }
}
</style>

