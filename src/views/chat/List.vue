<script>
import {
  getMaterialList,
  addCollection,
  cancleCollection,
  getMaterialMediaId
} from '@/api/chat';
import { MEDIA_TYPE } from '@/utils/constants';
import { filterSize, matchDealtagName, getFileIcon, downloadFile, isPC, isWindows, isMac, sendMessage } from '@/utils/index';
import FileInfo from './component/FileInfo.vue';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import ClipboardJS from 'clipboard';

const PAGE_SIZE = 10;
export default {
  components: { FileInfo, EmptyDefaultIcon },
  props: {
    // mediaType 0 图片（image）、1 语音（voice）、2 视频（video），3 普通文件(file) 4 文本 5 海报
    mediaType: {
      type: Number,
      default: null
    },
    userId: {
      type: String,
      default: ''
    },
    keyword: {
      type: String,
      default: ''
    },
    // 搜索条件中的标签列表
    searchTagList: {
      type: Array,
      default: () => []
    },
    /**
     * 素材类型
     */
    categoryObj: {
      type: Object,
      default: () => {}
    }
  },
  inject: ['getExternalUserId'],
  data() {
    return {
      refreshing: false,
      loading: false,
      finished: false,
      error: false,
      pageSize: PAGE_SIZE,
      list: [],
      collectList: [],
      mediaTypeObj: {
        '0': '图片',
        '1': '语音',
        '2': '视频',
        '3': '普通文件',
        '4': '文本',
        '5': '海报'
      },
      MEDIA_TYPE,
      showEmpty: false
    };
  },
  computed: {
    // 拿到inject的外部联系人id
    externalUserId() {
      return this.getExternalUserId();
    }
  },
  watch: {
    userId(val) {
      if (val) {
        this.getList(1);
      }
    }
  },
  created() {
    // this.userId && this.getCollectionList()
  },
  mounted() {
    this.clipboard = new ClipboardJS('.material-copy');
    this.clipboard.on('success', (e) => {
      this.$toast('已复制,请前往浏览器地址栏按 command+V 打开下载');
    });
    this.clipboard.on('error', (e) => {
      this.$toast('文件路径复制失败');
    });
  },
  methods: {
    getList(page, params = {}) {
      let pageNum;
      if (page) {
        pageNum = page;
      } else {
        // 使用list长度计算，防止load混乱
        pageNum = this.list.length / this.pageSize + 1;
      }
      const pageSize = this.pageSize;
      const keyword = this.keyword;
      page === 1 && (this.list = []);
      getMaterialList({
        userId: this.userId,
        mediaType: this.mediaType,
        pageSize,
        pageNum,
        search: keyword,
        ...params
      }).then(({ rows, total }) => {
        // 判断我的列表
        if (!this.sideId) {
          rows.forEach((element) => {
            element.collection = 1;
          });
        }
        if (pageNum === 1) {
          this.list = [...rows];
        } else {
          this.list.push(...rows);
        }
        this.showEmpty = this.list.length;
        this.loading = false;
        this.refreshing = false;
        // 数据全部加载完成
        if (this.list.length >= +total) {
          this.finished = true;
        } else {
          // refresh时重置该值，否则无法下拉加载
          this.finished = false;
        }
      })
        .catch(() => {
          this.error = true;
        });
    },
    // getCollectionList() {
    //   let data = { userId: this.userId, pageSize: 1000, pageNum: 1 }
    //   getCollectionList(data).then(({ rows, total }) => {
    //     this.collectList = rows.map((d) => d.materialId)
    //   })
    // },
    send(data) {
      this.$toast.loading({
        message: '正在发送...',
        duration: 0,
        forbidClick: true
      });
      sendMessage({ ...data, externalUserId: this.externalUserId, weComUserId: this.$store.state.userId, corpId: this.$store.state.corpId }, this, getMaterialMediaId);
    },
    collect(data) {
      // collection 是否收藏 0未收藏 1 已收藏
      (data.collection === 1 ? cancleCollection : addCollection)({
        userId: this.userId,
        materialId: data.materialId
      }).then(() => {
        data.collection = [1, 0][data.collection];
        this.$toast('操作成功');
      });
    },
    dealFileType(url) {
      let suffix;
      const index = url.lastIndexOf('.');
      const dealSuffix = url.substr(index + 1);
      switch (dealSuffix) {
        case 'xlsx': {
          suffix = 'excel';
          break;
        }
        case 'txt': {
          suffix = 'txt';
          break;
        }
        case 'pdf': {
          suffix = 'pdf';
          break;
        }
        case 'doc':
        case 'docx': {
          suffix = 'docx';
          break;
        }
        default: {
          suffix = 'unknown_file';
          break;
        }
      }
      return suffix;
    },
    /**
     * 计算文件大小
     */
    fileSizeText(fileSize) {
      return filterSize(Number(fileSize)) || '';
    },
    /**
     * 显示的标签列表
     */
    tagList(item) {
      return matchDealtagName(item.tagList, this.$store);
    },
    /**
     * 移除标签搜索
     */
    removeTag(id) {
      this.$emit('removeTag', id);
    },
    /**
     * 预览海报图
     */
    onPreview(item) {
      switch (item.mediaType) {
        case MEDIA_TYPE['POSTER']:
        case MEDIA_TYPE['IMG_LINK']:
        case MEDIA_TYPE['VIDEO']: {
          window.open(item.materialUrl);
          break;
        }
        case MEDIA_TYPE['FILE']: {
          if (isPC() && isWindows()) {
            downloadFile(item.materialUrl, item.materialName);
          }
          // 移动端采用企微api中预览文件的功能
          if (!isPC()) {
            this.$api.invoke(
              'previewFile',
              {
                url: item.materialUrl, // 需要预览文件的地址(必填，可以使用相对路径)
                name: item.materialName, // 需要预览文件的文件名，必须有带文件格式的后缀，例如.doc(不填的话取url的最后部分，最后部分是个包含格式后缀的文件名)
                size: item.content && Number(item.content) // 需要预览文件的字节大小(必填，而且大小必须正确，否则会打开失败)
              });
          }
          break;
        }
      }
    },
    /**
     * 获取文件类型图标class
     */
    getFileIconClass(item) {
      return getFileIcon(item.materialUrl);
    },
    /**
     * 判断是否为mac端且为文件类型
     */
    checkCanCopy(item) {
      return isMac() && item.mediaType === MEDIA_TYPE['FILE'];
    }
  }
};
</script>

