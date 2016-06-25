import pick from 'lodash/pick';
import React, { Component } from 'react';
import NodemcuMinion from '../../devices/nodemcu-minion';

class Devices extends Component {
	constructor( props, context ) {
		super( props, context );
		this.state = {
			devices: []
		};
	}

	componentDidMount() {
		this.props.db.ref( 'things' ).on( 'value', gateways => {
			const devices = [];
			gateways = gateways.val();
			for ( let gateway in gateways ) {
				for ( let device in gateways[ gateway ] ) {
					let data = gateways[ gateway ][ device ] || {};
					devices.push( {
						id: gateway + '/' + device,
						online: data.connected,
						mode: data.mode,
						name: data.name || data.id,
						state: data.state
					} );
				}
			}
			this.setState( { devices } );
		} );
	}

	render() {
		return ( <div>
			{
				this.state.devices.map( device => ( <NodemcuMinion
					key = { device.id }
					id = { device.id }
					dispatch = { this.props.dispatch }
					name = { device.name }
					online = { device.online }
					mode = { device.mode }
					state = { device.state }
				/> ) )
			}
		</div> );
	}
}

export default Devices;
