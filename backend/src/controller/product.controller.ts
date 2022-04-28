import { Request, Express, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import productModel from '../model/product.model';
import {
  CreateProductInput,
  DeleteProductInput,
  GetProductInput,
  UpdateProductInput,
} from '../schema/product.schema';
import {
  createProduct,
  deleteProduct,
  getProduct,
  updateProduct,
} from '../service/product.service';
import AppError from '../utils/appError';
import APIFeatures from '../utils/apiFeatures';
import { s3UploadMultiple, s3UploadSingle } from '../utils/s3Service';

const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (!file.mimetype.startsWith('image')) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'));
  }
  cb(null, true);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5000000 },
});

export const uploadProductImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

export const resizeProductImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files) return next();

    // resize imageCover
    // @ts-ignore
    if (req.files?.imageCover) {
      // @ts-ignore
      const file = await sharp(req.files?.imageCover[0]?.buffer)
        .resize(600)
        // .toFormat('png')
        // .jpeg({ quality: 90 })
        .toBuffer();

      const result = await s3UploadSingle(file, 'imageCover', 'png');
      req.body.imageCover = result.Location;
    }

    // resize images
    // @ts-ignore
    if (req.files.images) {
      const files = await Promise.all(
        // @ts-ignore
        req?.files?.images.map((file) => {
          return (
            sharp(file.buffer)
              .resize(600)
              // .toFormat('png')
              // .jpeg({ quality: 90 })
              .toBuffer()
          );
        })
      );

      const results = await s3UploadMultiple(files, 'products', 'png');
      req.body.images = results.map((el) => el.Location);
    }

    next();
  } catch (err: any) {
    next(err);
  }
};

export const createProductHandler = async (
  req: Request<
    Record<string, never>,
    Record<string, never>,
    CreateProductInput
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await createProduct(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({
        status: 'fail',
        message: 'Product with that name already exist',
      });
    }
    console.log(err);
    next(err);
  }
};

export const addCategoryId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.category) req.body.category = req.params.categoryId;

  next();
};

export const getAllProductsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiFeatures = new APIFeatures(productModel.find(), req.query)
      .filter()
      .sort()
      .limitField()
      .paginate();

    const products = await apiFeatures.query;

    res.status(200).json({
      status: 'success',
      result: products.length,
      data: {
        products,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const getProductHandler = async (
  req: Request<GetProductInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await getProduct({ _id: req.params.productId });

    if (!product) {
      return next(new AppError('No document with that ID exist', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const updateProductHandler = async (
  req: Request<
    UpdateProductInput['params'],
    Record<string, never>,
    UpdateProductInput['body']
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await updateProduct(
      { _id: req.params.productId },
      req.body,
      {
        new: true,
        runValidators: true,
        lean: true,
      }
    );

    if (!product) {
      return next(new AppError('No document with that ID exist', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const deleteProductHandler = async (
  req: Request<DeleteProductInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await deleteProduct({ _id: req.params.productId });

    if (!product) {
      return next(new AppError('No document with that ID exist', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getProductStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productStats = await productModel.aggregate([
      {
        $match: { ratingsAverage: { $lt: 5 } },
      },
      {
        $group: {
          _id: '$categories',
          numProduct: { $sum: 1 },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        productStats,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const parseProductFormData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.data) return next();
    const parsedBody = { ...JSON.parse(req.body.data) };
    if (req.body.imageCover) {
      parsedBody['imageCover'] = req.body.imageCover;
    }

    if (req.body.images) {
      parsedBody['images'] = req.body.images;
    }

    req.body = parsedBody;
    next();
  } catch (err: any) {
    next(err);
  }
};
