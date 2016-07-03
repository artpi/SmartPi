import React, { Component } from 'react';
import get from 'lodash/get';
import { CustomPicker } from 'react-color';
import Slider from 'material-ui/Slider';
import Color from '../utils/color';
import AvatarComponent from 'material-ui/Avatar';
import TextField from 'material-ui/TextField';

export const Avatar = props => <AvatarComponent backgroundColor={ props.state ? Color( props.state ) : null } style={ { marginRight: '10px' } }>{ props.children }</AvatarComponent>;


const WrappedPicker = CustomPicker( props => (
	<div>
		<div style={ {
			width: '100%',
			height: '50px',
			border: '2px solid black',
			marginBottom: '2em',
			backgroundColor: props.hex
		} } />
		<Slider
			name="h"
			min={ 0 }
			max={ 360 }
			step={ 1 }
			disabled={ props.fetching }
			style={ {
				background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
				height: '10px'
			} }
			value={ props.hsl.h }
			onChange={ ( e, val ) => props.onChange( {
				h: val,
				s: 1,
				l: props.hsl.l
			} ) }
		/>
		<div>Hue</div>

		<Slider
			name="l"
			min={ 0 }
			max={ 1 }
			step={ .001 }
			disabled={ props.fetching }
			style={ {
				background: 'linear-gradient(to right, #000 0%, hsl(' + props.hsl.h + ', 100%, 50%) 50%, #fff 100%)',
				height: '10px'
			} }			
			value={ props.hsl.l }
			onChange={ ( e, val ) => props.onChange( {
				h: props.hsl.h,
				s: 1,
				l: val
			} ) }
		/>
		<div>Lightness</div>
	</div>
) );

class RGBControl extends Component {
	constructor( props, context ) {
		super( props, context );
	}

	submit( color ) {
		this.props.dispatch( {
			state: {
				red: Math.round( color.rgb.r * 4 ),
				green: Math.round( color.rgb.g * 4 ),
				blue: Math.round( color.rgb.b * 4 )
			}
		} );
	}

	render() {
		var red = get( this.props, [ 'state', 'red' ], '' );
		var green = get( this.props, [ 'state', 'green' ], '' );
		var blue = get( this.props, [ 'state', 'blue' ], '' );

		var initialColor = {
			r: Math.round( red / 4 ),
			g: Math.round( green / 4 ),
			b: Math.round( blue / 4 )
		};
		return ( <div>
			<p>You can change the color of RGB Lamp</p>
			<WrappedPicker color={ initialColor } onChangeComplete={ this.submit.bind( this ) } fetching={ this.props.fetching } />
		</div> );
	}
}

const GradientControl = props => <div>
	<TextField
		defaultValue={ props.rawAction.duration }
		floatingLabelText="Duration (ms)"
		floatingLabelFixed={ true }
		onChange={ ( e, val ) => {
			if ( val && val !== '' ) {
				props.dispatch( { duration: val } );
			}
		} }
	/>
	<RGBControl {...props} />
</div>;

export const deviceActions = {
	set: { 'name': 'Set Color', component: RGBControl },
	gradient: { 'name': 'Color Transition', component: GradientControl },
};

export default RGBControl;
