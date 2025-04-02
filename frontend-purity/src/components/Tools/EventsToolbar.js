import { SimpleGrid, Box } from "@chakra-ui/react";
import RowsPerPage from "./RowsPerPage";
import PageNavigation from "./PageNavigation";

const EventsToolbar = ({
    pageNumber,
    perPage,
    setPageNumber,
    setPerPage,
    hasMorePages
}) => {
    return (
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} w="100%" mb={4} alignItems="center" justifyContent="space-between">
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
    );
};

export default EventsToolbar;