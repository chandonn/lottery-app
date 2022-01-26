const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')

const web3 = new Web3(ganache.provider())

const { interface, bytecode } = require('../compile')

// Defining vars to use as extected values
let lottery
let accounts
let lotteryManager
let secondPlayer
let thirdPlayer

// Deploy process repeats for every test
beforeEach(async () => {
  accounts = await web3.eth.getAccounts()

  lotteryManager = accounts[0]
  secondPlayer = accounts[1]
  thirdPlayer = accounts[2]

  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '500000' })
})

describe('Lottery contract', () => {
  it('should retrieve some accounts, at least one', () => {
    assert.ok(accounts[0])
  })

  it('should deploy the contract with success', () => {
    assert.ok(lottery.options.address)
  })

  it('should enter the lottery with one account', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      // The function toWei is used to convert a value to wei
      value: web3.utils.toWei('0.0002', 'ether')
    })

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    })

    assert.strictEqual(players.length, 1)
    assert.strictEqual(players[0], accounts[0])
  })

  it('should set the first account as the manager of the lottery', async () => {
    const manager = await lottery.methods.getManager().call({
      from: accounts[0]
    })

    assert.strictEqual(manager, lotteryManager)
  })

  it('should enter more players', async () => {
    // First player
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.0002', 'ether')
    })

    // Second player
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.0004', 'ether')
    })

    const currentPlayers = await lottery.methods.getPlayers().call({
      from: accounts[0]
    })

    assert.strictEqual(currentPlayers.length, 2)
    assert.strictEqual(currentPlayers[0], secondPlayer)
    assert.strictEqual(currentPlayers[1], thirdPlayer)
  })

  it('should require a minimum value to enter the lottery', async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei('0.000002', 'ether')
      })

      // If this piece gets executed, the test fails automatically. There is not enough ether
      assert(false)
    } catch (error) {
      assert(error)
    }
  })

  it('should only allow managers to pick the lotterys winners', async () => {
    // First player
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.0002', 'ether')
    })

    // Second player
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.0004', 'ether')
    })
    
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      })

      assert(false)
    } catch(error) {
      assert(error)
    }
  })

  it('should send money to the lottery winner and reset the lottery', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('1', 'ether')
    })

    const initialBalance = await web3.eth.getBalance(accounts[0])
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    })
    const finalBalance = await web3.eth.getBalance(accounts[0])
    const difference = finalBalance - initialBalance

    assert(finalBalance > initialBalance)
    assert(difference > web3.utils.toWei('0.9', 'ether'))
  })
})
