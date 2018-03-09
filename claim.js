
var debug = require("debug")("samples");
var fine = require("debug")("samples:fine");



module.exports.fetchClaim = function (cb) {

    var request = require("request");

    var options = { method: 'POST',
      url: 'https://n57.meraki.com/api/v0/networks/N_595038100766367032/devices/claim',
      headers: 
       { 'Postman-Token': 'f12c1a69-cdec-408b-a28b-e6323eea8227',
         'Cache-Control': 'no-cache',
         'X-Cisco-Meraki-API-Key': '6eaf1088e0eb283b13fb142b3f2be843dfe2b0b7',
         'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' },
      formData: { serial: 'Q2FD-TUKH-CR8V' } };
    
      request(options, function (error, response, body) {
        if (error) {
          debug("could not retreive list of devices, error: " + error);
          cb(new Error("Could not retreive current devices, sorry [Meraki API not responding]"), null, null);
          return;
      }

//        if ((response < 200) || (response > 299)) {
//          console.log("could not retreive list of devices, response: " + response);
//          sparkCallback(new Error("Could not retreive current devices, sorry [bad anwser from Meraki API]"), null, null);
//          return;
//      }

        if (response == 200) {
          console.log("Device Claimed successfully: " + response);
          sparkCallback(new Error("200: Could not retreive current devices, sorry [bad anwser from Meraki API]"), null, null);
          return;
        }
        if (response == 403) {
          console.log("403: could not retreive list of devices, response: " + response);
          sparkCallback(new Error("403: Could not retreive current devices, sorry [bad anwser from Meraki API]"), null, null);
          return;
      }


      console.log(body);
      
    });

}