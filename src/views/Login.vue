<template>
    <v-container>
        <v-row justify="center">
            <v-col xs="12" sm="6" md="3">
                <v-card class="px-3 ma-5">
                    <v-card-title>Login</v-card-title>
                    <v-text-field v-model="username" label="Username"></v-text-field>
                    <v-text-field v-model="password" label="Password" :type="'password'"></v-text-field>
                    <v-btn class="mb-2" @click="login">Login</v-btn>
                    <v-alert type="error" v-if="loginFail" border="left" elevation="2">Could not login</v-alert>
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
        username: "",
        password: "",
        loginFail: false
    }},
    methods: {
        login: function() {
            this.loginFail = false;
            this.$http.post(`${process.env.VUE_APP_API_URL}/api/token`, {"password": this.password, "username": this.username}).then((response: any) => {
                const token = response.data.token;
                this.$cookies.set('qsmoodtoken', token, 60*60);
            }, (err: any) => {
                this.loginFail = true;
            })
        }
    }

})
</script>