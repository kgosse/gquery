(function(scope){
    var version = 1.0001;
    var doc = scope.document;
    var q;

    var gQ = function(selector, context){
        return q.query(selector, context);
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
            q = new NativeQuery();
            gQ.start();
        }
        else{
            gQ.loadJS('js/sizzle.min.js', function(){
                q = new SizzleAdapter(Sizzle);
                gQ.start();
            });
        }
    });

    NativeQuery = function(){};
    NativeQuery.prototype.query = function(selector, context){
        context = context || doc;
        return context.querySelectorAll(selector);
    };

    SizzleAdapter = function(lib){this.lib=lib;};
    SizzleAdapter.prototype.query = function(selector, context){
        context = context || doc;
        return this.lib(selector, context);
    };

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
