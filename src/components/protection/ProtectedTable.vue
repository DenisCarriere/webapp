<template>
  <div id="protected-table">
    <data-table
      v-if="positions.length"
      :fields="fields"
      :items="groupedPositions"
      :collapsable="true"
      :filter="search"
      filter-by="stake"
      :filter-function="doFilter"
      :sort-function="customSort"
      default-sort="stake"
      default-order="desc"
    >
      <template #cell(stake)="{ item, value, isCollapsable }">
        <div>
          {{ `${prettifyNumber(value.amount)} ${item.symbol}` }}
        </div>
        <div
          v-if="value && value.usdValue !== undefined"
          v-text="`(~${prettifyNumber(value.usdValue, true)})`"
          class="font-size-12 font-w400 text-primary"
        />
        <div class="d-flex align-items-center">
          <pool-logos-overlapped
            :pool-id="item.poolId"
            size="20"
            class="mr-1"
          />
          {{ poolName(item.poolId) }}
          <div v-if="isCollapsable" class="ml-1 mb-1">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="0.5"
                y="0.5"
                width="13"
                height="13"
                rx="3.5"
                fill="none"
                stroke="#0F59D1"
              />
              <mask id="path-2-inside-1" fill="white">
                <path
                  d="M9.72727 6.67631H7.27273V4.28417C7.27273 4.12469 7.16364 4.01837 7 4.01837C6.83636 4.01837 6.72727 4.12469 6.72727 4.28417V6.67631H4.27273C4.10909 6.67631 4 6.78263 4 6.94211C4 7.10158 4.10909 7.2079 4.27273 7.2079H6.72727V9.60005C6.72727 9.75953 6.83636 9.86585 7 9.86585C7.16364 9.86585 7.27273 9.75953 7.27273 9.60005V7.2079H9.72727C9.89091 7.2079 10 7.10158 10 6.94211C10 6.78263 9.89091 6.67631 9.72727 6.67631Z"
                />
              </mask>
              <path
                d="M9.72727 6.67631H7.27273V4.28417C7.27273 4.12469 7.16364 4.01837 7 4.01837C6.83636 4.01837 6.72727 4.12469 6.72727 4.28417V6.67631H4.27273C4.10909 6.67631 4 6.78263 4 6.94211C4 7.10158 4.10909 7.2079 4.27273 7.2079H6.72727V9.60005C6.72727 9.75953 6.83636 9.86585 7 9.86585C7.16364 9.86585 7.27273 9.75953 7.27273 9.60005V7.2079H9.72727C9.89091 7.2079 10 7.10158 10 6.94211C10 6.78263 9.89091 6.67631 9.72727 6.67631Z"
                fill="white"
              />
              <path
                d="M7.27273 6.67631H6.27273V7.67631H7.27273V6.67631ZM6.72727 6.67631V7.67631H7.72727V6.67631H6.72727ZM6.72727 7.2079H7.72727V6.2079H6.72727V7.2079ZM7.27273 7.2079V6.2079H6.27273V7.2079H7.27273ZM9.72727 5.67631H7.27273V7.67631H9.72727V5.67631ZM8.27273 6.67631V4.28417H6.27273V6.67631H8.27273ZM8.27273 4.28417C8.27273 3.96932 8.15996 3.63288 7.89567 3.37531C7.63369 3.11999 7.30146 3.01837 7 3.01837V5.01837C6.86218 5.01837 6.66631 4.96991 6.49978 4.80762C6.33095 4.64307 6.27273 4.43954 6.27273 4.28417H8.27273ZM7 3.01837C6.69855 3.01837 6.36631 3.11999 6.10433 3.37531C5.84004 3.63288 5.72727 3.96932 5.72727 4.28417H7.72727C7.72727 4.43954 7.66905 4.64307 7.50022 4.80762C7.33369 4.96991 7.13782 5.01837 7 5.01837V3.01837ZM5.72727 4.28417V6.67631H7.72727V4.28417H5.72727ZM6.72727 5.67631H4.27273V7.67631H6.72727V5.67631ZM4.27273 5.67631C3.97127 5.67631 3.63904 5.77793 3.37705 6.03326C3.11277 6.29083 3 6.62726 3 6.94211H5C5 7.09748 4.94178 7.30102 4.77295 7.46556C4.60642 7.62785 4.41055 7.67631 4.27273 7.67631V5.67631ZM3 6.94211C3 7.25696 3.11277 7.59339 3.37705 7.85096C3.63904 8.10628 3.97127 8.2079 4.27273 8.2079V6.2079C4.41055 6.2079 4.60642 6.25636 4.77295 6.41866C4.94178 6.5832 5 6.78674 5 6.94211H3ZM4.27273 8.2079H6.72727V6.2079H4.27273V8.2079ZM5.72727 7.2079V9.60005H7.72727V7.2079H5.72727ZM5.72727 9.60005C5.72727 9.9149 5.84004 10.2513 6.10433 10.5089C6.36631 10.7642 6.69855 10.8658 7 10.8658V8.86585C7.13782 8.86585 7.33369 8.91431 7.50022 9.0766C7.66905 9.24114 7.72727 9.44468 7.72727 9.60005H5.72727ZM7 10.8658C7.30146 10.8658 7.63369 10.7642 7.89567 10.5089C8.15996 10.2513 8.27273 9.9149 8.27273 9.60005H6.27273C6.27273 9.44468 6.33095 9.24114 6.49978 9.0766C6.66631 8.91431 6.86218 8.86585 7 8.86585V10.8658ZM8.27273 9.60005V7.2079H6.27273V9.60005H8.27273ZM7.27273 8.2079H9.72727V6.2079H7.27273V8.2079ZM9.72727 8.2079C10.0287 8.2079 10.361 8.10628 10.6229 7.85096C10.8872 7.59339 11 7.25696 11 6.94211H9C9 6.78674 9.05822 6.5832 9.22705 6.41866C9.39358 6.25636 9.58945 6.2079 9.72727 6.2079V8.2079ZM11 6.94211C11 6.62726 10.8872 6.29083 10.6229 6.03326C10.361 5.77793 10.0287 5.67631 9.72727 5.67631V7.67631C9.58945 7.67631 9.39358 7.62785 9.22705 7.46556C9.05822 7.30102 9 7.09748 9 6.94211H11Z"
                fill="#0F59D1"
                mask="url(#path-2-inside-1)"
              />
            </svg>
          </div>
        </div>
      </template>
      <template #cellCollapsed(stake)="{ value }">
        <div>
          {{ `${prettifyNumber(value.amount)} ${value.symbol}` }}
        </div>
        <div
          v-if="value && value.usdValue !== undefined"
          v-text="`(~${prettifyNumber(value.usdValue, true)})`"
          class="font-size-12 font-w400 text-primary"
        />
        <div
          v-if="false"
          v-text="formatDate(value.unixTime).dateTime"
          class="font-size-12 font-w400"
          :class="darkMode ? 'text-muted-dark' : 'text-muted-light'"
        />
        <div class="d-flex align-items-center">
          <pool-logos-overlapped
            :pool-id="value.poolId"
            size="20"
            class="mr-1"
          />
          {{ poolName(value.poolId) }}
        </div>
      </template>

      <template #cell(fullyProtected)="{ item, value }">
        <div class="d-flex align-items-start">
          <span
            v-text="
              value && typeof value.amount !== 'undefined'
                ? `${prettifyNumber(value.amount)} ${item.symbol}`
                : 'Stale data'
            "
          />
        </div>
        <span
          v-if="
            value &&
            value.usdValue !== undefined &&
            typeof value.amount !== 'undefined'
          "
          v-text="`(~${prettifyNumber(value.usdValue, true)})`"
          class="font-size-12 font-w400 text-primary"
        />
      </template>
      <template #cellCollapsed(fullyProtected)="{ value }">
        <div class="d-flex align-items-start">
          <span
            v-text="
              value && typeof value.amount !== 'undefined'
                ? `${prettifyNumber(value.amount)} ${value.symbol}`
                : 'Stale data'
            "
          />
        </div>
        <span
          v-if="
            value &&
            value.usdValue !== undefined &&
            typeof value.amount !== 'undefined'
          "
          v-text="`(~${prettifyNumber(value.usdValue, true)})`"
          class="font-size-12 font-w400 text-primary"
        />
      </template>

      <template #cell(protectedAmount)="{ item, value }">
        <div class="d-flex align-items-start">
          <span
            v-text="
              value && typeof value.amount !== 'undefined'
                ? `${prettifyNumber(value.amount)} ${item.symbol}`
                : 'please refresh'
            "
          />
        </div>
        <span
          v-if="
            value &&
            value.usdValue !== undefined &&
            typeof value.amount !== 'undefined'
          "
          v-text="`(~${prettifyNumber(value.usdValue, true)})`"
          class="font-size-12 font-w400 text-primary"
        />
      </template>
      <template #cellCollapsed(protectedAmount)="{ value }">
        <div class="d-flex align-items-start">
          <span
            v-text="
              value && typeof value.amount !== 'undefined'
                ? `${prettifyNumber(value.amount)} ${value.symbol}`
                : 'please refresh'
            "
          />
        </div>
        <span
          v-if="
            value &&
            value.usdValue !== undefined &&
            typeof value.amount !== 'undefined'
          "
          v-text="`(~${prettifyNumber(value.usdValue, true)})`"
          class="font-size-12 font-w400 text-primary"
        />
      </template>

      <template #cell(fees)="{ item, value }">
        <div class="text-center">
          {{ `${prettifyNumber(value)} ${item.symbol}` }}
        </div>
      </template>
      <template #cellCollapsed(fees)="{ value }">
        <div class="text-center">
          {{ `${prettifyNumber(value.amount)} ${value.symbol}` }}
        </div>
      </template>

      <template #cell(roi)="{ value }">
        <div class="text-center">
          {{
            typeof value !== "undefined" ? stringifyPercentage(value) : "N/A"
          }}
        </div>
      </template>
      <template #cellCollapsed(roi)="{ value }">
        <div class="text-center">
          {{
            typeof value !== "undefined" ? stringifyPercentage(value) : "N/A"
          }}
        </div>
      </template>

      <template #cell(apr)="{ value }">
        <div class="d-flex align-items-center">
          <b-badge class="badge-version text-primary px-2 mr-2">1d</b-badge>
          {{
            typeof value.day !== "undefined"
              ? stringifyPercentage(value.day)
              : "N/A"
          }}
        </div>
        <div class="d-flex align-items-center my-1">
          <b-badge class="badge-version text-primary px-2 mr-2">1w</b-badge>
          {{
            typeof value.week !== "undefined"
              ? stringifyPercentage(value.week)
              : "N/A"
          }}
        </div>
      </template>
      <template #cellCollapsed(apr)="{ value }">
        <div class="d-flex align-items-center">
          <b-badge class="badge-version text-primary px-2 mr-2">1d</b-badge>
          {{
            typeof value.day !== "undefined"
              ? stringifyPercentage(value.day)
              : "N/A"
          }}
        </div>
        <div class="d-flex align-items-center my-1">
          <b-badge class="badge-version text-primary px-2 mr-2">1w</b-badge>
          {{
            typeof value.week !== "undefined"
              ? stringifyPercentage(value.week)
              : "N/A"
          }}
        </div>
      </template>

      <template #cell(currentCoverage)="{ item }">
        <div class="d-flex flex-column font-size-12 font-w600">
          <span v-if="item.collapsedData.length" class="font-w500">
            Earliest position vesting time
          </span>
          {{ stringifyPercentage(item.coverageDecPercent) }}
          <div
            v-if="!insuranceStarted(item.insuranceStart)"
            class="d-flex justify-content-between align-items-center text-danger"
          >
            <div>
              Cliff:
              <countdown-timer :date-unix="item.insuranceStart" />
            </div>
            <font-awesome-icon
              icon="info-circle"
              :id="'popover-cliff-' + item.id"
            />
            <b-popover
              :target="'popover-cliff-' + item.id"
              triggers="hover"
              placement="bottom"
            >
              Impermanent loss protection starts vesting immediately when you
              deposit. But you must be in the pool until the cliff is reached
              before the protection can be utilized.
            </b-popover>
          </div>
        </div>

        <remaining-time2
          :from="item.stake.unixTime * 1000"
          :to="item.fullCoverage * 1000"
          class="mt-1"
        />
      </template>
      <template #cellCollapsed(currentCoverage)="{ item }">
        <div class="d-flex flex-column font-size-12 font-w600">
          {{ stringifyPercentage(item.coverageDecPercent) }}
          <div
            v-if="!insuranceStarted(item.insuranceStart)"
            class="d-flex justify-content-between align-items-center text-danger"
          >
            <div>
              Cliff:
              <countdown-timer :date-unix="item.insuranceStart" />
            </div>
            <font-awesome-icon
              icon="info-circle"
              :id="'popover-cliff-' + item.id"
            />
            <b-popover
              :target="'popover-cliff-' + item.id"
              triggers="hover"
              placement="bottom"
            >
              Impermanent loss protection starts vesting immediately when you
              deposit. But you must be in the pool until the cliff is reached
              before the protection can be utilized.
            </b-popover>
          </div>
        </div>

        <remaining-time2
          :from="item.stake.unixTime * 1000"
          :to="item.fullCoverage * 1000"
          class="mt-1"
        />
      </template>

      <template #cell(actions)="{ item, isCollapsable, isExpanded }">
        <b-btn
          v-if="!isCollapsable"
          @click="goToWithdraw(item.positionId)"
          :variant="darkMode ? 'outline-gray-dark' : 'outline-gray'"
          class="d-flex align-items-center justify-content-center"
          style="width: 41px; height: 41px"
        >
          <svg
            width="13"
            height="16"
            viewBox="0 0 13 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.5693 6.01098L7.17391 2.94093V11.6756C7.17391 12.1511 6.74329 12.5405 6.21739 12.5405C5.6915 12.5405 5.26087 12.1511 5.26087 11.6756V2.94093L1.86546 6.01098C1.48247 6.35728 0.884639 6.35728 0.502604 6.01098C0.119613 5.66469 0.119613 5.12415 0.502604 4.77872L5.52434 0.238184C5.73919 0.0650422 5.97831 0 6.21744 0C6.45657 0 6.6957 0.0861492 6.8872 0.259286L11.9089 4.79983C12.2919 5.14612 12.2919 5.68666 11.9089 6.03209C11.5502 6.35641 10.9523 6.35642 10.5693 6.01098ZM0.956522 16C0.430626 16 0 15.6106 0 15.1351C0 14.6596 0.430626 14.2703 0.956522 14.2703H11.4783C12.0042 14.2703 12.4348 14.6596 12.4348 15.1351C12.4348 15.6106 12.0042 16 11.4783 16H0.956522Z"
              :fill="darkMode ? '#ffffff' : '#0A2540'"
            />
          </svg>
        </b-btn>
        <div v-else>
          <b-btn
            :variant="darkMode ? 'outline-gray-dark' : 'outline-gray'"
            class="d-flex align-items-center justify-content-center"
            style="width: 41px; height: 41px"
          >
            <font-awesome-icon
              :icon="isExpanded ? 'chevron-up' : 'chevron-down'"
            />
          </b-btn>
        </div>
      </template>
      <template #cellCollapsed(actions)="{ item }">
        <b-btn
          @click="goToWithdraw(item.id)"
          :variant="darkMode ? 'outline-gray-dark' : 'outline-gray'"
          class="d-flex align-items-center justify-content-center"
          style="width: 41px; height: 41px"
        >
          <svg
            width="13"
            height="16"
            viewBox="0 0 13 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.5693 6.01098L7.17391 2.94093V11.6756C7.17391 12.1511 6.74329 12.5405 6.21739 12.5405C5.6915 12.5405 5.26087 12.1511 5.26087 11.6756V2.94093L1.86546 6.01098C1.48247 6.35728 0.884639 6.35728 0.502604 6.01098C0.119613 5.66469 0.119613 5.12415 0.502604 4.77872L5.52434 0.238184C5.73919 0.0650422 5.97831 0 6.21744 0C6.45657 0 6.6957 0.0861492 6.8872 0.259286L11.9089 4.79983C12.2919 5.14612 12.2919 5.68666 11.9089 6.03209C11.5502 6.35641 10.9523 6.35642 10.5693 6.01098ZM0.956522 16C0.430626 16 0 15.6106 0 15.1351C0 14.6596 0.430626 14.2703 0.956522 14.2703H11.4783C12.0042 14.2703 12.4348 14.6596 12.4348 15.1351C12.4348 15.6106 12.0042 16 11.4783 16H0.956522Z"
              :fill="darkMode ? '#ffffff' : '#0A2540'"
            />
          </svg>
        </b-btn>
      </template>
    </data-table>

    <protected-empty v-else class="mx-3" />
  </div>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import ContentBlock from "@/components/common/ContentBlock.vue";
