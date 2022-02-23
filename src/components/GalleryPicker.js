import React from "react";
import "../css/styles.css";
import PropTypes from "prop-types";
import { Box, Flex, Center, Text, Link } from "@chakra-ui/react";
import { openSeaBaseUri } from "../contracts/index";

const GalleryPicker = (props) => {
  const [images, setImages] = React.useState([]);
  const { nftArray, returnImage } = props;

  React.useEffect(() => {
    let imageList = [];
    let nftList = nftArray.map(function (image, i) {
      let imgSrc =
        image.metadata != null
          ? JSON.parse(image.metadata).image
          : "noimage.jpg";
      if (imgSrc == undefined) {
        imgSrc = "noImage.jpg";
      }
      return {
        src: imgSrc,
        name: image.name,
        token_id: image.token_id,
        token_address: image.token_address,
      };
    });

    nftList.forEach((el, i) => {
      imageList.push({
        id: i,
        src: el.src,
        selected: false,
        title: "",
        name: el.name,
        token_id: el.token_id,
        token_address: el.token_address,
      });
    });
    setImages(imageList);
  }, []);

  const onImageClick = (id) => {
    let imageList = [...images];

    for (const img of imageList) {
      img.selected = false;
    }

    for (const img of imageList) {
      if (img.id === id) {
        returnImage(img, nftArray[id]);
        img.selected = !img.selected;
      }
    }
  };

  const divStyle = {
    marginLeft: "30px",
    marginTop: "30px",
  };

  return (
    <>
      {images.map((img, i) => (
        <Flex align="center" style={divStyle}>
          <Center py={2}>
            <Box
              maxW={"320px"}
              w={"full"}
              bg="white"
              boxShadow={"2xl"}
              rounded={"lg"}
              p={6}
              textAlign={"center"}
            >
              {img.src.startsWith("ipfs://") ? (
                <>
                  <img
                    data-for={"images"}
                    src={
                      "https://ipfs.io/ipfs/" + img.src.replace("ipfs://", "")
                    }
                    key={img.id}
                    className={img.selected ? "selected" : "imgPicker"}
                    onClick={() => onImageClick(img.id)}
                  />
                  <Text fontWeight={600}>
                    {img.name} #{img.token_id}
                  </Text>
                  <Link
                    color="gray.800"
                    href={
                      openSeaBaseUri + img.token_address + "/" + img.token_id
                    }
                    isExternal
                  >
                    View on Opensea
                  </Link>
                </>
              ) : (
                <>
                  <img
                    data-for={"images"}
                    src={img.src}
                    key={img.id}
                    className={img.selected ? "selected" : "imgPicker"}
                    onClick={() => onImageClick(img.id)}
                  />
                  <Text fontWeight={600}>
                    {img.name} #{img.token_id}
                  </Text>
                  <Link
                    color="gray.800"
                    href={
                      openSeaBaseUri + img.token_address + "/" + img.token_id
                    }
                    isExternal
                  >
                    View on Opensea
                  </Link>
                </>
              )}
            </Box>
          </Center>
        </Flex>
      ))}
    </>
  );
};
GalleryPicker.propTypes = {
  nftArray: PropTypes.array.isRequired,
  returnImage: PropTypes.func.isRequired,
};

export default GalleryPicker;
