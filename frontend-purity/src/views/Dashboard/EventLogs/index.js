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

    useEffect(() => {
        fetchEvents({
            page: pageNumber,
            per_page: perPage
        });
    }, [pageNumber, perPage]);

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
            />
        </Flex>
    );
}

export default EventLogs;