import PoolLogosOverlapped from "@/components/common/PoolLogosOverlapped.vue";
import {
  buildPoolName,
  compareString,
  defaultTableSort,
  findOrThrow,
  formatUnixTime,
  stringifyPercentage
} from "@/api/helpers";
import { groupPositionsArray } from "@/api/pureHelpers";
import moment from "moment";
import {
  ViewGroupedPositions,
  ViewProtectedLiquidity,
  ViewTableField
} from "@/types/bancor";
import ProtectedEmpty from "@/components/protection/ProtectedEmpty.vue";
import CountdownTimer from "@/components/common/CountdownTimer.vue";
import RemainingTime2 from "@/components/common/RemainingTime2.vue";
import DataTable from "@/components/common/DataTable.vue";
import BaseComponent from "@/components/BaseComponent.vue";

@Component({
  components: {
    DataTable,
    RemainingTime2,
    CountdownTimer,
    ProtectedEmpty,
    PoolLogosOverlapped,
    ContentBlock
  }
})
export default class ProtectedTable extends BaseComponent {
  @Prop({ default: "" }) search!: string;
  @Prop() positions!: ViewProtectedLiquidity[];

  stringifyPercentage = stringifyPercentage;

  get groupedPositions() {
    if (this.positions.length > 0) return groupPositionsArray(this.positions);
    else return [];
  }

