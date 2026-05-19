# Chokosta - Gameplay Logic Documentation

## Overview

**Chokosta** is a real-time, multiplayer board game adaptation of a traditional Indian board game. It follows similar mechanics to Ludo but uses tamarind seeds for dice rolls instead of standard six-sided dice. This document outlines the complete gameplay logic and mechanics.

---

## Game Basics

### Objective
- Move all 4 pieces around the board and into the center home column before your opponent
- The first player to get all 4 pieces to the destination wins

### Game Setup
- **Players:** 2 players per game
- **Pieces (Ghuties):** Each player has 4 pieces
- **Dice System:** Uses 4 tamarind seed halves (instead of traditional dice)

---

## Dice System

### Scoring with Tamarind Seeds
The dice mechanism uses 4 tamarind seed halves. Each half shows either **white** or **black** on the upper face.

#### Scoring Rules:
- **1 White, 3 Black** = Score of **1**
- **2 White, 2 Black** = Score of **2**
- **3 White, 1 Black** = Score of **3**
- **4 White, 0 Black** = Score of **4**
- **0 White, 4 Black** = Score of **8** (Special score)

#### Valid Scores: `1, 2, 3, 4, 8`

---

## Piece Movement

### Movement Paths
- Each player has a specific path around the board
- **Red Player:** Starts at the leftmost position
- **Player 3 (Second Player):** Follows anti-clockwise from the top
- Each player's path consists of outer circle (anti-clockwise) and inner circle (clockwise)

### Movement Mechanics

1. **Turn-Based System:**
   - Red player takes the first turn
   - Players alternate turns in anti-clockwise order (Red → Player 3)
   - Each player has approximately **1 minute** per move (as documented in rules)

2. **Move Selection:**
   - After rolling dice, player selects which piece to move
   - Piece moves forward by the number shown on the dice
   - If no piece can legally move, turn passes to next player

3. **Special Movement Rules:**

   **Extra Turn Triggers:**
   - Rolling a score of **4** or **8** gives another turn
   - **Capturing an opponent's piece** gives another turn
   - This creates dynamic turn mechanics where skilled players can extend their gameplay

---

## Piece Capture & Safe Zones

### Capture Mechanics
- If your piece lands on an opponent's piece that is **NOT** in a safe zone:
  - The opponent's piece is "killed" and returned to its starting position
  - You get an extra turn (as per extra turn rules)

### Safe Zones (Protected Boxes)
- All **crossed boxes** on the board are considered safe zones
- Pieces in safe zones cannot be captured
- Each player's path includes designated safe positions

---

## Win Condition

### Winning the Game
- **Goal:** First player to move all **4 pieces** into the center home column
- Once all pieces reach the center, that player is declared the winner
- The game state is updated to "complete"
- Game data is cleaned up after completion

---

## Real-Time Multiplayer Architecture

### Server-Side Game Management (Socket.IO)

#### Game States Managed:
```javascript
{
  gameId: {
    clients: [],              // Array of player client IDs
    maxplayer: 2,             // Maximum players in game
    pos: { ... },             // Current piece positions
    ghutipos: { ... },        // Ghuti (piece) positions
    namecreator: "Player1",   // Name of game creator
    namejoin: "Player2",      // Name of joining player
    win: 0                     // Winner indicator
  }
}
```

#### Socket Events

**Connection Events:**
- `connection`: New player connects, assigned unique client ID and game ID

**Game Creation & Joining:**
- `create`: Player creates a new game with game parameters
- `join`: Second player joins an existing game using game code
- `newjoin`: Broadcast when new player joins (notifies existing players)
- `startgame`: Signals game start to both players with initial data
- `fulljoined`: Error event when game is full or unavailable
- `gamedeleted`: Error event when game is deleted/unavailable

**Gameplay Events:**
- `play`: Dice roll request (client-side action)
- `diceupdate`: Updates dice roll result and toggles turn between players
- `movenotdone`: Player hasn't completed move, passes turn without action
- `movedone`: Player completes a move, updates board state and passes turn
- `nextmove`: Broadcasts updated game state to all players in game
- `complete`: Game is complete, winner announced
- `chatmsg`: In-game chat message between players

**Utility Events:**
- `disconnect`: Player disconnects, game is cleaned up
- `update`: Periodic update broadcast to all connected clients

### Turn Management Logic

```javascript
// Turn Switching Logic
if (ply === 1) {
    updatedData.ply = 3;    // Switch from Player 1 to Player 3
    targetClientIndex = 1;
} else {
    updatedData.ply = 1;    // Switch from Player 3 to Player 1
    targetClientIndex = 0;
}
```

The current player (ply) is toggled between `1` and `3`, representing the two players in the game.

---

## Game Flow

### Game Initialization

1. **Player 1 Creates Game:**
   - Navigates to homepage
   - Clicks "Create Game"
   - Server assigns unique game ID and client ID
   - Player 1 receives invitation link with game code

