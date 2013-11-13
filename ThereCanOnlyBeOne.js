/*
     >>>There Can Only Be One<<<
    --The RPG that plays itself--
 */

var TinyMassive = require('./TinyMassive');
var _ = require('underscore');
var async = require('async');
var names = require('./namegenerator').load(_);

var numPlayers = 10;
var numZones = 10;
var numWorlds = 10;
var numWarpsPerZone = 10;
var numMobsPerZone = 10;

function GenerateWorlds(){
    console.log('GenerateWorlds');
    //Generate Worlds
    async.eachLimit(new Array(numWorlds),10, function(item,callback){
        var w = TinyMassive.World(names.world());
        TinyMassive.UpdateWorld(w,function(err,reply){
            if(err)
                console.log('Add World Error: '+JSON.stringify(err));
            else
                console.log('Add World: '+JSON.stringify(w));
            callback(err);
        });
    },function(err){
        if(err)
            console.log('Add Worlds Error: '+JSON.stringify(err));
        else
        {
            console.log('Add Worlds complete!: ');
            TinyMassive.client.publish("Loading:"+TinyMassive.id,"Worlds");
        }

    });
};

function GenerateZones(){
    console.log('GenerateZones');

    //Generate Zones

    function GenerateSubZone(world,parentId,callback){
        var zone = TinyMassive.Zone(parentId);
        world.zones++;
        TinyMassive.UpdateZone(zone,function(err,reply){
            if(err)
                console.log('Add Zone Error: '+JSON.stringify(err));
            else{
                //Generate other Zones
                TinyMassive.UpdateWorld(world,function(err2,reply){
                    if(err2)
                        console.log('Update World Zones Counter Error: '+JSON.stringify(err2));
                    callback(zone);
                    console.log('Added Zone '+JSON.stringify(zone));
                });
            }
        });
    };

    //Generate Starter Zones
    TinyMassive.GetWorlds(true,function(worlds){
        async.eachLimit(worlds,10,function(world,callback){
            GenerateSubZone(world.value,world.value.id,function(zone){
                async.eachLimit(new Array(numZones),10, function(item,cb){
                    GenerateSubZone(world.value,zone.id,function(subzone){
                        zone.subzones++;
                        TinyMassive.UpdateZone(zone,function(err,reply){
                            cb();
                        });
                    });
                },function(err){
                    if(err)
                        console.log('Add SubZones Error: '+JSON.stringify(err));
                    else
                    {
                        console.log('Add SubZones complete!');
                    }
                    callback(err);
                });
            });



        },function(err){
            if(err)
                console.log('Add Zones Error: '+JSON.stringify(err));
            else{
                console.log('Add Zones Completed!');
                TinyMassive.client.publish("Loading:"+TinyMassive.id,"Zones");
            }
        });
    });
};

function GenerateWarps(){
    console.log('GenerateWarps');

    //For each zone in each local world generate a warp zones
    TinyMassive.GetWorlds(true,function(worlds){
        async.eachLimit(worlds,10,function(world,callback){
            TinyMassive.GetZones('Zone:'+world.value.id+'*',function(zones){
                async.eachLimit(zones,10,function(zone,callback2){
                    async.eachLimit(new Array(numWarpsPerZone),10,function(item,callback3){
                        var destzone = (_.find(_.shuffle(zones),function(){return true;})).value;
                        var sourcezone = zone.value;
                        var warp = TinyMassive.Warp(
                            {
                                id:sourcezone.id,
                                x:Math.floor(Math.random() * (100 - 0 + 1) + 0),
                                z:Math.floor(Math.random() * (100 - 0 + 1) + 0)
                            },{
                                id:destzone.id,
                                x:Math.floor(Math.random() * (100 - 0 + 1) + 0),
                                z:Math.floor(Math.random() * (100 - 0 + 1) + 0)
                            });
                        TinyMassive.UpdateWarp(warp,function(err4,reply){
                            callback3(err4)
                            console.log('Added Warp '+JSON.stringify(warp));
                        });
                    },function(err3){
                        callback2(err3);
                    });
                },function(err2){
                    callback(err2);
                });
            });
        },function(err){
            if(err)
                console.log('Add Warps Error: '+JSON.stringify(err));
            else
            {
                console.log('Warps Loaded!');
                TinyMassive.client.publish("Loading:"+TinyMassive.id,"Warps");
            }
        });
    });
}

