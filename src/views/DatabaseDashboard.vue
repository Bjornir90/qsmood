<template>
  <v-container>
    <v-card>

      <div v-if="lastItemsLoadFailed">
        Error ! Could not load database items
      </div>

      <v-list v-else class="mx-auto" tile>

        <v-subheader>Items in database</v-subheader>

        <v-list-group v-for="item in items" :key="item.date">

          <template v-slot:activator>
            <v-list-item-title>{{item.date}}</v-list-item-title>
          </template>

          <v-list-item-content v-for="(value, name) in item" :key="name">
            <v-list-item-title>{{name}} : {{value}}</v-list-item-title>
          </v-list-item-content>

        </v-list-group>

      </v-list>

    </v-card>

  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data: () => {
    return {
      items: null,
      lastItemsLoadFailed: false
    }
  },

  mounted: function () {
    this.$http.get(`${process.env.VUE_APP_API_URL}/api/days/last/10`).then(data => this.items = data.data, err => this.lastItemsLoadFailed = true)
  }
})
</script>