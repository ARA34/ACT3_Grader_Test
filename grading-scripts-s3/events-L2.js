var sb3 = {
    no: function(x) { //null checker
        return (x == null || x == {} || x == undefined || !x || x == '' | x.length === 0);
    },

    jsonToSpriteBlocks: function(json, spriteName) { //retrieve a given sprite's blocks from JSON
        if (this.no(json)) return []; //make sure script exists

        var projInfo = json['targets'] //extract targets from JSON data
        var allBlocks={};
        var blocks={};
        
        //find sprite
        for(i=0; i <projInfo.length; i++){
            if(projInfo[i]['name'] == spriteName){
                return projInfo[i]['blocks'];
            }
        }
        return [];
    }, //done
    
    jsonToSprite: function(json, spriteName) { //retrieve a given sprite's blocks from JSON
        if (this.no(json)) return []; //make sure script exists

        var projInfo = json['targets'] //extract targets from JSON data
        
        //find sprite
        for(i=0; i <projInfo.length; i++){
            if(projInfo[i]['name'] == spriteName){
                return projInfo[i];
            }
        }
        return [];
    }, //done
    
    countSprites: function(json){
        if (this.no(json)) return false; //make sure script exists
        
        var numSprites = 0;
        var projInfo = json['targets'] //extract targets from JSON data
        
        for(i=0; i <projInfo.length; i++){
            if(projInfo[i]['isStage'] == false){
                numSprites ++;
            }
        }
        return numSprites
    },
    
    findSprite: function(json, spriteName){ //returns true if sprite with given name found
        if (this.no(json)) return false; //make sure script exists

        var projInfo = json['targets'] //extract targets from JSON data
        
        //find sprite
        for(i=0; i <projInfo.length; i++){
            if(projInfo[i]['name'] == spriteName){
                return true;
            }
        }
        return false;
    }, //done
    
    findBlockID: function(blocks, opcode){
        if(this.no(blocks) || blocks == {}) return null;
        
        for(block in blocks){ 
            if(blocks[block]['opcode'] == opcode){
                return block;
            }
        }
        return null;
    },
    
    findKeyPressID: function(blocks, key){
        if(this.no(blocks) || blocks == {}) return null;
        
        for(block in blocks){ 
            if(blocks[block]['opcode'] == 'event_whenkeypressed'){
                if(blocks[block]['fields']['KEY_OPTION'][0] == key){
                    return block;
                }
            }
        }
        return null;
    },
    
    opcodeBlocks: function(script, myOpcode) { //retrieve blocks with a certain opcode from a script list of blocks
        if (this.no(script)) return [];
        
        var miniscript = [];

        for(block in script){
            if(script[block]['opcode'] == myOpcode){
                miniscript.push(script[block]);
            }
        }
        return miniscript;
    }, 
    
    typeBlocks: function(script, type) { //retrieve blocks of certain type from a script list of blocks
        if (this.no(script)) return [];
        
        var miniscript = [];

        for(block in script){
            if(script[block]['opcode'].includes(type)){
                miniscript.push(script[block]);
            }
        }
        return miniscript;
    },
    
    startBlock: function(blocks){
        if(this.no(blocks) || blocks == {}) return null;
        
        for(block in blocks){ 
            if(blocks[block]['opcode'].includes("event_")){
                return block;
            }
        }
        return null;
    },
    
    opcode: function(block) { //retrives opcode from a block object 
        if (this.no(block)) return "";
        return block['opcode'];
    }, 
    
    countBlocks: function(blocks,opcode){ //counts number of blocks with a given opcode
        var total = 0;
		for(id in blocks){ 
            if([blocks][id]['opcode'] == opcode){
                total = total + 1;
            }
        }
        return total;
    }, //done
    
    countScripts: function(blocks,type){ //counts valid scripts of a certain type
        var count = 0;
        for (i in blocks){
            if(blocks[i]['opcode'].includes(type) && !this.no(blocks[i]['next'])){
                    count = count + 1;
            }
        }
        return count;
        
    },
    
    //given list of blocks, return a script
    makeScript: function(blocks, blockID,getsub){
        if (this.no(blocks) || this.no(blockID)) return [];
        event_opcodes = ['event_whenflagclicked', 'event_whenthisspriteclicked','event_whenbroadcastreceived','event_whenkeypressed', 'event_whenbackdropswitchesto','event_whengreaterthan'];
        
        var curBlockID = blockID;
        var script = {};
    
        //find blocks before
        while(curBlockID != null){
            var curBlockInfo = blocks[curBlockID]; //Pull out info about the block
            script[curBlockID]=curBlockInfo; //Add the block itself to the script dictionary DEBUG PUSH SITUATION
            //Get parent info out
            var parentID = curBlockInfo['parent']; //Block that comes before has key 'parent'
            //parentInfo = blocks[parentID]
    		var opcode = curBlockInfo['opcode'];

            //If the block is not part of a script (i.e. it's the first block, but is not an event), return empty dictionary
            if ((parentID == null) && !(event_opcodes.includes(opcode))){
                return [];
            }
            
            if (getsub) {
                //if there is script nested inside, add them
                if (curBlockInfo['inputs']['SUBSTACK'] != undefined){
                    var firstChildID = curBlockInfo['inputs']['SUBSTACK'][1]
                    var sub = sb3.addSubScript(blocks,firstChildID,script)
                    if (failedSub){
                        return{};
                    }

                }
            }

            //Iterate: set parent to curBlock
            curBlockID = parentID
        }
        
        //Find all blocks that come after
        curBlockID = blockID //Initialize with blockID of interest
        while(curBlockID != null){
            curBlockInfo = blocks[curBlockID]; //Pull out info about the block
            script[curBlockID]=curBlockInfo; //Add the block itself to the script dictionary                
            //Get next info out
            nextID = curBlockInfo['next']; //Block that comes after has key 'next'
            //nextInfo = blocks[nextID]
            opcode = curBlockInfo['opcode'];
            
            if (getsub) {
                //if there is script nested inside, add them
                if (curBlockInfo['inputs']['SUBSTACK'] != undefined){
                    var firstChildID = curBlockInfo['inputs']['SUBSTACK'][1]
                    var failedSub = sb3.addSubScript(blocks,firstChildID,script)
                    if (failedSub){ //on failure to get subScript
                        return {};
                    }

                }
            }
		
            //If the block is not a script (i.e. it's an event but doesn't have anything after), return empty dictionary
            if((nextID == null) && (event_opcodes.includes(opcode))){
                return {};
            }
            //Iterate: Set next to curBlock
            curBlockID = nextID;
        } 
        
        return script;
    },
    
    //adding nested script to the main script
    addSubScript: function(blocks_sub,blockID_sub, script) {
        if (this.no(blocks_sub) || this.no(blockID_sub)) {
            return true;
        }
        
        
        var curBlockID_sub = blockID_sub;
    
        //Find all blocks that come after
        curBlockID_sub = blockID_sub //Initialize with blockID of interest
        while(curBlockID_sub != null){
            var curBlockInfo_sub = blocks_sub[curBlockID_sub]; //Pull out info about the block
            script[curBlockID_sub]=curBlockInfo_sub; //Add the block itself to the script dictionary                
            //Get next info out
            nextID_sub = curBlockInfo_sub['next']; //Block that comes after has key 'next'
            //nextInfo = blocks[nextID]
            opcode_sub = curBlockInfo_sub['opcode'];
            
            //if there is script nested inside, add them
                if (curBlockInfo_sub['inputs']['SUBSTACK'] != undefined){
                    var firstChildID_sub = curBlockInfo_sub['inputs']['SUBSTACK'][1]
                    var failedSub_sub = sb3.addSubScript(blocks_sub,firstChildID_sub,script)
                    if (failedSub_sub){ //on failure to get subScript
                        return {};
                    }

                }
            
            
		
            //If the block is not a script (i.e. it's an event but doesn't have anything after), return failure
            if((nextID_sub == null) && (event_opcodes.includes(opcode_sub))){
                return true;
            }
            //Iterate: Set next to curBlock
            curBlockID_sub = nextID_sub;
        }   
        return false;
    }, 
    
    between: function(x, a, b) {
        if (x == undefined) {
            return false;
        }
        if (x >= a && x <= b) {
            return true;
        }
        return false;
    }
};

