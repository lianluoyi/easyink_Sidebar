<!--
 * @Description: 添加/编辑话术页面
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <van-popup v-model="show" class="add-verbal-trick-page">
    <div class="top-container">
      <ReturnHeader @goBack="goBack" />
      <div class="content-container">
        <van-cell-group>
          <div class="group-item-div">
            <van-field
              v-model="formData.categoryId"
              required
              label="所属分组"
              label-width="70"
              class="category-id"
            />
            <van-dropdown-menu class="select-category">
              <van-dropdown-item ref="selectGroupDropDown" :title="`${formData.categoryId ? categoryName : '请选择话术所属分组'}`" class="select-dropdown">
                <div v-for="(item, index) in groupTreeData" :key="index" class="group-item" @click="(e) => selectGroup(e, item)">
                  <div class="group-info">
                    <div>
                      {{ item.name }}
                    </div>
                    <van-icon v-if="formData.categoryId === item.id" name="success" />
                  </div>
                  <div v-for="(childItem, childIndex) in item.children" :key="childIndex" class="group-item child-group-item" @click="(e) => selectGroup(e, childItem)">
                    <div class="group-info">
                      <div>{{ childItem.name }}</div>
                      <van-icon v-if="formData.categoryId === childItem.id" name="success" />
                    </div>
                  </div>
                </div>
              </van-dropdown-item>
            </van-dropdown-menu>
          </div>
          <van-field
            v-model="formData.title"
            rows="2"
            autosize
            label="话术标题"
            type="textarea"
            maxlength="64"
            placeholder="请填写问题或话术场景，方便查找"
            label-width="70"
            show-word-limit
          />
          <van-field
            required
            label="话术内容"
            class="category-id"
          />
          <div class="verbal-trick-content-list-div">
            <div v-for="(contentItem, contentIndex) in formData.weWordsDetailList" :key="contentIndex" class="content-list-div-item">
              <VerbalTrickContentItem
                :key="contentIndex"
                :index="contentIndex"
                :item.sync="contentItem"
                :media-type="contentItem.mediaType"
                :list.sync="formData.weWordsDetailList"
              />
              <MoveTool
                ref="moveTool"
                :index="contentIndex"
                :list="formData.weWordsDetailList"
                :item="contentItem"
                placement="left-end"
                @updateList="updateList"
              />
            </div>
          </div>
          <div class="add-verbal-btn">
            <van-button color="#6BB4AB" size="small" type="primary" @click="addVerbalTrick">
              添加话术
            </van-button>
          </div>
          <van-action-sheet v-model="showSelect" :actions="actions" @select="onSelectType" />
        </van-cell-group>
      </div>
    </div>
    <div class="footer-container">
      <div v-show="[VERBAL_TRICK_TYPE['department'], VERBAL_TRICK_TYPE['enterprise']].includes(type)" class="is-push-div"><van-checkbox v-model="formData.isPush" shape="square" checked-color="#6BB4AB">发送应用提醒通知员工</van-checkbox></div>
      <van-button class="save-btn" color="#6BB4AB" size="small" type="primary" @click="handleSaveVerbalTrick">
        保存
      </van-button>
    </div>
  </van-popup>
