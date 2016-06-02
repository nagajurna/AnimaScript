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
		
		options.action===undefined//order of animatexts (for speller)
		? this.action = null 
		: this.action = options.action;
		
		options.freezeSize===undefined//order of animatexts (for speller)
		? this.freezeSize = true 
		: this.freezeSize = options.freezeSize;
		
	} else {
		this.unit = "c";
		this.type = "n";
		this.delay = 0;
		this.duration = 1000;
		this.callback = null;
		this.order = 1;
		this.action = null;
		this.freezeSize = true;
	}
    
    this.text = this.getCharacters();//array of characters
    this.reversedText = this.getCharacters().reverse();//array of characters reversed
    this.count = this.getCounts();
    //function callback for speller
    this.next = null;
    this._inprog = null;
    this._waiting = null;
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

AnimaText.prototype.setFreezeSize = function(value) {
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
	var nodes = this.getTextNodes();
	for(var i=0; i < nodes.length; i++) {//each node emptied (nodeValue = "")
		nodes[i].parent.childNodes[nodes[i].index].nodeValue = "";
	}
};
		
//spellNormal (type: n) : spells from first character to the last
AnimaText.prototype.spellCharactersN = function() {
	var c;//character
	if(this._index <= this.text.length-1) {
		c = this.text[this._index];
		c.element.childNodes[c.nodeIndex].nodeValue += c.value;
		this._index += 1;
	} else {
		window.clearInterval(this.interval);
		this._inprog = null;
		if(this.callback) { this.callback(); }
		if(this.next) { this.next(); }
	}
}
//spellReverse (type: r) : spells from last character to the first
AnimaText.prototype.spellCharactersR = function() {
	var c;//character
	if(this._index <= this.reversedText.length-1) {
		c = this.reversedText[this._index];
		c.element.childNodes[c.nodeIndex].nodeValue = c.value + c.element.childNodes[c.nodeIndex].nodeValue;
		this._index += 1;						
	} else {
		window.clearInterval(this.interval);
		this._inprog = null;
		if(this.callback) { this.callback(); }
		if(this.next) { this.next(); }
	}
}
//spellMiddle (type: m) : spells from the middle to the extremities
AnimaText.prototype.spellCharactersM = function() {
	if(this._flag==true) {//first half (backwards)
		var c1;//character
		if(this._index1 >= 0) {
			c1 = this.text[this._index1];
			c1.element.childNodes[c1.nodeIndex].nodeValue = c1.value + c1.element.childNodes[c1.nodeIndex].nodeValue;
			this._index1 -= 1;
			this._flag = false;
		} else {
			window.clearInterval(this.interval);
			this._inprog = null;
			if(this.callback) { this.callback(); }
			if(this.next) { this.next(); }
		}
	} else {//second half (forwards)
		var c2;//character
		if(this._index2 <= this.text.length-1) {
			c2 = this.text[this._index2];
			c2.element.childNodes[c2.nodeIndex].nodeValue += c2.value;
			this._index2 += 1;
			this._flag = true;	
		} else {
			window.clearInterval(this.interval);
			this._inprog = null;
			if(this.callback) { this.callback(); }
			if(this.next) { this.next(); }
		}
	}
}
//spellExt (type: e) : spells from the extremities to the middle
AnimaText.prototype.spellCharactersE = function() {
	var array = [];
	if(this._flag==true) {//first half
		var c1;//character
		if(this._index1 <= this._middle) {
			c1 = this.text[this._index1];
			this._array1.push(c1);
			array = this._array1.concat(this._array2);//concatenation of the 2 arrays
			for(var i=0; i<array.length; i++) {//nodes emptied
				array[i].element.childNodes[array[i].nodeIndex].nodeValue = "";
			}
			for(var i=0; i<array.length; i++) {//nodes filled
				array[i].element.childNodes[array[i].nodeIndex].nodeValue += array[i].value;
			}
			this._index1 += 1;
			this._flag = false;
		} else {
			window.clearInterval(this.interval);
			this._inprog = null;
			if(this.callback) { this.callback(); }
			if(this.next) { this.next(); }
		}
	} else {//second half
		var c2;//character
		if(this._index2 > this._middle) {
			c2 = this.text[this._index2];
			this._array2.unshift(c2);
			array = this._array1.concat(this._array2);//concatenation of the 2 arrays
			for(var i=0; i<array.length; i++) {//nodes emptied
				array[i].element.childNodes[array[i].nodeIndex].nodeValue = "";
			}
			for(var i=0; i<array.length; i++) {//nodes filled
				array[i].element.childNodes[array[i].nodeIndex].nodeValue += array[i].value;
			}
			this._index2 -= 1;
			this._flag = true;	
		} else {
			window.clearInterval(this.interval);
			this._inprog = null;
			if(this.callback) { this.callback(); }
			if(this.next) { this.next(); }
		}
	}
}