class Sprite {
    
    constructor(name) {
        this.name = name; 
        this.scripts = [];
    }
    
    getScripts() {
        return this.scripts;
    }
    
    getScript(i) {
        return this.scripts[i];
    }
    
    addScript(script) {
        this.scripts.push(script);
    }
    
    
}

class GradeEvents {

    constructor() {
        this.requirements = {};
        this.extensions = {};
        
        this.event_opcodes = ['event_whenflagclicked', 'event_whenthisspriteclicked','event_whenbroadcastreceived','event_whenkeypressed', 'event_whenbackdropswitchesto','event_whengreaterthan'];
        
        this.validMoves = ['motion_gotoxy', 'motion_changexby', 'motion_changeyby', 'motion_movesteps', 'motion_glidesecstoxy'];
        this.validLoops = ['control_forever', 'control_repeat', 'control_repeat_until'];
        this.validCostumes = ['looks_switchcostumeto', 'looks_nextcostume'];
    }
    
    initReqs() {
        this.requirements.HaveBackdrop = {bool: false, str: "Background has an image."};
        this.requirements.HaveThreeSprites ={bool: false, str: "There are three sprites."};
        this.requirements.SpriteOneTwoEvents = {bool: false, str: "Sprite 1 has at least two events."};
        this.requirements.SpriteTwoTwoEvents = {bool: false, str: "Sprite 2 has at least two events."};
        this.requirements.SpriteThreeTwoEvents = {bool: false, str: "Sprite 3 has at least two events."};
        this.requirements.SpriteOneTwoScripts = {bool: false, str: "Sprite 1 events have actions."};
        this.requirements.SpriteTwoTwoScripts = {bool: false, str: "Sprite 2 events have actions."};
        this.requirements.SpriteThreeTwoScripts = {bool: false, str: "Sprite 3 events have actions."};
        
    }
     
