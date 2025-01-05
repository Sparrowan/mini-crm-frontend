<template>
  <v-data-table
    :headers="headers"
    :items="leads"
    :sort-by="[{ key: 'id', order: 'desc' }]"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Leads</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ props }">
            <v-btn class="mb-2" color="primary" dark v-bind="props">
              New Lead
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <!-- Wrap the form fields inside v-form -->
              <v-form ref="form" v-model="valid">
                <v-container>
                  <v-row>
                    <v-col cols="12" md="4" sm="6">
                      <v-text-field
                        v-model="editedLead.first_name"
                        :label="getLabel('First Name')"
                        :rules="[
                          (value) => !!value || 'First Name is required',
                        ]"
                      />
                    </v-col>
                    <v-col cols="12" md="4" sm="6">
                      <v-text-field
                        v-model="editedLead.middle_name"
                        :label="getLabel('Middle Name')"
                        :rules="[
                          (value) => !!value || 'Middle Name is required',
                        ]"
                      />
                    </v-col>
                    <v-col cols="12" md="4" sm="6">
                      <v-text-field
                        v-model="editedLead.last_name"
                        :label="getLabel('Last Name')"
                        :rules="[(value) => !!value || 'Last Name is required']"
                      />
                    </v-col>
                    <v-col cols="12" md="4" sm="6">
                      <v-text-field
                        v-model="editedLead.phone_number"
                        :label="getLabel('Phone')"
                        :rules="[
                          (value) => !!value || 'Phone Number is required',
                        ]"
                      />
                    </v-col>
                    <v-col cols="12" md="4" sm="6">
                      <v-text-field
                        v-model="editedLead.location"
                        :label="getLabel('Location')"
                        :rules="[(value) => !!value || 'Location is required']"
                      />
                    </v-col>
                    <v-col cols="12" md="4" sm="6">
                      <v-select
                        v-model="editedLead.gender"
                        :items="genderOptions"
                        item-title="label"
                        item-value="value"
                        :label="getLabel('Select Gender')"
                        single-line
                        :rules="[(value) => !!value || 'Gender is required']"
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
              >Are you sure you want to delete this lead?</v-card-title
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="closeDelete"
                >Cancel</v-btn
              >
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="deleteLeadConfirm"
                >OK</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <RouterLink :to="`/lead/${item.id}`">
        <v-icon class="me-2" size="small" color="green"> mdi-eye </v-icon>
      </RouterLink>
      <v-icon class="me-2" size="small" @click="editLead(item)">
        mdi-pencil
      </v-icon>
      <v-icon size="small" @click="deleteLead(item)" color="red">
        mdi-delete
      </v-icon>
    </template>
    <template v-slot:item.gender="{ item }">
      <span>{{ mapGender(item.gender) }}</span>
      <!-- This is where gender will be displayed -->
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="initialize"> Reset </v-btn>
    </template>
  </v-data-table>

  <v-snackbar
    v-model="snackbar.visible"
    :timeout="snackbar.timeout"
    color="success"
    top
    right
  >
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script>
import axios from "axios";

export default {
  data: () => ({
    dialog: false,
    dialogDelete: false,
    valid: false,
    snackbar: {
      visible: false,
      message: "",
      timeout: 3000,
    },
    headers: [
      { title: "ID", align: "start", sortable: false, key: "id" },
      { title: "First Name", key: "first_name" },
      { title: "Middle Name", key: "middle_name" },
      { title: "Last Name", key: "last_name" },
      { title: "Phone Number", key: "phone_number" },
      { title: "Location", key: "location" },
      { title: "Gender", key: "gender" },
      { title: "Created At", key: "created_at" },
      { title: "Actions", key: "actions", sortable: false },
    ],
    genderOptions: [
      { label: "Male", value: "M" },
      { label: "Female", value: "F" },
    ],
    leads: [],
    editedIndex: -1,
    editedLead: {
      first_name: "",
      middle_name: "",
      last_name: "",
      phone_number: "",
      location: "",
      gender: "M",
    },
    defaultLead: {
      first_name: "",
      middle_name: "",
      last_name: "",
      phone_number: "",
      location: "",
      gender: "M",
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Lead" : "Edit Lead";
    },
  },
  mounted() {
    this.initialize();
  },

  methods: {
    getLabel(field) {
      return `${field} *`;
    },
    mapGender(gender) {
      return gender === "M" ? "Male" : gender === "F" ? "Female" : "";
    },

    async initialize() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/leads/list`
        );
        this.leads = response.data;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },

    editLead(item) {
      this.editedIndex = this.leads.indexOf(item);
      this.editedLead = Object.assign({}, item);
      this.dialog = true;
    },

    openDetails(item) {
      this.editedIndex = this.leads.indexOf(item);
      this.editedLead = Object.assign({}, item);
      this.dialog = true;
    },

    deleteLead(item) {
      this.editedIndex = this.leads.indexOf(item);
      this.editedLead = Object.assign({}, item);
      this.dialogDelete = true;
    },

    async deleteLeadConfirm() {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/leads/${this.editedLead.id}/delete/`
        );
        this.leads.splice(this.editedIndex, 1);
        this.closeDelete();
        this.showToast("Lead deleted successfully!");
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedLead = Object.assign({}, this.defaultLead);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedLead = Object.assign({}, this.defaultLead);
        this.editedIndex = -1;
      });
    },

    async save() {
      // Trigger the form validation
      const form = this.$refs.form;
      if (form.validate()) {
        if (this.editedIndex > -1) {
          try {
            const response = await axios.put(
              `${import.meta.env.VITE_API_URL}/leads/${
                this.editedLead.id
              }/update/`,
              this.editedLead
            );
            Object.assign(this.leads[this.editedIndex], response.data);
            this.showToast("Lead updated successfully!");
          } catch (error) {
            console.error("Error updating item:", error);
          }
        } else {
          try {
            const response = await axios.post(
              `${import.meta.env.VITE_API_URL}/leads/create/`,
              this.editedLead
            );
            this.leads.push(response.data);
            this.showToast("New lead created successfully!");
          } catch (error) {
            console.error("Error creating item:", error);
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
