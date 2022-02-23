// hooks/index.ts
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { useContractCall, useContractFunction } from "@usedapp/core";
import erc721abi from "../abi/erc721.json";
import bridgeAbi from "../abi/bridgeContract.json";
import { bridgeContract } from "../contracts";

const contractInterface = new ethers.utils.Interface(erc721abi);
const bridgeInterface = new ethers.utils.Interface(bridgeAbi);

export function useContractMethod(methodName, tokenContract) {
    const contract = new Contract(tokenContract, contractInterface);
    const { state, send, events } = useContractFunction(contract, methodName, {});
    return { state, send };
  }

  export function useContractMethodBridge(methodName) {
    const contract = new Contract(bridgeContract, bridgeInterface);
    const { state, send, events } = useContractFunction(contract, methodName, {});
    return { state, send };
  }


