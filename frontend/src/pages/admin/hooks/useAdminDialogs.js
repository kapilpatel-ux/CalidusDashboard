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
  const [addRoleDialog, setAddRoleDialog] = useState(false);
  const [addPermissionDialog, setAddPermissionDialog] = useState(false);

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

  const [newRole, setNewRole] = useState({
    label: "",
  });

  const [newPermission, setNewPermission] = useState({
    label: "",
    group: "",
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

    addRoleDialog,
    setAddRoleDialog,

    addPermissionDialog,
    setAddPermissionDialog,

    newCategory,
    setNewCategory,

    newUser,
    setNewUser,

    newRole,
    setNewRole,

    newPermission,
    setNewPermission,

    addProductDialog,
    setAddProductDialog,

    newProduct,
    setNewProduct,

    editForm,
    setEditForm,
  };
};
