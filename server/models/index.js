var db = require('../db');
var Promise = require('bluebird');

db.connection.connect((err) => {
  if (err) {
    throw err;
  } else {
    console.log('Connected');
  }
});

module.exports = {
  messages: {
    get: function (cb) {
      db.connection.query('SELECT messages.id, users.user_name, messages.text, rooms.room_name FROM messages, users, rooms WHERE messages.user = users.id AND messages.room = rooms.id', (err, results) => {
        if (err) {
          throw err;
        } else {
          cb(results);
        }
      });
    }, // a function which produces all the messages
    post: function (message, cb) {
      //username exists? yes -> use that id, no -> add to users table and use new id
      return new Promise((resolve, reject) => {
        db.connection.query(`SELECT * FROM users where users.user_name = '${message.username}'`, (err, results) => {
          if (err) {
            reject(err);
          } else {
            if (!results.length) {
              db.connection.query(`INSERT INTO users (user_name) VALUES (?)`, [message.username], (err, results) => {
                message.userId = results.insertId;
                resolve(message);
              });
            } else {
              message.userId = results[0].id;
              resolve(message);
            }
          }
        });
      })
        .then(
          (message) => {
            return new Promise((resolve, reject) => {
              db.connection.query(`SELECT * FROM rooms where rooms.room_name = '${message.roomname}'`, (err, results) => {
                if (err) {
                  reject(err);
                } else {
                  if (!results.length) {
                    db.connection.query(`INSERT INTO rooms (room_name) VALUES  (?)`, [message.roomname], (err, results) => {
                      message.roomId = results.insertId;
                      resolve(message);
                    });
                  } else {
                    message.roomId = results[0].id;
                    resolve(message);
                  }
                }
              });
            });
          }
        )
        .then(
          (message) => {
            db.connection.query(`INSERT INTO messages (messages.text, messages.user, messages.room) VALUES (?, ?, ?)`, [message.text, message.userId, message.roomId], (err, results) => {
              if (err) {
                throw err;
              } else {
                console.log('successful post');
              }
            });
          }
        );
      //roomname exists? yes -> use that id, no -> add to rooms table and use new id
    } // a function which can be used to insert a message into the database
  },

  users: {
    // Ditto as above.
    get: function (cb) {
      db.connection.query('SELECT user_name FROM users', (err, results) => {
        cb(err, results);
      });
    },
    post: function (user, cb) {
      db.connection.query(`SELECT * FROM users where users.user_name = '${user.username}'`, (err, results) => {
        if (err) {
          throw err;
        } else {
          if (!results.length) {
            db.connection.query(`INSERT INTO users (user_name) VALUES ('${user.username}')`, (err, results) => {
              if (err) {
                throw err;
              } else {
                cb();
                console.log('successful post');
              }
            });
          }
        }
      });
    }
  }
};

