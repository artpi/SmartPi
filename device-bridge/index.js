var config = require( './config.js' );
var mqtt = require( 'mqtt' );
var client = mqtt.connect( config.broker );
var firebase = require( 'firebase' );
var devices = {};
var NodemcuMinion = require( './devices/nodemcu-minion.js' );
var createMainWorker = require( './firebaseConnection.js' ).createMainWorker;

firebase.initializeApp( {
	serviceAccount: './config-firebaseKeys.json',
	databaseURL: config.firebase,
} );

client.on( 'connect', function() {
	client.subscribe( 'iot/heartbeat' );
} );

client.on( 'message', function( topic, message ) {
	if ( topic === 'iot/heartbeat' ) {
		var payload = JSON.parse( message.toString() );

		if ( ! devices[ payload.id ] ) {
			devices[ payload.id ] = new NodemcuMinion( config.id + '/' + payload.id );
			devices[ payload.id ].connect( firebase, client );
		}
		devices[ payload.id ].heartbeat( payload );
	}
} );

createMainWorker( firebase );
