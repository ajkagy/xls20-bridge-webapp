import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  NumberInput,
  NumberInputField,
  useDisclosure,
  Image,
  Spacer,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stack,
  Heading,
  Input,
  Container,
  IconButton,
  Slider,
  SliderFilledTrack,
  SliderTrack,
  SliderThumb,
  Link,
  InputGroup,
  InputRightElement,
  Spinner,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { utils, ethers } from "ethers";
import { useEthers, useContractCall } from "@usedapp/core";
import {
  configChain,
  chainText,
  chain,
  openSeaBaseUri,
  bridgeContract,
} from "../contracts/index";
import {
  BrowserView,
  MobileView,
  isBrowser,
  isMobile,
} from "react-device-detect";
import { useContractMethod } from "../hooks/index";
import PropTypes from "prop-types";

const SetApproval = (props) => {
  const { TokenContract, tryApprovalConfirmation } = props;
  const { account, deactivate, chainId } = useEthers();
  const { state: approveState, send: approveTransfer } = useContractMethod(
    "setApprovalForAll",
    TokenContract
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [transHash, setTransHash] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [MintReceipt, setMintReceipt] = useState();

  function approveForTransfer() {
    approveTransfer(bridgeContract, true);
  }

  useEffect(() => {
    if (approveState != undefined) {
      if (
        approveState.status == "Exception" &&
        approveState.errorMessage != errorMsg
      ) {
        setErrorMsg(approveState.errorMessage ? approveState.errorMessage : "");
      }
      if (approveState.receipt != undefined) {
        if (
          approveState.receipt.from == account &&
          approveState.status == "Success" &&
          approveState.receipt.transactionHash != transHash
        ) {
          setMintReceipt(approveState.receipt);
          setTransHash(approveState.receipt.transactionHash);
          setConfirm(true);
          tryApprovalConfirmation();
        }
      }
    }
  }, [approveState]);

  return (
    <Flex
      width={"100%"}
      textAlign={"center"}
      direction={"column"}
      alignItems={"center"}
    >
      <Button onClick={approveForTransfer}>Approve NFT for Transfer</Button>
      {approveState.status == "Mining" ? (
        <>
          {" "}
          <Spinner marginBottom={"1px"} marginTop={"10px"} />{" "}
          <Text>...Please wait for transaction confirmation</Text>
        </>
      ) : (
        <></>
      )}
      {approveState.status == "Success" ? (
        <>
          {" "}
          <Text>Transaction confirmed</Text>
        </>
      ) : (
        <></>
      )}
    </Flex>
  );
};
SetApproval.propTypes = {
  TokenContract: PropTypes.any.isRequired,
};

export default SetApproval;
