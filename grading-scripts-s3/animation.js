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
    
    opcode: function(block) { //retrives opcode from a block object 
        if (this.no(block)) return "";
        return block['opcode'];
    }, 
    
    countBlocks: function(blocks,opcode){ //counts number of blocks with a given opcode
        var total = 0;
		for(id in blocks){ 
            if(blocks[id]['opcode'] == opcode){
                total = total + 1;
            }
        }
        return total;
    }, //done
     
    countBlocksOfType: function(blocks,type){ //counts number of blocks with a given opcode
        var total = 0;
		for(id in blocks){ 
            if(blocks[id] != undefined && blocks[id]['opcode'].includes(type)){
                total = total + 1;
            }
        }
        return total;
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
    } 
};

class GradeAnimation {

    constructor() {
        this.requirements = {};
        this.extensions = {}
    }

    initReqs() {
        //checks for initial position
        this.requirements.goodStartPosition = {bool: false, str: 'Bee starts at the beginning of the track.'};
        // checks for non-moving animation
        this.requirements.handlesDownArrow = {bool:false, str:'Bee handles down arrow.'};
        this.requirements.downArrowCostumeChange = {bool:false, str:'Bee changes costume on down arrow.'};
        this.requirements.downArrowWaitBlock = {bool:false, str:'Bee wait block on down arrow.'};
        // checks for moving animation
        this.requirements.handlesSpaceBar = {bool:false, str:'Bee handles space bar.'};;
        this.requirements.spaceBarLoop = {bool:false, str:'Bee loop on space bar.'};;
        this.requirements.spaceBarMovement = {bool:false, str:'Bee moves on space bar.'};;
        this.requirements.spaceBarCostumeChange = {bool:false, str:'Bee uses costume change on space bar.'};;
        this.requirements.spaceBarWaitBlock = {bool:false, str:'Bee has wait block on space bar.'};;
        // checks for race winner
        this.requirements.BeeReachesFinish = {bool:false, str:'Bee reaches the finish line.'};;
        
    }
    
    initExts() {
        // checks for extra components
        
        this.extensions.HasWinner = {bool: false, str:'There is a true winner to the race.'}
        
        // victory dance, turn block
        this.extensions.WinnerVictoryDanceCostume = {bool:false, str:'Winner changes costume during victory dance.'};
        this.extensions.WinnerVictoryDanceTurn = {bool:false, str:'Winner uses turn block during victory dance.'};
        
        this.extensions.BeeWiggle = {bool:false, str:'Made the Bee take a wiggly path.'}
        
        this.extensions.AddedKangaroo = {bool:false, str:'Added Kangaroo.'}
        this.extensions.KangarooHop ={bool:false, str:'Made the Kangaroo hop.'}
        this.extensions.KangarooWiggle = {bool:false, str:'Made the Kangaroo take a wiggly path.'}
        
        
    }
    
    
    


