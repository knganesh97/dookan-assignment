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
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import axios from 'axios';

const EventTypeBadge = ({ type }) => {
  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'info':
        return 'blue';
      case 'warning':
        return 'yellow';
      case 'error':
        return 'red';
      case 'success':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Badge colorScheme={getTypeColor(type)}>
      {type}
    </Badge>
  );
};

const EventModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    event_type: 'info',
    description: '',
    metadata: {},
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Event</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Event Type</FormLabel>
                <Select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="success">Success</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event description"
                  rows={4}
                />
              </FormControl>
              <Button type="submit" colorScheme="blue" width="full">
                Create Event
              </Button>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events');
      setEvents(response.data.events);
    } catch (error) {
      toast({
        title: 'Error fetching events',
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
    fetchEvents();
  }, []);

  const handleCreateEvent = async (formData) => {
    try {
      await axios.post('/api/events', formData);
      toast({
        title: 'Event created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      fetchEvents();
    } catch (error) {
      toast({
        title: 'Error creating event',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`/api/events/${eventId}`);
        toast({
          title: 'Event deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchEvents();
      } catch (error) {
        toast({
          title: 'Error deleting event',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.event_type.toLowerCase() === filter.toLowerCase();
    const matchesSearch = event.description.toLowerCase().includes(searchQuery.toLowerCase());
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading>Events</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onOpen}>
          Create Event
        </Button>
      </Box>

      <HStack spacing={4} mb={6}>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          width="200px"
        >
          <option value="all">All Events</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="success">Success</option>
        </Select>
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          width="300px"
        />
      </HStack>

      {filteredEvents.length === 0 ? (
        <Text>No events found</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Type</Th>
                <Th>Description</Th>
                <Th>Created At</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredEvents.map((event) => (
                <Tr key={event._id}>
                  <Td>
                    <EventTypeBadge type={event.event_type} />
                  </Td>
                  <Td>{event.description}</Td>
                  <Td>{new Date(event.created_at).toLocaleString()}</Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDeleteEvent(event._id)}
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <EventModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleCreateEvent}
      />
    </Box>
  );
};

export default Events; 