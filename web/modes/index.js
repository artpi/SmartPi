import React from 'react';
import get from 'lodash/get';

import RGBControl, { Avatar as RGBAvatar, deviceActions as rgbActions } from '../modes/rgb-control.js';
import Switch, { Avatar as SwitchAvatar, deviceActions as switchActions } from '../modes/switch.js';

const modeMapping = {
	rgb: { edit: RGBControl, avatar: RGBAvatar, actions: rgbActions },
	'switch': { edit: Switch, avatar: SwitchAvatar, actions: switchActions }
};

export function getModeComponent( mode ) {
	return modeMapping[ mode ].edit;
}

export default ( props ) => {
	//const ModeComponent = getModeComponent( props.mode );
	const ModeComponent = modeMapping[ props.mode ].actions[ props.action ].component;
	if ( !ModeComponent ) {
		return null;
	} else {
		return (
			<ModeComponent { ...props } />
		);
	}
};

export const Avatar = props => {
	const AvatarComponent = get( modeMapping, [ props.mode, 'avatar' ] );
	if ( !AvatarComponent ) {
		return null;
	} else {
		return (
			<AvatarComponent { ...props } />
		);
	}
};

export const getActions = mode => modeMapping[ mode ].actions;
