
gQ.start = function(){
    console.log(gQ('.article'));

    gQ.ticker().add(100, 4, function(){
        console.log("I'm called");
    });

};