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

var mainQueue = createMainWorker( firebase );

process.on( 'SIGINT', function() {
	console.log( 'Starting all queues shutdown' );
	var queues = [ mainQueue.shutdown() ];
	for ( var id in devices ) {
		queues.push( devices[ id ].disconnect() );
	}
	Promise.all( queues )
	.then( function() {
		console.log( 'Finished queue shutdown' );
		process.exit( 0 );
	} );
} );
