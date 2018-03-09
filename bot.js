//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License 
//

/* 
 * a Cisco Spark bot that lists upcoming events at Cisco DevNet
 * 
 */

var Botkit = require('botkit');

if (!process.env.SPARK_TOKEN) {
    console.log("Could not start as this bot requires a Cisco Spark API access token.");
    console.log("Please add env variable SPARK_TOKEN on the command line");
    console.log("Example: ");
    console.log("> SPARK_TOKEN=XXXXXXXXXXXX PUBLIC_URL=YYYYYYYYYYYYY node helloworld.js");
    process.exit(1);
}

if (!process.env.PUBLIC_URL) {
    console.log("Could not start as this bot must expose a public endpoint.");
    console.log("Please add env variable PUBLIC_URL on the command line");
    console.log("Example: ");
    console.log("> SPARK_TOKEN=XXXXXXXXXXXX PUBLIC_URL=YYYYYYYYYYYYY node helloworld.js");
    process.exit(1);
}

var controller = Botkit.sparkbot({
    log: true,
    public_address: process.env.PUBLIC_URL,
    ciscospark_access_token: process.env.SPARK_TOKEN,
    secret: process.env.SECRET, // this is a RECOMMENDED security setting that checks of incoming payloads originate from Cisco Spark
    webhook_name: process.env.WEBHOOK_NAME || 'built with BotKit (development)'
});

var bot = controller.spawn({
});

controller.setupWebserver(process.env.PORT || 3000, function(err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function() {
        console.log("SPARK: Webhooks set up!");
    });
});


// event API wrapper that preformats messages to send back to Slack
var Networks = require("./networks.js");
var Devices = require("./devices.js")
var Claim = require("./claim.js")
var Remove = require("./remove.js")
var Traffic = require("./traffic.js")
var License = require("./license.js")

//
// Command: Networks
//
controller.hears(['networks', 'net'], 'direct_message,direct_mention', function (bot, message) {

    bot.reply(message, "Let's check what's on your Meraki ORG...");

    Networks.fetchNetworks(function (err, networks, text) {
        if (err) {
            bot.reply(message, "Sorry, could not contact Meraki ORG...");
            return;
        }

        if (networks.length == 0) {
            bot.reply(message, text + "\n\nType next for more...");
            return;
        }

        // Store networks
        var toPersist = { "id": message.user, "networks": networks };
        controller.storage.users.save(toPersist, function (err, id) {
            bot.reply(message, text + "\n\nType about [number] for more details");
        });
    });
});


//
// Command: Devices
//
controller.hears(['devices', 'dev'], 'direct_message,direct_mention', function (bot, message) {

    bot.reply(message, "Let's check what's on your Meraki Network...");

    Devices.fetchDevices(function (err, devices, text) {
        if (err) {
            bot.reply(message, "Sorry, could not contact Meraki ORG...");
            return;
        }

        // Store events
        var toPersist = { "id": message.user, "devices": devices };
        controller.storage.users.save(toPersist, function (err, id) {
            if (err != null) {
                bot.reply(message, text);
                return;
            }

            bot.reply(message, text + "\n\n_Type about [number] for more details_");
        });
    });

});

//
// Command: Traffic
//
controller.hears(['traffic'], 'direct_message,direct_mention', function (bot, message) {

    bot.reply(message, "Let's check what's up on your Meraki Network...");

    Traffic.fetchTraffic(function (err, traffic, text) {
        if (err) {
            bot.reply(message, "Sorry, could not contact Meraki ORG...");
            return;
        }

        // Store events
        var toPersist = { "id": message.user, "traffic": traffic };
        controller.storage.users.save(toPersist, function (err, id) {
            if (err != null) {
                bot.reply(message, text);
                return;
            }

            bot.reply(message, text + "\n\n_Type about [number] for more details_");
        });
    });

});

//
// Command: License
//
controller.hears(['license'], 'direct_message,direct_mention', function (bot, message) {

    bot.reply(message, "Let's check license state on your Meraki Network...");

    License.fetchLicense(function (err, license, text) {
        if (err) {
            bot.reply(message, "Sorry, could not contact Meraki ORG...");
            return;
        }

        // Store events
        var toPersist = { "id": message.user, "license": license };
        controller.storage.users.save(toPersist, function (err, id) {
            if (err != null) {
                bot.reply(message, text);
                return;
            }

            bot.reply(message, text + "\n\n_Type about [number] for more details_");
        });
    });

});

