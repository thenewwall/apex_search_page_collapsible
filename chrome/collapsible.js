/**
 * @global
 */
let observer;

/**
 * @function getApexVersion
 * @description Returns the APEX version.
 */
function getApexVersion(){
    abCssHref = $("link[rel='stylesheet'][href*='Core.min.css']").attr("href");
    abCssHrefVersion = abCssHref.substring( 
        abCssHref.indexOf("?v=") + "?v=".length
        );
        aVersion = abCssHrefVersion.split(".");
        // console.log("version:" + aVersion[0] + '.' + aVersion[1]);
        return aVersion[0] + '.' + aVersion[1];
}
    

/**
 * @function onChangeResultList
 * @description Configure the Mutation Observer to identigy any change on the search results.
 */
function onChangeResultList(){
    
    // Select the node that will be observed for mutations
    let targetNode = document.getElementById('search-container');
    // Options for the observer (which mutations to observe)
    let config = { childList: true, subtree: true };
    // Callback function to execute when mutations are observed
    let callback = function(mutationsList, observer){

        for(mutation of mutationsList){

            // console.log("onChangeResultList.callback");
            
            if (
                mutation.type == "childList"
                && mutation.target.className == "a-AlertMessages-list"
                && mutation.target.tagName == "UL"
                && mutation.addedNodes.length == 1
                && mutation.addedNodes[0].tagName == "LI"
                && mutation.addedNodes[0].className == "a-AlertMessages-item"
                && mutation.removedNodes.length == 1
                && mutation.removedNodes[0].tagName == "LI"
                && mutation.removedNodes[0].className == "a-AlertMessages-item"
            )
            {
                // console.log("require setCollapseSingleNode");
                let removedCollapsibleStatus = mutation.removedNodes[0].childNodes[1].childNodes[1].innerText;
                // console.log("removedCollapsibleStatus:" + removedCollapsibleStatus);
                let collapsibleStatus = (removedCollapsibleStatus == '[-]' ? 'not-collapsed' : 'collapsed');
                
                let aAttr = mutation.addedNodes[0].attributes;
                let aAttrTxt = '{';
                
                for(i=0; i<aAttr.length; i++){
                    // console.log(aAttr.item(i).name + ':' + aAttr.item(i).value);
                    aAttrTxt += '"' + aAttr.item(i).name + '":"' + aAttr.item(i).value + '"' + ((i < aAttr.length-1) ? ',' : '');
                }
                
                aAttrTxt += '}';
                let jsonAttr = JSON.parse(aAttrTxt);
                // console.log('jsonAttr:' + JSON.stringify(jsonAttr));
                setCollapseSingleNode(jsonAttr, collapsibleStatus);
            }
        }
    }
    // Create an observer instance linked to the callback function
    observer = new MutationObserver(callback);
    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
}


/**
 * @function setCollapseSingleNode
 * @param {object} jsonNode Json containing the properties to identify a search result
 * @param {string} collapsibleStatus status to be set in the search result
 * @description Identifies a search result, add the collapsible icon, collapse or expand the search result depending on the status and bind the doCollapse function to the click event.
 */
function setCollapseSingleNode(jsonNode, collapsibleStatus){
    
    let jqFilter = "[data-typeid='" + jsonNode["data-typeid"] + "']";
    jqFilter += "[data-componentid='" + jsonNode["data-componentid"] + "']";
    jqFilter += "[data-propertyid='" + jsonNode["data-propertyid"] + "']";
    // console.log("jqFilter:" + jqFilter);
    
    let linkText, classCollapsed;
    
    if (collapsibleStatus == 'collapsed'){
        linkText = '[+]';
        classCollapsed = 'collapsed';
    } else {
        linkText = '[-]';
        classCollapsed = 'not-collapsed';
    }
    
    $("div#search-container li.a-AlertMessages-item" + jqFilter).each( function (i){
        // console.log("function (i):" + i);
        // console.log("this:" + JSON.stringify(this));
        $(this).find("a.a-MediaBlock div.a-MediaBlock-graphic:first-child :not(a.collapsible)").each(
            function(j){
                // console.log("function (j):" + j);
                // console.log("this:" + JSON.stringify(this));
                $(this).parent()
                .before('<div class="a-MediaBlock-graphic"><a href="#" class="collapsible">' + linkText + '</a></div>');
                
                $(this).parent().parent()
                .find(".a-MediaBlock-content pre")
                .addClass(classCollapsed);
            }          
        );
    });
            
    $("div#search-container li.a-AlertMessages-item" + jqFilter + " a.collapsible").bind(
        "click",
        function (){
            doCollapse(this);
        }
    );
}
            

