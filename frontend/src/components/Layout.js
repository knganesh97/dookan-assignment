import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Icon,
  useColorModeValue,
  Drawer,
  DrawerContent,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Button,
} from '@chakra-ui/react';
import {
  FiHome,
  FiShoppingBag,
  FiShoppingCart,
  FiBarChart2,
  FiActivity,
  FiMenu,
  FiLogOut,
  FiUser,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const LinkItems = [
  { name: 'Dashboard', icon: FiHome, path: '/' },
  { name: 'Products', icon: FiShoppingBag, path: '/products' },
  { name: 'Orders', icon: FiShoppingCart, path: '/orders' },
  { name: 'Analytics', icon: FiBarChart2, path: '/analytics' },
  { name: 'Events', icon: FiActivity, path: '/events' },
];

const SidebarContent = ({ onClose, ...rest }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          Dookan
        </Text>
      </Flex>
      <VStack spacing={4} align="stretch">
        {LinkItems.map((link) => (
          <NavItem
            key={link.name}
            icon={link.icon}
            onClick={() => {
              navigate(link.path);
              onClose();
            }}
          >
            {link.name}
          </NavItem>
        ))}
      </VStack>
      <Box mt="auto" p={4}>
        <Menu>
          <MenuButton
            as={Button}
            rounded="full"
            variant="link"
            cursor="pointer"
            minW={0}
          >
            <Avatar size="sm" name={user?.name} />
          </MenuButton>
          <MenuList>
            <MenuItem icon={<FiUser />}>Profile</MenuItem>
            <MenuItem icon={<FiLogOut />} onClick={() => navigate('/login')}>
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </Box>
  );
};

const NavItem = ({ icon: Icon, children, ...rest }) => {
  return (
    <Box
      as="a"
      href="#"
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: 'cyan.400',
          color: 'white',
        }}
        {...rest}
      >
        {Icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: 'white',
            }}
          />
        )}
        {children}
      </Flex>
    </Box>
  );
};

const Layout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
      />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* Mobile nav */}
      <Box ml={{ base: 0, md: 60 }} p="4">
        <Flex
          alignItems="center"
          bg={useColorModeValue('white', 'gray.900')}
          borderBottom="1px"
          borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
          justifyContent={{ base: 'space-between', md: 'flex-end' }}
          py={4}
          px={4}
          position="sticky"
          top="0"
          zIndex="sticky"
        >
          <Icon
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
            as={FiMenu}
            w={6}
            h={6}
            cursor="pointer"
          />
        </Flex>
        <Box p={4}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 