// Set game configs
const config = {
    type: Phaser.AUTO,
    parent: 'pchgame',
    width: 800,
    height: 600,
    scene: {
        preload,
        create,
        update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: false
        }
    }

}

// Create game with configs
const game = new Phaser.Game(config)
let isGameRunning = false

// Point controller
let points = {
    'ice': 0,
    'fire': 0,
    'toWin': 7,
    'winner': null
}
let pointText
let scoreText

// Game objects
let ball
let ice
let fire

// Metrics
let worldBoundsX = 0
let worldBoundsY = 0
const playerVelocity = 400

// Controllers
let cursors
let keys = {}

// Load game objects and settings
function preload() {
    this.load.image('ball', '/images/ball.png')
    this.load.image('ice', '/images/ice.png')
    this.load.image('fire', '/images/fire.png')
    this.load.image('bg', '/images/bg.png')
}

// Create game objects and settings
function create() {
    // Get metrics
    worldBoundsX = this.physics.world.bounds.width
    worldBoundsY = this.physics.world.bounds.height

    // Background image
    this.add.image(worldBoundsX / 2, worldBoundsY / 2, 'bg')

    // Ball settings
    ball = this.physics.add.sprite(
        worldBoundsX / 2, 
        worldBoundsY / 2, 
        'ball'
    )
    ball.setCollideWorldBounds(true)
    ball.setBounce(1, 1)

    // Ice player settings
    ice = this.physics.add.sprite(
        worldBoundsX - (ball.body.width / 2 + 1), 
        worldBoundsY / 2, 
        'ice'
    )

    // Fire player settings
    fire = this.physics.add.sprite(
        ball.body.width / 2 + 1, 
        worldBoundsY / 2, 
        'fire'
    )

    // Text settings - Point
    pointText = this.add.text(
        worldBoundsX / 2, 
        worldBoundsY / 2,
        "Press SPACE to start game", 
        { fontSize: "32px", fill: "#fff", align: "center" }
    )
    pointText.setOrigin(0.5, 1.5)

    // Text settings - Score
    scoreText = this.add.text(
        worldBoundsX / 2, 
        10,
        "0 x 0", 
        { fontSize: "20px", fill: "#dd2", align: "center" }
    )
    scoreText.setOrigin(0.5, 0)

    // Controller settings
    cursors = this.input.keyboard.createCursorKeys()
    keys.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    keys.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    // Collide settings
    this.physics.add.collider(ball, ice)
    this.physics.add.collider(ball, fire)

    // Set the properties for all objects
    setCollideBounds([ball, ice, fire])
    setImmovable([ice, fire])
}

// Updates each frame
function update() {

    ice.body.setVelocityY(0)
    fire.body.setVelocityY(0)
    if(isGameRunning){
        if(ball.body.x > ice.body.x) setPoint("fire")
        else if(ball.body.x < fire.body.x) setPoint("ice")

        // Ice player movements
        if(cursors.up.isDown) ice.body.setVelocityY(-playerVelocity)
        if(cursors.down.isDown) ice.body.setVelocityY(playerVelocity)

        // Fire player movements
        if(keys.w.isDown) fire.body.setVelocityY(-playerVelocity)
        if(keys.s.isDown) fire.body.setVelocityY(playerVelocity)

        // Ball stop crazy propulsion issue
        if(ball.body.velocity.y > playerVelocity) ball.body.setVelocityY(playerVelocity)
        if(ball.body.velocity.y < -playerVelocity) ball.body.setVelocityY(-playerVelocity)
    } else {
        // Run game
        if(keys.space.isDown){
            if(points.winner != null)
                resetGame()
            else
                restartGame()
        }
    }
}

// Set collide bounds for all objects in array
function setCollideBounds(objects){
    objects.forEach(element => {
        element.setCollideWorldBounds(true)
    })
}

// Set immovable for all objects in array
function setImmovable(objects){
    objects.forEach(element => {
        element.setImmovable(true)
    })
}

// Score to player
function setPoint(player){
    isGameRunning = false
    // Stop ball
    ball.setVelocityY(0)
    ball.setVelocityX(0)
    // Set point
    points[player]++
    let text = ''

    // Verify if we have a winner
    if(points[player] >= points.toWin){
        // Set winner and reset the game
        points.winner = player
        text = player.toUpperCase() + " wins!"
    } else {
        // Set point and continue the game
        text = "point to " + player.toUpperCase()
    }
    pointText.setText(text)
    scoreText.setText(points['fire'] + " x " + points['ice'])
}

// Restart the game until we have a winner
function restartGame(){
    ball.setPosition(
        worldBoundsX / 2,
        worldBoundsY / 2
    )
    if(!isGameRunning){
        isGameRunning = true
        pointText.setText("")
        let randomVelocity = 150 + (Math.random() * 150)
        ball.setVelocityX(randomVelocity)
        ball.setVelocityY(randomVelocity)
        console.log(Math.random());
    }
}

// We have a winner. Reset the game
function resetGame(){
    points['ice'] = 0
    points['fire'] = 0
    points['winner'] = null
    scoreText.setText("0 x 0")
    restartGame()
}