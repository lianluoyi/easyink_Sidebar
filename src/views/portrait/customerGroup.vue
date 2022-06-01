<!--
 * @Description: 客户群界面
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="customer-group-page">
    <div class="group-base-info">
      <van-cell-group :border="false">
        <van-cell title="创建时间" :value="groupInfo.createTime" :border="false" />
        <van-cell title="群公告" :value="groupInfo.notice" :border="false" />
        <van-cell title="标签" is-link value="内容" :border="false" @click="labelEdit">
          <template #default>
            <van-tag
              v-for="(tagItem, tagIndex) in groupInfo.tagList"
              :key="tagIndex"
              plain
              class="gray-tag-item"
            >{{ tagItem.name }}
            </van-tag>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
    <div class="divider" />
    <div class="variety-type-total-div">
      <div class="detail">
        <div class="detail-title">成员统计</div>
      </div>
      <div class="detail">
        <div class="boxnumber">
          <p>客户(外部联系人)</p>
          <div class="number">{{ memberCountInfo.customerCount }}</div>
        </div>
        <div class="boxnumber">
          <p>企业成员</p>
          <div class="number">{{ memberCountInfo.staffCount }}</div>
        </div>
      </div>
    </div>

    <div class="divider" />
    <div class="addwaiting">
      <van-tabs
        v-model="query.trajectoryType"
        color="#6BB4AB"
        title-active-color="#6BB4AB"
        class="trajectory-tabs"
        :stretch="false"
        tab-position="left"
        @change="findTrajectory()"
      >
        <van-tab :name="4" title="待办事项" title-class="wait-tab" :badge="todoCount === 0 ? null : todoCount">
          <StepList :step-list="listBacklog" />
        </van-tab>
      </van-tabs>
    </div>

  </div>
</template>
<script>
import StepList from '@/components/StepList.vue';

export default {
  name: '',
  components: { StepList },
  props: {
    /**
     * 群详情
     */
    groupInfo: {
      type: Object,
      default: () => {
        return {
          createTime: '',
          notice: '',
          tagList: []
        };
      }
    },
    // 群成员数量详情
    memberCountInfo: {
      type: Object,
      default: () => {
        return {
          customerCount: 0,
          staffCount: 0
        };
      }
    },
    addTag: {
      type: Array,
      default: () => []
    },
    listBacklog: {
      type: Array,
      default: () => []
    },
    todoCount: {
      type: Number,
      default: 0
    },
    findTrajectory: {
      type: Function,
      default: () => {}
    },
    query: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  methods: {
    // 点击编辑按钮
    labelEdit() {
      this.$emit('update:show', true);
      this.$emit('update:addTag', this.groupInfo ? [...this.groupInfo.tagList] : []);
    }
  }

};
</script>
<style scoped lang='less'>
.customer-group-page {
    height: 100%;
    background-color: #fff;
    .group-base-info {
        padding-bottom: 10px;
        /deep/ .van-cell-group {
            .van-cell {
                padding-bottom: 0;
                .van-cell__title {
                    width: 56px;
                    flex: initial;
                    margin-right: 20px;
                    span {
                        display: inline-block;
                        width: 100%;
                        text-align: justify;
                        height: 20px;
                        overflow: hidden;
                        color: #9c9c9c;
                    }
                    span:after {
                        content: '';
                        display: inline-block;
                        width: 100%;
                    }
                }
                .van-cell__value {
                    flex: 1;
                    color: @black;
                    text-align: left;
                }
            }
        }
    }
}
</style>
