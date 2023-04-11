<!--
 * @Description: 添加/编辑雷达页面
 * @Author: xulinbin
 * @LastEditors: Xzz
-->
<template>
  <van-popup :value="true" class="add-or-readct-radar-page">
    <div class="top-container">
      <ReturnHeader @goBack="goBack" />
      <div class="content-container">
        <van-cell-group>
          <van-field
            v-model="radarTitle"
            rows="2"
            autosize
            required
            label="雷达标题"
            type="textarea"
            maxlength="32"
            placeholder="请选择雷达使用场景，方便标记使用"
            label-width="70"
            show-word-limit
          />
          <van-field
            required
            label="雷达链接"
            readonly
          />
          <div class="radar-content-div">
            <div class="upload-content-item">
              <van-radio-group v-model="radarUrlData.isDefined" direction="horizontal" icon-size="15px">
                <van-radio :name="DEFAULT_LINK" :checked-color="ACTIVE_COLOR">使用链接默认信息</van-radio>
                <van-radio :name="CUSTOM_LINK" :checked-color="ACTIVE_COLOR">自定义链接信息</van-radio>
              </van-radio-group>
              <div v-if="radarUrlData.isDefined !== DEFAULT_LINK" style="margin-top:10px">
                <van-field v-model="radarUrlData.url" label-width="0" placeholder="必填，请填写链接访问地址" />
                <van-field
                  v-model="radarUrlData.title"
                  rows="2"
                  autosize
                  type="textarea"
                  :maxlength="LINK_TITLE_MAXLENGTH"
                  placeholder="必填，请填写链接的标题"
                  label-width="0"
                  show-word-limit
                />
                <van-field
                  v-model="radarUrlData.content"
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
                    v-if="!radarUrlData.coverUrl"
                    :upload-txt="`上传图片`"
                    :tip="`只能上传jpg/png文件，且不超过2M`"
                    :accept="`image/*`"
                    :file-url.sync="radarUrlData.coverUrl"
                    :media-type="MEDIA_TYPE['POSTER']"
                  />
                  <div v-else class="upload-img-preview">
                    <FileItem :detail-item="radarUrlData" />
                    <van-icon name="cross" class="remove-icon" @click="removeFile" />
                  </div>
                </div>
              </div>
              <div v-else style="margin-top:10px">
                <van-field v-model="radarUrlData.url" label-width="0" placeholder="必填，请填写链接访问地址" @blur="sendRadarUrl" />
                <div class="file-preview">
                  <div class="title">{{ radarUrlData.title ? radarUrlData.title :`链接标题` }}</div>
                  <div class="content">
                    <div class="digest">{{ radarUrlData.content ? radarUrlData.content :`摘要` }}</div>
                    <div v-if="radarUrlData.coverUrl" class="img">
                      <img :src="radarUrlData && radarUrlData.coverUrl">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <van-field
            label="追踪设置"
            readonly
          />
          <div class="radar-content-div">
            <div class="trace-set">
              <div class="trace-set-item">
                <div class="title">
                  <div class="name">行为通知</div>
                  <van-switch v-model="behaviorChecked" :active-color="ACTIVE_COLOR" inactive-color="#ddd" size="16px" />
                </div>
                <div class="content">开启后，当客户点击雷达链接，将发送应用提醒通知所属员工</div>
              </div>
              <div class="trace-set-item">
                <div class="title">
                  <div class="name">轨迹记录</div>
                  <van-switch v-model="trackChecked" :active-color="ACTIVE_COLOR" inactive-color="#ddd" size="16px" />
                </div>
                <div class="content">开启后，当客户点击雷达链接，会记录在其客户资料的活动轨迹下</div>
              </div>
              <div class="trace-set-item">
                <div class="title">
                  <div class="name">客户标签</div>
                  <van-switch v-model="tagChecked" :active-color="ACTIVE_COLOR" inactive-color="#ddd" size="16px" />
                </div>
                <div class="content">开启后，当客户点击雷达链接，为其打上指定客户标签</div>
              </div>
            </div>
            <div v-if="tagChecked" class="user-tags">
              <van-button class="user-tags-button" :color="ACTIVE_COLOR" icon="plus" type="primary" plain size="mini" @click="showAddTags">添加标签</van-button>
              <div v-for="(item,index) of radarTagList" :key="index" class="user-tags-item">{{ item && item.tagName }}</div>
            </div>
          </div>
        </van-cell-group>
      </div>
    </div>
    <TagModal :tag-actions="tagActions" :show.sync="addTagsShow" :tag-groups="tagGroups" :add-tag.sync="addTag" :radar-tag-list.sync="radarTagList" :is-radar="true" />
    <div class="footer-container">
      <div v-show="[RADAR_TYPE['department'], RADAR_TYPE['enterprise']].includes(type)" class="is-push-div">
        <van-checkbox v-model="noticeChecked" shape="square" :checked-color="ACTIVE_COLOR">发送应用提醒通知员工</van-checkbox>
      </div>
      <van-button class="save-btn" color="#6BB4AB" size="small" type="primary" @click="handleSaveRadarInfo">
        保存
      </van-button>
    </div>
  </van-popup>
