import { Router } from "express";
import { validateBody } from "../../../middleware/validate.js";
import {
  createCategory,
  deleteCategory,
  deleteSubcategory,
  listCategories,
  updateCategory,
  updateSubcategory,
} from "./category.controller.js";
import {
  createCategorySchema,
  updateCategorySchema,
  updateSubcategorySchema,
} from "./category.validation.js";

export const categoryRoutes = Router();

categoryRoutes.get("/", listCategories);
categoryRoutes.post("/", validateBody(createCategorySchema), createCategory);

categoryRoutes.put("/:categoryId", validateBody(updateCategorySchema), updateCategory);

categoryRoutes.put(
"/:categoryId/subcategories/:subcategoryId",
  validateBody(updateSubcategorySchema),
  updateSubcategory
);

categoryRoutes.delete("/:categoryId", deleteCategory);
categoryRoutes.delete("/:categoryId/subcategories/:subcategoryId", deleteSubcategory);