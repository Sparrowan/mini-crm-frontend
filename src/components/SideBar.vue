<script setup lang="ts">
import { useRoute } from "vue-router";
const isActiveLink = (routePath) => {
  const route = useRoute();
  return route.path === routePath;
};
</script>

<template>
  <v-navigation-drawer expand-on-hover rail>
    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-arrow-up-bold-box-outline"
        title="Leads"
        value="leads"
        :active="isActiveLink('/')"
        to="/"
      />
    </v-list>
  </v-navigation-drawer>
</template>