</template>
<script>
import { MEDIA_TYPE, IMG_LINK_DIGEST } from '@/utils/constants';
import VerbalTrickContentItem from './VerbalTrickContentItem.vue';
import MoveTool from './MoveTool.vue';
import { addWords, updateWords } from '@/api/wordsGroup';
import { VERBAL_TRICK_TYPE, DEFAULT_LINK } from '@/utils/constants';
import ReturnHeader from '@/components/ReturnHeader.vue';
export default {
  name: '',
  components: { VerbalTrickContentItem, MoveTool, ReturnHeader },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    groupTreeData: {
      type: Array,
      default: () => []
    },
    categoryObj: {
      type: Object,
      default: () => {}
    },
    /**
     * 话术类型
     */
    type: {
      type: Number,
      default: VERBAL_TRICK_TYPE['personal']
    }
  },
  data() {
    return {
      categoryName: '',
      formData: {
        categoryId: null,
        weWordsDetailList: [{
          mediaType: MEDIA_TYPE['TEXT'],
          content: ''
        }],
        isPush: [VERBAL_TRICK_TYPE['department'], VERBAL_TRICK_TYPE['enterprise']].includes(this.type)
      },
      showSelect: false,
      actions: [
        { name: '文本', type: MEDIA_TYPE['TEXT'] },
        { name: '图片', type: MEDIA_TYPE['POSTER'] },
        { name: '视频', type: MEDIA_TYPE['VIDEO'] },
        { name: '文件', type: MEDIA_TYPE['FILE'] },
        { name: '链接', type: MEDIA_TYPE['IMG_LINK'] },
        { name: '小程序', type: MEDIA_TYPE['MINI_APP'] }
      ],
      VERBAL_TRICK_TYPE
    };
  },
  watch: {
    /**
     * 将传入的分组自动填入
     */
    categoryObj(val) {
      this.formData.categoryId = val.id;
      this.categoryName = val.name;
    }
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * 选择所属分组
     */
    selectGroup(e, item) {
      e.stopPropagation();
      this.formData.categoryId = item.id;
      this.categoryName = item.name;
      this.$refs.selectGroupDropDown.toggle();
    },
    /**
     * 返回
     */
    goBack() {
      this.$emit('update:show', false);
    },
    /**
     * 添加话术
     */
    addVerbalTrick() {
      this.showSelect = true;
    },
    /**
     * 选择分类
     */
    onSelectType(item) {
      console.log('选择分类-', item);
      this.showSelect = false;
      const newList = [...this.formData.weWordsDetailList];
      switch (item.type) {
        case MEDIA_TYPE['TEXT']: {
          newList.push({
            mediaType: item.type,
            content: ''
          });
          break;
        }
        case MEDIA_TYPE['POSTER']:
        case MEDIA_TYPE['VIDEO']:
        case MEDIA_TYPE['FILE']: {
          newList.push({
            mediaType: item.type,
            url: '',
            title: ''
          });
          break;
        }
        case MEDIA_TYPE['IMG_LINK']:
        case MEDIA_TYPE['MINI_APP']: {
          newList.push({
            mediaType: item.type,
            url: '',
            title: '',
            content: '',
            coverUrl: '',
            isDefined: DEFAULT_LINK
          });
          break;
        }
      }
      this.formData.weWordsDetailList = newList;
    },
    /**
     * 更新话术内容附件列表
     */
    updateList(list) {
      this.formData.weWordsDetailList = list;
    },
    /**
     * 校验必填项
     */
    checkRequire(weWordsDetailList) {
      return weWordsDetailList.some(item => {
        switch (item.mediaType) {
          case MEDIA_TYPE['TEXT']: {
            if (!item.content) {
              this.$toast('请填写话术内容');
              return true;
            }
            return false;
          }
          case MEDIA_TYPE['IMG_LINK']: {
            if (!item.title) {
              this.$toast('请填写链接标题');
              return true;
            }
            if (!item.url) {
              this.$toast('请填写链接访问地址');
              return true;
            }
            return false;
          }
          case MEDIA_TYPE['MINI_APP']: {
            if (!item.content) {
              this.$toast('请填写小程序appid');
              return true;
            }
            if (!item.url) {
              this.$toast('请填写小程序访问地址');
              return true;
            }
            if (!item.title) {
              this.$toast('请填写小程序标题');
              return true;
            }
            return false;
          }
        }
      });
    },
    filterList(weWordsDetailList) {
      const list = weWordsDetailList.filter(item => {
        switch (item.mediaType) {
          case MEDIA_TYPE['POSTER']:
          case MEDIA_TYPE['VIDEO']:
          case MEDIA_TYPE['FILE']: {
            return !!item.url;
          }
          default: {
            return true;
          }
        }
      });
      return list;
    },
    /**
     * 保存话术
     */
    handleSaveVerbalTrick() {
      let weWordsDetailList = [...this.formData.weWordsDetailList];
      weWordsDetailList = this.filterList(weWordsDetailList);
      weWordsDetailList = weWordsDetailList.map(newItem => {
        return {
          ...newItem,
          // 链接话术增加摘要默认值
          content: newItem.mediaType === MEDIA_TYPE['IMG_LINK'] ? (newItem.content || IMG_LINK_DIGEST) : newItem.content
        };
      });
      const flag = this.checkRequire(weWordsDetailList);
      if (flag) {
        return;
      }
      const formData = { ...this.formData };
      if (this.formData.id) {
        let removeIds = [];
        removeIds = this.$refs.moveTool[0].removeList.map(item => item.id);
        this.updateWords({
          ...formData,
          weWordsDetailList: weWordsDetailList,
          wordsDetailIds: removeIds
        });
      } else {
        this.addWords({
          categoryId: formData.categoryId,
          title: formData.title,
          weWordsDetailList: weWordsDetailList,
          isPush: formData.isPush
        });
      }
    },
    /**
     * 清空数据
     */
    resetForm() {
      this.formData = {
        categoryId: null,
        weWordsDetailList: [{
          mediaType: MEDIA_TYPE['TEXT'],
          content: ''
        }],
        isPush: [VERBAL_TRICK_TYPE['department'], VERBAL_TRICK_TYPE['enterprise']].includes(this.type)
      };
    },
    /**
     * 新增话术
     */
    async addWords(params) {
      const addRes = await addWords(params);
      if (addRes) {
        this.goBack();
        this.$emit('reGetList', { pageNum: 1 });
        this.resetForm();
      }
    },
    /**
     * 更新话术
     */
    async updateWords(params) {
      const updateRes = await updateWords(params);
      if (updateRes) {
        this.goBack();
        this.$emit('reGetList', { pageNum: 1, categoryIds: [params.categoryId] });
        this.resetForm();
      }
    }
  }

};
</script>
<style scoped lang='less'>
.add-verbal-trick-page {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
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
        .van-icon-revoke {
            margin-right: 10px;
        }
    }
    .content-container {
        .van-cell::after, .van-hairline--top-bottom::after {
            display: none;
        }
        .group-item-div {
            display: flex;
            .category-id {
                width: 100px;
            }
            /deep/ .van-dropdown-menu__title {
              padding-left: 0;
            }
            .select-category {
                /deep/ .van-dropdown-menu__bar {
                    box-shadow: none;
                    .van-dropdown-menu__item {
                        .van-dropdown-menu__title {
                            .van-ellipsis {
                                font-size: 14px;
                                top: -2px;
                                position: relative;
                            }
                        }
                    }
                }
                /deep/ .van-dropdown-item__content {
                    padding: 0 10px;
                }
                /deep/ .van-dropdown-menu__title::after {
                  display: none;
                }
                .group-item {
                    margin: 10px 0;
                    cursor: pointer;
                    .group-info {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }
                }
                .child-group-item {
                    padding-left: 28px
                }
            }
        }
    }
    .verbal-trick-content-list-div {
        padding: 0 16px;
        .content-list-div-item {
            display: flex;
            align-items: flex-end;
            margin-bottom: 10px;
            /deep/ .verbal-trick-content-item {
                width: 100%;
            }
        }
    }
    .add-verbal-btn {
        width: 80px;
        margin-left: 16px;
    }
    .footer-container {
      height: 48px;
      box-shadow: 1px -2px 4px -3px rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      padding: 10px;
      position: relative;
      .is-push-div {
        display: flex;
        flex: 1;
      }
      .save-btn {
          width: 80px;
          height: 28px;
          position: absolute;
          right: 10px;
      }
    }
}
</style>
