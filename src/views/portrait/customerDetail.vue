<template>
  <div>
    <!-- 头部 -->
    <div class="header">
      <div class="header-title">
        <van-icon
          name="arrow-left"
          color="#9c9c9c"
          size="16"
          @click="$router.back()"
        />
        <span class="title"> 客户资料 </span>
      </div>
      <div v-if="flage" class="data" @click="edit">编辑</div>
      <div v-else class="data" @click="saveUserInformation">保存</div>
    </div>
    <van-divider />
    <!-- 详细资料 -->
    <van-form :disabled="flage" @submit="saveUserInformation">
      <div class="details">
        <div class="detail">
          <div class="left">
            <div class="img"><img :src="form.avatar" alt=""></div>
            <div class="right">
              <div>
                <span>{{
                  user.remark
                    ? user.remark
                    : (user.name || '')
                }}
                </span>
                <span>({{ user.name }})</span>

              </div>
              <div class="c9">
                <img v-if="user.gender == 1" class="gender-icon" width="18px" height="18px" :src="require('@/assets/icon/man.svg')">
                <img v-else-if="user.gender == 2" class="gender-icon" width="18px" height="18px" :src="require('@/assets/icon/woman.svg')">
                <img v-else class="gender-icon" width="18px" height="18px" :src="require('@/assets/icon/unknown_gender.svg')">
                <span class="corp-name">{{ user.remarkCorpName || '' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <van-field
        v-model="form.remarkMobiles"
        name="手机号"
        label="手机号"
        placeholder="手机号"
        input-align="right"
      />
      <van-field
        v-if="flage"
        v-model="form.age"
        name="年龄"
        label="年龄"
        placeholder="年龄"
        input-align="right"
        disabled
      />
      <van-field
        v-model="form.birthday"
        name="生日"
        label="生日"
        placeholder="生日"
        input-align="right"
        @click="!flage ? (show = true) : ''"
      />
      <van-popup
        v-model="show"
        position="bottom"
        round
        :style="{ height: '60%' }"
      >
        <van-datetime-picker
          v-model="currentDate"
          type="date"
          title="选择年月日"
          :min-date="minDate"
          :max-date="maxDate"
          @confirm="confirm"
          @cancel="cancel"
        /></van-popup>
      <!-- -------------------------- -->
      <van-field
        v-model="form.email"
        name="邮箱"
        label="邮箱"
        placeholder="邮箱"
        input-align="right"
      />
      <van-field
        v-model="form.address"
        name="地址"
        label="地址"
        placeholder="地址"
        input-align="right"
      />
      <van-field
        v-model="form.qq"
        name="QQ"
        label="QQ"
        placeholder="QQ"
        input-align="right"
      />
      <van-field
        v-model="form.position"
        name="职业"
        label="职业"
        placeholder="职业"
        input-align="right"
      />
      <van-field
        v-model="form.remarkCorpName"
        name="公司"
        label="公司"
        placeholder="公司"
        input-align="right"
      />
      <van-field
        v-model="form.description"
        name="备注"
        label="备注"
        placeholder="备注"
        input-align="left"
        type="textarea"
        class="others"
      />
    </van-form>
  </div>
</template>
<script>
import { getCustomerInfo, getWeCustomerInfo } from '@/api/portrait';
import { TWO_DIGITS } from '@/utils/constants';
const MIN_YEAR = 1940;
const CURRENT_DATE = 2000;
const CURRENT_MINUTE = 17;

export default {
  data() {
    return {
      flage: true,
      //   选择生日
      show: false,
      minDate: new Date(MIN_YEAR, 0, 1),
      maxDate: new Date(),
      currentDate: new Date(CURRENT_DATE, 0, CURRENT_MINUTE),
      // 接口开始
      // 表单数据
      user: {},
      form: {
        externalUserid: '', // 客户Id
        userId: '', // 员工Id
        name: '', // 昵称
        remarkMobiles: '', // 手机号
        birthday: '', // 客户生日
        age: '', // 年龄
        email: '', // 邮箱
        address: '', // 地址
        qq: '', // qq
        position: '', // 职业
        remarkCorpName: '', // 公司
        description: '' // 其他描述
      }
    };
  },
  computed: {
    userId() {
      return this.$store.state.userId; // 员工Id
    }
  },
  created() {
    this.form.externalUserid = this.$route.query.customerId;
    // 获取客户详细信息
    getCustomerInfo({
      externalUserid: this.form.externalUserid,
      userId: this.userId
    })
      .then(({ data }) => {
        this.form = data;
        this.user = Object.assign({}, data);
      })
      .catch((err) => {
        console.log(err);
      });
  },
  methods: {
    //   选择生日
    confirm(val) {
      this.show = false;
      this.form.birthday = this.getTime(val);
      console.log(val);
    },
    cancel() {
      this.show = false;
    },
    edit() {
      this.flage = !this.flage;
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
      //   var h =
      //     (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
      //   var m =
      //     date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
      return Y + M + D;
    },
    // 点击保存按钮提交表单
    saveUserInformation() {
      this.$toast.loading({
        message: 'loading...',
        duration: 0,
        forbidClick: true
      });
      this.flage = !this.flage;
      this.form.userId = this.userId;
      getWeCustomerInfo(this.form)
        .then((data) => {
          this.$toast('操作成功');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
};
</script>

<style lang="less" scoped>
.iconfont {
  color: #2c8cf0;
}

.icon-xingbie {
  color: pink;
}
.header {
  margin: 20px 10px 10px;
  vertical-align: center;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .header-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .data {
    cursor: pointer;
  }
}
.van-icon-cross {
  position: absolute;
  left: 10px;
}
.title {
  text-align: center;
  font-size: 14px;
}
//  详细资料
.details {
  margin: 10px 16px;
}
.detail {
  display: flex;
  justify-content: space-between;
  .c9 {
    color: #9c9c9c;
    display: flex;
    align-items: center;
    .corp-name {
      font-size: 13px;
    }
  }
}
.left {
  display: flex;
  .img {
    width: 40px;
    height: 40px;
    background-color: #f2f2f2;
    margin-right: 10px;
  }
  .right {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}
.data {
  font-size: 12px;
  color: #5fa7f3;
  float: right;
}
.divider {
  width: 100%;
  height: 10px;
  background-color: #f2f2f2;
}
/deep/.others {
  line-height: 40px;
  flex-direction: column;
  .van-field__control--left {
    float: left;
    line-height: 20px;
    .textarea {
      margin-top: 20px;
    }
  }
}
/deep/ .van-cell {
  line-height: 16px;
  .van-field__label {
    color: #999;
    cursor: default;
  }
  .van-cell__value {
    .van-field__body {
      font-size: 13px;
      textarea::placeholder, input::placeholder {
        font-size: 13px;
      }
    }
  }
}
</style>
