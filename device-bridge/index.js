var config = require( './config.js' );
var mqtt = require( 'mqtt' );
var client = mqtt.connect( config.broker );
var firebase = require( 'firebase' );

firebase.initializeApp( {
	serviceAccount: './config-firebaseKeys.json',
	databaseURL: config.firebase,
} );

client.on( 'connect', function() {
	client.subscribe( 'iot/heartbeat' );
} );

client.on( 'message', function( topic, message ) {
	// message is Buffer
	if ( topic === 'iot/heartbeat' ) {
		var payload = JSON.parse( message.toString() );
		firebase.database().ref( 'things/' ).child( config.id ).child( payload.id ).set( payload.state );
	}
} );
