<!--
 * @Description: 素材库
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<script>
import { getTypeList } from '@/api/chat';
import List from './List';
const MATERIAL_TYPE = 'material';
const WORDS_TYPE = 'words';
export default {
  components: { List },
  props: {},
  data() {
    return {
      keyword: '',
      active: 0,
      list: [],
      loading: false,
      finished: false,
      show: false,
      // 已选择的标签列表
      selectedTagList: [],
      // 搜索用的标签列表
      searchTagList: [],
      // 已选择的标签ids
      selectedTagIds: '',
      // 标签筛选关键词
      tagSearch: '',
      MATERIAL_TYPE,
      WORDS_TYPE
      // userId: this.$store.state.userId,
    };
  },
  computed: {
    userId() {
      return this.$store.state.userId;
    },
    corpId() {
      return this.$store.state.corpId;
    },
    allTagList() {
      const allTagObj = this.$store.state.materialInfo && this.$store.state.materialInfo.allTagObj;
      const allTagList = Object.values(allTagObj);
      return allTagList;
    },
    /**
         * 处理筛选后的标签列表
         */
    showTagList() {
      let list = [...this.allTagList];
      list = list.filter(item => item.tagName.includes(this.tagSearch));
      return list;
    },
    /**
         * 素材类型object，已mediaType为key
         */
    tabObj() {
      const obj = {};
      const newList = [...this.list];
      newList.map(item => {
        obj[item.mediaType] = item.name;
      });
      return obj;
    }
  },
  watch: {
  },
  beforeCreate() {},
  created() {
    // this.$toast('userId:' + this.$store.state.userId)
    if (this.list.length === 0) this.getList();
    const allTagObj = this.$store.state.materialInfo && this.$store.state.materialInfo.allTagObj;
    const allTagList = Object.values(allTagObj);
    if (allTagList.length === 0) {
      this.$store.dispatch('GetMaterialTag');
    }
  },
  mounted() {},
  methods: {
    getList() {
      getTypeList({}).then(({ rows, total }) => {
        let newList = [{ name: '全部', mediaType: null }];
        newList = newList.concat([...rows]);
        this.list = newList;
      });
    },
    search(e, params = {}) {
      const newParams = {
        tagIds: this.selectedTagIds,
        ...params
      };
      const listName = 'list' + this.active;
      this.$refs[listName] && this.$refs[listName][0].getList(1, newParams);
    },
    add() {},
    // 点击标签筛选弹窗
    openFilter() {
      this.selectedTagList = [...this.searchTagList];
      this.show = true;
    },
    // 选中标签
    selectTag(item) {
      const list = [...this.selectedTagList];
      list.push(item);
      this.selectedTagList = list;
    },
    // 标签是否被选中
    onChecked(item) {
      return this.selectedTagList.findIndex(tagItem => tagItem.id === item.id) > -1;
    },
    // 重置
    resetQuery() {
      this.show = false;
      this.selectedTagList = [];
      this.searchTagList = [];
      this.search();
    },
    // 点击标签选择弹窗的搜索
    onSearch() {
      this.show = false;
      // 确定搜索的标签列表
      this.searchTagList = [...this.selectedTagList];
      this.searchByTag(this.selectedTagList);
    },
    searchByTag(tagList) {
      // 处理标签ids
      this.selectedTagIds = this.dealTaglistIds(tagList);
      this.search(1);
    },
    dealTaglistIds(list) {
      const newList = [];
      list.map(item => {
        newList.push(item.id);
      });
      return newList.join(',');
    },
    removeTag(id) {
      this.searchTagList = this.removeItem(id, this.searchTagList);
      this.searchByTag(this.searchTagList);
    },
    removeItem(id) {
      const list = [...this.searchTagList];
      const index = list.findIndex(item => item.id === id);
      if (index > -1) {
        list.splice(index, 1);
      }
      return list;
    },
    /**
         * 切换素材类别
         */
    changeTab(e) {
      this.search();
    }
  }
};
</script>