//
// Command: Claim
//
controller.hears(['claim'], 'direct_message,direct_mention', function (bot, message) {

    bot.reply(message, "Let's claim a SN on your Meraki ORG...");

    Claim.fetchClaim(function (err, claim, text) {
        if (err) {
            bot.reply(message, "Sorry, could not contact Meraki ORG...");
            return;
        }

        if (claim.length == 0) {
            bot.reply(message, text + "\n\nType next for more...");
            return;
        }

        var claim_error = user_data['errors'];
        bot.reply(message, errors);

        // Store networks
        var toPersist = { "id": message.user, "claimed": claim };
        controller.storage.users.save(toPersist, function (err, id) {
            bot.reply(message, text + "\n\nType about [number] for more details");
        });
    });
});

//
// Command: Remove
//
controller.hears(['remove'], 'direct_message,direct_mention', function (bot, message) {

    bot.reply(message, "Let's remove a SN on your Meraki ORG...");

    Remove.fetchRemove(function (err, remove, text) {
        if (err) {
            bot.reply(message, "Sorry, could not contact Meraki ORG...");
            return;
        }

        if (remove.length == 0) {
            bot.reply(message, text + "\n\nType next for more...");
            return;
        }

        // Store networks
        var toPersist = { "id": message.user, "unclaimed": remove };
        controller.storage.users.save(toPersist, function (err, id) {
            bot.reply(message, text + "\n\nType about [number] for more details");
        });
    });
});


//
// Command: Assistant
//
controller.hears(['assistant'], 'direct_message,direct_mention,mention', function (bot, message) {

    var keyword = message.match[1];
    if (!keyword) {
        bot.startConversation(message, function (err, convo) {
            convo.ask("Available Options: \n\n 1. Wireless SSID \n\n 2. Wireless Auth \n\n Which option are you trying to setup? (type a number or cancel)", [
                {
                    pattern: "cancel",
                    callback: function (response, convo) {
                        convo.next();
                    }
                },
                {
                    pattern: "([0-9]+)\s*",
                    callback: function (response, convo) {
                        var value = parseInt(response.match[1]);
                        convo.setVar("number", value);
                        convo.next();
                    }
                },
                // {
                //     pattern: "([a-zA-Z]+)\s*",
                //     callback: function (response, convo) {
                //         var value = response.match[1];
                //         convo.setVar("keyword", value);
                //         convo.next();
                //     }
                // },
                {
                    default: true,
                    callback: function (response, convo) {
                        // just repeat the question
                        convo.say("Sorry I did not understand, either specify a number or cancel");
                        convo.repeat();
                        convo.next();
                    }
                }
            ], { 'key': 'about' });

            convo.on('end', function (convo) {
                if (convo.status == 'completed') {

                    //var about = convo.extractResponse('about');
                    var number = convo.vars["number"];
                    if (number) {
                        displayConfig(bot, controller, message, number);
                        return;
                    }

                    // not cancel, nor a number
                    bot.reply(message, 'cancelled!');
                }
                else {
                    // this happens if the conversation was ended prematurely for some reason
                    bot.reply(message, "sorry, could not process your request, try again..");
                }
            });
        });
        return;
    }

    // Check arg for number
    var number = parseInt(keyword);
    if (number) {
        displayConfig(bot, controller, message, number);
        return;
    }
    
    // Not a number
    bot.reply(message, "sorry, not implemented yet!");
});


//
// Command: help
//
controller.hears(["help", "who are you"], 'direct_message,direct_mention', function (bot, message) {
    var text = "I am a bot and I can help you with your Meraki Networks\n\nCommands I do understand at this moment: networks, devices, claim, remove, traffic";
    bot.reply(message, text);
});


//
// Command: fallback
//
controller.hears(["(.*)"], 'direct_message,direct_mention', function (bot, message) {
    var text = "Sorry I did not understand, please type: help, now or next";
    bot.reply(message, text);
});


//
// Utilities
//

function displayConfig(bot, controller, message, number) {
    controller.storage.users.get(message.user, function (err, user_data) {
        if (!user_data) {
            bot.reply(message, "Please look for current config settings, before inquiring about config details");
            return;
        }

        var events = user_data["events"];
        if (number <= 0) number = 1;
        if (number > events.length) number = events.length;
        if (number == 0) {
            bot.reply(message, "sorry, seems we don't have any config to display details for");
            return;
        }

        var event = events[number - 1];
        bot.reply(message, Events.generateEventsDetails(event));
    });
}