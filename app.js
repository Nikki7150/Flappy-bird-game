// Configuration
let config = {
    renderer: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container",
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 300 },
            debug: false,
        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

let currentTheme = 'city'; // default

const themes = {
    city: {
        backgroundKey: 'background',
        backgroundPath: 'assets/background.png',
        backgroundScale: 1,
        roadKey: 'road',
        roadPath: 'assets/road.png',
        roadScale: 2,
        columnTopKey: 'column',
        columnTopPath: 'assets/column.png',
        columnBottomKey: 'column',
        columnBottomPath: 'assets/column.png',
        columnScale: { x: 1, y: 1 },
        scoreColor: '#000000',
    },
    cave: {
        backgroundKey: 'cave-background',
        backgroundPath: 'assets/cave-bg.png',
        backgroundScale: 0.65,
        roadKey: 'cave-road',
        roadPath: 'assets/cave-road.png',
        roadScale: 0.45,
        columnTopKey: 'cave-column-2',
        columnTopPath: 'assets/cave-column-2.png',
        columnBottomKey: 'cave-column-1',
        columnBottomPath: 'assets/cave-column-1.png',
        columnScale: { x: 0.3, y: 0.65 },
        scoreColor: '#ffffff',
    },
};

// variable for menu scene
let isMenuOpen = true;

// variable for settings scene
let isSettingsOpen = false;

// variable for gameOver / victory scene
let isGameEndOpen = false;

// determine if game win or lose
let isGameWon = false;

// game variable of a new instance of Phaser.Game to set up game
let game = new Phaser.Game(config);

// creating the bird
var bird;
// game end when bird lands on ground
let hasLanded = false;
let cursors;
// deect when bird has hit column
let hasBumped = false;

// variable to check if game has started
let isGameStarted = false;

// message for player to start game
let messageToPlayer;

// Remove static columns variables, add a dynamic columns group and timer
let columns;
let columnTimer;

// variable to keep track of score
let score = 0;
let targetScore = 1000; // distance to win the game
let scoreText;

// initializing end game elements
let gameEndOverlay, gameEndBg, gameEndTitle, playAgainButton, menuButton;

// initializing menu elements
let menuOverlay, menuBg, menuTitle, newButton, settingsBtn, scoreChangeText, increaseScoreButton, decreaseScoreButton, scoreNumber, backButton, changeTheme, theme;

// initializing settings elements
let settingsOverlay, settingsBg, settingsTitle;

// variables for html buttons
let isJumpPressed = false;

// Add event listeners for the jump button
const plusButton = document.getElementById("jump-button");
plusButton.addEventListener('pointerdown', () => {
    isJumpPressed = true;
});
plusButton.addEventListener('pointerup', () => {
    isJumpPressed = false;
});
plusButton.addEventListener('pointerout', () => {
    isJumpPressed = false;
});

// initializing functions for buttons
function startNewGame() {
    isMenuOpen = false;
    menuOverlay.visible = false;
    menuBg.visible = false;
    menuTitle.visible = false;
    newButton.visible = false;
    settingsBtn.visible = false;
}

function goToSettings() {
    isMenuOpen = false;
    menuOverlay.visible = false;
    isSettingsOpen = true;
    settingsOverlay.visible = true;
    settingsBg.visible = true;
    settingsTitle.visible = true;
    scoreChangeText.visible = true;
    increaseScoreButton.visible = true;
    decreaseScoreButton.visible = true;
    scoreNumber.visible = true;
    backButton.visible = true;
    changeTheme.visible = true;
    theme.visible = true;
}

function restartGame() {
    isGameEndOpen = false;
    gameEndOverlay.visible = false;
    gameEndTitle.visible = false;
    gameEndBg.visible = false;
    playAgainButton.visible = false;
    menuButton.visible = false;
    // Reset game state
    hasLanded = false;
    hasBumped = false;
    isGameStarted = false;
    score = 0;
    scoreText.text = 'Score: 0 / ' + targetScore;
    // Reset bird position and velocity
    bird.setPosition(0, 50);
    bird.setVelocity(0, 0);
    bird.body.setAllowGravity(true);
    // Clear existing columns
    columns.clear(true, true);
    // Restart the column timer
    columnTimer.paused = true;
}