/**
 * @function setCollapse
 * @description For all the search results, add the collapsible icon, expand the search result  and bind the doCollapse function to the click event.
 */
function setCollapse(){
    // console.log("setCollapse!");

    $("div#search-container li.a-AlertMessages-item").each( function (i){
        $(this).find("a.a-MediaBlock div.a-MediaBlock-graphic:first-child :not(a.collapsible)").each( function(j){
            // console.log("function (j)");
            $(this).parent()
            .before('<div class="a-MediaBlock-graphic"><a href="#" class="collapsible">[-]</a></div>');
            
            $(this).parent().parent()
            .find(".a-MediaBlock-content pre")
            .addClass("not-collapsed");
        });
    });
            
    $("a.collapsible").bind(
        "click",
        function (){
            doCollapse(this);
        }
    );
}
            

/**
 * @function doCollapse
 * @param {object} e DOM-element Anchor that trigger the function.
 * @description Identify the search result based on the Anchor then collapse or expande it and set the new icon text. The mutation observer is disconnected at the beginning, then reconnected at the end.
 */
function doCollapse(e){
    // console.log("doCollapse");
    observer.disconnect();
    var eLink = $(e);
    
    eLink.parents("a").find("pre").each( function(x){
        var newClass;
        var elPre = $(this);
        
        if (elPre.hasClass("collapsed")){
            newClass = "not-collapsed";
        } else {
            newClass = "collapsed";
        }
        
        elPre.removeClass()
            .addClass(newClass);
    });
        
    if (eLink.text() == "[+]"){
        eLink.text("[-]");
    } else {
        eLink.text("[+]");
    }

    onChangeResultList();
}


/**
 * @function setAllCollpseOption
 * @description Insert the option Collapse all and Expand all on the search form. Bind the function to the click event.
 */
function setAllCollpseOption(){
    apexVersion = getApexVersion();

    if (apexVersion.substr(0,2) == "5." 
            || apexVersion.substr(0,3) == "18."
            || apexVersion.substr(0,4) == "19.1"
        )
    {
        $("div#search table[id^='apex_layout_'] tr:eq(1) td:last")
            .after(
                '<td align="left">'
                + '<div><a href="#" class="collapse-option collapse-all">[Collapse all]</a></div>'
                + '<div><a href="#" class="collapse-option collapse-none">[Expand all]</a></div>'
                + '</td>'
            );
    } else {
        $("div.a-Toolbar-pageColumn--searchOptions div.a-Form-fieldContainer:last-child")
            .after(
                '<div><a href="#" class="collapse-option collapse-all">[Collapse all]</a></div>'
                + '<div><a href="#" class="collapse-option collapse-none">[Expand all]</a></div>'
            );
    }

    $("a.collapse-option").each( function(){
        $(this).parent("div").addClass("collapse-option-container");
    });

    $("a.collapse-option").bind(
        "click",
        function (){
            // console.log("this:" + JSON.stringify(this));
            doCollapseOption(this);
        }
    );
}


/**
 * @function doCollapseOption
 * @param {object} e DOM-element Anchor that triggered the function.
 * @description For all the search results, collapse or expande the search result and change the link text based on the Anchor clicked. 
 */
function doCollapseOption(e){
    var newText, class2add, class2remove;
    // console.log("doCollapseOption");
    
    if ($(e).hasClass("collapse-all")){
        // console.log("has collapse-all");
        newText = "[+]";
        class2add = "collapsed";
        class2remove = "not-collapsed";

    } else if ($(e).hasClass("collapse-none")){
        // console.log("has collapse-none");
        newText = "[-]";
        class2add = "not-collapsed";
        class2remove = "collapsed";
    }

    $("a.collapsible").text(newText);

    $("div.a-MediaBlock-content pre").each( function (j){
        $(this).removeClass(class2remove);
        $(this).addClass(class2add);
    });
}

/**
 * @event document#ready
 * @description Bind the function setCollapse to the change event of the Search text box. Also, call the functions to add the Menu options and configure mutation observer.
 */
$(document).ready( function(){
    // console.log("document ready");
    $("input#P4500_LOCAL_SEARCH").bind(
        "change",
        function(e){
            // console.log("change");
            setTimeout(
                function(){
                    setCollapse();
                }
                ,50
            );
        }
    );

    setAllCollpseOption();
    onChangeResultList();
});