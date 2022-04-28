import express from 'express';
import { restrictTo } from '../controller/auth.controller';
import {
  createOrderHandler,
  deleteOrderHandler,
  getAllOrdersHandler,
  getMyOrdersHandler,
  getOrderHandler,
  updateOrderHandler,
  updateOrderToDeliveredHandler,
  updateOrderToPaidHandler,
} from '../controller/order.controller';
import { deserializeUser } from '../middleware/deserializeUser';
import requireUser from '../middleware/requireUser';
import validate from '../middleware/validateResource';
import {
  createOrderSchema,
  deleteOrderSchema,
  getOrderSchema,
  updateOrderSchema,
  updateOrderToDeliveredSchema,
  updateOrderToPaidSchema,
} from '../schema/order.schema';

const router = express.Router();

router.use(deserializeUser, requireUser);
router
  .route('/')
  .get(getAllOrdersHandler)
  .post(restrictTo('user'), validate(createOrderSchema), createOrderHandler);

router.get('/myOrders', getMyOrdersHandler);

router
  .route('/:orderId')
  .get(restrictTo('user', 'admin'), validate(getOrderSchema), getOrderHandler)
  .patch(
    restrictTo('user', 'admin'),
    validate(updateOrderSchema),
    updateOrderHandler
  )
  .delete(
    restrictTo('user', 'admin'),
    validate(deleteOrderSchema),
    deleteOrderHandler
  );

router.patch(
  '/:orderId/pay',
  validate(updateOrderToPaidSchema),
  updateOrderToPaidHandler
);

router.patch(
  '/:orderId/deliver',
  validate(updateOrderToDeliveredSchema),
  updateOrderToDeliveredHandler
);

export default router;
