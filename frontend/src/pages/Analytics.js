import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  useToast,
  Spinner,
  Text,
  Select,
  HStack,
} from '@chakra-ui/react';
import axios from '../utils/axios';

const ChartCard = ({ title, children }) => (
  <Box
    p={5}
    shadow="md"
    borderWidth="1px"
    borderRadius="lg"
    bg="white"
    height="400px"
  >
    <Heading size="md" mb={4}>{title}</Heading>
    {children}
  </Box>
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [salesData, setSalesData] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const toast = useToast();

  const fetchAnalytics = async () => {
    try {
      const [salesResponse, eventResponse, activityResponse] = await Promise.all([
        axios.get('/analytics/sales-trend'),
        axios.get('/analytics/event-distribution'),
        axios.get('/analytics/user-activity'),
      ]);

      setSalesData(salesResponse.data.plot);
      setEventData(eventResponse.data.plot);
      setActivityData(activityResponse.data.plot);
    } catch (error) {
      toast({
        title: 'Error fetching analytics',
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
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading>Analytics</Heading>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          width="200px"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </Select>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <ChartCard title="Sales Trend">
          {salesData ? (
            <img
              src={`data:image/png;base64,${salesData}`}
              alt="Sales Trend"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <Text>No sales data available</Text>
          )}
        </ChartCard>

        <ChartCard title="Event Distribution">
          {eventData ? (
            <img
              src={`data:image/png;base64,${eventData}`}
              alt="Event Distribution"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <Text>No event data available</Text>
          )}
        </ChartCard>

        <ChartCard title="User Activity Heatmap">
          {activityData ? (
            <img
              src={`data:image/png;base64,${activityData}`}
              alt="User Activity"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <Text>No activity data available</Text>
          )}
        </ChartCard>
      </SimpleGrid>
    </Box>
  );
};

export default Analytics;