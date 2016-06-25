
function Animation () {
    var stepDuration = 100;
    var timeout = null;
    var onColorChange = null;
    var onComplete = null;
    var animationStep = null;
    
    var validate = function ( value ) {
        if( !value ) {
            return 0;
        }

        value = Math.round(value);

        if( value > 1023 ) {
            value = 1023;
        } else if ( value < 0 ) {
            value = 0;
        }
        return value;
    };
    
    var log = function(message, color) {
        console.log(message + " red: " + color.red + ", green: " + color.green + ", blue: " + color.blue);
    }
    
    var animateStep = function( initialColor, stepsLeft ) {   
        if( timeout ) {
            clearTimeout( timeout );
        }    

        var newColor = {
            red: validate(initialColor.red + animationStep.red),
            green: validate(initialColor.green + animationStep.green),
            blue: validate(initialColor.blue + animationStep.blue)
        }

        onColorChange( newColor );

        if( stepsLeft ) {
            timeout = setTimeout( () => animateStep( newColor, stepsLeft-1 ), stepDuration );        
        } else {
            onComplete();
        }
    };
    
    var animateGradient = function(from, to, duration, colorChange, complete ) {
        onColorChange = colorChange;
        onComplete = complete;
        
        var nrOfSteps = Math.round( duration / stepDuration );

        animationStep = {
            red: ( to.red - from.red ) / nrOfSteps,
            green: ( to.green - from.green ) / nrOfSteps,
            blue: ( to.blue - from.blue ) / nrOfSteps
        };
     
        animateStep( from, nrOfSteps );
    };
    
    return {
        gradient: animateGradient
    }
}

export default Animation;
