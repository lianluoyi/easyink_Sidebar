<!--
 * @Description: 客户资料详情页
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="customer-info-div">
    <van-cell-group class="property-list">
      <van-cell title="备注" :value="formData.remark" :border="false" />
      <van-cell v-for="(item, index) in customList" :key="index" :title="item.name" :border="false">
        <template #default>
          <div
            v-if="[CUSTOMER_PROPERTY_VALUE['sysField'],
                   CUSTOMER_PROPERTY_VALUE['singleText'],
                   CUSTOMER_PROPERTY_VALUE['mulText'],
                   CUSTOMER_PROPERTY_VALUE['dateField'],
                   CUSTOMER_PROPERTY_VALUE['singleRadio'],
                   CUSTOMER_PROPERTY_VALUE['selectSingle']].includes(item.type)"
          >
            {{ item.value }}
          </div>
          <div
            v-if="CUSTOMER_PROPERTY_VALUE['mulRadio'] === item.type"
          >
            <van-tag
              v-for="(tagItem, tagIndex) in item.value"
              :key="tagIndex"
              plain
              class="orange-tag-item"
            >{{ tagItem }}
            </van-tag>
          </div>
          <div
            v-if="CUSTOMER_PROPERTY_VALUE['img'] === item.type && item.value && item.value.length > 0"
            class="img-item"
          >
            <van-image
              v-for="(imgItem, imgIndex) in item.value"
              :key="imgIndex"
              width="70"
              height="70"
              fit="cover"
              :src="imgItem"
              @click="() => onPreviewImg(item.value, imgIndex)"
            />
          </div>
          <div
            v-if="CUSTOMER_PROPERTY_VALUE['file'] === item.type"
            class="file-item"
          >
            <div
              v-for="(fileItem, fileIndex) in item.value"
              :key="fileIndex"
              :class="`toe${isMac() ? ' customer-file-copy' : ''}`"
              :data-clipboard-text="fileItem.url"
              @click="() => onDownloadFile(fileItem)"
            >{{ fileItem.name }}</div>
          </div>
        </template>
      </van-cell>
    </van-cell-group>
    <div v-if="enableSideBar" class="transfer-circle" @click="onTransfer">
      <i class="iconfont icon-transfer" />
    </div>
    <div class="edit-circle" @click="onEdit">
      <i class="iconfont icon-edit" />
    </div>
    <EditCustomerDetail
      :show.sync="showEdit"
      :list.sync="customList"
      :remark.sync="formData.remark"
      :user-info="userInfo"
      @getCustomerInfo="getCustomerInfo"
    />
    <TransferCustomer
      :show.sync="showTransfer"
      :user-info="userInfo"
    />
  </div>
</template>
<script>
import { CUSTOMER_PROPERTY_VALUE } from '@/utils/constants';
import { getTransferConfig } from '@/api/transfer';
import { dealShowText, dealAllDeviceDownload, isMac } from '@/utils/index';
import { ImagePreview } from 'vant';
import moment from 'moment';
import EditCustomerDetail from './editCustomerDetail.vue';
import TransferCustomer from './transferCustomer';
import ClipboardJS from 'clipboard';

