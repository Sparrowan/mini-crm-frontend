<script setup lang="ts">
import SideBarVue from "./components/SideBar.vue";
</script>

<template>
  <v-responsive>
    <v-app>
      <v-app-bar title="Mini CRM" />
      <SideBarVue />
      <v-main>
        <v-container>
          <v-card>
            <RouterView />
          </v-card>
        </v-container>
      </v-main>
    </v-app>
  </v-responsive>
</template>
