(function(scope){
    var version = 1.0001;
    var doc = scope.document;
    var q;

    var gQ = function(selector, context){
        return q(selector);
    };
    gQ.loadJS = function(path, callback){
        var js = doc.createElement('script');
        js.src = path;
        js.type = 'text/javascript';
        js.onload = function(){
            callback();
            this.onload = this.onreadystatechange = null;
        };

        js.onreadystatechange = function(){
            if(this.readState == 'complete'){
                this.onload();
            }
        };
        doc.getElementsByTagName('head')[0].appendChild(js);
    };
    gQ.start = function(){};
    gQ.version = function(){
        return version;
    };

    gQ.ready = function(fun){
        var last = scope.onload;
        var isReady = false;

        if(doc.addEventListener){
            doc.addEventListener('DOMContentLoaded', function(){
                console.log("DOM is loaded");
                isReady = true;
                fun();
            });
        }

        scope.onload = function(){
            if (last) last();

            if(isReady) fun();
        }
    };


    gQ.ready(function(){
        if(doc.querySelectorAll && doc.querySelectorAll("body:first-of-type")){
            q = function(parm){
                return doc.querySelectorAll(parm);
            };
            gQ.start();
        }
        else{
            gQ.loadJS('js/sizzle.min.js', function(){
                q = Sizzle;
                gQ.start();
            });
        }
    });

    if(!scope.gQ)
        scope.gQ = gQ;
    else
    {
        if(scope.gQ.version)
            scope.gQ = scope.gQ.version() > version ? scope.gQ : gQ;
        else
            throw new Error("gQ is not defined!");
    }

}(window));
