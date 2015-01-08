/*
 * touchSwipe - jQuery Plugin
 * http://plugins.jquery.com/project/touchSwipe
 * http://labs.skinkers.com/touchSwipe/
 *
 * Copyright (c) 2010 Matt Bryson (www.skinkers.com)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * $version: 1.2.5
 *
 * Changelog
 * $Date: 2010-12-12 (Wed, 12 Dec 2010) $
 * $version: 1.0.0 
 * $version: 1.0.1 - removed multibyte comments
 *
 * $Date: 2011-21-02 (Mon, 21 Feb 2011) $
 * $version: 1.1.0 	- added allowPageScroll property to allow swiping and scrolling of page
 *					- changed handler signatures so one handler can be used for multiple events
 * $Date: 2011-23-02 (Wed, 23 Feb 2011) $
 * $version: 1.2.0 	- added click handler. This is fired if the user simply clicks and does not swipe. The event object and click target are passed to handler.
 *					- If you use the http://code.google.com/p/jquery-ui-for-ipad-and-iphone/ plugin, you can also assign jQuery mouse events to children of a touchSwipe object.
 * $version: 1.2.1 	- removed console log!
 *
 * $version: 1.2.2 	- Fixed bug where scope was not preserved in callback methods. 
 *
 * $Date: 2011-28-04 (Thurs, 28 April 2011) $
 * $version: 1.2.4 	- Changed licence terms to be MIT or GPL inline with jQuery. Added check for support of touch events to stop non compatible browsers erroring.
 *
 * $Date: 2011-27-09 (Tues, 27 September 2011) $
 * $version: 1.2.5 	- Added support for testing swipes with mouse on desktop browser (thanks to https://github.com/joelhy)

 * A jQuery plugin to capture left, right, up and down swipes on touch devices.
 * You can capture 2 finger or 1 finger swipes, set the threshold and define either a catch all handler, or individual direction handlers.
 * Options:
 * 		swipe 		Function 	A catch all handler that is triggered for all swipe directions. Handler is passed 3 arguments, the original event object, the direction of the swipe : "left", "right", "up", "down" and the distance of the swipe.
 * 		swipeLeft	Function 	A handler that is triggered for "left" swipes. Handler is passed 3 arguments, the original event object, the direction of the swipe : "left", "right", "up", "down" and the distance of the swipe.
 * 		swipeRight	Function 	A handler that is triggered for "right" swipes. Handler is passed 3 arguments, the original event object, the direction of the swipe : "left", "right", "up", "down" and the distance of the swipe.
 * 		swipeUp		Function 	A handler that is triggered for "up" swipes. Handler is passed 3 arguments, the original event object, the direction of the swipe : "left", "right", "up", "down" and the distance of the swipe.
 * 		swipeDown	Function 	A handler that is triggered for "down" swipes. Handler is passed 3 arguments, the original event object, the direction of the swipe : "left", "right", "up", "down" and the distance of the swipe.
 *		swipeStatus Function 	A handler triggered for every phase of the swipe. Handler is passed 4 arguments: event : The original event object, phase:The current swipe face, either "start?, "move?, "end? or "cancel?. direction : The swipe direction, either "up?, "down?, "left " or "right?.distance : The distance of the swipe.
 *		click		Function	A handler triggered when a user just clicks on the item, rather than swipes it. If they do not move, click is triggered, if they do move, it is not.
 *
 * 		fingers 	int 		Default 1. 	The number of fingers to trigger the swipe, 1 or 2.
 * 		threshold 	int  		Default 75.	The number of pixels that the user must move their finger by before it is considered a swipe.
 *		triggerOnTouchEnd Boolean Default true If true, the swipe events are triggered when the touch end event is received (user releases finger).  If false, it will be triggered on reaching the threshold, and then cancel the touch event automatically.
 *		allowPageScroll String Default "auto". How the browser handles page scrolls when the user is swiping on a touchSwipe object. 
 *										"auto" : all undefined swipes will cause the page to scroll in that direction.
 *										"none" : the page will not scroll when user swipes.
 *										"horizontal" : will force page to scroll on horizontal swipes.
 *										"vertical" : will force page to scroll on vertical swipes.
 *
 * This jQuery plugin will only run on devices running Mobile Webkit based browsers (iOS 2.0+, android 2.2+)
 */


