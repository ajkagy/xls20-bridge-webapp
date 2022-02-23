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
  Center,
  Badge,
  Circle,
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
} from "./contracts/index";
import {
  BrowserView,
  MobileView,
  isBrowser,
  isMobile,
  isDesktop,
} from "react-device-detect";
import Gallery from "./components/GalleryPicker";
import NFTPicker from "./components/NFTPicker";
import erc721abi from "./abi/erc721.json";
import SetApproval from "./components/SetApproval";
import BridgeFunc from "./components/BridgeFunc";
import ClaimNFT from "./components/ClaimNFT";
import { useContractMethodBridge } from "./hooks/index";
require("dotenv").config();

export default function Bridge() {
  const { account, deactivate, chainId } = useEthers();
  const [accountNFTs, setAccountNFTs] = useState([]);
  const [step, setStep] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [chooseNFTClick, setChooseNFTClick] = React.useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [selectedNFTImage, setSelectedNFTImage] = useState(null);
  const [isApprovedForTransfer, setIsApprovedForTransfer] = React.useState(false);
  const [xrpAddress, setXrpAddress] = React.useState("");
  const [bridgeIsProcessing, setBridgeIsProcessing] = React.useState(false);
  const [bridgeStatus, setBridgeStatus] = React.useState("");
  const [xrplTokenUrl, setXrplTokenUri] = React.useState("");
  const Contract = require("web3-eth-contract");

  var intervalId;

  async function IsApprovedForAll(
    contractAddress,
    ownerAddress,
    operatorAddress
  ) {
    const provider = ethers.getDefaultProvider(chain, {
      infura: {
        projectId: process.env.REACT_APP_INFURA_PROJECTID,
        projectSecret: process.env.REACT_APP_INFURA_SECRET,
      },
    });
    let contract = new ethers.Contract(contractAddress, erc721abi, provider);
    let isApproved = await contract.isApprovedForAll(
      ownerAddress,
      operatorAddress
    );
    return isApproved;
  }

  async function fetchBridgeStatus(tokenId, tokenAddress, xrpAddress) {
    try {
      let response = await fetch(
        process.env.REACT_APP_PROXY_ENDPOINT +
          "/api/xls20bridge/getStatus?tokenId=" +
          tokenId +
          "&tokenAddress=" +
          tokenAddress,
        {
          method: "GET",
        }
      );
      let json = await response.json();
      setBridgeStatus(json.status);
      if (json.status == "OfferCompleted") {
        setBridgeIsProcessing(false);
      } else {
        setTimeout(async function() {
          await fetchBridgeStatus(tokenId, tokenAddress, xrpAddress);
        }, 10000);
      }
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  }

  async function setTokenUriFromContract(contractAddress, tokenId) {
    Contract.setProvider(process.env.REACT_APP_ETH_ENDPOINT);
    var TokenContract = new Contract(erc721abi, contractAddress);
    await TokenContract.methods
      .tokenURI(tokenId)
      .call()
      .then(async function (result) {
        setXrplTokenUri(result);
      });
  }

  async function tryApprovalConfirmation() {
    setIsApprovedForTransfer(
      await IsApprovedForAll(selectedNFT.token_address, account, bridgeContract)
    );
  }

 async function tryBridgeConfirmation(xrpAddress) {
    setXrpAddress(xrpAddress);
    setBridgeIsProcessing(true);
    await fetchBridgeStatus(selectedNFT.token_id, selectedNFT.token_address, xrpAddress);
  }
  async function closeModal(nftImage, nft) {
    setTokenUriFromContract(nft.token_address, nft.token_id);
    setChooseNFTClick(false);
    setSelectedNFT(nft);
    setSelectedNFTImage(nftImage);
    setIsApprovedForTransfer(
      await IsApprovedForAll(nft.token_address, account, bridgeContract)
    );
  }
  function closeModalNoSelect() {
    setChooseNFTClick(false);
  }
  function openChooseNFT() {
    setChooseNFTClick(true);
  }

  if (account != undefined && configChain == chainId) {
    return (
      <div>
        {chooseNFTClick ? (
          <NFTPicker
            isOpen={onOpen}
            onClose={onClose}
            closeModal={closeModal}
            closeModalNoSelect={closeModalNoSelect}
          />
        ) : (
          <></>
        )}
        <Center py={6}>
          <Stack
            borderWidth="1px"
            borderRadius="lg"
            maxWidth={"1200px"}
            display="flex"
            w={{ sm: "100%", md: "740px", lg: "1200px" }}
            minHeight={"400px"}
            direction={{ base: "column", md: "row" }}
            bg={"white"}
            boxShadow={"2xl"}
            padding={1}
          >
            <Stack align={"center"} directin={"row"}>
              <Flex direction={"column"}>
                <Text color={"gray.500"}>From</Text>
                <Flex>
                  {" "}
                  <img
                    style={{ maxHeight: "25px" }}
                    src="./images/628px-Ethereum_logo_2014.svg.png"
                  />
                  <Text marginLeft={"20px"} fontSize={"xl"} fontWeight={800}>
                    Rinkeby Ethereum
                  </Text>
                </Flex>
              </Flex>
              <Flex flex={0.5} bg="white">
                {selectedNFT != null ? (
                  <>
                    <Flex
                      p={50}
                      w="full"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Box
                        maxW="sm"
                        borderWidth="1px"
                        rounded="lg"
                        shadow="lg"
                        position="relative"
                        textAlign={"center"}
                      >
                        <Link fontWeight={800} onClick={openChooseNFT}>
                          Re-select an NFT
                        </Link>
                        {selectedNFTImage.src.startsWith("ipfs://") ? (
                          <Image
                            src={
                              "https://ipfs.io/ipfs/" +
                              selectedNFTImage.src.replace("ipfs://", "")
                            }
                            roundedTop="lg"
                          />
                        ) : (
                          <Image src={selectedNFTImage.src} roundedTop="lg" />
                        )}
                        <Box p="1">
                          <Box d="flex" alignItems="baseline"></Box>
                          <Flex
                            mt="1"
                            justifyContent="space-between"
                            alignContent="center"
                          >
                            <Box
                              textAlign="center"
                              fontSize="2xl"
                              fontWeight="semibold"
                              width={"100%"}
                              as="h4"
                              lineHeight="tight"
                              isTruncated
                            >
                              <Text fontSize={"13px"}>Selected NFT</Text>
                              <Link
                                color="gray.800"
                                href={
                                  openSeaBaseUri +
                                  selectedNFT.token_address +
                                  "/" +
                                  selectedNFT.token_id
                                }
                                isExternal
                              >
                                <h4 width={"100%"}>
                                  {selectedNFT.name} - #{selectedNFT.token_id}
                                </h4>
                              </Link>
                            </Box>
                          </Flex>
                        </Box>
                      </Box>
                    </Flex>
                  </>
                ) : (
                  <>
                    <Flex
                      p={50}
                      w="full"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Box maxW="sm" borderWidth="0px" position="relative">
                        <Image
                          onClick={openChooseNFT}
                          maxW={"250px"}
                          maxH={"250px"}
                          style={{ "pointer-events": "all" }}
                          src={"./images/select_an_nft.png"}
                          roundedTop="lg"
                        />
                      </Box>
                    </Flex>
                  </>
                )}
              </Flex>
            </Stack>
            <Stack flexDirection="column" p={1} pt={1} width={"100%"}>
              <Stack
                {...(isDesktop ? { marginTop: "90px" } : {})}
                width={"100%"}
                direction={"column"}
                padding={1}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <>
                  <img
                    style={{
                      maxWidth: "100px",
                      marginTop: "10px",
                      marginBottom: "50px",
                    }}
                    src="./images/580b57fcd9996e24bc43c446.png"
                  />
                </>
                {isApprovedForTransfer &&
                selectedNFT != null &&
                xrplTokenUrl != undefined &&
                xrplTokenUrl != "" ? (
                  <Flex>
                    <BridgeFunc
                      tryBridgeConfirmation={tryBridgeConfirmation}
                      SelectedNFT={selectedNFT}
                    />
                  </Flex>
                ) : (
                  <>
                    {" "}
                    {selectedNFT != null ? (
                      <SetApproval
                        tryApprovalConfirmation={tryApprovalConfirmation}
                        TokenContract={selectedNFT.token_address}
                      />
                    ) : (
                      <></>
                    )}
                  </>
                )}

                {bridgeIsProcessing ? (
                  <>
                    <Spinner />
                    <Text>
                      {bridgeStatus == ""
                        ? "...waiting for bridge confirmation"
                        : bridgeStatus}
                    </Text>
                  </>
                ) : (
                  <></>
                )}
              </Stack>
            </Stack>
            <Stack align={"center"} directin={"row"} minWidth="350px">
              <Flex direction={"column"}>
                <Text color={"gray.500"}>To</Text>
                <Flex>
                  {" "}
                  <img
                    style={{ maxHeight: "25px" }}
                    src="./images/xrpl_img.png"
                  />
                  <Text
                    marginBottom={"40px"}
                    marginLeft={"20px"}
                    fontSize={"xl"}
                    fontWeight={800}
                  >
                    XLS-20 Dev Net
                  </Text>
                </Flex>
                <ClaimNFT
                  XrpAddress={xrpAddress}
                  BridgeStatus={bridgeStatus}
                  TokenURI={xrplTokenUrl}
                />
              </Flex>
            </Stack>
          </Stack>
        </Center>
      </div>
    );
  } else {
    return (
      <div className="ext-box">
        <div className="int-box" style={{ fontWeight: "bold", color: "black" }}>
          <h2>
            Please connect to Metamask and change your network to {chainText}
          </h2>
        </div>
      </div>
    );
  }
}