function goToMainMenu() {
    isGameEndOpen = false;
    gameEndOverlay.visible = false;
    gameEndTitle.visible = false;
    gameEndBg.visible = false;
    playAgainButton.visible = false;
    menuButton.visible = false;
    // reset menu and settings state
    isMenuOpen = true;
    isSettingsOpen = false;
    menuOverlay.visible = true;
    menuBg.visible = true;
    menuTitle.visible = true;
    newButton.visible = true;
    settingsBtn.visible = true;
    // Reset game state
    hasLanded = false;
    hasBumped = false;
    isGameStarted = false;
    score = 0;
    scoreText.text = 'Score: 0 / ' + targetScore;
    // Reset message to player
    messageToPlayer.text = `Instructions: Press Space Bar to start`;
    // Reset bird position and velocity
    bird.setPosition(0, 50);
    bird.setVelocity(0, 0);
    bird.body.setAllowGravity(true);
    // Clear existing columns
    columns.clear(true, true);
    // Restart the column timer
    columnTimer.paused = true;
}

function closeSettings() {
    isSettingsOpen = false;
    settingsOverlay.visible = false;
    settingsBg.visible = false;
    settingsTitle.visible = false;
    scoreChangeText.visible = false;
    increaseScoreButton.visible = false;
    decreaseScoreButton.visible = false;
    scoreNumber.visible = false;
    backButton.visible = false;
    changeTheme.visible = false;
    theme.visible = false;
}

// add event listeners to up and down buttons
const upButton = document.getElementById("up-button");
const downButton = document.getElementById("down-button");

upButton.addEventListener('pointerdown', () => {
    if (isMenuOpen) {
        startNewGame();
    } else if (isGameEndOpen) {
        restartGame();
    }
});

downButton.addEventListener('pointerdown', () => {
    if (isMenuOpen) {
        goToSettings();
    } else if (isGameEndOpen) {
        goToMainMenu();
    }
});

// function to bring in images for our application, such as the background
function preload() {
    this.load.image("woodBg", "assets/wood-bg.jpg");
    this.load.image("menuBg", "assets/menu-bg.png");

    this.load.image(themes[currentTheme].backgroundKey, themes[currentTheme].backgroundPath);
    this.load.image(themes[currentTheme].roadKey, themes[currentTheme].roadPath);
    this.load.image(themes[currentTheme].columnTopKey, themes[currentTheme].columnTopPath);
    this.load.image(themes[currentTheme].columnBottomKey, themes[currentTheme].columnBottomPath);
    this.load.spritesheet("bird", "assets/bird.png", {
        frameWidth: 64,
        frameHeight: 96,
    });
}

function spawnColumns() {
    if (hasLanded || hasBumped) return;

    const gap = 150; //. space bird flies through
    const maxHeight = 50;
    const minHeight = 350;

    // random y for the gap center
    const randomY = Phaser.Math.Between(maxHeight, minHeight); 

    const topColumn = columns.create(850, randomY - gap / 2, themes[currentTheme].columnTopKey).setOrigin(0.5, 1).setScale(themes[currentTheme].columnScale.x, themes[currentTheme].columnScale.y);
    const bottomColumn = columns.create(850, randomY + gap / 2, themes[currentTheme].columnBottomKey).setOrigin(0.5, 0).setScale(themes[currentTheme].columnScale.x, themes[currentTheme].columnScale.y);

    topColumn.body.setVelocityX(-200);
    bottomColumn.body.setVelocityX(-200);

    topColumn.body.setImmovable(true);
    bottomColumn.body.setImmovable(true);

    topColumn.body.allowGravity = false;
    bottomColumn.body.allowGravity = false;

    this.children.bringToTop(messageToPlayer);
    this.children.bringToTop(scoreText);
}