AnimaText.prototype.spellWordsN = function() {
	var c;//character
	do {
		if(this.index <= this.text.length-1) {
			c = this.text[this.index];
			c.element.childNodes[c.nodeIndex].nodeValue += c.value;
			this.index += 1;
		} else {
			window.clearInterval(this.interval);
			this._inprog = null;
			if(this.callback) { this.callback(); }
			if(this.next) { this.next(); }
			break;
		}
	} while(c.value != " " && c.value != "\u00A0")//spell until space
}

AnimaText.prototype.spellWordsR = function() {
	var c;//character
	do {
		if(this.index <= this.reversedText.length-1) {
			c = this.reversedText[this.index];
			c.element.childNodes[c.nodeIndex].nodeValue = c.value + c.element.childNodes[c.nodeIndex].nodeValue;
			this.index += 1;						
		} else {
			window.clearInterval(this.interval);
			this._inprog = null;
			if(this.callback) { this.callback(); }
			if(this.next) { this.next(); }
			break;
		}
	} while(c.value != " " && c.value != "\u00A0")//spell until space
}

AnimaText.prototype.spellSentencesN = function() {
	var c;//character
	do {
		if(this.index <= this.text.length-1) {
			c = this.text[this.index];
			c.element.childNodes[c.nodeIndex].nodeValue += c.value;
			this.index += 1;
		} else {
			window.clearInterval(this.interval);
			this._inprog = null;
			if(this.callback) { this.callback(); }
			if(this.next) { this.next(); }
			break;
		}
	} while(c.value != "." && c.value != "\u2026" && c.value != "\u003F" && c.value != "\u0021")//spell until full stop, hellip, ? et !
}

AnimaText.prototype.spellAll = function() {//init, start
	//no empty nodes
	this.element.style.visibility = 'hidden';
	var t = this;
	window.setTimeout(function(){
		t.element.style.visibility = 'visible';
		if(t.callback) { t.callback(); }
		t._inprog = null;
		if(t.next) { t.next(); }
		},t.delay);
} 

AnimaText.prototype.unspellCharactersN = function() {
	if(this._index >=0) {//if a node is left
		var node = this._array[this._index];
		var parent = node.parent;
		var nodeIndex = node.index;
		var value = node.nodeValue;
		if(parent.childNodes[nodeIndex].nodeValue.length > 0) {//if node not empty
			parent.childNodes[nodeIndex].nodeValue = parent.childNodes[nodeIndex].nodeValue.slice(0,-1);
		} else {//else previous node
			this._index-=1;
		}
	} else {//else clear
		window.clearInterval(this.interval);
		this._inprog = null;
		if(this.callback) { this.callback(); }
		if(this.next) { this.next(); }
	}
}

AnimaText.prototype.unspellCharactersR = function() {
	if(this._index <= this._array.length-1) {//if a node is left
		var node = this._array[this._index];
		var parent = node.parent;
		var nodeIndex = node.index;
		var value = node.nodeValue;
		if(parent.childNodes[nodeIndex].nodeValue.length > 0) {//if node not empty
			parent.childNodes[nodeIndex].nodeValue = parent.childNodes[nodeIndex].nodeValue.slice(1,parent.childNodes[nodeIndex].nodeValue.length);
		} else {//else previous node
			this._index+=1;
		}
	} else {//else clear
		window.clearInterval(this.interval);
		this._inprog = null;
		if(this.callback) { this.callback(); }
		if(this.next) { this.next(); }
	}
}

