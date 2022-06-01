<template>
  <van-popup v-model="show" class="transfer-customer">
    <div class="top-container">
      <div class="header-container">
        <div class="go-back">
          <van-icon name="revoke" size="18" @click="goBack" />
          <span>返回</span>
        </div>
        <div class="title">
          转接客户
        </div>
      </div>
    </div>
    <div class="content-container">
      <p class="text">若您已完成对该客户的服务，要由其他员工提供进一步服务，则可以将客户转接给其他在职员工。</p>

      <van-field
        :value="selectedUserName"
        is-link
        readonly
        label="接替员工"
        placeholder="点击选择接替员工"
        @click="userCascaderShow = true"
      />
      <van-popup v-model="userCascaderShow" round position="bottom">
        <div class="popup">
          <div class="header">
            <van-button type="text" square @click="cancel">取消</van-button>
            <span>接替员工</span>
            <van-button type="text" square @click="userCascaderShow = false">确定</van-button>
          </div>

          <van-search v-model="queryUserName" placeholder="请输入员工姓名" />

          <van-list>
            <van-cell
              v-for="(item, index) in showList"
              v-show="item.userName.includes(queryUserName)"
              :key="item.userName"
              :title="item.userName"
              :label="item.mainDepartmentName"
              class="cell"
              title-class="van-ellipsis"
              center
              @click="selectedUser = selectedUser === index ? -1 : index"
            >
              <van-image slot="icon" round :src="item.headImageUrl" />
              <van-checkbox
                slot="right-icon"
                checked-color="#6BB4AB"
                :value="selectedUser === index"
              />

            </van-cell>
          </van-list>

        </div>
      </van-popup>

      <div class="transferButton">
        <van-button type="primary" size="small" square :loading="transferButtonLoading" @click="submit">转 接</van-button>
      </div>

      <van-notice-bar
        class="notice"
        wrapable
        :scrollable="false"
      >
        <p>1. 为保障客户服务体验，90个自然日内，企业下每位客户仅可被在职继承2次。</p>
        <p>2. 将当前客户转接给其他在职员工后，客户与你的好友关系将被解除。</p>
      </van-notice-bar>
    </div>
  </van-popup>
</template>

<script>
import { getCustomerInfo } from '@/api/portrait';
import { getTree } from '@/api/organization';
import { listStaff } from '@/api/staff';
import { transfer } from '@/api/transfer';
import { Dialog } from 'vant';

// 接替中
const INHERIT_STATUS_INHERITING = '4';

export default {
  name: '',
  components: { },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    userInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      query: {
        departments: [],
        isActivate: 1
      },
      userCascaderShow: false,
      list: [],
      selectedUser: -1,
      scopeDeptList: [],
      fieldValue: '',
      queryUserName: '',
      transferButtonLoading: false
    };
  },
  computed: {
    selectedUserName() {
      return this.list[this.selectedUser]?.userName;
    },
    showList() {
      return this.list;
    }
  },
  watch: {
    show(val) {
      if (val) {
        this.getTree();
        this.selectedUser = -1;
      }
    },
    userCascaderShow(val) {
      if (val) this.getList();
    },
    queryUserName(val) {
      this.queryUserName = val;
    }
  },
  methods: {
    /**
     * 返回
     */
    goBack() {
      this.$emit('update:show', false);
    },
    getDeptMap(deptOption) {
      const map = {};
      deptOption.forEach(dept => {
        map[dept.id] = dept.name;
      });
      return map;
    },
    async getList() {
      this.list = [];
      await this.getTree();
      const { rows } = await listStaff(this.query);
      this.list = rows.filter(item => item.userId !== this.userInfo.userId);
    },
    async getTree() {
      // 没有部门数据时才去获取
      if (this.query.departments?.length) return;

      try {
        const { data } = await getTree();

        this.scopeDeptList = data.filter(ele => ele.enable);
        this.treeData = this.handleTree(this.scopeDeptList);
        this.treeMap = this.getDeptMap(data);
        this.query.departments = this.dealScopedDepts(this.scopeDeptList[0]?.id ?? '').join(',');
      } catch (error) {
        this.scopeDeptList = [];
        this.treeData = [];
        this.treeMap = {};
        this.query.departments = [];
      }
    },
    async submit() {
      if (this.selectedUser === -1) {
        this.$toast('请选择接替员工');
        return;
      }

      const { data: { status }} = await getCustomerInfo(this.userInfo);
      if (status === INHERIT_STATUS_INHERITING) {
        this.$toast('正在接替中，不可发起请求');
        return;
      }

      const params = {
        customerList: [{
          externalUserid: this.userInfo.externalUserid,
          handoverUserid: this.userInfo.userId
        }],
        takeoverUserid: this.list[this.selectedUser].userId
      };

      this.transferButtonLoading = true;
      try {
        await transfer(params);
        Dialog.alert({
          title: '操作成功',
          message: '已成功发起接替请求，将在24小时后自动接替',
          confirmButtonText: '返回首页',
          beforeClose: (_, done) => {
            done();
            this.$emit('update:show', false);
          }
        });
      } catch (e) {
        Dialog.alert({
          title: '操作失败',
          message: e.msg,
          confirmButtonText: '我知道了'
        });
      } finally {
        this.transferButtonLoading = false;
      }
    },
    // 获取所有子部门的列表
    dealScopedDepts(deptId) {
      if (!deptId) return [];
      let departments = [deptId];
      const childs = this.scopeDeptList.filter(ele => ele.parentId === deptId).map(ele => ele.id);
      departments = departments.concat(childs);
      if (childs.length > 0) {
        childs.forEach(deptId_ => {
          const grands = this.dealScopedDepts(deptId_);
          departments = departments.concat(grands);
        });
      }
      return [...new Set(departments)];
    },
    cancel() {
      this.userCascaderShow = false;
      this.selectedUser = -1;
    }
  }

};
</script>

<style scoped lang='less'>
  .transfer-customer {
      height: 100%;
      width: 100%;
      font-size: 14px;

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
          justify-content: space-between;

          .go-back {
              display: flex;
              align-items: center;
          }

          .title {
              position: absolute;
              text-align: center;
              width: calc(100% - 20px);
              z-index: -1;
          }
      }
  }

  .popup {
    height: 80vh;

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 0.4em;
      font-size: 16px;
      height: 3em;

      .van-button {
        color: @green;
        height: 2em;
      }
    }
  }

  .text {
    color: @fontColor;
    margin: 0.5em;
  }

  .transferButton {
    margin: 1.5em 0;
    text-align: right;
    padding-right: 1em;
    font-size: 12px;

    .van-button {
      width: 5em;
    }
  }

  .notice {
    font-size: 12px;
    line-height: 16px;

    p + p {
      margin-top: .5em;
    }
  }

  .cell{
    .van-image{
      height: 3em;
      width: 3em;
      min-width: 3em;
      margin-right: 1em;
    }
  }

  .van-button--primary {
    background-color: @green;
    border-color: @green;
  }
</style>
