import mqtt from 'mqtt';
import firebase from 'firebase';
import os from 'os';

import NodemcuMinion from './devices/nodemcu-minion.js';
import { createMainWorker } from './firebaseConnection.js';

const configFolder = os.homedir() + '/.firenet-of-things';
const config = require( configFolder + '/' + 'config.json' );

if ( ! config ) {
	throw 'You need to provide config file. Default location is `~/.firenet-of-things/config.json`.';
}

if ( ! config.broker ) {
	throw 'You need to put MQTT url in `broker` key in  `config.json`';
}
const client = mqtt.connect( config.broker );
const devices = {};

if ( ! config.firebase ) {
	throw 'You need to put Firebase database url in `firebase` key in  `config.json`';
}

firebase.initializeApp( {
	serviceAccount: configFolder + '/' + 'firebase-credentials.json',
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
