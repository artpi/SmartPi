import firebase from 'firebase';
import os from 'os';
import some from 'lodash/some';

const configFolder = os.homedir() + '/.firenet-of-things';
const config = require( configFolder + '/' + 'config.json' );
if ( ! config ) {
	throw 'You need to provide config file. Default location is `~/.firenet-of-things/config.json`.';
}

var Accessory, Service, Characteristic, UUIDGen;

if ( ! config.firebase ) {
	throw 'You need to put Firebase database url in `firebase` key in  `config.json`';
}

firebase.initializeApp( {
	serviceAccount: configFolder + '/' + 'firebase-credentials.json',
	databaseURL: config.firebase,
} );

module.exports= function(homebridge) {
	console.log("homebridge API version: " + homebridge.version);

	// Accessory must be created from PlatformAccessory Constructor
	Accessory = homebridge.platformAccessory;

	// Service and Characteristic are from hap-nodejs
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	UUIDGen = homebridge.hap.uuid;
	// For platform plugin to be considered as dynamic platform plugin,
	// registerPlatform(pluginName, platformName, constructor, dynamic), dynamic must be true
	homebridge.registerPlatform("homebridge-firenetPlatform", "FirenetPlatform", FirenetPlatform, true);
};

// Platform constructor
// config may be null
// api may be null if launched from old homebridge version
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

// Function invoked when homebridge tries to restore cached accessory
// Developer can configure accessory at here (like setup event handler)
// Update current value
FirenetPlatform.prototype.configureAccessory = function( accessory ) {
	console.log( "Plugin - Configure Accessory: " + accessory.displayName );
	// set the accessory to reachable if plugin can currently process the accessory
	// otherwise set to false and update the reachability later by invoking 
	// accessory.updateReachability()
	accessory.reachable = true;

	accessory.on( 'identify', function(paired, callback) {
		console.log( "Identify!!!" );
		callback();
	} );

	if ( accessory.getService( Service.Lightbulb ) ) {
		accessory.getService( Service.Lightbulb )
		.getCharacteristic( Characteristic.On )
		.on( 'set', function( value, callback ) {
			firebase.database().ref( 'dispatch' ).push( {
				'id': accessory.context.id,
				'action': 'set',
				'state' : {
					'power' : value ? 1 : 0
				}
			} );
			callback();
		} );
	}

	this.accessories.push( accessory );

	//Remove deleted accessory
	//this.api.unregisterPlatformAccessories("homebridge-firenetPlatform", "FirenetPlatform", this.accessories);
	//this.accessories = [];
};
