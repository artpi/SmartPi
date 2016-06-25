import React, { Component } from 'react';
import { CardActions, CardTitle, CardText } from 'material-ui/Card';
import ColorPicker from '../components/colorPicker';
import get from 'lodash/get';
import FlatButton from 'material-ui/FlatButton';


class RGBControl extends Component {
	constructor( props, context ) {
		super( props, context );
	}

	submit( color ) {       
		this.props.dispatch( {
        	red: Math.round(color.rgb.r * 4),
        	green: Math.round(color.rgb.g * 4),
        	blue: Math.round(color.rgb.b * 4)
		} );
	}

	render() {

        var red = get( this.props, [ 'state', 'red' ], '' );
        var green = get( this.props, [ 'state', 'green' ], '' );
        var blue = get( this.props, [ 'state', 'blue' ], '' );
        
        var initialColor = {
            r: Math.round(red / 4),
            g: Math.round(green / 4),
            b: Math.round(blue / 4)
        }
        return ( <div>
				<CardTitle title="RGB strip" subtitle="Control RGB settings here" expandable={true} />

				<CardText expandable={ true }>
                    <ColorPicker color={ initialColor }  onChangeComplete={ this.submit.bind( this ) } />

				</CardText>
				<CardActions expandable={ true }>
					<FlatButton label="OFF" onClick={ () => { this.props.off() } } />
				</CardActions>
		</div> );
	}
}

export default RGBControl;