<template>
  <div class="chat-div">
    <div class="search-div">
      <van-search
        v-model="keyword"
        class="search-input"
        placeholder="请输入搜索关键词，回车搜索"
        @search="search"
      >
        <!-- <template #action>
        <van-icon name="plus" @click="add" />
      </template> -->
      </van-search>
      <div id="search-input" class="filter-tool" @click="openFilter">
        <span>筛选</span>
        <van-icon name="filter-o" />
      </div>
    </div>
    <van-tabs v-model="active" class="tab-div" color="#6BB4AB" title-active-color="#6BB4AB" @change="changeTab">
      <van-popup v-model="show" class="tag-popover-div" position="top">
        <div>
          <div class="popover-title">素材标签</div>
          <div class="content-container">
            <div class="tag-list-search">
              <van-search
                v-model="tagSearch"
                class="search-tag-keyword"
                placeholder="请输入搜索关键词"
              />
            </div>
            <div class="tag-list-div">
              <template v-for="tagItem in showTagList">
                <van-tag v-if="tagItem.tagName" :key="tagItem.id" plain :class="'tag-item' + (onChecked(tagItem) ? ' selected' : '')" @click="() => selectTag(tagItem)">{{ tagItem.tagName }}</van-tag>
              </template>
            </div>
            <div class="btn-div">
              <van-button class="btn-item" plain round size="small" @click="resetQuery">重置</van-button>
              <van-button class="btn-item confirm-btn" type="primary" round size="small" @click="onSearch">确定</van-button>
            </div>
          </div>
        </div>
      </van-popup>
      <!-- <van-tab v-if="!!userId" title="我的">
        <List ref="list0" :userId="userId" :keyword="keyword"></List>
      </van-tab> -->
      <van-tab
        v-for="(item, index) in list"
        :key="index"
        :title="item.name"
      >
        <List
          :ref="'list' + index"
          :media-type="item.mediaType"
          :user-id="userId"
          :corp-id="corpId"
          :keyword="keyword"
          :search-tag-list="searchTagList"
          :category-obj="tabObj"
          @removeTag="removeTag"
        />
      </van-tab>
    </van-tabs>

    <!-- <van-dialog
      v-model="show"
      :title="`添加&quot;我的&quot;${radio}`"
      show-cancel-button
    >
      <van-form @submit="onSubmit">
        <van-field name="radio" label="添加类型">
          <template #input>
            <van-radio-group v-model="radio" direction="horizontal">
              <van-radio name="1">文本</van-radio>
              <van-radio name="2">分类</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field
          v-model="username"
          name="分类名称"
          label="分类名称"
          placeholder="分类名称"
          :rules="[{ required: true, message: '请填写分类名称' }]"
        />
        <template>
          <van-field
            readonly
            clickable
            name="picker"
            :value="value"
            label="文本分类"
            placeholder="点击选择文本分类"
            @click="showPicker = true"
          />
          <van-popup v-model="showPicker" position="bottom">
            <van-picker
              show-toolbar
              :columns="columns"
              @confirm="onConfirm"
              @cancel="showPicker = false"
            />
          </van-popup>

          <van-field
            v-model="message"
            rows="5"
            autosize
            label="文本信息"
            type="textarea"
            maxlength="150"
            placeholder="请输入文本信息"
            show-word-limit
          />
        </template>
      </van-form>
    </van-dialog> -->
  </div>
</template>

<style lang="less" scoped>
.page {
  height: 100vh;
  background: #f6f6f6;
}
/deep/ .list {
  padding: 10px;
  background: #fff;
  border-top: 1px solid #eee;
  .info {
    padding-top: 10px;
  }
  .action {
    padding-left: 5px;
  }
}
.chat-div {
  height: 100%;
  display: flex;
  flex-direction: column;
  .search-div {
    display: flex;
    align-items: center;
    background-color: #e7e7e7;
    padding-right: 5px;
    .search-input {
      flex: 1;
      background-color: #e7e7e7;
      padding-right: 5px;
      padding-left: 5px;
      height: 40px;
      /deep/ .van-search__content {
        background-color: #F7F8FA;
        border-radius: 16px;
        .van-cell {
          padding: 2px 0;
        }
        .van-cell__value {
          padding-right: 5px;
        }
      }
    }
    .filter-tool {
      padding: 5px 10px;
      border-radius: 16px;
      background-color: #F7F8FA;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .tab-div {
    position: relative;
    flex: 1;
    overflow: auto;
    /deep/ .van-tabs__content {
      flex: 1;
      background-color: #fff;
      height: calc(100% - 94px);
      overflow: auto;
      position: relative;
      .van-tab__pane {
        height: 100%;
      }
    }
    .tag-popover-div, /deep/ .van-overlay {
      position: absolute;
    }
    .tag-popover-div {
      padding: 10px;
      .popover-title {
        font-size: 14px;
        font-weight: bold;
        height: 30px;
        line-height: 30px;
      }
      .content-container {
        .search-tag-keyword {
          padding: 0;
          .van-search__content {
            border-radius: 16px;
            border: 1px solid #D7D7D7;
            height: 32px;
            .van-cell {
              padding: 2px 0;
            }
            /deep/ .van-field__body {
              padding-right: 5px;
              input {
                line-height: 26px;
              }
            }
          }
        }
        .tag-list-div {
          margin-top: 10px;
          max-height: 200px;
          overflow: auto;
          .tag-item {
            height: 24px;
            padding: 7px 10px;
            font-size: 12px;
            color: #7f7f7f;
            border-color: #d9d9d9;
            margin-right: 5px;
            margin-bottom: 5px;
            border-radius: 12px;
            cursor: pointer;
            &:hover {
              color: @green;
              border-color: #c4e1dd;
            }
            &.selected {
              color: @green;
              background-color: #f0f8f7;
              border-color: @green;
            }
          }
        }
        .btn-div {
          display: flex;
          align-items: center;
          justify-content: space-around;
          margin-top: 10px;
          .btn-item {
            width: 150px;
            font-size: 14px;
          }
          .confirm-btn {
            background-color: @green;
            border-color: @green;
          }
        }
      }
    }
  }
}
</style>
