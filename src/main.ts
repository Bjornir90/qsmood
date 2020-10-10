import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import Vuetify from 'vuetify'
import VueResource from 'vue-resource'
import 'vuetify/dist/vuetify.min.css'
import dotenv from 'dotenv'

dotenv.config();

Vue.config.productionTip = false

Vue.use(VueResource);

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')

