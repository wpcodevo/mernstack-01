import { NextFunction, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import { omit } from 'lodash';
import userModel, { User } from '../model/user.model';
import {
  DeleteUserInput,
  FindUserInput,
  UpdateMeInput,
  UpdateUserInput,
} from '../schema/user.schema';
import {
  adminFindUserById,
  findAndUpdateUser,
  findUserByIdAndDelete,
} from '../service/user.service';
import AppError from '../utils/appError';
import { excludedFields } from './auth.controller';
import APIFeatures from '../utils/apiFeatures';
import { s3UploadSingle } from '../utils/s3Service';

interface CustomRequest<T>
  extends Request<Record<string, never>, Record<string, never>, UpdateMeInput> {
  body: T;
}

type filterFields = {
  firstName: string;
  lastName: string;
  photo: string;
  email: string;
};

function filterObj(obj: CustomRequest<User>, ...allowedFields: string[]) {
  const newObj = {} as filterFields;
  Object.keys(obj).forEach((el: string) => {
    if (allowedFields.includes(el)) {
      // @ts-ignore
      newObj[el] = obj[el];
    }
  });

  return newObj;
}

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

export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = async (
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

    const result = await s3UploadSingle(file, 'users', 'jpeg');

    req.body.photo = result.Location;
    next();
  } catch (err: any) {
    next(err);
  }
};

export const getAllUsersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiFeatures = new APIFeatures(userModel.find({}), req.query)
      .filter()
      .sort()
      .limitField()
      .paginate();

    const users = await apiFeatures.query;

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const getMeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const updateMeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user POSTed password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password update, please use /updatePassword',
          403
        )
      );
    }

    const filter = filterObj(req.body, 'name', 'email', 'photo');
    const user = await findAndUpdateUser({ _id: res.locals.user._id }, filter, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(new AppError('User no logger exist', 404));
    }

    const newUser = omit(user.toJSON(), excludedFields);

    res.status(200).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const deleteMeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await findAndUpdateUser(
      { _id: res.locals.user._id },
      { active: false },
      {
        runValidators: true,
        new: true,
      }
    );

    if (!user) {
      return next(new AppError('User does not exist', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getUserHandler = async (
  req: Request<FindUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await adminFindUserById(req.params.userId);

    if (!user) {
      return next(new AppError('User does not exist', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const updateUserHandler = async (
  req: Request<
    UpdateUserInput['params'],
    Record<string, never>,
    UpdateUserInput['body']
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { password, ...otherBody } = req.body;
    const user = await findAndUpdateUser(
      { _id: req.params.userId },
      otherBody,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return next(new AppError('User does not exist', 404));
    }

    if (password) {
      user.password = password;
      await user.save();
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const deleteUserHandler = async (
  req: Request<DeleteUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await findUserByIdAndDelete(req.params.userId);

    if (!user) {
      return next(new AppError('User does not exist', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err: any) {
    next(err);
  }
};

export const parseFormData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.data) return next();
    const parsedBody = { ...JSON.parse(req.body.data) };
    if (req.body.photo) {
      parsedBody['photo'] = req.body.photo;
    }

    req.body = parsedBody;
    next();
  } catch (err: any) {
    next(err);
  }
};
