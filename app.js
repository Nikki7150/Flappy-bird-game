// Configuration
let config = {
    renderer: Phaser.AUTO,
    width: 800,
    height: 600,
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

// variable for menu scene
let isMenuOpen = true;

// variable for settings scene
let isSettingsOpen = false;

// variable for theme scene
let isThemeOpen = false;

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
const targetScore = 1000; // distance to win the game
let scoreText;

// function to bring in images for our application, such as the background
function preload() {
    this.load.image("woodBg", "assets/wood-bg.jpg");
    this.load.image("menuBg", "assets/menu-bg.jpeg");
    this.load.image("background", "assets/background.png");
    this.load.image("road", "assets/road.png");
    this.load.image("column", "assets/column.png");
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

    const topColumn = columns.create(850, randomY - gap / 2, 'column').setOrigin(0.5, 1);
    const bottomColumn = columns.create(850, randomY + gap / 2, 'column').setOrigin(0.5, 0);

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
    const background = this.add.image(0, 0, "background").setOrigin(0, 0);

    // this.physics makes a call to arcade physics system in phaser to allow physics simulation to roads 
    const roads = this.physics.add.staticGroup();

    // topColumns are static
    /*const topColumns = this.physics.add.staticGroup({
        key: "column", 
        repeat: 1,
        setXY: { x: 200, y: 0, stepX: 300 },
    });

    // bottomColumns are static
    const bottomColumns = this.physics.add.staticGroup({
        key: "column", 
        repeat: 1,
        setXY: { x: 350, y: 400, stepX: 300 },
    });*/

    const road = roads.create(400, 568, "road").setScale(2).refreshBody();

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

    // make bird stop moving when hits a column
    /*this.physics.add.overlap(bird, topColumns, () => (hasBumped = true), null, this);
    this.physics.add.overlap(bird, bottomColumns, () => (hasBumped = true), null, this);

    this.physics.add.collider(bird, topColumns);
    this.physics.add.collider(bird, bottomColumns);*/

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
    if (isMenuOpen) {
        const menuOverlay = this.add.rectangle(0, 0, 800, 600, 0x000000, 0.5).setOrigin(0, 0);
        const menuBg = this.add.image(0, 0, "menuBg").setOrigin(-0.3, -0.25).setDisplaySize(500, 400);
        const menuTitle = this.add.text(400, 200, 'Feather Rush', {
            fontFamily: '"Silkscreen", sans-serif',
            fontSize: "40px",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 10, y: 5 },
        }).setOrigin(0.5);

        const newButton = this.add.text(400, 300, 'New Game', {
            fontFamily: '"Silkscreen", sans-serif',
            fontSize: "30px",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 10, y: 5 },
            cursor: "pointer",
        }).setOrigin(0.5).setInteractive();

        const settingsBtn = this.add.text(400, 350, 'Settings', {
            fontFamily: '"Silkscreen", sans-serif',
            fontSize: "30px",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 10, y: 5 },
            cursor: "pointer",
        }).setOrigin(0.5).setInteractive();

        const themeBtn = this.add.text(400, 400, 'Theme', {
            fontFamily: '"Silkscreen", sans-serif',
            fontSize: "30px",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 10, y: 5 },
            cursor: "pointer",
        }).setOrigin(0.5).setInteractive();

        newButton.on('pointerdown', () => {
            isMenuOpen = false;
            menuOverlay.visible = false;
            menuBg.visible = false;
            menuTitle.visible = false;
            newButton.visible = false;
            settingsBtn.visible = false;
            themeBtn.visible = false;
        });
    }
}



//  function will be used to update the "bird" object in the game.
function update() {

    if (cursors.space.isDown && isMenuOpen) {
        return;
    }
    
    if(cursors.space.isDown && !isGameStarted) {
        isGameStarted = true;
        columnTimer.paused = false;
        messageToPlayer.text = 'Instructions: Press the "^" button to stay\n uprightAnd don\'t hit the columns or ground';
    }

    if(!isGameStarted) {
        bird.setVelocityY(-160);
    }

    if(cursors.up.isDown && !hasLanded && !hasBumped && isGameStarted && score < targetScore) {
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

    // change game end title based on win or lose
    if (isGameEndOpen) {
        const gameEndOverlay = this.add.rectangle(0, 0, 800, 600, 0x000000, 0.5).setOrigin(0, 0).setAlpha(0.2);
        const gameEndBg = this.add.image(0, 0, "menuBg").setOrigin(-0.3, -0.25).setDisplaySize(500, 400);

        const gameEndTitle = this.add.text(400, 200, isGameWon ? 'You Won!' : 'Game Over', {
            fontFamily: '"Silkscreen", sans-serif',
            fontSize: "40px",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 10, y: 5 },
        }).setOrigin(0.5);

        const playAgainButton = this.add.text(400, 300, 'Play Again', {
            fontFamily: '"Silkscreen", sans-serif',
            fontSize: "30px",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 10, y: 5 },
            cursor: "pointer",
        }).setOrigin(0.5).setInteractive();

        const menuButton = this.add.text(400, 350, 'Main Menu', {
            fontFamily: '"Silkscreen", sans-serif',
            fontSize: "30px",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 10, y: 5 },
            cursor: "pointer",
        }).setOrigin(0.5).setInteractive();

        menuButton.on('pointerdown', () => {
            isGameEndOpen = false;
            gameEndOverlay.visible = false;
            gameEndTitle.visible = false;
            playAgainButton.visible = false;
            menuButton.visible = false;

            // reset menu and settings state
            isMenuOpen = true;
            isSettingsOpen = false;
            isThemeOpen = false;

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
        });

        playAgainButton.on('pointerdown', () => {
            isGameEndOpen = false;
            gameEndOverlay.visible = false;
            gameEndTitle.visible = false;
            playAgainButton.visible = false;
            menuButton.visible = false;

            // reset menu and settings state
            isMenuOpen = true;
            isSettingsOpen = false;
            isThemeOpen = false;

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
        });
    }

    // Performance Cleanup: Clean up columns that left the screen
    columns.children.iterate(function (column) {
        if (column && column.x < -50) {
            column.destroy();
        }
    });
}