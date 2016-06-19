var createGatewayWorker = require( '../firebaseConnection.js' ).createGatewayWorker;
var isEqual = require( 'lodash/isEqual' );

function NodemcuMinion( id ) {
	this.id = id;
	this.firebase = null;
	this.state = {};
	this.disconnectTimeout = null;
	this.connected = false;
}

NodemcuMinion.prototype.heartbeat = function( heartbeat ) {
	if ( ! isEqual( heartbeat.state, this.state ) ) {
		this.firebase.child( 'state' ).set( heartbeat.state );
	}
	if ( ! this.connected ) {
		this.connected = true;
		this.firebase.child( 'connected' ).set( this.connected );
	}
	clearTimeout( this.disconnectTimeout );
	this.disconnectTimeout = setTimeout( this.disconnect.bind( this ), 5000 );
};

NodemcuMinion.prototype.disconnect = function() {
	this.connected = false;
	this.firebase.child( 'connected' ).set( this.connected );
};

NodemcuMinion.prototype.connect = function( firebase, mqtt ) {
	this.firebase = firebase.database().ref( 'things/' + this.id );
	this.client = mqtt;
	createGatewayWorker( firebase, this.id, this.processQueueTask.bind( this ) );
};

NodemcuMinion.prototype.forwardToDevice = function( data ) {
	var topic = 'iot/things/' + data.id.split( '/' )[ 1 ]; //Remove gateway reference and substitute with iot/things
	this.client.publish( topic, JSON.stringify( data ) );
};

NodemcuMinion.prototype.processQueueTask = function( data, progress, resolve, reject ) {
	//to replace later
	if ( data.action === 'set' ) {
		this.forwardToDevice( data );
		resolve();
	} else {
		reject( 'Unknown command' );
	}
};

module.exports = NodemcuMinion;
