<template>
  <v-container>

    <v-row justify="center">
      <v-col cols="3">
        <v-card elevation="4">

          <v-card-title>Items in database</v-card-title>

          <div v-if="lastItemsLoadFailed" text-color="error">
            Error ! Could not load database items
          </div>

          <v-list v-else class="px-1">

            <v-list-group v-for="item in items" :key="item.date">

              <template v-slot:activator>
                <v-list-item-title>{{item.date}}</v-list-item-title>
              </template>


              <v-list-item class="ml-3" v-for="(value, name) in item" :key="name" dense>
                <v-list-item-content>
                  <v-list-item-title>{{name}} : {{value}}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

            </v-list-group>

          </v-list>

        </v-card>

      </v-col>

      <v-col cols="3">
        <v-card class="px-2" elevation="4">

          <v-card-title>Search by date</v-card-title>

          <v-form v-model="rangeFormValid" >
            <v-text-field v-model="startDate" :rules="dateRules" label="Start date"></v-text-field>
            <v-text-field v-model="endDate" :rules="dateRules" label="End date"></v-text-field>
          </v-form>

          <v-spacer></v-spacer>

          <v-btn @click="submitRangeForm" class="mb-2">Search</v-btn>

          <v-container v-if="searchRangeRequested">

            <v-divider></v-divider>

            <v-alert v-if="searchRangeFailed" type="error" border="left" elevation="2">
              Error ! Could not load database items
            </v-alert>

            <v-list v-else class="px-1 d-flex flex-column">

              <v-header class="align-self-center">Search result</v-header>


              <v-list-group v-for="item in itemsRange" :key="item.date">

                <template v-slot:activator>
                  <v-list-item-title>{{item.date}}</v-list-item-title>
                </template>


                <v-list-item class="ml-3" v-for="(value, name) in item" :key="name" dense>
                  <v-list-item-content>
                    <v-list-item-title>{{name}} : {{value}}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

              </v-list-group>

            </v-list>

          </v-container>

        </v-card>

      </v-col>

    </v-row>

  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data: () => {
    return {
      items: null,
      itemsRange: null,
      lastItemsLoadFailed: false,
      searchRangeFailed: false,
      searchRangeRequested: false,
      rangeFormValid: false,
      startDate: '',
      endDate: '',
      dateRules: [
        (d: any) => /^\d{4}-\d{2}-\d{2}$/.test(d) || 'Format must be aaaa-mm-dd'
      ]
    }
  },

  methods: {
    submitRangeForm: function () {
      this.searchRangeRequested = true;
      this.$http.get(`${process.env.VUE_APP_API_URL}/api/days/range/${this.startDate}/${this.endDate}`).then(data => {
        this.itemsRange = data.data;
        this.searchRangeFailed = false;
      }, err => this.searchRangeFailed = true)
    }
  },

  mounted: function () {
    this.$http.get(`${process.env.VUE_APP_API_URL}/api/days/last/10`).then(data => this.items = data.data, err => this.lastItemsLoadFailed = true)
  }
})
</script>