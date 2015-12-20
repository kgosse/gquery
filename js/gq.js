(function(scope){
    var version = 1.0001;
    var doc = scope.document;
    var q;

    var gQ = function(selector, context){
        return q.query(selector, context);
    };

    gQ.toArray = function(item){
        var len = item.length;
        var out = [];
        if (len>0){
            for (var i = 0; i < len; ++i)
                out[i] = item[i];
        }
        else
            out[0] = item;
        return out;
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
        if('jQuery' in scope){
            q = new JQueryAdapter(scope.jQuery, doc);
        }
        else if(doc.querySelectorAll && doc.querySelectorAll("body:first-of-type")){
            q = new NativeQuery(doc);
            gQ.start();
        }
        else{
            gQ.loadJS('js/sizzle.min.js', function(){
                q = new SizzleAdapter(Sizzle);
                gQ.start();
            });
        }
    });

    NativeQuery = function(context){this.context = context;};
    NativeQuery.prototype.query = function(selector, context){
        context = context || this.context;
        return new NateiveQuery(gQ.toArray(context.querySelectorAll(selector)));
    };
    NativeQuery.prototype.text = function(value){
        var innerText = (this.context[0].innerText === undefined) ? 'textContent' : 'innerText';
        for (var item in this.context)
            this.context[item][innerText] = value;
        return (value);
    };
    SizzleAdapter = function(lib){this.lib=lib;};
    SizzleAdapter.prototype.query = function(selector, context){
        context = context || doc;
        return gQ.toArray(this.lib(selector, context));
    };

    JQueryAdapter = function(lib, context){
        this.lib=lib;
        this.context = context;
        this.target = lib(context);
    };
    JQueryAdapter.prototype.query = function(selector, context){
        context = context || doc;
        return new JQueryAdapter(this.lib, this.lib(selector, context).get());
    };
    JQueryAdapter.prototype.text = function(value){
        return this.target.text(value);
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
