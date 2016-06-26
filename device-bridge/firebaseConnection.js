import Queue from 'firebase-queue';

function getQueueRef( firebase ) {
	return { tasksRef: firebase.database().ref( 'dispatch' ), specsRef: firebase.database().ref( 'spec/queue' ) };
}

export function createGatewayWorker( firebase, gatewayKey, processFunction ) {
	gatewayKey = gatewayKey.replace( '/', '_' );
	const specRef = firebase.database().ref( 'spec/queue/' ).child( gatewayKey );
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
	console.log( 'new q', gatewayKey );
	return new Queue(
		getQueueRef( firebase ),
		{ specId: gatewayKey, numWorkers: 1 },
		processFunction
	);
}

export function createMainWorker( firebase ) {
	return new Queue( getQueueRef( firebase ), function( data, progress, resolve, reject ) {
		if ( data.action && data.id ) {
			firebase.database().ref( 'things/' + data.id ).once( 'value' )
			.then( function( snapshot ) {
				//Is the device online, does it exist?
				if ( ! snapshot.exists() ) {
					return reject( 'device does not exist' );
				} else if ( snapshot.val().connected === false ) {
					console.log( 'Omitting old requests assigned while offline' );
					resolve();
				} else {
					resolve( Object.assign( data, {
						_new_state: data.id.replace( '/', '_' ) + '_start'
					} ) );
				}
			} );
		} else if ( data.triggerName ) {
			console.log( 'trigger', data );
			firebase.database().ref( 'triggers/' + data.triggerName + '/actions' ).once( 'value' )
			.then( function( actions ) {
				if ( ! actions.exists() ) {
					console.log( 'trigger does not exist' );
					return reject( 'trigger does not exist' );
				} else {
					const newActions = [];
					actions.forEach( function( action ) {
						var newAction = Object.assign( {}, action.val(), data.action );
						console.log( 'queuing new action', newAction );
						newActions.push( firebase.database().ref( 'dispatch' ).push( newAction ) );
					} );
					Promise.all( newActions ).then( resolve );
				}
			} );
		} else {
			console.log( 'unknown command', data );
			return resolve();
		}
	} );
}
