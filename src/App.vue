<template>
  <v-app>
    <link href="https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css" rel="stylesheet">
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <span> QSmood </span>
      </div>

      <v-spacer> </v-spacer>

      <v-btn text to="/dbdashboard"> Access Database </v-btn> 
      <v-btn text to="/"> Home </v-btn>
    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'App',

  data: () => ({
    //
  }),
});
</script>
