import { createGatewayWorker } from '../firebaseConnection.js' ;
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import animation from '../rgb/animations';

function NodemcuMinion( id ) {
	this.id = id;
	this.type = 'nodemcu-minion';
	this.mode = 'rgb';
	this.firebase = null;
	this.firebaseRoot = null;
	this.queue = null;
	this.state = {};
	this.disconnectTimeout = null;
	this.connected = false;
}

NodemcuMinion.prototype.heartbeat = function( heartbeat ) {
	if ( get( heartbeat, 'config.mode', this.mode ) !== this.mode ) {
		this.mode = get( heartbeat, 'config.mode', this.mode );
		this.firebase.child( 'mode' ).set( this.mode );
	}

	if ( ! isEqual( heartbeat.state, this.state ) ) {
		this.firebase.child( 'state' ).set( heartbeat.state );
		this.state = heartbeat.state;
	}
	if ( ! this.connected ) {
		this.connectQueue();
		this.firebase.child( 'connected' ).set( this.connected );
	}
	clearTimeout( this.disconnectTimeout );
	this.disconnectTimeout = setTimeout( this.disconnect.bind( this ), 5000 );
};

NodemcuMinion.prototype.disconnect = function() {
	this.connected = false;
	return Promise.all( [
		this.firebase.child( 'connected' ).set( this.connected ),
		this.queue.shutdown()
	] );
};

NodemcuMinion.prototype.connectQueue = function() {
	this.connected = true;
	this.queue = createGatewayWorker( this.firebaseRoot, this.id, this.processQueueTask.bind( this ) );
};

NodemcuMinion.prototype.connect = function( firebase, mqtt ) {
	this.firebaseRoot = firebase;
	this.firebase = firebase.database().ref( 'things/' + this.id );
	this.firebase.child( 'type' ).set( this.type );
	this.client = mqtt;
	this.connectQueue();
};

NodemcuMinion.prototype.forwardToDevice = function( data ) {
	var topic = 'iot/things/' + data.id.split( '/' )[ 1 ]; //Remove gateway reference and substitute with iot/things
	console.log( JSON.stringify( data ) );
	this.client.publish( topic, JSON.stringify( data ) );
};

NodemcuMinion.prototype.off = function() {
	var topic = 'iot/things/' + this.id.split( '/' )[ 1 ]; //Remove gateway reference and substitute with iot/things
	this.client.publish( topic, JSON.stringify( {
		action: 'set',
		state: {
			red: 0,
			green: 0,
			blue: 0,
			power: 0
		}
	} ) );
};

NodemcuMinion.prototype.processQueueTask = function( data, progress, resolve, reject ) {
	//to replace later
	if ( data.action === 'set' ) {
		this.forwardToDevice( data );
		resolve();
	} else if ( data.action === 'off' ) {
		this.off();
		resolve();
	} else if ( data.action === 'gradient' ) {
		animation( this.state, data.state, data.duration, newColor => this.forwardToDevice( { id: this.id, action: 'set', state: newColor } ) ).then( resolve );
	} else if ( data.action === 'wait' ) {
		setTimeout( resolve, data.duration );
	} else {
		reject( 'Unknown command or what' );
	}
};

module.exports = NodemcuMinion;
