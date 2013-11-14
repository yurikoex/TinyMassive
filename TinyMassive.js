var redis = require('redis');
var _ = require('underscore');
var async = require('async');
var names = require('./namegenerator').load(_);
var wid = require('wid');

var TinyMassive = {
    //Private Methods
    _getHashesFromKeyPattern : function(method,keyPattern,callback){
        var _this = this;
        this.client.keys(keyPattern,function(err,keys){
            if(err)
                console.log(method+' Keys Error: '+JSON.stringify(err));
            else
            {
                var arr = [];
                async.each(keys,function(wkey,asyncCallback){
                    _this.client.hgetall(wkey,function(err2,reply){
                        if(err2)
                            console.log(method+' HGETALL Error: '+JSON.stringify(err2));
                        else
                            arr.push({ key: wkey , value : reply });
                        asyncCallback(err2);
                    });
                },function(err3){
                    if(err3)
                        console.log(method+' async Error: '+JSON.stringify(err3));
                    else
                        callback(arr);
                });
            }
        });
    },
    _getHashFromKey : function(method,key,callback){
        this.client.hgetall(key,function(err,reply){
            if(err)
                console.log(method +' Error: '+JSON.stringify(err));
            else
                callback(reply);
        });
    },

    //Public Methods
    Init : function(flush,callback){

        this.client = redis.createClient();

        this.events = redis.createClient();

        if(flush)
            this.client.flushdb();

        this.client.on('error', function (err) {
            console.log('Redis Error: '+err);
        });

        this.client.on('ready', function(){
            callback();
        });

        this.id = wid.NewWID(8);

        this.worldsCreated = 0;
        this.zonesCreated = 0;
        this.playersCreated = 0;
        this.mobsCreated = 0;

        this.kWorlds = [];
        this.kZones = [];
        this.kStartZones = [];
        this.kWarps = [];
        this.kPlayers = [];
        this.kMobPositons = [];
        this.kPlayerPositions = [];
    },
    World : function(name){
        var id = wid.NewWID(8);
        id = this.id + '_' + id;
        this.client.incr("Worlds");
        var name = name || names.world();
        return {
            id : id,
            name : name,
            playing : 0,
            zones : 0
        };
    },
    Zone : function(parentId, name){
        var id = wid.NewWID(8);
        this.client.incr("Zones");
        id = parentId + '_' + id;
        var name = name || names.zone();
        return {
            id : id,
            parentid : parentId,
            name : name,
            width : 100,
            height : 100,
            playing : 0,
            subzones : 0
        };
    },
    Warp : function(source,dest){
        var id = wid.NewWID(8);
        this.client.incr("Warps");
        return {
            id : id,
            destid : dest.id,
            destx : dest.x,
            destz : dest.z,
            sourceid : source.id,
            sourcex : source.x,
            sourcez : source.z
        }
    },
    Player : function(name){
        var id = wid.NewWID(8);
        this.client.incr("Players");
        var name = name || 'Unnamed Player '+id;
        return {
            id : id,
            name : name,
            level : 1,
            exp : 0,
            attack : 1,
            defense : 1,
            health : 1
        };
    },
    Mob : function(name){
        var id = wid.NewWID(8);
        this.client.incr("Mobs");
        var name = name || 'Unnamed Mob '+id;
        return {
            id : id,
            name : name,
            level : 1,
            exp : 0,
            attack : 1,
            defense : 1,
            health : 1
        };
    },
    UpdateWorld : function(world,callback){
        this.client.hmset('World:'+world.id,world,callback);
    },
    GetWorld : function(worldId,callback){
        this._getHashFromKey("GetWorld",'World:'+worldId,callback);
    },
    GetWorlds : function(local,callback){
        var keyPattern;
        if(local)
            keyPattern = 'World:'+this.id+'_*';
        else
            keyPattern = 'World:*';
        this._getHashesFromKeyPattern('GetWorlds',keyPattern,callback);
    },
    GetZones : function(keyPattern,callback){
        this._getHashesFromKeyPattern('GetZones',keyPattern,callback);
    },
    UpdateWarp : function(warp,callback){
        this.client.hmset('Warp:'+warp.id,warp,callback);
    },
    UpdateZone : function(zone,callback){
        this.client.hmset('Zone:'+zone.id,zone,callback);
    },
    PlayerUseWarp : function(playerId,warpId,callback){
        var _this = this;
        this.client.hgetall('Warp:'+warpId,function(err,warp){
            if(err)
                console.log('PlayerWarp hgetall Error: '+JSON.stringify(err));
            else
            {
                _this.client.hdel('PlayerPosition:'+warp.sourceid,'Player:'+playerId);
                _this.client.hset('PlayerPosition:'+warp.destid,'Player:'+playerId,JSON.stringify({x:warp.destx,z:warp.destz}));
                _this.client.hincrby('Zone:'+warp.sourceid, 'playing', -1);
                _this.client.hincrby('Zone:'+warp.destid, 'playing', 1);
                _this.client.hset('Player:'+playerId, 'zone', 'Zone:'+warp.destid);
            }
        });
    },
    UpdatePlayerPosition : function(playerId,zoneId,point,callback){
        this.client.hset('PlayerPosition:'+zoneId,'Player:'+playerId,JSON.stringify(point),callback);
    },
    GetPlayerPosition : function(playerId,zoneId,callback){
        this.client.hget('PlayerPosition:'+zoneId,'Player:'+playerId,function(err,reply){
            callback(err,JSON.parse(reply));
        });
    },
    UpdateMobPosition : function(mobId,zoneId,point,callback){
        this.client.hset('MobPosition:'+zoneId,'Player:'+mobId,JSON.stringify(point),callback);
    },
    GetMobPosition : function(mobId,zoneId,callback){
        this.client.hget('MobPosition:'+zoneId,'Player:'+mobId,function(err,reply){
            callback(err,JSON.parse(reply));
        });
    },
    UpdatePlayer : function(player,callback){
        this.client.hmset('Player:'+player.id,player,callback);
    },
    UpdateMob : function(mob,callback){
        this.client.hmset('Mob:'+mob.id,mob,callback);
    },
    GetPlayer : function(playerId,callback){
        this._getHashFromKey("GetPlayer",'Player:'+playerId,callback);
    },
    GetPlayers : function(callback){
        var keyPattern = 'Player:*';
        this._getHashesFromKeyPattern('GetPlayers',keyPattern,callback);
    }
};

module.exports = TinyMassive;