// Chakra imports
import { Flex, Grid, useColorModeValue, useToast } from "@chakra-ui/react";
import avatar4 from "assets/img/avatars/avatar4.png";
import ProfileBgImage from "assets/img/ProfileBackground.png";
import React, { useEffect, useState } from "react";
import { FaCube, FaPenFancy } from "react-icons/fa";
import { IoDocumentsSharp } from "react-icons/io5";
import Conversations from "./components/Conversations";
import Header from "./components/Header";
import PlatformSettings from "./components/PlatformSettings";
import ProfileInformation from "./components/ProfileInformation";
import Projects from "./components/Projects";
import instance from "utils/axios";

function Profile() {
  // Chakra color mode
  const textColor = useColorModeValue("gray.700", "white");
  const bgProfile = useColorModeValue(
    "hsla(0,0%,100%,.8)",
    "linear-gradient(112.83deg, rgba(255, 255, 255, 0.21) 0%, rgba(255, 255, 255, 0) 110.84%)"
  );

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    mobile: "",
    location: "",
    description: "Hi, I'm a user of this platform. Welcome to my profile!"
  });

  const toast = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await instance.get('/auth/me');
        const user = response.data;
        setUserData({
          ...userData,
          name: user.name,
          email: user.email,
          mobile: user.mobile || "Not provided",
          location: user.location || "Not provided"
        });
      } catch (error) {
        toast({
          title: "Error fetching profile",
          description: error.response?.data?.message || "Failed to load profile data",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchUserData();
  }, []);

  return (
    <Flex direction='column'>
      <Header
        backgroundHeader={ProfileBgImage}
        backgroundProfile={bgProfile}
        avatarImage={avatar4}
        name={userData.name}
        email={userData.email}
        tabs={[
          {
            name: "OVERVIEW",
            icon: <FaCube w='100%' h='100%' />,
          },
          {
            name: "TEAMS",
            icon: <IoDocumentsSharp w='100%' h='100%' />,
          },
          {
            name: "PROJECTS",
            icon: <FaPenFancy w='100%' h='100%' />,
          },
        ]}
      />
      <Grid templateColumns={{ sm: "1fr", xl: "repeat(3, 1fr)" }} gap='22px'>
        <PlatformSettings
          title={"Platform Settings"}
          subtitle1={"ACCOUNT"}
          subtitle2={"APPLICATION"}
        />
        <ProfileInformation
          title={"Profile Information"}
          description={userData.description}
          name={userData.name}
          mobile={userData.mobile}
          email={userData.email}
          location={userData.location}
        />
        <Conversations title={"Conversations"} />
      </Grid>
      <Projects title={"Projects"} description={"Architects design houses"} />
    </Flex>
  );
}

export default Profile;
