<!--
 * @Description: 朋友圈任务页面
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->

<template>
  <div class="circle-task-page">
    <van-notice-bar
      left-icon="volume-o"
      text="管理员创建了朋友圈任务，提醒您根据可见范围进行发布"
    />
    <template v-if="loading">
      <div style="margin-top:40px">
        <van-loading type="spinner" vertical size="26">加载中...</van-loading>
      </div>
    </template>
    <template v-else>
      <div class="circle-task-content-div">
        <div class="row-div">
          <div class="label">可见范围</div>
          <div v-if="data.pushRange ===ALL_RANGE" class="range">
            <span>全部客户</span>
          </div>
          <div v-else class="range">
            <template v-if="data.tagList!==null">
              <span v-for="item in data.tagList" :key="item.tagId" class="tag">
                <span>{{ item.name }}</span>
              </span>
            </template>
            <template v-else>
              <span>全部客户</span>
            </template>
          </div>
        </div>
        <div class="row-div">
          <div class="label">创建时间</div>
          <div class="content">{{ data.createTime }}</div>
        </div>
        <div class="row-div">
          <div class="label">发布状态</div>
          <div class="content">
            <van-tag
              :class="`${data.publishStatus === PUBLISHED ? 'published-tag' : 'released-tag'}`"
            >
              {{ dealPublishShow(data) }}
            </van-tag>
          </div>
        </div>
        <div class="row-div">
          <div class="label">发布内容</div>
          <div class="content">
            <div class="mb10">
              {{ data.content }}
            </div>
            <!-- 附件类型为图片 -->
            <div v-if="data.mediaType===MEDIA_TYPE['POSTER']" class="image">
              <div v-for="item in data.weWordsDetailList" :key="item.id" class="image-detail">
                <van-image
                  fit="fill"
                  style="width: 80px; height: 80px"
                  :src="item.url"
                  @click="showImage(item)"
                />
              </div>
              <van-image-preview v-model="show" :images="images" @change="close" />
            </div>
            <!-- 附件类型为视频 -->
            <div v-if="data.mediaType===MEDIA_TYPE['VIDEO']">
              <Video :detail-item="data.weWordsDetailList[0]" class="file-preview" />
            </div>
            <!-- 附件类型为链接 -->
            <div v-if="data.mediaType===MEDIA_TYPE['IMG_LINK']">
              <Link :detail-item="data.weWordsDetailList[0]" class="file-preview" />
            </div>
          </div>
        </div>
      </div>
      <div class="send-btn-div">
        <van-button v-if="!isPC" :disabled="btnLoading" :loading="loadingIcon" loading-text="前往发送" class="send-button" hairline @click="send">前往发送</van-button>
        <van-button v-else :disabled="true" class="grey-button" hairline @click="send">请从企业微信APP进入当前页面发送</van-button>
      </div>
    </template>
  </div>
