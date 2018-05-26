let loggedIn = false
let e_form = null
let e_user = null
let e_pass = null
let e_login = null
let e_modalAlert = null
let e_modalAlertText = null

export function setup(){
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
}

async function login(){
    let user = document.getElementById("user").value
    let pass = document.getElementById("pass").value
    console.log("username",user,"password",pass)
    if ( await verifyLogin(user,pass)){
        console.log("LOGIN SUCCESS!")
        e_user.classList.add("d-none")  //hidden
        e_pass.classList.add("d-none")  //hidden
        e_login.innerHTML = "Logout"
        e_user.value = ""
        e_pass.value = ""
        loggedIn = true
        return true
    }else{
        console.log("LOGIN FAILURE!")
        alert("Login Failure!")
        return false
    }
}

async function logout(){
    loggedIn = false
    e_user.classList.remove("d-none")  //hidden
    e_pass.classList.remove("d-none")  //hidden
    e_login.innerHTML = "Login"
    console.log("LOGOUT SUCCESS!")
}

async function verifyLogin(user,pass){
    if (user == "test" && pass == "test"){
        return true;
    }else{
        return false;
    }
}

function alert(text){
    e_modalAlertText.innerHTML = text
    $("#modalAlert").modal("show")
}