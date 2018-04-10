({
    //typeahead already initialized
    typeaheadInitStatus : {},
    //"old value" to trigger reload on "v.value" change
    typeaheadOldValue : {},
    //suggestione function returned after a successful match
    cb: null,
    search: {"isStarted":false},
    
    /* Creates the typeahead component using RequireJS, jQuery, Bootstrap and Bootstrap Typeahead */
    createTypeaheadComponent: function(component){
        
        var self = this;
        var globalId = component.getGlobalId();
        //loading libraries sequentially
        var inputElement = jQuery('[id="'+globalId+'_typeahead"]');
        //init the input element
        inputElement.val(component.get("v.nameValue"));
        
        //handles the change function
        inputElement.keyup(function(){
            if(inputElement.val() !== component.get('v.nameValue')){
                component.set('v.nameValue',inputElement.val());
                component.set('v.value', null);
            }
        });

        //inits the typeahead
        inputElement.typeahead({
            hint: false,
            highlight: true,
            minLength: 2,
        },
		{
			name: 'objects',
            displayKey: 'value',
            source: function(q,cb){

                self.cb = cb;
                q = (q || '').replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
                var compEvent = component.getEvent("inputLookupEvent");
                compEvent.setParams({"searchString" : q,"recordSelected" : false});
                compEvent.fire();
                
                if(!self.search.isStarted) {
                    
                    self.search.isStarted = true;
                    var disableButton = $A.get("e.packnew:InputLookupEvt");
                    disableButton.setParams({"disableButton":true});
                    disableButton.fire();
                }
            },
        })
        
        //selects the element
        .bind('typeahead:selected', 
			function(evnt, suggestion){
				console.log('@@ Option Selected: ' + suggestion.value + ' ' + suggestion.id);
                self.search.isStarted = false;
				try {
    				component.set('v.value', suggestion.id);
				}
				catch(err) {
					console.log('@@ Error: ' + err.message);
				}
				component.set('v.nameValue', suggestion.value);
                var compEvent = $A.get("e.packnew:InputLookupEvt");
                compEvent.setParams({"contactId" : suggestion.id,
                                     "recordSelected" : true,
                                     "disableButton":false});
                compEvent.fire();
	        });

    },
    
    /* Searches objects (server call) */
    searchAction : function(component, q){
        if(!component.isValid()) return;
        
        var self = this;
        var action = component.get("c.searchSObject");
        action.setParams({
            'type' : component.get('v.type'),
            'searchString' : q,
        });

        action.setCallback(this, function(a) {
            
            var state = a.getState();
            
            if (component.isValid() && state === "SUCCESS") {
             
                var result = a.getReturnValue();
                var matches, substrRegex;
                
                // an array that will be populated with substring matches
                var matches = [];
                
                // regex used to determine if a string contains the substring `q`
                var substrRegex = new RegExp(q, 'i');
                var strs = JSON.parse(result);
                
                // iterate through the pool of strings and for any string that
                // contains the substring `q`, add it to the `matches` array
                jQuery.each(strs, function(i, str) {
                    if (substrRegex.test(str.value)) {
						if(!str.value.toUpperCase().includes('INACTIVE')) {
							// the typeahead jQuery plugin expects suggestions to a
							// JavaScript object, refer to typeahead docs for more info
							matches.push({ value: str.value , id: str.id});
						}
                    }
                });
                if(!strs || !strs.length){
                    component.set('v.value', null);
                }
                self.cb(matches);
            } else {
                
                return $A.error('Unexpected error: '+a.error[0].message);
            }
        });
        $A.enqueueAction(action);
    },
    
    
    /* Method used on initialization to get the "name" value of the lookup */
    loadFirstValue : function(component) {
        
        //this is necessary to avoid multiple initializations (same event fired again and again)
        if(this.typeaheadInitStatus[component.getGlobalId()]){ 
			return;
        }
        
        this.typeaheadInitStatus[component.getGlobalId()] = true;
        this.loadValue(component);
           
    },
    
    /*
     * Method used to load the initial value of the typeahead 
     * (used both on initialization and when the "v.value" is changed)
     */
    loadValue : function(component, skipTypeaheadLoading){
        this.typeaheadOldValue[component.getGlobalId()] = component.get('v.value');
        var action = component.get("c.getCurrentValue");
        var self = this;
        action.setParams({
            'type' : component.get('v.type'),
            'value' : component.get('v.value'),
        });
        
        action.setCallback(this, function(a) {
            
            var state = a.getState();
            
            if (component.isValid() && state === "SUCCESS") {
             
                var result = a.getReturnValue();
                var globalId = component.getGlobalId();
                component.set('v.isLoading',false);
                component.set('v.nameValue',result || '');
                if(result)jQuery('[id="'+globalId+'_typeahead"]').val(result || '');
                if(!skipTypeaheadLoading) {
                    
                    self.createTypeaheadComponent(component);
                }
            }
        });
        $A.enqueueAction(action);
        
    }
})