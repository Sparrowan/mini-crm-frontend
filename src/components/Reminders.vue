<template>
  <v-data-table
    :headers="headers"
    :items="reminders"
    :sort-by="[{ key: 'id', order: 'desc' }]"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Reminders</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog">
          <template v-slot:activator="{ props }">
            <v-btn class="mb-2" color="primary" dark v-bind="props">
              New Reminder
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-form ref="form" v-model="valid">
                <v-container>
                  <v-row>
                    <v-col cols="12" md="4" sm="6">
                      <v-text-field
                        v-model="editedReminder.title"
                        :label="getLabel('Title')"
                        :rules="[(value) => !!value || 'Title is required']"
                      />
                    </v-col>
                    <v-col cols="12" md="4" sm="6">
                      <v-text-field
                        v-model="editedReminder.message"
                        :label="getLabel('Message')"
                        :rules="[(value) => !!value || 'Message is required']"
                      />
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="close">
                Cancel
              </v-btn>
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="save"
                :disabled="!valid"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5"
              >Are you sure you want to delete this reminder?</v-card-title
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="closeDelete"
                >Cancel</v-btn
              >
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="deleteReminderConfirm"
                >OK</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon class="me-2" size="small" @click="editReminder(item)">
        mdi-pencil
      </v-icon>
      <v-icon size="small" @click="deleteReminder(item)" color="red">
        mdi-delete
      </v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="initialize"> Refresh Data </v-btn>
    </template>
    <template v-slot:item.created_at="{ item }">
      {{ formatDate(item.created_at) }}
    </template>
    <template v-slot:item.status="{ item }">
      <span
        :class="{
          'bg-warning text-white py-1 px-2 rounded': item.status === 'pending',
          'bg-success text-white py-1 px-2 rounded':
            item.status === 'processed',
        }"
        >{{ item.status === "pending" ? "Pending" : "Processed" }}</span
      >
    </template>
  </v-data-table>

  <v-snackbar
    v-model="snackbar.visible"
    :timeout="snackbar.timeout"
    :color="snackbar.color"
    top
    right
  >
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script>
import axios from "axios";
import { useRoute } from "vue-router";
import { formatDate } from "../utils";

export default {
  setup() {
    const route = useRoute();
    return { route, formatDate };
  },
  data: () => ({
    dialog: false,
    dialogDelete: false,
    valid: false,
    snackbar: {
      visible: false,
      message: "",
      timeout: 3000,
      color: "success",
    },
    headers: [
      { title: "ID", align: "start", sortable: false, key: "id" },
      { title: "Title", key: "title" },
      { title: "Status", key: "status" },
      { title: "Message", key: "message" },
      { title: "Created At", key: "created_at" },
      { title: "Actions", key: "actions", sortable: false },
    ],
    reminders: [],
    editedIndex: -1,
    editedReminder: {
      title: "",
      message: "",
    },
    defaultReminder: {
      title: "",
      message: "",
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Reminder" : "Edit Reminder";
    },
  },
  watch: {
    "route.params.id": {
      handler(newId) {
        this.editedReminder.lead_id = newId;
      },
      immediate: true,
    },
  },
  mounted() {
    this.initialize();
  },

  methods: {
    getLabel(field) {
      return `${field} *`;
    },
    async initialize() {
      try {
        const leadId = this.route.params.id;
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/reminders/list`,
          {
            params: { lead_id: leadId },
          }
        );
        this.reminders = response.data;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    editReminder(item) {
      this.editedIndex = this.reminders.indexOf(item);
      this.editedReminder = Object.assign({}, item);
      this.dialog = true;
    },
    deleteReminder(item) {
      this.editedIndex = this.reminders.indexOf(item);
      this.editedReminder = Object.assign({}, item);
      this.dialogDelete = true;
    },
    async deleteReminderConfirm() {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/reminders/${
            this.editedReminder.id
          }/delete/`
        );
        this.reminders.splice(this.editedIndex, 1);
        this.closeDelete();
        this.showToast("Reminder deleted successfully!");
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    },
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedReminder = Object.assign({}, this.defaultReminder);
        this.editedIndex = -1;
      });
    },
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedReminder = Object.assign({}, this.defaultReminder);
        this.editedIndex = -1;
      });
    },
    async save() {
      const form = this.$refs.form;
      this.editedReminder.lead_id = this.route.params.id;
      if (form.validate()) {
        if (this.editedIndex > -1) {
          try {
            const response = await axios.put(
              `${import.meta.env.VITE_API_URL}/reminders/${
                this.editedReminder.id
              }/update/`,
              this.editedReminder
            );
            Object.assign(this.reminders[this.editedIndex], response.data);
            this.showToast("Reminder updated successfully!");
          } catch (error) {
            console.error("Error updating item:", error);
            this.showToast("Error! Updating Reminder", "red");
          }
        } else {
          try {
            const response = await axios.post(
              `${import.meta.env.VITE_API_URL}/reminders/create/`,
              this.editedReminder
            );
            this.reminders.push(response.data);
            this.showToast("New reminder created successfully!");
          } catch (error) {
            console.error("Error creating item:", error);
            this.showToast("Error! Creating Reminder", "red");
          }
        }
        this.close();
      } else {
        console.log("Validation failed");
      }
    },
    showToast(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.visible = true;
    },
  },
};
</script>
