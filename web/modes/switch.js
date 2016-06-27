import React, { Component } from 'react';
import Toggle from 'material-ui/Toggle';
import AvatarComponent from 'material-ui/Avatar';

export const Avatar = props => <AvatarComponent>{ props.children }</AvatarComponent>;

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
				toggled={ this.props.state && !! this.props.state.power }
				disabled={ this.props.fetching }
				label={ "Turn it on" }
				onToggle = { ( e, val ) => this.props.dispatch( { power: val ? 1 : 0 } ) }
			/>
		</div> );
	}
}

export default Switch;
