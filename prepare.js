var async       = require( 'async' );
var redis       = require( 'redis' );
var MongoClient = require( 'mongodb' ).MongoClient;
var redisClient = redis.createClient();

var userDB;

MongoClient.connect('mongodb://localhost:27017/oneapm', function(err, db) {
  console.log("Connected correctly to server");
  userDB = db;
  // Insert the data.
  async.each( users, function( user, done ) {
    userDB.collection( 'users' ).insert( user, function( err, result ) {
      done( err );
    } );
  }, function( err ) {
    if( err ) {
      console.error( err );
      process.exit( 1 );
    }
    // Generate friendship
    var friends = [];
    for( var i=100; i< 150; ++i ) {
      friends.push(i);
    }

    userDB.collection( 'users' ).update( { uid: 10 }, { $set: { friends: friends } }, function( err, result ) {
      if( err ) {
        console.error( err );
        process.exit( 1 );
      }

      // Create user's token
      redisClient.SET( 'token:10', 'generated-mock-token', function( err ) {
        if( err ) {
          console.error( err );
          process.exit( 1 );
        }

        console.log( 'ALL DONE!' );
        process.exit( 0 );
      } );
    } );
  } );
} );


var users = []
for( var i=0; i<1000; ++i ) {
  users.push( {
    uid: i,
    name: 'user_' + i
  } );
}
