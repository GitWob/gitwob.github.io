"use strict";


const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

// #region pixi establishment

// starting by creating the pixi application
const app = new PIXI.Application({
    width: (windowWidth * 0.95).toFixed(0),
    height: (windowHeight * 0.95).toFixed(0),
    backgroundColor: 0xD3DACE //0xBACDB0
});
document.body.appendChild(app.view);

PIXI.settings.ROUND_PIXELS = true;

// loading sprites
app.loader
    .add("circleBase", "images/circleBase.png")
    .add("circleInjured", "images/circleInjured.png")
    .add("circleStrong", "images/circleStrong.png")
    .add("circleGeneral", "images/circleGeneral.png")
    .add("circleGeneralInjured", "images/circleGeneralInjured.png")
    .add("circleGeneralStrong", "images/circleGeneralStrong.png")
    .add("squareBase", "images/squareBase.png")
    .add("squareInjured", "images/squareInjured.png")
    .add("squareStrong", "images/squareStrong.png")
    .add("squareGeneral", "images/squareGeneral.png")
    .add("squareGeneralInjured", "images/squareGeneralInjured.png")
    .add("squareGeneralStrong", "images/squareGeneralStrong.png")
    .add("healthKit", "images/healthKit.png")
    .add("wall", "images/wall.png")
    .add("trench", "images/trench.png");
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup); // this event calls the setup function!
app.loader.load();

// #endregion

// #region fields

// constants
const sceneWidth = (windowWidth * 0.95).toFixed(0);
const sceneHeight = (windowHeight * 0.95).toFixed(0);
const verticalMidline = sceneWidth / 2;
const horizontalMidline = sceneHeight / 2;
const leftQuarterLine = sceneWidth / 4;
const rightQuarterLine = sceneWidth - (sceneWidth / 4);
const teamTint = 0x789C64;
const teamSelectedTint = 0xBEEBBA;
const enemyTint = 0xBA404E;

// game variables
let stage;

// item arrays
let army = [];
let circles = [];
let squares = [];
let bullets = [];
let healthKits = [];
let walls = [];
let trenches = [];

// game flow
let coinFlip;
let playerTeam;
let selectedCharacter;

// tooltips/text
let moveCircle;
let shootCircle;
let titleCenterText;
let gameCenterText;
let moveToolTip;
let shootToolTip;
let tipHeader;
let tipText;
let tipStart;
let tips = [];

// scenes
let tipScene;
let titleScene;
let gameScene;
let endScene;

// sounds
let introSound;
let clickSound1;
let scratchSound1;
let armorhitSound;
let injuryhitSound;
let suitupSound;
let healingSound;
let walkSound;
let groupwalkSound;
let shootSound;
let bumpSound;

// #endregion

// #region set up

// sets up pixi scenes, triggers the opening titles, loads sounds, and calls the start game function.
function setup() {
    stage = app.stage;

    // create the 'tip' scene
    tipScene = new PIXI.Container();
    stage.addChild(tipScene);
    tipScene.visible = true;

    // create the 'title' scene and make it invisible
    titleScene = new PIXI.Container();
    stage.addChild(titleScene);
    titleScene.visible = false;

    // create the 'game' scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    gameScene.sortableChildren = true; // this lets us make sure circles and squares go on top
    stage.addChild(gameScene);

    // create the 'end' scene and make it invisible
    endScene = new PIXI.Container();
    endScene.visible = false;
    stage.addChild(endScene);

    // create tip text
    fillTipArray(tips);
    createTip(tipScene, tips);

    // load sounds
    introSound = new Howl({
        src: ['sounds/intro.wav']
    });

    clickSound1 = new Howl({
        src: ['sounds/clickplop1.wav']
    });

    scratchSound1 = new Howl({
        src: ['sounds/scratch1.wav']
    });

    armorhitSound = new Howl({
        src: ['sounds/armorhit.wav']
    });

    injuryhitSound = new Howl({
        src: ['sounds/injuryhit.wav']
    });

    suitupSound = new Howl({
        src: ['sounds/suitup.wav']
    });

    healingSound = new Howl({
        src: ['sounds/healing.wav']
    });

    walkSound = new Howl({
        src: ['sounds/walk.wav']
    });

    groupwalkSound = new Howl({
        src: ['sounds/groupwalk.wav']
    });

    shootSound = new Howl({
        src: ['sounds/shoot.wav']
    });

    bumpSound = new Howl({
        src: ['sounds/bump.wav']
    });
}

// #endregion

