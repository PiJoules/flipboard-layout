# Imporvement on Experimental Page Layout Design, inspired by Flipboard

The [original page layout](https://github.com/botelho/flipboard-layout) allowed users to swipe to the left or right to turn the page with an animation showing the page turn. You could not however turn, and animate the page turns, by pressing a button or some element since the functions for turning the page were binded to the swipe events. You can now turn the pages left or right using the functions `touchStartFunc()`, `touchMoveFunc()`, and `touchEndFunc()`.

An example can be used at [http://pijoules.github.io/flipboard-layout/](http://pijoules.github.io/flipboard-layout/).

In this example, the `Next` and `Prev` tabs act as the buttons for animating, and turning the pages. You can use the left and right arrow keys to turn the page as well.

## Usage
```js
// Initialize a next page button
$("#next-page-button-id").click(function(){
	// Flip towards left to next page
	var startingX = Math.ceil($(window).width()/2) + 1; // start at a point on the right side of the screen
	var endingX = startingX-1; // move to the left of the previous point
	var startingY = 1;

	touchStartFunc(startingX, startingY);
	touchMoveFunc(endingX, startingY);
	touchEndFunc();
});

// Initialize a prev page button
$("#prev-page-button-id").click(function(){
	// Flip towards right to prev page
	var startingX = Math.ceil($(window).width()/2) - 1; // start at a point on the left side of the screen
	var endingX = startingX+1; // move to the right of the previous point
	var startingY = 1;

	touchStartFunc(startingX, startingY);
	touchMoveFunc(endingX, startingY);
	touchEndFunc();
});
```
