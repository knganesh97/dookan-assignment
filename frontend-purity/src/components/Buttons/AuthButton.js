import React from "react";
import { Button, Text } from "@chakra-ui/react";
import PropTypes from "prop-types";
import { ProfileIcon } from "components/Icons/Icons";
import { NavLink } from "react-router-dom";

export default function AuthButton({ text, onClick, to }) {
  const navbarIcon = "gray.500"; // Using default color, can be made into prop if needed

  const buttonProps = {
    ms: "0px",
    px: "0px",
    me: { sm: "2px", md: "16px" },
    color: navbarIcon,
    variant: "transparent-with-icon",
    rightIcon: document.documentElement.dir ? "" : (
      <ProfileIcon color={navbarIcon} w="22px" h="22px" me="0px" />
    ),
    leftIcon: document.documentElement.dir ? (
      <ProfileIcon color={navbarIcon} w="22px" h="22px" me="0px" />
    ) : "",
  };

  if (onClick) {
    return (
      <Button {...buttonProps} onClick={onClick}>
        <Text display={{ sm: "none", md: "flex" }}>{text}</Text>
      </Button>
    );
  }

  return (
    <NavLink to={to}>
      <Button {...buttonProps}>
        <Text display={{ sm: "none", md: "flex" }}>{text}</Text>
      </Button>
    </NavLink>
  );
}

AuthButton.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  to: PropTypes.string,
}; 