// #region delta time game loop

// calculates damage to characters and bullets, cleans up dead objects, and checks for a win state
function gameLoop() {
    // calculating "delta time" - from the circle blast homework!
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;

    for (let b of bullets) {
        b.move(dt);

        if (b.y < -10 || b.y > sceneHeight + 10 || b.x < -10 || b.x > sceneWidth + 10) {
            b.isActive = false; // Cleans up bullets outside the world
        }

        for (let w of walls)
        {
            if (rectsIntersect(b, w))
            {
                bumpSound.play();
                b.isActive = false;
            }
        }

        if (b.trench == true)
        {
            let inTrench = false;
            for (let t of trenches)
            {
                if (rectsIntersect(b, t))
                {
                    inTrench = true;
                    break;
                }
            }
            if (inTrench == false)
            {
                bumpSound.play();
                b.isActive = false;
                gameScene.removeChild(b);
            }
        }
    }

    if (circles.length > 0) {
        for (let c of circles) {
            // trench check
            if (checkElevation(c) == true)
            {
                c.trench = true;
            }
            else
            {
                c.trench = false;
            }

            // bullet interactions
            let squareBullets = bullets.filter(b => b.team == "squares");
            for (let sqb of squareBullets) {
                if (rectsIntersect(c, sqb) && c.trench == sqb.trench) {
                    if (c.health == 3)
                    {
                        armorhitSound.play();
                    }
                    else
                    {
                        injuryhitSound.play();
                    }
                    c.damage();
                    gameScene.removeChild(sqb);
                    sqb.isActive = false;
                }
            }

            // updating looks
            c.drawState();

            // clearing up
            if (c.health == 0) {
                gameScene.removeChild(c);
                c.alive = false;
            }
        }
    }

    if (squares.length > 0) {
        for (let sq of squares) {
            // trench check
            if (checkElevation(sq) == true)
            {
                sq.trench = true;
            }
            else
            {
                sq.trench = false;
            }

            // bullet interactions
            let circleBullets = bullets.filter(b => b.team == "circles");
            for (let cb of circleBullets) {
                if (rectsIntersect(sq, cb) && sq.trench == cb.trench) {
                    if (sq.health == 3)
                    {
                        armorhitSound.play();
                    }
                    else
                    {
                        injuryhitSound.play();
                    }
                    sq.damage();
                    gameScene.removeChild(cb);
                    cb.isActive = false;
                }
            }

            // updating looks
            sq.drawState();

            // clearing up
            if (sq.health == 0) {
                gameScene.removeChild(sq);
                sq.alive = false;
            }
        }
    }

    // get rid of dead bullets, circles, health kits, and squares
    bullets = bullets.filter(b => b.isActive);
    healthKits = healthKits.filter(hk => hk.isActive);
    squares = squares.filter(sq => sq.alive);
    circles = circles.filter(c => c.alive);

    // game ender
    if (circles.length == 0)
    {
        endGame("SQUARES", squares);
    }
    else if (squares.length == 0)
    {
        endGame("CIRCLES", circles);
    }
}

// #endregion

// #region starting, ending, scene management thereof

// creates a random helpful tip - generally in the tip scene, but it can go anywhere
// this is the first thing the audience
function createTip(scene, tips)
{
    let randomIndex = getRandom(0, tips.length - 1).toFixed(0);
    let tip = tips[randomIndex];
    console.log(randomIndex);
    tipHeader = bigText(scene, "HELPFUL TIP", verticalMidline, horizontalMidline - 200);
    scene.addChild(tipHeader);
    tipText = toolTipText(scene, tip, verticalMidline, horizontalMidline, 18);
    scene.addChild(tipText);
    tipStart = bigText(scene, "START", verticalMidline, horizontalMidline + 200);
    scene.addChild(tipStart);
    tipStart.interactive = true;
    tipStart.buttonMode = true;
    // this start button thing is taken from Circle Blast. all credit to the 235 professors!
    tipStart.on("pointerup", function(){
        rollTitles(titleScene, "TRENCH GAME");
    }); // startGame is a function reference
    tipStart.on("pointerover", e => e.target.alpha = 0.7); // concise arrow function with no brackets
    tipStart.on("pointerout", e => e.currentTarget.alpha = 1.0); // ditto
}

// creates the main title scene and hides the tip scene
function rollTitles(scene, text) {
    tipScene.visible = false;
    titleScene.visible = true;
    introSound.play();
    setTimeout(() => {
        titleCenterText = bigText(scene, text);
    }, 1500);
    setTimeout(clearTitleText, 3500);
    setTimeout(startGame, 4000);
}

