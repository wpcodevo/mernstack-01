import { NextFunction, Request, Response } from 'express';
import { FilterQuery } from 'mongoose';
import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import categoryModel, { Category } from '../model/category.model';
import {
  CreateCategoryInput,
  DeleteCategoryInput,
  GetCategoryInput,
  UpdateCategoryInput,
} from '../schema/category.schema';
import {
  createCategory,
  deleteCategory,
  getCategory,
  updateCategory,
} from '../service/category.service';
import APIFeatures from '../utils/apiFeatures';
import AppError from '../utils/appError';
import { s3UploadSingle } from '../utils/s3Service';

const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (!file.mimetype.startsWith('image')) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'));
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5000000, files: 1 },
});

export const uploadCategoryPhoto = upload.single('image');

export const resizeCategoryPhoto = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) return next();

    const file = await sharp(req.file.buffer)
      .resize(500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    const result = await s3UploadSingle(file, 'category', 'jpeg');
    req.body.image = result.Location;

    next();
  } catch (err: any) {
    console.log(err);
    next(err);
  }
};

export const createCategoryHandler = async (
  req: Request<
    Record<string, never>,
    Record<string, never>,
    CreateCategoryInput
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await createCategory(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        category,
      },
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({
        status: 'fail',
        message: 'Category already exist',
      });
    }
    next(err);
  }
};

export const getAllCategoriesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filter = {} as FilterQuery<Category>;
    if (req.params.categoryId) filter.category = req.params.categoryId;
    const apiFeatures = new APIFeatures(categoryModel.find(filter), req.query)
      .filter()
      .sort()
      .limitField()
      .paginate();

    const categories = await apiFeatures.query;

    res.status(200).json({
      status: 'success',
      result: categories.length,
      data: {
        categories,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const updateCategoryHandler = async (
  req: Request<
    UpdateCategoryInput['params'],
    Record<string, never>,
    UpdateCategoryInput['body']
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await updateCategory(
      { _id: req.params.categoryId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return next(new AppError('No document with that ID exist', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        category,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const getCategoryHandler = async (
  req: Request<GetCategoryInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await getCategory({ _id: req.params.categoryId });

    if (!category) {
      return next(new AppError('No document with that ID exist', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        category,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const deleteCategoryHandler = async (
  req: Request<DeleteCategoryInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await deleteCategory({ _id: req.params.categoryId });

    if (!category) {
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

export const parseCategoryFormData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.data) return next();
    const parsedBody = { ...JSON.parse(req.body.data) };
    if (req.body.image) {
      parsedBody['image'] = req.body.image;
    }

    req.body = parsedBody;
    next();
  } catch (err: any) {
    next(err);
  }
};
