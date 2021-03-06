<template>
  <div class="mt-3">
    <label-content-split label="Initial Stake">
      <logo-amount-symbol
        :pool-id="position.stake.poolId"
        :amount="prettifyNumber(position.stake.amount)"
        :symbol="position.stake.symbol"
      />
    </label-content-split>

    <label-content-split
      label="Fully Protected Value"
      :value="`${prettifyNumber(position.protectedAmount.amount)} ${
        position.stake.symbol
      }`"
      class="my-3"
    />

    <alert-block
      v-if="priceDeviationTooHigh && !inputError"
      variant="error"
      class="mb-3"
      msg="Due to price volatility, withdrawing your tokens is currently not available. Please try again in a few seconds."
    />

    <alert-block
      v-if="warning"
      variant="warning"
      title="Important"
      :msg="warning"
      class="my-3"
    />

    <percentage-slider
      label="Input"
      v-model="percentage"
      @input="onPercentUpdate"
      :show-buttons="true"
    />

    <alert-block
      v-if="inputError"
      variant="error"
      :msg="inputError"
      class="mt-3"
    />

    <div class="d-flex justify-content-center mb-3">
      <font-awesome-icon icon="arrow-down" class="mt-3" />
    </div>

    <gray-border-block :gray-bg="true" class="my-3">
      <label-content-split
        v-if="expectedValue"
        label="Output value of"
        :value="`${prettifyNumber(expectedValue.amount)} ${
          expectedValue.symbol
        }`"
      />

      <label-content-split
        v-for="(output, index) in outputs"
        :label="index == 0 ? 'Output breakdown' : ''"
        :key="output.id"
        :value="`${prettifyNumber(output.amount)} ${output.symbol}`"
      />
      <span
        class="font-size-14 font-w400 mt-2"
        :class="darkMode ? 'text-muted-dark' : 'text-muted-light'"
        >{{ outputInfo }}</span
      >
    </gray-border-block>

    <alert-block
      v-if="vBntWarning"
      variant="error"
      :msg="vBntWarning"
      class="my-3"
    />

    <main-button
      label="Continue"
      @click="initAction"
      :active="true"
      :large="true"
      :disabled="disableActionButton"
    />

    <modal-base title="You will receive" v-model="modal" @input="setDefault">
      <action-modal-status :error="error" :success="success" />

      <main-button
        @click="onModalClick"
        class="mt-3"
        :label="modalConfirmButton"
        :active="true"
        :large="true"
        :disabled="txBusy"
      />
    </modal-base>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import { vxm } from "@/store/";
import { TxResponse, ViewAmountDetail, ViewRelay } from "@/types/bancor";
import GrayBorderBlock from "@/components/common/GrayBorderBlock.vue";
import LabelContentSplit from "@/components/common/LabelContentSplit.vue";
import MainButton from "@/components/common/Button.vue";
import PercentageSlider from "@/components/common/PercentageSlider.vue";
import AlertBlock from "@/components/common/AlertBlock.vue";
import { compareString, findOrThrow } from "@/api/helpers";
import ModalBase from "@/components/modals/ModalBase.vue";
import ActionModalStatus from "@/components/common/ActionModalStatus.vue";
import LogoAmountSymbol from "@/components/common/LogoAmountSymbol.vue";
import BigNumber from "bignumber.js";
import BaseComponent from "@/components/BaseComponent.vue";

@Component({
  components: {
    LogoAmountSymbol,
    ActionModalStatus,
    ModalBase,
    AlertBlock,
    PercentageSlider,
    LabelContentSplit,
    GrayBorderBlock,
    MainButton
  }
})
export default class WithdrawProtectionSingle extends BaseComponent {
  get pool(): ViewRelay {
    return vxm.bancor.relay(this.position.stake.poolId);
  }
  percentage: string = "50";

  modal = false;
  txBusy = false;
  success: TxResponse | string | null = null;
  error = "";
  outputs: ViewAmountDetail[] = [];
  expectedValue: ViewAmountDetail | null = null;
  priceDeviationTooHigh: boolean = false;

  get warning() {
    return this.position.whitelisted && this.position.coverageDecPercent !== 1
      ? "You still haven’t reached full protection. There is a risk for impermanent loss and you might receive less than your original stake amount as a result."
      : "";
  }

  get disableActionButton() {
    if (this.vBntWarning) return true;
    else if (parseFloat(this.percentage) === 0) return true;
    else if (this.priceDeviationTooHigh) return true;
    else return this.inputError ? true : false;
  }

  get inputError() {
    if (parseFloat(this.percentage) === 0) return "Percentage can not be Zero";
    else return "";
  }

  get outputInfo() {
    const isBnt =
      this.outputs.length === 1 && this.outputs.find(o => o.symbol === "BNT");
    const isTknWithBnt =
      this.outputs.length === 2 && this.outputs.find(o => o.symbol === "BNT");
    if (isBnt)
      return "BNT withdrawals are subject to a 24h lock period before they can be claimed.";
    else if (isTknWithBnt)
      return "Part of your output is in BNT. This amount will be locked for 24h before it can be claimed";
    else return "";
  }

  get position() {
    const pos = findOrThrow(vxm.ethBancor.protectedPositions, position =>
      compareString(position.id, this.$route.params.id)
    );
    console.log(pos, "is the selected pos");
    return pos;
  }

  get vBntWarning() {
    const givenVBnt =
      Number(this.position.givenVBnt!) * (Number(this.percentage) / 100);

    if (this.position.givenVBnt && !this.sufficientVBnt) {
      const missingVBnt = givenVBnt - Number(this.vBntBalance);
      return `Insufficient vBNT balance, you must hold ${this.prettifyNumber(
        givenVBnt
      )} vBNT before withdrawing this position. You are missing ${this.prettifyNumber(
        missingVBnt
      )} vBNT.`;
    } else return "";
  }

  get sufficientVBnt() {
    if (this.vBntBalance === null) return true;
    if (this.position.givenVBnt) {
      const decPercent = new BigNumber(this.percentage).div(100);
      const proposedWithdraw = new BigNumber(this.position.givenVBnt).times(
        decPercent
      );
      return proposedWithdraw.isLessThanOrEqualTo(this.vBntBalance);
    } else return true;
  }

  vBntBalance: BigNumber | null = null;

  get isVoteLoaded() {
    return vxm.ethGovernance.isLoaded;
  }

  async loadVBntBalance() {
    this.vBntBalance = this.currentUser
      ? await vxm.ethGovernance.getBalance({
          account: this.currentUser
        })
      : new BigNumber(0);
  }

  async initAction() {
    this.setDefault();
    this.modal = true;
    this.txBusy = true;
    const [poolId, first, second] = this.$route.params.id.split(":");
    console.log({ poolId, first, second });
    try {
      const txRes = await vxm.ethBancor.removeProtection({
        decPercent: Number(this.percentage) / 100,
        id: this.position.id
      });
      this.success = txRes;
    } catch (err) {
      this.error = err.message;
    } finally {
      this.txBusy = false;
    }
  }

  onModalClick() {
    if (this.success) {
      this.setDefault();
      this.modal = false;
      this.$router.push({ name: "LiqProtection" });
    } else if (this.error) {
      this.setDefault();
      this.modal = false;
    }
  }

  setDefault() {
    this.error = "";
    this.success = null;
    this.txBusy = false;
  }

  async onPercentUpdate(newPercent: string) {
    console.log(newPercent, "is the new percent");
    const percentage = Number(this.percentage) / 100;
    if (!percentage) return;
    const res = await vxm.ethBancor.calculateSingleWithdraw({
      id: this.position.id,
      decPercent: percentage
    });
    await this.loadRecentAverageRate();

    this.expectedValue = res.expectedValue;
    this.outputs = res.outputs;

    console.log(res, "was the res");
  }

  get tokenContract() {
    const reserve = this.pool.reserves.find(
      x => x.symbol === this.position.stake.symbol
    );
    if (reserve) return reserve.contract;
    else return "";
  }

  async loadRecentAverageRate() {
    this.priceDeviationTooHigh = await vxm.bancor.checkPriceDeviationTooHigh({
      relayId: this.pool.id,
      selectedTokenAddress: this.tokenContract
    });
    console.log("priceDeviationTooHigh", this.priceDeviationTooHigh);
  }

  private interval: any;

  async mounted() {
    if (!this.isVoteLoaded) await vxm.ethGovernance.init();
    await this.onPercentUpdate(this.percentage);
    await this.loadVBntBalance();
    this.interval = setInterval(async () => {
      await this.loadVBntBalance();
      await this.loadRecentAverageRate();
    }, 10000);
  }

  destroyed() {
    clearInterval(this.interval);
  }

  get modalConfirmButton() {
    return this.error
      ? "Close"
      : this.success
      ? "Close"
      : this.txBusy
      ? "processing ..."
      : "Confirm";
  }
}
</script>

<style scoped lang="scss"></style>
