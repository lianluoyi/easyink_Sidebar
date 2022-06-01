<template>
  <div class="edit-property-item">
    <van-field
      v-if="item.type === CUSTOMER_PROPERTY_VALUE['sysField']
        && !['出生日期', '地址', '描述'].includes(item.name)"
      v-model="item.value"
      :label="item.name"
      :placeholder="`请输入${item.name}`"
      :required="item.required"
    />
    <van-field
      v-if="[CUSTOMER_PROPERTY_VALUE['singleText']].includes(item.type)"
      v-model="item.value"
      :label="item.name"
      :placeholder="`请输入${item.name}`"
      :required="item.required"
      maxlength="32"
      show-word-limit
    />
    <van-field
      v-if="item.type === CUSTOMER_PROPERTY_VALUE['sysField'] && item.name === '地址'"
      v-model="item.value"
      :label="item.name"
      type="textarea"
      maxlength="64"
      show-word-limit
      :placeholder="`请输入${item.name}`"
      :required="item.required"
    />
    <van-field
      v-if="item.type === CUSTOMER_PROPERTY_VALUE['sysField'] && item.name === '描述'"
      v-model="item.value"
      :label="item.name"
      type="textarea"
      maxlength="150"
      show-word-limit
      :placeholder="`请输入${item.name}`"
      :required="item.required"
    />
    <div
      v-if="item.type === CUSTOMER_PROPERTY_VALUE['sysField'] && item.name === '出生日期'"
    >
      <van-field
        v-model="item.value"
        is-link
        readonly
        :label="item.name"
        placeholder="请选择"
        :required="item.required"
        @click="openCalander(item.value)"
      />
      <van-popup
        v-model="dateshow"
        position="bottom"
        round
        get-container="body"
        :style="{ height: '330px' }"
      >
        <van-datetime-picker
          v-model="currentDate"
          type="date"
          title="选择年月日"
          :min-date="minDate"
          :max-date="maxDate"
          @confirm="confirmDate(index, 'date')"
          @cancel="dateshow = false"
        />
      </van-popup>
    </div>
    <div
      v-if="item.type === CUSTOMER_PROPERTY_VALUE['dateField']"
    >
      <van-field
        v-model="item.value"
        is-link
        readonly
        :label="item.name"
        placeholder="请选择"
        :required="item.required"
        @click="openCalander(item.value)"
      />
      <van-popup
        v-model="dateshow"
        position="bottom"
        round
        get-container="body"
        :style="{ height: '330px' }"
      >
        <van-datetime-picker
          v-model="currentDate"
          type="datetime"
          title="选择日期时间"
          @confirm="confirmDate(index, 'datetime')"
          @cancel="dateshow = false"
        />
      </van-popup>
    </div>
    <van-field
      v-if="[CUSTOMER_PROPERTY_VALUE['mulText']].includes(item.type)"
      v-model="item.value"
      :label="item.name"
      type="textarea"
      :placeholder="`请输入${item.name}`"
      :required="item.required"
      maxlength="200"
      show-word-limit
    />
    <div
      v-if="CUSTOMER_PROPERTY_VALUE['mulRadio'] === item.type"
    >
      <van-cell :title="item.name" :required="item.required">
        <template #default>
          <van-checkbox-group v-model="item.optionValue">
            <van-checkbox
              v-for="(checkItem, checkIndex) in item.optionList"
              :key="checkIndex"
              checked-color="#6BB4AB"
              shape="square"
              :name="checkItem.id"
            >{{ checkItem.multipleValue }}</van-checkbox>
          </van-checkbox-group>
        </template>
      </van-cell>
    </div>
    <div
      v-if="CUSTOMER_PROPERTY_VALUE['singleRadio'] === item.type"
    >
      <van-cell :title="item.name" :required="item.required">
        <template #default>
          <van-radio-group v-model="item.optionValue">
            <van-radio
              v-for="(checkItem, checkIndex) in item.optionList"
              :key="checkIndex"
              checked-color="#6BB4AB"
              :name="checkItem.id"
            >{{ checkItem.multipleValue }}</van-radio>
          </van-radio-group>
        </template>
      </van-cell>
    </div>
    <div
      v-if="CUSTOMER_PROPERTY_VALUE['selectSingle'] === item.type"
    >
      <van-field
        v-if="item.type === CUSTOMER_PROPERTY_VALUE['selectSingle']"
        v-model="item.value"
        is-link
        readonly
        :label="item.name"
        :placeholder="`点击选择${ item.name }`"
        :required="item.required"
        @click="showPicker = true"
      />
      <van-popup v-model="showPicker" position="bottom" get-container="body">
        <van-picker
          show-toolbar
          :columns="columnList(item)"
          @confirm="(value) => onConfirm(value, index, item)"
          @cancel="showPicker = false"
        />
      </van-popup>
    </div>
    <div
      v-if="CUSTOMER_PROPERTY_VALUE['img'] === item.type"
      class="img-item"
    >
      <van-cell :title="item.name" :required="item.required">
        <template #default>
          <Upload
            multiple
            :file-list.sync="item.fileList"
            :show-btn="false"
            :preview-image="true"
            :upload-success="(file, data) => uploadSuccess(index, file, data, 'img')"
            :max-count="maxUploadCount"
            :custom-file-name="true"
            :accept="`${UPLOAD_ACCEPT[MEDIA_TYPE['POSTER']]}`"
            @delete="(params) => deleteImg(params, index)"
          />
        </template>
      </van-cell>
    </div>
    <div
      v-if="CUSTOMER_PROPERTY_VALUE['file'] === item.type"
      class="img-item"
    >
      <van-cell :title="item.name" :required="item.required">
        <template #default>
          <Upload
            v-if="item.value && item.value.length < maxUploadCount"
            upload-txt="点击上传"
            tip="支持上传doc、pdf等文件，且不超过20M"
            :media-type="MEDIA_TYPE['FILE']"
            :upload-success="(file, data) => uploadSuccess(index, file, data, 'file')"
            :custom-file-name="true"
          />
          <div class="file-preview">
            <div
              v-for="(fileItem, fileIndex) in item.value"
              :key="fileIndex"
              class="file-preview-item"
            >
              <FileItem
                :detail-item="{
                  mediaType: MEDIA_TYPE['FILE'],
                  title: fileItem.name,
                  url: fileItem.url
                }"
              />
              <van-icon name="cross" class="remove-icon" @click="removeFile(index, fileIndex)" />
            </div>
          </div>
        </template>
      </van-cell>
    </div>
  </div>
