<template>
  <b-container fluid="xl" class="px-xl-0">
    <b-row>
      <b-col cols="12">
        <div>
          <span
            class="font-size-20 font-w600"
            :class="darkMode ? 'text-dark' : 'text-light'"
          >
            Liquidity Protection
          </span>
        </div>

        <p
          class="font-size-14 font-w400 my-3"
          :class="darkMode ? 'text-dark' : 'text-light'"
        >
          You can protect your token pools with our special insurance for
          impermanent loss by simply adding insurance to each of your
          transactions.
        </p>
      </b-col>

      <b-col cols="12">
        <ProtectedSummary v-if="positions.length" :positions="positions" />
      </b-col>

      <b-col v-if="false" cols="12">
        <RewardsSummary v-if="positions.length" :positions="positions" />
      </b-col>

      <b-col cols="12">
        <content-block
          :px0="true"
          :shadow-light="true"
          :title="positions.length ? 'My Protected Positions' : 'Protected'"
          :search.sync="searchProtected"
        >
          <div v-if="loading" class="d-flex justify-content-center my-3">
            <b-spinner
              style="width: 3rem; height: 3rem"
              class="text-primary"
              label="Loading..."
            />
          </div>
          <div v-else>
            <ProtectedTable :positions="positions" :search="searchProtected" />
          </div>
        </content-block>
      </b-col>
    </b-row>

    <b-row>
      <b-col cols="12">
        <span
          class="font-size-20 font-w600"
          :class="darkMode ? 'text-dark' : 'text-light'"
        >
          Closed Positions
        </span>

        <p
          class="font-size-14 font-w400 my-3"
          :class="darkMode ? 'text-dark' : 'text-light'"
        >
          When unstaking protected positions, you will be able to see and claim
          your BNT here.
        </p>
      </b-col>
      <b-col cols="12">
        <content-block :px0="true" :shadow-light="true" title="Claim">
          <claim :search="searchClaim" />
        </content-block>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import { vxm } from "@/store";
import ProtectedTable from "@/components/protection/ProtectedTable.vue";
import ContentBlock from "@/components/common/ContentBlock.vue";
import Claim from "@/components/protection/Claim.vue";
import BaseComponent from "@/components/BaseComponent.vue";
import { ViewProtectedLiquidity } from "@/types/bancor";
import ProtectedSummary from "@/components/protection/ProtectedSummary.vue";
import RewardsSummary from "@/components/rewards/RewardsSummary.vue";

@Component({
  components: {
    RewardsSummary,
    ProtectedSummary,
    Claim,
    ContentBlock,
    ProtectedTable
  }
})
export default class ProtectionHome extends BaseComponent {
  searchProtected = "";
  searchClaim = "";

  get positions(): ViewProtectedLiquidity[] {
    return vxm.ethBancor.protectedPositions;
  }

  get loading() {
    return vxm.ethBancor.loadingPools;
  }
}
</script>

<style lang="scss"></style>
