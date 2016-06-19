var config = require( './config.js' );
var mqtt = require( 'mqtt' );
var Queue = require( 'firebase-queue' );
var client = mqtt.connect( config.broker );
var firebase = require( 'firebase' );
var devices = {};

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

				if ( ! devices[ payload.id ] ) {
					devices[ payload.id ] = { state: null };
				}

				{
					devices[ payload.id ].state = payload.state;
					firebase.database().ref( 'things/' ).child( config.id ).child( payload.id ).set( payload.state );
				}
	}
} );



//Code for general worker
var queue = new Queue( { tasksRef: firebase.database().ref( 'dispatch' ), specsRef: firebase.database().ref( 'spec/queue' ) }, function( data, progress, resolve, reject ) {
	if ( ! data.id || ! data.action ) {
		//Malformed request
		//Resolve without doing anything - maybe log ?
		return resolve();
	}

	firebase.database().ref( 'things/' + data.id ).once( 'value' ).then( function( snapshot ) {
		//Is the device online, does it exist?
		if ( ! snapshot.exists() ) {
			return reject( 'id does not exist' );
		} else {
			var gateway = data.id.split( '/' )[ 0 ];
			resolve( Object.assign( data, {
				_new_state: gateway + '_start'
			} ) );
		}
	} );
} );

function createGatewayWorker( gatewayKey, processFunction ) {
	var specRef = firebase.database().ref( 'spec/queue' ).child( gatewayKey );
	specRef.once( 'value' ).then( function( snapshot ) {
		if ( ! snapshot.val() ) {
			specRef.set( {
				'start_state': gatewayKey + '_start',
				'in_progress_state': 'in_progress',
				'finished_state': null,
				'error_state': 'error',
				'timeout': 300000, // 5 minutes
				'retries': 0 // don't retry
			} );
		}
	} );
	var queue = new Queue(
		{ tasksRef: firebase.database().ref( 'dispatch' ), specsRef: firebase.database().ref( 'spec/queue' ) },
		{ 'specId': gatewayKey },
		processFunction
	);
}

createGatewayWorker( 'smart-pi', function( data, progress, resolve, reject ) {
	var id = data.id.replace( 'smart-pi/', '' );
	console.log( id, data );
	client.publish( 'iot/things/' + id, JSON.stringify( data ) );
	resolve();
} );