</template>
<script>
import { MEDIA_TYPE, IMG_LINK_DIGEST } from '@/utils/constants';
import { addRadarInfo, updateRadar, getRadarDetails } from '@/api/radar';
import { RADAR_TYPE, DEFAULT_LINK, CUSTOM_LINK, LINK_TITLE_MAXLENGTH, LINK_CONTENT_MAXLENGTH } from '@/utils/constants';
import ReturnHeader from '@/components/ReturnHeader.vue';
import { getWordsUrlContent } from '@/api/wordsGroup';
import FileItem from './FileItem';
import Upload from '@/components/Upload.vue';
import TagModal from '@/views/portrait/component/tagModal';
import { getAllTags } from '@/api/portrait';

const ACTIVE_COLOR = '#6BB4AB';
export default {
  name: '',
  components: { ReturnHeader, FileItem, Upload, TagModal },
  props: {
    /**
     * 雷达类型
     */
    type: {
      type: Number,
      default: RADAR_TYPE['personal']
    },
    /**
     * 是否选择链接默认信息
     */
    isDefined: {
      type: Boolean,
      default: false
    },
    // 是编辑则是有
    radarId: {
      type: String,
      default: ''
    }
  },
  provide() {
    return {
      findTrajectory: () => {}
    };
  },
  data() {
    return {
      behaviorChecked: false, // 行为通知
      trackChecked: false, // 轨迹记录
      tagChecked: false, // 客户标签
      noticeChecked: true, // 是否通知员工 默认勾选
      radarTagList: [], // 雷达标签
      addTag: [], // 新增标签
      radarTitle: '', // 雷达标题
      // 雷达链接实体
      radarUrlData: {
        content: '', // 链接摘要
        coverUrl: '', // 链接封面图
        title: '', // 链接标题
        isDefined: this.isDefined, // 链接使用 默认还是自定义
        url: '', // 真实路径
        mediaType: MEDIA_TYPE['IMG_LINK']
      },
      tagGroups: [], // 全部的标签
      tagActions: [],
      addTagsShow: false, // 添加标签弹出框的展示
      MEDIA_TYPE,
      RADAR_TYPE,
      DEFAULT_LINK,
      CUSTOM_LINK,
      LINK_TITLE_MAXLENGTH,
      LINK_CONTENT_MAXLENGTH,
      IMG_LINK_DIGEST,
      ACTIVE_COLOR
    };
  },
  watch: {
    tagChecked: function(val) {
      if (!val) {
        this.radarTagList = [];
      }
    }
  },
  created() {
    /**
     * @description:获取全部标签
     * @return {*}
     */
    getAllTags()
      .then((res) => {
        this.tagGroups = res.data;
        this.tagActions = [{ text: '所有标签组', value: '', className: 'tag-group-name' }].concat(res.data.map(group => ({ text: group.groupName, value: group.groupName, className: 'tag-group-name' })));
      })
      .catch((err) => {
        console.log(err);
      });
    if (this.radarId) {
      getRadarDetails({ id: this.radarId }).then((res) => {
        const data = res.data;
        this.behaviorChecked = data.enableClickNotice;
        this.trackChecked = data.enableBehaviorRecord;
        this.tagChecked = data.enableCustomerTag;
        this.noticeChecked = data.enableUpdateNotice;
        this.radarTagList = data.radarTagList;
        this.addTag = data.radarTagList;
        this.radarTitle = data.radarTitle;
        this.$set(this.radarUrlData, 'isDefined', data.weRadarUrl.isDefined);
        this.$set(this.radarUrlData, 'content', data.weRadarUrl.content);
        this.$set(this.radarUrlData, 'coverUrl', data.weRadarUrl.coverUrl);
        this.$set(this.radarUrlData, 'title', data.weRadarUrl.title);
        this.$set(this.radarUrlData, 'url', data.weRadarUrl.url);
      });
    }
  },
  methods: {
    /**
     * @description: 添加标签
     * @return {*}
     */
    showAddTags() {
      this.addTag = Object.assign([], this.radarTagList);
      this.addTagsShow = true;
    },
    /**
     * 移除已上传文件
     */
    removeFile() {
      this.radarUrlData = {
        content: '',
        coverUrl: '',
        title: '',
        isDefined: this.radarUrlData.isDefined,
        url: '',
        mediaType: MEDIA_TYPE['IMG_LINK']
      };
    },
    /**
    * 输入链接后获取链接的标题、封面信息
    */
    async sendRadarUrl() {
      if (this.radarUrlData.url) {
        getWordsUrlContent({ url: this.radarUrlData.url }).then(res => {
          this.radarUrlData.content = res.data.desc.slice(0, LINK_CONTENT_MAXLENGTH);
          this.radarUrlData.title = res.data.title.slice(0, LINK_TITLE_MAXLENGTH);
          if (!res.data.isUrl && res.data.image) {
          // 这里定义一个url来获取链接中的域名部分
            var url = this.radarUrlData.url.split('/');
            this.radarUrlData.coverUrl = 'https://' + url[2] + (res.data.image[0] !== '/' ? '/' : '') + res.data.image;
          } else {
            this.radarUrlData.coverUrl = res.data.image;
          }
        });
      }
    },
    /**
     * 返回
     */
    goBack() {
      this.$emit('closePage');
      this.resetForm();
      // 将雷达id设空
      this.$emit('setEmptyId');
    },

    /**
     * 校验必填项
     */
    checkRequire(radarUrlData) {
      if (!radarUrlData.url) {
        this.$toast('请填写访问地址');
        return true;
      }
      if (!radarUrlData.title) {
        this.$toast('需要有链接标题');
        return true;
      }
      return false;
    },
    /**
     * @description: 保存雷达，检验成功后再添加/修改
     * @return {*}
     */
    handleSaveRadarInfo() {
      if (!this.radarTitle) {
        this.$toast('请填写雷达标题');
        return;
      }
      const flag = this.checkRequire(this.radarUrlData);
      if (flag) {
        return;
      }

      if (this.radarId) {
        this.updateRadar({
          enableBehaviorRecord: this.trackChecked,
          enableClickNotice: this.behaviorChecked,
          enableCustomerTag: this.tagChecked,
          enableUpdateNotice: this.noticeChecked,
          id: this.radarId,
          radarTagList: this.radarTagList,
          radarTitle: this.radarTitle,
          type: this.type,
          weRadarUrl: this.radarUrlData
        });
      } else {
        this.addRadar({
          enableBehaviorRecord: this.trackChecked,
          enableClickNotice: this.behaviorChecked,
          enableCustomerTag: this.tagChecked,
          enableUpdateNotice: this.noticeChecked,
          radarTagList: this.radarTagList,
          radarTitle: this.radarTitle,
          type: this.type,
          weRadarUrl: this.radarUrlData
        });
      }
    },
    /**
     * 清空数据
     */
    resetForm() {
      Object.assign(this.$data, this.$options.data.call(this));
    },
    /**
     * 新增雷达
     */
    async addRadar(data) {
      const addRes = await addRadarInfo(data);
      // eslint-disable-next-line no-magic-numbers
      if (addRes.code === 200) {
        this.$toast.success('添加雷达成功');
        this.goBack();
        this.$emit('reGetList', { pageNum: 1, finished: false });
        this.resetForm();
      } else {
        this.$toast.fail('添加雷达失败');
      }
    },
    /**
     * 更新雷达
     */
    async updateRadar(data) {
      const updataRes = await updateRadar(data);
      // eslint-disable-next-line no-magic-numbers
      if (updataRes.code === 200) {
        this.$toast.success('更新雷达成功');
        this.goBack();
        this.$emit('reGetList', { pageNum: 1 });
        this.resetForm();
      } else {
        this.$toast.fail('更新雷达失败');
      }
    }
  }

};
</script>
<style scoped lang='less'>
.add-or-readct-radar-page {
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
        /deep/ .van-field__word-limit {
          color: #FA7216;
        }
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
    .radar-content-div {
        margin: 0 8px 0 16px;
        padding: 0 10px 10px 10px;
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
            .upload-img-preview{
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
        }
        .trace-set-item{
          .title{
            height: 35px;
            width: 100%;
            display: flex;
            align-items: center;
            .name{
              margin-right: 10px;
            }
          }
          .content{
            color: #999999;
            font-size: 12px;
            margin-left: 67px;
          }
        }
        .user-tags{
          margin: 10px 0 20px 0;
          padding-left: 67px;
          font-size: 12px;
          display: flex;
          flex-wrap: wrap;
          .user-tags-button{
            margin-right: 5px;
          }
          .user-tags-item{
            background-color:#F5F5F5;
            text-align:center;
            border-radius: 5px;
            padding: 5px;
            margin: 0 5px 5px 0;
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
      .is-push-div {
        display: flex;
        flex: 1;
      }
      .save-btn {
          width: 80px;
          height: 28px;
          position: absolute;
          right: 10px;
          border-radius: 16px;
      }
    }
    .file-preview {
      border: 1px solid #d9d9d9;
      position: relative;
      width: 200px;
      height: 85px;
      padding: 10px;
      .title{
        font-size: 13px;
        margin-bottom: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .content {
        display: flex;
        .digest {
          flex: 1;
          font-size: 12px;
          color: #999999;
          display: -webkit-box;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }
        .img {
          width: 40px;
          height: 40px;
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }
}
</style>
