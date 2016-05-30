'use strict';

function AnimaText(element,options) {
	//options.element required (type : HTML element)
	if(element===undefined) {
		throw new TypeError('Invalid AnimaText() argument : element must be defined');
	} else if(!element.tagName) {
		throw new TypeError('Invalid AnimaText() argument : element must be HTML element');
	} else {
		this.element = element;//HTML element
	}
	
	//remove tab/spaces/newline at the beginning/end element
	//replace repeated tab/spaces/newline by a single space
	this.element.innerHTML = this.element.innerHTML.replace(/^\s*|\s(?=\s)|\s*$/g, "");
	
	if(options!==undefined) {//optional options : default values
		options.unit===undefined//unit : c-haracter, w-ord, s-entence, a-ll (default 'c')
		? this.unit = "c" 
		: this.unit = options.unit;
		
		options.type===undefined//types : r-everse, m-iddle, e-xtremities, n-ormal (default 'n')
		? this.type = "n" 
		: this.type = options.type;
		
		options.delay===undefined//delay before spelling (default 250)
		? this.delay = 0 
		: this.delay = options.delay;
		
		options.duration===undefined//duration of spelling (from which one gets speed) (default 1000)
		? this.duration = 1000 
		: this.duration = options.duration;
		
		options.callback===undefined|typeof options.callback!=='function'
		? this.callback=null
		: this.callback=options.callback;
		
		options.order===undefined//order of animatexts (for speller)
		? this.order = 1 
		: this.order = options.order;
		
		options.freezeSize===undefined//order of animatexts (for speller)
		? this.freezeSize = false 
		: this.freezeSize = options.freezeSize;
		
	} else {
		this.unit = "c";
		this.type = "n";
		this.delay = 0;
		this.duration = 1000;
		this.callback = null;
		this.order = 1;
		this.freezeSize = false;
	}
    
    this.text = this.getCharacters();//array of characters
    this.reversedText = this.getCharacters().reverse();//array of characters reversed
    this.count = this.getCounts();
    //function callback for speller
    this.next = null;
}

AnimaText.prototype.setUnit = function(value) {
	this.unit = value;
	return this;
}

AnimaText.prototype.setType = function(value) {
	this.type = value;
	return this;
}

AnimaText.prototype.setDelay = function(value) {
	this.delay = value;
	return this;
}

AnimaText.prototype.setDuration = function(value) {
	this.duration = value;
	return this;
}

AnimaText.prototype.setCallback = function(value) {
	this.callback = value;
	return this;
}

AnimaText.prototype.freezeSize = function(value) {
	this.freezeSize = value;
	return this;
}

AnimaText.prototype.getTextNodes = function() {//get array of text nodes
	var textNodes = [];//array to store text nodes
	//private function
	var getTextNodes = function(element) {//text nodes extracted and stored into array
		for(var i=0; i<element.childNodes.length; i++) {
			if(element.childNodes[i].nodeType==3) {//if childNode == text node
				var node = {};//new object for each text node
				node.parent = element.childNodes[i].parentNode;//parent element
				node.index = i;//node index
				node.value = element.childNodes[i].nodeValue.split("");//value : array of characters
				textNodes.push(node);//textNode pushed into array
			} else {
				getTextNodes(element.childNodes[i]);//if childnode not a text node : search for text nodes into it (recursion)
			}
		}
		return textNodes;//text nodes array(each text node is an object ; properties : parent element, index, value)
	};
	
	return getTextNodes(this.element);
}
	
AnimaText.prototype.getCharacters = function() {//get array of characters
	var nodes = this.getTextNodes();
	var text = [];
	for(var i=0; i<nodes.length; i++) {//each node
		for(var j=0; j<nodes[i].value.length; j++) {//each item of node (=character)
			var character = {};
			character.value = nodes[i].value[j];//character value
			character.element = nodes[i].parent;//parent element
			character.nodeIndex = nodes[i].index;//node index
			text.push(character);
		}
	}
	
	//while (text[0].value.toString().match(/^\s+$/)) {
			//text.shift();
	//}
	
	//while (text[text.length-1].value.toString().match(/^\s+$/)) {
			//text.pop();
	//}
	
	return text;//array of characters (each character is an object ; properties : parent element, nodeIndex, value)
};

