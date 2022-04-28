import express from 'express';
import {
  createUserHandler,
  forgotPasswordHandler,
  loginHandler,
  logoutHandler,
  refreshAccessTokenHandler,
  resetPasswordHandler,
  restrictTo,
  updatePasswordHandler,
  verifyUserHandler,
} from '../controller/auth.controller';
import {
  deleteMeHandler,
  deleteUserHandler,
  getAllUsersHandler,
  getMeHandler,
  getUserHandler,
  parseFormData,
  resizeUserPhoto,
  updateMeHandler,
  updateUserHandler,
  uploadUserPhoto,
} from '../controller/user.controller';
import { deserializeUser } from '../middleware/deserializeUser';
import requireUser from '../middleware/requireUser';
import validate from '../middleware/validateResource';
import { loginSchema } from '../schema/session.schema';
import {
  createUserSchema,
  deleteUserSchema,
  findUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateMeSchema,
  updatePasswordSchema,
  updateUserSchema,
  verifyUserSchema,
} from '../schema/user.schema';

const router = express.Router();

router.post('/login', validate(loginSchema), loginHandler);
router.post('/signup', validate(createUserSchema), createUserHandler);
router.get('/refresh', refreshAccessTokenHandler);
router.get('/logout', deserializeUser, requireUser, logoutHandler);

router.get(
  '/verify/:verificationCode',
  validate(verifyUserSchema),
  verifyUserHandler
);

router.post(
  '/forgotPassword',
  validate(forgotPasswordSchema),
  forgotPasswordHandler
);

router.patch(
  '/resetPassword/:resetToken',
  validate(resetPasswordSchema),
  resetPasswordHandler
);

router.patch(
  '/updatePassword',
  deserializeUser,
  requireUser,
  validate(updatePasswordSchema),
  updatePasswordHandler
);

router.patch(
  '/updateMe',
  deserializeUser,
  requireUser,
  uploadUserPhoto,
  resizeUserPhoto,
  parseFormData,
  validate(updateMeSchema),
  updateMeHandler
);

router.get('/me', deserializeUser, requireUser, getMeHandler);
router.delete('/deleteMe', deserializeUser, requireUser, deleteMeHandler);

router.use(deserializeUser, requireUser, restrictTo('admin'));

router.get('/', getAllUsersHandler);
router
  .route('/:userId')
  .get(validate(findUserSchema), getUserHandler)
  .patch(
    uploadUserPhoto,
    resizeUserPhoto,
    parseFormData,
    validate(updateUserSchema),
    updateUserHandler
  )
  .delete(validate(deleteUserSchema), deleteUserHandler);

export default router;
