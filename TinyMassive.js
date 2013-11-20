var redis = require('redis');
//var _ = require('underscore');
var _ = require('lodash');
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
        var _this = this;
        this.client = redis.createClient();

        this.events = redis.createClient();
        this.keyAddedEvents = redis.createClient();

        this.keyAddedEvents.on("message", function(channel, message){
            if(message.indexOf('World:')!=-1)
                _this.kWorlds.push(message);
            if(message.indexOf('Zone:')!=-1)
                _this.kZones.push(message);
            if(message.indexOf('Warp:')!=-1)
                _this.kWarps.push(message);
            if(message.indexOf('Player:')!=-1)
                _this.kPlayers.push(message);
            if(message.indexOf('Mob:')!=-1)
                _this.kMobs.push(message);
            if(message.indexOf('MobPosition:')!=-1)
                _this.kMobPositions.push(message);
            if(message.indexOf('PlayerPosition:')!=-1)
                _this.kPlayerPositions.push(message);
        });

        this.keyAddedEvents.subscribe("KeyAdded");

        this.keyRemovedEvents = redis.createClient();

        this.keyRemovedEvents.on("message", function(channel, message){
            if(message.indexOf('World:')!=-1)
                _this.kWorlds = _.reject(_this.kWorlds, function(k){ return k == message; });
            if(message.indexOf('Zone:')!=-1)
                _this.kZones = _.reject(_this.kZones, function(k){ return k == message; });
            if(message.indexOf('Warp:')!=-1)
                _this.kWarps = _.reject(_this.kWarps, function(k){ return k == message; });
            if(message.indexOf('Player:')!=-1)
                _this.kPlayers = _.reject(_this.kPlayers, function(k){ return k == message; });
            if(message.indexOf('Mob:')!=-1)
                _this.kMobs = _.reject(_this.kMobs, function(k){ return k == message; });
            if(message.indexOf('MobPosition:')!=-1)
                _this.kMobPositions = _.reject(_this.kMobPositions, function(k){ return k == message; });
            if(message.indexOf('PlayerPosition:')!=-1)
                _this.kPlayerPositions = _.reject(_this.kPlayerPositions, function(k){ return k == message; });
        });

        this.keyRemovedEvents.subscribe("KeyRemoved");

        this.widLength = 10;


        if(flush)
            this.client.flushdb();

        this.client.on('error', function (err) {
            console.log('Redis Error: '+err);
        });

        this.client.on('ready', function(){
            callback();
        });

        this.id = wid.NewWID(this.widLength);

        this.worldsCreated = 0;
        this.zonesCreated = 0;
        this.playersCreated = 0;
        this.mobsCreated = 0;

        this.KeyTypeEnum = {};
        this.KeyTypeEnum.World = 'World:';
        this.KeyTypeEnum.Zone = 'Zone:';
        this.KeyTypeEnum.Warp = 'Warp:';
        this.KeyTypeEnum.Player = 'Player:';
        this.KeyTypeEnum.Mob = 'Mob:';
        this.KeyTypeEnum.MobPosition = 'MobPosition:';
        this.KeyTypeEnum.PlayerPosition = 'PlayerPosition:';

        this.kWorlds = [];
        this.kZones = [];
        this.kWarps = [];
        this.kPlayers = [];
        this.kMobs = [];
        this.kMobPositions = [];
        this.kPlayerPositions = [];

        this.GetExistingKeys(this.KeyTypeEnum.World,function(keys){
            this.kWorlds = keys;
        });
        this.GetExistingKeys(this.KeyTypeEnum.Zone,function(keys){
            this.kZones = keys;
        });
        this.GetExistingKeys(this.KeyTypeEnum.Warp,function(keys){
            this.kWarps = keys;
        });
        this.GetExistingKeys(this.KeyTypeEnum.Player,function(keys){
            this.kPlayers = keys;
        });
        this.GetExistingKeys(this.KeyTypeEnum.Mob,function(keys){
            this.kMobs = keys;
        });
        this.GetExistingKeys(this.KeyTypeEnum.MobPosition,function(keys){
            this.kMobPositions = keys;
        });
        this.GetExistingKeys(this.KeyTypeEnum.PlayerPosition,function(keys){
            this.kPlayerPositions = keys;
        });


        this.kStartZones = [];
    },
    GenerateWid : function(parentId,keyType){
        var w = '';
        while(w==''){
            var tempWid = wid.NewWID(this.widLength);
            if(!_.some(this.GetWidsFromKeyType(keyType),function(key){
                if(parentId)
                    return key==(keyType+parentId+'_'+tempWid);
                else
                    return key==(keyType+'_'+tempWid);
                })){
                w=tempWid;
                return w;
            }
        }
    },
    GetWidsFromKeyType : function (keyType){
        switch(keyType)
        {
            case 'World:':
                return this.kWorlds;
                break;
            case 'Zone:':
                return this.kZones;
                break;
            case 'Warp:':
                return this.kWarps;
                break;
            case 'Player:':
                return this.kPlayers;
                break;
            case 'Mob:':
                return this.kMobs;
                break;
            case 'MobPosition:':
                return this.kMobPositions;
                break;
            case 'PlayerPosition:':
                return this.kPlayerPositions;
                break;
            default:
                return null;
        }
    },
    AddToKeys : function (keyType,key){
        switch(keyType)
        {
            case 'World:':
                this.kWorlds.push(key);
                break;
            case 'Zone:':
                this.kZones.push(key);
                break;
            case 'Warp:':
                this.kWarps.push(key);
                break;
            case 'Player:':
                this.kPlayers.push(key);
                break;
            case 'Mob:':
                this.kMobs.push(key);
                break;
            case 'MobPosition:':
                this.kMobPositions.push(key);
                break;
            case 'PlayerPosition:':
                this.kPlayerPositions.push(key);
                break;
        }
    },
    GetExistingKeys: function(keyPattern, callback){
        this.client.keys(keyPattern+'*',function(err,keys){
            if(err)
                console.log(method+' Keys Error: '+JSON.stringify(err));
            else
            {
                callback(keys);
            }
        });
    },
    World : function(name){
        var id = this.GenerateWid(null,this.KeyTypeEnum.World);
        this.client.publish('KeyAdded',this.KeyTypeEnum.World+id);
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
        var id = this.GenerateWid(parentId,this.KeyTypeEnum.Zone);

        this.client.incr("Zones");
        id = parentId + '_' + id;
        this.client.publish('KeyAdded',this.KeyTypeEnum.Zone+id);
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
        var id = this.GenerateWid(null,this.KeyTypeEnum.Warp);
        this.client.publish('KeyAdded',this.KeyTypeEnum.Warp+id);

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
        var id = this.GenerateWid(null,this.KeyTypeEnum.Player);
        this.client.publish('KeyAdded',this.KeyTypeEnum.Player+id);

        this.client.incr("Players");
        var name = name || 'Unnamed Player '+id;
        return {
            id : id,
            name : name,
            level : 1,
            exp : 1,
            attack : 1,
            defense : 1,
            health : 1
        };
    },
    Mob : function(name){
        var id = this.GenerateWid(null,this.KeyTypeEnum.Mob);
        this.client.publish('KeyAdded',this.KeyTypeEnum.Mob+id);

        this.client.incr("Mobs");
        var name = name || 'Unnamed Mob '+id;
        return {
            id : id,
            name : name,
            level : 1,
            exp : 1,
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
    GetZoneByKey : function(zoneKey,callback){
        this._getHashFromKey("GetZone",zoneKey,callback);
    },
    UpdateWarp : function(warp,callback){
        this.client.hmset('Warp:'+warp.id,warp,callback);
    },
    GetWarpByKey : function(warpKey,callback){
        this.client.hgetall(warpKey,callback);
    },
    UpdateZone : function(zone,callback){
        this.client.hmset('Zone:'+zone.id,zone,callback);
    },
    PlayerUseWarp : function(playerKey,warpId,callback){
        var _this = this;
        this.client.hgetall('Warp:'+warpId,function(err,warp){
            if(err)
                console.log('PlayerWarp hgetall Error: '+JSON.stringify(err));
            else
            {
                //TODO: Turn this into async series and gather errors
                _this.client.hdel('PlayerPosition:'+warp.sourceid,playerKey);
                _this.client.hset('PlayerPosition:'+warp.destid,playerKey,JSON.stringify({x:warp.destx,z:warp.destz}));
                _this.client.hincrby('Zone:'+warp.sourceid, 'playing', -1);
                _this.client.hincrby('Zone:'+warp.destid, 'playing', 1);
                _this.client.hset(playerKey, 'zone', 'Zone:'+warp.destid,function(err,reply){
                    callback(err,reply);
                });
            }

        });
    },
    UpdatePlayerPosition : function(playerId,zoneId,point,callback){
        this.client.hset('PlayerPosition:'+zoneId,'Player:'+playerId,JSON.stringify(point),callback);
    },
    UpdatePlayerPositionByField : function(playerId,zoneId,point,callback){
        this.client.hset('PlayerPosition:'+zoneId,playerId,JSON.stringify(point),callback);
    },
    GetPlayerPosition : function(playerId,zoneId,callback){
        this.client.hget('PlayerPosition:'+zoneId,'Player:'+playerId,function(err,reply){
            callback(err,JSON.parse(reply));
        });
    },
    GetPlayerPositions : function(zoneId,callback){
        this.client.hgetall('PlayerPosition:'+zoneId,function(err,reply){
            callback(err,reply);
        });
    },
    UpdateMobPosition : function(mobId,zoneId,point,callback){
        this.client.hset('MobPosition:'+zoneId,'Mob:'+mobId,JSON.stringify(point),callback);
    },
    UpdateMobPositionByField : function(mobId,zoneId,point,callback){
        this.client.hset('MobPosition:'+zoneId,mobId,JSON.stringify(point),callback);
    },
    GetMobPosition : function(mobId,zoneId,callback){
        this.client.hget('MobPosition:'+zoneId,'Mob:'+mobId,function(err,reply){
            callback(err,JSON.parse(reply));
        });
    },
    GetMobPositions : function(zoneId,callback){
        this.client.hgetall('MobPosition:'+zoneId,function(err,reply){
            callback(err,reply);
        });
    },
    GetMobByKey : function(mobKey,callback){
        this.client.hgetall(mobKey,callback);
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
    GetPlayerByKey : function(playerKey,callback){
        this.client.hgetall(playerKey,callback);
    },
    GetPlayers : function(callback){
        var keyPattern = 'Player:*';
        this._getHashesFromKeyPattern('GetPlayers',keyPattern,callback);
    },
    LevelUpPlayer : function(player,mob,callback){
        player.level++;
        player.health++;
        player.attack++;
        player.defense++;
        player.exp = parseInt(player.exp)+parseInt(mob.exp);
        this.UpdatePlayer(player,callback);

    },
    LevelUpMob : function(mob,callback){
        mob.level++;
        mob.health++;
        mob.attack++;
        mob.defense++;
        mob.exp++;
        this.UpdateMob(mob,callback);
    },
    KillPlayer : function(player,zoneid){
        this.client.hdel('PlayerPosition:'+zoneid,this.KeyTypeEnum.Player+player.id);
        this.client.del(this.KeyTypeEnum.Player+player.id);
        this.client.publish('KeyRemoved',this.KeyTypeEnum.Player+player.id);
        this.client.hincrby('Zone:'+zoneid, 'playing', -1);
    },
    KillMob : function(mob,zoneid){
        this.client.hdel('MobPosition:'+zoneid,this.KeyTypeEnum.Mob+mob.id);
        this.client.del(this.KeyTypeEnum.Mob+mob.id);
        this.client.publish('KeyRemoved',this.KeyTypeEnum.Mob+mob.id);

        //spawn another later... wahahaha
    },
    GetRandomInt : function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    LevelName : function(level){
        var title = [];
        title.push('Novice');
        title.push('Journeyman');
        title.push('Master');
        title.push('Grand Master');
        title.push('Lord');
        title.push('Demigod');
        title.push('God');
        return title[Math.floor(level/10)];

    }
};

module.exports = TinyMassive;