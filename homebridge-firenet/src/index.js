import firebase from 'firebase';
import os from 'os';
import some from 'lodash/some';

const configFolder = os.homedir() + '/.firenet-of-things';
const config = require( configFolder + '/' + 'config.json' );
if ( ! config ) {
	throw 'You need to provide config file. Default location is `~/.firenet-of-things/config.json`.';
}

if ( ! config.firebase ) {
	throw 'You need to put Firebase database url in `firebase` key in  `config.json`';
}

firebase.initializeApp( {
	serviceAccount: configFolder + '/' + 'firebase-credentials.json',
	databaseURL: config.firebase,
} );

let Accessory, Service, Characteristic, UUIDGen;

module.exports = function( homebridge ) {
	console.log( 'homebridge API version: ' + homebridge.version );

	Accessory = homebridge.platformAccessory;
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	UUIDGen = homebridge.hap.uuid;
	homebridge.registerPlatform( 'homebridge-firenetPlatform', 'FirenetPlatform', FirenetPlatform, true );
};

function FirenetPlatform( log, config, api ) {
	var platform = this;
	console.log( 'FirenetPlatform Init' );
	this.log = log;
	this.config = config;
	this.accessories = [];

	if ( api ) {
		this.api = api;
		this.api.on( 'didFinishLaunching', function() {
			console.log( 'Plugin - DidFinishLaunching' );
			firebase.database().ref( 'things' )
			.child( 'smart-pi' )
			.on( 'child_added', function( deviceSnap ) {
				const data = deviceSnap.val();
				const id = 'smart-pi/' + deviceSnap.key;
				if ( ! some( platform.accessories, accessory => accessory.context.id === id ) ) {
					const newAccessory = new Accessory( data.name || id, UUIDGen.generate( id ) );
					newAccessory.context.id = id;
					if ( data.mode === 'switch' ) {
						newAccessory.addService( Service.Lightbulb, 'Light' );
						platform.configureAccessory( newAccessory );
						platform.api.registerPlatformAccessories( 'homebridge-firenetPlatform', 'FirenetPlatform', [ newAccessory ] );
					}
				}
			} );
		}.bind( this ) );
	}
}

FirenetPlatform.prototype.configureAccessory = function( accessory ) {
	console.log( 'Plugin - Configure Accessory: ' + accessory.displayName );
	const id = accessory.context.id;
	const dbRef = firebase.database().ref( 'things/' + id );

	//This is not working as it supposed to
	dbRef.child( 'connected' ).on( 'value', snap => accessory.updateReachability( snap.val() === 'true' ) );

	accessory.on( 'identify', function( paired, callback ) {
		console.log( 'Identify!!!' );
		callback();
	} );

	dbRef.child( 'mode' ).once( 'value', modeSnap => {
		if ( modeSnap.val() === 'switch' && accessory.getService( Service.Lightbulb ) ) {
			const characteristic = accessory
			.getService( Service.Lightbulb )
			.getCharacteristic( Characteristic.On );

			//Update state on server
			characteristic.on( 'set', function( value, callback ) {
				firebase.database().ref( 'dispatch' ).push( {
					'id': accessory.context.id,
					'action': 'set',
					'state' : {
						'power' : value ? 1 : 0
					}
				} );
				callback();
			} );

			//Update state in homebridge
			dbRef.child( 'state' ).child( 'power' )
			.on( 'value', snap => characteristic.value = ( snap.val() === 1 ) );
		}
	} );

	this.accessories.push( accessory );

	//Remove deleted accessory
	//this.api.unregisterPlatformAccessories("homebridge-firenetPlatform", "FirenetPlatform", this.accessories);
	//this.accessories = [];
};