function GenerateMobs(){
    console.log('GenerateMobs');

    TinyMassive.GetWorlds(true,function(worlds){
        async.eachLimit(worlds,10,function(world,callback){
            TinyMassive.GetZones('Zone:'+world.value.id+'*',function(zones){
                async.eachLimit(zones,10,function(zone,callback2){
                    async.eachLimit(new Array(numMobsPerZone),10,function(item,callback3){
                        var mob = TinyMassive.Mob(names.mob());
                        TinyMassive.UpdateMob(mob,function(err4,reply){
                            if(err4)
                                callback3(err4);
                            else
                            {
                                console.log('Added Mob '+JSON.stringify(mob));
                                TinyMassive.UpdateMobPosition(mob.id,zone.value.id,{
                                    x:Math.floor(Math.random() * (100 - 0 + 1) + 0),
                                    z:Math.floor(Math.random() * (100 - 0 + 1) + 0)
                                },function(err5,reply2){
                                    callback3(err5);
                                });
                            }
                        });
                    },function(err3){
                        callback2(err3);
                    });
                },function(err2){
                    callback(err2);
                });
            });
        },function(err){
            if(err)
                console.log('Add Mobs Error: '+JSON.stringify(err));
            else
            {
                console.log('Mobs Loaded!');
                TinyMassive.client.publish("Loading:"+TinyMassive.id,"Mobs");
            }
        });
    });
}

function GeneratePlayers(){
    console.log('GeneratePlayers');


    TinyMassive.GetWorlds(true,function(worlds){
        async.eachLimit(worlds,10,function(world,callback){
            TinyMassive.GetZones('Zone:'+world.value.id+'*',function(zones){
                var starterZones = _.filter(zones,function(zone){ return zone.value.subzones>0; });
                async.eachLimit(starterZones,10,function(zone,callback2){
                    async.eachLimit(new Array(numPlayers),10,function(item,callback3){
                        var player = TinyMassive.Player(names.player());
                        TinyMassive.UpdatePlayer(player,function(err,reply){
                            if(err)
                                callback3(err);
                            else
                            {
                                async.parallel([
                                    function(callback4){
                                        world.value.playing++;
                                        TinyMassive.UpdateWorld(world.value,function(err2,reply2){
                                            if(err2)
                                                console.log('Update World Error: '+JSON.stringify(err2));
                                            callback4(err2);
                                        });
                                    },
                                    function(callback4){
                                        zone.value.playing++;
                                        TinyMassive.UpdateZone(zone.value,function(err2,reply2){
                                            if(err2)
                                                console.log('Update Zone Error: '+JSON.stringify(err2));
                                            callback4(err2);
                                        });
                                    }
                                ], callback3);
                            }
                            console.log('Added Player '+JSON.stringify(player));
                        });
                    },function(err3){
                        callback2(err3);
                    });
                },function(err2){
                    callback(err2);
                });
            });
        },function(err){
            if(err)
                console.log('Add Players Error: '+JSON.stringify(err));
            else
            {
                console.log('Players Loaded!');
                TinyMassive.client.publish("Loading:"+TinyMassive.id,"Players");
            }
        });
    });

};

function StartServer(){
    console.log('Start Server');
    TinyMassive.events.unsubscribe("Loading:"+TinyMassive.id);

    async.forever(MoveMobs);
    async.forever(MovePlayers);
    async.forever(Combat);


};

TinyMassive.Init(true,SpinupServer);

function SpinupServer(){
    console.log('Spin up');
    TinyMassive.events.on("subscribe", function (channel, count) {
        GenerateWorlds();
    });

    TinyMassive.events.on("message", function(channel, message){
        console.log('Message!');
        if(message==="Worlds")
            GenerateZones();
        if(message==="Zones")
            GenerateWarps();
        if(message==="Warps")
            GenerateMobs();
        if(message==="Mobs")
            GeneratePlayers();
        if(message==="Players")
            StartServer();
    });

    TinyMassive.events.subscribe("Loading:"+TinyMassive.id);
};