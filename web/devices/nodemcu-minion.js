import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import get from 'lodash/get';
import pick from 'lodash/pick';
import { Card, CardActions, CardHeader, CardTitle, CardText } from 'material-ui/Card';
import Toggle from 'material-ui/Toggle';
import ColorPicker from '../components/colorPicker';

class NodemcuMinion extends Component {
	constructor( props, context ) {
		super( props, context );
		this.state = {
			open: false
		};
	}

	submit( color ) {
        var red = Math.round(color.rgb.r * 4); 
        var green = Math.round(color.rgb.g * 4); 
        var blue = Math.round(color.rgb.b * 4);
        
		this.props.dispatch( {
			id: this.props.id,
			action: 'set',
			state: {
                red: red,
                green: green,
                blue: blue
            }
        } );
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

        var red = get( this.props, [ 'state', 'red' ], '' );
        var green = get( this.props, [ 'state', 'green' ], '' );
        var blue = get( this.props, [ 'state', 'blue' ], '' );
        
        var initialColor = {
            r: Math.round(red / 4),
            g: Math.round(green / 4),
            b: Math.round(blue / 4)
        }            

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
					this.props.mode === 'switch' ? <div>
						<CardTitle title="SWITCH" subtitle="Control a switch" expandable={true} />
						<Toggle
							toggled={ !! this.props.state.power }
							disabled={ false }
							labelPosition="right"
							label={ "POWER!!" }
							onToggle = { ( e, val ) => this.dispatch( { power: val ? 1 : 0 } ) }
						/>
					</div> : <div>
				<CardTitle title="RGB strip" subtitle="Control RGB settings here" expandable={true} />

				<CardText expandable={ true }>
                    <ColorPicker color={ initialColor }  onChangeComplete={ this.submit.bind( this ) } />

				</CardText>
				<CardActions expandable={ true }>
					<FlatButton label="OFF" onClick={ () => { this.off() } } />
				</CardActions>
				</div>
				}
			</Card>
		);
	}
}

export default NodemcuMinion;
