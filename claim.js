
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
      debug("fetched " + claim.length + " claimed");
      fine(JSON.stringify(claim));

      if (claim.length == "0") {
          cb(null, claim, "Sorry, Device is already claimed and in API Test - Cliente1");
          return;
      }

      var nb = claim.length;
      var resp = claim.response;
      var msg = "**" + nb + " devices on your Meraki ORG:**";
      if (nb == "1") {
          msg = "Sorry, Device is **already claimed** and in API Test - Cliente1";
      }
      for (var i = 0; i < nb; i++) {
          var current = claim[i];
          //msg += "\n:small_blue_diamond: "
          msg += "\n" + (i+1) + ". ";
          msg += current.errors;
      }

      cb(null, claim, resp + "\n\n" + body);
      console.log(body);
      
    });

}