import React from 'react'
import './App.css'
import web3 from './web3'
import lottery from './lottery'

/**
 * Add tailwind
 * Update styles
 * Create error flux
 * Create components
 * Add kusky
 * Add linter
 */

class App extends React.Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    bet: 0,
    message: '',
  }

  async componentDidMount() {
    const lotteryManager = await lottery.methods.manager().call()
    const players = await lottery.methods.getPlayers().call()
    const balance = await web3.eth.getBalance(lottery.options.address)

    this.setState({ manager: lotteryManager, players, balance })
  }

  // Add error handling
  onSubmit = async (event) => {
    event.preventDefault()

    this.setState({ message: 'Entering the lottery in a few seconds...' })

    const accoounts = await web3.eth.getAccounts()

    await lottery.methods.enter().send({
      from: accoounts[0],
      value: web3.utils.toWei(this.state.bet, 'ether'),
    })

    this.setState({ message: 'You have entered the lottery!' })
  }

  // Add disclaimer explaining this is for testing purposes
  // and only the contract deployer can show the winner
  discoverWinner = async () => {
    this.setState({ message: 'A winner will be presented in a few seconds...' })

    const accoounts = await web3.eth.getAccounts()

    await lottery.methods.pickWinner().send({
      from: accoounts[0]
    })

    this.setState({ message: 'We have a new winner!' })
  }

  render() {
    return (
      <div className="App">
        <h2>Lottery Contract</h2>
        <p>This lottery has the following address as manager: {this.state.manager}</p>
        <p>Number of players: {this.state.players.length}</p>
        <p>They are competing to win: {web3.utils.fromWei(this.state.balance, 'ether')} ether</p>

        <hr />

        <form onSubmit={this.onSubmit}>
          <h4>Enter the lottery to win some ether!</h4>
          <div>
            <label>Amount to enter:</label>
            <input
              value={this.state.bet}
              onChange={e => this.setState({ bet: e.target.value })}
            />
          </div>
          <button type='submit'>Enter!</button>
        </form>

        <hr />

        <h4 onClick={this.discoverWinner}>Find out who gets the prize!</h4>
        <button>Pick a winner!</button>

        <hr />

        <div>
          <h4>{this.state.message}</h4>
        </div>
      </div>
    )
  }
}

export default App
