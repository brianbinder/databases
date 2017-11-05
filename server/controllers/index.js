var models = require('../models');
var querystring = require('querystring');
var mysql = require('mysql');

module.exports = {
  messages: {
    get: function (req, res) {
      models.messages.get(function(dbMessages) {
        var dbMessages = JSON.parse(JSON.stringify(dbMessages));
        var messages = dbMessages.map(function(message) {
          var messageNew = {};
          messageNew.username = message.user_name;
          messageNew.roomname = message.room_name;
          messageNew.objectId = message.id;
          messageNew.text = message.text;
          return messageNew;
        });
        console.log('get messages: ', messages);
        var data = {};
        data.results = messages;
        res.send(data)
        res.end();
        //res.end();
        // sendResponse(res, 200, messages);
      });

    }, // a function which handles a get request for all messages
    post: function (req, res) { // a function which handles posting a message to the database
      console.log('message post body: ', req.body);
      var body = '';
      req.on('data', (chunk) => {
        body += chunk;
      })
      req.on('end', () => {
        var message = querystring.parse(body);
        models.messages.post(message);
        res.sendStatus(201);
      })

    }
  },

  users: {
    // Ditto as above
    get: function (req, res) {
      models.users.get( (err, results) => {
        if (err) {
          throw err;
        } else {
          var dbUsers = JSON.parse(JSON.stringify(results));
          var users = dbUsers.map((user) => {
            var userNew = {};
            userNew.username = user.user_name;
            return userNew;
          });
          var data = {};
          data.results = users;
          res.send(data);
          res.end();
        }
      });
    },
    post: function (req, res) {
      console.log(req.url);
      console.log('req.body: ', req.body);
      models.users.post(req.body);
        res.sendStatus(201);
    }
  }
};



