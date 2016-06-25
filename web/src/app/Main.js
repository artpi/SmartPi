import React, { Component } from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Devices from './Devices.js';

const styles = {
	container: {
	},
};

class Main extends Component {
	constructor( props, context ) {
		super( props, context );
		this.state = {
			drawer: false
		};
	}

	handleDrawer() {
		this.setState( { drawer: !this.state.drawer } );
	}


	render() {
		return (
			<MuiThemeProvider muiTheme={ getMuiTheme() }>
				<div style={ styles.container }>
					<Drawer
						docked={ false }
						open={ this.state.drawer }
						onRequestChange={ this.handleDrawer.bind( this ) }
					>
						<MenuItem>Menu Item</MenuItem>
						<MenuItem>Menu Item 2</MenuItem>
					</Drawer>
					<AppBar
						title="SmartHome super App"
						iconClassNameRight="muidocs-icon-navigation-expand-more"
						onLeftIconButtonTouchTap={ this.handleDrawer.bind( this ) }
					/>
					<Devices db={ this.props.db } dispatch={ this.props.dispatch } />
				</div>
			</MuiThemeProvider>
		);
	}
}

export default Main;
