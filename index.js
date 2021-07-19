var SteamCommunity = require('steamcommunity');
var ReadLine = require('readline');
var fs = require('fs');
const config = require("./configs/config.json");
const secret = require("./configs/secret.json");

var request = require("request");
const { exit } = require('process');


var community = new SteamCommunity();
var cnt = 0;

var targetUser = (secret.user); // your username
var targetPass = (secret.pass); // your password
var apiKey = (secret.api); // Steam dev api ke. Google steam api key
var pDelay = (config.delay); // delay is in ms
var debug = (config.debug); // displays the count. 0 to turn off


var targetID = (config.id); // steam id you're trying to get

var targetString = "No match";

var rl = ReadLine.createInterface({
    "input": process.stdin,
    "output": process.stdout
});

doLogin(targetUser, targetPass);

function jetEngine() {
    try {
        request("http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=" + apiKey + "&vanityurl=" + targetID, function (error, response, body) {
            if (body.indexOf(targetString) > -1) {
                claim();
            }
            else {
                cnt++;
                if (debug > 0) {
                    console.log(cnt);
                }
            }
        });
    }
    catch { }
}




function doLogin(accountName, password, authCode, twoFactorCode, captcha) {
    community.login({
        "accountName": accountName,
        "password": password,
        "authCode": authCode,
        "twoFactorCode": twoFactorCode,
        "captcha": captcha
    }, function (err, sessionID, cookies, steamguard) {
        if (err) {
            if (err.message == 'SteamGuard') {
                rl.question("Steam Guard (EMAIL): ", function (code) {
                    doLogin(accountName, password, code);
                });

                return;
            }
            if (err.message == 'SteamGuardMobile') {

                rl.question("Steam Guard (MOBILE): ", function (code) {
                    doLogin(accountName, password, null, code);
                });

                return;
            }
            if (err.message == 'CAPTCHA') {
                console.log(err.captchaurl);
                rl.question("CAPTCHA: ", function (captchaInput) {
                    doLogin(accountName, password, null, captchaInput);
                });

                return;
            }

            console.log(err);
            process.exit();
            return;
        }

        console.log("Started turboing " + targetID + " to account " + accountName);


        setInterval(jetEngine, pDelay);

    });

}

function setClaim() {
    community.editProfile({
        "customURL": targetID,
    }, function (err) {
        if (err) {

        }
        else {
            console.log("Turboed!");
            process.exit();
            sys.exit(0);

        }
    });
}
var claim = (function () {
    var executed = false;
    return function () {
        if (!executed) {
            executed = true;
            setClaim();
        }
    };
})();
