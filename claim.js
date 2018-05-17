
var debug = require("debug")("samples");
var fine = require("debug")("samples:fine");



module.exports.fetchClaim = function (cb) {

    var request = require("request");

    var options = { method: 'POST',
      url: 'https://n57.meraki.com/api/v0/networks/N_595038100766367032/devices/claim',
      headers: 
       { 'Postman-Token': 'f12c1a69-cdec-408b-a28b-e6323eea8227',
         'Cache-Control': 'no-cache',
         'X-Cisco-Meraki-API-Key': '84566be5bc189eb8dd020fefb6dbd0c68fcd7616',
         'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' },
      formData: { serial: 'Q2FD-TUKH-CR8V' } };
    
      request(options, function (err, response, body) {
     if (err) {
            debug("could not retreive list of devices, error: " + err);
            console.log("Error indefinido");
            cb(new Error("Could not retreive current devices, sorry [Meraki API not responding]"), null, null);
            return;
        }

        if ((response < 200) || (response > 299)) {
            console.log("Error <200 o >299: " + response);
            sparkCallback(new Error("Could not retreive current devices, sorry [bad anwser from Meraki API]"), null, null);
            return;
        }

      var claim = JSON.parse(body);
//      debug("fetched " + claim.length + " claimed");
      fine(JSON.stringify(claim));

      var str = body;
      var already_claimed = str.search("already claimed");
      var msg;
      if (already_claimed != -1) {
          msg = "Sorry, Device was **already claimed** at API Test - Cliente1";
      }

      if (str == -1) {
        msg = "Device was **successfully** claimed at API Test - Cliente1";        
      }

      cb(null, claim, msg);
      console.log(body);
      
    });

}
