import React from 'react';
import { CustomPicker } from 'react-color';
import Slider from 'material-ui/Slider';

class ColorPicker extends React.Component {
    render() {
        var styles = {
            example: {
                width: '100%',
                height: '50px',
                border: '2px solid black',
                marginBottom: '2em',
                backgroundColor: this.props.hex
            },
            hue: {
                background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
                height: '10px'
            },
            saturation: {
                background: 'linear-gradient(to right, #888 0%, hsl(' + this.props.hsl.h + ', 100%, 50%) 100%)',
                height: '10px'
            },
            lightness: {
                background: 'linear-gradient(to right, #000 0%, hsl(' + this.props.hsl.h + ', 100%, 50%) 50%, #fff 100%)',
                height: '10px'
            },                        
            
        }

        return (
            <div>
                <div style={styles.example}></div>
                <Slider 
                    name="h"
                    min={0}
                    max={360}
                    step={1}
                    disabled={ true }
                    style={styles.hue}
                    value={this.props.hsl.h}
                    onChange={ (e, val) => this.props.onChange({
                        h: val,
                        s: 1,
                        l: this.props.hsl.l
                    })}
                />
                <div>Hue</div>                             

                <Slider 
                    name="l"
                    min={0}
                    max={1}
                    step={.001}
                    style={styles.lightness}                    
                    value={this.props.hsl.l}
                    onChange={ (e, val) => this.props.onChange({
                        h: this.props.hsl.h,
                        s: 1,
                        l: val
                    })}
                />
                <div>Lightness</div>                
            </div>
        );       
    }
}

export default CustomPicker(ColorPicker);