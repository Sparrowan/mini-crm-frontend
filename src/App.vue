<script setup lang="ts">
import SideBarVue from "./components/SideBar.vue";
import LeadsListPage from "./pages/LeadsListPage.vue";
</script>

<template>
  <v-responsive>
    <v-app>
      <v-app-bar title="Mini CRM" />
      <SideBarVue />
      <v-main>
        <v-container>
          <v-card>
            <LeadsListPage />
          </v-card>
        </v-container>
      </v-main>
    </v-app>
  </v-responsive>
</template>