// Constants (now globals)
var LEFT = "left";
var RIGHT = "right";
var UP = "up";
var DOWN = "down";
var NONE = "none";
var HORIZONTAL = "horizontal";
var VERTICAL = "vertical";
var AUTO = "auto";

var PHASE_START="start";
var PHASE_MOVE="move";
var PHASE_END="end";
var PHASE_CANCEL="cancel";

var hasTouch = 'ontouchstart' in window,
START_EV = hasTouch ? 'touchstart' : 'mousedown',
MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
END_EV = hasTouch ? 'touchend' : 'mouseup',
CANCEL_EV = 'touchcancel';

var phase="start";

var that;
var $this;
var defaults;
var fingerCount;
var start, end, delta;
var triggerElementID;
var lastPositionX;


(function($) 
{
	
	
	
	$.fn.swipe = function(options) 
	{
		if (!this) return false;
		
		// Default thresholds & swipe functions
		defaults = {
					
			fingers 		: 1,								// int - The number of fingers to trigger the swipe, 1 or 2. Default is 1.
			threshold 		: 75,								// int - The number of pixels that the user must move their finger by before it is considered a swipe. Default is 75.
			
			swipe 			: null,		// Function - A catch all handler that is triggered for all swipe directions. Accepts 2 arguments, the original event object and the direction of the swipe : "left", "right", "up", "down".
			swipeLeft		: null,		// Function - A handler that is triggered for "left" swipes. Accepts 3 arguments, the original event object, the direction of the swipe : "left", "right", "up", "down" and the distance of the swipe.
			swipeRight		: null,		// Function - A handler that is triggered for "right" swipes. Accepts 3 arguments, the original event object, the direction of the swipe : "left", "right", "up", "down" and the distance of the swipe.
			swipeUp			: null,		// Function - A handler that is triggered for "up" swipes. Accepts 3 arguments, the original event object, the direction of the swipe : "left", "right", "up", "down" and the distance of the swipe.
			swipeDown		: null,		// Function - A handler that is triggered for "down" swipes. Accepts 3 arguments, the original event object, the direction of the swipe : "left", "right", "up", "down" and the distance of the swipe.
			swipeStatus		: null,		// Function - A handler triggered for every phase of the swipe. Handler is passed 4 arguments: event : The original event object, phase:The current swipe face, either "start?, "move?, "end? or "cancel?. direction : The swipe direction, either "up?, "down?, "left " or "right?.distance : The distance of the swipe.
			click			: null,		// Function	- A handler triggered when a user just clicks on the item, rather than swipes it. If they do not move, click is triggered, if they do move, it is not.
			
			triggerOnTouchEnd : true,	// Boolean, if true, the swipe events are triggered when the touch end event is received (user releases finger).  If false, it will be triggered on reaching the threshold, and then cancel the touch event automatically.
			allowPageScroll : "auto" 	/* How the browser handles page scrolls when the user is swiping on a touchSwipe object. 
											"auto" : all undefined swipes will cause the page to scroll in that direction.
 											"none" : the page will not scroll when user swipes.
 											"horizontal" : will force page to scroll on horizontal swipes.
 											"vertical" : will force page to scroll on vertical swipes.
										*/
		};
		
		
		
		if (options.allowPageScroll==undefined && (options.swipe!=undefined || options.swipeStatus!=undefined))
			options.allowPageScroll=NONE;
		
		if (options)
			$.extend(defaults, options);
		
		
		/**
		 * Setup each object to detect swipe gestures
		 */
		return this.each(function() {
            that = this;
			$this = $(this);
			
			triggerElementID = null; 	// this variable is used to identity the triggering element
			fingerCount = 0;			// the current number of fingers being used.	
			
			//track mouse points / delta
			start={x:0, y:0};
			end={x:0, y:0};
			delta={x:0, y:0};
			// added by Codrops
			lastPositionX = 0; 
			
			/**
			* Event handler for a touch start event. 
			* Stops the default click event from triggering and stores where we touched
			*/
			function touchStart(event) {
				touchStartFunc(event.pageX, event.pageY);

				that.addEventListener(MOVE_EV, touchMove, false);
				that.addEventListener(END_EV, touchEnd, false);	
			}

			/**
			* Event handler for a touch move event. 
			* If we change fingers during move, then cancel the event
			*/
			function touchMove(event)  {
				touchMoveFunc(event.pageX, event.pageY);
			}
			
			/**
			* Event handler for a touch end event. 
			* Calculate the direction and trigger events
			*/
			function touchEnd(event) {
				touchEndFunc();

				that.removeEventListener(MOVE_EV, touchMove, false);
				that.removeEventListener(END_EV, touchEnd, false);
			}
			

			// Add gestures to all swipable areas if supported
			try{
				this.addEventListener(START_EV, touchStart, false);
				this.addEventListener(CANCEL_EV, touchCancel);
			}
			catch(e){
				//touch not supported
			}
				
		});
	};
	
	
	
	
})(jQuery);



