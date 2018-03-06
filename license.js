var debug = require("debug")("samples");
var fine = require("debug")("samples:fine");

var request = require("request");


module.exports.fetchLicense = function (cb) {

    // List License
    var options = {
        method: 'GET',
        url: "https://n57.meraki.com/api/v0/organizations/L_595038100766328722/licenseState",
        headers: {
            "X-Cisco-Meraki-API-Key": "6eaf1088e0eb283b13fb142b3f2be843dfe2b0b7",
            "content-type": "application/json"
        }
    };
    request(options, function (error, response, body) {

    if (error) {
        debug("could not retreive license, error: " + error);
        cb(new Error("Could not retreive current license, sorry [Meraki API not responding]"), null, null);
        return;
    }

    if ((response < 200) || (response > 299)) {
        console.log("could not retreive license, response: " + response);
        sparkCallback(new Error("Could not retreive current license, sorry [bad anwser from Meraki API]"), null, null);
        return;
    }

    var license = JSON.parse(body);
    debug("fetched " + license.length + " license");
    fine(JSON.stringify(license));

    var msg = "Analysing license...";
        msg += "\n" + (i+1) + ". ";
        msg += current.status + " until " + current.expirationDate;
    
    cb(null, license, msg);

    });
}

module.exports.generateEventsDetails = function (event) {

    // 1 line
    var md = "about **" + event.name + "**";

    // 2 line
    md += "\n\n_" + event.category + " in " + event.city + " (" + event.country + ")";
    if (event.beginDay != event.endDay) {
        md += " from " + event.beginDayInWeek + " " + event.beginDay + ", " + event.beginTime;
        md += " till " + event.endDayInWeek + " " + event.endDay + ", " + event.endTime;
    }
    else {
        md += " on " + event.beginDayInWeek + " " + event.beginDay + ", from " + event.beginTime + " till " + event.endTime;
    }

    // 3rd and after...
    md += "_\n\n" + event.description;

    // last line
    var more = "more on [ciscodevnet](" + event.url + ")";
    if (event.location_url) {
        more += ", [organizer](" + event.location_url + ")";
    }
    more += ", [json](https://devnet-events-api.herokuapp.com/api/v1/events/" + event.id + ")";
    md += "\n\n" + more;

    return md;
}