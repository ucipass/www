<template>
  <div>
    <b-modal :id="id" class="text-center" :title="title">
        <b-container>
          <b-row align-h="center">
            <b-col class="col-4 text-right"><label for="username" class="m-0" >username</label></b-col>
            <b-col><b-input autofocus @keydown.native="keydown_handler" v-model='username' id='username'></b-input></b-col>
          </b-row>
          <b-row align-h="center">
            <b-col class="col-4 text-right"><label for="password" class="m-0" >password</label></b-col>
            <b-col><b-input @keydown.native="keydown_handler" type="password" v-model='password' id='password'></b-input></b-col>
          </b-row>
        </b-container>
        <div slot="modal-footer" class="w-100">
          <p class="float-left text-danger">{{loginError}}</p>
          <p class="float-left"></p>
          <b-button variant="primary" size="sm" class="float-right" @click="login">Login</b-button>
        </div>
    </b-modal>
  </div>
</template>

<script>
import { URL_LOGIN} from '@/components/constants.js';
import { getCookie, setCookie } from '@/components/cookies.js';
import { eventBus } from './events.js' ;
import axios from 'axios';
axios.defaults.withCredentials = true

export default {
  name: 'ModalLogin',
  props: {
    title: {
      default: "Login",
      type: String
    },
    id: {
      default: "ModalLoginId",
      type: String
    },
    loggedIn: {
      default: false,
      type: Boolean
    }
  },
  data: function(){
    return{
      username: '',
      password: '',
      loginError: ""
    }
  },
  methods:{
    show: function(){
      this.username = getCookie("username")
      this.password = getCookie("password")
      this.loginError = ""
      this.$bvModal.show(this.id)
    },
    hide: function(){
      this.$bvModal.hide(this.id)
    },
    keydown_handler: async function(){
      if (event.which === 13) {
        this.login()
      }
    },
    login: async function() {
      let _this = this
      await axios.post( URL_LOGIN ,{username: _this.username, password: _this.password})
      .then(response => {
        let loginSuccess = response.data
        if(loginSuccess){
          console.log("ModalLogin: loginEvent")
          eventBus.$emit('loginEvent',{ username: _this.username, loggedIn: true})  
          setCookie("username",    _this.username, 7)
          setCookie("password",    _this.password, 7)
          this.loginError = ""
          this.hide() 
        }
        else{
          eventBus.$emit('loginEvent',{ username: _this.username, loggedIn: false}) 
          this.loginError = "Login failed"
        }
      })
      .catch(error => {
        eventBus.$emit('loginEvent',{ username: _this.username, loggedIn: false}) 
        this.loginError = "Login app error"
        console.log("ModalLogin App Error:",error)
      })
    }
  },
  mounted: async function () {
    console.log("ModalLogin: Mounted")
    eventBus.$on('showLoginWindow', () => {
        // console.log("Generator", event)
        this.show()
    })
    if(! this.$root.settings) this.$root.settings = {}
    this.username = getCookie("username")
    this.password = getCookie("password")
    // if ( this.username && this.password) this.login()

    // await axios
    // .post(URL_SCHEMA,{})
    // .then(response => {
    //   console.log("LOGGED IN:",response.data)
    // })
    // .catch(error => {
    //   console.log("Error reading schema from server",error)
    // }) 

  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
