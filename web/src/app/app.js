import React from 'react';
import { render } from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Main from './Main'; // Our custom react component
import firebase from 'firebase';
import config from '../config-firebase';
import { Router, Route, hashHistory } from 'react-router';
import Devices from './Devices.js';
import Triggers from './Triggers.js';

const app = firebase.initializeApp( config );
const db = firebase.database();
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const componentProps = {
	db,
	dispatch: action => db.ref( 'dispatch' ).push( action )
};

function loggedIn( user ) {
	document.getElementById( 'logged-out' ).style.display = 'none';
	render( (
			<Router history={ hashHistory }>
				<Route path="/" component={ Main }>
					<Route path="devices" component={ () => <Devices { ...componentProps } /> }/>
					<Route path="triggers" component={ () => <Triggers { ...componentProps } /> }/>
					<Route path="*" component={ () => <Devices { ...componentProps } /> } />
				</Route>
			</Router>
		),
		document.getElementById( 'app' )
	);
}

//Authentication
const auth = app.auth();
const initApp = function() {
	auth.onAuthStateChanged( function( user ) {
		if ( user ) {
			user.getToken().then( function( accessToken ) {
				loggedIn( user );
			} );
		} else {
			//Lets log in!
			const ui = new firebaseui.auth.AuthUI( auth );
			const uiConfig = {
				'queryParameterForWidgetMode': 'mode',
				'queryParameterForSignInSuccessUrl': 'signInSuccessUrl',
				'signInOptions': [ firebase.auth.GoogleAuthProvider.PROVIDER_ID ],
				'callbacks': {
					'signInSuccess': function( currentUser, credential, redirectUrl ) {
						loggedIn( currentUser );
						return false;
					}
				}
			};
			ui.start( '#firebaseui-auth-container', uiConfig );
		}
	}, function( error ) {
		console.log( 'Auth error!', error );
	} );
};

window.onload = function() {
	initApp();
};
