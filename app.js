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
    this.load.image("background", "assets/background.png");
    this.load.image("road", "assets/road.png");
    this.load.image("column", "assets/column.png");
    this.load.spritesheet("bird", "assets/bird.png", {
        frameWidth: 64,
        frameHeight: 96,
    });
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
    scoreText = this.add.text(580, 10, 'Score: 0 / ' + targetScore, {
        fontFamily: '"Silkscreen", sans-serif',
        fontSize: "20px",
        fill: "#000000",
        padding: { x: 10, y: 5 },
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

//  function will be used to update the "bird" object in the game.
function update() {
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
        messageToPlayer.text = 'Congrats! You won!';
    }

    if(hasLanded || hasBumped) {
        columnTimer.paused = true;
        columns.setVelocityX(0);
        messageToPlayer.text = 'Oh no! You crashed!';
    }

    // Performance Cleanup: Clean up columns that left the screen
    columns.children.iterate(function (column) {
        if (column && column.x < -50) {
            column.destroy();
        }
    });
}