<template>
  <div class="portrait-page">
    <div v-if="portraitType === 'customer'" class="portrait-div">      <!-- 头部 -->
      <!-- 详细资料 -->
      <div class="details">
        <div class="detail user-info">
          <div class="left">
            <div class="img"><img :src="form.avatar" alt=""></div>
            <div class="right">
              <div>
                <span>{{ form.name }}</span>
                <span :class="form.type === wxType ? 'wx-type-flag' : 'corp-type-name'">
                  {{ dealAtInfo(form) }}
                </span>

              </div>
              <div class="c9">

                <span class="remark-name">{{
                  form.remark
                }}</span>
                <span class="corp-type-name">{{ form.remarkCorpName || '' }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="detail">
          <div class="c9">性别</div>
          <div>{{ GENDER_TYPE[form.gender] || '未知' }}</div>
        </div>
        <div v-if="showAge" class="detail">
          <div class="c9">年龄</div>
          <div>{{ form.age || '' }}</div>
        </div>
        <div class="detail">
          <div class="c9">来源</div>
          <div>{{ addWayMap[form.addWay] }}</div>
        </div>
        <div class="detail">
          <div class="c9">添加时间</div>
          <div>{{ form.createTime }}</div>
        </div>
        <!-- 客户标签 -->
        <div class="detail tag-list-div">
          <div class="c9" style="padding-top:4px">标签</div>
          <div class="tag-list">
            <van-row gutter="10" class="labelstyle">
              <div
                v-for="(item, index) in form.weTagGroupList"
                :key="index"
              >
                <div
                  v-for="(item1, index1) in item.weTags"
                  :key="index1"
                  class="label toe"
                  :title="item1.name"
                >
                  {{ item1.name }}
                </div>
              </div>
            </van-row>
          </div>
          <div>
            <van-icon name="arrow" @click="labelEdit" />
          </div>
        </div>
      </div>
      <div class="divider" />
      <!-- 社群关系 -->
      <div class="realationship variety-type-total-div">
        <div class="detail">
          <div class="detail-title">社群关系</div>
          <div class="data" @click="goRoute('/community')">详情</div>
        </div>
        <div class="detail">
          <div class="boxnumber">
            <p>添加的员工</p>
            <div class="number">{{ staff.length }}</div>
          </div>
          <div class="boxnumber">
            <p>进入的群聊</p>
            <div class="number">{{ groupChat.length }}</div>
          </div>
          <div class="boxnumber">
            <p>共同的群聊</p>
            <div class="number">{{ commonGroup.length }}</div>
          </div>
        </div>
      </div>
      <div class="divider" />
      <!-- 客户轨迹 -->
      <div class="addwaiting">
        <van-tabs v-model="query.trajectoryType" color="#6BB4AB" title-active-color="#6BB4AB" class="trajectory-tabs" @change="changeInfo">
          <van-tab :name="2" title="客户资料" style="margin-bottom:45px">
            <CustomerInfo
              :form-data="form"
              :user-info="{
                externalUserid: externalUserid, userId: userId
              }"
              :get-customer-info="getCustomerInfo"
            />
          </van-tab>
          <van-tab :name="1" title="信息动态">
            <StepList :step-list="listNews" />
          </van-tab>
          <van-tab :name="3" title="活动轨迹">
            <StepList :step-list="listActivity" />
          </van-tab>
          <van-tab :name="4" title="待办事项" style="margin-bottom:30px" title-class="wait-tab" :badge="todoCount === 0 ? null : todoCount">
            <StepList :step-list="listBacklog" class="todo-list" />
            <div class="add-circle" @click="usershow = true">
              <van-icon name="plus" color="#fff" />
            </div>
          </van-tab>
        </van-tabs>
      </div>
      <!-- 点击添加待办触发弹出框开始 -->
      <van-action-sheet v-model="usershow">
        <van-nav-bar
          title="客户待办"
          right-text="取消"
          @click-right="usershow = false"
        />
        <!-- 表单 -->
        <van-form @submit="onSubmit">
          <!-- 待办内容 -->
          <van-field
            v-model="conagency"
            name="待办内容"
            label="待办内容"
            placeholder="请输入待办内容"
            type="textarea"
            required
            :rules="[{ required: true, message: '请输入待办内容' }]"
            class="conagency"
          />

          <!-- 待办日期 -->
          <van-field
            v-model="dateagency"
            is-link
            readonly
            label="待办日期"
            placeholder="请选择"
            required
            :rules="[{ required: true, message: '请输入待办日期', trigger:'onChange' }]"
            @click="dateshow = true"
          />
          <van-calendar
            v-model="dateshow"
            color="#1989fa"
            :min-date="minDate"
            :max-date="maxDate"
            @confirm="onConfirm"
          />
          <!-- 待办时间 -->
          <van-field
            v-model="timeagency"
            is-link
            readonly
            label="待办时间"
            placeholder="请选择"
            required
            :rules="[{ required: true, message: '请输入待办时间', trigger:'onChange' }]"
            @click="starttimeshow = true"
          />
          <van-action-sheet v-model="starttimeshow">
            <van-datetime-picker
              v-model="startTime"
              type="time"
              title="请选择开始时间"
              :min-hour="0"
              :max-hour="23"
              @cancel="timecancel"
              @confirm="starttimeconfirm"
            />
          </van-action-sheet>
          <van-action-sheet v-model="endtimeshow">
            <van-datetime-picker
              v-model="endTime"
              type="time"
              title="请选择结束时间"
              :min-hour="minHour"
              :max-hour="23"
              @cancel="timecancel"
              @confirm="endtimeconfirm"
            />
          </van-action-sheet>
          <!-- 保存 -->
          <div style="margin: 30px;">
            <van-button
              round
              block
              type="info"
              native-type="submit"
              @click="saveInfo2"
            >保存</van-button>
          </div>
        </van-form>
      </van-action-sheet>
    </div>
    <CustomerGroup
      v-else
      :group-info="groupInfo"
      :member-count-info="memberCountInfo"
      :add-tag.sync="addTag"
      :show.sync="show"
      :list-backlog="listBacklog"
      :todo-count="todoCount"
      :find-trajectory="findTrajectory"
      :query="query"
    />
    <TagModal
      :show.sync="show"
      :tag-actions="tagActions"
      :tag-groups="tagGroups"
      :add-tag="addTag"
      :external-userid="externalUserid"
      :user-id="userId"
      :get-customer-info="portraitType === 'customer' ? getCustomerInfo : getChatInfo"
      :trajectory-type="query.trajectoryType"
      :portrait-type="portraitType"
      :old-tag="oldTag"
      :old-tag-list="groupInfo ? groupInfo.tagList : []"
    />

  </div>
