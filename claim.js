
var debug = require("debug")("samples");
var fine = require("debug")("samples:fine");

var request = require("request");


module.exports.fetchClaim = function (cb) {

    // POST - Claim new device
    var form = new FormData();
        form.append("serial", "Q2FD-TUKH-CR8V");

    var options = {
        async: true,
        crossDomain: true,
        method: 'POST',
        url: "https://dashboard.meraki.com/api/v0/networks/N_595038100766367032/devices/claim",
        headers: {
            "X-Cisco-Meraki-API-Key": "6eaf1088e0eb283b13fb142b3f2be843dfe2b0b7",
            "content-type": "application/json"
        },
        processData: false,
        contentType: false,
        mimeType: "multipart/form-data",
        data: form
    };

    request(options, function (error, response, body) {
        if (error) {
            debug("could not retreive list of networks, error: " + error);
            cb(new Error("Could not retreive current networks, sorry [Meraki API not responding]"), null, null);
            return;
        }

        if ((response < 200) || (response > 299)) {
            console.log("could not retreive list of networks, response: " + response);
            sparkCallback(new Error("Could not retreive current networks, sorry [bad anwser from Meraki API]"), null, null);
            return;
        }

        var claim = JSON.parse(body);
        debug("fetched " + claim.length + " claimed");
        fine(JSON.stringify(claim));

        if (claim.length == 0) {
            cb(null, claim, "Sorry, no claimed devoces on your Meraki ORG");
            return;
        }

        var nb = claim.length;
        var msg = "**" + nb + " Claimed devices on your Meraki ORG:**";
        if (nb == 1) {
            msg = "**only one claimed device is active now:**";
        }
        for (var i = 0; i < nb; i++) {
            var current = claim[i];
            //msg += "\n:small_blue_diamond: "
            msg += "\n" + (i+1) + ". ";
            msg += current.name + " - " + current.type + " - " + current.timeZone;
        }

        cb(null, networks, msg);
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