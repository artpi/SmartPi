import mqtt from 'mqtt';
import firebase from 'firebase';

import config from './config.js';
import NodemcuMinion from './devices/nodemcu-minion.js';
import { createMainWorker } from './firebaseConnection.js';

const client = mqtt.connect( config.broker );
const devices = {};

firebase.initializeApp( {
	serviceAccount: './config-firebaseKeys.json',
	databaseURL: config.firebase,
} );

const mainQueue = createMainWorker( firebase );

client.on( 'connect', function() {
	client.subscribe( 'iot/heartbeat' );
} );

client.on( 'message', function( topic, message ) {
	if ( topic === 'iot/heartbeat' ) {
		const payload = JSON.parse( message.toString() );

		if ( ! devices[ payload.id ] ) {
			devices[ payload.id ] = new NodemcuMinion( config.id + '/' + payload.id );
			devices[ payload.id ].connect( firebase, client );
		}
		devices[ payload.id ].heartbeat( payload );
	}
} );

process.on( 'SIGINT', function() {
	console.log( 'Starting all queues shutdown' );
	const queues = [ mainQueue.shutdown() ];
	for ( let id in devices ) {
		queues.push( devices[ id ].disconnect() );
	}
	Promise.all( queues )
	.then( function() {
		console.log( 'Finished queue shutdown' );
		process.exit( 0 );
	} );
} );