<template>
  <div class="chat-list">
    <div v-if="searchTagList && searchTagList.length > 0" class="search-tag-list">
      <template v-for="tagItem in searchTagList">
        <van-tag v-if="tagItem.tagName" :key="tagItem.id" plain closeable class="green-tag-item search-tag" @close="() => removeTag(tagItem.id)">{{ tagItem.tagName }}</van-tag>
      </template>
    </div>
    <!-- 初始化时不展示空状态 在调用过接口后再将列表长度赋值给空组件 避免出现List列表无法初始化调用load -->
    <EmptyDefaultIcon :length="showEmpty" text="没有找到素材" class="material-list-div">
      <div class="material-list-div">
        <van-pull-refresh
          v-model="refreshing"
          success-text="刷新成功"
          @refresh="getList(1)"
        >
          <van-list
            v-model="loading"
            :finished="finished"
            finished-text="没有更多了"
            :error.sync="error"
            error-text="请求失败，点击重新加载"
            @load="getList()"
          >
            <div v-for="(item, index) in list" :key="index" class="list">
              <div class="content bfc-o">
                <div class="img-div">
                  <!-- 海报 -->
                  <van-image
                    v-if="item.mediaType == MEDIA_TYPE['POSTER']"
                    class="poster-cover-img cover-item"
                    fit="contain"
                    :src="item.materialUrl"
                    @click="() => onPreview(item)"
                  />
                  <!-- 视频 -->
                  <div v-if="item.mediaType == MEDIA_TYPE['VIDEO']" class="cover-item">
                    <div v-if="item.coverUrl" class="video-item">
                      <van-image
                        class="video-item"
                        width="70"
                        height="70"
                        :src="item.coverUrl"
                        @click="() => onPreview(item)"
                      >
                        <svg class="icon-player" :width="25" :height="25">
                          <use href="#icon-player" />
                        </svg>
                        <template slot="error">
                          <svg class="icon-default-video" :width="25" :height="25">
                            <use href="#icon-default-video" />
                          </svg>
                        </template>
                      </van-image>
                    </div>
                    <div v-else class="video-item" @click="() => onPreview(item)">
                      <svg class="icon-player" :width="25" :height="25">
                        <use href="#icon-player" />
                      </svg>
                      <video
                        id="video"
                        class="video-preview"
                        webkit-playsinline="true"
                        playsinline="true"
                        :autoplay="false"
                        preload="auto"
                        :poster="item.coverUrl"
                        :src="item.materialUrl"
                      />
                    </div>
                  </div>
                  <!-- 文件 -->
                  <div
                    v-if="item.mediaType == MEDIA_TYPE['FILE']"
                    :class="'cover-item file-item' + (checkCanCopy(item) ? ' material-copy' : '')"
                    :data-clipboard-text="item.materialUrl"
                    @click="() => onPreview(item)"
                  >
                    <svg class="icon" aria-hidden="true" width="70" height="70">
                      <use :xlink:href="'#icon-' + getFileIconClass(item)" />
                    </svg>
                  </div>
                  <!-- 链接 -->
                  <van-image
                    v-if="item.mediaType == MEDIA_TYPE['IMG_LINK']"
                    class="cover-item"
                    width="70"
                    height="70"
                    fit="contain"
                    :src="item.coverUrl"
                    @click="() => onPreview(item)"
                  >
                    <template slot="error">
                      <svg class="icon-img-link" :width="25" :height="25">
                        <use href="#icon-img-link" />
                      </svg>
                    </template>
                  </van-image>
                  <!-- 小程序 -->
                  <van-image
                    v-if="item.mediaType == MEDIA_TYPE['MINI_APP']"
                    class="cover-item"
                    width="70"
                    height="70"
                    :src="item.coverUrl"
                  >
                    <template slot="error">
                      <div slot="error" class="image-slot">
                        <i class="iconfont icon-mini-app" style="font-size: 25px" />
                      </div>
                    </template>
                  </van-image>
                </div>
                <div class="material-info">
                  <div v-if="checkCanCopy(item)" class="title line2-toe material-copy" :data-clipboard-text="item.materialUrl">
                    {{ item.materialName }}
                  </div>
                  <div v-else class="material-title title line2-toe" @click="() => onPreview(item)">
                    <span v-if="mediaType === null" class="category-name">{{ categoryObj[item.mediaType] }} | </span>
                    <span>{{ item.materialName }}</span>
                  </div>
                  <!-- <van-button :data-clipboard-text="item.materialUrl">{{ item.materialName }}</van-button> -->
                  <FileInfo :item="item" />
                  <div class="tag-info">
                    <template v-for="tagItem in tagList(item)">
                      <van-tag v-if="tagItem.tagName" :key="tagItem.id" plain class="green-tag-item">{{ tagItem.tagName }}</van-tag>
                    </template>
                  </div>
                </div>
                <div class="tool">
                  <div class="fr flex">
                    <div class="action" title="发送" @click="send(item)">
                      <van-image
                        width="20"
                        height="20"
                        :src="require(`@/assets/icon/send-icon.svg`)"
                      />
                    </div>
                  <!-- <div v-if="!!userId" class="action" @click="collect(item)">
                    {{ item.collection == 1 ? '取消' : '' }}收藏
                  </div> -->
                  </div>
                </div>
              </div>
            </div>
          </van-list>
        </van-pull-refresh>
      </div>
    </EmptyDefaultIcon>
  </div>
