import React, { Component } from 'react';
import pick from 'lodash/pick';
import { Card, CardHeader } from 'material-ui/Card';
import Toggle from 'material-ui/Toggle';
import RGBControl from '../modes/rgb-control.js';
import Switch from '../modes/switch.js';

class NodemcuMinion extends Component {
	constructor( props, context ) {
		super( props, context );
		this.state = {
			open: false
		};
	}

	dispatch( state ) {
		this.props.dispatch( {
			id: this.props.id,
			action: 'set',
			state: pick( state, [ 'red', 'green', 'blue', 'power' ] )
		} );
	}

	off() {
		this.props.dispatch( {
			id: this.props.id,
			action: 'off'
		} );
	}

	render() {
		return (
			<Card expanded={this.state.expanded} onExpandChange={this.handleExpandChange} style={ { margin: 10 } }>
				<CardHeader
					title={ this.props.name || this.props.id }
					subtitle={ this.props.mode + " Minion" }
					actAsExpander={ true }
					showExpandableButton={ true }
				>
					<Toggle
						toggled={ this.props.online }
						disabled={ true }
						labelPosition="right"
						label={ this.props.online ? "ONLINE" : "OFFLINE" }
					/>
				</CardHeader>
				{
					this.props.mode === 'switch' ? <Switch
						dispatch={ this.dispatch.bind( this ) }
						state={ this.props.state }
					/> : <RGBControl
						dispatch={ this.dispatch.bind( this ) }
						state={ this.props.state }
						off={ this.off.bind( this ) }
					/>
				}
			</Card>
		);
	}
}

export default NodemcuMinion;
