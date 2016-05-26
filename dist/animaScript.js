'use strict';

function AnimaScript(element,options) {
	//options.element required (type : HTML element)
	if(element===undefined) {
		throw new TypeError('Invalid AnimaScript() argument. Element must be defined');
	} else if(!element.tagName) {
		throw new TypeError('Invalid AnimaScript() argument. Element must be HTML element');
	} else {
		this.element = element;//HTML element
	}
	if(options!==undefined) {
		//optional options : default values
		options.unit===undefined//unit : c-haracter, w-ord (default 'c')
		? this.unit = "c" 
		: this.unit = options.unit;
		
		options.type===undefined//types : r-everse, m-iddle, n-ormal (default 'n')
		? this.type = "n" 
		: this.type = options.type;
		
		options.delay===undefined//delay before spelling (default 250)
		? this.delay = 250 
		: this.delay = options.delay;
		
		options.duration===undefined//duration of spelling (from which one gets speed) (default 1000)
		? this.duration = 1000 
		: this.duration = options.duration;
		
		options.callback===undefined|typeof options.callback!=='function'
		? this.callback=null
		: this.callback=callback;
	} else {
		this.unit = "c";
		this.type = "n";
		this.delay = 250;
		this.duration = 1000;
		this.callback=null;
	}
    
    this.text = this.getCharacters();//array of characters
    this.reversedText = this.getCharacters().reverse();//array of characters reversed
    this.charactersCount = this.getCounts().characters;//characters count
    this.wordsCount = this.getCounts().words;//words count
}

AnimaScript.prototype.setUnit = function(value) {
	this.unit = value;
	return this;
}

AnimaScript.prototype.setType = function(value) {
	this.type = value;
	return this;
}

AnimaScript.prototype.setDelay = function(value) {
	this.delay = value;
	return this;
}

AnimaScript.prototype.setDuration = function(value) {
	this.duration = value;
	return this;
}

AnimaScript.prototype.setCallback = function(value) {
	this.callback = value;
	return this;
}

AnimaScript.prototype.getTextNodes = function() {//get array of text nodes
	var textNodes = [];//array to store text nodes
	//private function
	var getTextNodes = function(element) {//text nodes extracted and stored into array
		for(var i=0; i<element.childNodes.length; i++) {
			if(element.childNodes[i].nodeType==3) {//if childNode == text node
				var node = {};//new object for each text node
				node.parent = element.childNodes[i].parentNode;//parent element
				node.nodeIndex = i;//node index
				node.value = element.childNodes[i].nodeValue.split("");//value : array of characters
				textNodes.push(node);//textNode pushed into array
			} else {
				getTextNodes(element.childNodes[i]);//if childnode not a text node : search for text nodes into it (recursion)
			}
		}
		return textNodes;//text nodes array(each text node is an object ; properties : parent element, nodeIndex, value)
	};
	
	return getTextNodes(this.element);
}
	
AnimaScript.prototype.getCharacters = function() {//get array of characters
	var nodes = this.getTextNodes();
	var text = [];
	for(var i=0; i<nodes.length; i++) {
		for(var j=0; j<nodes[i].value.length; j++) {
			var character = {};
			character.value = nodes[i].value[j];//character
			character.element = nodes[i].parent;//parent element
			character.nodeIndex = nodes[i].nodeIndex;//node index
			text.push(character);
		}
	}
	return text;//array of characters (each character is an object ; properties : parent element, nodeIndex, value)
};

AnimaScript.prototype.getCounts = function() {//get array of characters
	var nodes = this.getTextNodes();
	var count = {};
	var characterArray = [];
	for(var i=0; i<nodes.length; i++) {
		characterArray = characterArray.concat(nodes[i].value);
	}
	count.characters = characterArray.length;//count characters
	var string = characterArray.toString();
	var array = string.match(/ |\u00A0/g);//count spaces
	count.words = array.length+1;//count words = count spaces+1
	return count;
};
    
AnimaScript.prototype.emptyNodes = function() {//emptying nodes
	var element = this.element;
	var nodes = this.getTextNodes();
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
	element.style.visibility = "hidden";
	for(var i=0; i < nodes.length; i++) {
		//each node emptied (nodeValue = "")
		nodes[i].parent.childNodes[nodes[i].nodeIndex].nodeValue = "";
	}
};
		
