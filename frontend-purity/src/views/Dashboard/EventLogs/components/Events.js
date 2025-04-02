import EventsTable from "components/Tables/EventsTable";
import EventsToolbar from "components/Tools/EventsToolbar";
import Card from "components/Card/Card";
import CardHeader from "components/Card/CardHeader";
import CardBody from "components/Card/CardBody";
import { Flex, Text, useColorModeValue } from "@chakra-ui/react";

const Events = ({
    pageNumber,
    perPage,
    setPageNumber,
    setPerPage,
    events,
    loading,
    totalCount,
    title
}) => {
    const captions = ["ID", "User Name", "User ID", "Product Title", "Product ID", "Event Type", "Timestamp"];
    const hasMorePages = totalCount > perPage;
    const textColor = useColorModeValue("gray.700", "white");

    return (
        <Card>
            <CardHeader>
                <Flex direction='column'>
                    <Text fontSize='lg' color={textColor} fontWeight='bold' pb='.5rem'>
                        {title}
                    </Text>
                    <EventsToolbar 
                        pageNumber={pageNumber}
                        perPage={perPage}
                        setPageNumber={setPageNumber}
                        setPerPage={setPerPage}
                        hasMorePages={hasMorePages}
                    />
                </Flex>
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