import React, { Component } from 'react';
import { CardTitle } from 'material-ui/Card';
import Toggle from 'material-ui/Toggle';

class Switch extends Component {
	constructor( props, context ) {
		super( props, context );
	}

	render() {
        return ( <div>
			<Toggle
				style={ { width: '50%' } }
				elementStyle={ { width: '200px' } }
				trackStyle={ { transform: 'scale(1.5)' } }
				thumbStyle={ { transform: 'scale(2)' } }
				toggled={ !! this.props.state.power }
				disabled={ this.props.fetching }
				label={ "Turn it on" }
				onToggle = { ( e, val ) => this.props.dispatch( { power: val ? 1 : 0 } ) }
			/>
		</div> );
	}
}

export default Switch;
