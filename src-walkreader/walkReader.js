/**
 * WalkParser.js
 * Parses a walk file and put all variables found in a list.
 */
try {
importClass(java.io.BufferedReader);
importClass(java.io.FileReader);
} catch(ex) {}


/**
 * 
 */
function WalkReader() {
	
	/**
	 * varBag contains the variables extracted from the walk. It is an array of array. 
	 *    Values can be accessed like: 
	 *        var myval = this.varBag["signalHighlightAlarmDevices"][3].
	 *    Values can also be keyed on a string. Example:
	 *        var myval = this.variables["signalHighlightAlarmDevices"]["EM187"].
	 */
	
	this._curBag; // current bag
	this._bags = [];
    
	/**
	 * Select the current bag.
	 */
    this.selectBag = function(bagname) {
    	if (!bagname) {
    		this._curBag = this._bags["_TOP_"];
    	}
		this._curBag =  this._bags[bagname];;
	};
	
	/**
	 * Get this variable.
	 */
	this.get = function(varName, key) {
		return this._curBag.get(varName, key);
	};
	
	/**
	 * Get values for variable in the form of an object.
	 * @return array containing values, or undefined if not found.
	 */
	this.getAll = function(varName) {
		return this._curBag.getAll(varName);
	};
	this.getAllInArray = function(varName) {
		return this._curBag.getAllInArray(varName);
	};
	
	/**
	 * Add this bag to my bags.
	 * Also set the curBag to it.
	 */
	this._addBag = function(bag) {
		this._bags[bag.name] = bag;
		this._curBag = bag;
	};
	
    
    /**
     * Read this walk file and store variables in my _bags.
     * 
     * @param fileName
     * @returns nothing
     */
    this.read = function(fileName) {
        
        var lineNo = 0;
        var toplevelBag = new BagOfVariables("_TOP_"); 
        this._addBag(toplevelBag);// defaults to toplevel bag
        var bagStack = []; // push when we START a new bag, and pop when we END a bag
        bagStack.push(toplevelBag);// first bag
        
        try {
            var fileReader = new FileReader(fileName);
            var br = new BufferedReader(fileReader);
            var curline;
            while (curline = br.readLine()) {
                lineNo++;
                var jsLine = "";
                jsLine = curline + "";// convert to a js string
                
                if (lineNo % 100 == 0) {
                    //print(lineNo);// + ". " + jsLine);
                    //print(lineNo + ". " + jsLine);
                }
                parseline(this, jsLine, bagStack, lineNo);
            }

        } catch (e) {
            log.error("Error at line " + lineNo + " of " + fileName + ":" + e);
        }
    }; 
    
    this.readSuperBIGString = function(bigString) {
        
        var lineNo = 0;
        var toplevelBag = new BagOfVariables("_TOP_"); 
        this._addBag(toplevelBag);// defaults to toplevel bag
        var bagStack = []; // push when we START a new bag, and pop when we END a bag
        bagStack.push(toplevelBag);// first bag
        
        var lines = bigString.split("\n");
        
        try {
            var curline;

            for (var i = 0; i < lines.length; i++) {
            //while (curline = br.readLine()) {
                lineNo = i + 1;
                curline = lines[i];
                var jsLine = "";
                jsLine = curline + "";// convert to a js string
                
                if (lineNo % 100 == 0) {
                    //print(lineNo);// + ". " + jsLine);
                    log.debug(lineNo + ". " + jsLine);
                }
                parseline(this, jsLine, bagStack, lineNo);
            }

        } catch (e) {
            log.error("Error at line " + lineNo + " of " + fileName + ":" + e);
        }
    }; 
    
    this.toString = function() {
   	 var ret = "";
    	for (key in this._bags) {
    		var bag = this._bags[key];
    		ret += (ret ? ", ":"") + bag.toString();
   		
    	}
    	return "current:" + this._curBag.name + ", bags:" + ret;
    };
    
    /**
     * A line contains something like this:
     *   numberOfSignals.0:-->2
     *   signalSummary.1:-->0
     *   signalSummary.2:-->0
     *   signalMajorAlarmDevices.1:-->abc
     *   signalMajorAlarmDevices.2:-->abc
     *   signalHighlightAlarmDevices.1:-->abc
     *   signalHighlightAlarmDevices.2:-->abc
     *   signalName.1:-->Signal Numero Uno
     *   signalName.2:-->Signal Numero Dos
     *   @return none.
     */
    function parseline(reader, line, bagStack, lineNo) {
    	
    	/**
    	 * Process the command line
    	 * "[>>    START   BAG_A \"This is the bag of variables that will be loaded at point T2\" ";
    	 */
    	if (line.indexOf("[>>") == 0) {
    		processCommand(reader, bagStack, line, lineNo);
    		log.warn(reader.toString());
    		return;
    	}
    	
        var lineRegex = /(.*):-->(.*)/;
        var extract = lineRegex.exec(line);
        if (!extract) return;
        
        
        // example line: "pncPlatformSystemDate.0:-->abc"
        var fullVariable = extract[1]; // 'pncPlatformSystemDate.0'
        var value = extract[2]; // 'abc'

        /**
         * Extract variable name: "pncPlatformSystemDate" from "pncPlatformSystemDate.0"
         */
        var varRegex = /(\w*)\.(.*)/; // \w means 'alphanumeric character'. Extracts 'myVar' out of 'myVar.0.1.2.3'
        var varExtract = varRegex.exec(fullVariable);
        if (!varExtract) {
            throw "Line cannot be parsed: " + line;
        }

        var varName = varExtract[1];
        var dsv = varExtract[2]; // dsv, dot separated value, like '0.11.22.33' from 'myVar.0.11.22.33'
        
        
        /**
         * Put variable in variable list
         */
        var bagVars = reader._curBag.vars[varName];
        if (!bagVars) {
        	bagVars = {};// still empty: create object to store variables (Note: we create an Object, not an Array)
        	reader._curBag.vars[varName] = bagVars;
        }
        
        // check if key already exist
        if (bagVars[dsv]) {
        	throw "Variable " + varName + " has duplicate key '" + dsv + "'. Line " + lineNo;  
        }      
        
        bagVars[dsv] = value; // store value at key dsv
        //print(reader.toString());
    }
    
    /**
     * Process a command line, i.e. a line starting with "[>>".
     * Actions can be START or END, or no action.
     */
    function processCommand(reader, bagStack, line, lineNo) {
		
		// find and remove comment 
		var posComment = line.indexOf('--');
		if (posComment != -1) { 
			line = line.substring(0, posComment); // remove comment part '[>> xxx -- comment' -to-> '[>> xxx' 
		}
		
		line = trimStr(line);
		
		var parts = line.split(/\s+/);
		parts.splice(0, 1);// remove the '[>>' 
		
		if (parts.length == 0) { // nothing to do
			return;
		}
		
		var action = parts[0];// action can be "START" or "END"
		
		/**
		 * Process the command.
		 * Current valid are 'START' and 'END'.
		 */
		// Example "[>> START BAG_B extends BAG_A"
		if (action.toUpperCase() == "START") {
			var bagName = parts[1];
			var newBag = new BagOfVariables(bagName);
			reader._addBag(newBag);
			bagStack.push(newBag);
			
			if (parts[2] && parts[3]) {
				var parentName = parts[3];
				var parent = reader._bags[parentName];
				if (!parent) {
					throw "Line " + lineNo + ". Parent " + parentName + " of bag " + bagName + " not found!";
				}
				newBag.parent = parent;
			}
		} else if (action == "END") {
			// Exit this current bag and 
			// use the easy route: Simply go to the top level
			var endedBag = bagStack.pop();
			if (!endedBag) {
				throw "Line " + lineNo + "of walk. Stack empty at END command. Too many END statements ?";
			}
			reader._curBag = bagStack[bagStack.length - 1];// set current
		} else {
			throw "Unknown command " + action + " at line " + lineNo;
		}
    }
}

