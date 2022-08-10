
<template>
  <div class="radar-content-div">
    <van-search
      v-model="query.searchTitle"
      class="search-input"
      placeholder="请输入雷达/链接标题，回车搜索"
      @search="search"
    />
    <van-notice-bar
      v-if="type === RADAR_TYPE['personal'] && !isPC()"
      class="notice-div"
      left-icon="bell"
      wrapable
      text="移动端暂不支持编辑雷达，请前往PC端操作"
    />
    <div v-if="canManage" class="add-radar" @click="addRadar"><van-icon name="add-o" />添加雷达</div>

    <EmptyDefaultIcon class="radar-list-empty" :length="radarData.length" text="暂无数据">
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
          <div class="all-radar-list">
            <RadarItem v-for="(item, index) of radarData" :key="index" :item="item" :type="type" :can-manage="isPC()" @changeRadar="redactRadar" @delete="deleteRadar" />
          </div>
        </van-list>
      </van-pull-refresh>
    </EmptyDefaultIcon>
    <AddOrRedactRadarPage
      v-if="showAddRadar"
      :type="type"
      :radar-id="redactRadarId"
      @reGetList="reGetList"
      @closePage="closePage"
      @setEmptyId="setEmptyId"
    />
    <RadarDetails :type="type" />
    <RadarChannel :type="type" :is-personal="type === RADAR_TYPE['personal']" />
    <BottomPopup
      :visible.sync="showDeleteRadar"
      title="删除雷达"
      ok-button="确 定"
      @cancelFunc="cancelDeleteRadar"
      @confirmFunc="confirmDeleteRadar"
    >
      <div class="delete-context">
        <div class="icon">
          <i class="iconfont icon-exclamation-point" style="font-size: 25px; color: #F59A23;" />
        </div>
        <div class="text">
          删除后，不可继续使用该雷达链接，之前的统计数据也将被删除并不可恢复，是否继续？
        </div>
      </div>
    </BottomPopup>
  </div>
</template>
<script>
import { getRadarList } from '@/api/radar';
import { RADAR_TYPE } from '@/utils/constants';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import { PAGE_LIMIT } from '@/utils/constants';
import RadarItem from './RadarItem.vue';
import AddOrRedactRadarPage from './AddOrRedactRadarPage.vue';
import RadarDetails from './RadarDetails.vue';
import RadarChannel from './RadarChannel.vue';
import { deleteRadar } from '@/api/radar';
import BottomPopup from '@/components/BottomPopup.vue';
import { mapState } from 'vuex';
export default {
  name: '',
  components: { EmptyDefaultIcon, RadarItem, AddOrRedactRadarPage, RadarDetails, RadarChannel, BottomPopup },
  props: {
    /**
     * 雷达类型
     */
    type: {
      type: Number,
      default: RADAR_TYPE['personal']
    }
  },
  data() {
    return {
      // 下拉刷新
      refreshing: false,
      // 上滑刷新
      loading: false,
      // 是否加载完毕
      finished: false,
      // 加载错误 点击可重新请求
      error: false,
      // 雷达列表
      radarData: [],
      // 显示添加/编辑雷达
      showAddRadar: false,
      // 显示搜索的雷达列表
      showSearchList: false,
      // 编辑雷达的ID
      redactRadarId: '',
      // 显示删除雷达提示
      showDeleteRadar: false,
      // 定义搜索的条件
      query: {
        pageSize: PAGE_LIMIT,
        pageNum: 1,
        searchTitle: ''
      },
      RADAR_TYPE
    };
  },
  computed: {
    ...mapState('radarData', { radarId: (state) => state.radarId }),
    /**
     * 能否管理雷达
     */
    canManage() {
      return this.type === RADAR_TYPE['personal'] && this.isPC();
    },
    userId() {
      return this.$store.state.userId;
    }
  },
  watch: {},
  created() {
    this.getRadar();
  },
  methods: {
    /**
     * @description: 关闭添加或编辑雷达页面
     * @return {*}
     */
    closePage() {
      this.showAddRadar = false;
    },
    /**
     * @description: 设randarId为空
     * @return {*}
     */
    setEmptyId() {
      this.redactRadarId = '';
    },
    /**
     * @description: 点击删除
     * @return {*}
     */
    deleteRadar() {
      this.showDeleteRadar = true;
    },
    /**
     * @description: 取消删除雷达
     * @return {*}
     */
    cancelDeleteRadar() {
    },
    /**
     * @description: 确定删除雷达
     * @return {*}
     */
    confirmDeleteRadar() {
      deleteRadar({ idList: [this.radarId] }).then((res) => {
        this.$toast.success('删除成功');
        this.reGetList({ pageNum: 1 }); // 重新请求雷达列表
      });
    },
    // 重新获取雷达列表数据
    reGetList(val) {
      this.$set(this.query, 'pageNum', val.pageNum);
      this.finished = false;
      this.getRadar();
    },
    // 编辑雷达
    redactRadar(radarId) {
      this.redactRadarId = radarId;
      this.showAddRadar = true;
    },
    /**
     * 搜索雷达
     */
    async search() {
      this.query.pageNum = 1;
      this.finished = false;
      const params = { ...this.query, type: this.type };
      getRadarList(params).then((res) => {
        this.radarData = res.rows;
      });
    },
    /**
     * @description:添加雷达
     * @return {*}
     */
    addRadar() {
      this.redactRadarId = '';
      this.showAddRadar = true;
    },
    /**
     * @description: 获取雷达数据
     * @return {*}
     */
    getRadar() {
      const params = { ...this.query, type: this.type };
      getRadarList(params).then((res) => {
        this.radarData = res.rows;
      });
    },
    /**
     * @description: 请求雷达列表
     * @return {*}
     */
    getList(page) {
      if (page === 1) {
        this.query.pageNum = 1;
        const params = { ...this.query, type: this.type };
        this.finished = false;
        getRadarList(params).then((res) => {
          this.$toast.success('刷新成功');
          this.refreshing = false;
          this.radarData = res.rows;
        });
      } else {
        const params = { ...this.query, type: this.type };
        getRadarList(params).then((res) => {
          this.loading = false; // 加载状态结束
          if (this.query.pageNum !== 1) {
            this.radarData.push(...res.rows);
          }
          // 当雷达数量刚好是10的倍数时
          if (res.rows && res.rows.length !== 0) {
            if (res.rows.length < PAGE_LIMIT) {
              this.finished = true;
            } else {
              this.query.pageNum++;
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
.radar-content-div {
    padding: 10px 10px 50px 10px;
    .search-input {
        margin-bottom: 10px;
        padding: 0;
        border-radius: 4px;
        .van-search__content {
            background-color: #fff;
        }
    }
    .notice-div {
      display: flex;
      align-items: center;
    }
    .van-notice-bar {
        padding: 5px 10px;
        font-size: 13px;
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
    .radar-list-empty {
      margin-top: 10px;
      .all-radar-list {
        width: 100%;
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
