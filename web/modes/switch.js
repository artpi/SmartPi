import React, { Component } from 'react';
import Toggle from 'material-ui/Toggle';
import AvatarComponent from 'material-ui/Avatar';
import On from 'material-ui/svg-icons/file/cloud-done';
import Off from 'material-ui/svg-icons/file/cloud-off';

export const Avatar = props => <AvatarComponent icon={ props.state.power ? <On /> : <Off /> } style={ { marginRight: '10px' } }></AvatarComponent>;

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
				onToggle = { ( e, val ) => this.props.dispatch( { state: { power: val ? 1 : 0 } } ) }
			/>
		</div> );
	}
}

export const deviceActions = {
	set: { 'name': 'Control state', component: Switch }
};

export default Switch;
