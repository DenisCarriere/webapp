<template>
  <div
    class="d-block mb-0 py-2 text-white text-center font-size-12 font-w600"
    :class="'bg-' + alert.variant"
  >
    <font-awesome-icon
      v-if="alert.variant !== 'primary'"
      icon="exclamation-triangle"
      class="ml-1 mr-1"
      size="1x"
    />
    {{ alert.msg }}
  </div>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import BaseComponent from "@/components/BaseComponent.vue";
import { vxm } from "@/store";
import { EthNetworks } from "@/api/web3";

@Component
export default class NetworkAlert extends BaseComponent {
  get alert() {
    const network = vxm.ethBancor.currentNetwork;
    switch (network) {
      case EthNetworks.Mainnet:
        return {
          msg: "This interface is in beta. Use it at your own risk.",
          variant: "primary"
        };
      case EthNetworks.Ropsten:
        return {
          msg: "You are on Ropsten Testnet.",
          variant: "warning"
        };
      default:
        return {
          msg: "Unsupported Network. Switch to mainnet network to use the app!",
          variant: "danger"
        };
    }
  }
}
</script>

<style lang="scss"></style>