AnimaText.prototype.getCounts = function() {//get array of characters
	var nodes = this.getTextNodes();
	var count = {};
	var characterArray = [];
	for(var i=0; i<nodes.length; i++) {//get a single array of characters
		characterArray = characterArray.concat(nodes[i].value);
	}
	count.characters = characterArray.length;
	count.characters = characterArray.length;//count characters
	var string = characterArray.toString();
	var wordArray = string.match(/ |\u00A0/g);//matches spaces
	wordArray ? count.words = wordArray.length+1 : count.words = 1;//count words = count spaces+1
	var sentenceArray = string.match(/\u002E|\u2026|\u003F|\u0021/g);//matches '.' and &hellip;
	sentenceArray ? count.sentences = sentenceArray.length : count.sentences = 1;//count sentences = count ., !, ? and &hellip;
	return count;
};

AnimaText.prototype.setSize = function() {
	var element = this.element;
	//in order to prevent mouvement : 
	//set width/height/margin of element before emptying nodes (not very good for performance)
	var styles = window.getComputedStyle(element);
	if(styles.display!=='inline') {
		element.style.width = element.clientWidth + "px";
		element.style.height = element.clientHeight + "px";
		if(styles.marginTop!=="0px")
			element.style.marginTop = styles.marginTop;
		if(styles.marginBottom!=="0px")
			element.style.marginBottom = styles.marginBottom;
	}
};
    
AnimaText.prototype.emptyNodes = function() {//emptying nodes
	if(this.freezeSize===true)
		this.setSize();
	var nodes = this.getTextNodes();
	for(var i=0; i < nodes.length; i++) {//each node emptied (nodeValue = "")
		nodes[i].parent.childNodes[nodes[i].index].nodeValue = "";
	}
};
		
