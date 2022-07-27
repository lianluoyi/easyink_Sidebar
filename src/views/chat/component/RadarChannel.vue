<!--
 * @Description: 自定义渠道
 * @Author: xulinbin
 * @LastEditors: xulinbin
-->
<template>
  <van-popup :value="radarChannelIsShow" class="radar-channel-page">
    <ReturnHeader @goBack="goBack" />
    <div class="channel-top-wrap">
      <van-notice-bar
        class="notice-div"
        left-icon="bell"
        wrapable
        text="除了在侧边栏使用雷达链接外，还可生成自定义渠道，在其他渠道分享给微信客户，并参与数据统计"
      />
      <div class="add-radar" @click="addChannel"><van-icon name="add-o" />添加渠道</div>
    </div>
    <EmptyDefaultIcon class="radar-list-empty" :length="channelList.length" text="暂无数据">
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
          <div class="channel-list">
            <div v-for="(item,index) of channelList" :key="item.id" class="channel-list-item" @mouseenter="mouseEnter(index)" @mouseleave="mouseLeave">
              <div class="item-top">
                <div class="item-top-left">{{ item.departmentName }}</div>
                <div v-if="mouseEnterIndex === index" class="item-top-right">
                  <div :class="'channel-handle ' + (mouseEnterIndex === index ? 'url-copy' :'') " :data-clipboard-text="item.shortUrl">复制链接</div>
                  <div v-if="isPersonal" class="channel-handle" @click="updateChannel(item.id)">编辑</div>
                  <div v-if="isPersonal" class="channel-handle" @click="deleteChannel(item.id)">删除</div>
                </div>
              </div>
              <div class="item-bottom">{{ item.shortUrl }}</div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </EmptyDefaultIcon>
    <BottomPopup
      v-if="showAddChannel"
      :visible.sync="showAddChannel"
      title="添加渠道"
      @cancelFunc="cancelAddChannel"
      @confirmFunc="confirmAddChannel"
    >
      <InputShowLimit
        :input-value.sync="channelName"
        maxlength="32"
        label-width="0"
        placeholder="请填写渠道名称,方便标记使用"
      />
    </BottomPopup>
    <BottomPopup
      v-if="showUpdateChannel"
      :visible.sync="showUpdateChannel"
      title="编辑渠道"
      ok-button="生成渠道链接"
      :ok-button-size="90"
      @cancelFunc="cancelUpdateChannel"
      @confirmFunc="confirmUpdateChannel"
    >
      <InputShowLimit
        :input-value.sync="channelName"
        maxlength="32"
        label-width="0"
        placeholder="请填写渠道名称,方便标记使用"
      />
    </BottomPopup>
    <BottomPopup
      v-if="showDeleteChannel"
      :visible.sync="showDeleteChannel"
      title="删除渠道"
      ok-button="确定"
      @cancelFunc="cancelDeleteChannel"
      @confirmFunc="confirmDeleteChannel"
    >
      <div class="delete-context">
        <div class="icon">
          <i class="iconfont icon-exclamation-point" style="font-size: 25px; color: #F59A23;" />
        </div>
        <div class="text">
          删除后，该渠道链接将失效，之前的统计数据也将被删除并不可恢复，是否继续？
        </div>
      </div>
    </BottomPopup>
  </van-popup>
