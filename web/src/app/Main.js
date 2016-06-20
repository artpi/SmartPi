import React, { Component } from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import firebase from 'firebase';
import config from '../config-firebase';
import NodemcuMinion from '../../devices/nodemcu-minion';

firebase.initializeApp( config );

const styles = {
	container: {
	},
};

function dispatch( action ) {
	firebase.database().ref( 'dispatch' ).push( action );
}

class Main extends Component {
	constructor( props, context ) {
		super( props, context );
		this.state = {
			devices: []
		};
	}

	componentDidMount() {
		firebase.database().ref( 'things' ).on( 'value', gateways => {
			const devices = [];
			gateways = gateways.val();
			for ( let gateway in gateways ) {
				for ( let device in gateways[ gateway ] ) {
					let data = gateways[ gateway ][ device ] || {};
					devices.push( {
						id: gateway + '/' + device,
						online: data.connected,
						name: data.name || data.id,
						state: data.state
					} );
				}
			}
			this.setState( { devices } );
		} );
	}

	render() {
		return (
			<MuiThemeProvider muiTheme={ getMuiTheme() }>
				<div style={styles.container}>
					<AppBar
						title="SmartHome super App"
						iconClassNameRight="muidocs-icon-navigation-expand-more"
					/>
					{
						this.state.devices.map( device => ( <NodemcuMinion
							key = { device.id }
							id = { device.id }
							dispatch = { dispatch }
							name = { device.name }
							online = { device.online }
							state = { device.state }
						/> ) )
					}
				</div>
			</MuiThemeProvider>
		);
	}
}

export default Main;
