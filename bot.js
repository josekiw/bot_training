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
var Events = require("./events.js");


//
// Command: now
//
controller.hears(['networks', 'net'], 'direct_message,direct_mention', function (bot, message) {

    bot.reply(message, "Let's check what's on your Meraki ORG...");

    Events.fetchNetworks(function (err, networks, text) {
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

    var limit = parseInt(message.match[1]);
    if (!limit) limit = 5;
    if (limit < 1) limit = 1;

    Events.fetchDevices(limit, function (err, devices, text) {
        if (err) {
            bot.reply(message, "Sorry, could not contact Meraki ORG...");
            return;
        }

        // Store events
        var toPersist = { "id": message.user, "events": devices };
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
// Command: claim
//
controller.hears(['claim'], 'direct_message,direct_mention', function (bot, message) {

    bot.reply(message, "Let's claim a new device to your Meraki Network...");

    var limit = parseInt(message.match[1]);
    if (!limit) limit = 5;
    if (limit < 1) limit = 1;

    Events.fetchClaim(limit, function (err, claim, text) {
        if (err) {
            bot.reply(message, "Sorry, could not contact Meraki ORG...");
            return;
        }

        // Store events
        var toPersist = { "id": message.user, "events": claim };
        controller.storage.users.save(toPersist, function (err, id) {
            if (err != null) {
                bot.reply(message, text);
                return;
            }

            bot.reply(message, text + "\n\n_Done_");
        });
    });

});


//
// Command: about
//
controller.hears(['show\s*(.*)', 'more\s*(.*)', 'about\s*(.*)'], 'direct_message,direct_mention,mention', function (bot, message) {

    var keyword = message.match[1];
    if (!keyword) {
        bot.startConversation(message, function (err, convo) {
            convo.ask("Which event are you inquiring about? (type a number or cancel)", [
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
                        displayEvent(bot, controller, message, number);
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
        displayEvent(bot, controller, message, number);
        return;
    }
    
    // Not a number
    bot.reply(message, "sorry, not implemented yet!");
});


//
// Command: help
//
controller.hears(["help", "who are you"], 'direct_message,direct_mention', function (bot, message) {
    var text = "I am a bot, can help you find current and upcoming events at [Cisco DevNet](https://developer.cisco.com)\n\nCommands I understand: now, next [max], about [index]";
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

function displayEvent(bot, controller, message, number) {
    controller.storage.users.get(message.user, function (err, user_data) {
        if (!user_data) {
            bot.reply(message, "Please look for current or upcoming events, before inquiring about event details");
            return;
        }

        var events = user_data["events"];
        if (number <= 0) number = 1;
        if (number > events.length) number = events.length;
        if (number == 0) {
            bot.reply(message, "sorry, seems we don't have any event to display details for");
            return;
        }

        var event = events[number - 1];
        bot.reply(message, Events.generateEventsDetails(event));
    });
}