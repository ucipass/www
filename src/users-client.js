import $ from 'jquery';
window.jQuery = $;
window.$ = $;
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import bootstrap from 'bootstrap';
import moment from 'moment';
import * as sio from './sioclient.js';
import * as navbar from './navbar.js';
import dt from 'datatables.net-bs4';
import 'datatables.net-dt/css/jquery.dataTables.css';
import 'datatables.net-bs4/css/dataTables.bootstrap4.css';
import 'select2';                       // globally assign select2 fn to $ element
import 'select2/dist/css/select2.css';  // optional if you have css loader
import JSONData from './jsondata.js'
import './users-client.js'

let username = "test"
var usersTable =null
window.onload = async function(){
	let alreadyLoggedIn = await sio.init(window.location.hostname+":"+window.location.port)
	navbar.setup(alreadyLoggedIn)
	// FILL THE SELECT FIELDS (DB,TABLES, LIMIT) THEN CREATE TABLE
	read_db();
	// EVENT HANDLING
	$('#button-modal-add-user').on('click', function (e) {
		e.preventDefault();
		$('#modal-add-user').modal('toggle');
		});
	$('#button-modal-add-user-clo').on('click', function (e) {
		e.preventDefault();
		$('#modal-add-user').modal('toggle');
		});
	$('#button-modal-add-user-add').on('click', function (e) {
		e.preventDefault();
		console.log("Add User!")
		if( $('#inp-add-pwd1').val() == $('#inp-add-pwd2').val() ) {
			add_user($('#inp-add-user').val(),$('#inp-add-pwd1').val());
			$('#modal-add-user').modal('toggle');
			}
		else {
			alert("passwords don't match");
			}
		});

	$('#button-modal-del-user').on('click', function (e) {
		e.preventDefault();
		$('#modal-del-user').modal('toggle');
		});
	$('#button-modal-del-user-clo').on('click', function (e) {
		e.preventDefault();
		$('#modal-del-user').modal('toggle');
		});
	$('#button-modal-del-user-del').on('click', function (e) {
		e.preventDefault();
		$('#modal-del-user').modal('toggle');
		console.log("Delete User!")
		del_user($('#select-user-del').val());
		});

	$('#button-modal-pwd-user').on('click', function (e) {
		e.preventDefault();
		$('#modal-pwd-user').modal('toggle');
		});
	$('#button-modal-pwd-user-clo').on('click', function (e) {
		e.preventDefault();
		$('#modal-pwd-user').modal('toggle');
		});
	$('#button-modal-pwd-user-pwd').on('click', function (e) {
		e.preventDefault();
		console.log("Change Password of User!")
		if( $('#inp-pwd-pwd1').val() == $('#inp-pwd-pwd2').val() ) {
			pwd_user(  $('#select-user-pwd').val()  ,  $('#inp-pwd-pwd1').val());
			$('#modal-pwd-user').modal('toggle');
			}
		else {
			alert("passwords don't match");
			}
		
		
		
		
		});

  }
var curModalRow = [];

function read_db(){
	var ioData = new JSONData(username,"users",{cmd:"user_list"});
	ioData.post(function(json){
		function getUserTable(){
			var s=['<user>'];
			for( var i=0; i<json.data.attributes.data.table.length; i++ ){ s.push(json.data.attributes.data.table[i][0]); }
			return s;
			console.log(s);
		}
		let tableExists = $.fn.dataTable.isDataTable( '#users-table' )
		if (tableExists){
			usersTable.destroy();
			$('#users-table').empty()
			usersTable = $('#users-table').DataTable({
				data:json.data.attributes.data.table,
				columns:json.data.attributes.data.columns.map((item)=>{
					return { title:item}
				})
			})
		}else{
			usersTable = $('#users-table').DataTable({
				data:json.data.attributes.data.table,
				columns:json.data.attributes.data.columns.map((item)=>{
					return { title:item}
				})
			})	
		}
			
		fnSelectFill($('#select-user-del'),getUserTable());
		fnSelectFill($('#select-user-pwd'),getUserTable());
	});
}


function fnSelectFill(element,data){
	while (element[0].firstChild) {	element[0].removeChild(element[0].firstChild);} // REMOVE ALL CHILD OF ELEMENT
	var selecttable = []
	for(var x=0; x< data.length ; x++){
		if (data[x].constructor === Array){selecttable.push({id: data[x][0], text: data[x][0]});}
		else {selecttable.push({id: data[x], text: data[x]});}
	}
	element.select2({	data: selecttable	});
}

function add_user(user,pwd){
	var ioData = new JSONData(username,"users",{cmd:"user_add",id:user,password:pwd});
	ioData.post(function(json){
		console.log(json);read_db();
	});
}

function del_user(user){
	var ioData = new JSONData(username,"users",{cmd:"user_del",id:user});
	ioData.post(function(json){
		console.log(json);
		read_db();});
}

function pwd_user(user,pwd){
	var ioData = new JSONData(username,"users",{cmd:"user_pwd",id:user,password:pwd});
	ioData.post(function(json){
		console.log(json)
	});
}
	
