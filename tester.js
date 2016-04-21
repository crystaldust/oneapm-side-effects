var http  = require( 'http' );
var async = require( 'async' );


function test( callback ) {
  var req = http.request( {
    host: 'localhost',
    path: '/test',
    port: 3000
  }, function( res ) {
    var result = '';
    res.on( 'data', function( chunk ) {
      result += chunk;
    } );
    res.on( 'end', function() {
      //console.log( 'finished', result );
      callback();
    } );
  } )
  req.on( 'error', function( err ) {
    callback( err );
  } );
  req.end();
}

var start = Date.now();
var n = 0;
var TIMES = 1000;
for( var i=0; i<TIMES; ++i ) {
  test( function( err ) {
//    console.log( err );
    n++;
    if( n >= TIMES ) {
      var duration = Date.now() - start;
      console.log( duration, duration/TIMES );
      process.exit(0);
    }
  } );
}
