<script setup>
import SideBarVue from "./components/SideBar.vue";
</script>

<template>
  <v-responsive class="border rounded" max-height="300">
    <v-app>
      <v-app-bar title="Mini CRM"></v-app-bar>

      <SideBarVue />
      <v-main>
        <v-container>
          <h1>Main Content</h1>
        </v-container>
      </v-main>
    </v-app>
  </v-responsive>
</template>