AnimaText.prototype.unspellCharactersM = function() {
	if(this._flag == true) {
		if(this._array1.shift() !== undefined) {
			this.emptyNodes();//nodes emptied
			this._array = this._array1.concat(this._array2);//concatenation of the 2 arrays
			
			for(var i=0; i<this._array.length; i++) {//nodes filled
				this._array[i].element.childNodes[this._array[i].nodeIndex].nodeValue += this._array[i].value;
			}
			
			this._flag = false;
		} else {
			window.clearInterval(this.interval);
			this._inprog = null;
			if(this.callback) { this.callback(); }
			if(this.next) { this.next(); }
		}
	} else {
		if(this._array2.pop() !== undefined) {
			this.emptyNodes();//nodes emptied
			this._array = this._array1.concat(this._array2);//concatenation of the 2 arrays
			
			for(var i=0; i<this._array.length; i++) {//nodes filled
				this._array[i].element.childNodes[this._array[i].nodeIndex].nodeValue += this._array[i].value;
			}
			
			this._flag = true;	
		} else {
			window.clearInterval(this.interval);
			this._inprog = null;
			if(this.callback) { this.callback(); }
			if(this.next) { this.next(); }
		}
	}
}

AnimaText.prototype.unspellCharactersE = function() {
	if(this._flag == true) {
		if(this._array1.pop() !== undefined) {
			this.emptyNodes();//nodes emptied
			this._array = this._array1.concat(this._array2);//concatenation of the 2 arrays
			
			for(var i=0; i<this._array.length; i++) {//nodes filled
				this._array[i].element.childNodes[this._array[i].nodeIndex].nodeValue += this._array[i].value;
			}
			
			this._flag = false;
		} else {
			window.clearInterval(this.interval);
			this._inprog = null;
			if(this.callback) { this.callback(); }
			if(this.next) { this.next(); }
		}
	} else {
		if(this._array2.shift() !== undefined) {
			this.emptyNodes();//nodes emptied
			this._array = this._array1.concat(this._array2);//concatenation of the 2 arrays
			
			for(var i=0; i<this._array.length; i++) {//nodes filled
				this._array[i].element.childNodes[this._array[i].nodeIndex].nodeValue += this._array[i].value;
			}
			
			this._flag = true;	
		} else {
			window.clearInterval(this.interval);
			this._inprog = null;
			if(this.callback) { this.callback(); }
			if(this.next) { this.next(); }
		}
	}
}

AnimaText.prototype.unspellWordsN = function() {
	if(this._index >= 0) {
		var node = this._array[this._index];
		var parent = node.parent;
		var nodeIndex = node.index;
		var character;

		do {
			if(node.value.length > 0) {
				parent.childNodes[nodeIndex].nodeValue = parent.childNodes[nodeIndex].nodeValue.slice(0,-1);
				character = node.value.pop();//in order to evaluate while condition and if condition
			} else {
				this._index-=1;
				break;
			}
		} while(character != " " && character != "\u00A0")
				
	} else {
		window.clearInterval(this.interval);
		this._inprog = null;
		if(this.callback) { this.callback(); }
		if(this.next) { this.next(); }
	}
}

AnimaText.prototype.unspellWordsR = function() {
	if(this._index < this._array.length) {
		var node = this._array[this._index];
		var parent = node.parent;
		var nodeIndex = node.index;
		var character;

		do {
			if(node.value.length > 0) {
				parent.childNodes[nodeIndex].nodeValue = parent.childNodes[nodeIndex].nodeValue.slice(1);
				character = node.value.shift();//in order to evaluate while condition and if condition
			} else {
				this._index+=1;
				break;
			}
		} while(character != " " && character != "\u00A0")
				
	} else {
		window.clearInterval(this.interval);
		this._inprog = null;
		if(this.callback) { this.callback(); }
		if(this.next) { this.next(); }
	}
}

