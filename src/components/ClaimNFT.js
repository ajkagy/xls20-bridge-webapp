import {
  Box,
  Center,
  Text,
  Stack,
  List,
  ListItem,
  ListIcon,
  Button,
  Alert,
  Spinner,
  AlertIcon,
  Link,
  useDisclosure,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import PropTypes from "prop-types";
import React, { useEffect, useRef } from "react";
import TransactionXumm from "./TransactionXumm";
import {
  BrowserView,
  MobileView,
  isBrowser,
  isMobile,
  isDesktop,
} from "react-device-detect";
import { xrplExplorerBaseUri } from "../contracts/index";
require("dotenv").config();

const ClaimNFT = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [wsConnection, setwsConnection] = React.useState("");
  const [listenWs, setlistenWs] = React.useState(false);
  const [qrMatrix, setQrMatrix] = React.useState("");
  const [mobileTxnUrl, setMobileTxnUrl] = React.useState("");
  const [claimClicked, setClaimClicked] = React.useState(false);
  const [showSpinner, setShowSpinner] = React.useState(false);
  const [requestFailed, setRequestFailed] = React.useState(false);
  const [requestResolved, setRequestResolved] = React.useState(false);
  const [requestResolvedMessage, setrequestResolvedMessage] =
    React.useState("");
  const [txnId, setTxnId] = React.useState("");
  const ws = useRef(WebSocket);
  const xrpl = require("xrpl");

  const { BridgeStatus, XrpAddress, TokenURI } = props;

  useEffect(() => {
    if (!ws.current) return;
    ws.current.onmessage = async (e) => {
      console.log(e);
      if (!listenWs) return;
      let responseObj = JSON.parse(e.data.toString());
      if (responseObj.signed != null) {
        const payload = await getXummPayload(responseObj.payload_uuidv4);
        if (payload.data != null) {
          let payloadMeta = payload.data;
          if (
            payloadMeta.meta.resolved == true &&
            payloadMeta.meta.signed == true
          ) {
            setrequestResolvedMessage("Sign request successful.");
            setTxnId(
              payloadMeta.response.txid ? payloadMeta.response.txid : ""
            );
          } else if (
            payloadMeta.meta.resolved == true &&
            payloadMeta.meta.signed == false
          ) {
            setRequestFailed(true);
            setrequestResolvedMessage("Sign request has been rejected.");
          } else if (
            payloadMeta.meta.resolved == false &&
            payloadMeta.meta.signed == false &&
            payloadMeta.meta.cancelled == true &&
            payloadMeta.meta.expired == true
          ) {
            setRequestFailed(true);
            setrequestResolvedMessage("Request has been cancelled.");
          } else if (
            payloadMeta.meta.resolved == false &&
            payloadMeta.meta.signed == false &&
            payloadMeta.meta.cancelled == false &&
            payloadMeta.meta.expired == true
          ) {
            setRequestFailed(true);
            setrequestResolvedMessage("Request has expired.");
          }
        }

        closeModal();
        setShowSpinner(false);
        setRequestResolved(true);
        ws.current.close();
      }
    };
  }, [listenWs]);

  function closeModal() {
    setClaimClicked(false);
  }

  const transactionBlobOfferAccept = {
    TransactionType: "NFTokenAcceptOffer",
    SellOffer: "",
  };

  const fetchClaims = async (xrpAddress, tokenUri) => {
    try {
      let response = await fetch(
        process.env.REACT_APP_PROXY_ENDPOINT +
          "/api/xls20bridge/getBridgeInfoByXRPAddress/" +
          xrpAddress,
        {
          method: "GET",
        }
      );
      let json = await response.json();
      if (json.length > 0) {
        for (let i = 0; i < json.length; i++) {
          if (tokenUri == json[i].tokenUri) {
            return json[i].xrplTokenId;
          }
        }
      }
      return "";
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  };

  async function returnOfferId(tokenId) {
    const client = new xrpl.Client(process.env.REACT_APP_XRPL_RPC);
    await client.connect();

    let nftSellOffers;
    try {
      nftSellOffers = await client.request({
        method: "nft_sell_offers",
        tokenid: tokenId,
      });
      await client.disconnect();
    } catch (err) {
      console.log(err);
      return "";
    }

    try {
      if (nftSellOffers.result.offers.length > 0) {
        console.log(nftSellOffers.result.offers.length);
        return nftSellOffers.result.offers[0].index;
      }
    } catch (err) {
      console.log(err);
      return "";
    }
  }

  const getXummPayload = async (requestContent) => {
    try {
      let response = await fetch(
        process.env.REACT_APP_PROXY_ENDPOINT + "/xumm/getpayload",
        {
          method: "post",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payloadID: requestContent }),
        }
      );
      let json = await response.json();
      return { success: true, data: json };
    } catch (error) {
      return { success: false };
    }
  };

  const postXummPayload = async (requestContent) => {
    try {
      console.log(requestContent);
      let response = await fetch(
        process.env.REACT_APP_PROXY_ENDPOINT + "/xumm/createpayload",
        {
          method: "post",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestContent),
        }
      );
      let json = await response.json();
      return { success: true, data: json };
    } catch (error) {
      return { success: false };
    }
  };

  const ClaimNFTClick = async () => {
    {
      try {
        setShowSpinner(true);
        let tokenID = await fetchClaims(XrpAddress, TokenURI);
        console.log(tokenID);
        let offerID = await returnOfferId(tokenID);
        console.log(offerID);

        if (offerID != "") {
          var transRequest = transactionBlobOfferAccept;
          transRequest.SellOffer = offerID;
          console.log(transRequest);
          let responseXum = await postXummPayload(transRequest);
          console.log(responseXum);
          if (responseXum.data?.refs.qr_matrix) {
            setwsConnection(responseXum.data?.refs.websocket_status);
            setQrMatrix(responseXum.data?.refs.qr_png);
            setMobileTxnUrl(responseXum.data?.next.always);
            setClaimClicked(true);
            setlistenWs(true);

            ws.current = new WebSocket(responseXum.data?.refs.websocket_status);

            const wsCurrent = ws.current;
            return () => {
              wsCurrent.close();
            };
          }
        } else {
          setShowSpinner(false);
          setRequestFailed(true);
          setrequestResolvedMessage("An error has occurred.");
        }
      } catch (err) {
        setShowSpinner(false);
        setRequestFailed(true);
        setrequestResolvedMessage("An error has occurred.");
      }
    }
  };

  return (
    <Center py={6}>
      <Box
        maxW={"330px"}
        w={"full"}
        boxShadow={"2xl"}
        rounded={"md"}
        overflow={"hidden"}
      >
        <Stack textAlign={"center"} p={6} align={"center"}>
          <Stack direction={"row"} align={"center"} justify={"center"}>
            <Text fontSize={"xl"} fontWeight={800}>
              Bridge Process Checks
            </Text>
          </Stack>
        </Stack>
        <Box px={6} py={2}>
          <List spacing={1}>
            <ListItem>
              {BridgeStatus != "" ? (
                <ListIcon as={CheckIcon} color="green.400" />
              ) : (
                <ListIcon as={CloseIcon} color="red.400" />
              )}
              Confirmed ETH Transaction
            </ListItem>
            <ListItem>
              {BridgeStatus == "Pending" ||
              BridgeStatus == "Signed" ||
              BridgeStatus == "OfferSigned" ||
              BridgeStatus == "OfferCreate" ||
              BridgeStatus == "Validator Agreement" ||
              BridgeStatus == "OfferCompleted" ||
              BridgeStatus == "Validator Agreement Offer" ? (
                <ListIcon as={CheckIcon} color="green.400" />
              ) : (
                <ListIcon as={CloseIcon} color="red.400" />
              )}
              Bridge Received NFT
            </ListItem>
            <ListItem>
              {BridgeStatus == "OfferSigned" ||
              BridgeStatus == "OfferCreate" ||
              BridgeStatus == "Validator Agreement" ||
              BridgeStatus == "OfferCompleted" ||
              BridgeStatus == "Validator Agreement Offer" ? (
                <ListIcon as={CheckIcon} color="green.400" />
              ) : (
                <ListIcon as={CloseIcon} color="red.400" />
              )}
              Validated
            </ListItem>
            <ListItem>
              {BridgeStatus == "OfferSigned" ||
              BridgeStatus == "OfferCreate" ||
              BridgeStatus == "OfferCompleted" ||
              BridgeStatus == "Validator Agreement Offer" ? (
                <ListIcon as={CheckIcon} color="green.400" />
              ) : (
                <ListIcon as={CloseIcon} color="red.400" />
              )}
              NFT Minted
            </ListItem>
            <ListItem>
              {BridgeStatus == "OfferCompleted" ? (
                <ListIcon as={CheckIcon} color="green.400" />
              ) : (
                <ListIcon as={CloseIcon} color="red.400" />
              )}
              Offer Created
            </ListItem>
          </List>

          {BridgeStatus == "OfferCompleted" && XrpAddress != "" ? (
            <Button
              onClick={ClaimNFTClick}
              mt={10}
              w={"full"}
              bg={"green.400"}
              color={"white"}
              rounded={"xl"}
              boxShadow={"0 5px 20px 0px rgb(72 187 120 / 43%)"}
              _hover={{
                bg: "green.500",
              }}
              _focus={{
                bg: "green.500",
              }}
            >
              Claim XLS-20 NFT
            </Button>
          ) : (
            <Button
              disabled={true}
              mt={10}
              w={"full"}
              bg={"green.400"}
              color={"white"}
              rounded={"xl"}
              boxShadow={"0 5px 20px 0px rgb(72 187 120 / 43%)"}
              _hover={{
                bg: "green.500",
              }}
              _focus={{
                bg: "green.500",
              }}
            >
              Claim XLS-20 NFT
            </Button>
          )}

          {claimClicked && isBrowser ? (
            <TransactionXumm
              isOpen={onOpen}
              onClose={onClose}
              txnPng={qrMatrix}
              closeModal={closeModal}
            />
          ) : (
            <></>
          )}
          {claimClicked && isMobile ? (
            <Text fontSize="18px" fontWeight="bold" color="#3182ce">
              <Link fontSize="1.4em" href={mobileTxnUrl} isExternal>
                Click to sign transaction with XUMM
              </Link>
            </Text>
          ) : (
            <></>
          )}

          {!showSpinner &&
          requestResolved &&
          requestResolvedMessage != "" &&
          requestFailed ? (
            <Alert status="error">
              <AlertIcon />
              {requestResolvedMessage}
            </Alert>
          ) : (
            <></>
          )}

          {!showSpinner &&
          requestResolved &&
          requestResolvedMessage != "" &&
          !requestFailed ? (
            <>
              <Alert status="success">
                <AlertIcon />
                {requestResolvedMessage}
              </Alert>
              <Button
                variant={"link"}
                onClick={() =>
                  window.open(xrplExplorerBaseUri + txnId, "_blank")
                }
                colorScheme={"blue"}
                size={"md"}
                style={{ fontSize: "1.2em" }}
                isExternal
              >
                View Transaction
              </Button>
            </>
          ) : (
            <></>
          )}

          <div
            style={{ width: "100%", marginTop: "10px", textAlign: "center" }}
          >
            {showSpinner ? (
              <>
                <Spinner size="md" margrinTop={"10px"} />{" "}
                <Text>...Waiting for Xumm prompt</Text>
              </>
            ) : (
              <></>
            )}
          </div>
        </Box>
      </Box>
    </Center>
  );
};

ClaimNFT.propTypes = {
  BridgeStatus: PropTypes.any.isRequired,
  XrpAddress: PropTypes.any.isRequired,
  TokenURI: PropTypes.any.isRequired,
};

export default ClaimNFT;
