//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;

contract Battleship {
    address public player1;
    address public player2;
    address public winner;
    
    bool public gameStarted = false;
    bool public gameFinished = false;
    
    uint8 public constant BOARD_SIZE = 10;
    uint8 public constant NUM_SHIPS = 5;
    
    uint8[NUM_SHIPS] public shipSizes = [5, 4, 3, 3, 2];
    
    enum SquareState {Empty, Ship, Hit, Miss}
    
    SquareState[BOARD_SIZE][BOARD_SIZE] public player1Board;
    SquareState[BOARD_SIZE][BOARD_SIZE] public player2Board;
    
    address public currentPlayer;
    
    event GameStarted(address player1, address player2);
    event GameFinished(address winner);
    
    constructor(address _player1, address _player2) {
        player1 = _player1;
        player2 = _player2;
    }
    
    modifier onlyPlayers() {
        require(msg.sender == player1 || msg.sender == player2, "Only players can call this function.");
        _;
    }
    
    modifier onlyCurrentPlayer() {
        require(msg.sender == currentPlayer, "Not the current player's turn.");
        _;
    }
    
    function startGame() public onlyPlayers {
        require(!gameStarted, "Game has already started.");
        gameStarted = true;
        currentPlayer = player1;
        emit GameStarted(player1, player2);
    }
    
    function attack(uint8 xCoord, uint8 yCoord) public onlyPlayers onlyCurrentPlayer {
        require(gameStarted, "Game has not started yet.");
        require(!gameFinished, "Game has already finished.");
        SquareState squareState = getSquareState(getOtherPlayer(), xCoord, yCoord);
        require(squareState != SquareState.Hit && squareState != SquareState.Miss, "Square has already been attacked.");
        if (squareState == SquareState.Ship) {
            setSquareState(getOtherPlayer(), xCoord, yCoord, SquareState.Hit);
            if (checkWin(getOtherPlayer())) {
                gameFinished = true;
                winner = currentPlayer;
                emit GameFinished(currentPlayer);
                return;
            }
        } else {
            setSquareState(getOtherPlayer(), xCoord, yCoord, SquareState.Miss);
        }
        switchPlayers();
    }
    
    function getSquareState(address player, uint8 xCoord, uint8 yCoord) private view returns (SquareState) {
        if (player == player1) {
            return player1Board[xCoord][yCoord];
        } else {
            return player2Board[xCoord][yCoord];
        }
    }
function setSquareState(address player, uint8 xCoord, uint8 yCoord, SquareState squareState) private {
        if (player == player1) {
            player1Board[xCoord][yCoord] = squareState;
        } else {
            player2Board[xCoord][yCoord] = squareState;
        }
    }
    
    function switchPlayers() private {
        if (currentPlayer == player1) {
            currentPlayer = player2;
        } else {
            currentPlayer = player1;
        }
    }
    
    function getOtherPlayer() private view returns (address) {
        if (currentPlayer == player1) {
            return player2;
        } else {
            return player1;
        }
    }
    
    function shipFits(uint8 xCoord, uint8 yCoord, uint8 shipSize) private view returns (bool) {
        require(xCoord < BOARD_SIZE, "Invalid x coordinate.");
        require(yCoord < BOARD_SIZE, "Invalid y coordinate.");
        if (getSquareState(currentPlayer, xCoord, yCoord) != SquareState.Empty) {
            return false;
        }
        bool horizontalFits = xCoord + shipSize <= BOARD_SIZE;
        bool verticalFits = yCoord + shipSize <= BOARD_SIZE;
        return horizontalFits || verticalFits;
    }
    
    function placeShip(address player, uint8 xCoord, uint8 yCoord, uint8 shipSize) private {
        bool horizontal = (uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % 2 == 0);
        for (uint8 i = 0; i < shipSize; i++) {
            SquareState squareState = SquareState.Ship;
            if (horizontal) {
                setSquareState(player, xCoord + i, yCoord, squareState);
            } else {
                setSquareState(player, xCoord, yCoord + i, squareState);
            }
        }
    }

    function placeShips(uint8[] memory xCoords, uint8[] memory yCoords) public onlyPlayers {
    require(gameStarted, "Game has not started yet.");
    require(xCoords.length == NUM_SHIPS, "Invalid number of ships.");
    require(yCoords.length == NUM_SHIPS, "Invalid number of ships.");
    for (uint8 i = 0; i < NUM_SHIPS; i++) {
        require(shipFits(xCoords[i], yCoords[i], shipSizes[i]), "Ship does not fit on the board.");
        placeShip(currentPlayer, xCoords[i], yCoords[i], shipSizes[i]);
    }
    switchPlayers();
}
    
    function checkWin(address player) private view returns (bool) {
        SquareState[BOARD_SIZE][BOARD_SIZE] storage board;
        if (player == player1) {
            board = player2Board;
        } else {
            board = player1Board;
        }
        for (uint8 i = 0; i < BOARD_SIZE; i++) {
            for (uint8 j = 0; j < BOARD_SIZE; j++) {
                if (board[i][j] == SquareState.Ship) {
                    return false;
                }
            }
        }
        return true;
    }
}