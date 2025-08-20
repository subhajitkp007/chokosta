# Chokosta - Real-time Multiplayer Board Game

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and run the repository:
- Install Node.js dependencies: `npm install` -- takes 5 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
- Start the server: `npm start` or `node app.js` -- starts immediately. Server runs on port 2000.
- Access the game: Open browser to `http://localhost:2000`

### Development commands:
- `npm install` -- installs dependencies (5 seconds)
- `npm start` -- starts the Node.js server on port 2000
- `node app.js` -- alternative way to start the server directly

### Important warnings:
- **DEPENDENCY VULNERABILITIES**: The project has 8 known vulnerabilities (4 low, 4 moderate) in Socket.IO dependencies. The application functions correctly despite these warnings.
- **NODE VERSION**: Package.json specifies Node 12.16.x but works fine with Node 20+. Ignore the engine warning.
- **NO BUILD STEP**: This is a static files + Node.js app with no build process required.

## Validation

### Core functionality validation:
1. **ALWAYS test game creation workflow after making changes:**
   - Start server with `npm start`
   - Navigate to `http://localhost:2000`
   - Click "OK" on welcome dialog
   - Click "Create Game" button
   - Enter a test player name
   - Verify game room creation with unique game ID
   - Verify game link generation (format: `http://localhost:2000/?gid=[ID]=[PlayerName]`)

2. **ALWAYS test single player mode:**
   - Navigate to `http://localhost:2000/singleplayer.html`
   - Verify game board loads with "ROLE DICE" button
   - Click "OK" on welcome dialog

3. **ALWAYS test static file serving:**
   - Verify `/client/` directory is accessible at `http://localhost:2000/client/`
   - Verify assets load correctly (game board, pieces, etc.)

### Manual testing scenarios:
- **Multiplayer Game Creation**: Create game → Get game ID → Share link functionality
- **Game Board Rendering**: Canvas-based board displays correctly with colored pieces
- **Socket.IO Connection**: Real-time communication established (check browser dev tools console)
- **File Structure Access**: All static files served correctly from root directory

## Common Tasks

### Repository structure:
```
/
├── app.js              # Main Node.js server (Express + Socket.IO)
├── package.json        # Dependencies: express@4.17.1, socket.io@2.3.0
├── index.html          # Main multiplayer game page
├── singleplayer.html   # Single player game mode
├── client/             # Alternative client files (mirrors root structure)
│   ├── index.html      # Client version of multiplayer page
│   ├── js/             # Client-side JavaScript files
│   └── assets/         # Game assets
├── js/                 # Minified game logic files
│   ├── *.min.js        # Minified game modules (board, dice, gameplay, etc.)
│   ├── jquery.js       # jQuery library
│   └── sweetalert.min.js # Alert/dialog library
├── assets/             # Game images and resources
├── socket.io/          # Socket.IO client library
└── stylesp.css         # Single player styles
```

### Key files to understand:
- **app.js**: Express server setup, Socket.IO event handlers for multiplayer game logic
- **index.html**: Main game interface with Canvas-based board
- **package.json**: Project dependencies (Express 4.17.1, Socket.IO 2.3.0)
- **js/*.min.js**: Minified game logic (board rendering, dice mechanics, gameplay rules)

### Port configuration:
- Default port: 2000 (configurable via PORT environment variable)
- Socket.IO runs on same port as HTTP server
- Game URLs: `http://localhost:2000/?gid=[GameID]=[PlayerName]`

### Common outputs from frequently run commands:

#### npm install output:
```
npm warn EBADENGINE Unsupported engine (ignore this warning)
npm warn deprecated debug@4.1.1 (ignore this warning)
added 106 packages, and audited 107 packages in 4s
8 vulnerabilities (4 low, 4 moderate) - application works despite these
```

#### npm start output:
```
> chokosta@1.0.0 start
> node app.js

Server started.
```

#### Directory listing:
```
.github/            # GitHub workflows (CodeQL analysis)
LICENSE             # MIT License
README.md           # Project documentation
app.js              # Main server file
assets/             # Game assets
client/             # Client files
index.html          # Main game page
js/                 # JavaScript files
node_modules/       # Dependencies
package.json        # Project configuration
singleplayer.html   # Single player mode
socket.io/          # Socket.IO client
stylesp.css         # Single player styles
```

## Important Notes

### Game Architecture:
- **Frontend**: HTML5 Canvas + vanilla JavaScript for game rendering
- **Backend**: Node.js with Express for static file serving
- **Real-time**: Socket.IO for multiplayer communication
- **Game Logic**: Client-side JavaScript with server-side game state management

### Known Issues:
- README.md mentions `server.js` but actual file is `app.js`
- No test infrastructure present
- Dependencies have security vulnerabilities but are functional
- Node.js version mismatch warning (specified 12.16.x, works with 20+)

### File Serving:
- Root directory serves static files
- Both `/` and `/client/` serve similar game interfaces
- All assets accessible via HTTP server

### Game Features:
- Real-time multiplayer board game similar to Ludo
- Game room creation with unique IDs
- Single player practice mode
- Canvas-based game board rendering
- In-game chat functionality
- Tutorial mode
- SweetAlert for user notifications

### DO NOT:
- Try to run build commands (no build process exists)
- Try to run tests (no test infrastructure)
- Fix dependency vulnerabilities without testing thoroughly
- Change Node.js version requirements without validation

### ALWAYS:
- Test complete game creation workflow after any changes
- Verify both multiplayer and single player modes work
- Check browser console for Socket.IO connection errors
- Test static file serving for all game assets