import { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import AppError from '../utils/appError';
import log from '../utils/logger';

const handleCastError = (err: any) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 404);

const handleValidationError = (err: any) => {
  const message = Object.values(err.errors).map((el: any) => el.message);
  return new AppError(`${message.join('. ')}`, 400);
};

const handleUnexpectedFileError = () =>
  new AppError('Invalid file type or limit exceeded', 400);

const handleFileCountError = () =>
  new AppError('Image count limit exceeded', 400);

const handleFileSizeError = () => new AppError('File size is too large', 400);

const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    log.error(err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

export default (err: any, req: Request, res: Response, next: NextFunction) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastError(error);
    if (err.name === 'ValidationError') error = handleValidationError(error);
    if (err.code === 'LIMIT_UNEXPECTED_FILE')
      // @ts-ignore
      error = handleUnexpectedFileError();
    if (err.code === 'LIMIT_FILE_SIZE') error = handleFileSizeError();
    if (err.code === 'LIMIT_FILE_COUNT') error = handleFileCountError();
    sendErrorProd(error, res);
  }
};
