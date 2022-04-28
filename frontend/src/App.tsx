import { Route, Routes } from 'react-router-dom';
import './App.css';
import PageLayout from './components/PageLayout';
import RequireUser from './components/RequireUser';
import AdminPage from './pages/admin.page';
import OrderListPage from './pages/Admin/order-list.page';
import ProductListPage from './pages/Admin/product-list.page';
import UserEditPage from './pages/Admin/user-edit.page';
import UserListPage from './pages/Admin/user-list.page';
import CartPage from './pages/cart.page';
import CheckoutPage from './pages/Checkout';
import OrderDetailsPage from './pages/Checkout/order-details.page';
import DashboardPage from './pages/dashboard.page';
import ForgotPasswordPage from './pages/forgotPassword';
import HomePage from './pages/home.page';
import LoginPage from './pages/login.page.';
import ProductDetailsPage from './pages/product-details';
import ProfileDetailsPage from './pages/Profile-Details';
import ResetPasswordPage from './pages/resetPassword';
import SignUpPage from './pages/signup.page';
import TestingPage from './pages/testing';
import UnauthorizePage from './pages/unauthorize.page';
import VerifyEmailPage from './pages/verifyEmail';
import ProductEditPage from './pages/Admin/product-edit.page';
import CreateProductPage from './pages/Admin/create-product.page';

function App() {
  return (
    <Routes>
      {/* Public Routes */}

      {/* Oauth */}
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<SignUpPage />} />
      <Route path='/forgotPassword' element={<ForgotPasswordPage />} />
      <Route path='/testing' element={<TestingPage />} />

      <Route
        path='/resetPassword/:resetToken'
        element={<ResetPasswordPage />}
      />
      <Route path='/verifyEmail' element={<VerifyEmailPage />}>
        <Route index element={<VerifyEmailPage />} />
        <Route path=':verificationCode' element={<VerifyEmailPage />} />
      </Route>

      <Route path='/' element={<PageLayout />}>
        <Route index element={<HomePage />} />

        {/* Private Route */}
        <Route element={<RequireUser allowedRoles={['admin']} />}>
          <Route path='/admin' element={<AdminPage />} />
        </Route>
        <Route element={<RequireUser allowedRoles={['admin', 'user']} />}>
          <Route path='/dashboard' element={<DashboardPage />} />
        </Route>

        <Route element={<RequireUser allowedRoles={['admin', 'user']} />}>
          <Route path='/profile' element={<ProfileDetailsPage />} />
        </Route>

        <Route element={<RequireUser allowedRoles={['user']} />}>
          <Route path='/checkout' element={<CheckoutPage />} />
        </Route>

        {/* Product Details */}
        <Route path='/products'>
          <Route path=':productId' element={<ProductDetailsPage />} />
        </Route>

        {/* Cart Page */}
        <Route path='/cart' element={<CartPage />}>
          <Route path=':id' element={<CartPage />} />
        </Route>
        <Route element={<RequireUser allowedRoles={['user', 'admin']} />}>
          <Route path='/orders/:orderId' element={<OrderDetailsPage />} />
        </Route>

        {/* Admin */}
        <Route path='/admin' element={<RequireUser allowedRoles={['admin']} />}>
          <Route path='users'>
            <Route index element={<UserListPage />} />
            <Route path=':userId/edit' element={<UserEditPage />} />
          </Route>
          <Route path='products'>
            <Route index element={<ProductListPage />} />
            <Route path='create' element={<CreateProductPage />} />
            <Route path=':productId/edit' element={<ProductEditPage />} />
          </Route>
          <Route path='orders' element={<OrderListPage />} />
        </Route>
      </Route>
      <Route path='/unauthorize' element={<UnauthorizePage />} />
    </Routes>
  );
}

export default App;
