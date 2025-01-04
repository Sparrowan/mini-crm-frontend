<script setup>
import LeadsVue from "./components/Leads.vue";
import SideBarVue from "./components/SideBar.vue";
</script>

<template>
  <v-responsive>
    <v-app>
      <v-app-bar title="Mini CRM"></v-app-bar>
      <SideBarVue />
      <v-main>
        <v-container>
          <LeadsVue />
        </v-container>
      </v-main>
    </v-app>
  </v-responsive>
</template>
