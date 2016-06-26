import React from 'react';

import RGBControl from '../modes/rgb-control.js';
import Switch from '../modes/switch.js';

const modeMapping = {
	rgb: RGBControl,
	'switch': Switch
};

export function getModeComponent( mode ) {
	return modeMapping[ mode ];
}

export default ( props ) => {
	const ModeComponent = getModeComponent( props.mode );
	if ( !ModeComponent ) {
		return null;
	} else {
		return (
			<ModeComponent { ...props } />
		);
	}
};
