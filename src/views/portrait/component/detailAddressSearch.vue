<!--
 * @Author: chenchengjie
 * @LastEditors: chenchengjie
 * @Description: 详细地址搜索页面
-->
<template>
  <van-popup v-model="show" position="bottom" :close-on-click-overlay="false">
    <div class="container">
      <div class="textarea-wrapper">
        <van-field
          v-model="inputValue"
          type="textarea"
          rows="3"
          placeholder="请输入详细地址"
          maxlength="48"
          class="address-textarea"
          @input="handleSearch"
        />
        <div class="button-group">
          <van-button
            size="small"
            class="clear-btn"
            @click="clearInput"
          >{{ inputValue ? '清空' : '取消' }}</van-button>
          <van-button
            size="small"
            type="primary"
            class="confirm-btn"
            @click="confirmAddress"
          >确认</van-button>
        </div>
      </div>
      <van-toast ref="toast" />
      <!-- 搜索结果列表 -->
      <div
        class="search-list"
        @scroll="handleScroll"
      >
        <div
          v-for="(data, index) in searchResults"
          :key="index"
          class="search-item"
          @click="selectAddress(data)"
        >
          <van-icon
            name="location-o"
            color="#1990ff"
            style="margin-right: 5px"
          />
          <div>
            <span class="address-name">{{ data.title }}</span>
            <span class="address-detail">{{ data.address }}</span>
          </div>
        </div>
        <div v-if="isLoading" class="load-more">
          <van-loading type="spinner" />
        </div>
        <div v-if="loadAll" class="load-more">
          <span class="load-all-text">已经到底了</span>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script>
import { getAddressByKeyword, getRegeocode } from '@/api/map';
import { Toast } from 'vant';
import { SPECIAL_REGION } from '@/utils/constants';

const STATUS_SUCCESS = 0; // 搜索响应正常code
const PAGE_SIZE = 20; // 每页数量
const DEBOUNCE_DELAY = 500; // 防抖延迟时间
const SCROLL_HEIGHT = 50; // 滚动单元高度
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    item: {
      type: Object,
      default: () => ({})
    },
    detailAddress: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      inputValue: '',
      searchResults: [],
      searchTimer: null,
      formData: {},
      count: 0, // 搜索结果总数，用于判断是否还有下一页
      currentPage: 1, // 当前页码
      pageSize: PAGE_SIZE,
      isLoading: false, // 是否正在加载
      loadAll: false, // 是否已加载全部
      currentKeyword: '' // 当前搜索关键词
    };
  },
  watch: {
    show: {
      handler() {
        this.inputValue = this.detailAddress;
      },
      immediate: true
    }
  },
  methods: {
    // 处理搜索
    handleSearch() {
      // 防抖处理
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }

      this.searchTimer = setTimeout(() => {
        if (this.inputValue.trim()) {
          this.currentPage = 1;
          this.searchResults = [];
          this.loadAll = false;
          this.currentKeyword = this.inputValue;
          this.searchAddress(this.inputValue);
        } else {
          this.searchResults = [];
          this.loadAll = false;
        }
      }, DEBOUNCE_DELAY);
    },

    // 处理滚动加载
    handleScroll(e) {
      const { scrollHeight, scrollTop, clientHeight } = e.target;
      if (scrollHeight - scrollTop - clientHeight < SCROLL_HEIGHT) {
        this.loadMore();
      }
    },

    // 搜索地址
    async searchAddress(keyword) {
      // 没有选择省市区，只输入详细地址时，不进行远程搜索
      if (!this.item.value.location) {
        this.searchResults = [];
        return;
      }
      if (this.isLoading) return;
      this.isLoading = true;
      const { lat, lng } = this.item.value.location;
      try {
        const res = await getAddressByKeyword({
          keyword: keyword.trim(),
          corpId: this.$store.state.corpId,
          location: `${lat},${lng}`,
          pageIndex: this.currentPage,
          pageSize: this.pageSize
        });
        if (res.data.status === STATUS_SUCCESS) {
          if (this.currentPage === 1) {
            this.searchResults = res.data.data;
          } else {
            this.searchResults = [...this.searchResults, ...res.data.data];
          }
          this.count = res.data.count;

          // 判断是否已加载全部
          if (this.searchResults.length >= this.count) {
            this.loadAll = true;
          }
        }
      } catch (error) {
        console.error('搜索地址失败:', error);
        Toast('搜索失败');
      } finally {
        this.isLoading = false;
      }
    },

    // 加载更多
    loadMore() {
      if (this.isLoading || this.loadAll) return;

      if (this.searchResults.length < this.count) {
        this.currentPage++;
        this.searchAddress(this.currentKeyword);
      } else {
        this.loadAll = true;
      }
    },

    // 选择地址
    async selectAddress(item) {
      // 地址api调用失败，支持手动填入
      if (!item.location) {
        this.$emit('confirm', {
          ...this.item.value,
          detailAddress: item.title
        });
        return;
      }
      if (SPECIAL_REGION.includes(item.province)) {
        // 港澳台不获取第四级区划
        this.$emit('confirm', {
          ...item,
          province: item.province,
          city: item.city,
          area: item.district,
          detailAddress: item.title
        });
        return;
      }
      // 获取选择地址的第四级区划
      const res = await getRegeocode({
        location: `${item.location.lat},${item.location.lng}`,
        corpId: this.$store.state.corpId
      });
      const { address_reference } = res.data.result;
      this.$emit('confirm', {
        ...item,
        province: item.province,
        city: item.city,
        area: item.district,
        town: address_reference.town.title,
        detailAddress: item.title,
        location: item.location
      });
    },

    // 清空输入
    clearInput() {
      if (this.inputValue) {
        this.inputValue = '';
        this.searchResults = [];
      } else {
        this.$emit('cancel');
      }
    },

    // 确认地址
    confirmAddress() {
      if (this.inputValue === this.detailAddress) {
        this.$emit('cancel');
        return;
      }
      this.selectAddress(this.searchResults?.[0] || { title: this.inputValue });
    }
  }
};
</script>

<style scoped>
.container {
  padding: 10px;
  background: #fff;
}
.textarea-wrapper {
  position: relative;
}
.address-textarea {
  margin-top: 10px;
  border-radius: 7px;
  border: 1px solid #dcdfe6;
}
.button-group {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
  gap: 10px;
}
.clear-btn,
.confirm-btn {
  padding: 0 10px;
  height: 22px;
  line-height: 22px;
  font-size: 12px;
  border-radius: 5px;
}
.confirm-btn {
  background-color: #6BB4AB;
}
.clear-btn {
  border-color: #dcdfe6;
}
.search-list {
  margin-top: 20px;
  height: 368px;
  overflow-y: auto;
}
.empty-list {
  margin-top: 20px;
  color: #999;
  text-align: center;
}
.search-item {
  padding: 10px;
  border-top: 1px solid #dcdfe6;
}
.search-item:last-child {
  border-bottom: 1px solid #dcdfe6;
}
.search-item {
  display: flex;
  align-items: center;
}
.address-name {
  font-size: 14px;
  color: #333;
  display: block;
  line-height: 20px;
}
.address-detail {
  font-size: 12px;
  color: #c0c4cc;
  display: block;
  line-height: 15px;
}
.load-more {
  text-align: center;
  padding: 15px 0;
}
.load-all-text {
  color: #999;
  font-size: 12px;
}
</style>