AnimaText.prototype.spellCharacters = function() {// init, start
	if(typeof this.duration === 'number') {
		var speed = this.duration/this.count.characters;
	} else {
		throw new TypeError('Invalid AnimaText() argument : duration must be a number');
	}
	if(this.freezeSize===true) { this.setSize(); }
	this.emptyNodes();
	this.element.style.visibility = "visible";
	var t = this;
	if(this.type == 'n') {
		this._index = 0;
		this.interval = window.setInterval(function(){t.spellCharactersN.call(t);},speed);
	} else if(this.type == 'r') {
		this._index = 0;
		this.interval = window.setInterval(function(){t.spellCharactersR.call(t);},speed);
	} else if(this.type == 'm') {
		this._index1 = Math.ceil(this.text.length/2)-1;//index first half (backwards)
		this._index2 = Math.ceil(this.text.length/2);//index second half (forward)
		this._flag = true;
		this.interval = window.setInterval(function(){t.spellCharactersM.call(t);},speed);
	} else if(this.type == 'e') {
		this._index1 = 0;//index first half
		this._index2 = this.text.length -1;//index second half
		this._middle = Math.ceil(this.text.length/2)-1;
		this._array1 = [];
		this._array2 = [];
		this._flag = true;
		this.interval = window.setInterval(function(){t.spellCharactersE.call(t);},speed);
	} else {
		throw new TypeError('Invalid AnimaText() argument : if unit = c, type must be n, r, m or e');
	}
	this._waiting = null;
	this._inprog = true;
}

AnimaText.prototype.spellWords = function() {//init, start
	if(typeof this.duration === 'number') {
		var speed = this.duration/this.count.words;
	} else {
		throw new TypeError('Invalid AnimaText() argument : duration must be a number');
	}
	if(this.freezeSize===true) { this.setSize(); }
	this.emptyNodes();
	this.element.style.visibility = "visible";
	var t = this;
	if(this.type == 'n') {
		this.index = 0;
		this.interval = window.setInterval(function(){t.spellWordsN.call(t);},speed);
	} else if(this.type == 'r') {
		this.index = 0;
		this.interval = window.setInterval(function(){t.spellWordsR.call(t);},speed);
	} else {
		throw new TypeError('Invalid AnimaText() argument : if unit = w, type must be n or r');
	}
	this._waiting = null;
	this._inprog = true;
}

AnimaText.prototype.spellSentences = function() {//init, start
	if(typeof this.duration === 'number') {
		var speed = this.duration/this.count.sentences;
	} else {
		throw new TypeError('Invalid AnimaText() argument : duration must be a number');
	}
	if(this.freezeSize===true) { this.setSize(); }
	this.emptyNodes();
	this.element.style.visibility = "visible";
	var t = this;
	if(this.type == 'n') {
		this.index = 0;
		this.interval = window.setInterval(function(){t.spellSentencesN.call(t);},speed);
	} else {
		throw new TypeError('Invalid AnimaText() argument : if unit = s, type must be n');
	}
	this._waiting = null;
	this._inprog = true;
}    

AnimaText.prototype.unspellCharacters = function() {//init, start
	if(typeof this.duration === 'number') {
		var speed = this.duration/this.count.characters;
	} else {
		throw new TypeError('Invalid AnimaText() argument : duration must be a number');
	}
	
	if(this.freezeSize===true) { this.setSize(); }
	this.element.style.visibility = "visible";
	var t = this;
	if(this.type == 'n') {
		this._array = this.getTextNodes().slice(0);
		this._index = this._array.length-1;
		this.interval = window.setInterval(function(){t.unspellCharactersN.call(t);},speed);
	} else if(this.type == 'r') {
		this._array = this.getTextNodes().slice(0);
		this._index = 0;
		this.interval = window.setInterval(function(){t.unspellCharactersR.call(t);},speed);
	} else if(this.type == 'm') {
		var middle = Math.ceil(this.text.length/2);
		this._array = [];
		this._array1 = this.text.slice(0,middle);//array first half
		this._array2 = this.text.slice(middle);//array second half
		this._flag = true;
		this.interval = window.setInterval(function(){t.unspellCharactersM.call(t);},speed);
	} else if(this.type == 'e') {
		var middle = Math.ceil(this.text.length/2);
		this._array = [];
		this._array1 = this.text.slice(0,middle);//array first half
		this._array2 = this.text.slice(middle);//array second half
		this._flag = true;
		this.interval = window.setInterval(function(){t.unspellCharactersE.call(t);},speed);
	} else {
		throw new TypeError('Invalid AnimaText() argument : if unit = c, type must be n, r, m or e');
	}
	this._waiting = null;
	this._inprog = true;
}

