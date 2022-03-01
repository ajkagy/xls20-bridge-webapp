import logo from "./logo.svg";
import "./App.css";
import { isMobile, isDesktop } from "react-device-detect";
import { Route, Switch, Redirect, NavLink } from "react-router-dom";
import AccountSubComp from "./components/AccountSubComp";
import Bridge from "./Bridge";
import "./css/styles.css";
import { MoralisProvider } from "react-moralis";
import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Avatar,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Text,
  Image,
  ChakraProvider,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, AddIcon } from "@chakra-ui/icons";
import 'status-indicator/styles.css'
require("dotenv").config();

export default function App() {
  const [bridgeOnlineStatus, setBridgeOnlineStatus] = React.useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(async () => {
    await getBridgeStatus();
  }, []);

  async function getBridgeStatus() {
    try {
      let response = await fetch(
        process.env.REACT_APP_PROXY_ENDPOINT +
          "/api/xls20bridge/bridgeStatus",
        {
          method: "GET",
        }
      );
      let json = await response.json();
      console.log(json);
      setBridgeOnlineStatus(json.status);
    } catch (error) {
      console.log('error');
      setBridgeOnlineStatus("Offline");
    }
  }

  return (
    <ChakraProvider>
      <MoralisProvider
        appId={process.env.REACT_APP_MORALIS_APP_ID}
        serverUrl={process.env.REACT_APP_MORALIS_SERVER_URL}
      >
        <Box px={4} style={{ fontFamily: "Hind" }}>
          <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
            {isDesktop ? (
              <>
                <Image
                  maxH={"80px"}
                  marginLeft={"100px"}
                  marginTop={"50px"}
                  src={"./images/FLF6hSsWQAMd_7H.png"}
                />{" "}
              </>
            ) : (
              <></>
            )}
            <IconButton
              size={"md"}
              icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
              aria-label={"Open Menu"}
              display={{ md: "none" }}
              onClick={isOpen ? onClose : onOpen}
            />
            <HStack spacing={8} alignItems={"center"}>
              <HStack
                fontFamily="Hind"
                color="white"
                as={"nav"}
                style={{ fontWeight: "bold" }}
                spacing={4}
                display={{ base: "none", md: "flex" }}
              ></HStack>
            </HStack>
            <HStack
              spacing={4}
              alignItems={"center"}
              display={{ base: "none", md: "flex", fontFamily: "Hind" }}
            ></HStack>
            <Flex alignItems={"center"} fontFamily="Hind" fontSize="x-small">
              <Menu>
                {isDesktop ? <>
                {bridgeOnlineStatus == "Online" ? <><status-indicator style={{marginRight:'15px',marginLeft:'30px'}} positive pulse></status-indicator> <Text style={{marginRight:"30px", fontSize:'15px', fontWeight:'800', fontFamily:'Arial'}}>Bridge Status: {bridgeOnlineStatus}</Text></> : <></>}
                {bridgeOnlineStatus == "Validation Offline" ? <><status-indicator style={{marginRight:'15px',marginLeft:'30px'}} intermediary pulse></status-indicator> <Text style={{marginRight:"30px", fontSize:'15px', fontWeight:'800', fontFamily:'Arial'}}>Bridge Status: {bridgeOnlineStatus}</Text></> : <></>}
                {bridgeOnlineStatus == "Offline" ? <><status-indicator style={{marginRight:'15px',marginLeft:'30px'}} negative pulse></status-indicator> <Text style={{marginRight:"30px", fontSize:'15px', fontWeight:'800', fontFamily:'Arial'}}>Bridge Status: {bridgeOnlineStatus}</Text></> : <></>}
                </>
                :<>
                {bridgeOnlineStatus == "Online" ? <><status-indicator style={{marginRight:'15px',marginLeft:'10px'}} positive pulse></status-indicator> <Text style={{marginRight:"30px", fontSize:'12px', fontWeight:'800', fontFamily:'Arial'}}>Bridge Status: {bridgeOnlineStatus}</Text></> : <></>}
                {bridgeOnlineStatus == "Validation Offline" ? <><status-indicator style={{marginRight:'15px',marginLeft:'10px'}} intermediary pulse></status-indicator> <Text style={{marginRight:"30px", fontSize:'12px', fontWeight:'800', fontFamily:'Arial'}}>Bridge Status: {bridgeOnlineStatus}</Text></> : <></>}
                {bridgeOnlineStatus == "Offline" ? <><status-indicator style={{marginRight:'15px',marginLeft:'10px'}} negative pulse></status-indicator> <Text style={{marginRight:"30px", fontSize:'12px', fontWeight:'800', fontFamily:'Arial'}}>Bridge Status: {bridgeOnlineStatus}</Text></> : <></>}
                
                </> }
                <AccountSubComp />
              </Menu>
            </Flex>
          </Flex>
          {isOpen ? (
            <Box pb={4} display={{ md: "none" }}>
              <Stack color="black" as={"nav"} spacing={4}></Stack>
            </Box>
          ) : null}
        </Box>
        <Box p={4} minH={"100%"} backgroundSize={"cover"} width={"100%"}>
          <Bridge BridgeOnlineStatus={bridgeOnlineStatus} />
        </Box>
      </MoralisProvider>
    </ChakraProvider>
  );
}
