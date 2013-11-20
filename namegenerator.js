exports.load = function(_) {

    /**
     * parts
     *
     * https://docs.google.com/spreadsheet/ccc?key=0AoYAHvtJuIw-dEI5VFkyY0h5Tm16dVQxczFYMUtLNVE
     * P = Part = The part of the name
     * T = Type = Type of the part
     *              P = Prefix
     *              S = Suffix
     *              C = Connector
     *              F = Family Part of Power!!!
     * G = Gender = The preference to gender
     *              M = Masculine
     *              F = Feminine
     *              N = Neutral
     */
    var parts = [
        {
            "p": "a",
            "t": "c",
            "g": "n"
        },
        {
            "p": "li",
            "t": "c",
            "g": "f"
        },
        {
            "p": "ou",
            "t": "c",
            "g": "n"
        },
        {
            "p": "il",
            "t": "c",
            "g": "f"
        },
        {
            "p": "ar",
            "t": "c",
            "g": "n"
        },
        {
            "p": "mor",
            "t": "c",
            "g": "m"
        },
        {
            "p": "las",
            "t": "c",
            "g": "n"
        },
        {
            "p": "go",
            "t": "c",
            "g": "m"
        },
        {
            "p": "het",
            "t": "c",
            "g": "m"
        },
        {
            "p": "gor",
            "t": "p",
            "g": "m"
        },
        {
            "p": "gath",
            "t": "p",
            "g": "m"
        },
        {
            "p": "mat",
            "t": "p",
            "g": "m"
        },
        {
            "p": "hath",
            "t": "p",
            "g": "n"
        },
        {
            "p": "wek",
            "t": "p",
            "g": "n"
        },
        {
            "p": "hurma",
            "t": "p",
            "g": "m"
        },
        {
            "p": "aldo",
            "t": "p",
            "g": "m"
        },
        {
            "p": "sera",
            "t": "p",
            "g": "f"
        },
        {
            "p": "tora",
            "t": "p",
            "g": "f"
        },
        {
            "p": "pa",
            "t": "p",
            "g": "n"
        },
        {
            "p": "wen",
            "t": "p",
            "g": "n"
        },
        {
            "p": "tya",
            "t": "p",
            "g": "f"
        },
        {
            "p": "bre",
            "t": "p",
            "g": "f"
        },
        {
            "p": "jen",
            "t": "p",
            "g": "f"
        },
        {
            "p": "fan",
            "t": "p",
            "g": "f"
        },
        {
            "p": "meka",
            "t": "s",
            "g": "f"
        },
        {
            "p": "mont",
            "t": "s",
            "g": "n"
        },
        {
            "p": "set",
            "t": "s",
            "g": "m"
        },
        {
            "p": "eren",
            "t": "s",
            "g": "n"
        },
        {
            "p": "mondo",
            "t": "s",
            "g": "m"
        },
        {
            "p": "cred",
            "t": "s",
            "g": "m"
        },
        {
            "p": "den",
            "t": "s",
            "g": "n"
        },
        {
            "p": "in",
            "t": "s",
            "g": "n"
        },
        {
            "p": "en",
            "t": "s",
            "g": "n"
        },
        {
            "p": "more",
            "t": "s",
            "g": "m"
        },
        {
            "p": "ford",
            "t": "s",
            "g": "m"
        },
        {
            "p": "er",
            "t": "s",
            "g": "n"
        },
        {
            "p": "ter",
            "t": "s",
            "g": "m"
        },
        {
            "p": "ther",
            "t": "s",
            "g": "n"
        },
        {
            "p": "thar",
            "t": "s",
            "g": "n"
        },
        {
            "p": "hel",
            "t": "s",
            "g": "n"
        },
        {
            "p": "el",
            "t": "s",
            "g": "n"
        },
        {
            "p": "li",
            "t": "s",
            "g": "f"
        },
        {
            "p": "gora",
            "t": "s",
            "g": "f"
        },
        {
            "p": "mora",
            "t": "s",
            "g": "f"
        },
        {
            "p": "sora",
            "t": "s",
            "g": "f"
        },
        {
            "p": "ra",
            "t": "s",
            "g": "f"
        },
        {
            "p": "a",
            "t": "s",
            "g": "f"
        },
        {
            "p": "cland",
            "t": "f",
            "g": "n"
        },
        {
            "p": "wind",
            "t": "f",
            "g": "n"
        },
        {
            "p": "horas",
            "t": "f",
            "g": "n"
        },
        {
            "p": "moral",
            "t": "f",
            "g": "n"
        },
        {
            "p": "high",
            "t": "f",
            "g": "n"
        },
        {
            "p": "walk",
            "t": "f",
            "g": "n"
        },
        {
            "p": "felden",
            "t": "f",
            "g": "n"
        },
        {
            "p": "wither",
            "t": "f",
            "g": "n"
        },
        {
            "p": "sporn",
            "t": "f",
            "g": "n"
        },
        {
            "p": "salf",
            "t": "f",
            "g": "n"
        },
        {
            "p": "mace",
            "t": "f",
            "g": "n"
        },
        {
            "p": "welk",
            "t": "f",
            "g": "n"
        },
        {
            "p": "tanner",
            "t": "f",
            "g": "n"
        },
        {
            "p": "sunner",
            "t": "f",
            "g": "n"
        },
        {
            "p": "sulk",
            "t": "f",
            "g": "n"
        },
        {
            "p": "silk",
            "t": "f",
            "g": "n"
        },
        {
            "p": "word",
            "t": "f",
            "g": "n"
        },
        {
            "p": "men",
            "t": "f",
            "g": "n"
        },
        {
            "p": "elken",
            "t": "f",
            "g": "n"
        },
        {
            "p": "briar",
            "t": "f",
            "g": "n"
        },
        {
            "p": "wood",
            "t": "f",
            "g": "n"
        },
        {
            "p": "wand",
            "t": "f",
            "g": "n"
        },
        {
            "p": "fern",
            "t": "f",
            "g": "n"
        },
        {
            "p": "fulwo",
            "t": "f",
            "g": "n"
        },
        {
            "p": "wrin",
            "t": "f",
            "g": "n"
        }
    ];

    function World(){
        return Name('m').split(' ')[0];
    }

    function Name(gender){
        /*
         gender m/f/a/NaN
         */
        gender = gender || 'a';
        /*
         Get the parts that are for our gender
         */
        var genderparts = _.filter(parts, function(part){
            if(gender=='a')
                return true;
            return (part.g == gender || part.g == 'n');
        });

        var FullName = '';

        /*
         get a first name then a last
         */
        _.each(['first','last'],function(position){
            var opt;
            var word = "";
            if(position=='first')
            {
                /*
                 a first name is a combination of Prefix + Connector + Suffix parts.
                 Randomly they could get omitted. adjust seeds below
                 */
                opt = {
                    usePre: {t:'p',use:Math.random() > .2},
                    useCon: {t:'c',use:Math.random() > .2},
                    useSuf: {t:'s',use:Math.random() > .2}
                }
            }
            if(position=='last')
            {
                /*
                 a last name is a combination of Family + Second Family + Connector + Suffix parts.
                 Randomly they could get omitted. adjust seeds below
                 A second family part is very rare at the moment
                 */
                opt = {
                    useFam: {t:'f',use:Math.random() > .1},
                    useSecondFam: {t:'f',use:Math.random() > .9},
                    useCon: {t:'c',use:Math.random() > .2},
                    useSuf: {t:'s',use:Math.random() > .2}
                }
            }

            /*
             Lets combine our parts
             */
            _.each(opt,function(option){
                /*
                 if our seed hit we will use that part
                 */
                if(option.use)
                {
                    /*
                     get a list of that certain part
                     */
                    var list = _.filter(genderparts, function(part){
                        return part.t == option.t;
                    });

                    /*
                     randomize the list, find the first item. add the Part(p) to the word.
                     */
                    word += (_.find(_.shuffle(list),function(){return true;})).p;
                }
            });
            /*
             capitalize the first letter
             */
            word = word.substring(0, 1).toUpperCase() + word.substring(1);

            /*
             combine!
             */
            if(position=='last')
                word = ' '+ word;
            FullName += word;
        });
        return FullName;
    }

    function MonsterName(){
        return _.shuffle([
            'Goblin',
            'Kobold',
            'Bandit',
            'Orc',
            'Ogre',
            'Ronin',
            'Mermaider',
            'Rogue Wizard',
            'Rogue',
            'Thief',
            'Burglar',
            'Outlaw',
            'Dark Elf',
            'Titan',
            'Giant',
            'Phantom',
            'Shadow',
            'Wight',
            'Wereboar',
            'Werewolf',
            'Dire Bear',
            'Dire Wolf',
            'Vampire',
            'Dark Priest',
            'Demon',
            'Darkling',
            'Basilisk',
            'Lizard',
            'Bunny',
            'Sprite',
            'Pixie',
            'Faerie',
            'Spawn',
            'Worg',
            'Turtle'
        ])[0];
    }

    return  {
        newWordId:function () {
            return Name('a').replace(' ','');
        },
        player:function (gender) {
            return Name(gender);
        },
        mob:function (gender) {
            return MonsterName();
        },
        world: function(){
            return World();
        },
        zone: function(){
            return World();
        },
        warp: function(){
            return World();
        },
        item: function(){
            return World();
        }
    }
};