// function to generate elements that will appear in our game, such as images that were brought in from the preload() function
function create() {
    // setOrigin() specifies that we want upper left corner of background to be positioned at (0, 0)
    const background = this.add.image(0, 0, themes[currentTheme].backgroundKey).setOrigin(0, 0).setScale(themes[currentTheme].backgroundScale);

    // this.physics makes a call to arcade physics system in phaser to allow physics simulation to roads 
    const roads = this.physics.add.staticGroup();

    const road = roads.create(400, 568, themes[currentTheme].roadKey).setScale(themes[currentTheme].roadScale).refreshBody();

    columns = this.physics.add.group();

    // has a dynamic body and will have gravity setting and will fall to the bottom of screen
    // has setBounce to specify that nird should bound slightly if it collides with something
    // has setCollideWorldBounds to specify that bird should not be able to leave the game world
    bird = this.physics.add.sprite(0, 50, 'bird').setScale(2);
    bird.setBounce(0.2);
    bird.setCollideWorldBounds(true);

    // set hasLanded to true when bird land on road
    this.physics.add.overlap(bird, road, () => (hasLanded = true), null, this);
    this.physics.add.collider(bird, road);

    this.physics.add.collider(bird, columns, () => (hasBumped = true), null, this);

    // from phaser doc - create and return an object containing 4 hotkeys
    cursors = this.input.keyboard.createCursorKeys();

    messageToPlayer = this.add.text(0, 0, `Instructions: Press Space Bar to start`,
        {
            fontFamily: '"Silkscreen", sans-serif',
            fontSize: "20px",
            color: "white",
            backgroundColor: "black",
        }
    );

    Phaser.Display.Align.In.BottomCenter(messageToPlayer, background, 0, 50);

    // create a timer to spawn columns every 2 seconds, but start paused
    columnTimer = this.time.addEvent({
        delay: 1500,
        callback: spawnColumns,
        callbackScope: this,
        loop: true,
        paused: true,
    });

    // create a text object to display the score
    scoreText = this.add.text(540, 10, 'Score: 0 / ' + targetScore, {
        fontFamily: '"Silkscreen", sans-serif',
        fontSize: "20px",
        fill: "#000000",
        padding: { x: 10, y: 5 },
    });

    // setting the menu scene
    menuOverlay = this.add.rectangle(0, 0, 800, 600, 0x000000, 0.5).setOrigin(0, 0);
    menuBg = this.add.image(0, 0, "menuBg").setOrigin(-0.3, -0.25).setDisplaySize(500, 400);
    menuTitle = this.add.text(400, 200, 'Feather Rush', {
        fontFamily: '"Silkscreen", sans-serif',
        fontSize: "40px",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
    }).setOrigin(0.5);

    newButton = this.add.text(400, 300, 'New Game', {
        fontFamily: '"Silkscreen", sans-serif',
        fontSize: "30px",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
        cursor: "pointer",
    }).setOrigin(0.5).setInteractive();

    settingsBtn = this.add.text(400, 350, 'Settings', {
        fontFamily: '"Silkscreen", sans-serif',
        fontSize: "30px",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
        cursor: "pointer",
    }).setOrigin(0.5).setInteractive();

    newButton.on('pointerdown', () => {
        startNewGame();
    });

    settingsBtn.on('pointerdown', () => {
        goToSettings();
    });

    menuOverlay.setVisible(isMenuOpen);
    menuBg.setVisible(isMenuOpen);
    menuTitle.setVisible(isMenuOpen);
    newButton.setVisible(isMenuOpen);
    settingsBtn.setVisible(isMenuOpen);

// change game end title based on win or lose
    gameEndOverlay = this.add.rectangle(0, 0, 800, 600, 0x000000, 0.5).setOrigin(0, 0).setAlpha(0.2).setVisible(false);
    gameEndBg = this.add.image(0, 0, "menuBg").setOrigin(-0.3, -0.25).setDisplaySize(500, 400).setVisible(false);

    gameEndTitle = this.add.text(400, 200, isGameWon ? 'You Won!' : 'Game Over', {
        fontFamily: '"Silkscreen", sans-serif',
        fontSize: "40px",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setVisible(false);

    playAgainButton = this.add.text(400, 300, 'Play Again', {
        fontFamily: '"Silkscreen", sans-serif',
        fontSize: "30px",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
        cursor: "pointer",
    }).setOrigin(0.5).setInteractive().setVisible(false);

    menuButton = this.add.text(400, 350, 'Main Menu', {
        fontFamily: '"Silkscreen", sans-serif',
        fontSize: "30px",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
        cursor: "pointer",
    }).setOrigin(0.5).setInteractive().setVisible(false);

    menuButton.on('pointerdown', () => {
        goToMainMenu();
    });

    playAgainButton.on('pointerdown', () => {
        restartGame();
    });

// setting the settings scene
    settingsOverlay = this.add.rectangle(0, 0, 800, 600, 0x000000, 0.5).setOrigin(0, 0).setVisible(false);
    settingsBg = this.add.image(0, 0, "menuBg").setOrigin(-0.3, -0.25).setDisplaySize(500, 400).setVisible(false);

    settingsTitle = this.add.text(400, 200, 'Settings', {
        fontFamily: '"Silkscreen", sans-serif',
        fontSize: "40px",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setVisible(false);

    scoreChangeText = this.add.text(300, 280, 'Change Score', {
        fontFamily: '"Silkscreen", sans-serif',
        fontSize: "25px",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setVisible(false);

    increaseScoreButton = this.add.text(450, 280, '+', {
        fontFamily: '"Silkscreen", sans-serif',
        fontSize: "20px",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
        cursor: "pointer",
    }).setOrigin(0.5).setInteractive().setVisible(false);

    decreaseScoreButton = this.add.text(606, 280, '-', {
        fontFamily: '"Silkscreen", sans-serif',
        fontSize: "20px",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
        cursor: "pointer",
    }).setOrigin(0.5).setInteractive().setVisible(false);

    scoreNumber = this.add.text(530, 280, targetScore, {
        fontFamily: '"Silkscreen", sans-serif',
        fontSize: "25px",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setVisible(false);

    increaseScoreButton.on('pointerdown', () => {
        targetScore += 100;
        scoreNumber.text = targetScore;
    });

    decreaseScoreButton.on('pointerdown', () => {
        if (targetScore > 600) {
            targetScore -= 100;
            scoreNumber.text = targetScore;
        }
    });

    backButton = this.add.text(400, 445, 'Back', {
        fontFamily: '"Silkscreen", sans-serif',
        fontSize: "30px",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
        cursor: "pointer",
    }).setOrigin(0.5).setInteractive().setVisible(false);

    backButton.on('pointerdown', () => {
        closeSettings();
        goToMainMenu();
    });

    changeTheme = this.add.text(300, 360, 'Change Theme', {
        fontFamily: '"Silkscreen", sans-serif',
        fontSize: "25px",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
        cursor: "pointer",
    }).setOrigin(0.5).setInteractive().setVisible(false);

    theme = this.add.text(520, 360, 'City Theme >', {
        fontFamily: '"Silkscreen", sans-serif',
        fontSize: "20px",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
        cursor: "pointer",
    }).setOrigin(0.5).setInteractive().setVisible(false);

    theme.on('pointerdown', () => {
        if (theme.text === 'City Theme >') {
            currentTheme = 'cave';
            theme.setText('Cave Theme >');
        } else {
            currentTheme = 'city';
            theme.setText('City Theme >');
        }

        restartGame();
        this.scene.restart();
        goToMainMenu();
    });

}

//  function will be used to update the "bird" object in the game.
function update() {

    if ((cursors.space.isDown || isJumpPressed) && isMenuOpen) {
        return;
    }

    if ((cursors.space.isDown || isJumpPressed) && isSettingsOpen) {
        return;
    }

    if((cursors.space.isDown || isJumpPressed) && !isGameStarted) {
        isGameStarted = true;
        columnTimer.paused = false;
        messageToPlayer.text = 'Instructions: Press the "^" button to stay\n uprightAnd don\'t hit the columns or ground';
    }

    if(!isGameStarted) {
        bird.setVelocityY(-160);
    }

    if((cursors.up.isDown || isJumpPressed) && !hasLanded && !hasBumped && isGameStarted && score < targetScore) {
        bird.setVelocityY(-160);
    }

    if(isGameStarted && !hasLanded && !hasBumped && score < targetScore) {
        score += 1;
        scoreText.text = 'Score: ' + score + ' / ' + targetScore;
        bird.body.velocity.x = 30;
    } else {
        bird.body.velocity.x = 0;
    }

    if(score >= targetScore && !hasLanded && !hasBumped) {
        columnTimer.paused = true;
        columns.setVelocityX(0);
        bird.setVelocityY(0);
        // set gravity of bird to 0 so it doesn't fall down after winning
        bird.body.setAllowGravity(false);
        isGameEndOpen = true;
        isGameWon = true;
        messageToPlayer.text = 'Congrats! You won!';
    }

    if(hasLanded || hasBumped) {
        columnTimer.paused = true;
        columns.setVelocityX(0);
        isGameWon = false;
        isGameEndOpen = true;
        messageToPlayer.text = 'Oh no! You crashed!';
    }

    // Performance Cleanup: Clean up columns that left the screen
    columns.children.iterate(function (column) {
        if (column && column.x < -50) {
            column.destroy();
        }
    });

    if (isGameEndOpen) {
        columns.setVisible(false);
        gameEndOverlay.setVisible(true);
        gameEndBg.setVisible(true);
        gameEndTitle.setText(isGameWon ? 'You Won!' : 'Game Over').setVisible(true);
        playAgainButton.setVisible(true);
        menuButton.setVisible(true);
    }
}


