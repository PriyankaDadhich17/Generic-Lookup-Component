({
    
    /* Executes the search server-side action when the packnew:InputLookupEvt is thrown */
    handleInputLookupEvt: function(component, event, helper){
        
        if(!event.getParam('recordSelected')) {
            
            helper.searchAction(component, event.getParam('searchString')); 
        }
    },
    
    /* Loads the typeahead component after JS libraries are loaded */
    initTypeahead : function(component, event, helper){
        //first load the current value of the lookup field and then
        //creates the typeahead component
        helper.loadFirstValue(component);
    },
    
    disableButton : function(component, event, helper){
        var nAgt = navigator.userAgent;
        if (nAgt.indexOf("Firefox") !== -1) {
            if(event.target.value.length < 2){
                var disableButton = $A.get("e.packnew:InputLookupEvt");
                disableButton.setParams({"disableButton":true});
                disableButton.fire();
            }
        }
        else{
            if(event.srcElement.value.length < 2){
                var disableButton = $A.get("e.packnew:InputLookupEvt");
                disableButton.setParams({"disableButton":true});
                disableButton.fire();
            }
        }
    }
})