// hides the titles and opens up the game scene
// also starts off the random level generation calls with loadLevel, starts the gameLoop, and sets up the first turn
function startGame() {
    titleScene.visible = false;
    gameScene.visible = true;
    loadLevel();
    coinFlip = getEvenOdd();
    newTurn();
    
    // start update loop
    app.ticker.add(gameLoop);
}

// clears the screen, moves to the end scene, prints the winning team's name, and shows the remaining team members
function endGame(winnerName, winnerList) {
    healingSound.play();
    gameScene.visible = false;
    endScene.visible = true;
    for (let winner of winnerList)
    {
        endScene.addChild(winner);
    }
    for (let trench of trenches)
    {
        endScene.addChild(trench);
    }
    bigText(endScene, `${winnerName} WIN`);
    app.ticker.remove(gameLoop);
}

// #endregion

// #region titles and text

// fills out the tip array with helpful tips
function fillTipArray(tipArray)
{
    tipArray.push("Turns are decided at random! You'll see whose move it is at the beginning of each turn. Click a shape to select them.");
    tipArray.push("Generals (the shapes with smaller shapes inside them) tell the shapes around them where to go.");
    tipArray.push("If a health kit is within a shape's move circle, you can click it to heal that shape!");
    tipArray.push("Shapes with a plus sign on them are stronger.");
    tipArray.push("Shapes with a dot on them can only take one more hit!");
    tipArray.push("Bullets will whiz over your head when you are in a trench, but only if the bullet came from outside the trench.");
    tipArray.push("Keep your generals safe or your marches are going to get much, much longer.");
    tipArray.push("Bullets keep flying outside your shooting circle, but your soldiers are more accurate inside it.")
    tipArray.push("It is possible to win the game as a sniper.");
    tipArray.push("It is possible to win the game without moving any troops.")
    tipArray.push("If you can capture a trench, hold on to it!")
}



// creates big text at the center of the given scene unless you give it coordinates
function bigText(scene, text, x = verticalMidline, y = horizontalMidline - 50) {
    let textObject = new PIXI.Text(text);
    textObject.style = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 32,
        fontFamily: "Arial",
        fontWeight: "bolder",
        align: "center"
    });
    textObject.anchor.set(0.5, 0,5);
    scene.addChild(textObject);
    textObject.y = y;
    textObject.x = x;
    return textObject;
}

// creates small text anywhere in the given scene
function toolTipText(scene, text, x, y, fontSize = 14)
{
    let textObject = new PIXI.Text(text);
    textObject.style = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: fontSize,
        fontFamily: "Arial",
        fontWeight: "bolder",
        align: "center"
    });
    textObject.anchor.set(0.5, 0,5);
    scene.addChild(textObject);
    textObject.y = y;
    textObject.x = x;
    return textObject;
}

// clears the title from the title scene
function clearTitleText() {
    titleScene.removeChild(titleCenterText);
}

// clears the current big text object from the game scene
function clearGameText() {
    gameScene.removeChild(gameCenterText);
    gameCenterText = null;
}

// clears the two toolTipText objects from the game scene
function clearToolTips()
{
    gameScene.removeChild(moveToolTip);
    gameScene.removeChild(shootToolTip);
}

// #endregion

// #region level loading

// calls functions from generator.js to create random objects, then populates the scene with the new objects
function loadLevel() {
    makeTrenches(trenches);
    for (let t of trenches)
    {
        gameScene.addChild(t);
    }

    makeWalls(walls, 5, leftQuarterLine, rightQuarterLine);
    for (let w of walls)
    {
        gameScene.addChild(w);
    }

    makeHealthKits(healthKits, 10, 0, sceneWidth);
    for (let k of healthKits)
    {
        gameScene.addChild(k);
    }

    makeTeam(circles, Circle, 2, 10, 0, leftQuarterLine);
    for (let c of circles)
    {
        gameScene.addChild(c);
        c.interactive = true;
        c.buttonMode = true;
        c.on("pointerdown", characterPointerDown);
        c.on("pointerover", characterPointerOver);
        c.on("pointerout", characterPointerOut);
        c.zIndex = 10;
    }

    makeTeam(squares, Square, 2, 10, rightQuarterLine, sceneWidth)
    for (let sq of squares)
    {
        gameScene.addChild(sq);
        sq.interactive = true;
        sq.buttonMode = true;
        sq.on("pointerdown", characterPointerDown);
        sq.on("pointerover", characterPointerOver);
        sq.on("pointerout", characterPointerOut);
        sq.zIndex = 10;
    }
}

