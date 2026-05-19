import { useState } from "react";

export const useAdminDialogs = () => {
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: "",
    item: null,
    message: "",
  });

  const [editDialog, setEditDialog] = useState({
    open: false,
    type: "",
    item: null,
  });

  const [addCategoryDialog, setAddCategoryDialog] = useState(false);
  const [addUserDialog, setAddUserDialog] = useState(false);

  const [newCategory, setNewCategory] = useState({
    name: "",
  });

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });

  const [addProductDialog, setAddProductDialog] = useState({
    open: false,
    category: null,
  });

  const [newProduct, setNewProduct] = useState({
    productIds: [],
    category: "",
  });

  const [editForm, setEditForm] = useState({});

  return {
    confirmDialog,
    setConfirmDialog,

    editDialog,
    setEditDialog,

    addCategoryDialog,
    setAddCategoryDialog,

    addUserDialog,
    setAddUserDialog,

    newCategory,
    setNewCategory,

    newUser,
    setNewUser,

    addProductDialog,
    setAddProductDialog,

    newProduct,
    setNewProduct,

    editForm,
    setEditForm,
  };
};
