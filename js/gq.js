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

    gQ.ticker = function(){
        return Ticker.getInstance();
    };

    gQ.ready = function(fun){
        var last = scope.onload;
        var isReady = false;

        if(doc.addEventListener){
            doc.addEventListener('DOMContentLoaded', function(){
                console.log("DOM is loaded");
                isReady = true;
            });
        }

        scope.onload = function(){
            if (last) last();

            if(isReady) fun();
        }
    };


    gQ.ready(function(){
        if('jQuery' in scope){
            q = QueryFacade.create(JQueryAdapter, scope.jQuery, doc);
        }
        else if(doc.querySelectorAll && doc.querySelectorAll("body:first-of-type")){
            q = QueryFacade.create(NativeQuery, null, doc);
            gQ.start();
        }
        else{
            gQ.loadJS('js/sizzle.min.js', function(){
                q = QueryFacade.create(SizzleAdapter, Sizzle, doc);
                gQ.start();
            });
        }
    });

    QueryFacade = function(adapter){
        var dom = function(){
            return adapter.context;
        };
        var query = function(selector, context){
            return new QueryFacade(adapter.query(selector, context));
        };

        var text = function(value){
            return adapter.text(value);
        };

        return {
            dom:   dom,
            query: query,
            text:  text
        };
    };

    QueryFacade.create = function(adapter, lib, context){
        return QueryFacade(new adapter(lib, context));
    };

    NativeQuery = function(lib, context){this.context = context;};
    NativeQuery.prototype.query = function(selector, context){
        context = context || this.context;
        return new NativeQuery(null, gQ.toArray(context.querySelectorAll(selector)));
    };
    NativeQuery.prototype.text = function(value){
        var innerText = (this.context[0].innerText === undefined) ? 'textContent' : 'innerText';
        for (var item in this.context)
            this.context[item][innerText] = value;
        return (value);
    };
    SizzleAdapter = function(lib, context){
        this.lib = lib;
        this.context = context;
    };
    SizzleAdapter.prototype.query = function(selector, context){
        context = context || this.context;
        return new SizzleAdapter(this.lib, gQ.toArray(this.lib(selector, context)));
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


    var Ticker = (function(){
        var instance;

        function create(){
            var intervalID;
            var currentInterval = 0;
            var maxInterval = 0;
            var index = 0;
            var sensitivity = 100;
            var methods = {};

            function add(interval, times, callback, name){
                var realInterval = interval - interval % sensitivity;
                maxInterval = Math.max(realInterval, maxInterval);
                name = name || (++index);

                if(!methods[realInterval])
                    methods[realInterval] = {};
                methods[realInterval][name] = {
                    times: times,
                    callback: callback,
                    interval: interval
                };

                start();
            }

            function start(){
                if (!intervalID)
                    intervalID = setInterval(runInterval, sensitivity);

                for (var interval in  methods)
                    if ((currentInterval % interval) == 0)
                        processIntervalGroup(methods[interval]);
            }

            function runInterval(){
                currentInterval = currentInterval % maxInterval;
                currentInterval += sensitivity;
            }

            function processIntervalGroup(group){
                var item;
                for (var name in group){
                    item = group[name];

                    item.callback();

                    if (item.times == 0){
                        delete  group[name];
                    }
                    else{
                        --item.times;
                    }
                }
            }

            return {add: add};
        }

        return {
            getInstance: function(){
                if (!instance)
                    instance = create();
                return instance;
            }
        }
    })();

    function EventDispatcher(o){
        var list = {};

        o.addEvent = function(type, listener){
            if (!list[type])
                list[type] = [];
            if (list[type].indexOf(listener) == -1)
                list[type].push(listener);
        };

        o.dispatchEvent = function(e){
            var a = list[e.type];
            if (a){
                if (!e.target)
                    e.target = this;
                for (var index in a){
                    a[index].call(e.target, e);
                }
            }
        };
    }

    var o = {};
    EventDispatcher(o);

    o.addEvent('tick', function(e){
        console.log("a tick just happend", e.target, e.type);
        console.log(this == o, this, o);
    });

    o.dispatchEvent({type: 'tick', target: o});

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