  poolName(id: string): string {
    return buildPoolName(id);
  }

  insuranceStarted(unixTime: number) {
    return unixTime < moment().unix();
  }

  formatEndTime(fullCoverageSeconds: number) {
    const timeNow = moment();
    const fullCoverage = moment.unix(fullCoverageSeconds);
    const reachedFullCoverage = timeNow.isAfter(fullCoverage);
    if (reachedFullCoverage) {
      return "Full coverage achieved";
    } else {
      const timeLeft = moment.unix(fullCoverageSeconds).fromNow(true);
      return `${timeLeft} left until full coverage`;
    }
  }

  goToWithdraw(id: string) {
    const positions = this.positions;
    const position = findOrThrow(
      positions,
      pos => compareString(pos.id, id),
      `failed to find position of ID ${id} from position ids ${positions
        .map(position => position.id)
        .join(" ")}`
    );
    const routeName = position.single
      ? "WithdrawProtectionSingle"
      : "WithdrawProtectionDouble";
    this.$router.push({
      name: routeName,
      params: { id }
    });
  }

  formatDate(unixTime: number) {
    return formatUnixTime(unixTime);
  }

  get fields(): ViewTableField[] {
    return [
      {
        id: 1,
        key: "stake",
        label: "Initial Stake",
        tooltip: "Amount of tokens you originally staked in the pool.",
        minWidth: "170px"
      },
      {
        id: 2,
        key: "fullyProtected",
        label: "Protected",
        tooltip:
          "Amount of tokens you can withdraw with 100% protection + fees",
        minWidth: "160px"
      },
      {
        id: 3,
        key: "protectedAmount",
        label: "Claimable",
        tooltip:
          "Amount of tokens you can withdraw right now (assuming you have not earned full protection, this value will be lower than Protected Value)",
        minWidth: "160px"
      },
      {
        id: 4,
        key: "fees",
        label: "Fees",
        tooltip: "Fees your stake has earned since you entered the pool.",
        minWidth: "110px",
        thClass: "text-center"
      },
      {
        id: 5,
        key: "roi",
        label: "ROI",
        tooltip:
          "The ROI of your fully protected value vs. your initial stake.",
        minWidth: "75px",
        thClass: "text-center"
      },
      {
        id: 6,
        key: "apr",
        label: "Apr",
        tooltip:
          "Estimated calculation for annual returns based on historical activity (i.e., 7d = 7d fees/liquidity)",
        sortable: true,
        minWidth: "115px"
      },
      {
        id: 7,
        key: "currentCoverage",
        label: "Current Coverage",
        tooltip:
          "The impermanent loss protection you have accrued. Impermanent loss protection starts 30 days after your deposit, at a rate of 30% and gradually increases 1% per day until you reach 100% protection.",
        minWidth: "195px"
      },
      {
        id: 8,
        key: "actions",
        label: "",
        sortable: false,
        minWidth: "70px",
        maxWidth: "70px"
      }
    ];
  }

  doFilter(row: ViewGroupedPositions, filter: string) {
    return (row.symbol as string).toLowerCase().includes(filter.toLowerCase());
  }

  customSort(row: ViewGroupedPositions, sortBy: string) {
    switch (sortBy) {
      case "stake":
        return row.stake.unixTime;
      case "fullyProtected":
        return row.fullyProtected.usdValue;
      case "protectedAmount":
        return row.protectedAmount.usdValue;
      case "apr":
        return row.apr.day;
      case "currentCoverage":
        return row.coverageDecPercent;
      default:
        return defaultTableSort(row, sortBy, true);
    }
  }
}
</script>

<style lang="scss">
//@import "src/assets/_scss/custom/variables";
//
//#protected-table {
//  table {
//    // display: block;
//    // min-height: 300px;
//  }
//}
</style>