</template>

<style lang="less" scoped>
.chat-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  /deep/ .empty-div {
    margin-top: 40px;
  }
  .material-list-div {
    flex: 1;
  }
}
.content {
  display: flex;
  .img-div {
    .cover-item {
      float: left;
      margin-right: 10px;
      border: 1px solid #eee;
      // height: 72px;
    }
    .poster-cover-img {
      /deep/ img {
        max-height: 91px;
        max-width: 70px;
      }
    }
    .video-item {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 72px;
      .icon-player {
        position: absolute;
        opacity: 0.4;
      }
      .video-preview {
        width: 70px;
        max-height: 70px;
      }
    }
    .file-item {
      width: 70px;
      height: 70px;
    }
  }
  .material-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .title {
      font-size: 14px;
      color: @black;
      word-break: break-all;
      cursor: pointer;
      line-height: 18px;
    }
    .tag-info {
      margin-top: 5px;
    }
    .category-name {
      color: @fontColor;
    }
  }
  .tool {
    .fr {
      .action {
        color: #18ADFF;
      }
    }
  }
  .title {
    word-break: break-all;
  }
}
.search-tag-list {
  padding: 10px 10px 5px 10px;
  background-color: #fff;
  .green-tag-item {
    margin-bottom: 5px;
    border-radius: 10px;
    padding: 4px 10px;
  }
}
</style>
