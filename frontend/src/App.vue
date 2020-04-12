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
    eventBus.$on('loginEvent', (data) => {
      console.log("App: received loginEvent:",data)
      this.status.loggedIn = data.loggedIn
    })
    eventBus.$on('logoutEvent', () => {
      console.log("App: received logoutEvent:")
      this.status.loggedIn = false
    })
  }    
}


</script>

<style>
</style>
