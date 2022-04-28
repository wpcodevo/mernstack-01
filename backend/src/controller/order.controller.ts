import { NextFunction, Request, Response } from 'express';
import orderModel from '../model/order.model';
import {
  CreateOrderInput,
  DeleteOrderInput,
  GetOrderInput,
  UpdateOrderInput,
  UpdateOrderToDeliveredInput,
  UpdateOrderToPaidInput,
} from '../schema/order.schema';
import {
  createOrder,
  deleteOrder,
  findOrder,
  updateOrder,
  findOrderById,
  getMyOrders,
} from '../service/order.service';
import APIFeatures from '../utils/apiFeatures';
import AppError from '../utils/appError';

export const createOrderHandler = async (
  req: Request<Record<string, never>, Record<string, never>, CreateOrderInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      shippingAddress,
      totalAmount,
      orderItems,
      paymentMethod,
      shippingPrice,
      itemsTotalPrice,
      taxPrice,
      totalQuantity,
    } = req.body;

    if (orderItems.length === 0) {
      return next(new AppError('Order Items must not be empty', 400));
    }

    const newOrder = await createOrder({
      user: res.locals.user._id,
      shippingAddress,
      totalAmount,
      orderItems,
      paymentMethod,
      itemsTotalPrice,
      shippingPrice,
      taxPrice,
      totalQuantity,
    });

    res.status(201).json({
      status: 'success',
      data: {
        order: newOrder,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const getAllOrdersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiFeatures = new APIFeatures(orderModel.find(), req.query)
      .filter()
      .sort()
      .limitField()
      .paginate();

    const orders = await apiFeatures.query;

    res.status(200).json({
      status: 'success',
      result: orders.length,
      data: {
        orders,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const getOrderHandler = async (
  req: Request<GetOrderInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await findOrder({ _id: req.params.orderId });

    if (!order) {
      return next(new AppError('Document with that ID not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        order,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const updateOrderHandler = async (
  req: Request<
    UpdateOrderInput['params'],
    Record<string, never>,
    UpdateOrderInput['body']
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await updateOrder(
      { _id: req.params.orderId },
      {
        shippingAddress: req.body.shippingAddress,
        totalAmount: req.body.totalAmount,
        orderItems: req.body.orderItems,
        paymentMethod: req.body.paymentMethod,
        itemsTotalPrice: req.body.itemsTotalPrice,
        shippingPrice: req.body.shippingPrice,
        taxPrice: req.body.taxPrice,
        totalQuantity: req.body.totalQuantity,
      },
      {
        new: true,
      }
    );

    if (!order) {
      return next(new AppError('Document with that ID not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        order,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const updateOrderToPaidHandler = async (
  req: Request<
    UpdateOrderToPaidInput['params'],
    Record<string, never>,
    UpdateOrderToPaidInput['body']
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await findOrderById(req.params.orderId);

    if (!order) {
      return next(new AppError('Document with that ID not found', 404));
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    const updatedOrder = await order.save();

    res.status(200).json({
      status: 'success',
      data: {
        order: updatedOrder,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const updateOrderToDeliveredHandler = async (
  req: Request<UpdateOrderToDeliveredInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await findOrderById(req.params.orderId);

    if (!order) {
      return next(new AppError('Document with that ID not found', 404));
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();

    const updatedOrder = await order.save();

    res.status(200).json({
      status: 'success',
      data: {
        order: updatedOrder,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const deleteOrderHandler = async (
  req: Request<DeleteOrderInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await deleteOrder(req.params.orderId);

    if (!order) {
      return next(new AppError('Document with that ID not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getMyOrdersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await getMyOrders({ user: res.locals.user._id });

    res.status(200).json({
      status: 'success',
      data: {
        orders,
      },
    });
  } catch (err: any) {
    next(err);
  }
};
