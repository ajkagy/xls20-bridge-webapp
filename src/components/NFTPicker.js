import {
  Box,
  Button,
  Flex,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { ExternalLinkIcon, CopyIcon } from "@chakra-ui/icons";
import { useEthers } from "@usedapp/core";
import Identicon from "./Identicon";
import Gallery from "./GalleryPicker";
import { configChain, chainText, chain } from "../contracts/index";
import {
  BrowserView,
  MobileView,
  isBrowser,
  isMobile,
} from "react-device-detect";
require("dotenv").config();

export default function NFTPicker({
  isOpen,
  onClose,
  closeModal,
  selectedNft,
  closeModalNoSelect,
}) {
  const { account, deactivate, chainId } = useEthers();
  const [accountNFTs, setAccountNFTs] = useState([]);
  const [noNFTs, setnoNFTs] = React.useState(false);

  function closeNoSelect() {
    closeModalNoSelect();
  }

  function getNFT(image, nftData) {
    closeModal(image, nftData);
  }

  const fetchNFTs = async (accountAddress) => {
    try {
      let response = await fetch(
        "https://deep-index.moralis.io/api/v2/" +
          accountAddress +
          "/nft?chain=" +
          chain +
          "&format=decimal&limit=200",
        {
          method: "GET",
          headers: {
            "X-API-KEY": process.env.REACT_APP_MORALIS_API_KEY,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      let json = await response.json();
      if (json.result.length == 0) {
        setnoNFTs(true);
      }
      setAccountNFTs(json.result);
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  };

  useEffect(() => {
    if (account != undefined && configChain == chainId) {
      fetchNFTs(account);
    }
  }, []);

  return (
    <>
      <Modal isOpen={isOpen} size={"full"} onClose={closeNoSelect}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select an NFT to bridge</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div>
              {accountNFTs.length > 0 ? (
                <>
                  <Flex direction="row" flexWrap="wrap" align="center">
                    <Gallery nftArray={accountNFTs} returnImage={getNFT} />
                  </Flex>
                </>
              ) : (
                <>
                  {noNFTs ? (
                    <Flex>No NFTs Found in wallet</Flex>
                  ) : (
                    <Flex>
                      Loading your NFTs <Spinner marginLeft={"5px"} />
                    </Flex>
                  )}
                </>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={closeNoSelect}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
