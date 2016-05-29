# AnimaScript
Animate the text content of HTML elements with JavaScript

(work in progress...)

## Start

### With Speller 

* Reference the animaScript.min.js file :

		<script src="animaScript.min.js"></script>
		
* Insert the data-animatext attribute in the HTML elements to animate

		<div id="container">
			<p data-animatext="options2" >The <em>content</em> of the <strong>second</strong> element</p>
			<p data-animatext="options1" >The <em>content</em> of the <strong>first</strong> element</p>
			<p data-animatext="options3">The <em>content</em> of the <strong>third</strong> element</p>
		</div>

* Define options in your js file, create an instance of Speller and start

		var options1 = {action: 'spell', order: '1', unit: 'w', duration: 2000};
		var options2 = {action: 'spell', order: '2'};
		var options3 = {action: 'unspell', order: '3', delay: 500};
		
		var container = document.getElementById('container');
		
		var speller = new Speller(container);
		
		speller.start();
		
### With AnimaText

* Reference the animaScript.min.js file :

		<script src="animaScript.min.js"></script>
		
* Insert HTML elements to animate

		<div id="container">
			<p>The <em>content</em> of the <strong>first</strong> element</p>
			<p>The <em>content</em> of the <strong>second</strong> element</p>
			<p>The <em>content</em> of the <strong>third</strong> element</p>
		</div>

* Create an instance of AnimaText in your js.file and start

		var container = document.getElementById('container');
		
		var animatext = new AnimaText(container, {duration: 2500});
		
		animatext.spell();
		
	or
	
		var container = document.getElementById('container');
		
		var animatext = new AnimaText(container);
		
		animatext.duration = 2500;
		
		animatext.spell();
		
	or
	
		var container = document.getElementById('container');
		
		var animatext = new AnimaText(container);
		
		animatext.setDuration(2500).spell();
