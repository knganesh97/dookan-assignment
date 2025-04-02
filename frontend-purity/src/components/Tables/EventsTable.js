import React from "react";
import {
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  Flex,
  Td,
} from "@chakra-ui/react";

const EventsTable = ({ 
  captions = [], 
  data = [], 
  textColor, 
}) => {

  return (
    <Table variant='simple' color={textColor}>
      <Thead>
        <Tr my='.8rem' pl='0px'>
          {captions && Array.isArray(captions) && captions.map((caption, idx) => {
            return (
              <Th 
                color='gray.400' 
                key={idx} 
                ps={idx === 0 ? "0px" : null}
              >
                <Flex align="center">
                  {caption}
                </Flex>
              </Th>
            );
          })}
        </Tr>
      </Thead>
      <Tbody>
        {data && Array.isArray(data) && data.map((row, idx) => (
          <Tr key={row?.id || row?._id || idx}>
            <Td>
              <Text
                fontSize="sm"
                color={textColor}
                fontWeight="bold"
                minWidth="100%"
              >
                {row?.id || "N/A"}
              </Text>
            </Td>
            <Td>
              <Text fontSize="sm" color={textColor} fontWeight="bold">
                {row?.user_name || "N/A"}
              </Text>
            </Td>
            <Td>
              <Text fontSize="sm" color={textColor} fontWeight="bold">
                {row?.user_id || "N/A"}
              </Text>
            </Td>
            <Td>
              <Text fontSize="sm" color={textColor} fontWeight="bold">
                {row?.product_title || "N/A"}
              </Text>
            </Td>
            <Td>
              <Text fontSize="sm" color={textColor} fontWeight="bold">
                {row?.product_id || "N/A"}
              </Text>
            </Td>
            <Td>
              <Text fontSize="sm" color={textColor} fontWeight="bold">
                {row?.event_type || "N/A"}
              </Text>
            </Td>
            <Td>
              <Text fontSize="sm" color={textColor} fontWeight="bold">
                {row?.timestamp ? new Date(row.timestamp).toLocaleString() : "N/A"}
              </Text>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default EventsTable; 