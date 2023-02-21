<!--
 * @Description: 智能表单
 * @Author: xulinbin
 * @LastEditors: xulinbin
-->
<template>
  <div class="intelligent-form-wrap">
    <van-tabs v-model="active" color="#6BB4AB" title-active-color="#6BB4AB">
      <van-tab title="我的表单" :name="INTELLIGENT_FORM_TYPE['personal']">
        <IntelligentFormContent v-if="active === INTELLIGENT_FORM_TYPE['personal']" :type="active" />
      </van-tab>
      <van-tab title="部门表单" :name="INTELLIGENT_FORM_TYPE['department']">
        <IntelligentFormContent v-if="active === INTELLIGENT_FORM_TYPE['department']" :type="active" :department-id="departmentId" />
      </van-tab>
      <van-tab title="企业表单" :name="INTELLIGENT_FORM_TYPE['enterprise']">
        <IntelligentFormContent v-if="active === INTELLIGENT_FORM_TYPE['enterprise']" :type="active" />
      </van-tab>
    </van-tabs>
  </div>
</template>
<script>
import IntelligentFormContent from './component/intelligentFormContent.vue';
import { INTELLIGENT_FORM_TYPE } from '@/utils/constants';
import { getMiddlePageDomainName } from '@/api/wechatopen';
import { getUserInfo } from '@/api/staff';
export default {
  name: '',
  components: { IntelligentFormContent },
  props: {
    // 联系人id
    externalUserid: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      INTELLIGENT_FORM_TYPE,
      active: INTELLIGENT_FORM_TYPE['personal'],
      // 中间页域名
      domainName: '',
      // 用户所在部门id
      departmentId: ''
    };
  },
  provide() {
    return {
      getDomainName: () => this.domainName
    };
  },
  async created() {
    // 获取中间页域名
    getMiddlePageDomainName({}).then(res => {
      res.data ? this.domainName = res.data : null;
    });
    await this.getMyDepartmentId();
  },
  methods: {
    // 当前账号所属的部门
    async getMyDepartmentId() {
      const { userId } = this.$store.state;
      const userRes = await getUserInfo({ userId });
      if (!userRes?.data || !userRes?.data?.department) return false;
      const { data: { department }} = userRes;
      this.departmentId = department?.length && department[department.length - 1];
    }
  }
};
</script>
<style scoped lang='less'>
.intelligent-form-wrap {
  padding-bottom: 50px;
  height: 100%;
}
</style>