    initExts() {
        this.extensions.SpriteSpins = {bool: false, str: "A sprite spins (uses turn block)"};
        this.extensions.MoreScripts = {bool: false, str: "A sprite reacts to more events."};
        this.extensions.SpriteBlinks = {bool: false, str: "A sprite blinks (use hide, show, and wait blocks)."}
    }
    
    grade(fileObj,user) {
        
        this.initReqs();
        this.initExts();
        
        //count and create sprites
        if (sb3.no(fileObj)) return; //make sure script exists
        
        var Sprites = [];
        
        var projInfo = fileObj['targets'] //extract targets from JSON data
        
        //create sprite objects, add scripts
        for(var i=0; i <projInfo.length; i++){
            if(projInfo[i]['isStage'] == false){
                var addMe = new Sprite(projInfo[i]['name']);
                Sprites.push(addMe);
                for (var e = 0; e < this.event_opcodes.length; e++) {
                    var event = this.event_opcodes[e]
                    var ID = sb3.findBlockID(projInfo[i]['blocks'],event);
                    if (ID != null) {
                        var newScript = sb3.makeScript(projInfo[i]['blocks'], ID,true);
                        if (newScript != null) {
                            addMe.addScript(newScript);
                        }
                    }
                }
            } else { //if it is the stage, check for backdrop
                if (projInfo[i]['costumes'].length > 1) {
                    this.requirements.HaveBackdrop.bool = true;
                }
            }
        }
        
        //check for enough sprites
        if (Sprites.length > 2) {
            this.requirements.HaveThreeSprites.bool = true;
        }
        
        
        for(var s=0; s < Sprites.length; s++) { //iterate sprites
            var sprite = Sprites[s];
            var events = [];
            var valids = [];
            
           
            var scripts = sprite.getScripts();
            
            var keyPressEvents = [];
            for (var p=0; p <scripts.length; p++){ //iterate scripts
                
                var hide = false;
                var show = false;
                var wait = false;
                var turn = false;
                
            
                for(var b in scripts[p]) {//iterate blocks
                    
                    var opcode = scripts[p][b]['opcode'];
        
                    
                    //check for turning
                    if (opcode.includes("motion_turn")) {
                        turn = true;
                    }
                    
                    //check for hide
                    if (opcode == 'looks_hide') {
                        hide = true;
                    }
                    
                    //check for show
                    if (opcode == 'looks_show') {
                        show = true;
                    }
                    
                    //check for wait
                    if (opcode == 'control_wait') {
                        wait = true;
                    }
                    
                    //count unique events
                    if (opcode.includes("event_")) {
                        
                        //count unique key press events
                        if (opcode == "event_whenkeypressed") {
                           if (!events.includes(opcode+scripts[p][b]['fields']['KEY_OPTION'][0])) {
                               events.push(opcode+scripts[p][b]['fields']['KEY_OPTION'][0]);
                               if (Object.keys(scripts[p]).length > 1) {
                                   valids.push(scripts[p][b]);
                               }
                           }
                        } else if (opcode == 'event_whenthisspriteclicked' || opcode == 'event_whenflagclicked') { //count other events
                            if (!events.includes(opcode)) {
                                events.push(opcode);
                                if (Object.keys(scripts[p]).length > 1) {
                                   valids.push(scripts[p][b]);
                                }
                            } 
                
                        }
                        
                    }
                    
                    
                    
                } //end of blocks loop
                
                 //check that a sprite spins
                if (turn && wait) {
                    this.extensions.SpriteSpins.bool = true;
                }

                //check that a sprite blinks
                if (hide && show && wait) {
                    this.extensions.SpriteBlinks.bool = true;
                }
            
            
        
            }  //end of scripts loop
            

            //POTENTIAL ISSUE:
            //because the following requirements are found using counts
            //Sprite One for one requirement may not match Sprite One in the other
            //However, as opposed to a requirement like: all three sprites need X,
            //this approach allows partial credit. 
    
            //check for enough unique events
            if (events.length > 1){
                switch(s) { 
                    case 0: this.requirements.SpriteOneTwoEvents.bool = true; 
                            break;
                    case 1: this.requirements.SpriteTwoTwoEvents.bool = true; 
                            break;
                    case 2: this.requirements.SpriteThreeTwoEvents.bool = true; 
                            break;
                    default: break;
                }  
            }
            
            
            //check for enough valid scripts
            if(valids.length > 1) {
                switch(s) {
                    case 0: this.requirements.SpriteOneTwoScripts.bool = true; 
                            break;
                    case 1: this.requirements.SpriteTwoTwoScripts.bool = true; 
                            break;
                    case 2: this.requirements.SpriteThreeTwoScripts.bool = true; 
                            break;
                    default: break;
                }
            }
            
            //a sprite reacts to more than 2 events
            if (valids.length > 2) {
                this.extensions.MoreScripts.bool = true;
            }
            
            
            
    
        }
    }

}
    
module.exports = GradeEvents;
    