AnimaText.prototype.spellCharacters = function() {
	this.emptyNodes();
	var element = this.element;
	if(typeof this.delay === 'number') {
		var delay = this.delay;
	} else {
		throw new TypeError('Invalid AnimaText() argument : delay must be a number');
	}
	if(typeof this.duration === 'number') {
		var speed = this.duration/this.count.characters;
	} else {
		throw new TypeError('Invalid AnimaText() argument : duration must be a number');
	}
	var type = this.type;
	var callback = this.callback;
	var next = this.next;
	var interval;
			
	if(type == "m") {//middle (type: m) : spells from the middle
		var text = this.text;
		var index1 = Math.ceil(text.length/2)-1;//index backwards
		var index2 = index1 + 1;//index forwards
		var flag = true;
							
		window.setTimeout(function(){launchMiddle();},delay);
		
		function launchMiddle() {
			element.style.visibility = "visible";//visible before spelling
			interval = window.setInterval(function(){spellMiddle();},speed);
		}
		
		function spellMiddle() {//theses two functions are launched alternatively 
			if(flag==true) {
				spellMiddleBack();
			} else {
				spellMiddleForw();
			}
		}
		
		function spellMiddleBack() {
			var c;//character
			if(index1 >= 0) {
				c = text[index1];
				c.element.childNodes[c.nodeIndex].nodeValue = c.value + c.element.childNodes[c.nodeIndex].nodeValue;
				index1 -= 1;
				flag = false;
			} else {
				window.clearInterval(interval);
				if(callback) { callback(); }
				if(next) { next(); }
			}
		}
		
		function spellMiddleForw() {
			var c;//character
			if(index2 <= text.length-1) {
				c = text[index2];
				c.element.childNodes[c.nodeIndex].nodeValue += c.value;
				index2 += 1;
				flag = true;	
			} else {
				window.clearInterval(interval);
				if(callback) { callback(); }
				if(next) { next(); }
			}
		}
	} else if(type == "e") {
		var text = this.text;
		var index1 = 0;//index first half
		var index2 = text.length -1;//index forwards
		var middle = Math.ceil(text.length/2)-1;
		var array1 = [];
		var array2 = [];
		var array = [];
		
		var flag = true;
		
		window.setTimeout(function(){launchExt();},delay);
		
		function launchExt() {
			element.style.visibility = "visible";//visible before spelling
			interval = window.setInterval(function(){spellExt();},speed);
		}
		
		function spellExt() {//theses two functions are launched alternatively 
			if(flag==true) {
				spellExt1();
			} else {
				spellExt2();
			}
		}
		
		function spellExt1() {
			var c;//character
			if(index1 <= middle) {
				c = text[index1];
				array1.push(c);
				array = array1.concat(array2);//concatenation of the 2 arrays
				for(var i=0; i<array.length; i++) {//nodes emptied
					array[i].element.childNodes[array[i].nodeIndex].nodeValue = "";
				}
				for(var i=0; i<array.length; i++) {//nodes filled
					array[i].element.childNodes[array[i].nodeIndex].nodeValue += array[i].value;
				}
				index1 += 1;
				flag = false;
			} else {
				window.clearInterval(interval);
				if(callback) { callback(); }
				if(next) { next(); }
			}
		}
		
		function spellExt2() {
			var c;//character
			if(index2 > middle) {
				c = text[index2];
				array2.unshift(c);
				array = array1.concat(array2);//concatenation of the 2 arrays
				for(var i=0; i<array.length; i++) {//nodes emptied
					array[i].element.childNodes[array[i].nodeIndex].nodeValue = "";
				}
				for(var i=0; i<array.length; i++) {//nodes filled
					array[i].element.childNodes[array[i].nodeIndex].nodeValue += array[i].value;
				}
				index2 -= 1;
				flag = true;	
			} else {
				window.clearInterval(interval);
				if(callback) { callback(); }
				if(next) { next(); }
			}
		}
		
	} else if(type == "r") {//reverse (type: r) spells from last character to the first
		var index = 0;
		var text = this.reversedText;
		
		window.setTimeout(function(){launchReverse();},delay);
		
		function launchReverse() {
			element.style.visibility = "visible";
			interval = window.setInterval(function(){spellReverse();},speed);
		}
		
		function spellReverse() {
			var c;//character
			if(index <= text.length-1) {
				c = text[index];
				c.element.childNodes[c.nodeIndex].nodeValue = c.value + c.element.childNodes[c.nodeIndex].nodeValue;
				index += 1;						
			} else {
				window.clearInterval(interval);
				if(callback) { callback(); }
				if(next) { next(); }			}
		}
		
	} else if(type == "n") {//normal (spells from first character to the last)
		var text = this.text;
		var index = 0;
												
		window.setTimeout(function(){launchNormal();},delay);
		
		function launchNormal() {
			element.style.visibility = "visible";
			interval = window.setInterval(function(){spellNormal();},speed);
		}
		
		function spellNormal() {
			var c;//character
			if(index <= text.length-1) {
				c = text[index];
				c.element.childNodes[c.nodeIndex].nodeValue += c.value;
				index += 1;
			} else {
				window.clearInterval(interval);
				if(callback) { callback(); }
				if(next) { next(); }
			}
		}
	} else {
		throw new TypeError('Invalid AnimaText() argument : if unit = c, type must be n, r, m or e');
	}
	
	
};

