const HDWalletProvider = require('@truffle/hdwallet-provider')
const { mnemonicPhrase, bscTestnetAddress } = require('./config')
const Web3 = require('web3')

const provider = new HDWalletProvider(mnemonicPhrase, bscTestnetAddress)
const web3 = new Web3(provider)

const compiled = require('./build/Lottery.json')
const abi = compiled.abi
const bytecode = compiled.evm.bytecode.object

async function deploy() {
  const accounts = web3.eth.getAccounts()

  console.log('Deploying contract using this account address: ', accounts[0])

  const contract = await new web3.eth.Contract(abi).deploy({
    data: bytecode,
    arguments: []
  }).send({
    from: accounts[0],
    gas: '2500000'
  })

  provider.engine.stop()
  console.log('Contract deployed to: ', contract.options.address)
}

deploy()
