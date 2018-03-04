
var debug = require("debug")("samples");
var fine = require("debug")("samples:fine");

var request = require("request");


module.exports.fetchClaim = function (cb) {

    var http = require("https");

    var options = {
      "method": "POST",
      "hostname": [
        "n57",
        "meraki",
        "com"
      ],
      "path": [
        "api",
        "v0",
        "networks",
        "N_595038100766367032",
        "devices",
        "claim"
      ],
      "headers": {
        "content-type": "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
        "X-Cisco-Meraki-API-Key": "6eaf1088e0eb283b13fb142b3f2be843dfe2b0b7",
        "Cache-Control": "no-cache",
        "Postman-Token": "dec079a8-9134-4da1-99b1-2eca7edb2550"
      }
    };
    
    var req = http.request(options, function (res) {
      var chunks = [];
    
      res.on("data", function (chunk) {
        chunks.push(chunk);
      });
    
      res.on("end", function () {
        var body = Buffer.concat(chunks);
        console.log(body.toString());
      });
    });
    
    req.write("------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"serial\"\r\n\r\nQ2FD-TUKH-CR8V\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--");
    req.end();

}