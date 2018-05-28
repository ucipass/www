import * as sio from './sioclient.js';
import * as cookies from "js-cookie"

let loggedIn = false
let e_form = null
let e_user = null
let e_pass = null
let e_login = null
let e_modalAlert = null
let e_modalAlertText = null

export function setup(alreadyLoggedIn){
    loggedIn = alreadyLoggedIn
    cookies.set("afterLoginURL",document.location.href, {expires:1})
    e_form = document.getElementById("loginForm")
    e_user = document.getElementById("user")
    e_pass = document.getElementById("pass")   
    e_login = document.getElementById("login")
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
        hideLoginBar()
    }else {
        showLoginBar()
    }
}

function showLoginBar(){
    loggedIn = false
    e_user.classList.remove("d-none")  //not hidden
    e_pass.classList.remove("d-none")  //not hidden
    e_login.innerHTML = "Login"
}
function hideLoginBar(){
    loggedIn = true  
    e_user.classList.add("d-none")  //hidden
    e_pass.classList.add("d-none")  //hidden
    e_login.innerHTML = "Logout"
    e_user.value = ""
    e_pass.value = ""
}

async function login(){
    let user = document.getElementById("user").value
    let pass = document.getElementById("pass").value
    //console.log("username",user,"password",pass)
    if ( await sio.login(user,pass) ){
        console.log("Logged in as user:",user)
        hideLoginBar()
        return true
    }else{
        console.log("Login failed as user:",user)
        showLoginBar()
        alert("Login Failure!")
        return false
    }
}

async function logout(){
    if ( await sio.logout() ){
        console.log("Logged out!")
        showLoginBar()
        return true
    }else{
        console.log("Logout Failure!")
        alert("Logout Failure!")
        showLoginBar()
        return false
    }
}

function alert(text){
    e_modalAlertText.innerHTML = text
    $("#modalAlert").modal("show")
}