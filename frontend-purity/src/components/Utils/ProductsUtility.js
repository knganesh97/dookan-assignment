import React from "react";
import { Box } from "@chakra-ui/react";

// Function to highlight search matches in text
export const highlightSearchMatch = (text, query) => {
  if (!query || !text) return text;
  
  try {
    const stringText = String(text);
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = stringText.split(regex);
    
    if (!parts || parts.length <= 1) return text;
    
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <Box key={i} as="span" bg="yellow.200" fontWeight="bold" px="1" py="0" rounded="sm">
              {part}
            </Box>
          ) : (
            part
          )
        )}
      </>
    );
  } catch (error) {
    console.error("Error in highlightSearchMatch:", error);
    return text;
  }
}; 