var express = require("express");
var bodyParser = require("body-parser");
var twilio = require("twilio");

var app = express();



app.use(bodyParser.urlencoded({ extended: true }));

app.set("port", 5100);

var oPlayers = {};

app.use(express.static('www'));

function Player() {
    this.first = (Math.ceil(Math.random() * 5));
    this.second = (Math.ceil(Math.random() * 5));
    this.G = 0, this.C = 0;
    this.fWelcoming = function (req, twiml) {
        twiml.message("Welcome to FlashCard Game. What is " + this.first + "+" + this.second + "?");
        this.fCurstate = this.fGuessing;
    }
    this.fGuessing = function (req, twiml) {
        if (req.body.Body == this.first + this.second) {
            this.first = (Math.ceil(Math.random() * 10));
            this.second = (Math.ceil(Math.random() * 10));
            this.C++;
            if (this.C != 10) {
                twiml.message("Correct. What is " + this.first + "+" + this.second + "?");
            }
            this.G = 0;
        }
        else if (req.body.Body != this.first + this.second) {
            this.G++;
            if (this.G == 1) {
                twiml.message("Wrong. Try again?");
            }
            else {
                this.first = (Math.ceil(Math.random() * 10));
                this.second = (Math.ceil(Math.random() * 10));
                twiml.message("Wrong. Whats " + this.first + "+" + this.second + "?");
                this.G = 0;
            }
        }
        else {
            twiml.message("please enter only valid numbers");
        }
        if (this.C == 10) {
            this.C = 0;
            this.first = (Math.ceil(Math.random() * 100));
            this.second = (Math.ceil(Math.random() * 100));
            twiml.message("Correct. What is " + this.first + "+" + this.second + "?");
        }
    }
    this.fCurstate = this.fWelcoming;
}


app.post('/sms', function (req, res) {
    var sFrom = req.body.From;
    if (!oPlayers.hasOwnProperty(sFrom)) {
        oPlayers[sFrom] = new Player();
    }
    var twiml = new twilio.twiml.MessagingResponse();
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    oPlayers[sFrom].fCurstate(req, twiml);
    var sMessage = twiml.toString();
    res.end(sMessage);
});

var server = app.listen(app.get("port"), function () {
    console.log("Javascript is rocking on port " + app.get("port"));
});