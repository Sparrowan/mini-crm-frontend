<script lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

// Composition API approach
export default {
  setup() {
    const route = useRoute(); // Get the current route
    const lead = ref<any>(null); // Store lead data
    const loading = ref<boolean>(true); // To track loading state
    const error = ref<string | null>(null); // To handle errors
    const tab = ref<string | null>(null); // Store the selected tab value

    // Fetch lead data based on the ID
    const fetchLead = async () => {
      const id = route.params.id; // Get the lead ID from the route
      if (!id) {
        error.value = "No lead ID provided.";
        loading.value = false;
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/leads/${id}`
        );
        lead.value = response.data;
      } catch (err) {
        error.value = "Failed to fetch lead data.";
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    // Fetch the lead when the component is mounted
    onMounted(() => {
      fetchLead();
    });

    // Return variables and methods to the template
    return {
      lead,
      loading,
      error,
      tab,
    };
  },
};
</script>

<template>
  <!-- Lead Information Card -->
  <v-card v-if="lead && !loading" class="ma-4" :loading="loading">
    <v-card-title>{{ lead.first_name }} {{ lead.last_name }}</v-card-title>
    <v-card-text>
      <div><strong>Phone:</strong> {{ lead.phone_number }}</div>
      <div><strong>Location:</strong> {{ lead.location }}</div>
      <div>
        <strong>Gender:</strong> {{ lead.gender === "M" ? "Male" : "Female" }}
      </div>
      <div><strong>Created At:</strong> {{ lead.created_at }}</div>
    </v-card-text>
  </v-card>

  <!-- Loading Spinner -->
  <v-progress-circular
    v-if="loading"
    indeterminate
    color="primary"
  ></v-progress-circular>

  <!-- Error Message -->
  <v-alert v-if="error" type="error">{{ error }}</v-alert>

  <!-- Tabs Section -->
  <v-card>
    <v-tabs v-model="tab" bg-color="success">
      <v-tab value="contacts">Lead Contacts</v-tab>
      <v-tab value="notes">Lead Notes</v-tab>
      <v-tab value="reminders">Lead Reminders</v-tab>
    </v-tabs>

    <v-card-text>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="contacts">
          <Contacts />
        </v-tabs-window-item>

        <v-tabs-window-item value="notes">
          <Notes />
        </v-tabs-window-item>

        <v-tabs-window-item value="reminders">
          <Reminders />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>
</template>
