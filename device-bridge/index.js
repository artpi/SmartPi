import config from './config.js';
import mqtt from 'mqtt';
const client = mqtt.connect( config.broker );
import firebase from 'firebase';
const devices = {};
import NodemcuMinion from './devices/nodemcu-minion.js';
import { createMainWorker } from './firebaseConnection.js';

firebase.initializeApp( {
	serviceAccount: './config-firebaseKeys.json',
	databaseURL: config.firebase,
} );
var mainQueue = createMainWorker( firebase );

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
