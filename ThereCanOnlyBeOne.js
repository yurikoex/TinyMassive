/*
     >>>There Can Only Be One<<<
    --The RPG that plays itself--
 */

var TinyMassive = require('./TinyMassive');
//var _ = require('underscore');
var _ = require('lodash');
var async = require('async');
var names = require('./namegenerator').load(_);

var numPlayersPerWorld = 1000;
var numZones = 25;
var numWorlds = 10;
var numWarpsPerZone = 10;
var numMobsPerZone = 100;

function GenerateWorlds(){
    console.log('GenerateWorlds');
    //Generate Worlds
    async.eachLimit(new Array(numWorlds),10, function(item,callback){
        var w = TinyMassive.World(names.world());
        TinyMassive.UpdateWorld(w,function(err,reply){
            if(err)
                console.log('Add World Error: '+JSON.stringify(err));
            else
//                console.log('Add World: '+JSON.stringify(w));
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
//                    console.log('Added Zone '+JSON.stringify(zone));
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
//                            console.log('Added Warp '+JSON.stringify(warp));
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
                async.eachLimit(zones,100,function(zone,callback2){
                    async.eachLimit(new Array(numMobsPerZone),100,function(item,callback3){
                        var mob = TinyMassive.Mob(names.mob());
                        TinyMassive.UpdateMob(mob,function(err4,reply){
                            if(err4)
                                callback3(err4);
                            else
                            {
//                                console.log('Added Mob '+JSON.stringify(mob));
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
        async.eachLimit(worlds,1,function(world,callback){
            TinyMassive.GetZones('Zone:'+world.value.id+'*',function(zones){
                var starterZones = _.filter(zones,function(zone){ return zone.value.subzones>0; });
                async.eachLimit(starterZones,1,function(zone,callback2){
                    async.eachLimit(new Array(numPlayersPerWorld),1,function(item,callback3){
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
                                    },
                                    function(callback5){
                                        zone.value.playing++;
                                        TinyMassive.UpdatePlayerPosition(player.id,zone.value.id,{
                                            x:Math.floor(Math.random() * (100 - 0 + 1) + 0),
                                            z:Math.floor(Math.random() * (100 - 0 + 1) + 0)
                                        },function(err3,reply3){
                                            if(err3)
                                                console.log('Update Player Position Error: '+JSON.stringify(err3));
                                            callback5(err3);
                                        });
                                    }
                                ], callback3);
                            }
//                            console.log('Added Player '+JSON.stringify(player));
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

function Logging(err){
    console.log('ThereCanOnlyBeOne Error: '+JSON.stringify(err));
}

function StartServer(){
    console.log('Start Server');
    TinyMassive.events.unsubscribe("Loading:"+TinyMassive.id);

    //Game Loop to sim play
    var loops = 0;
    async.forever(function(callback){
        var glStart = new Date().getTime();
        var playerPositions = [];
        var mobPositions = [];
        async.series({
                Move: function(callback1){
                    var moveStart = new Date().getTime();
                    var pmoves =0;
                    var mmoves =0;
                    //Move All Mobs
                    var mobsMoved = 0;
                    var playersMoved = 0;
                    async.eachLimit(TinyMassive.kZones,10,function(zoneKey,cb){
                        TinyMassive.GetZoneByKey(zoneKey, function(zone){
                            var minWidth = 0;
                            var maxWidth = zone.Width;
                            var minHeight = 0;
                            var maxHeight = zone.Height;
                            function MinMaxHeight(num){
                                if(num>maxHeight)
                                    return maxHeight;
                                if(num<minHeight)
                                    return minHeight;
                                return num;
                            };
                            function MinMaxWidth(num){
                                if(num>maxWidth)
                                    return maxHeight;
                                if(num<minHeight)
                                    return minWidth;
                                return num;
                            };

                            async.series([
                                function(callback2){
                                    TinyMassive.GetMobPositions(zone.id,function(err,zonePositions){
                                        var props = [];
                                        for(var prop in zonePositions){props.push(prop);}
                                        async.eachSeries(props,function(property,callback3){
                                            var point = JSON.parse(zonePositions[property]);
                                            point.x = MinMaxWidth(TinyMassive.GetRandomInt(point.x-1,point.x+1));
                                            point.z = MinMaxHeight(TinyMassive.GetRandomInt(point.z-1,point.z+1));
                                            mobPositions.push({zoneid:zone.id,ekey:property,point:point});
                                            TinyMassive.UpdateMobPositionByField(property,zone.id,point,function(err,reply){
                                                if(err){
                                                    console.log(JSON.stringify(err));
                                                }
                                                callback3(err);
                                                mmoves++;
                                            });
                                        },function(err){
                                            if(err){
                                                console.log(JSON.stringify(err));
                                            }
                                            callback2(err, 'mobs moved');
                                        });
                                    });
                                },
                                function(callback4){
                                    TinyMassive.GetPlayerPositions(zone.id,function(err,zonePositions){
                                        var props = [];
                                        for(var prop in zonePositions){props.push(prop);}
                                        async.eachSeries(props,function(property,callback5){
                                            var point = JSON.parse(zonePositions[property]);
                                            point.x = MinMaxWidth(TinyMassive.GetRandomInt(point.x-1,point.x+1));
                                            point.z = MinMaxHeight(TinyMassive.GetRandomInt(point.z-1,point.z+1));
                                            playerPositions.push({zoneid:zone.id,ekey:property,point:point});
                                            TinyMassive.UpdatePlayerPositionByField(property,zone.id,point,function(err,reply){
                                                if(err){
                                                    console.log(JSON.stringify(err));
                                                }
                                                callback5(err);
                                                pmoves++;
                                            });
                                        },function(err){
                                            if(err){
                                                console.log(JSON.stringify(err));
                                            }
                                            callback4(err, 'players moved');
                                        });
                                    });
                                }
                            ],
                            function(err){
                                if(err){
                                    console.log(JSON.stringify(err));
                                }
                                cb(err);
                            });


                        });
                    },function(err){
                        if(err){
                            console.log(JSON.stringify(err));
                        }
                        callback1(err, {
                            PlayerMoves:pmoves,
                            MobMoves:mmoves,
                            moveTime:" Moves completed in (" + (new Date().getTime() - moveStart) + ")ms"
                        });
                    });
                },

                WarpPlayers: function(callbackx){
                    var warpStart = new Date().getTime();
                    var pwarps = 0;
                    async.eachLimit(TinyMassive.kWarps,10,function(warpKey,callbackz){
                        TinyMassive.GetWarpByKey(warpKey,function(err,warp){
                            var matches = _.filter(playerPositions,function(player){
                                if(warp.sourceid==player.zoneid &&
                                    warp.sourcex==player.point.x &&
                                    warp.sourcez==player.point.z){
                                    return player;
                                }
                            });
                            if(matches.length !=0)
                            {
                                //console.log("PlayerWarped!: "+JSON.stringify(matches));
                                async.eachSeries(matches,function(player,callbacka){
                                    TinyMassive.PlayerUseWarp(player.ekey,warp.id,function(err,reply){
                                        if(err){
                                            console.log(JSON.stringify(err));
                                        }
                                        else
                                            playerPositions[playerPositions.indexOf(player)] = {zoneid:warp.destid,ekey:player.ekey,point:{
                                                x:warp.destx,
                                                z:warp.destz
                                            }};
                                        callbacka(err);
                                        pwarps++;
                                    });
                                },function(err){
                                    if(err){
                                        console.log(JSON.stringify(err));
                                    }
                                    callbackz(err);
                                });
                            }
                            else
                            {
                                callbackz();
                            }
                        });
                    },function(err){
                        callbackx(err, {
                            PlayersWarped:pwarps,
                            warpTime:" Warps completed in (" + (new Date().getTime() - warpStart) + ")ms"
                        });
                    });
                },
                Combat: function(callback){
                    var combatStart = new Date().getTime();
                    var bestWarrior = {};
                    var combatants = _.reduce(_.uniq(_.pluck(_.union(playerPositions,mobPositions),"zoneid")), function(memo, zoneid){
                        var playersInZone = _.filter(playerPositions,function(pos){return pos.zoneid==zoneid;});
                        var mobsInZone = _.filter(mobPositions,function(pos){return pos.zoneid==zoneid;});
                        _.each(playersInZone,function(playerPos){
                            var mob = _.find(mobsInZone,function(mob){return mob.point.x == playerPos.point.x && mob.point.z == playerPos.point.z;});//mobsInZone.indexOf(playerPos.point);
                            if(mob)
                            {
                                memo.push({
                                    zoneid:zoneid,
                                    playerKey:playerPos.ekey,
                                    mobKey:mob.ekey
                                })
                            }
                        });
                        return memo;
                    }, []);


                    var CombatEngine = {
                        swing : function (attacker,defender){
                            var die = TinyMassive.GetRandomInt(1,20)+attacker.attack;
                            return die>=10+defender.defense;
                        },
                        hit : function (damage,defender){
                            defender.health = defender.health-damage;
                            return defender.health<=0;
                        }
                    };



                    async.eachLimit(combatants,100,function(combat,callback){
                        var player = {};
                        var mob = {};
                        async.series([
                            function(callback){
                                TinyMassive.GetPlayerByKey(combat.playerKey, function(err,reply){
                                    player=reply;
                                    callback(err,reply);
                                });
                            },
                            function(callback){
                                TinyMassive.GetMobByKey(combat.mobKey, function(err,reply){
                                    mob=reply;
                                    callback(err,reply);
                                });
                            }
                        ],function(err,battle){
                            var fightResults = {biggestHit:0,level:0,winner:{},results:[]};

                            while(battle){
                                var die = Math.random();
                                if(die>.5)
                                    battle = battle.reverse();
                                if(CombatEngine.swing(battle[0],battle[1]))
                                {
                                    var damage = 1;
                                    if(Math.random()>.9)
                                        damage = TinyMassive.GetRandomInt(1,battle[0].attack);
                                    if(damage>fightResults.biggestHit)
                                        fightResults.biggestHit=damage;
                                    fightResults.results.push(battle[0].name + ' hit ' + battle[1].name+ ' for '+damage + ' damage');
                                    if(CombatEngine.hit(damage,battle[1]))
                                    {
                                        fightResults.level = battle[0].level;
                                        fightResults.winner = battle[0];
                                        fightResults.results.push('Level '+battle[0].level +' '+ battle[0].name + ' killed '+'Level '+battle[1].level +' '+ battle[1].name);
                                        if(combat.playerKey.indexOf(battle[0].id)!=-1){
                                            fightResults.results.push(battle[1].exp +'exp received!');
                                            TinyMassive.LevelUpPlayer(player,mob,function(err,reply){
                                                if(err)
                                                console.log(JSON.stringify(err));
                                            });
                                            TinyMassive.KillMob(mob,combat.zoneid);
                                        }
                                        else{
                                            TinyMassive.LevelUpMob(mob,function(err,reply){
                                                if(err)
                                                    console.log(JSON.stringify(err));
                                            });
                                            TinyMassive.KillPlayer(player, combat.zoneid);
                                        }
                                        battle = false;
                                    }else{
                                        fightResults.results.push(battle[0].name + ' misses...');
                                    }
                                }
                            }
                            if(bestWarrior.level == undefined || bestWarrior.level == fightResults.level)
                            {
                                bestWarrior = fightResults;
                            }
                            callback(err);
                        });
                    },function(err){
                        callback(err, {
                            TotalCombat:combatants.length,
                            BestWarrior:bestWarrior,
                            combatTime:" Combat completed in (" + (new Date().getTime() - combatStart) + ")ms"
                        });
                    });
                }
            },
            function(err, results) {
                if(err)
                    console.log('Game Loop Error: '+JSON.stringify(err));
                console.log(loops++ + " Game Loop completed in (" + (new Date().getTime() - glStart) + ")ms");
                console.log(JSON.stringify(results, null, '\t'));
                callback(err);

            });
    },Logging);

    var count = 0;
};

TinyMassive.Init(true,SpinupServer);

function SpinupServer(){
    console.log('Spin up');
    TinyMassive.events.on("subscribe", function (channel, count) {
        GenerateWorlds();
    });

    TinyMassive.events.on("message", function(channel, message){
        //console.log('Message!');
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


