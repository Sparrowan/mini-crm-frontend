<template>
  <v-data-table
    :headers="headers"
    :items="notes"
    :sort-by="[{ key: 'id', order: 'desc' }]"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Notes</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog">
          <template v-slot:activator="{ props }">
            <v-btn class="mb-2" color="primary" dark v-bind="props">
              New Note
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
                        v-model="editedNote.title"
                        :label="getLabel('Title')"
                        :rules="[(value) => !!value || 'Title is required']"
                      />
                    </v-col>
                    <v-col cols="12" md="4" sm="6">
                      <v-text-field
                        v-model="editedNote.content"
                        :label="getLabel('Content')"
                        :rules="[(value) => !!value || 'Content is required']"
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
              >Are you sure you want to delete this note?</v-card-title
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="closeDelete"
                >Cancel</v-btn
              >
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="deleteNoteConfirm"
                >OK</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon class="me-2" size="small" @click="editNote(item)">
        mdi-pencil
      </v-icon>
      <v-icon size="small" @click="deleteNote(item)" color="red">
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
      { title: "Title", key: "title" },
      { title: "Content", key: "content" },
      { title: "Created At", key: "created_at" },
      { title: "Actions", key: "actions", sortable: false },
    ],
    notes: [],
    editedIndex: -1,
    editedNote: {
      title: "",
      content: "",
    },
    defaultNote: {
      title: "",
      content: "",
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Note" : "Edit Note";
    },
  },
  watch: {
    "route.params.id": {
      handler(newId) {
        this.editedNote.lead_id = newId;
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
          `${import.meta.env.VITE_API_URL}/notes/list`,
          {
            params: {
              lead_id: leadId, // Include lead_id as a query parameter
            },
          }
        );
        this.notes = response.data;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },

    editNote(item) {
      this.editedIndex = this.notes.indexOf(item);
      this.editedNote = Object.assign({}, item);
      this.dialog = true;
    },

    openDetails(item) {
      this.editedIndex = this.notes.indexOf(item);
      this.editedNote = Object.assign({}, item);
      this.dialog = true;
    },

    deleteNote(item) {
      this.editedIndex = this.notes.indexOf(item);
      this.editedNote = Object.assign({}, item);
      this.dialogDelete = true;
    },

    async deleteNoteConfirm() {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/notes/${this.editedNote.id}/delete/`
        );
        this.notes.splice(this.editedIndex, 1);
        this.closeDelete();
        this.showToast("Note deleted successfully!");
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedNote = Object.assign({}, this.defaultNote);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedNote = Object.assign({}, this.defaultNote);
        this.editedIndex = -1;
      });
    },

    async save() {
      // Trigger the form validation
      const form = this.$refs.form;
      this.editedNote.lead_id = this.route.params.id;
      if (form.validate()) {
        if (this.editedIndex > -1) {
          try {
            const response = await axios.put(
              `${import.meta.env.VITE_API_URL}/notes/${
                this.editedNote.id
              }/update/`,
              this.editedNote
            );
            Object.assign(this.notes[this.editedIndex], response.data);
            this.showToast("Note updated successfully!");
          } catch (error) {
            console.error("Error updating item:", error);
            this.showToast("Error! Updating Note", "red");
          }
        } else {
          try {
            const response = await axios.post(
              `${import.meta.env.VITE_API_URL}/notes/create/`,
              this.editedNote
            );
            this.notes.push(response.data);
            this.showToast("New note created successfully!");
          } catch (error) {
            console.error("Error creating item:", error);
            this.showToast("Error! Creating Note", "red");
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