</template>
<script>
import Upload from '@/components/Upload.vue';
import FileItem from '@/views/chat/component/FileItem.vue';
import { CUSTOMER_PROPERTY_VALUE, MEDIA_TYPE, UPLOAD_ACCEPT } from '@/utils/constants';
import { transferTime, parseTime } from '@/utils/index';

const DEFAULT_YEAR = 1990;
const DEFAULT_DATE = new Date(DEFAULT_YEAR, 0, 1);
const MAX_UPLOAD_COUNT = 9;
const MIN_YEAR = 1970;

export default {
  name: '',
  components: { Upload, FileItem },
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    index: {
      type: Number,
      default: null
    },
    properList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      CUSTOMER_PROPERTY_VALUE,
      MEDIA_TYPE,
      UPLOAD_ACCEPT,
      currentDate: DEFAULT_DATE,
      dateshow: false,
      maxUploadCount: MAX_UPLOAD_COUNT,
      minDate: new Date(MIN_YEAR, 0, 1),
      maxDate: new Date(),
      showPicker: false
    };
  },
  created() {},
  mounted() {},
  methods: {
    openCalander(value) {
      this.dateshow = true;
      this.currentDate = new Date(value);
    },
    confirmDate(index, type) {
      const newList = [...this.properList];
      let currentDate;
      if (type === 'date') {
        currentDate = transferTime(this.currentDate);
      }
      if (type === 'datetime') {
        currentDate = parseTime(this.currentDate, '{y}-{m}-{d} {h}:{i}');
      }
      newList[index] = { ...newList[index], value: currentDate };
      this.dateshow = false;
      this.$emit('update:properList', newList);
    },
    uploadSuccess(index, file, data, type) {
      const newList = [...this.properList];
      switch (type) {
        case 'img': {
          const imgList = [...newList[index].value];
          imgList.push(data.url);
          newList[index] = { ...newList[index], value: imgList };
          break;
        }
        case 'file': {
          const fileList = [...newList[index].value];
          fileList.push({ name: file.name, url: data.url, content: file.size });
          newList[index] = { ...newList[index], value: fileList };
          break;
        }
      }
      this.$emit('update:properList', newList);
    },
    /**
     * 移除文件
     */
    removeFile(index, fileIndex) {
      const properList = [...this.properList];
      const fileList = properList[index]?.value || [];
      fileList.splice(fileIndex, 1);
      properList[index]['value'] = fileList;
      this.$emit('update:properList', properList);
    },
    /**
     * 下拉框选项值
     */
    columnList(item) {
      const list = [];
      item.optionList.map(optionItem => {
        list.push({
          text: optionItem.multipleValue,
          id: optionItem.id
        });
      });
      return list;
    },
    /**
     * 确认选择下拉框值
     */
    onConfirm(value, index, item) {
      const properList = [...this.properList];
      properList[index]['optionValue'] = value.id;
      properList[index]['value'] = value.text;
      this.$emit('update:properList', properList);
      this.showPicker = false;
    },
    /**
     * 移除图片
     */
    deleteImg(params, index) {
      const properList = [...this.properList];
      const imgList = [...properList[index]?.value] || [];
      const imgIndex = imgList.findIndex(item => item === params.url);
      if (imgIndex > -1) imgList.splice(imgIndex, 1);
      properList[index]['value'] = imgList;
      this.$emit('update:properList', properList);
    }
  }

};
</script>
<style scoped lang='less'>
.edit-property-item {
  .select-placeholder {
      text-align: left;
  }
  .file-preview {
      .file-preview-item {
          position: relative;
          margin-bottom: 5px;
          .remove-icon {
              position: absolute;
              right: 5px;
              top: 5px;
          }
          .file-item {
              border: 1px solid @borderColor;
              /deep/ .cover-img {
                  border: none;
              }
          }
      }
  }
}
</style>
