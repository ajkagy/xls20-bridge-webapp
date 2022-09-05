# xls20-bridge-webapp
React app for ERC721 to XLS20 Bridge

### Requirements

+ [NodeJs](https://nodejs.org/en/)
+ [Git](https://git-scm.com/downloads)

## Getting Started

Open a command prompt or Powershell prompt and issue the following commands

```
git clone https://github.com/ajkagy/xls20-bridge-webapp
```

1. Sign up for a free [Moralis API account](https://moralis.io/)
2. Create a new [Moralis Server](https://docs.moralis.io/moralis-server/getting-started/create-a-moralis-server)

3. in the root of the xls20-bridge-webapp directory create a new .env file and add the following text:

        REACT_APP_PROXY_ENDPOINT=
        REACT_APP_XRPL_RPC=wss://xls20-sandbox.rippletest.net:51233
        REACT_APP_MORALIS_API_KEY=
        REACT_APP_MORALIS_APP_ID=
        REACT_APP_MORALIS_SERVER_URL=

4. Open `xls20-bridge-webapp/src/contracts/index.js` and add the bridge contract address that was deployed to Rinkeby in the `bridgeContract` variable
5. Add your API Key, App ID and Server URL into the Moralis variable keys.
6. Add the Bridge Proxy URL into the REACT_APP_PROXY_ENDPOINT environment variable you setup when installing [The Bridge Proxy](https://github.com/ajkagy/xls20-bridge-proxy)
7. Install

        npm install

8. Start the webserver

        npm run start
