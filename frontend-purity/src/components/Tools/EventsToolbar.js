import { SimpleGrid, Box, Select, FormControl, FormLabel, Input, Button, HStack, Flex } from "@chakra-ui/react";
import RowsPerPage from "./RowsPerPage";
import PageNavigation from "./PageNavigation";
import { useState, useEffect } from "react";

const EVENT_TYPES = [
    { value: "", label: "All Events" },
    { value: "create", label: "create" },
    { value: "update", label: "update" },
    { value: "delete", label: "delete" }
];

const EventsToolbar = ({
    pageNumber,
    perPage,
    setPageNumber,
    setPerPage,
    hasMorePages,
    eventType,
    startDate,
    endDate,
    userId,
    onFilterChange,
    usersList
}) => {
    const [filterValues, setFilterValues] = useState({
        eventType: eventType || "",
        startDate: startDate || "",
        endDate: endDate || "",
        userId: userId || ""
    });

    useEffect(() => {
        setFilterValues({
            eventType: eventType || "",
            startDate: startDate || "",
            endDate: endDate || "",
            userId: userId || ""
        });
    }, [eventType, startDate, endDate, userId]);

    const handleFilterChange = (field, value) => {
        setFilterValues({
            ...filterValues,
            [field]: value
        });
    };

    const applyFilters = () => {
        onFilterChange(filterValues);
    };

    const clearFilters = () => {
        const emptyFilters = {
            eventType: "",
            startDate: "",
            endDate: "",
            userId: ""
        };
        setFilterValues(emptyFilters);
        onFilterChange(emptyFilters);
    };

    return (
        <Box w="100%" mb={4}>
            <Flex direction={{ base: "column", lg: "row" }} mb={4} gap={4}>
                <FormControl>
                    <FormLabel fontSize="sm">Event Type</FormLabel>
                    <Select
                        value={filterValues.eventType}
                        onChange={(e) => handleFilterChange("eventType", e.target.value)}
                        size="sm"
                    >
                        {EVENT_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </Select>
                </FormControl>
                
                <FormControl>
                    <FormLabel fontSize="sm">User</FormLabel>
                    <Select
                        value={filterValues.userId}
                        onChange={(e) => handleFilterChange("userId", e.target.value)}
                        size="sm"
                    >
                        <option value="">All Users</option>
                        {usersList && usersList.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name} ({user.id})
                            </option>
                        ))}
                    </Select>
                </FormControl>
                
                <FormControl>
                    <FormLabel fontSize="sm">Start Date</FormLabel>
                    <Input
                        type="date"
                        value={filterValues.startDate}
                        onChange={(e) => handleFilterChange("startDate", e.target.value)}
                        size="sm"
                    />
                </FormControl>
                
                <FormControl>
                    <FormLabel fontSize="sm">End Date</FormLabel>
                    <Input
                        type="date"
                        value={filterValues.endDate}
                        onChange={(e) => handleFilterChange("endDate", e.target.value)}
                        size="sm"
                    />
                </FormControl>
                
                <Flex alignItems="flex-end" gap={2}>
                    <Button size="sm" colorScheme="blue" onClick={applyFilters}>
                        Apply Filters
                    </Button>
                    <Button size="sm" variant="outline" onClick={clearFilters}>
                        Clear
                    </Button>
                </Flex>
            </Flex>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%" alignItems="center" justifyContent="space-between">
                <Box>
                    <RowsPerPage 
                        perPage={perPage}
                        setPerPage={setPerPage}
                    />
                </Box>
                <Box>
                    <PageNavigation 
                        pageNumber={pageNumber}
                        setPageNumber={setPageNumber}
                        hasMorePages={hasMorePages}
                    />
                </Box>
            </SimpleGrid>
        </Box>
    );
};

export default EventsToolbar;