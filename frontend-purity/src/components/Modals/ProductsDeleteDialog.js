import React from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Text,
} from "@chakra-ui/react";

const ProductsDeleteDialog = ({ 
  isOpen, 
  onClose, 
  product, 
  isDeleting, 
  onConfirmDelete,
  cancelRef 
}) => {
  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Product
          </AlertDialogHeader>

          <AlertDialogBody>
            {product ? (
              <>
                Are you sure you want to delete <strong>{product.title}</strong>?
                <Text mt={2} color="red.600">
                  This action cannot be undone. This will permanently delete the product 
                  from both this system and Shopify.
                </Text>
              </>
            ) : (
              "Are you sure you want to delete this product?"
            )}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={onConfirmDelete} 
              ml={3}
              isLoading={isDeleting}
              loadingText="Deleting"
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default ProductsDeleteDialog; 