<template>
  <div class="w-100 text-center mt-2 mb-3">
    <b-row>
      <b-col>
        <b-button-group class="d-flex">
          <b-button
            :to="{ name: 'Swap' }"
            :variant="$route.name !== 'Swap' ? 'outline-primary' : 'primary'"
            style="width: 50%"
            >Swap</b-button
          >
          <b-button
            :to="{ name: 'Pool' }"
            :variant="$route.name !== 'Pool' ? 'outline-primary' : 'primary'"
            style="width: 50%"
            >Pool</b-button
          >
        </b-button-group>
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import BaseComponent from "@/components/BaseComponent.vue";

@Component
export default class SubNavigation extends BaseComponent {}
</script>

<style></style>
