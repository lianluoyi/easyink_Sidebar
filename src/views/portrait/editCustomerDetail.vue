<template>
  <van-popup v-model="show" class="edit-customer-detail">
    <div class="top-container">
      <div class="header-container">
        <div class="go-back">
          <van-icon name="revoke" size="18" @click="goBack" />
          <span>返回</span>
        </div>
      </div>
      <div class="content-container">
        <van-cell-group class="edit-property-list">
          <van-field v-model="formRemark" label="备注" placeholder="请输入备注名" maxlength="20" show-word-limit :border="false" />
          <div v-for="(item, index) in properList" :key="index">
            <EditCustomerPropertyItem :item.sync="item" :index="index" :proper-list.sync="properList" />
          </div>
        </van-cell-group>
      </div>
    </div>
    <div class="footer-container">
      <van-button class="save-btn" color="#6BB4AB" size="normal" round type="primary" @click="handleSubmit">
        保存
      </van-button>
    </div>
  </van-popup>
</template>
<script>
import { CUSTOMER_PROPERTY_VALUE } from '@/utils/constants';
import { updateCustomerDetail } from '@/api/customer';
import { deepClone } from '@/utils/index';
import { isEqual } from 'lodash';
import EditCustomerPropertyItem from './component/editCustomerPropertyItem.vue';

const fieldObj = {
  '出生日期': 'birthday',
  '邮箱': 'email',
  '地址': 'address',
  '描述': 'description',
  '电话': 'remarkMobiles'
};

const ALL_CUSTOM_TYPE = [
  CUSTOMER_PROPERTY_VALUE['singleText'],
  CUSTOMER_PROPERTY_VALUE['mulText'],
  CUSTOMER_PROPERTY_VALUE['singleRadio'],
  CUSTOMER_PROPERTY_VALUE['mulRadio'],
  CUSTOMER_PROPERTY_VALUE['selectSingle'],
  CUSTOMER_PROPERTY_VALUE['dateField'],
  CUSTOMER_PROPERTY_VALUE['img'],
  CUSTOMER_PROPERTY_VALUE['file']
];