// #endregion

// #region new turn

// everything to reset for each turn gets reset, then a team is randomly selected to play the next turn
function newTurn() {
    clearGameText();
    coinFlip = getEvenOdd();
    if (coinFlip == true) {
        gameCenterText = bigText(gameScene, "CIRCLES TURN");
        playerTeam = "circles";
        army = circles;
    }
    else {
        gameCenterText = bigText(gameScene, "SQUARES TURN");
        playerTeam = "squares";
        army = squares;
    }
}

// #endregion

// #region select/deselect

// creates a new set of movement and shooting GUI circles, along with new tooltips, and assigns their functions for interactivity
// also assigns the selectedCharacter, which is used by the action functions to tell who is doing the action
function select(character) {
    // make sure you can only select circles and squares, the only objects with a team variable
    if (character.team != undefined) {
        selectedCharacter = character;
        if (character.status == "general")
        {
            moveCircle = new MoveCircle(selectedCharacter.x, selectedCharacter.y, 90);
            shootCircle = new ShootCircle(selectedCharacter.x, selectedCharacter.y, 140)
            moveToolTip = new toolTipText(gameScene, "MOVE SQUAD", selectedCharacter.x, selectedCharacter.y - 75);
            shootToolTip = new toolTipText(gameScene, "SHOOT", selectedCharacter.x, selectedCharacter.y - 125);
        }
        else
        {
            moveCircle = new MoveCircle(selectedCharacter.x, selectedCharacter.y, 72);
            shootCircle = new ShootCircle(selectedCharacter.x, selectedCharacter.y, 112)
            moveToolTip = new toolTipText(gameScene, "MOVE", selectedCharacter.x, selectedCharacter.y - 55);
            shootToolTip = new toolTipText(gameScene, "SHOOT", selectedCharacter.x, selectedCharacter.y - 100);
        }
        gameScene.addChild(moveToolTip);
        gameScene.addChild(shootToolTip);
        gameScene.addChild(shootCircle);
        gameScene.addChild(moveCircle);
        moveCircle.interactive = true;
        moveCircle.buttonMode = true;
        shootCircle.interactive = true;
        shootCircle.buttonMode = true;
        moveCircle.on("pointerdown", moveCirclePointerDown);
        moveCircle.on("pointerover", circlePointerOver);
        moveCircle.on("pointerout", circlePointerOut);
        shootCircle.on("pointerdown", shootCirclePointerDown);
        shootCircle.on("pointerover", circlePointerOver);
        shootCircle.on("pointerout", circlePointerOut);
    }
}

// clears the movement and shooting circles and their tooltips, deselects the selected character, and removes references to old GUI circles
function deselect() {
    selectedCharacter.tint = 0xFFFFFF;
    selectedCharacter = null;
    gameScene.removeChild(moveCircle);
    gameScene.removeChild(shootCircle);
    clearToolTips();
    moveCircle = null;
    shootCircle = null;
}

// #endregion

// #region actions

// note: all actions cause the turn to end and the selected character to be deselected

// moves only the selected character to a new given position
function moveSelected(x, y) {
    let w2 = selectedCharacter.width / 2;
    let h2 = selectedCharacter.height / 2;
    selectedCharacter.x = clamp(x, 0 + w2, sceneWidth - w2);
    selectedCharacter.y = clamp(y, 0 + h2, sceneHeight - h2);
    deselect();
    newTurn();
}

// moves the selected character, which must be a general for this to work, and any other regular characters around it
// also calls valid position checks and resolutions from utilities.js to make the other characters move like they're smart 
function moveGroupAroundCharacter(army, x, y) {
    let generalX = selectedCharacter.x;
    let generalY = selectedCharacter.y;
    let offsetX = x - generalX;
    let offsetY = y - generalY;
    for (let a of army)
    {
        if (a.status != "general")
        {
            let distance = Math.sqrt(Math.pow((a.x - generalX), 2) + Math.pow((a.y - generalY), 2));
            if (distance < 100)
            {
                let w2 = a.width / 2;
                let h2 = a.height / 2;
                let newX = a.x + offsetX;
                let newY = a.y + offsetY;
                a.x = clamp(newX, 0 + w2, sceneWidth - w2);
                a.y = clamp(newY, 0 + h2, sceneHeight - h2);
                for (let w of walls)
                {
                    if (rectsIntersect(a, w))
                    {
                        nudgeAway(a, w);
                    }
                }
                let others = army.filter(soldier => soldier != a)
                for (let o of others)
                {
                    if (o.containsPoint(a))
                    {
                        nudgeAway(o, a);
                    }
                }
                a.x = clamp(a.x, 0 + w2, sceneWidth - w2);
                a.y = clamp(a.y, 0 + h2, sceneHeight - h2);
            }
        }
    }

    // Finally moving the main character
    let w2 = selectedCharacter.width / 2;
    let h2 = selectedCharacter.height / 2;
    selectedCharacter.x = clamp(x, 0 + w2, sceneWidth - w2);
    selectedCharacter.y = clamp(y, 0 + h2, sceneHeight - h2);
    deselect();
    newTurn();
}

