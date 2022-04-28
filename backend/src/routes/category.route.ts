import express from 'express';
import { restrictTo } from '../controller/auth.controller';
import {
  createCategoryHandler,
  deleteCategoryHandler,
  getAllCategoriesHandler,
  getCategoryHandler,
  parseCategoryFormData,
  resizeCategoryPhoto,
  updateCategoryHandler,
  uploadCategoryPhoto,
} from '../controller/category.controller';
import { deserializeUser } from '../middleware/deserializeUser';
import requireUser from '../middleware/requireUser';
import validate from '../middleware/validateResource';
import {
  createCategorySchema,
  deleteCategorySchema,
  getCategorySchema,
  updateCategorySchema,
} from '../schema/category.schema';
import productRouter from './product.route';

const router = express.Router();

router.use(deserializeUser, requireUser, restrictTo('admin'));

router.use('/:categoryId/products', productRouter);

router
  .route('/')
  .get(getAllCategoriesHandler)
  .post(
    uploadCategoryPhoto,
    resizeCategoryPhoto,
    parseCategoryFormData,
    validate(createCategorySchema),
    createCategoryHandler
  );

router
  .route('/:categoryId')
  .get(validate(getCategorySchema), getCategoryHandler)
  .patch(
    uploadCategoryPhoto,
    resizeCategoryPhoto,
    parseCategoryFormData,
    validate(updateCategorySchema),
    updateCategoryHandler
  )
  .delete(validate(deleteCategorySchema), deleteCategoryHandler);

export default router;
