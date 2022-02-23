import {
  Button,
  Box,
  Text,
  useDisclosure,
  Flex,
  Image,
} from "@chakra-ui/react";
import { useEthers, useEtherBalance, ChainId } from "@usedapp/core";
import { formatEther } from "@ethersproject/units";
import Identicon from "./Identicon";
import WrongChain from "./WrongChain";
import { useState } from "react";

export default function ConnectButton({ handleOpenModal }) {
  const { activateBrowserWallet, account, chainId } = useEthers();
  const etherBalance = useEtherBalance(account);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [wrongChainId, setWrongChainId] = useState(false);

  function resetBool() {
    setWrongChainId(false);
  }

  function handleConnectWallet() {
    activateBrowserWallet();
  }
  return account ? (
    <Box
      display="flex"
      alignItems="center"
      background="gray.700"
      borderRadius="xl"
      py="0"
      fontFamily={"Arial"}
    >
      <Box px="3">
        <Text color="white" fontSize="sm">
          {etherBalance && parseFloat(formatEther(etherBalance)).toFixed(3)} ETH
        </Text>
      </Box>
      <Button
        onClick={handleOpenModal}
        bg="gray.800"
        border="1px solid transparent"
        _hover={{
          border: "1px",
          borderStyle: "solid",
          borderColor: "gray.400",
          backgroundColor: "gray.700",
        }}
        borderRadius="xl"
        m="1px"
        px={3}
        height="38px"
      >
        <Text color="white" fontSize="sm" fontWeight="medium" mr="2">
          {account &&
            `${account.slice(0, 6)}...${account.slice(
              account.length - 4,
              account.length
            )}`}
        </Text>
        <Identicon />
      </Button>
    </Box>
  ) : (
    <Flex>
      <Flex>
        {" "}
        {wrongChainId ? (
          <WrongChain isOpen={onOpen} onClose={onClose} resetBool={resetBool} />
        ) : (
          <Flex></Flex>
        )}
      </Flex>
      <Button
        onClick={handleConnectWallet}
        bg="gray.800"
        color="gray.300"
        fontSize="md"
        fontWeight="medium"
        borderRadius="xl"
        fontFamily={"Arial"}
        border="1px solid transparent"
        _hover={{
          borderColor: "gray.700",
          color: "gray.400",
        }}
        _active={{
          backgroundColor: "gray.800",
          borderColor: "gray.700",
        }}
      >
        <Flex> </Flex>
        <Image
          paddingRight="5px"
          src="./images/metamask-fox-logo.svg"
          width="25"
          height="25"
          alt="Connect with Metamask"
        ></Image>
        Connect to a wallet
      </Button>
    </Flex>
  );
}
