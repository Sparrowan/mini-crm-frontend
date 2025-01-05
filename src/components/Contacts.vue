<template>
  <v-data-table
    :headers="headers"
    :items="contacts"
    :sort-by="[{ key: 'id', order: 'desc' }]"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Contacts</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog">
          <template v-slot:activator="{ props }">
            <v-btn class="mb-2" color="primary" dark v-bind="props">
              New Contact
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
                        v-model="editedContact.first_name"
                        :label="getLabel('First Name')"
                        :rules="[
                          (value) => !!value || 'First Name is required',
                        ]"
                      />
                    </v-col>
                    <v-col cols="12" md="4" sm="6">
                      <v-text-field
                        v-model="editedContact.middle_name"
                        :label="getLabel('Middle Name')"
                        :rules="[
                          (value) => !!value || 'Middle Name is required',
                        ]"
                      />
                    </v-col>
                    <v-col cols="12" md="4" sm="6">
                      <v-text-field
                        v-model="editedContact.last_name"
                        :label="getLabel('Last Name')"
                        :rules="[(value) => !!value || 'Last Name is required']"
                      />
                    </v-col>
                    <v-col cols="12" md="4" sm="6">
                      <v-text-field
                        v-model="editedContact.phone_number"
                        :label="getLabel('Phone')"
                        :rules="[
                          (value) => !!value || 'Phone Number is required',
                        ]"
                      />
                    </v-col>
                    <v-col cols="12" md="4" sm="6">
                      <v-text-field
                        v-model="editedContact.email"
                        :label="getLabel('Email')"
                        :rules="[(value) => !!value || 'Email is required']"
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
              >Are you sure you want to delete this contact?</v-card-title
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="closeDelete"
                >Cancel</v-btn
              >
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="deleteContactConfirm"
                >OK</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon class="me-2" size="small" @click="editContact(item)">
        mdi-pencil
      </v-icon>
      <v-icon size="small" @click="deleteContact(item)" color="red">
        mdi-delete
      </v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="initialize"> Reset </v-btn>
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
const route = useRoute();

export default {
  setup() {
    const route = useRoute();
    return { route };
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
      { title: "First Name", key: "first_name" },
      { title: "Middle Name", key: "middle_name" },
      { title: "Last Name", key: "last_name" },
      { title: "Phone Number", key: "phone_number" },
      { title: "Email", key: "email" },
      { title: "Created At", key: "created_at" },
      { title: "Actions", key: "actions", sortable: false },
    ],
    contacts: [],
    editedIndex: -1,
    editedContact: {
      first_name: "",
      middle_name: "",
      last_name: "",
      phone_number: "",
      email: "",
    },
    defaultContact: {
      first_name: "",
      middle_name: "",
      last_name: "",
      phone_number: "",
      email: "",
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Contact" : "Edit Contact";
    },
  },
  watch: {
    "route.params.id": {
      handler(newId) {
        this.editedContact.lead_id = newId;
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
          `${import.meta.env.VITE_API_URL}/contacts/list`,
          {
            params: {
              lead_id: leadId, // Include lead_id as a query parameter
            },
          }
        );
        this.contacts = response.data;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },

    editContact(item) {
      this.editedIndex = this.contacts.indexOf(item);
      this.editedContact = Object.assign({}, item);
      this.dialog = true;
    },

    openDetails(item) {
      this.editedIndex = this.contacts.indexOf(item);
      this.editedContact = Object.assign({}, item);
      this.dialog = true;
    },

    deleteContact(item) {
      this.editedIndex = this.contacts.indexOf(item);
      this.editedContact = Object.assign({}, item);
      this.dialogDelete = true;
    },

    async deleteContactConfirm() {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/contacts/${
            this.editedContact.id
          }/delete/`
        );
        this.contacts.splice(this.editedIndex, 1);
        this.closeDelete();
        this.showToast("Contact deleted successfully!");
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedContact = Object.assign({}, this.defaultContact);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedContact = Object.assign({}, this.defaultContact);
        this.editedIndex = -1;
      });
    },

    async save() {
      // Trigger the form validation
      const form = this.$refs.form;
      this.editedContact.lead_id = this.route.params.id;
      if (form.validate()) {
        if (this.editedIndex > -1) {
          try {
            const response = await axios.put(
              `${import.meta.env.VITE_API_URL}/contacts/${
                this.editedContact.id
              }/update/`,
              this.editedContact
            );
            Object.assign(this.contacts[this.editedIndex], response.data);
            this.showToast("Contact updated successfully!");
          } catch (error) {
            console.error("Error updating item:", error);
            this.showToast(
              "Error! Contact with that email already exists",
              "red"
            );
          }
        } else {
          try {
            const response = await axios.post(
              `${import.meta.env.VITE_API_URL}/contacts/create/`,
              this.editedContact
            );
            this.contacts.push(response.data);
            this.showToast("New contact created successfully!");
          } catch (error) {
            console.error("Error creating item:", error);
            this.showToast(
              "Error! Contact with that email already exists",
              "red"
            );
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
