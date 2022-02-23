import {useDisclosure } from "@chakra-ui/react";
import ConnectButton from "./ConnectButton";
import AccountModal from "./AccountModal";
import { getDefaultProvider, Contract } from "ethers"

const ethersConfig = {
  ethers: { Contract },
  provider: getDefaultProvider("homestead")
}

export default function AccountSubComp() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
      <>
          <ConnectButton handleOpenModal={onOpen} />
          <AccountModal isOpen={isOpen} onClose={onClose} />
        </>
  );
}