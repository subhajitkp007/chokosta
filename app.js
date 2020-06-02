let express = require('express');
let app = express();
let serv = require('http').Server(app);
 
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
 
serv.listen(process.env.PORT || 2000);
console.log("Server started.");
 
let SOCKET_LIST = {}; //clients
let games={}; //game data
let gameplayer={};
let io = require('socket.io')(serv,{});

io.sockets.on('connection', function(socket){
    for(let i=1000;i<10000;i+=1)
    {
        if(i in SOCKET_LIST)
        continue;
        else{
            socket.id=i;
            break;
        }
    }
    let randomnum=Math.random() * (10000 - 1000) + 1000;
    socket.gid=Math.ceil(randomnum);
    if(socket.gid in games)
    for(let i=socket.gid;i<20000;i++)
    {
        if(i in games)
        continue;
        else{
            socket.gid=i;
            break;
        }
    }
    //store socket details
    SOCKET_LIST[socket.id] = socket;

   // console.log('connectcted user =',socket.id,"game id",socket.gid);

    socket.emit("start",{'cid':socket.id,'gid':socket.gid});
    games[socket.gid]={};
    games[socket.gid].clients=[];
    
    socket.on('create',function(data){
        socket.gid=data.gid;
       // console.log("gameid",socket.gid);
        let gid=socket.gid;
        if(games[gid])
        {
            games[gid].maxplayer=data.maxplayer;
            games[gid].pos=data.pos;
            games[gid].ghutipos=data.ghutipos;
            games[gid].win=0;
            games[gid].namecreator=data.name;
            games[gid].clients=[];
            games[gid].clients.push(data.cid);
        }
        else
        {
            socket.emit('gamedeleted',data.pl1name);
        }
       
        
    });
   
    socket.on('join',function(data){
        delete games[socket.gid];
        let ac="not";
        if(data.gid in games)
        {
            if(games[data.gid] && games[data.gid].clients)
            if(games[data.gid].clients.length==1)
            {
                socket.gid=data.gid;
                games[data.gid].clients.push(data.cid);
                games[data.gid].namejoin=data.name;
                for(let i in games[data.gid].clients)
                    if(SOCKET_LIST[games[data.gid].clients[i]])
                    SOCKET_LIST[games[data.gid].clients[i]].emit('newjoin',data.name);
                //console.log(games[data.gid].clients);
                let ac="";
                if(games[data.gid])
                for(let i in games[data.gid].clients)
                    if(SOCKET_LIST[games[data.gid].clients[i]])
                    SOCKET_LIST[games[data.gid].clients[i]].emit('startgame',{'pid':"1",'gid':data.gid,
                    "pl1name":games[data.gid].namecreator,"pl3name":games[data.gid].namejoin});
                
            }
            else{
                socket.emit('fulljoined',"abcd");
            }
       // console.log("recieved game join request from",data.cid,ac,"accepted");
            
            
        }
        else{
            socket.emit('gamedeleted',data.pl1name);
        }
        //console.log("new join req from ",data.cid,"for ",socket.gid);
        
    });
    
    socket.on('movenotdone',function(data){
       // console.log('move not changed');
       //console.log('player ',data.ply,'recieved',data.boxes);
        if(games[data.gid])
        if(games[data.gid].clients)
        for(let i in games[data.gid].clients)
        if(SOCKET_LIST[games[data.gid].clients[i]])
            SOCKET_LIST[games[data.gid].clients[i]].emit('nextmove',data);
    });
    socket.on('diceupdate',function(data){
        let cid=0;
        if(data.ply==1)
        {
            data.ply=3;
            cid=1;
        }
        else
        {
            data.ply=1;
            cid=0;
        }
        if(games[data.gid]){
            if(games[data.gid].clients){
                for(let i=0;i<games[data.gid].clients.length;i++)
                if(SOCKET_LIST[games[data.gid].clients[i]])
                SOCKET_LIST[games[data.gid].clients[cid]].emit('diceupdate',data);
            }
        }
        
        
    });
    socket.on('movedone',function(data){
      // console.log('player ',data.ply,'recieved',data.boxes);
       let senddata={'ply':data.ply,'pos':data.pos,'g':data.g,'gid':data.gid,'boxes':data.boxes};
        let cid=0;
        if(data.ply==1)
        {
            senddata.ply=3;
            cid=1;
        }
        else
        {
            senddata.ply=1;
            cid=0;
        }
       // console.log('cliets are',games[data.gid].clients);
        if(games[senddata.gid])
        for(let i in games[senddata.gid].clients)
        if(SOCKET_LIST[games[senddata.gid].clients[i]])
            SOCKET_LIST[games[senddata.gid].clients[i]].emit('nextmove',senddata);
    });
    socket.on('complete',function(data){
       // console.log('successfully a game completed');
       if(games[data.gid])
       for(let i in games[data.gid].clients)
       if(SOCKET_LIST[games[data.gid].clients[i]])
           SOCKET_LIST[games[data.gid].clients[i]].emit('complete',data);
        delete games[data.id];
    });
    socket.on('chatmsg',function(data){
        // console.log('move not changed');
         if(games[data.gid])
         if(games[data.gid].clients)
         for(let i in games[data.gid].clients)
         if(SOCKET_LIST[games[data.gid].clients[i]])
             SOCKET_LIST[games[data.gid].clients[i]].emit('chatmsg',data);
     });
   //delete user  and game resolve memory issue
   socket.on('disconnect',function(){
   // console.log('disconnected',socket.id);
    delete SOCKET_LIST[socket.id];
   // console.log("deleteing game id",socket.gid);
    if(socket.gid in games)
    delete games[socket.gid];
    });
});
 
setInterval(function(){
    for(let i in SOCKET_LIST){
        let socket = SOCKET_LIST[i];
        socket.emit('update',games);
    }
},20000);
