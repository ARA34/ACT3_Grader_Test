/*
Act 1 Events Ofrenda Autograder
Intital version and testing: Saranya Turimella, Summer 2019
*/
require('../grading-scripts-s3/scratch3')

module.exports = class {
    constructor() {
        this.requirements = {};
        this.extensions = {};
    }

    initReqs() {
        this.requirements.leftChanged = { bool: false, str: 'The left sprite has new dialogue' }; // done
        this.requirements.leftCostume = { bool: false, str: 'The left costume has been changed' }; // done
        this.requirements.rightCostume = { bool: false, str: 'The right costume has been changed' }; // done
        this.requirements.midCostume = { bool: false, str: 'The middle costume has been changed' };
        this.requirements.interactiveRight = { bool: false, str: 'Right sprite uses the "when this sprite clicked" block (is interactive)' }; // done
        this.requirements.interactiveMiddle = { bool: false, str: 'Middle sprite uses the "when this sprite clicked" block (is interactive)' }; // done
        this.requirements.speakingRight = { bool: false, str: 'Right sprite has a script with a say block in it' }; // done
        this.requirements.speakingMiddle = { bool: false, str: 'Middle sprite has a script with a say block in it' }; // done

        // done
        this.requirements.speaking1 = { bool: false, str: '1 sprite uses the say block' };
        this.requirements.speaking2 = {bool: false, str: '2 sprites use the say block'};
        this.requirements.speaking3 = {bool: false, str: '3 sprites use the say block'};
        this.requirements.interactive1 = { bool: false, str: '1 sprite is interactive' };
        this.requirements.interactive2 = {bool: false, str: '2 sprites are interactie'};
        this.requirements.costume1 = {bool: false, str: '1 sprite has a new costume'};
        this.requirements.costume2 = {bool: false, str: '2 sprites have a new costume'};
        this.requirements.costume3 = {bool: false, str: '3 sprites have a new costume'};
        
       
        // // extensions
        this.extensions.usesPlaySoundUntilDone = { bool: false, str: 'The project uses the "Play Sound Until" block in a script' };
        this.extensions.usesGotoXY = { bool: false, str: 'The project uses the "Go to XY" block in a script' };
        this.extensions.keyCommand = { bool: false, str: 'The project uses a "when "key" pressed" block in a script' };
    }

    grade(fileObj, user) {
        var project = new Project(fileObj, null);
        var original = new Project(require('../act1-grading-scripts/originalOfrenda-test'), null);

        this.initReqs();
        if (!is(fileObj)) return;

        let origCostumeLeft = 0;
        let origCostumeRight = 0;
        let origCostumeMiddle = 0;
        let origLeftDialogue = '';

        // gets the costumes from the original project 
        var oldCostumes = [];
        for (let origTarget of original.targets) {
            if (origTarget.name === 'Left') {
                let currCost1 = origTarget.currentCostume;
                origCostumeLeft = origTarget.costumes[currCost1].assetId;
                oldCostumes.push(origCostumeLeft);
                for (let block in origTarget.blocks) {
                    if (origTarget.blocks[block].opcode === 'looks_sayforsecs') {
                        origLeftDialogue = origTarget.blocks[block].inputs.MESSAGE[1][1];
                    }
                }
            }
            if (origTarget.name === 'Right') {
                let currCost2 = origTarget.currentCostume;
                origCostumeRight = origTarget.costumes[currCost2].assetId;
                oldCostumes.push(origCostumeRight);
            }
            if (origTarget.name === 'Middle') {
                let currCost3 = origTarget.currentCostume;
                origCostumeMiddle = origTarget.costumes[currCost3].assetId;
                oldCostumes.push(origCostumeMiddle);
            }
        }

        let leftCost = 0;
        let midCost = 0;
        let rightCost = 0;
        let leftDialogue = '';
        let rightDialogue = '';
        let midDialogue = '';
        let midInteraction = false;
        let rightInteraction = false;
        var soundOptions = ['looks_say', 'looks_sayforsecs'];
        var newCostumes = [];
        let left = false;
        let middle = false;
        let right = false;

        // strict requirements
        for (let target of project.targets) {
            if (target.isStage) {
                continue;
            }
           
            if (target.name === 'Left') {
                let cost1 = target.currentCostume;
                leftCost = target.costumes[cost1].assetId;
                newCostumes.push(leftCost);
                for (let block in target.blocks) {
                    if (soundOptions.includes(target.blocks[block].opcode)) {
                        if (target.blocks[block].next === null && target.blocks[block].parent === null) {
                            continue;
                        } else {
                            leftDialogue = target.blocks[block].inputs.MESSAGE[1][1];
                        }

                    }
                }
                if (leftDialogue !== origLeftDialogue && leftDialogue !== '') {
                    this.requirements.leftChanged.bool = true;
                }
                if (leftCost !== origCostumeLeft && leftCost !== 0) {
                    left = true;
                    this.requirements.leftCostume.bool = true;
                }
            }
            // make sure that the code is not the same as the original here, copy in from the bottom
            if (target.name === 'Middle') {
                let cost2 = target.currentCostume;
                midCost = target.costumes[cost2].assetId;
                newCostumes.push(midCost);
                for (let block in target.blocks) {
                    if (target.blocks[block].opcode === 'event_whenthisspriteclicked') {
                        if (target.blocks[block].next === null && target.blocks[block].parent === null) {
                            continue;
                        } else if ((target.blocks[block].next === "/f[ltBij)7]5Jtg|W(1%") && (target.blocks[block].parent === null)) {
                            let nextBlock = target.blocks[block].next;
                            if (target.blocks[nextBlock].next === null) {
                                continue;
                                // means that they have added another block to the script, meaning it is different from 
                                // the original
                            } else {
                                midInteraction = true;
                            }
                        } else {
                            midInteraction = true;
                        }
                    }
                    if (soundOptions.includes(target.blocks[block].opcode)) {
                        if (target.blocks[block].next === null && target.blocks[block].parent === null) {
                            continue;
                        } else {
                            midDialogue = target.blocks[block].inputs.MESSAGE[1][1];
                        }
                    }
                }
                if (midInteraction) {
                    this.requirements.interactiveMiddle.bool = true;
                }
                if (midDialogue !== '') {
                    this.requirements.speakingMiddle.bool = true;
                }
                if (midCost !== origCostumeMiddle && midCost !== 0) {
                    middle = true;
                    this.requirements.midCostume.bool = true;
                }
            }

            if (target.name === 'Right') {
                let cost3 = target.currentCostume;
                rightCost = target.costumes[cost3].assetId;
                newCostumes.push(rightCost);
                for (let block in target.blocks) {
                    if (target.blocks[block].opcode === 'event_whenthisspriteclicked') {
                        if (target.blocks[block].next === null && target.blocks[block].parent === null) {
                            continue;
                        }
                        else {
                            rightInteraction = true;
                        }
                    }
                    if (soundOptions.includes(target.blocks[block].opcode)) {
                        if (target.blocks[block].next === null && target.blocks[block].parent === null) {
                            continue;
                        } else {
                            rightDialogue = target.blocks[block].inputs.MESSAGE[1][1];
                        }
                    }
                }
                if (rightInteraction) {
                    this.requirements.interactiveRight.bool = true;
                }
                if (rightDialogue !== '') {
                    this.requirements.speakingRight.bool = true;
                }
                if (rightCost !== origCostumeRight && rightCost !== 0) {
                    right = true;
                    this.requirements.rightCostume.bool = true;
                }
            }
        }


        // --------------------------------------------------------------------------------------------------------- //

    
        let speaks = false;
        let interactive = false;
        let numInteractive = 0;
        let numSpeaking = 0;
        let numCostumes = 0;

        //f there is a say block in a sprite that is not named catrina, and that say block is not used in the same 
        //context as the original project (same parent and next block)
        for (let target of project.targets) {
            speaks = false;
            interactive = false;
            if (target.name === 'Catrina') {
                continue;
            } else if (target.isStage) { continue;}
            else {
                //console.log(speaks);
                for (let script in target.scripts) {
                    for (let block in target.scripts[script].blocks) {
                        if (soundOptions.includes(target.scripts[script].blocks[block].opcode)) {
                           // console.log(speaks);
                            if ((target.scripts[script].blocks[block].next === "Q.gGFO#r}[Z@fzClmRq-") &&
                                (target.scripts[script].blocks[block].parent === "taz8m.4x_rVweL9%J@(3") &&
                                (target.scripts[script].blocks[block].inputs.MESSAGE[1][1] === "I am Grandpa John.")) {
                                continue;
                            } else if ((target.scripts[script].blocks[block].next === "sPl?mFlNaaD_l]+QJ.CW") &&
                                (target.scripts[script].blocks[block].parent === "Y5!LLf.Gqemqe/6!)t=e") &&
                                (target.scripts[script].blocks[block].inputs.MESSAGE[1][1] === "I loved to cook with my granchildren.")) {
                                continue;
                            }
                            else {
                                    
                                    speaks = true;
                                }
                        }

                        if (target.scripts[script].blocks[block].opcode === 'event_whenthisspriteclicked') {
                           
                            if (target.scripts[script].blocks[block].next === "}VBgCH{K:oDh6pV0h.pi" && target.scripts[script].blocks[block].parent === null) {
                                continue;
                            } else if (target.scripts[script].blocks[block].next === "/f[ltBij)7]5Jtg|W(1%" && target.scripts[script].blocks[block].parent === null) {
                                continue;
                               
                            }  else if (target.scripts[script].blocks[block].next === null && target.scripts[script].blocks[block].parent === null) {
                                continue;
                            }
                            else {
                                   
                                    interactive = true;
                                }
                        }

                        // extensions
                        if (target.scripts[script].blocks[block].opcode === 'sound_playuntildone') {
                            if (target.scripts[script].blocks[block].next === null && target.scripts[script].blocks[block].parent === null) {
                                continue;
                            } else {
                                this.extensions.usesPlaySoundUntilDone.bool = true;
                            }
                        }
                        if (target.scripts[script].blocks[block].opcode === 'event_whenkeypressed') {
                            if (target.scripts[script].blocks[block].next === null && target.scripts[script].blocks[block].parent === null) {
                                continue;
                            } else {
                               this.extensions.keyCommand.bool = true;
                            }
                        }
                        if (target.scripts[script].blocks[block].opcode === 'motion_gotoxy') {
                            if (target.scripts[script].blocks[block].next === null && target.scripts[script].blocks[block].parent === null) {
                                continue;
                            } else {
                                this.extensions.usesGotoXY.bool = true;
                            }
                        }
                    }
                    
                }
               
                if (speaks === true) {
                    numSpeaking ++;
                }
                
                
                if (interactive === true) {
                    numInteractive ++;
                }
                
            }
        }
       
       
        if (numSpeaking >= 1) {
            this.requirements.speaking1.bool = true;
        }
        if (numSpeaking >= 2) {
            this.requirements.speaking2.bool = true;
        }
        if (numSpeaking >= 3) {
            this.requirements.speaking3.bool = true;
        }
        if (numInteractive >= 1) {
           this.requirements.interactive1.bool = true;
        }
        if (numInteractive >= 2) {
           this.requirements.interactive2.bool = true;
        }
       
        // only right has a new costume
        if (right === true) {
            numCostumes ++;
        }
        if (left == true) {
            numCostumes ++;
        }
        
        if (middle == true) {
            numCostumes++;
        }

      
        if (numCostumes === 1) {
            this.requirements.costume1.bool = true;
        } 
        if (numCostumes === 2) {
           // this.requirements.costume2.bool = true;
        }
        else if (numCostumes === 3) {
            this.requirements.costume3.bool = true;
        }
    }
} 