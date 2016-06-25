import React, { Component } from 'react';
import { CardTitle } from 'material-ui/Card';
import Toggle from 'material-ui/Toggle';

class Switch extends Component {
	constructor( props, context ) {
		super( props, context );
	}

	render() {
        return ( <div>
			<CardTitle title="SWITCH" subtitle="Control a switch"/>
			<Toggle
				toggled={ !! this.props.state.power }
				disabled={ false }
				labelPosition="right"
				label={ "POWER!!" }
				onToggle = { ( e, val ) => this.props.dispatch( { power: val ? 1 : 0 } ) }
			/>
		</div> );
	}
}

export default Switch;
