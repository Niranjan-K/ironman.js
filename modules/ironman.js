var ironman =(function () {
    var configs = {
    };
	var log = new Log();
	var apis = {};
	var api_history ={};
    var module = function (user) {
    };
	function IronManException(message) {
	   this.message = message;
	   this.name = "IronManException";
	   log.error(message);
	}

    function mergeRecursive(obj1, obj2) {
        for (var p in obj2) {
            try {
                // Property in destination object set; update its value.
                if (obj2[p].constructor == Object) {
                    obj1[p] = MergeRecursive(obj1[p], obj2[p]);
                } else {
                    obj1[p] = obj2[p];
                }
            } catch (e) {
                // Property in destination object not set; create it and set its value.
                obj1[p] = obj2[p];
            }
        }
        return obj1;
    }
	
	function getUniqueId(fn){
		return fn.name;
	}
	
	function armor(fn, properties){
	  var managedFn = function(){
		if(properties.throttle){
			var histroy = api_history[getUniqueId(fn)];
			if(properties.throttle){
				if(!(histroy.throttle<properties.throttle)){
					throw new IronManException("Throttle limit reached");
				}
				histroy.throttle =histroy.throttle + 1;
			}
		}
	   	return fn.apply(this, arguments);
	  };
	  api_history[getUniqueId(fn)] = {throttle:0};
	  return managedFn;
	}
	function inject(fn, namespace, fnName){
		var space = apis[namespace];
		if(space==undefined){
			apis[namespace] = {};
			space =	apis[namespace];
		}
		if(fn.name =='' && fnName==undefined){
			throw new IronManException("Name was not defined for anonymous function");
		}
		if(fnName!=undefined){
			space[fnName] = armor(fn);
		}else{
			space[getUniqueId(fn)] = armor(fn);
		}
	}
	function call(fnName, namespace, arguments){
		var space = apis[namespace];
		if(!(arguments instanceof Array)){
			arguments = [arguments];
		}
		if(space==undefined){
			throw new IronManException("Namespace not found");
		}
		var fn = space[fnName];
		if(fn==undefined){
			throw new IronManException("Function not found in the namespace");
		}
		fn.apply(this, arguments);
	}
    // prototype
    module.prototype = {
        constructor: module,
        armor: armor,
		inject: inject,
		call: call
    };
    // return module
    return module;
})();