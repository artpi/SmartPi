var stepDuration = 100;

function validate( value ) {
	if ( !value ) {
		return 0;
	}

	value = Math.round( value );

	if ( value > 1023 ) {
		value = 1023;
	} else if ( value < 0 ) {
		value = 0;
	}
	return value;
}

function validateColor( color ) {
	return {
		red: validate( color.red ),
		green: validate( color.green ),
		blue: validate( color.blue )
	};
}

function getNextStep( initialColor, step ) {
	return {
		red: initialColor.red + step.red,
		green: initialColor.green + step.green,
		blue: initialColor.blue + step.blue
	};
}

export default function animateGradient( fromColor, toColor, duration, colorChangeCallback, completeCallback = null ) {
	return new Promise( ( resolve ) => {
		var nrOfSteps = Math.round( duration / stepDuration ),
			step = {
				red: ( toColor.red - fromColor.red ) / nrOfSteps,
				green: ( toColor.green - fromColor.green ) / nrOfSteps,
				blue: ( toColor.blue - fromColor.blue ) / nrOfSteps
			},
			lastColor = fromColor,
			interval = null;

		function animateStep() {
			if ( nrOfSteps === 0 ) {
				clearInterval( interval );
				if ( completeCallback ) {
					completeCallback();
				}
				resolve();
			} else {
				lastColor = getNextStep( lastColor, step );
				console.log( 'cool', lastColor );
				colorChangeCallback( validateColor( lastColor ) );
				nrOfSteps--;
			}
		}

		console.log( 'Animating in ' + nrOfSteps + ' steps: red: ' + step.red + ', green: ' + step.green + ', blue: ' + step.blue );
		interval = setInterval( animateStep, stepDuration );
	} );
}