export default {
  name: '',
  components: { EditCustomerDetail, TransferCustomer },
  props: {
    formData: {
      type: Object,
      default: () => {}
    },
    userInfo: {
      type: Object,
      default: () => {}
    },
    getCustomerInfo: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      // 自定义信息字段
      customList: [],
      CUSTOMER_PROPERTY_VALUE,
      showEdit: false,
      showTransfer: false,
      enableSideBar: false
    };
  },
  computed: {
    // 自定义字段
    baseCustomPropertyList() {
      const list = [...this.$store.state.customerProperty.customerProperList];
      return list;
    },
    listenChange() {
      return {
        list: this.$store.state.customerProperty.customerProperList,
        detail: this.formData
      };
    },
    userId() {
      return this.$store.state.userId;
    }
  },
  watch: {
    // 监听客户资料和自定义字段变化
    listenChange(val) {
      this.dealPropertyList(this.formData);
    },
    userId(val) {
      if (val) {
        getTransferConfig().then(({ data: { enableSideBar }}) => {
          this.enableSideBar = enableSideBar;
        });
      }
    }
  },
  created() {},
  mounted() {
    this.clipboard = new ClipboardJS('.customer-file-copy');
    this.clipboard.on('success', (e) => {
      this.$toast('已复制,请前往浏览器地址栏按 command+V 打开下载');
    });
    this.clipboard.on('error', (e) => {
      this.$toast('文件路径复制失败');
    });
  },
  methods: {
    /**
     * 处理所有字段列表数据
     */
    dealPropertyList(customerInfo) {
      const customList = [];
      // 处理自定义字段显示内容
      this.baseCustomPropertyList.map(customItem => {
        let newItem = { ...customItem };
        switch (customItem.id) {
          case 'remark': {
            newItem.value = customerInfo.remark;
            break;
          }
        }
        switch (customItem.name) {
          case '年龄': {
            const day = moment().diff(moment(customerInfo.birthday), 'years');
            newItem.value = day || 0;
            break;
          }
          case '出生日期': {
            newItem.value = customerInfo.birthday;
            break;
          }
          case '邮箱': {
            newItem.value = customerInfo && customerInfo.email;
            break;
          }
          case '地址': {
            newItem.value = customerInfo && customerInfo.address;
            break;
          }
          case '电话': {
            newItem.value = customerInfo.remarkMobiles;
            break;
          }
          case '描述': {
            newItem.value = customerInfo.description;
            break;
          }
        }
        newItem = this.dealCustomProper(customItem, customerInfo, newItem);
        customList.push(newItem);
      });
      this.customList = [...customList];
    },
    dealCustomProper(customItem, customerInfo, item) {
      let newItem = { ...item };
      switch (customItem.type) {
        case CUSTOMER_PROPERTY_VALUE['singleText']:
        case CUSTOMER_PROPERTY_VALUE['mulText']:
        case CUSTOMER_PROPERTY_VALUE['dateField']: {
          newItem.value = this.dealShowText(customItem, customerInfo, 'textType') && this.dealShowText(customItem, customerInfo, 'textType').value;
          break;
        }
        case CUSTOMER_PROPERTY_VALUE['singleRadio']:
        case CUSTOMER_PROPERTY_VALUE['selectSingle']: {
          const dealObj = this.dealShowText(customItem, customerInfo, 'singleType');
          newItem = {
            ...newItem,
            optionList: customItem.optionList,
            optionValue: null,
            ...dealObj
          };
          break;
        }
        case CUSTOMER_PROPERTY_VALUE['mulRadio']: {
          const dealObj = this.dealShowText(customItem, customerInfo, 'mulType');
          newItem = {
            ...newItem,
            optionList: customItem.optionList,
            optionValue: [],
            ...dealObj
          };
          break;
        }
        case CUSTOMER_PROPERTY_VALUE['img']:
        case CUSTOMER_PROPERTY_VALUE['file']: {
          const dealObj = this.dealShowText(customItem, customerInfo, customItem.type === CUSTOMER_PROPERTY_VALUE['img'] ? 'imgFile' : 'fileType');
          newItem = {
            ...newItem,
            ...dealObj
          };
          break;
        }
      }
      return newItem;
    },
    /**
     * 处理自定义字段显示内容
     */
    dealShowText(colunmItem, row, type) {
      return dealShowText(colunmItem, row, type);
    },
    /**
     * 预览图片
     */
    onPreviewImg(url, imgIndex) {
      ImagePreview({
        images: url,
        startPosition: imgIndex
      });
    },
    /**
     * 文件预览
     */
    onDownloadFile(item) {
      dealAllDeviceDownload(item.url, item.name, item.content, this);
    },
    /**
     * 编辑客户资料
     */
    onEdit() {
      this.showEdit = true;
    },
    onTransfer() {
      this.showTransfer = true;
    },
    isMac() {
      return isMac();
    }
  }

};
</script>
<style scoped lang='less'>
.customer-info-div {
  background-color: #fff;
    .property-list {
        font-size: 12px;
        /deep/ .van-cell {
            display: flex;
            padding: 5px 16px;
            .van-cell__title {
                max-width: 76px;
                flex: initial;
                margin-right: 5px;
                font-size: 12px;
                color: #9C9C9C;
            }
            .van-cell__value {
                flex: 1;
                font-size: 12px;
                color: @black;
            }
        }
        .img-item {
            cursor: pointer;
            /deep/ .van-image {
                margin-left: 5px;
            }
        }
        .file-item {
            color: #377AFF;
            font-size: 12px;
            cursor: pointer;
        }
    }
    .edit-circle {
      height: 40px;
      width: 40px;
      background-color: @green;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      cursor: pointer;
    }
    .transfer-circle {
      height: 40px;
      width: 40px;
      background-color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: @green;
      border: 1px solid #6BB4AB;
      cursor: pointer;
    }
}
</style>
