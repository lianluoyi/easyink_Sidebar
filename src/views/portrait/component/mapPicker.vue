<!--
 * @Author: chenchengjie
 * @LastEditors: chenchengjie
 * @Description: 地图选取位置组件
-->
<template>
  <van-popup v-model="show" position="bottom">
    <div class="popup-container">
      <!-- 顶部按钮 -->
      <div class="picker-header">
        <span class="cancel-btn" @click="closePopup">取消</span>
        <span class="header-title">请选择所在地区</span>
        <span class="confirm-btn" @click="confirmSelect">确认</span>
      </div>
      <iframe
        id="mapPage"
        width="100%"
        height="100%"
        frameborder="0"
        allow="geolocation"
        :src="
          `https://apis.map.qq.com/tools/locpicker?search=1&type=1&key=${apiKey}&referer=myapp${
            selectedLocation ? '&coord=' + centerCoord : ''
          }`
        "
      />
      <van-loading
        v-if="loading"
        type="spinner"
        color="#1990ff"
        class="loading"
      />
    </div>
  </van-popup>
</template>
<script>
import { getRegeocode } from '@/api/map';
import { SPECIAL_REGION } from '@/utils/constants';
const TIME_OUT = 8000;
export default {
  name: 'MapPicker',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      default: () => ({})
    },
    apiKey: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      selectedLocation: null,
      loading: false,
      centerCoord: null
    };
  },
  created() {
    this.getLocation();
  },
  mounted() {
    window.addEventListener(
      'message',
      event => {
        // 接收位置信息，用户选择确认位置点后选点组件会触发该事件，回传用户的位置信息
        var loc = event.data;
        if (loc && loc.module === 'locationPicker') {
          // 防止其他应用也会向该页面post信息，需判断module是否为'locationPicker'
          this.selectedLocation = loc;
        }
      },
      false
    );
  },
  methods: {
    getLocation() {
      this.loading = true;
      // eslint-disable-next-line no-undef
      const geolocation = new qq.maps.Geolocation(this.apiKey, 'myapp');
      geolocation.getLocation(
        position => {
          // 将获取到的位置设置为选中位置
          this.selectedLocation = {
            module: 'locationPicker',
            latlng: {
              lat: position.lat,
              lng: position.lng
            }
          };
          this.centerCoord = `${position.lat},${position.lng}`;
          this.loading = false;
        },
        () => {
          this.loading = false;
        },
        {
          timeout: TIME_OUT
        }
      );
    },
    closePopup() {
      this.$emit('close');
    },
    confirmSelect() {
      if (!this.selectedLocation.poiname) {
        this.$toast('请选择地址');
        return;
      }
      const { lat, lng } = this.selectedLocation.latlng;
      getRegeocode({
        location: `${lat},${lng}`,
        corpId: this.$store.state.corpId
      }).then(res => {
        const { address_component, address_reference, ad_info } = res.data.result;
        // 港澳台不需要设置街道/镇
        const street = SPECIAL_REGION.includes(address_component.province) ? null : {
          id: address_reference.town.id,
          fullname: address_reference.town.title,
          location: { lat, lng }
        };
        const payload = {
          street,
          province: {
            fullname: address_component.province
          },
          city: {
            fullname: address_component.city
          },
          district: {
            id: ad_info.adcode,
            fullname: address_component.district,
            location: { lat, lng }
          },
          detailAddress: this.selectedLocation.poiname
        };
        this.$emit('confirm', payload);
        this.$emit('close');
      });
    }
  }
};
</script>
<style lang="less" scoped>
.popup-container {
  background-color: #fff;
  border-radius: 10px 10px 0 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  .picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 15px;
    font-size: 16px;
    background: #f7f7f9;
    flex-shrink: 0;
    .cancel-btn {
      color: #8f8f91;
      padding: 5px 10px;
    }

    .confirm-btn {
      color: #1990ff;
      padding: 5px 10px;
    }
  }
  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
