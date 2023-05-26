<!--
 * @Description: 单个话术内容
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="verbal-trick-item">
    <div class="head-container">
      <div class="verbal-trick-title">
        <svg class="icon-send" :width="22" :height="22" title="发送" @click="handleSendAll">
          <use href="#icon-send" />
        </svg>
        <span>{{ wordItem.title }}</span>
      </div>
      <div class="total">
        <span v-show="weWordsDetailList.length > 2">共{{ weWordsDetailList.length }}条</span>
        <van-icon v-show="weWordsDetailList.length > 2" name="arrow" :class="`expand-more${showMore ? ' arrow-down' : ''}`" @click="expandMore" />
        <MoveTool
          v-if="type === VERBAL_TRICK_TYPE['personal'] && showTool"
          ref="moveTool"
          :index="wordIndex"
          :list="wordsList"
          :edit-verbal-trick="true"
          :item="wordItem"
          @updateList="updateList"
          @removeItem="removeLowerItem"
          @editFunction="editWords"
        />
      </div>
    </div>
    <div class="content-container">
      <div v-for="(detailItem, index) in showList" :key="index" class="detail-list-item">
        <svg class="icon-send-white" :width="22" :height="22" title="发送" @click="() => handleSendSingle(detailItem)">
          <use href="#icon-send-white" />
        </svg>
        <div v-if="detailItem.mediaType === MEDIA_TYPE['TEXT']" class="content-text" style="flex: 1;">{{ detailItem.content }}</div>
        <FileItem v-else :detail-item="detailItem" />
      </div>
    </div>
  </div>
</template>
<script>
import FileItem from './FileItem.vue';
import { MEDIA_TYPE, VERBAL_TRICK_TYPE } from '@/utils/constants';
import MoveTool from './MoveTool.vue';
import { sendMessage } from '@/utils/index';
import { changeWordsSort, addOrUpdateLastUse, deleteWords } from '@/api/wordsGroup';
import { dealChildIdList } from '@/utils/index';
import {
  getMaterialMediaId
} from '@/api/chat';
const SHOW_LENGTH = 2;
export default {
  name: '',
  components: { FileItem, MoveTool },
  props: {
    wordItem: {
      type: Object,
      default: () => {}
    },
    wordIndex: {
      type: Number,
      default: 0
    },
    wordsList: {
      type: Array,
      default: () => []
    },
    /**
     * 是否显示下拉菜单
     */
    showTool: {
      type: Boolean,
      default: false
    },
    /**
     * 话术类型
     */
    type: {
      type: Number,
      default: VERBAL_TRICK_TYPE['enterprise']
    }
  },
  data() {
    return {
      MEDIA_TYPE,
      VERBAL_TRICK_TYPE,
      showMore: false
    };
  },
  inject: ['getExternalUserId'],
  computed: {
    showList() {
      const list = [...this.wordItem.weWordsDetailList];
      if (this.showMore) {
        return list;
      } else {
        return list.slice(0, SHOW_LENGTH);
      }
    },
    weWordsDetailList() {
      const wordItem = this.wordItem;
      return (wordItem && wordItem.weWordsDetailList) || [];
    },
    // 拿到inject的外部联系人id
    externalUserId() {
      return this.getExternalUserId();
    }
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * 查看更多
     */
    expandMore() {
      this.showMore = !this.showMore;
    },
    /**
     * 更新话术列表
     */
    updateList(list, type) {
      if (type === 'remove') return;
      this.$emit('update:wordsList', list);
      const newList = dealChildIdList(list) || [];
      this.updateWordsSort(newList);
    },
    async removeLowerItem(item, newList) {
      const delRes = await deleteWords({
        ids: [item.id]
      });
      if (delRes) {
        this.$emit('update:wordsList', newList);
      }
    },
    editWords() {
      this.$emit('showEditVerbalTrick', this.wordItem);
    },
    /**
     * 更新话术排序
     */
    updateWordsSort(wordsChangeSortList) {
      changeWordsSort({
        wordsChangeSortDTOList: wordsChangeSortList
      });
    },
    sleep(time) {
      return new Promise(res => setTimeout(res, time));
    },
    getSendItemInfo(sendItem) {
      return {
        mediaType: sendItem.mediaType,
        materialUrl: sendItem.url,
        materialName: sendItem.title,
        digest: sendItem.content,
        content: sendItem.content,
        coverUrl: sendItem.coverUrl,
        appid: sendItem.appid,
        accountOriginalId: sendItem.accountOriginalId
      };
    },
    /**
     * 发送整个话术分组
     */
    async handleSendAll() {
      const count = this.wordItem.weWordsDetailList && this.wordItem.weWordsDetailList.length;
      if (this.isLock) {
        this.$toast.loading({
          message: '正在发送...',
          duration: 0,
          forbidClick: true
        });
        const newData = this.wordItem.weWordsDetailList.map((item) => {
          return this.getSendItemInfo(item);
        });
        await sendMessage({ sendContentList: newData, externalUserId: this.externalUserId,
          weComUserId: this.$store.state.userId,
          corpId: this.$store.state.corpId }, this, getMaterialMediaId);
      } else {
        for (let index = 0; index < count; index++) {
          const sendItem = this.wordItem.weWordsDetailList[index];
          const newData = this.getSendItemInfo(sendItem);
          this.$toast.loading({
            message: '正在发送...',
            duration: 0,
            forbidClick: true
          });
          // 等待企微发消息方法响应后再调用下一个
          try {
            await sendMessage({ ...newData, externalUserId: this.externalUserId,
              weComUserId: this.$store.state.userId,
              corpId: this.$store.state.corpId }, this, getMaterialMediaId);
          } catch (e) { console.error(e); }
        }
      }

      this.saveRecentlyUsed([this.wordItem.id]);
    },
    /**
     * 发送单个话术
     */
    handleSendSingle(item) {
      const newData = {
        ...this.getSendItemInfo(item),
        externalUserId: this.externalUserId,
        weComUserId: this.$store.state.userId,
        corpId: this.$store.state.corpId
      };
      this.$toast.loading({
        message: '正在发送...',
        duration: 0,
        forbidClick: true
      });
      sendMessage(newData, this, getMaterialMediaId);
      this.saveRecentlyUsed([this.wordItem.id]);
    },
    /**
     * 保存最近使用话术
     */
    saveRecentlyUsed(wordsIds) {
      addOrUpdateLastUse({
        type: this.type,
        wordsIds
      });
    }
  }

};
</script>
<style scoped lang='less'>
.verbal-trick-item {
    margin-bottom: 5px;
    background-color: #fff;
    padding: 10px;
    .icon-send, .icon-send-white {
        margin-right: 8px;
    }
    .head-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        .verbal-trick-title {
            display: flex;
            align-items: center;
            color: @black;
            font-weight: bold;
            span {
              word-break: break-all;
              flex: 1;
            }
        }
        .total {
            display: flex;
            align-items: center;
            span {
              color: #7f7f7f;
            }
            .arrow-down {
                transform: rotate(90deg);
            }
            .expand-more {
              cursor: pointer;
            }
        }
    }
    .content-container {
        .detail-list-item {
            margin-bottom: 10px;
            display: flex;
            align-items: center;
          /deep/ .file-item {
            padding: 0;
            overflow: hidden;
          }
          .content-text {
            flex: 1;
            word-break: break-all;
          }
        }
    }
}
</style>
