
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

      if ((response < 200) || (response > 299)) {
        console.log("could not retreive list of devices, response: " + response);
        sparkCallback(new Error("Could not retreive current devices, sorry [bad anwser from Meraki API]"), null, null);
        return;
    }

    if (response == 403) {
      console.log("403: could not retreive list of devices, response: " + response);
      sparkCallback(new Error("403: Could not retreive current devices, sorry [bad anwser from Meraki API]"), null, null);
      return;
  }

var claim_result = JSON.parse(body);
      debug("fetched " + claim_result.length + " claimed");
      fine(JSON.stringify(claim_result));

      if (claim_result.length == 0) {
          cb(null, claim_result, "Sorry, no devices claimed on your Meraki ORG");
          return;
      }

      var nb = claim_result.length;
      var msg = "**" + nb + " devices on your Meraki ORG:**";
      if (nb == 1) {
          msg = "**only one device is active now:**";
      }
      for (var i = 0; i < nb; i++) {
          var current = claim_result[i];
          //msg += "\n:small_blue_diamond: "
          msg += "\n" + (i+1) + ". ";
          msg += current.model + " - " + current.serial + " - " + current.mac;
      }

      cb(null, claim_result, msg);
      console.log(body);
      
    });

}