</template>

<script>
import {
  getCustomerInfo,
  getAllTags,
  findAddaddEmployes,
  findAddGroupNum,
  findTrajectory,
  addOrEditWaitHandle,
  getTodoCount
} from '@/api/portrait';
import { getChatList } from '@/api/group';
import { getGroupTagList } from '@/api/grouptag';
import StepList from '@/components/StepList.vue';
import { param2Obj, dealAtInfo } from '@/utils/index';
import { TWO_DIGITS, TRAJECTORY_TYPE, TRAJECTORY_TYPE_FIELD, GENDER_TYPE, ADD_WAY_MAP, WX_TYPE } from '@/utils/constants';
import CustomerInfo from './customerInfo.vue';
import CustomerGroup from './customerGroup.vue';
import { getMemberCount } from '@/api/group';
import TagModal from './component/tagModal.vue';

const MAX_YEAR = 2030;
const MAX_MONTH = 12;
const MAX_DATE = 31;
const PAGE_SIZE = 10;
const DEFAULT_TRAJECTORYTYPE = 2;
export default {
  components: {
    StepList,
    CustomerInfo,
    CustomerGroup,
    TagModal
  },
  provide() {
    return {
      findTrajectory: this.findTrajectory,
      changeListVal: this.changeListVal,
      removeCount: this.removeCount,
      getExternalUserId: () => this.externalUserid
    };
  },
  data() {
    return {
      // 客户标签弹出框
      show: false,
      // 客户待办的弹出框开始
      usershow: false,
      conagency: '', // 待办内容

      // 待办日期
      dateagency: '',
      dateshow: false,
      minDate: new Date(),
      maxDate: new Date(MAX_YEAR, MAX_MONTH, MAX_DATE),
      // 待办时间
      timeagency: '',
      starttimeshow: false,
      endtimeshow: false,
      currentTime: '12:00',
      startTime: '',
      endTime: '',
      // 待办动态
      todonewsshow: false,
      externalUserid: '',
      form: {
        name: '', // 昵称
        remarkMobiles: '', // 手机号
        age: '', // 年龄
        birthday: '', // 客户生日
        email: '', // 邮箱
        address: '', // 地址
        qq: '', // qq
        position: '', // 职业
        remarkCorpName: '', // 公司
        description: '', // 其他描述
        weTagGroupList: [] // 客户标签合集
      },
      oldTag: [],
      tagGroups: [], // 标签组
      customerGroupTagGroups: [], // 客户群标签组
      tagActions: [],
      groupTagActions: [],
      // 点击测试组标签获取的变量
      groupId: '',
      name: '',
      tagId: '',
      addTag: [], // 添加的参数
      styleActive1: '',
      styleActive2: '',
      styleActive3: '',
      styleActive4: '',
      //   activelabel:true
      staff: [], // 添加的员工
      groupChat: [], // 添加的群聊
      commonGroup: [], // 共同的群聊
      //   客户轨迹
      query: {
        page: 1,
        trajectoryType: DEFAULT_TRAJECTORYTYPE
      },

      loading: false,
      finished: false,
      listNews: [],
      listSocial: [],
      listActivity: [],
      listBacklog: [],
      agentId: '',
      // 是否展示客户画像页面
      portraitType: 'customer',
      GENDER_TYPE,
      addWayMap: ADD_WAY_MAP,
      wxType: WX_TYPE,
      // 待办事项数量
      todoCount: 0,
      groupInfo: {},
      // 群成员数量
      memberCountInfo: {}
    };
  },
  computed: {
    userId() {
      return this.$store.state.userId;
    },
    minHour() {
      const date = new Date();
      return this.dateagency === this.getTime() ? date.getHours() : 0;
    },
    /**
     * 年龄根据出生日期是否启用来决定是否显示
     */
    showAge() {
      return this.$store.state.customerProperty?.customerProperList.findIndex(item => item.name === '出生日期') > -1;
    }
  },
  watch: {
    '$store.state.agentConfigStatus'(val) {
      val && this.init();
    }
  },
  created() {
    this.$toast.loading({
      message: 'loading...',
      duration: 0,
      forbidClick: true
    });

    // 获取agentId
    let query = param2Obj(window.location.search);
    const hash = param2Obj(window.location.hash);
    query = Object.assign(query, hash);
    this.agentId = query.agentId;
    if (this.$store.state.agentConfigStatus && this.isLock) {
      this.init();
    }
  },

  methods: {
    // 时间处理器
    getTime(data) {
      const date = new Date();
      var Y = date.getFullYear() + '-';
      var M =
        (date.getMonth() + 1 < TWO_DIGITS
          ? '0' + (date.getMonth() + 1)
          : date.getMonth() + 1) + '-';
      var D = date.getDate() < TWO_DIGITS ? '0' + date.getDate() : date.getDate() + '';
      return Y + M + D;
    },
    init() {
      const _this = this;
      _this.$api.invoke('getContext', {}, function(res) {
        if (res.err_msg === 'getContext:ok') {
          const entry = res.entry; // 返回进入H5页面的入口类型，目前有normal、contact_profile、single_chat_tools、group_chat_tools
          _this.portraitType = entry === 'group_chat_tools' ? 'group' : 'customer';
          switch (_this.portraitType) {
            case 'customer': {
              _this.$api.invoke('getCurExternalContact', {}, (res) => {
                if (res.err_msg === 'getCurExternalContact:ok') {
                  _this.externalUserid = res.userId; // 返回当前外部联系人userId
                  // 获取客户信息
                  _this.findAddaddEmployes();
                  _this.findAddGroupNum();
                  _this.$store.dispatch('GetCustomerProperty');
                  _this.getCustomerInfo();
                  _this.findTrajectory();
                  _this.getTodoCount();
                  getAllTags()
                    .then(({ data }) => {
                      _this.tagGroups = data;
                      _this.tagActions = [{ text: '所有标签组', value: '', className: 'tag-group-name' }].concat(data.map(group => ({ text: group.groupName, value: group.groupName, className: 'tag-group-name' })));
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                } else {
                  // 错误处理
                  _this.$dialog({ message: '进入失败：' + JSON.stringify(res) });
                }
                _this.$toast.clear();
              });
              break;
            }
            case 'group': {
              _this.$api.invoke('getCurExternalChat', {}, (res) => {
                if (res.err_msg === 'getCurExternalChat:ok') {
                  _this.externalUserid = res.chatId; // 返回当前客户群id
                  _this.getChatInfo();
                  _this.getMemberCount();
                  _this.getGroupTagList();
                  _this.findTrajectory();
                  _this.getTodoCount();
                }
                _this.$toast.clear();
              });
              break;
            }
          }
        } else {
          // 错误处理
          _this.$toast.clear();
          _this.$dialog({ message: '进入失败：' + JSON.stringify(res) });
        }
      });
    },
    //   客户待办点击保存事件
    saveInfo2() {},
    // 添加或编辑轨迹
    addOrEditWaitHandle(form) {
      addOrEditWaitHandle(form)
        .then((data) => {
          //  重新获取列表
          this.findAddaddEmployes();
          this.$toast.success('保存成功');
          this.usershow = false;
          // 重新获取列表
          this.findTrajectory();
          this.getTodoCount();
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 获取轨迹信息
    findTrajectory(page) {
      return new Promise((resolve, reject) => {
        const query = {
          pageNum: page,
          pageSize: PAGE_SIZE,
          externalUserid: this.externalUserid
        };
        if (this.query.trajectoryType === TRAJECTORY_TYPE['backlog']) query.userId = this.userId;
        Object.assign(query, this.query);
        page && (query.page = page);
        findTrajectory(query)
          .then((data) => {
            this['list' + TRAJECTORY_TYPE_FIELD[query.trajectoryType]] = data.rows;
            resolve(data);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    // 不调用接口直接修改待办动态列表的数据
    changeListVal(id, key, val) {
      const newList = [...this['list' + TRAJECTORY_TYPE_FIELD[this.query.trajectoryType]]];
      const index = newList.findIndex(item => item.id === id);
      newList[index][key] = val;
      this['list' + TRAJECTORY_TYPE_FIELD[this.query.trajectoryType]] = newList;
    },
    // 点击信息动态
    changeInfo(tab) {
      this.findTrajectory();
    },
    // 添加代办
    // 表单提交
    onSubmit() {
      const form = {
        trajectoryType: TRAJECTORY_TYPE['backlog'],
        userId: this.userId,
        externalUserid: this.externalUserid,
        content: this.conagency,
        createDate: this.dateagency,
        startTime: this.startTime + ':00',
        endTime: this.endTime + ':00',
        status: 0,
        agentId: this.agentId
      };
      this.addOrEditWaitHandle(form);
      //   表单重置
      this.conagency = '';
      this.dateagency = '';
      this.startTime = '';
      this.endTime = '';
      this.timeagency = '';
    },
    // 待办日期
    formatDate(dateagency) {
      return `${dateagency.getFullYear()}-${dateagency.getMonth() +
        1}-${dateagency.getDate()}`;
    },
    onConfirm(dateagency) {
      this.dateshow = false;
      this.dateagency = this.formatDate(dateagency);
    },
    // 待办时间
    timecancel() {
      this.starttimeshow = false;
    },
    starttimeconfirm(value) {
      this.startTime = value;
      this.starttimeshow = false;
      this.endtimeshow = true;
      if (!this.endTime) this.endTime = value;
    },
    endtimeconfirm(value) {
      this.endTime = value;
      this.endtimeshow = false;
      let time = '';
      if (this.startTime > this.endTime) {
        time = this.startTime;
        this.startTime = this.endTime;
        this.endTime = time;
      }
      // console.log(this.startTime, this.endTime);
      this.endtimeshow = false;
      this.timeagency = this.formatTime();
    },
    formatTime() {
      return `${this.startTime}-${this.endTime}`;
    },
    // 待办动态
    // 点击删除按钮
    deltodoshow() {},

    goRoute(path) {
      this.$router.push({
        path,
        query: {
          customerId: this.externalUserid
          //   type
        }
      });
    },

    // 点击编辑按钮
    labelEdit() {
      this.show = true;
      if (this.form.weTagGroupList) {
        // 将已选中的标签渲染在弹窗中
        const newAddTag = [];
        for (const weTagGroupItem of this.form.weTagGroupList) {
          for (const tagItem of weTagGroupItem.weTags) {
            newAddTag.push(tagItem);
          }
        }
        this.addTag = newAddTag;
      }
      // 获取用户当前的lable,将当前用户的lable与所有lable进行对比，相同的弹框内蓝色展示
      // 弹框内的标签组选中时蓝色展示
      // 弹框内的子标签与选中时蓝色展示，点击时
    },
    findAddaddEmployes() {
      findAddaddEmployes(this.externalUserid)
        .then(({ data }) => {
          // console.log(data);
          this.staff = data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    findAddGroupNum() {
      // this.$toast('userId:' + this.userId)
      findAddGroupNum({
        externalUserid: this.externalUserid,
        userId: this.userId
      })
        .then(({ data }) => {
          //   console.log(data);
          this.groupChat = data;
          this.commonGroup = this.groupChat.filter((ele) => {
            //   debugger
            return ele.commonGroup === 1;
          });
          //   console.log(this.commonGroup);
        })
        .catch((err) => {
          console.log(err);
        });
    },

    getCustomerInfo() {
      // this.$toast('userId:' + this.userId)
      getCustomerInfo({
        externalUserid: this.externalUserid,
        userId: this.userId
      })
        .then(({ data }) => {
          this.form = data;
          // 初始时设置旧标签列表
          this.oldTag = [];
          data.weTagGroupList.forEach(item => {
            this.oldTag.push(...item.weTags);
          });
        })
        .catch((err) => {
          console.log(err);
        });
    },

    /**
     * 获取待办事项数量
     */
    getTodoCount() {
      getTodoCount({
        userId: this.userId,
        externalUserid: this.externalUserid
      }).then(res => {
        this.todoCount = res.data;
      });
    },
    /**
     * 待办事项数量减1
     */
    removeCount() {
      this.todoCount = this.todoCount - 1;
    },
    dealAtInfo(form) {
      return dealAtInfo(form);
    },
    /**
     * 获取客户群详情
     */
    async getChatInfo() {
      const getRes = await getChatList({
        chatId: this.externalUserid
      });
      if (getRes) {
        this.groupInfo = getRes.rows && getRes.rows[0];
      }
    },
    /**
     * 获取群成员统计数据
     */
    async getMemberCount() {
      const countRes = await getMemberCount({
        chatId: this.externalUserid
      });
      if (countRes) {
        this.memberCountInfo = countRes.data;
      }
    },
    /**
     * 获取所有客户群标签列表
     */
    async getGroupTagList() {
      const tagListRes = await getGroupTagList();
      if (tagListRes) {
        let resData = [...tagListRes.data];
        resData = resData.map(tag => ({ ...tag,
          groupName: tag.name, groupId: tag.id, weTags: tag.tagList.map(tag => ({ ...tag, tagId: tag.id })) }));
        this.tagGroups = resData;
        this.tagActions = [{ text: '所有标签组', value: '', className: 'tag-group-name' }].concat(resData.map(group => ({ text: group.groupName, value: group.groupName, className: 'tag-group-name' })));
      }
    }
  }
};
</script>

<style lang="less" scoped>
.header {
  margin: 20px 10px 10px;
  vertical-align: center;
  text-align: center;
}
.van-icon-cross {
  position: absolute;
  left: 10px;
}
.title {
  text-align: center;
}
//  详细资料
.details,
.userlabel {
  padding: 10px;
  background-color: #fff;
}
.details {
  .detail {
    margin-bottom: 10px;
    justify-content: flex-start;
  }
}
.detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  .data {
    cursor: pointer;
  }
  &:not(:first-child) .c9{
    width: 54px;
    text-align-last: justify;
    text-align: justify;
  }
  &:first-child .c9{
    display: flex;
    align-items: center;
  }
  .c9 {
    color: #9c9c9c;
    margin-right: 20px;
    .gender-icon {
      width: 18px;
      height: 18px;
      margin-right: 2px;
    }
    .corp-type-name {
      font-size: 13px;
    }
    .remark-name {
      font-size: 12px;
    }
  }
  .detail-entrance {
    display: flex;
    align-items: center;
    cursor: pointer;
    img {
      margin-left: 2px;
    }
  }
}
.tag-list-div {
  display: flex;
  align-items: flex-start;
  .tag-list {
      flex: 1;
  }
  .van-icon-arrow {
    cursor: pointer;
  }
}
.user-info {
  font-size: 14px;
  margin-bottom: 0px !important;
}
.left {
  display: flex;
  margin-bottom: 20px;
  .img {
    background-color: #f2f2f2;
    margin-right: 10px;
    img {
      width: 50px;
      height: 50px;
      border-radius: 3px;
    }
  }
  .right {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}
.data {
  font-size: 12px;
  color: @green
}
.van-action-sheet__header {
  .van-icon-cross {
    left: 85%;
    font-size: 16px;
  }
}
// 客户标签
.labelstyle {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  .label,
  .label1 {
    display: inline-block;
    min-width: 45px;
    max-width: 100px;
    font-size: 12px;
    padding: 0 10px;
    line-height: 24px;
    height: 24px;
    background-color: #EDEDED;
    color: @black;
    text-align: center;
    margin: 0 5px 5px 0;
    border-radius: 4px;
  }
}
.userlabel .labelstyle {
  padding-top: 5px;
}
.branch {
  position: relative;
}

.addwaiting {
  position: relative;
  flex: 1;
  .todo-list {
    /deep/ .cover-img {
    border: none;
  }
  }
  .trajectory-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;
    /deep/ .van-tabs__content {
      position: relative;
      .van-tab__pane {
        height: 100%;
        position: relative;
        display: flex;
        flex-direction: column;
      }
    }
  }
  .labelstyle {
    .label1 {
      width: 80px;
      margin-bottom: 20px;
      border-radius: 40px;
    }
  }
  .van-tabs {
    /deep/ .van-tabs__wrap {
      .van-tabs__nav {
        .van-tab {
          font-size: 12px;
        }
        /deep/ .van-tab__text--ellipsis {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
      }
    }
  }
  .step-list-div {
    /deep/ .van-list {
      margin-top: 3px;
      .van-list__error-text, .van-list__finished-text, .van-list__loading, .van-loading__text {
        font-size: 12px;
        color: #999;
      }
    }

  }
  .detail-entrance {
    display: flex;
    align-items: center;
    img {
      margin-left: 2px;
    }
  }
}
//  客户轨迹
.f12 {
  color: #9c9c9c;
  font-size: 12px;
  font-weight: 600;
}
.po {
  position: relative;
}
.fs14 {
  color: #333;
  font-size: 14px;
  position: relative;
  left: 20px;
}
.con {
  left: 51px;
  margin-top: 20px;
}
/deep/.van-step__circle {
  width: 8px;
  height: 8px;
  // margin-left: 110px;
}
/deep/.van-step__line {
  // left: 39px;
  width: 1px !important;
}
.finish {
  position: relative;
  color: #2c8cf0;
  font-size: 12px;
  font-weight: 600;
  right: -165px;
}
.deldynamic {
  float: right;
  color: #9c9c9c;
  font-size: 12px;
  font-weight: 600;
}
.van-step--vertical:not(:last-child)::after {
  border-width: 1px;
}
/deep/.conagency {
  line-height: 40px;
  flex-direction: column;
  .van-field__control {
    // background-color: #f2f2f2;
    background-color: #f6fbff;
    padding: 0 10px;
  }
}

.iconfont {
  color: #2c8cf0;
}
.icon-xingbie {
  color: pink;
}

.van-divider {
  margin: 10px 0;
}
/deep/.van-action-sheet {
  max-height: unset;
}
/deep/ .tag-group-name {
  height: 28px;
  line-height: 28px;
  padding: 0 15px;
  font-size: 12px;
  color: #606266;
  .van-popover__action-text {
    width: 100%;
    display: unset;
    text-align: center;
  }
}
.portrait-page {
  height: 100%;
    .portrait-div {
      height: 100%;
      background-color: #fff;
    }
    .add-circle {
      width: 40px;
      height: 40px;
      background-color: @green;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      .van-icon {
        font-size: 16px;
      }
    }
}
/deep/ .portrait-div {
  .van-hairline--top-bottom::after, .van-hairline-unset--top-bottom::after {
    border-width: 0 0 1px;
  }
  .addwaiting {
    .van-tabs__content {
      min-height: calc(100% - 44px);
      background: #fff;
      .customer-info-div {
        height: 100%;
      }
      .edit-circle, .add-circle {
        position: fixed;
        right: 10px;
        bottom: 10px;
      }
      .transfer-circle {
        position: fixed;
        right: 60px;
        bottom: 10px;
      }
    }
  }
}

</style>