</template>
<script>
import { RADAR_TYPE } from '@/utils/constants';
import ReturnHeader from '@/components/ReturnHeader.vue';
import BottomPopup from '@/components/BottomPopup.vue';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import InputShowLimit from '@/components/InputShowLimit.vue';
import { PAGE_LIMIT } from '@/utils/constants';
import { getRadarChannelDetails, addRadarChannel, deleteRadarChannel, updateRadarChannel, getRadarChannelList } from '@/api/radar';
import { mapState, mapMutations } from 'vuex';
import ClipboardJS from 'clipboard';
const ACTIVE_COLOR = '#6BB4AB';
export default {
  name: '',
  components: { ReturnHeader, BottomPopup, InputShowLimit, EmptyDefaultIcon },
  props: {
    /**
     * 雷达类型
     */
    type: {
      type: Number,
      default: RADAR_TYPE['personal']
    },
    // 是否是个人雷达
    isPersonal: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      ACTIVE_COLOR,
      // 渠道列表
      channelList: [],
      // 鼠标进入的item下标
      mouseEnterIndex: -1,
      // 添加渠道
      showAddChannel: false,
      // 渠道名称
      channelName: '',
      // 渠道ID
      channelId: '',
      // 删除渠道
      showDeleteChannel: false,
      // 编辑渠道
      showUpdateChannel: false,
      // 分页
      // eslint-disable-next-line no-magic-numbers
      pageSize: PAGE_LIMIT * 2,
      // 第几页
      pageNum: 1,
      // 下拉刷新
      refreshing: false,
      // 上滑刷新
      loading: false,
      // 是否加载完毕
      finished: false,
      // 加载错误 点击可重新请求
      error: false
    };
  },
  computed: {
    ...mapState('radarData', {
      radarId: (state) => state.radarId,
      radarChannelIsShow: (state) => state.radarChannelIsShow
    })
  },
  watch: {
    radarChannelIsShow(val) {
      if (val) {
        this.pageNum = 1;
        this.finished = false;
        this.getRadarChannelList();
      }
    }
  },
  mounted() {
    this.clipboard = new ClipboardJS('.url-copy');
    this.clipboard.on('success', (e) => {
      this.$toast('复制成功');
    });
    this.clipboard.on('error', (e) => {
      this.$toast('文件路径复制失败');
    });
  },
  methods: {
    goBack() {
      this.changeRadarChannelIsShow(false);
      this.channelList = [];
    },
    ...mapMutations('radarData', { changeRadarChannelIsShow: 'changeRadarChannelIsShow' }),
    /**
     * @description:获取渠道列表
     * @return {*}
     */
    getRadarChannelList() {
      getRadarChannelList({ radarId: this.radarId, pageNum: this.pageNum, pageSize: this.pageSize })
        .then((res) => {
          this.channelList = res.rows;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    mouseEnter(index) {
      this.mouseEnterIndex = index;
    },
    mouseLeave() {
      this.mouseEnterIndex = -1;
    },
    /**
     * @description: 点击添加渠道
     * @return {*}
     */
    addChannel() {
      this.channelName = '';
      this.showAddChannel = true;
    },
    /**
     * @description: 确认添加渠道
     * @return {*}
     */
    async confirmAddChannel() {
      if (!this.channelName.trim()) {
        this.$toast.fail('请填写渠道名称');
        return;
      }
      const addRes = await addRadarChannel({
        name: this.channelName,
        radarId: this.radarId
      });
      if (addRes) {
        this.$toast.success('添加成功');
        this.pageNum = 1;
        this.finished = false;
        this.getRadarChannelList(); // 刷新请求
        this.showAddChannel = false;
        this.channelName = '';
      }
    },
    /**
     * @description: 取消添加渠道
     * @return {*}
     */
    cancelAddChannel() {
      this.showAddGroup = false;
      this.channelName = '';
    },
    /**
     * @description: 点击删除
     * @param {*} channelId 渠道id
     * @return {*}
     */
    deleteChannel(channelId) {
      this.channelId = channelId;
      this.showDeleteChannel = true;
    },
    /**
     * @description: 确认删除渠道
     * @return {*}
     */
    async confirmDeleteChannel() {
      const deleteRes = await deleteRadarChannel({
        idList: [this.channelId]
      });
      if (deleteRes) {
        this.$toast.success('删除成功');
        this.pageNum = 1;
        this.finished = false;
        this.getRadarChannelList();
        this.showDeleteChannel = false;
        this.channelId = '';
      }
    },
    /**
     * @description: 取消删除渠道
     * @return {*}
     */
    cancelDeleteChannel() {
      this.showDeleteChannel = false;
      this.channelId = '';
    },
    /**
     * @description: 点击编辑
     * @param {*} channelId 渠道id
     * @return {*}
     */
    updateChannel(channelId) {
      this.channelId = channelId;
      // 请求渠道信息
      getRadarChannelDetails({ id: this.channelId }).then((res) => {
        this.channelName = res.data.name;
        this.showUpdateChannel = true;
      });
    },
    /**
     * @description: 确认编辑渠道
     * @return {*}
     */
    async confirmUpdateChannel() {
      if (!this.channelName.trim()) {
        this.$toast.fail('请填写渠道名称');
        return;
      }
      const addRes = await updateRadarChannel({
        name: this.channelName,
        id: this.channelId,
        radarId: this.radarId
      });
      if (addRes) {
        this.$toast.success('编辑成功');
        this.pageNum = 1;
        this.finished = false;
        this.getRadarChannelList();
        this.showUpdateChannel = false;
        this.channelName = '';
        this.channelId = '';
      }
    },
    /**
     * @description: 取消编辑渠道
     * @return {*}
     */
    cancelUpdateChannel() {
      this.showUpdateChannel = false;
      this.channelName = '';
      this.channelId = '';
    },
    /**
     * @description: 请求渠道列表
     * @return {*}
     */
    getList(page) {
      if (page === 1) {
        this.pageNum = 1;
        const params = { radarId: this.radarId, pageNum: this.pageNum, pageSize: this.pageSize };
        getRadarChannelList(params).then((res) => {
          this.$toast.success('刷新成功');
          this.refreshing = false;
          this.channelList = res.rows;
        });
      } else {
        const params = { radarId: this.radarId, pageNum: this.pageNum, pageSize: this.pageSize };
        getRadarChannelList(params).then((res) => {
          this.loading = false; // 加载状态结束
          if (this.pageNum !== 1) {
            this.channelList.push(...res.rows);
          }
          // 当渠道数量刚好是10的倍数时
          if (res.rows && res.rows.length !== 0) {
            if (res.rows.length < PAGE_LIMIT) {
              this.finished = true;
            } else {
              this.pageNum++;
            }
          } else {
            this.finished = true; // 全部加载完成
          }
        }).catch(() => {
          this.error = true;
        });
      }
    }

  }

};
</script>
<style scoped lang='less'>
.radar-channel-page {
    width: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    background-color: white;
    .channel-top-wrap{
      padding: 10px;
      display: flex;
      flex-direction: column;
      .notice-div {
        display: flex;
        align-items: center;
        font-size: 12px;
        line-height: 17px;
      }
      .add-radar {
          display: flex;
          align-items: center;
          margin: 10px 0;
          color: @green;
          cursor: pointer;
          .van-icon-add-o {
              margin-right: 5px;
          }
      }
    }
    .radar-list-empty{
      flex: 1;
      overflow-y: scroll;
    }
    .channel-list{
      padding: 0 10px;
      .channel-list-item{
        display: flex;
        flex-direction: column;
        .item-top{
          margin-top: 7px;
          display: flex;
          align-items: center;
          height: 22px;
          justify-content: space-between;
          .item-top-left{
            line-height: 22px;
            max-width: 180px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .item-top-right{
            color: #6BB4AB;
            font-size: 12px;
            display: flex;
            div{
              cursor: pointer;
              line-height: 14px;
              margin-right: 5px;
              padding: 0 5px;
              border-right:1px solid #6BB4AB;
              &:last-child{
                border: none;
              }
            }
          }
        }
        .item-bottom{
          color: #888;
          font-size: 12px;
          padding: 7px 0 5px 0;
          border-bottom:1px solid #f4f4f4;
        }
      }
    }
    .delete-context{
      display: flex;
      .icon{
        width: 25px;
        height: 25px;
        margin: 0 10px 0 17px;
      }
      .text{
        flex: 1;
      }
    }

}
</style>