    grade(fileObj, user) {
        this.initReqs();
        this.initExts();
        // for private method
        var that = this;

        
        //sprites
        var bee = null;
        var snake = null;
        var kangaroo = null;
        
        // general metrics
        var validMoves = ['motion_gotoxy', 'motion_changexby', 'motion_changeyby', 'motion_movesteps', 'motion_glidesecstoxy'];
        var validLoops = ['control_forever', 'control_repeat', 'control_repeat_until'];
        var validCostumes = ['looks_switchcostumeto', 'looks_nextcostume'];

        var minStartX = -200;
        var beeRepeats = 0;
        var beeWait = 0.001;
        var beeSteps = 0;
        
        var snakeRepeats = 0;
        var snakeWait = 0.001;
        var snakeSteps = 0;
        
        var kangarooRepeats = 0;
        var kangarooWait = 0.001;
        var kangarooSteps = 0;
        
        var winner = null;
        var winnerSpaceScript = null;
        
        var beeSpaceScript = null;
        var snakeSpaceScript = null;
        var kangarooSpaceScript = null;
        
        
        for(var i in fileObj['targets']){ //find bee
            var obj = fileObj['targets'][i];
            switch(fileObj['targets'][i]['name']) {
                case('Bee') : bee = obj;
                                break;
                case('Snake') : snake = obj;
                                break;
                case('Kangaroo') : kangaroo = obj;
                                    break;
                default: break;
                    
                }
        }
        
//GRADING BEE: ---------------------------
        
        if (bee != null){

            //make start script (on green flag)
            var startid = sb3.findBlockID(bee['blocks'], 'event_whenflagclicked');
            if (startid != null) {
                var startScript = sb3.makeScript(bee['blocks'],startid,true);

                for (var i in startScript){
                    //check for valid start position
                    if (startScript[i]['opcode'] == 'motion_gotoxy') {
                        if (startScript[i]['inputs']['X'][1][1] > minStartX){
                            this.requirements.goodStartPosition.bool = true;
                        }
                    }
                }
            }


            //make space key script
            var keyid = sb3.findKeyPressID(bee['blocks'], 'space');
            
            if(keyid != null){
                var numLoops = 0;
                this.requirements.handlesSpaceBar.bool = true;
                beeSpaceScript = sb3.makeScript(bee['blocks'], keyid,true);
                for(var i in beeSpaceScript){
                    //check for loop
                    if(validLoops.includes(beeSpaceScript[i]['opcode'])){
                        this.requirements.spaceBarLoop.bool = true;
                        numLoops++;
                    }  
                    //check for wait block
                    if(beeSpaceScript[i]['opcode'] == 'control_wait'){
                        this.requirements.spaceBarWaitBlock.bool = true;
                    }
                    //check for movement 
                    if(validMoves.includes(beeSpaceScript[i]['opcode'])){
                        this.requirements.spaceBarMovement.bool = true;
                    }
                    //check for costumes
                    if(validCostumes.includes(beeSpaceScript[i]['opcode'])){
                        this.requirements.spaceBarCostumeChange.bool = true;
                    }
                    if (numLoops == 1){
                        //check for wiggly path (turn blocks in first loop)
                        if (beeSpaceScript[i]['opcode'].includes('motion_turn')) {
                            this.extensions.BeeWiggle.bool = true;
                        }
                            //get stats reaching finish and winner
                        if (beeSpaceScript[i]['opcode'] == 'control_repeat') {
                            beeRepeats += Number(beeSpaceScript[i]['inputs']['TIMES'][1][1]);
                        
                        }
                        if (beeSpaceScript[i]['opcode'] == 'motion_movesteps') {
                            beeSteps += Number(beeSpaceScript[i]['inputs']['STEPS'][1][1]);
                          
                        }
                        if (beeSpaceScript[i]['opcode'] == 'control_wait'){
                            beeWait += Number(beeSpaceScript[i]['inputs']['DURATION'][1][1]);
                           
                        }
                        
                    }
                    
                    //check for reaching finish
                    if (beeRepeats * beeSteps >= 360 && this.requirements.goodStartPosition.bool){
                        this.requirements.BeeReachesFinish.bool = true;
                    }

                    
                }
            }


            //make down arrow script
            var arrowid = sb3.findKeyPressID(bee['blocks'], 'down arrow');
            if(arrowid != null){
                this.requirements.handlesDownArrow.bool = true;
                var arrowScript = sb3.makeScript(bee['blocks'], arrowid,true);

                for(var i in arrowScript){
                    //check for costume change
                    if(arrowScript[i]['opcode'] == 'looks_switchcostumeto' || arrowScript[i]['opcode'] == 'looks_nextcostume'){
                        this.requirements.downArrowCostumeChange.bool = true;
                    }  
                    //check for wait block
                    if(arrowScript[i]['opcode'] == 'control_wait'){
                        this.requirements.downArrowWaitBlock.bool = true;
                    }
                }
            }

    }
    
//GRADING SNAKE: ---------------------------
        if (snake != null){
           var snakekeyid = sb3.findKeyPressID(snake['blocks'], 'space');

            if(snakekeyid != null){
                numLoops = 0;
                snakeSpaceScript = sb3.makeScript(snake['blocks'], snakekeyid,true);
                for(var i in snakeSpaceScript){  
                    if(validLoops.includes(snakeSpaceScript[i]['opcode'])){
                        numLoops++;
                    }  
                    if (numLoops == 1){
                            //get stats reaching finish and winner
                        if (snakeSpaceScript[i]['opcode'] == 'control_repeat') {
                            snakeRepeats += Number(snakeSpaceScript[i]['inputs']['TIMES'][1][1]);
                            
                        }
                        if (snakeSpaceScript[i]['opcode'] == 'motion_movesteps') {
                            snakeSteps += Number(snakeSpaceScript[i]['inputs']['STEPS'][1][1]);
                          
                        }
                        if (snakeSpaceScript[i]['opcode'] == 'control_wait'){
                            snakeWait += Number(snakeSpaceScript[i]['inputs']['DURATION'][1][1]);
                            
                        }
                        
                    }
                }
            }
                                               
        }
    
    
//GRADING KANGAROO: ---------------------------
        if (kangaroo != null){
            
            //check for kangaroo visibility
            if (kangaroo['visible']){
                this.extensions.AddedKangaroo.bool = true;
            } else {
                for(var i in kangaroo['blocks']){
                    if (kangaroo['blocks'][i]['opcode'] == 'looks_show'){
                        this.extensions.AddedKangaroo.bool = true;
                        break;
                    }
                }  
            }
            
            var kangarookeyid = sb3.findKeyPressID(kangaroo['blocks'], 'space');

            if(kangarookeyid != null){
                numLoops = 0;
                kangarooSpaceScript = sb3.makeScript(kangaroo['blocks'], kangarookeyid,true);
                for(var i in kangarooSpaceScript){
                    if(validLoops.includes(kangarooSpaceScript[i]['opcode'])){
                        numLoops++;
                    }  
                    if (numLoops == 1){
                            //check for kangaroo wiggly path
                        if (kangarooSpaceScript[i]['opcode'].includes('motion_turn')){
                            this.extensions.KangarooWiggle.bool = true;
                        }
                        //check for kangaroo hop (change costumes)
                        if(validCostumes.includes(kangarooSpaceScript[i]['opcode'])){
                            this.extensions.KangarooHop.bool = true;
                        }
                            //get stats reaching finish and winner
                        if (kangarooSpaceScript[i]['opcode'] == 'control_repeat') {
                            kangarooRepeats += Number(kangarooSpaceScript[i]['inputs']['TIMES'][1][1]);
                            
                        }
                        if (kangarooSpaceScript[i]['opcode'] == 'motion_movesteps') {
                            kangarooSteps += Number(kangarooSpaceScript[i]['inputs']['STEPS'][1][1]);
                            
                        }
                        if (kangarooSpaceScript[i]['opcode'] == 'control_wait'){
                            kangarooWait += Number(kangarooSpaceScript[i]['inputs']['DURATION'][1][1]);
                            
                        }
                        
                    }
                }
            }
        }
    
    
//FINAL GRADING: ------------------------------   
        if (bee == null || snake == null || kangaroo == null) {
            return;
        }
        
        var beeSpeed = (beeSteps / beeWait)*beeRepeats;
        var snakeSpeed = (snakeSteps / snakeWait)*snakeRepeats;
        var kangarooSpeed = (kangarooSteps / kangarooWait)*snakeRepeats;
        
        
        //find a winner
        if (beeSpeed > snakeSpeed) {
            if (snakeSpeed > kangarooSpeed || beeSpeed > kangarooSpeed) {
                winner = bee;
                winnerSpaceScript = beeSpaceScript;
            } else if (beeSpeed < kangarooSpeed) {
                winner = kangaroo;
                winnerSpaceScript = kangarooSpaceScript;
            }
        } else if (snakeSpeed > beeSpeed) {
            if (beeSpeed > kangarooSpeed || snakeSpeed > kangarooSpeed) {
                winner = snake;
                winnerSpaceScript = snakeSpaceScript;
            } else if (snakeSpeed < kangarooSpeed) {
                winner = kangaroo;
                winnerSpaceScript = kangarooSpaceScript;
            }   
        }
                
        //check for winner victory dance
        if (winner != null) {
            this.extensions.HasWinner.bool = true;
            numLoops = 0;
            for(var i in winnerSpaceScript) {
                if (validLoops.includes(winnerSpaceScript[i]['opcode'])){
                    numLoops++;
                }
                if (numLoops > 1) { //in second part
                    if(winnerSpaceScript[i]['opcode'] == 'looks_switchcostumeto' || winnerSpaceScript[i]['opcode'] == 'looks_nextcostume'){
                        this.extensions.WinnerVictoryDanceCostume.bool = true;
                    }
                    if (winnerSpaceScript[i]['opcode'].includes('motion_turn')){
                        this.extensions.WinnerVictoryDanceTurn.bool = true;
                    }

                }
                
                
            }
            
             
        }
        
        

        
        
        
    
    }


}
module.exports = GradeAnimation;