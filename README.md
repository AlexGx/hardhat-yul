# hardhat-yul

[![npm](https://img.shields.io/npm/v/@tovarishfin/hardhat-yul.svg)](https://www.npmjs.com/package/@tovarishfin/hardhat-yul) [![hardhat](https://hardhat.org/buidler-plugin-badge.svg?1)](https://hardhat.org)

[Hardhat](https://hardhat.org) plugin to develop smart contracts with Yul and/or Yul+.

## What

This plugin adds support for Yul and Yul+ to Hardhat. Once installed, Yul contracts can be compiled by running the `compile` task.

The Yul compiler is run using the [official solc compiler](https://github.com/ethereum/solc-js#readme).

## Installation

First, you need to install the plugin by running

```bash
npm install --save-dev @tovarishfin/hardhat-yul
```

And add the following statement to your `hardhat.config.js`:

```js
require("@tovarishfin/hardhat-yul");
```

Or, if you are using TypeScript, add this to your `hardhat.config.ts`:

```ts
import "@tovarishfin/hardhat-yul";
```

## Required plugins

No plugins dependencies.

## Tasks

This plugin creates no additional tasks.

## Environment extensions

This plugin does not extend the Hardhat Runtime Environment.

## Configuration

### ABI

Add the following if you want to deploy and/or test your Yul sources. In `hardhat.config.{ts,js}`:

```javascript
const config: HardhatUserConfig = {
  solidity: "0.8.20",

  yulArtifacts: {
    <contract_name>: {   // Must be the name of the contract defined by Yul source
      abi: [
        {
            // ...
        },
        {
            // ...
        },
      ],
    }
  }
};
```

## Usage

There are no additional steps you need to take for this plugin to work. See [example project](./test/hh-yul-project/hardhat.config.ts) for testing demo.

### Additional notes

This is a fork of [ControlCplusControlV's work](https://github.com/ControlCplusControlV/hardhat-Yul) which no longer seems to be working.
There are no tests for this plugin and there are no plans for it :)
