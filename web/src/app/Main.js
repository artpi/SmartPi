import React, { Component } from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import { hashHistory } from 'react-router';
import { List, ListItem } from 'material-ui/List';
import DevicesIcon from 'material-ui/svg-icons/action/important-devices';
import TriggersIcon from 'material-ui/svg-icons/action/launch';
import Subheader from 'material-ui/Subheader';

const sidebarItems=[
	{ id: 'devices', name: 'Devices', icon: <DevicesIcon /> },
	{ id: 'triggers', name: 'Triggers', icon: <TriggersIcon /> }
];

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

	setView( view ) {
		hashHistory.push( view );
		this.setState( { drawer: false } );
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
					<List style={ { marginTop: '50px' } }>
						<Subheader>Awesome Menu</Subheader>
						{ sidebarItems.map( item => (
							<ListItem leftIcon={ item.icon } key={ item.id } onTouchTap={ this.setView.bind( this, item.id ) }>{ item.name }</ListItem>
						) ) }
					</List>
					</Drawer>
					<AppBar
						title="Firenet of Things"
						iconClassNameRight="muidocs-icon-navigation-expand-more"
						onLeftIconButtonTouchTap={ this.handleDrawer.bind( this ) }
					/>
					{ this.props.children }
				</div>
			</MuiThemeProvider>
		);
	}
}

export default Main;
