module.exports = function(controller) {
    controller.hears(["add"], "direct_message,direct_mention", function(
      bot,
      message
    ) {
        var email = message.user;
        var CiscoSpark = require('node-ciscospark');
        var async = require('async');
        var spark = new CiscoSpark(process.env.SPARK_TOKEN);

        var spaceSeperator = " ";
        var comaSeperator = ",";
        var roomId = message.channel;

        var arrayOfStrings = message.text.split(spaceSeperator);
        if(arrayOfStrings.length == 2){
            var arrayOfEmails = arrayOfStrings[1].split(comaSeperator);
           
            if(arrayOfEmails.length > 0){
                arrayOfEmails.forEach(function(element) {
                    var param = {"teamId": roomId, "roomId" : roomId, "personEmail" : element};
                    spark.memberships.create(param, function(err, response) {
                       console.log(err);
                       console.log(response);
                     });
                });
                bot.reply(message, "People added");
            }
        }
    });
}