/**
 * Holder of variables.
 * Bags are hierarchical.
 */
function BagOfVariables(name, parent) {
	this.name = name;
	this.parent = parent;// parent bag name
	this.vars = {};
	
	/**
	 * find this variable. 
	 * Go up the parent chain until found or no more parent.
	 */
    this.getOLD = function(varName, key) { 
        var bag = this;
        while (bag) {
            if (bag.vars[varName] && bag.vars[varName][key]) {
                return bag.vars[varName][key];
            }   
            bag = bag.parent;// find parent
        }
        return undefined;
    };
    
    this.get = function(varName, key) { 
        key = key ? key : 0;
        var bag = this;
        while (bag) {
            if (bag.vars[varName] && bag.vars[varName][key]) {
                return bag.vars[varName][key];
            }   
            bag = bag.parent;// find parent
        }
        return undefined;
    };
    
	/**
	 * Get all values of this variable. If bag inherits, add its parent's variable values too.
	 * For now, we do a clone of the variables.
	 */
	this.getAll = function(varName) {
		var vals = undefined;
		/**
		 * TODO: To do this in recursive manner!!
		 */
		if (this.parent && this.parent.vars[varName]) {
			vals = mergeObj({}, this.parent.vars[varName]);
		}
		
		if (this.vars[varName]) {
			return mergeObj(vals ? vals:{}, this.vars[varName]);
		}
		return vals;
	};
	
	this.getAllInArray = function(varName) {
		var vals = this.getAll(varName);
		var arr = [];
		return copyIntoArray(arr, vals);
	};
	
	// copy all values for a variable into an array 
	function copyIntoArray(arr, obj) {
		if (!obj) return arr;
		for (key in obj) {
		    if (obj.hasOwnProperty(key)) {
		    	arr.push(obj[key]);
		    }
		}
		return arr;
	}
	

	// merge mergeObj into sourceObj objects
	function mergeObj(sourceObj, mergeObj) {
		if (!mergeObj) return sourceObj;
		for (key in mergeObj) {
			if (mergeObj.hasOwnProperty(key)) {
				sourceObj[key] = mergeObj[key];
			}
		}
		return sourceObj;
	}

	this.toString = function() {
		return this.name + (this.parent ? "-extends->" + this.parent.name:"") + ":" + arrayToString(this.vars);
	};
}

/**
 * Trim a string. See http://blog.stevenlevithan.com/archives/faster-trim-javascript.
 * @return Example " hello " -> "hello"
 */
function trimStr(str) {
    if (!str) return str;
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

/**
 * Return easy to read contents of an array. Example '[tom:111, b:[a:22, b:44], 2:[0:65, 1:57, 2:111]]'.
 * NOTE: This function does not work with associative array:
 * Works recursively.
 * NOTE: Need to understand why this function does not work with this form:
 *    var myvar = []; // note the [] instead of {}
 *    myvar['.1'] = 22;
 *    myvar['.2.22'] = 44;
 *    print(arrayToString(myvar);
 * @param arr
 * @returns {String}
 */
function arrayToString(arr) {
	var retstr = "";
	for (key in arr) {
	    if (arr.hasOwnProperty(key)) {
	    	var mykey = key; // assign to another variable. Looks like a bug in Rhino
	    	var myval = arr[mykey];
	    	var valuestr = (myval instanceof Array ? "[" + myval+ "]" : (myval instanceof Object ? arrayToString(myval) : myval));
	    	retstr += (retstr ? ", ":"") + mykey + ":" + valuestr;
	    }
	}
	return "[" + retstr + "]";
}
