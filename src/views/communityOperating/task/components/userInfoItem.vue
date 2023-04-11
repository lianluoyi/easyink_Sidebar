<!--
 * @Description: 员工/群聊信息样式
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="user-info-item-div flex">
    <div class="user-info flex">
      <div class="avatar-img mr5">
        <van-image
          v-if="item.isCustomer"
          width="35"
          height="35"
          :src="item.headImageUrl"
        />
        <svg v-else class="icon-groupChat" :width="35" :height="35">
          <use href="#icon-groupChat" />
        </svg>
      </div>
      <div :class="`${item.isCustomer ? 'user-detail' : 'group-detail'} flex`">
        <div>
          {{ item.targetRemark || item.targetUserName }}
          <span v-if="item.isCustomer" :class="item.type === wxType ? 'wx-type-flag' : 'corp-type-name'">
            {{ dealAtInfo(item) }}
          </span>
        </div>
        <div v-if="item.isCustomer" class="nickname">{{ item.targetUserName }}</div>
      </div>
    </div>
    <div>
      <van-button
        :class="`open-chat-btn${(!item.isCustomer && !(item.isFinish || hasDealFlag)) ? ' group-name-copy' : ''}${(item.isFinish || hasDealFlag) ? ' disable-btn' : ''}`"
        type="primary"
        color="#6BB4AB"
        :disabled="item.isFinish || hasDealFlag"
        :data-clipboard-text="item.targetUserName"
        @click="openChat"
      >
        {{ item.isCustomer ? '打开会话' : '复制群名' }}
      </van-button>
    </div>
  </div>
</template>
<script>
import ClipboardJS from 'clipboard';
import { dealAtInfo } from '@/utils/index';
import { WX_TYPE } from '@/utils/constants';

export default {
  name: '',
  components: {},
  props: {
    item: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      wxType: WX_TYPE,
      hasDealFlag: false
    };
  },
  created() {},
  mounted() {
    this.clipboard = new ClipboardJS('.group-name-copy');
    this.clipboard.on('success', (e) => {
      this.$toast('已复制群名');
    });
    this.clipboard.on('error', (e) => {
      this.$toast('文件路径复制失败');
    });
  },
  methods: {
    openChat() {
      if (this.item.isCustomer) {
        const _this = this;
        _this.$api.invoke('openEnterpriseChat', {
          externalUserIds: this.item.targetId,
          groupName: this.item.targetUserName
        }, function(res) {
          if (res.err_msg === 'openEnterpriseChat:ok') {
            _this.hasDealFlag = true;
          }
        });
      }
    },
    dealAtInfo(item) {
      return dealAtInfo(item);
    }
  }

};
</script>
<style scoped lang='less'>
.user-info-item-div {
    justify-content: space-between;
    align-items: center;
    width: 100%;
    .user-info {
        .avatar-img {
            height: 35px;
        }
        .group-detail {
            align-items: center;
        }
        .user-detail {
            flex-direction: column;
            justify-content: space-between;
            div {
                color: @black;
                font-weight: bold;
            }
            .nickname {
                color: #666666;
                font-size: 12px;
            }
        }
    }
    .open-chat-btn {
        width: 70px;
        height: 28px;
        padding: 0;
        font-size: 12px;
    }
    .disable-btn {
        background-color: #DDDDDD !important;
        color: @fontColor !important;
        border: none;
    }
}
</style>
