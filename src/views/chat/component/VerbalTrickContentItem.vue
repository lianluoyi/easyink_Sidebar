<!--
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="verbal-trick-content-item">
    <div v-if="mediaType === MEDIA_TYPE['TEXT']">
      <van-field
        v-model="item.content"
        rows="3"
        autosize
        type="textarea"
        maxlength="1500"
        placeholder="请填写文字话术"
        label-width="0"
        show-word-limit
      />
    </div>
    <div v-else-if="[MEDIA_TYPE['POSTER'], MEDIA_TYPE['VIDEO'], MEDIA_TYPE['FILE']].includes(mediaType)" class="upload-content-item">
      <van-field v-model="item.title" label-width="0" placeholder="请填写标题，方便检索" maxlength="32" show-word-limit />
      <div class="upload-btn">
        <Upload
          v-if="!item.url"
          :upload-txt="`上传${ tipTxt[uploadType] }`"
          :tip="`${uploadTip[uploadType]}`"
          :accept="`${UPLOAD_ACCEPT[uploadType]}`"
          :file-url.sync="item.url"
          :file-name.sync="item.title"
          :file-size.sync="item.content"
          :media-type="uploadType"
        />
        <div v-else class="file-preview">
          <FileItem :detail-item="item" />
          <van-icon name="cross" class="remove-icon" @click="removeFile" />
        </div>
      </div>
    </div>
    <div v-else-if="mediaType === MEDIA_TYPE['IMG_LINK']" class="upload-content-item">
      <van-radio-group v-model="item.isDefined" direction="horizontal" icon-size="15px">
        <van-radio :name="DEFAULT_LINK">使用链接默认信息</van-radio>
        <van-radio :name="CUSTOM_LINK">自定义链接信息</van-radio>
      </van-radio-group>
      <div v-if="item.isDefined!==DEFAULT_LINK" style="margin-top:10px">
        <van-field v-model="item.url" label-width="0" placeholder="必填，请填写链接访问地址" />
        <van-field
          v-model="item.title"
          rows="2"
          autosize
          type="textarea"
          :maxlength="LINK_TITLE_MAXLENGTH"
          placeholder="必填，请填写链接的标题"
          label-width="0"
          show-word-limit
        />
        <van-field
          v-model="item.content"
          rows="2"
          autosize
          type="textarea"
          :maxlength="LINK_CONTENT_MAXLENGTH"
          :placeholder="`选填，请填写链接的摘要。默认是“${IMG_LINK_DIGEST}”`"
          label-width="0"
          show-word-limit
        />
        <div class="upload-btn">
          <Upload
            v-if="!item.coverUrl"
            :upload-txt="`上传${ tipTxt[uploadType] }`"
            :tip="`${uploadTip[uploadType]}`"
            :accept="`${UPLOAD_ACCEPT[uploadType]}`"
            :file-url.sync="item.coverUrl"
            :media-type="uploadType"
          />
          <div v-else class="file-preview">
            <FileItem :detail-item="item" />
            <van-icon name="cross" class="remove-icon" @click="removeFile" />
          </div>
        </div>
      </div>
      <div v-else style="margin-top:10px">
        <van-field v-model="item.url" label-width="0" placeholder="必填，请填写链接访问地址" @blur="sendWordsUrl" />
        <div class="file-preview">
          <FileItem :detail-item="item" />
          <van-icon name="cross" class="remove-icon" @click="removeFile" />
        </div>
      </div>
    </div>
    <div v-else-if="mediaType === MEDIA_TYPE['MINI_APP']" class="upload-content-item">
      <van-field v-model="item.content" label-width="0" placeholder="必填，请填写与企业关联小程序的appid" />
      <van-field v-model="item.url" label-width="0" placeholder="必填，请填写小程序消息打开后的路径，.html后缀" />
      <van-field v-model="item.title" label-width="0" maxlength="32" show-word-limit placeholder="必填，请填写小程序的标题" />
      <div class="upload-btn">
        <Upload
          v-if="!item.coverUrl"
          :upload-txt="`上传${ tipTxt[uploadType] }`"
          :tip="`${uploadTip[uploadType]}`"
          :accept="`${UPLOAD_ACCEPT[uploadType]}`"
          :file-url.sync="item.coverUrl"
          :media-type="uploadType"
        />
        <MiniAppPreview v-else :detail-item="item" />
      </div>
    </div>
  </div>