// creates a bullet heading in the direction of your mouse, with the reference point being the selected character
function shoot() {
    let mousePosition = app.renderer.plugins.interaction.mouse.global;
    let forward = getFiringAngle(selectedCharacter, mousePosition);
    let newBullet = new Bullet(selectedCharacter.x, selectedCharacter.y, forward, playerTeam, selectedCharacter.trench);
    gameScene.addChild(newBullet);
    bullets.push(newBullet);
    deselect();
    newTurn();
}

// calls the selected character's in-class heal function and uses up the given health kit
function heal(healthKit)
{
    selectedCharacter.heal();
    healthKit.isActive = false;
    gameScene.removeChild(healthKit);
    deselect();
    newTurn();
}

// #endregion

// #region character pointer functions

// BIG NOTE: this.tint really works!
// the sprites I used ended up being so transparent that the tint barely changes their colors
// if you look very closely, it's still possible to see it working, especially on characters that aren't on your team
// I'm leaving in this.tint for the sprites in case I eventually make new sprites that respond better to tinting

// deselects selected characters and selects unselected characters, as long as they're on your team
function characterPointerDown() {
    if (selectedCharacter != null)
    {
        deselect();
    }
    if (this.team == playerTeam) {
        clearGameText();
        if (this != selectedCharacter) {
            clickSound1.play();
            select(this);
        }
        else {
            deselect();
        }
    }
    else {
        this.tint = enemyTint;
    }
}

// shows a tint over the character to show if you can select them or not
function characterPointerOver() {
    if (this.team == playerTeam) {
        this.tint = teamTint;
    }
    else {
        this.tint = enemyTint;
    }
}

// sets the tint to show whether the character has been selected or not
function characterPointerOut() {
    if (this == selectedCharacter) {
        this.tint = teamSelectedTint;
    }
    else {
        this.tint = 0xFFFFFF;
    }
}

// #endregion

// #region move circle pointer functions

// checks to see whether this is a move order or a pick-up-health-kit order
// if a move order, checks to see if a general is moving a squad, or if it's just one soldier
// also prevents soldiers from moving into a wall
// if a pick-up-health-kit order, calls heal on the soldier using the picked up health kit
function moveCirclePointerDown() {
    let mousePosition = app.renderer.plugins.interaction.mouse.global;

    let moving = true;

    // check against all objects to see if this is a move
    for (let wall of walls) {
        if (mouseInBounds(mousePosition, wall)) {
            this.tint = enemyTint;
            scratchSound1.play();
            moving = false;
            return;
        }
    }

    // check against all health kits to see if this is a health kit action
    for (let health of healthKits) {
        if (mouseInBounds(mousePosition, health)) {
            if (selectedCharacter.health > 2)
            {
                scratchSound1.play();
                this.tint = enemyTint;
            }
            else
            {
                if (selectedCharacter.health == 2)
                    {
                        suitupSound.play();
                    }
                    else
                    {
                        healingSound.play();
                    }
                heal(health);
                moving = false;
            }
            return;
        }
    }

    if (moving == true) {
        if (selectedCharacter.status == "regular")
        {
            walkSound.play();
            moveSelected(mousePosition.x, mousePosition.y);
        }
        else
        {
            groupwalkSound.play();
            moveGroupAroundCharacter(army, mousePosition.x, mousePosition.y);
        }
    }
}

// calls the shoot function, which handles all shooting related work
function shootCirclePointerDown() {
    shootSound.play();
    shoot();
}

// adjusts the tint to show that you will give the order on the circle if you click inside it
function circlePointerOver() {
    this.tint = teamTint;
}

// adjusts the tint back to show that you are not about to give an order
function circlePointerOut() {
    this.tint = 0xFFFFFF;
}

// #endregion