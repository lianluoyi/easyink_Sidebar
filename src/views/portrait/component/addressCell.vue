<!--
 * @Author: chenchengjie
 * @LastEditors: chenchengjie
 * @Description: 位置单元格组件
-->
<template>
  <div class="address-container">
    <div class="picker-box">
      <van-field
        class="cell-box"
        :label="item.name"
        :required="item.required"
        :value="displayText"
        placeholder="省、市、区/县、街道/镇"
        readonly
        :border="false"
        :is-link="allowManual"
        @click="handleCellClick"
      />
      <div class="address-box" @click="handleMapClick">
        <van-icon name="location-o" color="#6BB4AB" />
        <span>位置</span>
      </div>
      <van-toast id="van-toast" />
      <addressPicker :show="showPicker" :value="item.value" :district-list="districtList" @cancel="() => (showPicker = false)" @confirm="handleConfirm" />
      <mapPicker v-if="showMap" :show="showMap" :api-key="apiKey" @close="() => (showMap = false)" @cancel="() => (showMap = false)" @confirm="handleConfirm" />
    </div>
    <div class="picker-box detail-search-box">
      <van-field
        class="cell-box"
        :value="item.value?.detailAddress"
        placeholder="详细地址"
        readonly
        :border="false"
        :is-link="allowManual"
        @click="handleDetailClick"
      />
      <detailAddressSearch v-if="showDetailPicker" :show="showDetailPicker" :detail-address="item.value?.detailAddress" :item="item" @confirm="handleDetailConfirm" @cancel="() => (showDetailPicker = false)" />
    </div>
  </div>

</template>

<script>
import addressPicker from './addressPicker.vue';
import mapPicker from './mapPicker.vue';
import detailAddressSearch from './detailAddressSearch.vue';
import { Toast } from 'vant';
import { getRegeocode } from '@/api/map';
const TIME_OUT = 8000;
export default {
  name: 'AddressCell',
  components: {
    addressPicker,
    mapPicker,
    detailAddressSearch
  },
  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    districtList: {
      type: Array,
      default: () => []
    },
    apiKey: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showPicker: false,
      showMap: false,
      showDetailPicker: false
    };
  },
  computed: {
    displayText() {
      if (!this.item.value) return '';
      if (typeof this.item.value === 'string') return this.item.value;
      let text = '';
      // 对省市区街道去重，避免直辖市重复显示
      const data = [...new Set([this.item.value.province, this.item.value.city, this.item.value.area, this.item.value.town])];
      data
        .filter(item => item !== '暂不选择')
        .filter(Boolean)
        .forEach(item => {
          text += `${item}-`;
        });
      return text.slice(0, -1);
    },
    allowManual() {
      if (!this.item.extra) return false;
      const extra = JSON.parse(this.item.extra) || {};
      return extra?.allowManual;
    }
  },
  methods: {
    handleMapClick() {
      if (!this.apiKey) {
        Toast({ type: 'fail', message: '请联系运维人员配置地图api', className: 'map-toast', getContainer: () => document.querySelector('.address-container') });
        return;
      }
      // 不允许手动，点击则自动填入地址(获取当前坐标,逆地址解析出地址)
      if (!this.allowManual) {
        Toast.loading({
          forbidClick: true
        });
        // eslint-disable-next-line no-undef
        const geolocation = new qq.maps.Geolocation(this.apiKey, 'myapp');
        geolocation.getLocation(
          (position) => {
            getRegeocode({
              location: `${position.lat},${position.lng}`,
              corpId: this.$store.state.corpId
            }).then((res) => {
              const { address_component, address_reference, formatted_addresses } = res.data.result;
              const payload = {
                street: {
                  id: address_reference.town.id,
                  fullname: address_reference.town.title,
                  location: { lat: position.lat, lng: position.lng }
                },
                province: {
                  fullname: address_component.province
                },
                city: {
                  fullname: address_component.city
                },
                district: {
                  fullname: address_component.district
                },
                detailAddress: formatted_addresses.recommend
              };
              this.handleConfirm(payload);
              Toast.clear();
            });
          },
          () => {
            Toast.clear();
          },
          {
            timeout: TIME_OUT
          }
        );
        return;
      }
      this.showMap = true;
    },
    handleCellClick() {
      if (!this.allowManual) {
        Toast('当前字段不允许手动修改');
        return;
      }
      this.showPicker = true;
    },
    handleDetailClick() {
      if (!this.allowManual) {
        Toast('当前字段不允许手动修改');
        return;
      }
      this.showDetailPicker = true;
    },
    /**
       * 确认选择地址
       * @param {Object} e 地址信息
       * @param {boolean} isChanged 是否变更省市区，若变更则清空详细地址
       */
    handleConfirm(e, isChanged = false) {
      this.showPicker = false;
      if (!e) {
        this.$emit('input', {});
        return;
      }
      // adCode和location从第四级区划开始取，若没有值（选择'其他区'）则逐级往上取值
      const payload = {
        ...this.item.value,
        adCode: e.street?.id || e.district?.id || e.city?.id || e.province?.id,
        province: e.province.fullname,
        city: e.city.fullname,
        area: e.district.fullname,
        town: e.street?.fullname || '',
        location: e.street?.location || e.district?.location || e.city?.location || e.provice?.location,
        detailAddress: isChanged ? '' : e?.detailAddress || this.item.value?.detailAddress
      };
      this.$emit('input', payload);
    },
    handleDetailConfirm(e) {
      this.showDetailPicker = false;
      const payload = {
        ...this.item.value,
        adCode: e.adcode,
        province: e.province,
        city: e.city,
        area: e.area,
        town: e.town,
        location: e.location,
        detailAddress: e?.detailAddress
      };
      this.$emit('input', payload);
    }
  }
};
</script>

<style lang="less" scoped>
.picker-box {
  display: flex;
  align-items: center;
  width: 100%;
  .cell-box {
    width: calc(100% - 58px);
    :deep(.van-field__control) {
      font-size: 12px;
      color: #101010;
      &::placeholder {
        color: #c0c4cc;
      }
    }
  }
  :deep(.van-field) {
    padding: 5px 0 5px 16px;
  }
}
.detail-search-box {
    width: calc(100vw - 24px);
    margin-left: 74px;
}

.address-box {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6BB4AB;
  border-left: 1px solid #bbbbbb;
  font-size: 12px;
  height: 24px;
  padding-left: 5px;
  margin-left: 5px;
  cursor: pointer;
}

.intwoline {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  -ms-text-overflow: ellipsis;
  text-overflow: ellipsis;
}
/deep/.van-toast.map-toast {
  width: 100px;
  height: 100px;
}
</style>
