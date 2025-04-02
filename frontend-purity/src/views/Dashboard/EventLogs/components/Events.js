import EventsTable from "components/Tables/EventsTable";
import EventsToolbar from "components/Tools/EventsToolbar";
import Card from "components/Card/Card";
import CardHeader from "components/Card/CardHeader";
import CardBody from "components/Card/CardBody";
import { Flex, Text } from "@chakra-ui/react";

const Events = ({
    pageNumber,
    perPage,
    setPageNumber,
    setPerPage,
    events,
    loading,
    totalCount
}) => {
    const captions = ["ID", "User Name", "User ID", "Product Title", "Product ID", "Event Type", "Timestamp"];
    const hasMorePages = totalCount > perPage;

    return (
        <Card>
            <CardHeader>
                <Flex justify='space-between' align='center'>
                    <Text fontSize='lg' fontWeight='bold'>Event Logs</Text>
                </Flex>
                <EventsToolbar 
                    pageNumber={pageNumber}
                    perPage={perPage}
                    setPageNumber={setPageNumber}
                    setPerPage={setPerPage}
                    hasMorePages={hasMorePages}
                />
            </CardHeader>
            <CardBody>
                <EventsTable 
                    captions={captions}
                    data={events}
                    loading={loading}
                />
            </CardBody>
        </Card>
    );
};

export default Events;