AnimaScript.prototype.spellCharacters = function() {
	this.emptyNodes();
	var element = this.element;
	if(typeof this.delay === 'number') {
		var delay = this.delay;
	} else {
		throw new TypeError('Invalid Animascript() argument. Delay must be a number');
	}
	if(typeof this.duration === 'number') {
		var speed = this.duration/this.charactersCount;
	} else {
		throw new TypeError('Invalid Animascript() argument. Duration must be a number');
	}
	var type = this.type;
	var callback = this.callback;
	var interval;
			
	if(type == "m") {//middle (type: m) : spells from the middle
		var text = this.text;
		var index = Math.ceil(text.length/2)-1;//index backwards
		var indexF = index + 1;//index forwards
		var flag = true;
					
		window.setTimeout(function(){launchMiddle();},delay);
		
		function launchMiddle() {
			element.style.visibility = "visible";//visible before spelling
			interval = window.setInterval(function(){spellMiddle();},speed);//speed*2 because both functions are launched together
		}
		
		function spellMiddle() {//theses two functions are launched alternatively 
			if(flag==true) {
				spellMiddleBack();
			} else {
				spellMiddleForw();
			}
		}
		
		function spellMiddleBack() {
			var character;
			if(index >= 0) {
				character = text[index];
				character.element.childNodes[character.nodeIndex].nodeValue = character.value + character.element.childNodes[character.nodeIndex].nodeValue;
				index -= 1;
				flag = false;
			} else {
				window.clearInterval(interval);
				if(callback)
					callback();
			}
		}
		
		function spellMiddleForw() {
			var character;
			if(indexF <= text.length-1) {
				character = text[indexF];
				character.element.childNodes[character.nodeIndex].nodeValue += character.value;
				indexF += 1;
				flag = true;	
			} else {
				window.clearInterval(interval);
				if(callback)
					callback();
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
			var character;
			if(index <= text.length-1) {
				character = text[index];
				character.element.childNodes[character.nodeIndex].nodeValue = character.value + character.element.childNodes[character.nodeIndex].nodeValue;
				index += 1;						
			} else {
				window.clearInterval(interval);
				if(callback)
					callback();
			}
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
			var character;
			if(index <= text.length-1) {
				character = text[index];
				character.element.childNodes[character.nodeIndex].nodeValue += character.value;
				index += 1;
			} else {
				window.clearInterval(interval);
				if(callback)
					callback();
			}
		}
	} else {
		throw new TypeError('Invalid AnimaScript() argument. Type must be n, r or m');
	}
};

AnimaScript.prototype.spellWords = function() {
	this.emptyNodes();
	var element = this.element;
	if(typeof this.delay === 'number') {
		var delay = this.delay;
	} else {
		throw new TypeError('Invalid Animascript() argument. Delay must be a number');
	}
	if(typeof this.duration === 'number') {
		var speed = this.duration/this.wordsCount;
	} else {
		throw new TypeError('Invalid Animascript() argument. Duration must be a number');
	}
	var type = this.type;
	var callback = this.callback;
	var interval;
			
	if(type == "m") {//middle (type: m) : spells from the middle
		var text = this.text;
		var index = Math.ceil(text.length/2)-1;//index backwards
		var indexF = index + 1;//index forwards
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
			var character;
			do {
				if(index >= 0) {
					character = text[index];
					character.element.childNodes[character.nodeIndex].nodeValue = character.value + character.element.childNodes[character.nodeIndex].nodeValue;
					index -= 1;
					flag = false;
				} else {
					window.clearInterval(interval);
					if(callback)
						callback();
					break;
				}
			} while(character.value != " " && character.value != "\u00A0")//spell until space 
		}
		
		function spellMiddleForw() {
			var character;
			do {
				if(indexF <= text.length-1) {
					character = text[indexF];
					character.element.childNodes[character.nodeIndex].nodeValue += character.value;
					indexF += 1;
					flag = true;	
				} else {
					window.clearInterval(interval);
					if(callback)
						callback();
					break;
				}
			} while(character.value != " " && character.value != "\u00A0")//spell until space
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
			var character;
			do {
				if(index <= text.length-1) {
					character = text[index];
					character.element.childNodes[character.nodeIndex].nodeValue = character.value + character.element.childNodes[character.nodeIndex].nodeValue;
					index += 1;						
				} else {
					window.clearInterval(interval);
					if(callback)
						callback();
					break;
				}
			} while(character.value != " " && character.value != "\u00A0")//spell until space
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
			var character;
			do {
				if(index <= text.length-1) {
					character = text[index];
					character.element.childNodes[character.nodeIndex].nodeValue += character.value;
					index += 1;
				} else {
					window.clearInterval(interval);
					if(callback)
						callback();
					break;
				}
			} while(character.value != " " && character.value != "\u00A0")//spell until space
		}
	} else {
		throw new TypeError('Invalid AnimaScript() argument. Type must be n, r or m');
	}
};

AnimaScript.prototype.spell = function() {
	if(this.unit=="c") {
		return this.spellCharacters();
	} else if(this.unit=="w") {
		return this.spellWords();
	} else {
		throw new TypeError('Invalid AnimaScript() argument. unit must be c or w');
	}
};

 
	
	

	





