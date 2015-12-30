
gQ.start = function(){
    console.log(gQ('.article'));

    var ticker = gQ.ticker();
    ticker.add(100, 4, function(){
        console.log("I'm called");
    });


    var count = 0;
    ticker.addEvent('tick', onTick);


    function onTick(e){
        ++count;
        console.log("a tick just happend", count);
        e.target.removeEvent('tick', onTick);
    }

};