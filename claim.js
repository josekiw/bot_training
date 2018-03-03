
var debug = require("debug")("samples");
var fine = require("debug")("samples:fine");

var request = require("request");


module.exports.fetchClaim = function (cb) {

    // POST - Claim new device
    var options = {
        method: 'GET',
        url: "https://dashboard.meraki.com/api/v0/networks/N_595038100766367032/devices",
        headers: {
            "X-Cisco-Meraki-API-Key": "6eaf1088e0eb283b13fb142b3f2be843dfe2b0b7",
            "content-type": "application/json"
        },
        body: {
            "serial": "Q2FD-TUKH-CR8V"
        }
    };

    request(options, function (error, response, body) {
        if (error) {
            debug("could not retreive list of devices, error: " + error);
            cb(new Error("Could not retreive current devices, sorry [MEraki API not responding]"), null, null);
            return;
        }

        if ((response < 200) || (response > 299)) {
            console.log("could not retreive list of devices, response: " + response);
            sparkCallback(new Error("Could not retreive current devices, sorry [bad anwser from Meraki API]"), null, null);
            return;
        }

        var events = JSON.parse(body);
        debug("fetched " + events.length + " events");
        fine(JSON.stringify(events));

        if (events.length == 0) {
            cb(null, events, "Sorry, no claimed devices on your Meraki Network");
            return;
        }

        var nb = events.length;
        var msg = "**" + nb + " Devices claimed on your Meraki Network:**";
        if (nb == 1) {
            msg = "**only one device is claimed now:**";
        }
        for (var i = 0; i < nb; i++) {
            var current = events[i];
            //msg += "\n:small_blue_diamond: "
            msg += "\n" + (i+1) + ". ";
            msg += current.model + " - " + current.mac + " - " + current.serial;
        }

        cb(null, events, msg);
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