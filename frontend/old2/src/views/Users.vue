<template>
  <b-container fluid>
    <div class="text-center">
      <!-- {{users}} -->
      <b-card no-body class="mb-1">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-button block href="#" v-b-toggle.usercreate  variant="info">Create</b-button>
        </b-card-header>
        <b-collapse id="usercreate" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <b-card-text >
              <div class="row">
                <div class="col text-right">
                  Username:
                </div>
                <div class="col text-left">
                  <b-input v-model=newuser.username></b-input>
                </div>
              </div>                
            </b-card-text>
            <b-card-text >
              <div class="row">
                <div class="col text-right">
                  Password:
                </div>
                <div class="col text-left">
                  <b-input v-model=newuser.password></b-input>
                </div>
              </div>                
            </b-card-text>
            <p><b-button @click="create()" class="float-right mb-2 ml-2" variant="primary">Create</b-button></p>
          </b-card-body>
        </b-collapse>
      </b-card>  

      <b-card v-for="user in users" :key="user.username" no-body class="mb-1">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-button block href="#" v-b-toggle="user.username" variant="info">{{user.username}}</b-button>
        </b-card-header>
        <b-collapse v-bind:id="user.username" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <b-card-text v-for="prop in Object.keys(user)" :key=prop >
              <div class="row">
                <div class="col text-right">
                  {{ prop }}:
                </div>
                <div class="col text-left">
                  <b-input v-model='user[prop]'></b-input>
                </div>
              </div>                
            </b-card-text>
            <p><b-button @click="updateUser(user)" class="float-right mb-2 ml-2" variant="primary">Update</b-button></p>
            <p><b-button @click="deleteUser(user)" class="float-right mb-2" variant="primary">Delete</b-button></p>
          </b-card-body>
        </b-collapse>
      </b-card>      
    </div>
  </b-container>    
</template>

<script>
// import TableRow from './TableRow.vue'
import axios from 'axios';
import { URL_USERS_READ,URL_USERS_CREATE,URL_USERS_DELETE ,URL_USERS_UPDATE} from '@/components/constants.js';

export default {
  name: 'Users',
  components: {
    // TableRow
  },
  props: {
    title: {
      default: "MainClients",
      type: String
    },
    id: {
      default: "MainClients",
      type: String
    }
  },
  data: ()=> { 
    return{
      slots: ["cell(client)","cell(token)","cell(ipaddr)","cell(expiration)"],
      showMainClients: false,
      receivedData:[],
      tableColumns: [],
      users:[],
      newuser:{
        username:"testuser",
        password:"testpass"
      }
    } 
  },
  methods:{
    testfn: async function(){
      console.log("TEST")
    },
    updateData: function (index){
      console.log("UPDATE DATA:",this.receivedData[index])
    },
    deleteData: async function (){
      // console.log("DELETE DATA:",this.receivedData[index])
      // console.log(URL_SIOCLIENTS_DELETE)
      // let response = await axios
      // .post(URL_SIOCLIENTS_DELETE,this.receivedData[index])
      // .catch(error => { console.log("ERROR",error); return null })
      // this.status = response.data
      // if(this.status == 'success'){
      //   this.refresh()
      // }      
    },
    async refresh(){
      axios
      .post(URL_USERS_READ,{})
      .then(response => {
        console.log("URL_USERS_READ",response.data)
        if(response.data && response.data.length){
          this.users = response.data
        }
      })
      .catch(error => {
        console.log("ERROR",error)
      })      
      console.log("Event: showMainClients")      
    },
    async create(){
      await axios
      .post(URL_USERS_CREATE,this.newuser)
      .then(response => {
        console.log("URL_USERS_CREATE",response.data)
      })
      .catch(error => {
        console.log("URL_USERS_CREATE ERROR",error)
      })      
      this.refresh() 
    },
    async updateUser(user){
      await axios
      .post(URL_USERS_UPDATE,user)
      .then(response => {
        console.log("URL_USERS_UPDATE",response.data)
      })
      .catch(error => {
        console.log("URL_USERS_CREATE ERROR",error)
      })      
      this.refresh() 
    },
    async deleteUser(user){
      console.log(1111111111,user)
      await axios
      .post(URL_USERS_DELETE,user)
      .then(response => {
        console.log("URL_USERS_DELETE",response.data)
      })
      .catch(error => {
        console.log("URL_USERS_DELETE ERROR",error)
      })      
      this.refresh() 
    },
  },
  computed:{
    getjson(){
      return{ prefix:this.prefix,region:this.region}
    }
  },
  mounted: async function () {
    let loginCheck = await axios.post(URL_USERS_READ)
    if(! loginCheck) {
      this.$router.push('Home')
    }
    this.refresh();
  }
}

</script>

