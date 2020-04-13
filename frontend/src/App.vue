<template>
  <div id="app">
    <div id="nav">
      <NavBarMain :loggedIn="status.loggedIn" msg="Welcome Home!"/>
      <ModalLogin/>
    </div>
    <router-view/>
  </div>
</template>

<script>
import NavBarMain from '@/components/NavBarMain.vue'
import ModalLogin from '@/components/ModalLogin.vue'
import { eventBus } from '@/components/events.js' ;
import axios from 'axios';
import { URL_USERS_READ } from '@/components/constants.js';


export default {
  name: 'App',
  components: {
    NavBarMain,
    ModalLogin
  },
  data: function(){
    return{
      status:{
        username: '',
        password: '',
        loggedIn: false,
        loginError: ""
      }
    }
  },
  mounted: async function () {
    console.log("App: Mounted")
    let loginCheck = await axios.post(URL_USERS_READ)
    if( loginCheck.data) {
      this.status.loggedIn = true
    }else{
      console.log(this.$router.history.current.name)
      if (this.$router.history.current.name != "Home") this.$router.push('/')
      
    }    
    eventBus.$on('loginEvent', (data) => {
      console.log("App: received loginEvent:",data)
      this.status.loggedIn = data.loggedIn
    })
    eventBus.$on('logoutEvent', () => {
      console.log("App: received logoutEvent:")
      this.status.loggedIn = false
      console.log(this.$router.history.current.name)
      if (this.$router.history.current.name != "Home") this.$router.push('/')
    })
  }    
}


</script>

<style>
</style>