AnimaText.prototype.spellWords = function() {
	this.emptyNodes();
	var element = this.element;
	if(typeof this.delay === 'number') {
		var delay = this.delay;
	} else {
		throw new TypeError('Invalid AnimaText() argument : delay must be a number');
	}
	if(typeof this.duration === 'number') {
		var speed = this.duration/this.count.words;
	} else {
		throw new TypeError('Invalid AnimaText() argument : duration must be a number');
	}
	var type = this.type;
	var callback = this.callback;
	var next = this.next;
	var interval;
			
	if(type == "r") {//reverse (type: r) spells from last character to the first
		var index = 0;
		var text = this.reversedText;
		
		window.setTimeout(function(){launchReverse();},delay);
		
		function launchReverse() {
			element.style.visibility = "visible";
			interval = window.setInterval(function(){spellReverse();},speed);
		}
		
		function spellReverse() {
			var c;//character
			do {
				if(index <= text.length-1) {
					c = text[index];
					c.element.childNodes[c.nodeIndex].nodeValue = c.value + c.element.childNodes[c.nodeIndex].nodeValue;
					index += 1;						
				} else {
					window.clearInterval(interval);
					if(callback) { callback(); }
					if(next) { next(); }
					break;
				}
			} while(c.value != " " && c.value != "\u00A0")//spell until space
		}
		
	} else if(type == "n") {//normal (spells from first character to the last)
		var text = this.text;
		var index = 0;
												
		window.setTimeout(function(){launchNormal();},delay);
		
		function launchNormal() {
			element.style.visibility = "visible";
			interval = window.setInterval(function(){spellNormal();},speed);
		}
		
		function spellNormal() {
			var c;//character
			do {
				if(index <= text.length-1) {
					c = text[index];
					c.element.childNodes[c.nodeIndex].nodeValue += c.value;
					index += 1;
				} else {
					window.clearInterval(interval);
					if(callback) { callback(); }
					if(next) { next(); }
					break;
				}
			} while(c.value != " " && c.value != "\u00A0")//spell until space
		}
	} else {
		throw new TypeError('Invalid AnimaText() argument : if unit = w, type must be n or r');
	}
};

AnimaText.prototype.spellSentences = function() {
	this.emptyNodes();
	var element = this.element;
	if(typeof this.delay === 'number') {
		var delay = this.delay;
	} else {
		throw new TypeError('Invalid AnimaText() argument : delay must be a number');
	}
	if(typeof this.duration === 'number') {
		var speed = this.duration/this.count.sentences;
	} else {
		throw new TypeError('Invalid AnimaText() argument : duration must be a number');
	}
	var type = this.type;
	var callback = this.callback;
	var next = this.next;
	var interval;
			
	//normal (spells from first character to the last)
	var text = this.text;
	var index = 0;
											
	window.setTimeout(function(){launchNormal();},delay);
	
	function launchNormal() {
		element.style.visibility = "visible";
		interval = window.setInterval(function(){spellNormal();},speed);
	}
	
	function spellNormal() {
		var c;//character
		do {
			if(index <= text.length-1) {
				c = text[index];
				c.element.childNodes[c.nodeIndex].nodeValue += c.value;
				index += 1;
			} else {
				window.clearInterval(interval);
				if(callback) { callback(); }
				if(next) { next(); }
				break;
			}
		} while(c.value != "." && c.value != "\u2026" && c.value != "\u003F" && c.value != "\u0021")//spell until full stop, hellip, ? et !
	}
};

AnimaText.prototype.spellAll = function() {
	//no empty nodes
	if(this.freezeSize===true)
		this.setSize();
	var element = this.element;
	if(typeof this.duration === 'number') {
		var duration = this.duration;
	} else {
		throw new TypeError('Invalid AnimaText() argument : duration must be a number');
	}
	if(typeof this.delay === 'number') {
		var delay = this.delay + this.duration;
	} else {
		throw new TypeError('Invalid AnimaText() argument : delay must be a number');
	}
	var callback = this.callback;
	var next = this.next;
	var interval;
	
	element.style.visibility = 'hidden';
	
	window.setTimeout(function(){
		element.style.visibility = 'visible';
		if(callback) { callback(); }
		if(next) { next(); }
		},delay);
}

