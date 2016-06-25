import React, { Component } from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Devices from './Devices.js';

const sidebarItems=[
	{ id: 'devices', name: 'Devices' },
	{ id: 'triggers', name: 'Triggers' }
];

class Main extends Component {
	constructor( props, context ) {
		super( props, context );
		this.state = {
			drawer: false,
			view: 'devices'
		};
	}

	handleDrawer() {
		this.setState( { drawer: !this.state.drawer } );
	}

	setView( view ) {
		this.setState( { view, drawer: false } );
	}

	render() {
		return (
			<MuiThemeProvider muiTheme={ getMuiTheme() }>
				<div>
					<Drawer
						docked={ false }
						open={ this.state.drawer }
						onRequestChange={ this.handleDrawer.bind( this ) }
					>
					{ sidebarItems.map( item => (
						<MenuItem key={ item.id } onTouchTap={ this.setView.bind( this, item.id ) }>{ item.name }</MenuItem>
					) ) }
					</Drawer>
					<AppBar
						title="SmartHome super App"
						iconClassNameRight="muidocs-icon-navigation-expand-more"
						onLeftIconButtonTouchTap={ this.handleDrawer.bind( this ) }
					/>
					{ this.state.view === 'devices' ? <Devices db={ this.props.db } dispatch={ this.props.dispatch } /> : null }
				</div>
			</MuiThemeProvider>
		);
	}
}

export default Main;