</template>
<script>
import { getMomentTaskBasicInfo, updateUserMoment } from '@/api/friends';
import { MEDIA_TYPE, DEFAULT_IMG } from '@/utils/constants';
import { isPC } from '@/utils/index.js';
import Link from './link.vue';
import Video from './Video.vue';
// 发布状态
const RELEASED = 0; // 代发布
const PUBLISHED = 1; // 已发布
const EXPIRED = 2; // 已过期
const NOPUBLISHED = 3; // 不可发布
// 	可见范围（0：全部客户 1：部分客户）
const ALL_RANGE = 0;
// 是否删除
const ISDELETE = 4;
const PUBLISH_STATUS = {
  [RELEASED]: '待发布',
  [PUBLISHED]: '已发布',
  [EXPIRED]: '已过期',
  [NOPUBLISHED]: '不可发布'
};
export default {
  name: '',
  components: { Link, Video },
  props: {},
  data() {
    return {
      // 页面的加载状态
      loading: true,
      // 按钮是否禁用
      btnLoading: false,
      // 按钮加载时loading转圈状态
      loadingIcon: false,
      MEDIA_TYPE,
      DEFAULT_IMG,
      // 预览图片
      show: false,
      ALL_RANGE,
      index: 0,
      images: [],
      data: {},
      momentTaskId: 0,
      tagList: [],
      PUBLISH_STATUS,
      PUBLISHED
    };
  },
  computed: {
    userId() {
      return this.$store.state.userId;
    },
    //  是否是移动端
    isPC() {
      return isPC();
    }
  },
  watch: {
    userId(val) {
      if (val) {
        this.getMomentTaskBasicInfo();
      }
    }
  },
  created() {
    this.momentTaskId = this.$route.query.momentTaskId;
  },
  mounted() {},
  methods: {
    // 修改员工执行详情
    updateUserMoment() {
      updateUserMoment({
        momentTaskId: this.momentTaskId,
        userId: this.userId
      });
    },
    // 是否是PC端
    send() {
      const toast = this.$toast;
      const params = {};
      params.text = { content: this.data.content };
      // 处理附件为视频
      if (this.data.mediaType === MEDIA_TYPE['VIDEO']) {
        params.attachments = [{
          msgtype: 'video',
          video: {
            mediaid: this.data.weWordsDetailList[0].mediaid
          }
        }];
      }
      // 处理附件为图片
      if (this.data.mediaType === MEDIA_TYPE['POSTER']) {
        params.attachments = this.data.weWordsDetailList.map((obj) => {
          obj.msgtype = 'image';
          obj.image = {
            mediaid: obj.mediaid
          };
          return obj;
        });
      }
      // 处理附件为链接
      if (this.data.mediaType === MEDIA_TYPE['IMG_LINK']) {
        const data = this.data.weWordsDetailList[0];
        params.attachments = [{
          msgtype: 'link',
          link: {
            title: data.title,
            imgUrl: data.coverUrl,
            url: data.url
          }
        }];
      }
      this.btnLoading = true;
      this.loadingIcon = true;
      this.$api.invoke('shareToExternalMoments', params, (res) => {
        if (res.err_msg !== 'shareToExternalMoments:cancel' && res.err_msg !== 'shareToExternalMoments:ok') {
          toast('发送失败');
          this.btnLoading = false;
          this.loadingIcon = false;
        }
        if (res.err_msg === 'shareToExternalMoments:cancel') {
          this.btnLoading = false;
          this.loadingIcon = false;
        }
      });
      this.updateUserMoment();
    },
    // 图片预览
    showImage(item) {
      this.images.push(item.url);
      this.show = true;
    },
    close() {
      this.show = false;
    },
    // 判断发布状态
    // 员工发布状态成员发表状态。0:待发布 1：已发布 2：已过期 3：不可发布
    dealPublishShow(data) {
      return data.publishStatus !== undefined ? this.PUBLISH_STATUS[data.publishStatus] : '';
    },

    getMomentTaskBasicInfo() {
      const params = {
        momentTaskId: this.momentTaskId,
        userId: this.userId
      };
      getMomentTaskBasicInfo(params).then(({ data }) => {
        this.loading = false;
        this.data = data;
        if (this.data.status === ISDELETE) {
          this.$toast.fail('该任务已删除');
          this.btnLoading = true;
        }
        const MAX_BYTE = 1024;
        const VIDEO_BYTEMAX = 10;
        // 如果为视频判断附件大小
        if (this.data.mediaType === MEDIA_TYPE['VIDEO']) {
          if (this.data.weWordsDetailList[0].size > VIDEO_BYTEMAX * MAX_BYTE * MAX_BYTE) {
            this.data.mediaType = MEDIA_TYPE['IMG_LINK'];
            this.data.weWordsDetailList[0].coverUrl = this.DEFAULT_IMG.video;
            this.data.weWordsDetailList[0].mediaType = MEDIA_TYPE['IMG_LINK'];
          }
        }
      });
    }
  }
};
</script>
<style scoped lang='less'>
.circle-task-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  .circle-task-content-div {
    padding: 13px 16px;
    flex: 1;
    .row-div {
      display: flex;
      margin-bottom: 20px;
      .label {
        width: 60px;
        margin-right: 20px;
        color: #9C9C9C;
      }
      .content {
        flex: 1;
      }
    }
    .published-tag {
      border: 1px solid #6BB4AB;
      color: #6BB4AB;
      background-color: #ffffff;
    }
    .released-tag {
      border: 1px solid #FEE3D0;
      color: #FA7216;
      background-color: #FFF1E8;
    }
  }
}
.file-preview {
    margin-top: 10px;
    border: 1px solid #d9d9d9;
    width: 230px;
    /deep/ .file-title {
        padding-right: 14px;
    }
}
.range {
  display: flex;
}
.tag {
  margin-right: 10px;
  height: 24px;
  width: 45px;
  text-align: center;
  line-height: 24px;
  border-radius: 3px ;
  background-color: #EDEDED;
  border: 1px solid #EDEDED;
}
.image {
  display: flex;
  flex-wrap: wrap;
  width: 255px;
}
.image-detail {
  margin-right: 5px;
}

.send-btn-div {
  text-align: center;
  .send-button, .grey-button {
    width: 80%;
    height: 36px;
    margin-bottom: 20px;
  }
  .send-button {
    background-color: @green;
    color: #FFFFFF;
  }
  .grey-button {
    background-color: @green;
    color: #FFFFFF;
    background-color: #EEEEEE ;
    color: #999999;
  }
}
</style>
