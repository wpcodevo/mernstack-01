import express from 'express';
import { restrictTo } from '../controller/auth.controller';
import {
  addCategoryId,
  createProductHandler,
  deleteProductHandler,
  getAllProductsHandler,
  getProductHandler,
  getProductStats,
  parseProductFormData,
  resizeProductImages,
  updateProductHandler,
  uploadProductImages,
} from '../controller/product.controller';
import { deserializeUser } from '../middleware/deserializeUser';
import requireUser from '../middleware/requireUser';
import validate from '../middleware/validateResource';
import {
  createProductSchema,
  deleteProductSchema,
  getAllProductsSchema,
  getProductSchema,
  updateProductSchema,
} from '../schema/product.schema';
import reviewRouter from './review.route';

const router = express.Router({ mergeParams: true });

router.use('/:productId/reviews', reviewRouter);

router.get('/product-stats', getProductStats);

router
  .route('/')
  .post(
    deserializeUser,
    restrictTo('admin'),
    uploadProductImages,
    resizeProductImages,
    parseProductFormData,
    validate(createProductSchema),
    addCategoryId,
    createProductHandler
  )
  .get(validate(getAllProductsSchema), getAllProductsHandler);

// router.use(deserializeUser, requireUser);

router
  .route('/:productId')
  .get(validate(getProductSchema), getProductHandler)
  .patch(
    deserializeUser,
    requireUser,
    restrictTo('admin'),
    uploadProductImages,
    resizeProductImages,
    parseProductFormData,
    validate(updateProductSchema),
    updateProductHandler
  )
  .delete(
    deserializeUser,
    requireUser,
    restrictTo('admin'),
    validate(deleteProductSchema),
    deleteProductHandler
  );

export default router;
