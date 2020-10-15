import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import Vuetify from 'vuetify'
import VueResource from 'vue-resource'
import 'vuetify/dist/vuetify.min.css'
import dotenv from 'dotenv'
import VueCookies from 'vue-cookies'

dotenv.config();

Vue.config.productionTip = false

Vue.use(VueResource);
Vue.use(VueCookies);

Vue.http.interceptors.push((request: Request) => {
  if(Vue.$cookies.isKey("qsmoodtoken"))
    request.headers.set('Authorization', 'Bearer '+Vue.$cookies.get("qsmoodtoken"));
})

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')

