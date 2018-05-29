import * as sio from './sioclient.js';
import * as cookies from "js-cookie"

let loggedIn = false
let e_form = null
let e_user = null
let e_pass = null
let e_login = null
let e_logout = null
let e_modalAlert = null
let e_modalAlertText = null

export function setup(alreadyLoggedIn){
    loggedIn = alreadyLoggedIn
    cookies.set("afterLoginURL",document.location.href, {expires:1})
    e_form = document.getElementById("loginForm")
    e_user = document.getElementById("user")
    e_pass = document.getElementById("pass")   
    e_login = document.getElementById("login")
    e_logout = document.getElementById("logout")
    e_modalAlert = document.getElementById("modalAlert")
    e_modalAlertText = document.getElementById("modalAlertText")
    e_form.addEventListener("submit", function(event){
        event.preventDefault()
        if (!loggedIn){
            login()
        }else{
            logout()
        }
    });
    if (loggedIn) {
        showLogoutBar()
    }else {
        showLoginBar()
    }
}

function showLoginBar(){
    loggedIn = false
    e_login.classList.remove("d-none")  //not hidden
    e_logout.classList.add("d-none")  // hidden
    e_user.classList.remove("d-none")  //not hidden
    e_pass.classList.remove("d-none")  //not hidden
}
function showLogoutBar(){
    loggedIn = true  
    e_login.classList.add("d-none")  //not hidden
    e_logout.classList.remove("d-none")  // hidden
    e_user.classList.add("d-none")  //hidden
    e_pass.classList.add("d-none")  //hidden
    e_user.value = ""
    e_pass.value = ""
}

async function login(){
    let user = document.getElementById("user").value
    let pass = document.getElementById("pass").value
    //console.log("username",user,"password",pass)
    if ( await sio.login(user,pass) ){
        showLogoutBar()
        console.log("Logged in as user:",user)
        return true
    }else{
        showLoginBar()
        console.log("Login failed as user:",user)
        alert("Login Failure!")
        return false
    }
}

async function logout(){
    await sio.logout()
    location.reload()

}

function alert(text){
    e_modalAlertText.innerHTML = text
    $("#modalAlert").modal("show")
}