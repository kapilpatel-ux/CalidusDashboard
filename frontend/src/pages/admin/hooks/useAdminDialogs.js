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

  const [addSubcategoryDialog, setAddSubcategoryDialog] = useState({
    open: false,
    category: null,
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    subcategories: "",
  });

  const [newSubcategory, setNewSubcategory] = useState("");

  const [editForm, setEditForm] = useState({});

  return {
    confirmDialog,
    setConfirmDialog,

    editDialog,
    setEditDialog,

    addCategoryDialog,
    setAddCategoryDialog,

    addSubcategoryDialog,
    setAddSubcategoryDialog,

    newCategory,
    setNewCategory,

    newSubcategory,
    setNewSubcategory,

    editForm,
    setEditForm,
  };
};