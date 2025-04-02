import Events from "./components/Events";
import eventService from "services/events.service";
import { useState, useEffect } from "react";
import { Flex } from "@chakra-ui/react";

function EventLogs() {
    const [pageNumber, setPageNumber] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [eventType, setEventType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [userId, setUserId] = useState('');
    const [usersList, setUsersList] = useState([]);
    const fetchEvents = async (params = {}) => {
        try {
            setLoading(true);
            const response = await eventService.getUserEvents({
                ...params,
            });
            
            if (response?.events && Array.isArray(response.events)) {
                setEvents(response.events);
                setTotalCount(response.total);
            } else {
                console.warn("Received invalid events data:", response);
                setEvents([]);
                setTotalCount(0);
            }
        } catch (err) {
            console.error("Error fetching events:", err);
            setError(err.message || "Failed to fetch events");
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsersList = async () => {
        try {
            const response = await eventService.getUsersList();
            setUsersList(response);
        } catch (err) {
            console.error("Error fetching users list:", err);
            setUsersList([]);
            setError(err.message || "Failed to fetch users list");
        }
    };

    useEffect(() => {
        fetchUsersList();
    }, []);

    useEffect(() => {
        fetchEvents({
            page: pageNumber,
            per_page: perPage,
            event_type: eventType || undefined,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            user_id: userId || undefined
        });
    }, [pageNumber, perPage, eventType, startDate, endDate, userId]);

    const handleFilterChange = (filters) => {
        // Reset to first page when applying new filters
        setPageNumber(1);
        setEventType(filters.eventType || '');
        setStartDate(filters.startDate || '');
        setEndDate(filters.endDate || '');
        setUserId(filters.userId || '');
    };

    return (
        <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
            <Events
                title="Event Logs"
                events={events}
                loading={loading}
                error={error}
                pageNumber={pageNumber}
                perPage={perPage}
                setPageNumber={setPageNumber}
                setPerPage={setPerPage}
                totalCount={totalCount}
                eventType={eventType}
                startDate={startDate}
                endDate={endDate}
                userId={userId}
                onFilterChange={handleFilterChange}
                usersList={usersList}
            />
        </Flex>
    );
}

export default EventLogs;