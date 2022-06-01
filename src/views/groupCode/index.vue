<template>
  <div>
    <div v-if="!code || !code.actualQRCode">
      <van-empty :description="message" />
    </div>
    <div v-else class="code-wrapper">
      <div class="header">
        {{ code.activityName }}
      </div>

      <div class="welcome">
        {{ code.guide }}
      </div>

      <div class="code-name">
        {{ code.groupName }}
      </div>

      <div class="code-image">
        <van-image width="300" :src="code.actualQRCode" />
      </div>

      <div v-if="code.isOpenTip === '1'" class="service">
        <van-button type="danger" @click="dialog = true">无法加群?</van-button>
      </div>

      <van-dialog
        v-model="dialog"
        class="service-dialog"
        :show-confirm-button="false"
        :close-on-click-overlay="true"
      >
        <div>
          <van-image
            v-if="code.serviceQrCode"
            :src="code.serviceQrCode"
            width="200"
          />
          <div class="service-message">
            {{ code.tipMsg }}
          </div>

          <div v-if="code.serviceQrCode" class="tip">
            请长按二维码添加客服微信
          </div>
        </div>

        <van-icon name="cross" class="close" @click="dialog = false" />
      </van-dialog>
    </div>
  </div>
</template>

<script>
import { getDetail } from '@/api/groupCode';

export default {
  data() {
    return {
      groupCodeUUID: '', // 群活码ID
      code: {
        activityName: '', // 活码名称
        guide: '', // 加群引导语
        actualQRCode: '', // 实际群码
        isOpenTip: '', // 是否显示无法加群提示
        tipMsg: '', // 无法加群提示语
        serviceQrCode: '', // 客服二维码
        groupName: '' // 实际群名称
      },
      dialog: false,
      message: '没有可用的客户群'
    };
  },

  created() {
    this.groupCodeUUID = this.$route.query.id;

    this.getDetail();
  },

  methods: {
    // 获取群活码详情
    getDetail() {
      if (!this.groupCodeUUID) return;

      getDetail(this.groupCodeUUID).then(({ data, msg }) => {
        this.code = Object.assign(this.code, data);
        if (msg) this.message = msg;
      }).catch(() => {});
    }
  }
};
</script>

<style lang="less" scoped>
  .code-wrapper {
    margin: 20px 10px;

    .header {
      font-size: 18px;
      margin: 20px 10px;
      text-align: center;
    }

    .welcome {
      font-size: 16px;
      color: #AAAAAA;
      margin: 20px 10px 60px;
    }

    .code-name {
      font-size: 20px;
      margin: 20px 10px 2px;
      font-weight: bold;
      text-align: center;
    }

    .code-image {
      text-align: center;
      margin-bottom: 100px;
    }

    .service {
      text-align: center;

      .van-button {
        border-radius: 4px;
        height: 36px;
      }
    }
  }

  .service-dialog {
    text-align: center;
    border-radius: 0;
    padding: 20px;

    .tip {
      font-size: 12px;
      color: #AAAAAA;
      margin-top: 30px;
    }

    .close {
      position: absolute;
      top: 10px;
      right: 10px;
    }
    /deep/ .van-image {
      .van-image__error {
        width: 100%;
        height: 200px;
        position: relative;
        margin-bottom: 10px;
      }
    }
  }
</style>
