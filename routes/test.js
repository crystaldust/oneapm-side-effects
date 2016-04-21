var express = require('express');
var router  = express.Router();

var async       = require( 'async' );
var redis       = require( 'redis' );
var MongoClient = require( 'mongodb' ).MongoClient;
var redisClient = redis.createClient();

var userDB;

MongoClient.connect('mongodb://localhost:27017/oneapm', function(err, db) {
  console.log("Connected correctly to server");
  userDB = db;
//  db.close();
} );


/**
 * A simulation on a common web API, which includes:
 * a redis query to check user's token,
 * a mongodb query to fetch user's profile.
 * a mongodb query to fetch user's friends list.
 */
router.get('/', function(req, res, next) {
  /*
  var reqBody = req.body;
  */
  var reqBody = { token: 'generated-mock-token', user_id: 10 };
  var token   = reqBody.token;
  var uid     = reqBody.user_id;

  if( !token || !uid ) {
    return res.sendStatus( 500 );
  }

  // Check user's token
  redisClient.GET( 'token:' + uid, function( err, token ) {
    if( err || !token ) {
      return res.sendStatus( 500 );
    }

    if( token !== reqBody.token ) {
      return res.sendStatus( 403 );
    }

    // Get user's profile and friend list.
    userDB.collection( 'users' ).findOne( { uid: uid }, function( err, user ) {
      if( err || !user) {
        return res.sendStatus( 501 );
      }

      // Get user's friend list
      var friendList = [];
      async.each( user.friends, function( friendId, done ) {
        userDB.collection( 'users' ).findOne( { uid: friendId }, function( err, friend ) {
          if( err ) {
            return done(err);
          }
          friendList.push( { uid: friend.uid, name: friend.name } );
          return done( null );
        } );
      }, function( err ) {
        if( err ) {
          return res.sendStatus( 502 );
        }
        // Put all the data back.
        return res.send( {
          uid: user.uid,
          name: user.name,
          friends: friendList
        } );
      } );
      
    } );

  } );

});

module.exports = router;
