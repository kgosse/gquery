var q;

window.onload = function(){
    console.log("window is loaded.");
};

addOnReady(function(){
    console.log("2 window is loaded.");
});

addOnReady(function(){
    console.log("3 window is loaded.");

    if(document.querySelectorAll && document.querySelectorAll("body")[0])
        q = function(parm){
            return document.querySelectorAll(parm);
        };
});

