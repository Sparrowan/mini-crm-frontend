<template>
  <v-data-table
    :headers="headers"
    :items="leads"
    :sort-by="[{ key: 'calories', order: 'asc' }]"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Leads</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ props }">
            <v-btn class="mb-2" color="primary" dark v-bind="props">
              New Item
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" md="4" sm="6">
                    <v-text-field
                      v-model="editedItem.name"
                      label="Dessert name"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4" sm="6">
                    <v-text-field
                      v-model="editedItem.calories"
                      label="Calories"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4" sm="6">
                    <v-text-field
                      v-model="editedItem.fat"
                      label="Fat (g)"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4" sm="6">
                    <v-text-field
                      v-model="editedItem.carbs"
                      label="Carbs (g)"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4" sm="6">
                    <v-text-field
                      v-model="editedItem.protein"
                      label="Protein (g)"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="close">
                Cancel
              </v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="save">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5"
              >Are you sure you want to delete this item?</v-card-title
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="closeDelete"
                >Cancel</v-btn
              >
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="deleteItemConfirm"
                >OK</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon class="me-2" size="small" @click="editItem(item)">
        mdi-pencil
      </v-icon>
      <v-icon size="small" @click="deleteItem(item)"> mdi-delete </v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="initialize"> Reset </v-btn>
    </template>
  </v-data-table>
</template>
<script>
import axios from "axios";

export default {
  data: () => ({
    dialog: false,
    dialogDelete: false,
    headers: [
      { title: "ID", align: "start", sortable: false, key: "id" },
      { title: "Frist Name", key: "first_name" },
      { title: "Middel Name", key: "middle_name" },
      { title: "Last Name", key: "last_name" },
      { title: "Phone Number", key: "phone_number" },
      { title: "Location", key: "location" },
      { title: "Gender", key: "gender" },
      { title: "Created At", key: "created_at" },
      { title: "Actions", key: "actions", sortable: false },
    ],
    leads: [],
    editedIndex: -1,
    editedItem: {
      first_name: "",
      middle_name: "",
      last_name: "",
      phone_number: "",
      location: "",
      gender: "M",
    },
    defaultItem: {
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
      return this.editedIndex === -1 ? "New Item" : "Edit Item";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  created() {
    this.initialize();
  },

  methods: {
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

    editItem(item) {
      this.editedIndex = this.leads.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.leads.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    async deleteItemConfirm() {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/leads/${this.editedItem.id}/`
        );
        this.leads.splice(this.editedIndex, 1);
        this.closeDelete();
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    async save() {
      if (this.editedIndex > -1) {
        // Update existing item
        try {
          const response = await axios.put(
            `${import.meta.env.VITE_API_URL}/leads/${this.editedItem.id}/`,
            this.editedItem
          );
          Object.assign(this.leads[this.editedIndex], response.data);
        } catch (error) {
          console.error("Error updating item:", error);
        }
      } else {
        // Create new item
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/leads/`,
            this.editedItem
          );
          this.leads.push(response.data);
        } catch (error) {
          console.error("Error creating item:", error);
        }
      }
      this.close();
    },
  },
};
</script>