2. **Player 2 Joins Game:**
   - Clicks shared invitation link or "JOIN" button
   - Enters game code
   - Server validates game exists and has only 1 player
   - Player 2 joins successfully

3. **Game Starts:**
   - Both players receive `startgame` event
   - Initial game state is synchronized
   - Red player (Player 1) gets first turn

### During Gameplay

1. **Current Player's Turn:**
   - Player clicks "START" button to roll dice
   - Dice roll is generated (scores 1, 2, 3, 4, or 8)
   - Player selects piece to move
   - Board updates with new piece position

2. **Move Validation:**
   - Server checks if move is legal
   - Broadcasts updated board state to both players
   - Checks for piece captures
   - Determines if extra turn is earned

3. **Turn Passes:**
   - Unless extra turn is earned, turn passes to opponent
   - Opponent receives `nextmove` event with updated game state
   - Opponent can then roll dice

4. **Game Conclusion:**
   - When player moves all 4 pieces to center
   - `complete` event is broadcast
   - Winner is announced
   - Game is cleaned from server memory

---

## Data Flow

### Client-Server Communication Pattern

```
Client 1 (Player 1)
    ↓
    └─→ Socket.IO Event (e.g., 'movedone')
        ↓
        Server (app.js)
        ├─→ Process move
        ├─→ Update game state
        └─→ Broadcast to both clients
        ↓
    ← Socket.IO Event (e.g., 'nextmove')
    ↓
Client 2 (Player 2)
```

### Broadcasting to Game

- All updates are sent to both players using `broadcastToGame()` function
- This ensures synchronized board state across both clients
- Prevents desynchronization issues

---

## Chat System

### In-Game Communication
- Players can chat with opponent during gameplay
- Chat messages are sent via `chatmsg` event
- Server broadcasts messages to both players in the same game
- Useful for real-time player interaction and sportsmanship

---

## Game Modes

### 1. **Multiplayer Challenge Mode** (Main Mode)
- Real-time play against another player
- Full turn-based gameplay
- Can capture opponent's pieces
- Includes extra turns for scoring 4/8 or capturing pieces

### 2. **Practice Mode (Singleplayer)**
- Play against AI or self-practice
- Uses `singleplayer.html` interface
- Different game mechanics from multiplayer
- Located at `singleplayer.html` route
- Useful for learning game rules

---

## Features & Enhancements

### User Interface Features
- **Tutorial Mode:** Step-by-step guidance for new players
- **Responsive Design:** Works on different screen sizes (canvas-based)
- **Help Button:** Comprehensive game rules in English and Bengali
- **Navigation Sidebar:** Quick access to game creation, developer links, and feedback

### Technical Features
- **WebSocket Communication:** Real-time updates via Socket.IO
- **Session Management:** Unique client and game IDs for tracking
- **Error Handling:** Graceful handling of connection failures
- **Periodic Updates:** Server sends periodic updates to keep clients synchronized

---

## Game Rules Summary

1. **Turn Order:** Red player starts → Players alternate anti-clockwise

2. **Move Mechanics:** Player chooses piece to move based on dice roll

3. **Extra Turns:** 
   - Score of 4 or 8
   - Capturing opponent's piece

4. **Piece Capture:** 
   - Opponent's piece outside safe zone → Captured and returned to start
   - Safe zones (crossed boxes) cannot be attacked

5. **Victory Condition:** First to move all 4 pieces to center wins

6. **Time Management:** ~1 minute per move

---

## Technical Implementation Details

### Key Files

- **Backend:** `app.js` - Node.js/Express server with Socket.IO
- **Frontend:** 
  - `index.html` - Main multiplayer game interface
  - `singleplayer.html` - Practice mode
  - `js/gameplay.min.js` - Game logic
  - `js/board.min.js` - Board rendering
  - `js/ghuti.min.js` - Piece management
  - `js/dice.min.js` - Dice rolling logic

### Configuration (Environment Variables)
```
PORT=2000
NODE_ENV=development
CLIENT_ID_MIN=1000
CLIENT_ID_MAX=10000
GAME_ID_MIN=1000
GAME_ID_MAX=20000
GAME_UPDATE_INTERVAL=20000 (milliseconds)
```

---

## Error Handling

The game handles various error conditions:

- **Game Deleted:** When game is not found in system
- **Game Full:** When second player attempts to join full game
- **Connection Failed:** When socket connection cannot be established
- **Failed Move:** When move operations encounter errors

All errors are caught with try-catch blocks and appropriate error events are sent to clients.

---

## Conclusion

Chokosta implements a complete turn-based multiplayer board game system with real-time synchronization. The gameplay mechanics balance strategic piece movement with chance (dice rolls) and include capture mechanics for dynamic gameplay. The Socket.IO architecture ensures responsive real-time play between distributed players.