AnimaText.prototype.unspellWords = function() {//init, start
	if(typeof this.duration === 'number') {
		var speed = this.duration/this.count.words;
	} else {
		throw new TypeError('Invalid AnimaText() argument : duration must be a number');
	}
	if(this.freezeSize===true) { this.setSize(); }
	this.element.style.visibility = "visible";
	var t = this;
	if(this.type == 'n') {
		this._array = this.getTextNodes().slice(0);
		this._index = this._array.length-1;
		this.interval = window.setInterval(function(){t.unspellWordsN.call(t);},speed);
	} else if(this.type === 'r') {
		this._array = this.getTextNodes().slice(0);
		this._index = 0;
		this.interval = window.setInterval(function(){t.unspellWordsR.call(t);},speed);
	} else {
		throw new TypeError('Invalid AnimaText() argument : if unit = w, type must be n or r');
	}
	this._waiting = null;
	this._inprog = true;
}

AnimaText.prototype.spell = function() {
	this.action = 'spell';
	if(typeof this.delay === 'number') {
		var delay = this.delay;
	} else {
		throw new TypeError('Invalid AnimaText() argument : delay must be a number');
	}
	
	if(this.interval !== undefined) { clearInterval(this.interval); }
	var t = this;	
	if(this.unit=="c") {
		this.timeout = window.setTimeout(function(){t.spellCharacters();},t.delay);
	} else if(this.unit=="w") {
		this.timeout = window.setTimeout(function(){t.spellWords();},t.delay);
	} else if(this.unit=="s") {
		this.timeout = window.setTimeout(function(){t.spellSentences();},t.delay);
	} else if(this.unit=="a") {
		return this.spellAll();
	} else {
		throw new TypeError('Invalid AnimaText() argument : unit must be c, w, s or a');
	}
	this._waiting = true;
}; 

AnimaText.prototype.unspell = function() {
	this.action = 'unspell';
	if(typeof this.delay === 'number') {
		var delay = this.delay;
	} else {
		throw new TypeError('Invalid AnimaText() argument : delay must be a number');
	}
	
	if(this.interval !== undefined) { clearInterval(this.interval); }
	
	var t = this;	
	if(this.unit=="c") {
		this.timeout = window.setTimeout(function(){t.unspellCharacters();},t.delay);
	} else if(this.unit=="w") {
		this.timeout = window.setTimeout(function(){t.unspellWords();},t.delay);
	} else {
		throw new TypeError('Invalid AnimaText() argument : unit must be c or w');
	}
	this._waiting = true;
};
  
AnimaText.prototype.stop = function() {//clear
	if(this._waiting === true) {
		window.clearTimeout(this.timeout);
		this._waiting = null;
	}
	if(this._inprog === true) {
		window.clearInterval(this.interval);
		this._inprog = null;
	}
}

AnimaText.prototype.pause = function() {//clear
	if(this._waiting === true) {
		window.clearTimeout(this.timeout);
		this._waiting = false;
	}
	if(this._inprog === true) { 
		window.clearInterval(this.interval);
		this._inprog = false;
	}
}

