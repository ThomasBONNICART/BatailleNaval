import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Battleship } from './Bataille.sol';

describe('Battleship', () => {
  let battleship: Battleship;

  beforeEach(async () => {
    const [player1, player2] = await ethers.getSigners();
    const BattleshipFactory = await ethers.getContractFactory('Battleship', player1);
    battleship = await BattleshipFactory.deploy(player2.address);
    await battleship.deployed();
  });

  describe('startGame', () => {
    it('le jeu commence', async () => {
      expect(await battleship.gameStarted()).to.equal(false);
      await battleship.startGame();
      expect(await battleship.gameStarted()).to.equal(true);
    });

    it('devrait être inversé si le jeu a déjà commencé', async () => {
      await battleship.startGame();
      await expect(battleship.startGame()).to.be.revertedWith('le jeu a deja commencer');
    });
  });

  describe('placeShips', () => {
    it('should place ships', async () => {
      await battleship.startGame();
      const xCoords = [0, 1, 2, 3, 4];
      const yCoords = [0, 0, 0, 0, 0];
      await battleship.placeShips(xCoords, yCoords);
      expect(await battleship.getSquareState(await battleship.player1(), 0, 0)).to.equal(1);
      expect(await battleship.getSquareState(await battleship.player1(), 1, 0)).to.equal(1);
      expect(await battleship.getSquareState(await battleship.player1(), 2, 0)).to.equal(1);
      expect(await battleship.getSquareState(await battleship.player1(), 3, 0)).to.equal(1);
      expect(await battleship.getSquareState(await battleship.player1(), 4, 0)).to.equal(1);
    });

    it('should revert if game has not started', async () => {
      const xCoords = [0, 1, 2, 3, 4];
      const yCoords = [0, 0, 0, 0, 0];
      await expect(battleship.placeShips(xCoords, yCoords)).to.be.revertedWith('Game has not started yet.');
    });

    it('should revert if invalid number of ships', async () => {
      await battleship.startGame();
      const xCoords = [0, 1, 2, 3];
      const yCoords = [0, 0, 0, 0];
      await expect(battleship.placeShips(xCoords, yCoords)).to.be.revertedWith('Invalid number of ships.');
    });

    it('should revert if ship does not fit on the board', async () => {
      await battleship.startGame();
      const xCoords = [0, 1, 2, 3, 4];
      const yCoords = [0, 0, 0, 0, 1];
      await expect(battleship.placeShips(xCoords, yCoords)).to.be.revertedWith('Ship does not fit on the board.');
    });
  });

  describe('attack', () => {
    it('should attack a square', async () => {
      await battleship.startGame();
      const xCoord = 0;
      const yCoord = 0;
      await battleship.placeShips([0, 1, 2, 3, 4], [0, 0, 0, 0, 0]);
      const result = await battleship.attack(xCoord, yCoord);
      expect(result.targetHit).to.equal(true);
      expect(result.shipHit).to.equal(true);
      expect(result.gameOver).to.equal(false);
    });
  
    it('should miss an attack', async () => {
      await battleship.startGame();
      const xCoord = 0;
      const yCoord = 0;
      await battleship.placeShips([5, 6, 7, 8, 9], [0, 0, 0, 0, 0]);
      const result = await battleship.attack(xCoord, yCoord);
      expect(result.targetHit).to.equal(false);
      expect(result.shipHit).to.equal(false);
      expect(result.gameOver).to.equal(false);
    });
  
    it('should sink a ship', async () => {
      await battleship.startGame();
      await battleship.placeShips([0, 1, 2, 3, 4], [0, 0, 0, 0, 0]);
      await battleship.attack(0, 0);
      await battleship.attack(1, 0);
      await battleship.attack(2, 0);
      await battleship.attack(3, 0);
      const result = await battleship.attack(4, 0);
      expect(result.targetHit).to.equal(true);
      expect(result.shipHit).to.equal(true);
      expect(result.shipSunk).to.equal(true);
      expect(result.gameOver).to.equal(false);
    });
  
    it('should end the game', async () => {
      await battleship.startGame();
      await battleship.placeShips([0, 1, 2, 3, 4], [0, 0, 0, 0, 0]);
      await battleship.attack(0, 0);
      await battleship.attack(1, 0);
      await battleship.attack(2, 0);
      await battleship.attack(3, 0);
      await battleship.attack(4, 0);
      const result = await battleship.attack(5, 0);
      expect(result.targetHit).to.equal(true);
      expect(result.shipHit).to.equal(true);
      expect(result.shipSunk).to.equal(true);
      expect(result.gameOver).to.equal(true);
    });
  });


})