AnimaText.prototype.spell = function() {
	if(this.unit=="c") {
		return this.spellCharacters();
	} else if(this.unit=="w") {
		return this.spellWords();
	} else if(this.unit=="s") {
		return this.spellSentences();
	} else if(this.unit=="a") {
		return this.spellAll();
	} else {
		throw new TypeError('Invalid AnimaText() argument : unit must be c, w, s or a');
	}
};

AnimaText.prototype.unspellCharacters = function() {
	if(this.freezeSize===true)
		this.setSize();
	var nodes = this.getTextNodes().slice(0);
	var element = this.element;
	if(typeof this.delay === 'number') {
		var delay = this.delay;
	} else {
		throw new TypeError('Invalid AnimaText() argument : delay must be a number');
	}
	if(typeof this.duration === 'number') {
		var speed = this.duration/this.count.characters;
	} else {
		throw new TypeError('Invalid AnimaText() argument : duration must be a number');
	}
	var type = this.type;
	var callback = this.callback;
	var next = this.next;
	var interval;
	
	if(type == "r") {//normal (unspells from last character to the first)
		
		var index = 0;//starts with last node
				
		window.setTimeout(function(){launchReverse();},delay);
		
		function launchReverse() {
			element.style.visibility = "visible";
			interval = window.setInterval(function(){unspellReverse();},speed);
		}
		
		function unspellReverse() {
			if(index <= nodes.length-1) {//if a node is left
				var node = nodes[index];
				var parent = node.parent;
				var nodeIndex = node.index;
				var value = node.nodeValue;
				if(parent.childNodes[nodeIndex].nodeValue.length > 0) {//if node not empty
					parent.childNodes[nodeIndex].nodeValue = parent.childNodes[nodeIndex].nodeValue.slice(1,parent.childNodes[nodeIndex].nodeValue.length);
				} else {//else previous node
					index+=1;
				}
			} else {//else clear
				window.clearInterval(interval);
				if(callback) { callback(); }
				if(next) { next(); }
			}
		}
	
	} else if(type == "n") {//normal (unspells from last character to the first)
	
		var index = nodes.length-1;//starts with last node
		var node = nodes[index];
		
		window.setTimeout(function(){launchNormal();},delay);
		
		function launchNormal() {
			element.style.visibility = "visible";
			interval = window.setInterval(function(){unspellNormal();},speed);
		}
		
		function unspellNormal() {
			if(index >=0) {//if a node is left
				var node = nodes[index];
				var parent=node.parent;
				var nodeIndex = node.index;
				var value = node.nodeValue;
				if(parent.childNodes[nodeIndex].nodeValue.length > 0) {//if node not empty
					parent.childNodes[nodeIndex].nodeValue = parent.childNodes[nodeIndex].nodeValue.slice(0,-1);
				} else {//else previous node
					index-=1;
				}
			} else {//else clear
				window.clearInterval(interval);
				if(callback) { callback(); }
				if(next) { next(); }
			}
		}
	
	} else {
		throw new TypeError('Invalid AnimaText() argument : type must be n, r or m');
	}
}

AnimaText.prototype.unspellWords = function() {
	if(this.freezeSize===true)
		this.setSize();
	var nodes = this.getTextNodes().slice(0);
	var element = this.element;
	if(typeof this.delay === 'number') {
		var delay = this.delay;
	} else {
		throw new TypeError('Invalid AnimaText() argument : delay must be a number');
	}
	if(typeof this.duration === 'number') {
		var speed = this.duration/this.count.words;
	} else {
		throw new TypeError('Invalid AnimaText() argument : duration must be a number');
	}
	var type = this.type;
	var callback = this.callback;
	var next = this.next;
	var interval;
	
	//normal (unspells from last character to the first)
		
	var index = nodes.length-1;
	var node = nodes[index];
	window.setTimeout(function(){launchNormal();},delay);
	
	function launchNormal() {
		element.style.visibility = "visible";
		interval = window.setInterval(function(){unspellNormal();},speed);
	}
	
	function unspellNormal() {
		if(index >=0) {
			var node = nodes[index];
			var parent=node.parent;
			var nodeIndex = node.index;
			var value = node.nodeValue;
			var character;

			do {
				if(node.value.length > 0) {
					parent.childNodes[nodeIndex].nodeValue = parent.childNodes[nodeIndex].nodeValue.slice(0,-1);
					character = node.value.splice(-1,1);//in order to evaluate while condition and if condition
				} else {
					index-=1;
					break;
				}
			} while(character != " " && character.value != "\u00A0")
					
		} else {
			window.clearInterval(interval);
			if(callback) { callback(); }
			if(next) { next(); }
		}
	}
}