AnimaText.prototype.resume = function() {//start, no init
	if(this._waiting === false) {
		if(this.action === 'spell') {
			this.spell();
		} else if(this.action === 'unspell') {
			this.unspell();
		}
		return;
	}
	if(this._inprog !== false) { return; }
	
	var t = this;
	if(this.action == 'spell') {
		if(this.unit == 'c') {
			var speed = this.duration/this.count.characters;
			if(this.type == 'n') {
				this.interval = window.setInterval(function(){t.spellCharactersN.call(t);},speed)
			} else if(this.type == 'r') {
				this.interval = window.setInterval(function(){t.spellCharactersR.call(t);},speed);
			} else if(this.type === 'm') {
				this.interval = window.setInterval(function(){t.spellCharactersM.call(t);},speed);
			} else if(this.type === 'e') {
				this.interval = window.setInterval(function(){t.spellCharactersE.call(t);},speed);
			}
		} else if(this.unit == 'w') {
			var speed = this.duration/this.count.words;
			if(this.type == 'n') {
				this.interval = window.setInterval(function(){t.spellWordsN.call(t);},speed);
			} else if(this.type == 'r') {
				this.interval = window.setInterval(function(){t.spellWordsR.call(t);},speed);
			}
		} else if(this.unit == 's') {
			var speed = this.duration/this.count.sentences;
			if(this.type == 'n') {
				this.interval = window.setInterval(function(){t.spellSentencesN.call(t);},speed);
			}
		}
	} else if(this.action == 'unspell') {
		if(this.unit == 'c') {
			var speed = this.duration/this.count.characters;
			if(this.type == 'n') {
				this.interval = window.setInterval(function(){t.unspellCharactersN.call(t);},speed);
			} else if(this.type == 'r') {
				this.interval = window.setInterval(function(){t.unspellCharactersR.call(t);},speed);
			} else if(this.type === 'm') {
				this.interval = window.setInterval(function(){t.unspellCharactersM.call(t);},speed);
			} else if(this.type === 'e') {
				this.interval = window.setInterval(function(){t.unspellCharactersE.call(t);},speed);
			}
		} else if(this.unit == 'w') {
			var speed = this.duration/this.count.words;
			if(this.type == 'n') {
				this.interval = window.setInterval(function(){t.unspellWordsN.call(t);},speed);
			} else if(this.type == 'r') {
				this.interval = window.setInterval(function(){t.unspellWordsR.call(t);},speed);
			}
		}
	}
	
	this._inprog = true;
}

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
		//use of eval : options must be defined in global scope
		var animatext = new AnimaText(this.elements[i],eval(this.elements[i].getAttribute("data-animatext")));
		if(animatext.freezeSize===true) { animatext.setSize(); }
		//if unit = a or action = unspell : no emptyNodes
		if(animatext.action != 'unspell' && animatext.unit != 'a') { animatext.emptyNodes(); }
		array.push(animatext);
	}

	return array;
}
//gets array (sorted by order) of arrays (bunches containing texts of same order)
Speller.prototype.sortAnimatexts = function(texts) {
	var array = [];
	var max=0;
	
	for(i = 0; i<texts.length ; i++) {//in case of non consecutive order numbers : get max order number
		texts[i].order > max ? max = texts[i].order : max = max;
	}

	var i=0;

	while(i < max) {//sort by order number and put texts of same order number together in same array (bunch)
		var items = [];
		
		for(var j=0 ; j<texts.length; j++) {
			if(texts[j].order == i + 1) {
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
	var longest = array[0];
	
	if(array.length > 1) {
		for(var i=1 ; i<array.length ; i++) {
			if(array[i].duration + array[i].delay > longest.duration + longest.delay) {
				longest = array[i]
			}
		}
	}
	
	return longest;
}

Speller.prototype.launch = function(texts) {
	var instance = this;
	
	if(texts[0]) {//always deal with the first bunch of texts if there's one left
		var bunch = texts[0];
		if(texts.length > 1) {//if bunch is the last, no next
			var longest = this.longest(bunch);
			longest.next = function() {//attach function 'next' to longest in total duration 
				instance.launch(texts);//will call the next bunch
			}
		}
			
		for(var i=0; i<bunch.length; i++) {//launch animation for all animatexts of the bunch
			if(bunch[i].action=='spell') {
				bunch[i].spell();
			} else if (bunch[i].action=='unspell') {
				bunch[i].unspell();
			} else {
				throw new TypeError('Invalid speller argument : action must be spell or unspell');
			}
			this.current = bunch;
		}
		
		texts.splice(0,1);//remove bunch dealt with	
	}
}

Speller.prototype.start = function() {
	var queue = this.sortedAnimatexts.slice(0);
	this.launch(queue);
}

Speller.prototype.stop = function() {
	for(var i=0; i<this.current.length; i++) {
		this.current[i].stop();
	}
}

Speller.prototype.pause = function() {
	for(var i=0; i<this.current.length; i++) {
		this.current[i].pause();
	}
}

Speller.prototype.resume = function() {
	for(var i=0; i<this.current.length; i++) {
		this.current[i].resume();
	}
}
