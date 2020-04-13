<template>
  <div>
    <b-navbar toggleable="sm" type="dark" variant="dark">
      <b-navbar-brand v-if='false' href="#">Home</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse" ></b-navbar-toggle>

      <b-collapse size='sm' id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-dropdown left variant="outline-primary" v-if="loggedIn" text='Menu'>
            <b-dropdown-item><router-link to="users">Users</router-link></b-dropdown-item>
            <b-dropdown-item><router-link to="/">Home</router-link></b-dropdown-item>
            <b-dropdown-item><router-link to="about">About</router-link></b-dropdown-item>
            <b-dropdown-item @click="test()">Status</b-dropdown-item>
          </b-dropdown>
        </b-navbar-nav>
      </b-collapse>
      <b-button variant='outline-primary' v-if='!loggedIn' @click="login()">Login</b-button>
      <b-button variant='outline-success' v-if='loggedIn' @click="logout()">Logout</b-button>
    </b-navbar>
  </div>
</template>

<script>
import axios from 'axios';
axios.defaults.withCredentials = true
import { eventBus} from './events.js'
import { URL_LOGOUT} from '@/components/constants.js';

export default {
  name: 'NavBarMain',
  props: {
    title: {
      default: "Login",
      type: String
    },
    loggedIn: {
      default: false,
      type: Boolean
    },
    id: {
      default: "NavBarMain",
      type: String
    }
  },
  data: function(){
    return{
      testv: false
    }
  },
  methods:{
    refresh(){
      console.log("logout")
    },
    login: function(){
      eventBus.$emit('showLoginWindow')
    },
    logout: async function() {
      let _this = this
      await axios.post( URL_LOGOUT ,{username: _this.username, password: _this.password})
      .then(() => {
        console.log("NavBarMain: logoutEvent")
        eventBus.$emit('logoutEvent')  
      })
      .catch(error => {
        console.log("NavBarMain: logoutEvent error:",error)
      })
    },
    test: function(){
      console.log("test")
    }
  },
  computed:{

  },
  mounted: function () {
    this.refresh()
    console.log("NavBarMain: Mounted")
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
