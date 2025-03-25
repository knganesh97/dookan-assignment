import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Heading,
  Text,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiShoppingBag, FiShoppingCart, FiDollarSign, FiUsers } from 'react-icons/fi';
import axios from 'axios';

const StatCard = ({ title, value, icon: Icon, change, isIncrease }) => (
  <Box
    p={5}
    shadow="md"
    borderWidth="1px"
    borderRadius="lg"
    bg={useColorModeValue('white', 'gray.700')}
  >
    <Stat>
      <StatLabel fontSize="lg">{title}</StatLabel>
      <StatNumber fontSize="3xl">{value}</StatNumber>
      <StatHelpText>
        <StatArrow type={isIncrease ? 'increase' : 'decrease'} />
        {change}% from last month
      </StatHelpText>
    </Stat>
  </Box>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    productChange: 0,
    orderChange: 0,
    revenueChange: 0,
    customerChange: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/shopify/analytics');
        const data = response.data;
        
        // Calculate changes (mock data for now)
        setStats({
          totalProducts: data.products?.length || 0,
          totalOrders: data.orders?.length || 0,
          totalRevenue: data.orders?.reduce((sum, order) => 
            sum + parseFloat(order.totalPriceSet.shopMoney.amount), 0) || 0,
          totalCustomers: data.orders?.reduce((sum, order) => 
            sum + (order.customer ? 1 : 0), 0) || 0,
          productChange: 5,
          orderChange: 12,
          revenueChange: 8,
          customerChange: 15,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box>
      <Heading mb={8}>Dashboard</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={FiShoppingBag}
          change={stats.productChange}
          isIncrease={stats.productChange > 0}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={FiShoppingCart}
          change={stats.orderChange}
          isIncrease={stats.orderChange > 0}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={FiDollarSign}
          change={stats.revenueChange}
          isIncrease={stats.revenueChange > 0}
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={FiUsers}
          change={stats.customerChange}
          isIncrease={stats.customerChange > 0}
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
        <GridItem>
          <Box
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="lg"
            bg={useColorModeValue('white', 'gray.700')}
          >
            <Heading size="md" mb={4}>Recent Orders</Heading>
            <Text>No recent orders to display</Text>
          </Box>
        </GridItem>
        <GridItem>
          <Box
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="lg"
            bg={useColorModeValue('white', 'gray.700')}
          >
            <Heading size="md" mb={4}>Top Products</Heading>
            <Text>No products to display</Text>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Dashboard; 