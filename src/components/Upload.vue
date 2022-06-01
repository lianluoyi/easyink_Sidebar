<!--
 * @Description: 上传组件
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <van-uploader
    v-model="previewFileList"
    v-bind="$attrs"
    :after-read="afterRead"
    :accept="accept"
    :preview-image="previewImage"
    :before-read="beforeRead"
    v-on="$listeners"
  >
    <van-button v-if="showBtn" :loading="loading" color="#6BB4AB" size="small" type="primary">{{ uploadTxt }}</van-button>
    <div v-if="tip" class="tip">{{ tip }}</div>
  </van-uploader>
</template>
<script>
import { dealFormat, dealUploadSize, dealImgName } from '@/utils/index';
import { uploadFile2Cos } from '@/api/common';
import { MEDIA_TYPE } from '@/utils/constants';
const FILE_NAME_LENGTH = 100;

export default {
  name: '',
  components: {},
  props: {
    /**
     * 是否预览文件
     */
    previewImage: {
      type: Boolean,
      default: false
    },
    /**
     * 文件列表
     */
    fileList: {
      type: Array,
      default: () => []
    },
    /**
     * 是否显示上传按钮
     */
    showBtn: {
      type: Boolean,
      default: true
    },
    /**
     * 上传按钮文字
     */
    uploadTxt: {
      type: String,
      default: '上传'
    },
    /**
     * 上传须知
     */
    tip: {
      type: String,
      default: ''
    },
    /**
     * 上传接受的类型
     */
    accept: {
      type: String,
      default: '*'
    },
    /**
     * 上传文件类型
     */
    mediaType: {
      type: Number,
      default: MEDIA_TYPE['POSTER']
    },
    // 文件名字数限制
    limitFileName: {
      type: Number,
      default: FILE_NAME_LENGTH
    },
    /**
     * 上传文件成功后的回调
     */
    uploadSuccess: {
      type: Function,
      default: () => {}
    },
    customFileName: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      previewFileList: []
    };
  },
  created() {
    this.previewFileList = [...this.fileList];
  },
  mounted() {},
  methods: {
    beforeRead(file) {
      // 此时可以自行将文件上传至服务器
      const flag = this.handleBeforeUpload(file);
      if (!flag) return false;
      return true;
    },
    afterRead(params) {
      const file = params.file;
      // 此时可以自行将文件上传至服务器
      let newFile = file;
      let newFileName = this.customFileName ? (`${new Date().getTime()}/${file.name}`) : file.name;
      // 图片名超过于上限
      if (file.name.length > this.limitFileName && Number(this.mediaType) === 0) {
        newFileName = dealImgName(newFileName, this.limitFileName);
        newFile = new File([file], newFileName, { type: 'image/jpeg' });
      }
      // 封装数据
      const form = new FormData();
      form.append('file', newFile);
      form.append('mediaType', this.mediaType);
      if (this.customFileName) {
        form.append('fileName', newFileName);
      }
      uploadFile2Cos(form).then(res => {
        // 自行处理各种情况
        this.onSuccess(res, file);
      }).catch((e) => {
        this.loading = false;
        console.error('上传文件失败', e);
        this.$toast('上传文件失败');
      });
    },
    /**
     * 上传前校验
     */
    handleBeforeUpload(file) {
      this.loading = true;
      let isFormat = true;
      let isSize = true;
      isFormat = dealFormat(this.mediaType, file, this);
      isSize = dealUploadSize(this.mediaType, file, this);
      if (!isFormat || !isSize) {
        this.loading = false;
      }
      return isFormat && isSize;
    },
    /**
     * 上传成功
     */
    onSuccess(res, file) {
      this.loading = false;
      this.$emit('update:fileUrl', res.data.url);
      const newFileName = dealImgName(file.name);
      this.$emit('update:fileName', newFileName);
      this.$emit('update:fileSize', file.size);
      this.$emit('update:file', file);
      this.uploadSuccess(file, res.data);
    }
  }
};
</script>
<style scoped lang='less'>
.tip {
    font-size: 13px;
    margin-top: 5px;
    color: #aaa;
}
</style>
