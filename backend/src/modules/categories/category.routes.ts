import { Router } from "express";
import { deleteCategory, deleteSubcategory, listCategories } from "./category.controller.js";

export const categoryRoutes = Router();

categoryRoutes.get("/", listCategories);
categoryRoutes.delete("/:categoryId", deleteCategory);
categoryRoutes.delete("/:categoryId/subcategories/:subcategoryId", deleteSubcategory);
