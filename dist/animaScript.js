function AnimaScript(options)
{
    this.element = options.element;
	
    //options : default values
    options.type===undefined ? this.type = "n" : this.type = options.type;//types : r-everse, m-iddle, n-ormal (default)
    options.delay===undefined ? this.delay = 250 : this.delay = options.delay;//delay before spelling
    options.duration===undefined ? this.duration = 1000 : this.duration = options.duration;//duration of spelling (from which one gets speed)
    
    this.text = this.getCharacters();
    this.reversedText = this.text.reverse();
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
		return textNodes;//text nodes array(each text node is an object (properties : parent element, nodeIndex, value)
	};
	
	return getTextNodes(this.element);
}
	
AnimaScript.prototype.getCharacters = function() {//get array of characters
	var nodes = this.getTextNodes();
	var text = [];
	for(var i=0; i<nodes.length; i++)
	{
		for(var j=0; j<nodes[i].value.length; j++) {
			var character = {};
			character.value = nodes[i].value[j];//character
			character.element = nodes[i].parent;//parent element
			character.nodeIndex = nodes[i].nodeIndex;//node index
			text.push(character);
		}
	}
	return text;//array of characters (each character is an object (properties : parent element, nodeIndex, value)
};
    
AnimaScript.prototype.emptyNodes = function() {//emptying nodes
	var element = this.element;
	var nodes = this.getTextNodes();
	//set width/height/margin of element before getting it empty (not very good for performance) : 
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
	for(var i=0; i < nodes.length; i++)
	{
		//element empty
		nodes[i].parent.childNodes[nodes[i].nodeIndex].nodeValue = "";//for each text node, value = ""
	}
};
		
AnimaScript.prototype.spell = function(limit) {
	var limit;
	limit!==undefined ? limit = limit : limit = null;
	this.emptyNodes();
	//var text = this.text;
	var element = this.element;
	var delay = this.delay;
	var speed = this.duration/this.text.length;
	var type = this.type;
	var interval;
			
	if(type == "m") {//middle (type: m) : spells from
		var text = this.text;
		var index = Math.ceil(text.length/2)-1;//index backwards
		var indexF = index + 1;//index forwards
					
		window.setTimeout(function(){launchMiddle();},delay);
		
		function launchMiddle() {
			element.style.visibility = "visible";//visible before spelling
			interval = window.setInterval(function(){spellMiddle();},speed*2);//speed*2 because both functions are launched together
		}
		
		function spellMiddle() {//both functions are launched together. 
			spellMiddleBack();//one half
			spellMiddleForw();//the other half
		}
		
		function spellMiddleBack() {
			var character;
			if(index >= 0) {
				character = text[index];
				character.element.childNodes[character.nodeIndex].nodeValue = character.value + character.element.childNodes[character.nodeIndex].nodeValue;
				index -= 1;
			} else {
				window.clearInterval(interval);
			}
		}
		
		function spellMiddleForw() {
			var character;
			if(indexF <= text.length-1) {
				character = text[indexF];
				character.element.childNodes[character.nodeIndex].nodeValue += character.value;
				indexF += 1;	
			} else {
				window.clearInterval(interval);
			}
		}
		
	} else if(type == "r") {//reverse (type: r) from last character to the first
		var index = 0;
		var text = this.reversedText;
		
		window.setTimeout(function(){launchReverse();},delay);
		
		function launchReverse()
		{
			element.style.visibility = "visible";
			interval = window.setInterval(function(){spellReverse();},speed);
		}
		
		function spellReverse()
		{
			var character;
			if(index <= text.length-1)
			{
				character = text[index];
				character.element.childNodes[character.nodeIndex].nodeValue = character.value + character.element.childNodes[character.nodeIndex].nodeValue;
				index += 1;						
			}
			else
			{
				window.clearInterval(interval);
			}
		}
		
	} else {//normal (from first character to the last)
		var text = this.text;
		var index = 0;
		var loopLength;
		limit === null ? loopLength = text.length-1 : loopLength = limit;
										
		window.setTimeout(function(){launchNormal();},delay);
		
		function launchNormal()
		{
			element.style.visibility = "visible";
			interval = window.setInterval(function(){spellNormal();},speed);
		}
		
		function spellNormal()
		{
			var character;
			if(index <= loopLength)
			{
				character = text[index];
				character.element.childNodes[character.nodeIndex].nodeValue += character.value;
				index += 1;
			}
			else
			{
				window.clearInterval(interval);
			}
		}
	}
};
	

	
 
	
	

	