export default {
  name: '',
  components: { EditCustomerPropertyItem },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default: () => []
    },
    userInfo: {
      type: Object,
      default: () => {}
    },
    remark: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      properList: [],
      oldProperList: [],
      oldRemark: ''
    };
  },
  computed: {
    formRemark: {
      get() {
        return this.remark;
      },
      set(val) {
        this.$emit('update:remark', val);
      }
    }
  },
  watch: {
    list(val) {
      this.properList = [...val];
      this.oldProperList = deepClone(val);
      this.oldRemark = this.remark;
    }
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * 返回
     */
    goBack() {
      this.$emit('update:show', false);
    },
    /**
     * 更新客户信息
     */
    updateCustomer(params, callback) {
      const data = {
        externalUserid: this.userInfo.externalUserid,
        userId: this.userInfo.userId,
        ...params
      };
      updateCustomerDetail(data).then((response) => {
        this.$toast('操作成功');
        this.$emit('getCustomerInfo');
        callback && callback();
      });
    },
    /**
     * 过滤出有更新的字段
     */
    filterDuplicateItem(list, oldList) {
      const newList = [];
      list.map(newItem => {
        let type = 'value';
        if ([CUSTOMER_PROPERTY_VALUE['mulRadio'],
          CUSTOMER_PROPERTY_VALUE['selectSingle'],
          CUSTOMER_PROPERTY_VALUE['singleRadio']].includes(newItem.type)) {
          type = 'optionValue';
        }
        const oldIndex = oldList.findIndex(oldItem => oldItem.id === newItem.id);
        if (oldIndex > -1 && (!isEqual(newItem[type], oldList[oldIndex][type]) &&
         !(newItem[type] === '' && oldList[oldIndex][type] === null))) {
          newList.push(newItem);
        }
      });
      return newList;
    },
    /**
     * 保存客户资料
     */
    handleSubmit() {
      const allList = [...this.properList];
      const requiredIndex = allList.findIndex(item => {
        if ([CUSTOMER_PROPERTY_VALUE['img'], CUSTOMER_PROPERTY_VALUE['file'], CUSTOMER_PROPERTY_VALUE['mulRadio']].includes(item.type)) {
          return item.required && ((item.value && !item.value.length) && (item && item.optionValue && !item.optionValue.length));
        } else {
          return item.required && (!item.value && !item.optionValue);
        }
      });

      if (requiredIndex > -1) {
        this.$toast(`请填写${allList[requiredIndex].name}`);
        return;
      }
      const params = {};

      let extendProperties = [];
      const newProperList = this.filterDuplicateItem(this.properList, this.oldProperList);
      if (this.oldRemark !== this.formRemark) params['remark'] = this.formRemark;
      newProperList.map(item => {
        if (item.id === 'remark') params[item.id] = item.value;
        if (fieldObj[item.name]) {
          params[fieldObj[item.name]] = item.value || '';
        }
        extendProperties = this.dealCustomProperList(item, extendProperties);
      });
      if (extendProperties.length > 0) params['extendProperties'] = extendProperties;
      this.updateCustomer(params, this.goBack);
    },
    dealCustomProperList(item, extendProperties) {
      const newExtendProperties = [...extendProperties];
      if (ALL_CUSTOM_TYPE.includes(item.type)) {
        switch (item.type) {
          case CUSTOMER_PROPERTY_VALUE['mulRadio']: {
            if (item.optionValue.length === 0) {
              newExtendProperties.push({
                extendPropertyId: item.id,
                propertyValue: null
              });
              break;
            }
            item.optionValue.map(optionItem => {
              newExtendProperties.push({
                extendPropertyId: item.id,
                propertyValue: optionItem
              });
            });
            break;
          }
          case CUSTOMER_PROPERTY_VALUE['img']:
          case CUSTOMER_PROPERTY_VALUE['file']: {
            if (item.value.length === 0) {
              newExtendProperties.push({
                extendPropertyId: item.id,
                propertyValue: null
              });
              break;
            }
            item.value.map(optionItem => {
              newExtendProperties.push({
                extendPropertyId: item.id,
                propertyValue: item.type === CUSTOMER_PROPERTY_VALUE['file'] ? `{"name":"${optionItem.name}","url":"${optionItem.url}","content":"${optionItem.content}"}` : optionItem
              });
            });
            break;
          }
          case CUSTOMER_PROPERTY_VALUE['selectSingle']:
          case CUSTOMER_PROPERTY_VALUE['singleRadio']: {
            if (item.optionValue) {
              newExtendProperties.push({
                extendPropertyId: item.id,
                propertyValue: item.optionValue || null
              });
            }
            break;
          }
          default: {
            newExtendProperties.push({
              extendPropertyId: item.id,
              propertyValue: item.value || ''
            });
            break;
          }
        }
      }
      return newExtendProperties;
    }
  }

};
</script>
<style scoped lang='less'>
.edit-customer-detail {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    .top-container {
      flex: 1;
      overflow: auto;
    }
    .header-container {
        height: 36px;
        display: flex;
        align-items: center;
        padding: 0 10px;
        border-bottom: 1px solid #eee;
        justify-content: space-between;
        .go-back {
            display: flex;
            align-items: center;
        }
        .van-icon-revoke {
            margin-right: 10px;
            cursor: pointer;
        }
        .save-btn {
            color: @green;
            cursor: pointer;
        }
    }
    .content-container {
        /deep/ .van-cell-group {
            .van-cell {
                .van-cell__title {
                    max-width: 63px;
                    margin-right: 10px;
                }
                .van-cell__value {
                    text-align: left;
                    .van-checkbox-group, .van-radio-group {
                        display: flex;
                        flex-wrap: wrap;
                        .van-checkbox, .van-radio {
                            margin: 0 13px 10px 0;
                        }
                    }
                }
            }
        }
    }
    .footer-container {
      height: 48px;
      box-shadow: 1px -2px 4px -3px rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      padding: 10px;
      position: relative;
      bottom: 0;
      .save-btn {
          width: 60px;
          height: 28px;
          position: absolute;
          right: 10px;
      }
    }
}
</style>
