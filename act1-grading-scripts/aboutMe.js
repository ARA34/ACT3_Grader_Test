/*
Act 1 About Me Grader
Intital version and testing: Saranya Turimella, Summer 2019
Updated to reflect new act 1 
*/
require('../grading-scripts-s3/scratch3')

module.exports = class {
    constructor() {
        this.requirements = {};
        this.extensions = {};
    }

    initReqs() {
        // sprites - done
        this.requirements.hasOneSprite = { bool: false, str: 'Project has at least one sprite' };
        this.requirements.hasTwoSprites = { bool: false, str: 'Project has at least two sprites' };
        this.requirements.hasThreeSprites = { bool: false, str: 'Project has at least three sprites' };
        // interaction - done
        this.requirements.hasOneInteractiveSprite = { bool: false, str: 'Project has at least one interactive sprite' };
        this.requirements.hasTwoInteractiveSprites = { bool: false, str: 'Project has at least two interactive sprites' };
        this.requirements.hasThreeInteractiveSprites = { bool: false, str: 'Project has at least three interactive sprites' };
        // interactive and speaking  - done
        this.requirements.hasOneSpeakingInteractive = { bool: false, str: 'Project has one interactive sprite that speaks' };
        this.requirements.hasTwoSpeakingInteractive = { bool: false, str: 'Project has two interactive sprites that speak' };
        this.requirements.hasThreeSpeakingInteractive = { bool: false, str: 'Project has three interactive sprites that speak' };
        // background - done
        this.requirements.hasBackdrop = { bool: false, str: 'This project has a backdrop' };
        // speaking - done
        this.requirements.usesSayBlock = {bool: false, str: 'This project uses a say block'};
      

        // check for block usage - done 
        this.extensions.usesThinkBlock = { bool: false, str: 'Project uses the think block' };
        this.extensions.changeSize = { bool: false, str: 'Project uses change size block' };
        this.extensions.playSound = { bool: false, str: 'Project uses play sound until done' };
        this.extensions.moveSteps = { bool: false, str: 'Project uses a move block' };
        


    }

    grade(fileObj, user) {
        var project = new Project(fileObj, null);

        this.initReqs();
        if (!is(fileObj)) return;


        let isInteractiveAndSpeaks = false;
        let numInteractiveAndSpeaks = 0;
        let numInteractive = 0;

        for (let target of project.targets) {
            if (target.isStage) {
                for (let cost in target.costumes) {
                    if ((target.costumes.length > 1) || (cost.assetID !== "cd21514d0531fdffb22204e0ec5ed84a")) {
                        this.requirements.hasBackdrop.bool = true;
                    }
                }
            }
            else {

                for (let script of target.scripts) {
                    if (script.blocks[0].opcode === 'event_whenthisspriteclicked') {
                        if (script.blocks.length > 1) {
                            numInteractive++;
                        }
                        for (let i = 0; i < script.blocks.length; i++) {
                            if ((script.blocks[i].opcode === 'looks_say') ||
                                (script.blocks[i].opcode === 'looks_sayforsecs')) {
                                isInteractiveAndSpeaks = true;
                            }
                        }
                    }

                    for (let i = 0; i < script.blocks.length; i++) {
                        if (script.blocks[i].opcode === 'looks_thinkforsecs') {
                            this.extensions.usesThinkBlock.bool = true;
                        }
                        if (script.blocks[i].opcode === 'looks_changesizeby') {
                            this.extensions.changeSize.bool = true;
                        }
                        if (script.blocks[i].opcode === 'sound_playuntildone') {
                            this.extensions.playSound.bool = true;
                        }
                        if (script.blocks[i].opcode === 'motion_movesteps') {
                            this.extensions.moveSteps.bool = true;
                        }
                        if ((script.blocks[i].opcode === 'looks_say') || (script.blocks[i].opcode === 'looks_sayforsecs')) {
                            this.requirements.usesSayBlock.bool = true;
                        }
                    
                    }
                    if (isInteractiveAndSpeaks) {
                        numInteractiveAndSpeaks ++;
                    }
                }
            }
        }

        // number of sprites
        if (project.sprites.length >= 1) {
            this.requirements.hasOneSprite.bool = true;
        } 
        if (project.sprites.length >= 2) {
            this.requirements.hasTwoSprites.bool = true;
        } 
        if (project.sprites.length >= 3) {
            this.requirements.hasThreeSprites.bool = true;
        }

        // number of interactive sprites
        if (numInteractive >= 1) {
            this.requirements.hasOneInteractiveSprite.bool = true;
        } 
        if (numInteractive >= 2) {
            this.requirements.hasTwoInteractiveSprites.bool = true;
        } 
        if (numInteractive >= 3) {
            this.requirements.hasThreeInteractiveSprites.bool = true;
        }

        // number of interactive and speaking sprites
        if (numInteractiveAndSpeaks >= 1) {
            this.requirements.hasOneSpeakingInteractive.bool = true;
        }
        if (numInteractiveAndSpeaks >= 2) {
            this.requirements.hasTwoSpeakingInteractive.bool = true;
        } 
        if (numInteractiveAndSpeaks >= 3) {
            this.requirements.hasThreeSpeakingInteractive.bool = true;
        }

    }
}
