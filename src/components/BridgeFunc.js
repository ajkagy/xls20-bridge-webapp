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
  FormControl,
  FormLabel,
  Checkbox,
  Alert,
  AlertIcon,
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
import { useContractMethod, useContractMethodBridge } from "../hooks/index";
import PropTypes from "prop-types";
import { TrustSetFlags } from "xrpl";
const xrpl = require("xrpl");

const BridgeFunc = (props) => {
  const { SelectedNFT, tryBridgeConfirmation, BridgeOnlineStatus } = props;
  const { account, deactivate, chainId } = useEthers();
  const { state: bridgeState, send: bridge } =
    useContractMethodBridge("BridgeETHToXRPL");
  const [errorMsg, setErrorMsg] = useState("");
  const [transHash, setTransHash] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [bridgeButtonDisabled, setBridgeButtonDisabled] = useState(false);
  const [MintReceipt, setMintReceipt] = useState();
  const [xrpAddress, setXrpAddress] = React.useState("");

  function handleChangeXrpAddress(event) {
    setXrpAddress(event.target.value);
  }

  useEffect(() => {
    if(BridgeOnlineStatus != "Online")
    {
      setBridgeButtonDisabled(true);
    }
    console.log(bridgeState)
    if (bridgeState.receipt != undefined) {
      if (
        bridgeState.receipt.from == account &&
        bridgeState.status == "Success" &&
        bridgeState.receipt.transactionHash != transHash
      ) {
        setMintReceipt(bridgeState.receipt);
        setTransHash(bridgeState.receipt.transactionHash);
        if (confirm == false) {
          setBridgeButtonDisabled(true);
          setConfirm(true);
          tryBridgeConfirmation(xrpAddress);
        }
      }
    }
    if (
      bridgeState.status == "Exception" &&
      bridgeState.errorMessage != errorMsg
    ) {
      console.log('set error message')
      setErrorMsg(bridgeState.errorMessage ? bridgeState.errorMessage : "");
    }
  }, [bridgeState]);

  function clearXrpAddress() {
    setXrpAddress("");
    setErrorMsg("");
  }

  function transferNFT() {
    if (!xrpl.isValidAddress(xrpAddress)) {
      setErrorMsg("Invalid XRP Address");
      return;
    } else {
      setErrorMsg("");
    }
    bridge(SelectedNFT.token_address, SelectedNFT.token_id, xrpAddress);
  }

  return (
    <Flex>
      <Flex align={"center"} justify={"center"} bg={"white"}>
        <Stack spacing={1} py={1} px={1} alignItems={"center"}>
          <Box bg={"white"} p={1}>
            <Stack spacing={1}>
              <FormControl id="xrpAddressId">
                <FormLabel>Recipient XRP address</FormLabel>
                <InputGroup>
                  <InputRightElement
                    children={
                      <IconButton
                        marginTop={"7px"}
                        marginRight={"7px"}
                        size={"sm"}
                        icon={<CloseIcon size={"sm"} />}
                        onClick={clearXrpAddress}
                      />
                    }
                    size="xs"
                  />
                  <Input
                    minWidth={"300px"}
                    maxLength={200}
                    size="lg"
                    style={{ minHeight: "30px", fontSize: ".8em" }}
                    value={xrpAddress}
                    onChange={handleChangeXrpAddress}
                    placeholder="Recipient XRP Address"
                  />
                </InputGroup>
              </FormControl>
              <Stack spacing={1}>
                <Stack
                  direction={{ base: "column", sm: "row" }}
                  align={"start"}
                  justify={"space-between"}
                ></Stack>
                {bridgeState.status == "Mining" ? (
                  <Button
                    disabled={true}
                    onClick={transferNFT}
                    bg={"blue.400"}
                    color={"white"}
                    _hover={{
                      bg: "blue.500",
                    }}
                  >
                    Bridge
                  </Button>
                ) : (
                  <Button
                    disabled={bridgeButtonDisabled}
                    onClick={transferNFT}
                    bg={"blue.400"}
                    color={"white"}
                    _hover={{
                      bg: "blue.500",
                    }}
                  >
                    Bridge
                  </Button>
                )}
              </Stack>
              <Flex
                width={"100%"}
                textAlign={"center"}
                direction={"column"}
                alignItems={"center"}
              >
                {bridgeState.status == "Mining" ? (
                  <>
                    {" "}
                    <Spinner marginTop={"10px"} />{" "}
                    <Text>...wait for transaction confirmation</Text>
                  </>
                ) : (
                  <></>
                )}
                {errorMsg != "" ? (
                  <Alert status="error">
                    <AlertIcon />
                    {errorMsg}
                  </Alert>
                ) : (
                  <></>
                )}
              </Flex>
            </Stack>
          </Box>
        </Stack>
      </Flex>

      <Flex></Flex>
      <Flex></Flex>
    </Flex>
  );
};
BridgeFunc.propTypes = {
  SelectedNFT: PropTypes.any.isRequired,
};

export default BridgeFunc;
