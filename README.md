# Chokosta - A Real-time Multiplayer Board Game

Chokosta is a web-based, real-time multiplayer board game built with JavaScript and Socket.IO. The game is a digital adaptation of the traditional Indian board game of the same name.

 <!-- TODO: Add a screenshot of your game here -->

## Features

*   **Real-time Multiplayer:** Play with a friend in real-time, no matter where they are.
*   **Create & Join Games:** Easily create a new game and share a unique game link with your opponent to have them join instantly.
*   **Interactive UI:** A responsive, canvas-based game board that works on different screen sizes.
*   **In-Game Alerts:** Uses SweetAlert for a clean and modern user experience for prompts and game notifications.
*   **Tutorial Mode:** An optional tutorial mode to guide new players through the game.
*   **In-Game Chat:** Communicate with your opponent during the game.

## How to Play

1.  **Create a Game:**
    *   Navigate to the game's homepage.
    *   Click the **"Create Game"** button.
    *   A new game room will be created, and a unique invitation link will be generated.

2.  **Join a Game:**
    *   Share the invitation link with a friend.
    *   When your friend opens the link, they will be prompted to enter their name and will automatically join your game.

3.  **Gameplay:**
    *   The game is turn-based. The player whose turn it is will see a **"Roll Dice"** button.
    *   Click the button to roll the dice and see your possible moves.
    *   Click on a piece to move it according to the dice roll.
    *   The objective is to navigate all your pieces around the board and into the home column before your opponent does.

## Tech Stack

*   **Frontend:**
    *   HTML5
    *   CSS3
    *   JavaScript (ES6+)
    *   HTML5 Canvas for rendering the game board and pieces.
*   **Backend & Real-time Communication:**
    *   Node.js (Assumed, for the server)
    *   Socket.IO for WebSocket-based real-time communication between players.
*   **Libraries:**
    *   [SweetAlert](https://sweetalert.js.org/) for beautiful and responsive alerts.

## Project Structure

The project is organized into client and server components.

```
/
├── client/              # Contains all front-end assets
│   ├── css/
│   ├── js/
│   └── ...
├── index.html           # Main game page
└── server.js            # (Assumed) Node.js server file
```

## Local Development Setup

To run this project locally, you will need [Node.js](https://nodejs.org/) installed.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/chokosta.git
    cd chokosta
    ```
2.  **Install dependencies** (assuming a Node.js server with a `package.json`):
    ```bash
    npm install
    ```
3.  **Start the server:**
    ```bash
    node server.js
    ```
4.  Open your web browser and navigate to `http://localhost:3000` (or the port specified in your server file).

## Feedback and Contributions

This project is based on the local game "Chokosta". If you find any bugs, have suggestions for improvement, or want to contribute, please feel free to open an issue or contact the developer.

**Developer:** Subhajit Mahata
**Email:** subhajitmahata06@gmail.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
