var fs = require("fs");
var http = require("http");
var url = require("url");

http.createServer(function (req, res) {
var q = url.parse(req.url, true);
console.log(q)
if (q.pathname === '/') {
  //Home page code
  console.log('redirect home');
  res.writeHead(301, { "Location": "http://google.com/" });
  return res.end();
} else {
    //404 page code
   console.log('redirect else');
   res.writeHead(301, { "Location": "http://google.com/" });
   return res.end();
}
res.end();
}).listen(3000);
