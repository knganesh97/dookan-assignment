import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Badge,
  useToast,
  Spinner,
  Text,
  Select,
  HStack,
  Input,
} from '@chakra-ui/react';
import axios from '../utils/axios';

const OrderStatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Badge colorScheme={getStatusColor(status)}>
      {status}
    </Badge>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/shopify/orders');
      setOrders(response.data.orders.edges.map(edge => edge.node));
    } catch (error) {
      toast({
        title: 'Error fetching orders',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer?.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box>
      <Heading mb={6}>Orders</Heading>

      <HStack spacing={4} mb={6}>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          width="200px"
        >
          <option value="all">All Orders</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Input
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          width="300px"
        />
      </HStack>

      {filteredOrders.length === 0 ? (
        <Text>No orders found</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Order ID</Th>
                <Th>Customer</Th>
                <Th>Date</Th>
                <Th>Total</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredOrders.map((order) => (
                <Tr key={order.id}>
                  <Td>{order.name}</Td>
                  <Td>
                    {order.customer ? (
                      `${order.customer.firstName} ${order.customer.lastName}`
                    ) : (
                      'Guest'
                    )}
                  </Td>
                  <Td>{new Date(order.createdAt).toLocaleDateString()}</Td>
                  <Td>${order.totalPriceSet.shopMoney.amount}</Td>
                  <Td>
                    <OrderStatusBadge status={order.status} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default Orders; 