function touchStartFunc(x,y){
	phase = PHASE_START;

    if (hasTouch) {
        fingerCount = 1;
    }
	
	//clear vars..
	distance=0;
	direction=null;
	
	// check the number of fingers is what we are looking for
	if (fingerCount == defaults.fingers || !hasTouch) {
		// get the coordinates of the touch
		start.x = end.x = x;
		start.y = end.y = y;
		// changed by Codrops
		lastPositionX = end.x;
		
		if (defaults.swipeStatus)
			defaults.swipeStatus.call($this, null, phase, start, end, direction || null, distance || 0);
	} 
	else {
		//touch with more/less than the fingers we are looking for
		touchCancel(null);
	}
};



function touchMoveFunc(x,y){
	if (phase == PHASE_END || phase == PHASE_CANCEL)
		return;
    				
	end.x = x;
	end.y = y;

	// changed by Codrops
	direction = calculateDirection();
	lastPositionX = end.x;	
	
	if (hasTouch) {
        fingerCount = 1; // do not care for # of fingers
    }
	
	phase = PHASE_MOVE;

	if ( fingerCount == defaults.fingers || !hasTouch) {
		distance = calculateDistance(end, start);
		
		if (defaults.swipeStatus)
			defaults.swipeStatus.call($this, null, phase, start, end, direction || null, distance || 0);
		
		//If we trigger whilst dragging, not on touch end, then calculate now...
		if (!defaults.triggerOnTouchEnd){
			// if the user swiped more than the minimum length, perform the appropriate action
			if ( distance >= defaults.threshold ) {
				phase = PHASE_END;
				defaults.swipeStatus.call($this, null, phase, start, end, direction || null, distance || 0);
				touchCancel(null); // reset the variables
			}
		}
	} 
	else {
		phase = PHASE_CANCEL;
		defaults.swipeStatus.call($this, null, phase, start, end, direction || null, distance || 0);
		touchCancel(null);
	}
};



// Requires: end, start, defaults, fingerCount, hasTouch, distance
// Returns: phase
function touchEndFunc(){
	distance = calculateDistance(end, start);
	
	if (defaults.triggerOnTouchEnd){
		phase = PHASE_END;
		// check to see if more than one finger was used and that there is an ending coordinate
		if ( (fingerCount == defaults.fingers  || !hasTouch) && end.x != 0 ) {
			if (distance < defaults.threshold) {
				phase = PHASE_CANCEL;
			}	
		} 
		else {
			phase = PHASE_CANCEL;
		}
	}
	else if (phase == PHASE_MOVE){
		phase = PHASE_CANCEL;
	}

	if (defaults.triggerOnTouchEnd || phase == PHASE_MOVE){
		defaults.swipeStatus.call($this, null, phase, start, end, direction || null, distance || 0);
		touchCancel(null);
	}
};



/**
* Event handler for a touch cancel event. 
* Clears current vars
*/
// event not used
function touchCancel(event) {
	// reset the variables back to default values
	fingerCount = 0;
	
	start.x = 0;
	start.y = 0;
	end.x = 0;
	end.y = 0;
	delta.x = 0;
	delta.y = 0;
};



/**
* Calcualte the length / distance of the swipe
*/
function calculateDistance(end, start){
	//return Math.round(Math.sqrt(Math.pow(end.x - start.x,2) + Math.pow(end.y - start.y,2)));
	return Math.round(Math.abs(end.x - start.x));
}


// added by codrops
function calculateDirection() {
	var dir;
	if( end.x < lastPositionX ) {
		dir = LEFT
	}
	else if( end.x > lastPositionX ) {
		dir = RIGHT;
	}
	else {
		dir = UP
	}
	return dir;
}


