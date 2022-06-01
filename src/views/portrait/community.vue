<template>
  <div>
    <!-- 头部 -->
    <ReturnHeader @goBack="$router.back()" />
    <!-- 标签页 -->
    <div class="labelPge">
      <van-tabs
        v-model="active"
        color="#6BB4AB"
        title-active-color="#6BB4AB"
        line-width="50%"
        line-height="1.4px"
      >
        <van-tab :title="'添加的员工(' + staff.length + ')'">
          <van-list v-model="loading" :finished="finished" @load="onLoad">
            <van-cell v-for="(item, index) in staff" :key="index">
              <div class="details">
                <div class="detail">
                  <div class="left">
                    <div class="img">
                      <img :src="item.headImageUrl" alt="">
                    </div>
                    <div class="right">
                      <div>
                        <span>{{ item.userName }} &nbsp; &nbsp;</span>
                      </div>
                      <div class="c9">
                        <span>添加时间：</span>
                        <span>{{ getTime(item.createTime) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </van-cell>
          </van-list>
        </van-tab>
        <van-tab :title="'添加的群聊(' + groupChat.length + ')'">
          <div class="groupchat1" @click="conGroup">只看与我共同的群聊</div>
          <van-list v-model="loading" :finished="finished" @load="onLoad">
            <van-cell v-for="(item, index) in groupChat" :key="index">
              <div class="details">
                <div class="detail">
                  <div class="left">
                    <div class="img">
                      <img src="@/assets/avatar.jpg" alt="">
                    </div>
                    <div class="right">
                      <div>
                        {{ item.groupName + '(' + item.groupMemberNum + ')' }}
                      </div>
                      <div>
                        <span class="c9">群主：</span>
                        <span class="c9">{{ item.ownerName }}</span>
                      </div>
                      <div class="c9">
                        <span>入群时间：</span><span>{{ getTime(item.joinTime) }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-if="item.commonGroup" class="groupchat2">
                    共同群聊
                  </div>
                </div>
              </div>
            </van-cell>
          </van-list>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script>
import { findAddaddEmployes, findAddGroupNum } from '@/api/portrait';
import { TWO_DIGITS } from '@/utils/constants';
import ReturnHeader from '@/components/ReturnHeader.vue';

export default {
  components: { ReturnHeader },
  data() {
    return {
      active: 0,
      //   添加员工
      list: [],
      loading: false,
      finished: false,
      staff: [], // 添加的员工
      groupChat: [], // 显示的群聊
      commonGroup: [], // 共同的群聊
      allGroup: [], // 添加的所有群聊
      //   externalUserid: "wmiGuBCgAAIH-T9ekaE-Q52N2lKWeInw",
      externalUserid: '',
      // 是否筛选出共同群聊
      filterCommonGroup: false
    };
  },
  computed: {
    userId() {
      return this.$store.state.userId; // 员工Id
    }
  },
  created() {
    this.externalUserid = this.$route.query.customerId;
    this.findAddaddEmployes();
    this.findAddGroupNum();
  },
  methods: {
    conGroup() {
      this.filterCommonGroup = !this.filterCommonGroup;
      this.groupChat = this.filterCommonGroup ? this.commonGroup : this.allGroup;
    },
    onLoad() {
      const DELAY_TIME = 1000;
      const COUNT = 2;
      setTimeout(() => {
        for (let i = 0; i < COUNT; i++) {
          this.list.push(this.list.length + 1);
        }

        // 加载状态结束
        this.loading = false;

        // 数据全部加载完成
        if (this.list.length >= COUNT) {
          this.finished = true;
        }
      }, DELAY_TIME);
    },
    findAddaddEmployes() {
      findAddaddEmployes(this.externalUserid)
        .then(({ data }) => {
          //   console.log(data);
          this.staff = data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    findAddGroupNum() {
      findAddGroupNum({
        externalUserid: this.externalUserid,
        userId: this.userId
      })
        .then(({ data }) => {
          //   console.log(data);
          //   debugger
          this.groupChat = data;
          this.allGroup = data;
          this.commonGroup = this.groupChat.filter((ele) => {
            //   debugger
            return ele.commonGroup === 1;
          });
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 时间处理器
    getTime(data) {
      const date = new Date(data);
      // console.log(timer.getFullYear());
      var Y = date.getFullYear() + '-';
      var M =
        (date.getMonth() + 1 < TWO_DIGITS
          ? '0' + (date.getMonth() + 1)
          : date.getMonth() + 1) + '-';
      var D =
        date.getDate() < TWO_DIGITS ? '0' + date.getDate() : date.getDate() + '   ';
      var h =
        (date.getHours() < TWO_DIGITS ? '0' + date.getHours() : date.getHours()) + ':';
      var m =
        date.getMinutes() < TWO_DIGITS ? '0' + date.getMinutes() : date.getMinutes();
      return Y + M + D + h + m.toString();
    }
  }
};
</script>

<style lang="less" scoped>
/deep/body {
  width: 100%;
  height: 600px;
}
.labelPge {
  width: 100%;
  height: 100%;
  background-color: #f2f2f2;
}
.header {
  margin: 20px 20px 10px;
  vertical-align: center;
  text-align: left;
}
.van-icon-cross {
  float: right;
}
.title {
  text-align: center;
  font-size: 14px;
}
/* 添加的员工 */
.details {
  margin: 0 10px;
}
.detail {
  display: flex;
  justify-content: space-between;
  .c9 {
    color: #9c9c9c;
    font-size: 12px;
  }
}
.left {
  display: flex;
  .img {
    width: 50px;
    height: 50px;
    background-color: #f2f2f2;
    margin-right: 10px;
    border-radius: 25px;
    vertical-align: bottom;
  }
  .right {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}
// 添加的群聊
.groupchat1 {
  width: 120px;
  height: 20px;
  font-size: 12px;
  background-color: #fff;
  border-radius: 20px;
  text-align: center;
  line-height: 20px;
  margin: 10px 20px;
  cursor: pointer;
}
.groupchat2 {
  width: 60px;
  height: 20px;
  font-size: 12px;
  background-color: #fff;
  border-radius: 5px;
  text-align: center;
  line-height: 20px;
  margin: 10px 0px;
  color: #2c8cf0;
  border: 1px solid #2c8cf0;
}
</style>