</template>
<script>
import { MEDIA_TYPE, UPLOAD_ACCEPT, CUSTOM_LINK, DEFAULT_LINK, IMG_LINK_DIGEST, LINK_TITLE_MAXLENGTH, LINK_CONTENT_MAXLENGTH } from '@/utils/constants';
import Upload from '@/components/Upload.vue';
import FileItem from './FileItem';
import MiniAppPreview from './MiniAppPreview';
import { getWordsUrlContent } from '@/api/wordsGroup';

const POSTER = MEDIA_TYPE['POSTER'];
const VIDEO = MEDIA_TYPE['VIDEO'];
const FILE = MEDIA_TYPE['FILE'];

export default {
  name: '',
  components: { Upload, FileItem, MiniAppPreview },
  props: {
    mediaType: {
      type: Number,
      default: MEDIA_TYPE['TEXT']
    },
    item: {
      type: Object,
      default: () => {}
    },
    list: {
      type: Array,
      default: () => []
    },
    index: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      LINK_CONTENT_MAXLENGTH,
      LINK_TITLE_MAXLENGTH,
      DEFAULT_LINK,
      CUSTOM_LINK,
      POSTER,
      VIDEO,
      FILE,
      MEDIA_TYPE,
      tipTxt: {
        [POSTER]: '图片',
        [VIDEO]: '视频',
        [FILE]: '文件'
      },
      uploadTip: {
        [POSTER]: '只能上传jpg/png文件，且不超过2M',
        [VIDEO]: '只能上传MP4文件，且不超过10M',
        [FILE]: '支持上传doc、pdf等文件，且不超过20M'
      },
      UPLOAD_ACCEPT,
      IMG_LINK_DIGEST
    };
  },
  computed: {
    // 上传类型
    uploadType() {
      if ([MEDIA_TYPE['IMG_LINK'], MEDIA_TYPE['MINI_APP']].includes(this.mediaType)) {
        return MEDIA_TYPE['POSTER'];
      } else {
        return this.mediaType;
      }
    }
  },
  created() {},
  mounted() {
  },
  methods: {
    /**
     * 移除已上传文件
     */
    removeFile() {
      const list = [...this.list];
      list[this.index] = {
        url: '',
        title: '',
        mediaType: list[this.index].mediaType,
        isDefined: this.item.isDefined
      };
      this.$emit('update:list', list);
    },
    /**
    * 输入链接后获取链接的标题、封面信息
    */
    async sendWordsUrl() {
      if (this.item.url) {
        getWordsUrlContent({ url: this.item.url }).then(res => {
          this.item.content = res.data.desc;
          this.item.title = res.data.title;
          if (!res.data.isUrl && res.data.image) {
          // 这里定义一个url来获取链接中的域名部分
            var url = this.item.url.split('/');
            this.item.coverUrl = 'https://' + url[2] + (res.data.image[0] !== '/' ? '/' : '') + res.data.image;
          } else {
            this.item.coverUrl = res.data.image;
          }
        });
      }
    }
  }

};
</script>
<style scoped lang='less'>
.verbal-trick-content-item {
    border: 1px solid #d9d9d9;
    .upload-content-item {
        padding: 5px;
        .upload-btn {
            text-align: center;
        }
        .van-cell {
            border: 1px solid #d9d9d9;
            padding: 6px 16px;
            margin-bottom: 10px;
        }
    }
    /deep/ .appid-preview-div {
      margin-top: 10px;
    }
}
.file-preview {
    border: 1px solid #d9d9d9;
    position: relative;
    .remove-icon {
         position: absolute;
        right: 10px;
        top: 10px;
        cursor: pointer;
    }
    /deep/ .file-title {
        padding-right: 14px;
    }
}
</style>
