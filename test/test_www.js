var path = require("path")
var request = require("supertest")
var app = require(path.join(__dirname,"..","app.js"))
var agent = request.agent("http://localhost:3000")
var request = require("request")

describe.only('Web Server Test', function(){
    it("Login Authentication as admin", function(done){
        agent
        .post('/login')
        .send({
            username: 'admin',
            password: 'admin'
        })
        .expect(302)
        .end(function(err, res) {
            if (err) {
                throw err;
            }
            done()
        })
    })
    it("Logged-in as admin", function(done){
        agent
        //.get('/')
        //.expect(302)
        .get('/')
        .expect(200)
        .end(function(err, res) {
            if (err) {
                throw err;
            }
            done()
        })
    })
    it.only("Cookie Test", function(done){
        var j = request.jar()
        url = 'http://127.0.0.1:3000/'
        request({url: url, jar: j}, function () {
            console.log("retreiving cookie")
          var cookie_string = j.getCookieString(url); // "key1=value1; key2=value2; ..."
          var cookies = j.getCookies(url);
          cookies.forEach((cookie) => {
              console.log(cookie.key,cookie.value)              
          });
          done()
          // [{key: 'key1', value: 'value1', domain: "www.google.com", ...}, ...]
        })
    })
})