AnimaText.prototype.unspell = function() {
	if(this.unit=="c") {
		return this.unspellCharacters();
	} else if(this.unit=="w") {
		return this.unspellWords();
	} else {
		throw new TypeError('Invalid AnimaText() argument : unit must be c or w');
	}
	
	
};

function Speller(container)	{
	!container
	? this.container = document.body
	: this.container = container;
	
	this.animatexts = this.getAnimatexts();
	this.sortedAnimatexts = this.sortAnimatexts(this.animatexts);
}
//get animatexts from container. For each animatext : set options/emptyNodes/push into array
Speller.prototype.getAnimatexts = function() {
	this.elements = this.container.querySelectorAll('[data-animatext]');
	var array = [];
			
	for(var i=0; i<this.elements.length; i++) {
		var animatext = {};
		animatext.options = eval(this.elements[i].getAttribute("data-animatext"));//use of eval : options must be defined in global scope
		animatext.text = new AnimaText(this.elements[i],animatext.options);
		if(animatext.options.action != 'unspell' && animatext.text.unit != 'a')//if unit = a, no emptyNodes
			animatext.text.emptyNodes();
		array.push(animatext);
	}

	return array;
}
//gets array (sorted by order) of arrays (bunches containing texts of same order)
Speller.prototype.sortAnimatexts = function(texts) {
	var array = [];
	var max=0;
	
	for(i = 0; i<texts.length ; i++) {//in case of non consecutive order numbers : get max order number
		texts[i].options.order > max ? max = texts[i].options.order : max = max;
	}

	var i=0;

	while(i < max) {//sort by order number and put texts of same order number together in same array (bunch)
		var items = [];
		
		for(var j=0 ; j<texts.length; j++) {
			if(texts[j].options.order == i + 1) {
				items.push(texts[j]);
			}
		}
		
		if(items.length > 0) {
			array.push(items);
		}
	
		i++
	}
	
	return array;
}
//for each bunch, find the longest in total duration (to which is attached function 'next')
Speller.prototype.longest = function(array) {
	var longest = array[0].text;
	
	if(array.length > 1) {
		for(var i=1 ; i<array.length ; i++) {
			if(array[i].text.duration + array[i].text.delay > longest.duration + longest.delay) {
				longest = array[i].text
			}
		}
	}
	
	return longest;
}

Speller.prototype.launch = function(texts) {
	var instance = this;
	
	if(texts[0]) {//always deal with the first bunch of texts
		var bunch = texts[0];
		var longest = this.longest(bunch);
		longest.next = function() {//attach function 'next' to longest in total duration 
			instance.launch(texts);//will call the next bunch
		}
			
		for(var i=0; i<bunch.length; i++) {//launch animation the bunch
			if(bunch[i].options.action=='spell') {
				bunch[i].text.spell();
			} else if (bunch[i].options.action=='unspell') {
				bunch[i].text.unspell();
			} else {
				throw new TypeError('Invalid speller argument : action must be spell or unspell');
			}
		}
		
		texts.splice(0,1);//remove bunch dealt with	
	}
}

Speller.prototype.start = function() {
	this.queue = this.sortedAnimatexts.slice(0);
	this.launch(this.queue);
}
