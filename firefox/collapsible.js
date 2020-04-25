function getApexVersion(){
    abCssHref = $("link[rel='stylesheet'][href*='Core.min.css']").attr("href");
    abCssHrefVersion = abCssHref.substring( 
        abCssHref.indexOf("?v=") + "?v=".length
    );
    aVersion = abCssHrefVersion.split(".");
    console.log("version:" + aVersion[0] + '.' + aVersion[1]);
    return aVersion[0] + '.' + aVersion[1];
}

function setCollapse(){
    console.log("setCollapse!");
    $("div#search-container li.a-AlertMessages-item").each(
        function (i){
            $(this).find("a.a-MediaBlock div.a-MediaBlock-graphic:first-child :not(a.collapsible)").each(
                function(j){
                    console.log("function (j)");
                    $(this).parent()
                        .before('<div class="a-MediaBlock-graphic"><a href="#" class="collapsible">[-]</a></div>');

                    $(this).parent().parent()
                        .find("a.a-MediaBlock-content pre")
                        .addClass("not-collapsed");
                }          
            );
        }
    );

    $("a.collapsible").bind(
        "click",
        function (){
            doCollapse(this);
        }
    );

}

function doCollapse(e){
    console.log("doCollapse");
    var eContent = $(e).parent().parent().find("div.a-MediaBlock-content pre");

    if ($(eContent).hasClass("collapsed")){
        $(eContent).addClass("not-collapsed");
        $(eContent).removeClass("collapsed");
    } else {
        $(eContent).addClass("collapsed");
        $(eContent).removeClass("not-collapsed");
    }

    if ($(e).text() == "[+]"){
        $(e).text("[-]");
    } else {
        $(e).text("[+]");
    }
}

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
                + '<div><a href="#" class="collapse-option collapse-none">[Collapse none]</a></div>'
                + '</td>'
            );
    } else {
        $("div.a-Toolbar-pageColumn--searchOptions div.a-Form-fieldContainer:last-child")
            .after(
                '<div><a href="#" class="collapse-option collapse-all">[Collapse all]</a></div>'
                + '<div><a href="#" class="collapse-option collapse-none">[Collapse none]</a></div>'
            );
    }


        
    $("a.collapse-option").each(
        function(){
            $(this).parent("div").addClass("collapse-option-container");
        }
    );

    $("a.collapse-option").bind(
        "click",
        function (){
            // console.log("this:" + JSON.stringify(this));
            doCollapseOption(this);
        }
    );

}

function doCollapseOption(e){
    var newText, class2add, class2remove;
    console.log("doCollapseOption");
    
    if ($(e).hasClass("collapse-all")){
        console.log("has collapse-all");
        newText = "[+]";
        class2add = "collapsed";
        class2remove = "not-collapsed";

    } else if ($(e).hasClass("collapse-none")){
        console.log("has collapse-none");
        newText = "[-]";
        class2add = "not-collapsed";
        class2remove = "collapsed";
    }

    $("a.collapsible").text(newText);

    $("div.a-MediaBlock-content pre").each(
        function (j){
            $(this).removeClass(class2remove);
            $(this).addClass(class2add);
        }
    )
}

$(document).ready(function() {
    console.log("document ready");
    $("input#P4500_LOCAL_SEARCH").bind(
        "change",
        function(e){
            console.log("change");
            setTimeout(
                function(){
                    setCollapse();
                }
                ,50
            )
        }
    );

    setAllCollpseOption();
});