import React, { useState } from "react";
// Chakra imports
import {
  Box,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Switch,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
// Assets
import signInImage from "assets/img/signInImage.png";
import authService from "services/auth.service";

function SignIn() {
  // Chakra color mode
  const titleColor = useColorModeValue("teal.300", "teal.200");
  const textColor = useColorModeValue("gray.400", "white");
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Login using cookies - JWT will be stored as HttpOnly cookies by the server
      const response = await authService.login({ email, password });
      
      // If login is successful, redirect to dashboard
      if (response.user) {
        window.location.href = '/#/admin/dashboard';
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <Flex position='relative' mb='40px'>
      <Flex
        h={{ sm: "initial", md: "75vh", lg: "85vh" }}
        w='100%'
        maxW='1044px'
        mx='auto'
        justifyContent='space-between'
        mb='30px'
        pt={{ sm: "100px", md: "0px" }}>
        <Flex
          alignItems='center'
          justifyContent='start'
          style={{ userSelect: "none" }}
          w={{ base: "100%", md: "50%", lg: "42%" }}>
          <Flex
            direction='column'
            w='100%'
            background='transparent'
            p='48px'
            mt={{ md: "150px", lg: "80px" }}>
            <Heading color={titleColor} fontSize='32px' mb='10px'>
              Welcome Back
            </Heading>
            <Text
              mb='36px'
              ms='4px'
              color={textColor}
              fontWeight='bold'
              fontSize='14px'>
              Enter your email and password to sign in
            </Text>
            <form onSubmit={handleSubmit}>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Email
                </FormLabel>
                <Input
                  borderRadius='15px'
                  mb='24px'
                  fontSize='sm'
                  type='email'
                  placeholder='Your email address'
                  size='lg'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Password
                </FormLabel>
                <Input
                  borderRadius='15px'
                  mb='36px'
                  fontSize='sm'
                  type='password'
                  placeholder='Your password'
                  size='lg'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <FormControl display='flex' alignItems='center'>
                  <Switch id='remember-login' colorScheme='teal' me='10px' />
                  <FormLabel
                    htmlFor='remember-login'
                    mb='0'
                    ms='1'
                    fontWeight='normal'>
                    Remember me
                  </FormLabel>
                </FormControl>
                {error && (
                  <Text color="red.500" mb="20px" fontSize="sm">
                    {error}
                  </Text>
                )}
                <Button
                  fontSize='10px'
                  type='submit'
                  bg='teal.300'
                  w='100%'
                  h='45'
                  mb='20px'
                  color='white'
                  mt='20px'
                  _hover={{
                    bg: "teal.200",
                  }}
                  _active={{
                    bg: "teal.400",
                  }}>
                  SIGN IN
                </Button>
              </FormControl>
            </form>
            <Flex
              flexDirection='column'
              justifyContent='center'
              alignItems='center'
              maxW='100%'
              mt='0px'>
              <Text color={textColor} fontWeight='medium'>
                Don't have an account?
                <Link
                  color={titleColor}
                  as='span'
                  ms='5px'
                  fontWeight='bold'
                  onClick={() => window.location.href = '/#/auth/signup'}>
                  Sign Up
                </Link>
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Box
          display={{ base: "none", md: "block" }}
          overflowX='hidden'
          h='100%'
          w='40vw'
          position='absolute'
          right='0px'>
          <Box
            bgImage={signInImage}
            w='100%'
            h='100%'
            bgSize='cover'
            bgPosition='50%'
            position='absolute'
            borderBottomLeftRadius='20px'></Box>
        </Box>
      </Flex>
    </Flex>
  );
}

export default SignIn;
