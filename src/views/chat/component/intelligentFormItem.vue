<template>
  <div class="intelligent-form-item">
    <div class="item-left-icon">
      <div class="icon-img">
        <img :src="QUESTIONNAIRE">
      </div>
    </div>
    <div class="item-right-content">
      <div class="form-item-title">
        <div class="inoneline-flex">{{ formItem.formName }}</div>
        <div>
          <svg class="icon-send" :width="22" :height="22" title="发送" @click="handleSendForm">
            <use href="#icon-send" />
          </svg>
        </div>
      </div>
      <div class="form-item-info intwoline">
        {{ formItem.description }}
      </div>
    </div>
  </div>
</template>
<script>
import { INTELLIGENT_FORM_TYPE, MEDIA_TYPE } from '@/utils/constants';
import { sendMessage } from '@/utils/index';
import { addSendFormRecord, getSendFormUrl } from '@/api/form';
// 侧边栏渠道类型
const SIDEBAR_CHANNEL_TYPE = 4;
// 问卷表单icon
const QUESTIONNAIRE = 'https://easy-1304809163.cos.ap-nanjing.myqcloud.com/questionnaire.png';
// 第三方应用;
const SERVER_TYPE_THIRD = 'third';
export default {
  name: '',
  components: { },
  props: {
    // 表单数据
    formItem: {
      type: Object,
      default: () => {}
    },
    // 表单类型
    type: {
      type: Number,
      default: INTELLIGENT_FORM_TYPE['enterprise']
    },
    // 是否是最近使用
    isRecent: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      INTELLIGENT_FORM_TYPE,
      SIDEBAR_CHANNEL_TYPE,
      QUESTIONNAIRE
    };
  },
  inject: ['getExternalUserId', 'recentFormRef', 'getDomainName'],
  computed: {
    // 中间页域名
    domainName() {
      return this.getDomainName();
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
     * @description: 获取要发送的表单的URL
     * @param {*} formId 表单id
     * @param {*} userId 员工id
     * @param {*} channelType 渠道类型
     * @return {*}
     */
    async getFormUrl(formId, userId, channelType) {
      // 当为lock且三方的环境时
      if (this.isLock && this.$store.state.serverType === SERVER_TYPE_THIRD) {
        const formUrlRes = await getSendFormUrl({ formId, userId, channelType: +channelType });
        return formUrlRes.data;
      }
      return `${this.domainName}?formId=${formId}&userId=${userId}&channelType=${channelType}`;
    },
    /**
     * 发送表单
     */
    async handleSendForm() {
      const { userId } = this.$store.state;
      // 最近使用列表表单id标识为formId,表单列表为id
      const { id, formId } = this.formItem;
      const handleFormId = this.isRecent ? formId : id;
      const newData = {
        mediaType: MEDIA_TYPE['IMG_LINK'],
        materialUrl: await this.getFormUrl(handleFormId, userId, SIDEBAR_CHANNEL_TYPE),
        materialName: this.formItem.formName,
        digest: this.formItem.description,
        coverUrl: this.formItem.headImageurl || QUESTIONNAIRE,
        externalUserId: this.externalUserId,
        weComUserId: this.$store.state.userId,
        corpId: this.$store.state.corpId
      };
      this.$toast.loading({
        message: '正在发送...',
        duration: 0,
        forbidClick: true
      });
      try {
        await sendMessage(newData, this);
      } catch (e) { console.error(e); }
      this.saveRecentlyUsed(handleFormId);
    },
    /**
     * 保存最近使用表单
     */
    async saveRecentlyUsed(formId) {
      const { userId, corpId } = this.$store.state;
      await addSendFormRecord({
        formId,
        userId,
        externalUserId: this.externalUserId,
        corpId
      });
      // 添加完最近使用重新获取
      this.recentFormRef?.getRecentForms();
    }
  }

};
</script>
<style scoped lang='less'>
.intelligent-form-item {
  margin-bottom: 5px;
  background-color: #fff;
  padding: 10px;
  display: flex;
  .item-left-icon {
    height: 60px;
    width: 60px;
    margin-right: 20px;
    img {
      height: 100%;
      width: 100%;
      border-radius: 5px;
    }
  }
  .item-right-content{
    flex: 1;
    display: flex;
    flex-direction: column;
    .form-item-title {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: @black;
        font-weight: bold;
        margin-bottom: 5px;
        .icon-send {
          width: 22px;
          height: 22px;
        }
        span {
          word-break: break-all;
          flex: 1;
        }
    }
    .form-item-info {
      font-size: 12px;
      color: #999;
    }
  }
  .icon-send {
    cursor: pointer;
  }
}
</style>
