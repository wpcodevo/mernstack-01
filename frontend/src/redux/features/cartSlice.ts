import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { IPaymentMethod } from '../../pages/Checkout/payment.page';
import { IShippingAddress } from '../../pages/Checkout/shipping-address.page';
import { IProduct } from '../api/products/types';

const defaultShippingAddress: IShippingAddress = {
  address: '',
  address2: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
};

const defaultPaymentMethod: IPaymentMethod = {
  paymentMethod: '',
};

type ICart = {
  cartItems: IProduct[];
  numOfItemsInCart: number;
  totalAmount: number;
  totalItemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  showCartDrawer: boolean;
  shippingAddress: IShippingAddress;
  paymentMethod: IPaymentMethod;
};

const addItemToCart = (cartItems: IProduct[], product: IProduct) => {
  const existingItem = cartItems.find((item) => item._id === product._id);
  if (existingItem) {
    toast.success(`Increased ${existingItem.name} quantity`, {
      position: 'bottom-left',
    });
    return cartItems.map((item) =>
      item._id === product._id
        ? { ...item, quantity: item.quantity! + 1 }
        : item
    );
  }

  toast.success(`${product.name} added to cart`, {
    position: 'bottom-left',
  });
  return [...cartItems, { ...product, quantity: 1 }];
};

const addItemByQty = (cartItems: IProduct[], product: IProduct, qty = 1) => {
  const existingItem = cartItems.find((item) => item._id === product._id);
  if (existingItem) {
    return cartItems.map((item) =>
      item._id === product._id ? { ...item, quantity: qty } : item
    );
  }

  return [...cartItems, { ...product, quantity: qty }];
};

const removeItemFromCart = (cartItems: IProduct[], product: IProduct) => {
  const existingItem = cartItems.find((item) => item._id === product._id);

  if (existingItem?.quantity === 1) {
    toast.success(`${existingItem.name} removed from cart`, {
      position: 'bottom-left',
    });
    return cartItems.filter((item) => item._id !== product._id);
  }

  toast.success(`Decreased ${product.name} quantity`, {
    position: 'bottom-left',
  });
  return cartItems.map((item) =>
    item._id === product._id ? { ...item, quantity: item.quantity! - 1 } : item
  );
};

const clearCartItem = (cartItems: IProduct[], cartItem: IProduct) => {
  toast.success(`${cartItem.name} removed from cart`, {
    position: 'bottom-left',
  });
  return cartItems.filter((item) => item._id !== cartItem._id);
};

const initialState: ICart = {
  cartItems: [],
  numOfItemsInCart: 0,
  totalAmount: 0,
  totalItemsPrice: 0,
  shippingPrice: 0,
  taxPrice: 0,
  showCartDrawer: false,
  shippingAddress: defaultShippingAddress,
  paymentMethod: defaultPaymentMethod,
};

export const cartSlice = createSlice({
  name: 'cartSlice',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<IProduct>) => {
      state.cartItems = addItemToCart(state.cartItems, action.payload);
    },
    addItemQtyToCart: (
      state,
      action: PayloadAction<{ product: IProduct; qty?: number }>
    ) => {
      const { product, qty } = action.payload;
      state.cartItems = addItemByQty(state.cartItems, product, qty!);
    },
    removeFromCart: (state, action: PayloadAction<IProduct>) => {
      state.cartItems = removeItemFromCart(state.cartItems, action.payload);
    },
    getTotals: (state) => {
      const { totalItemsAmount, totalNumOfItems } = state.cartItems.reduce(
        (cartTotal, cartItem) => {
          const { price, quantity } = cartItem;
          const itemsTotal = price * quantity!;

          cartTotal.totalItemsAmount += itemsTotal;
          cartTotal.totalNumOfItems += quantity!;
          return cartTotal;
        },
        {
          totalNumOfItems: 0,
          totalItemsAmount: 0,
        }
      );

      const shippingPrice =
        totalItemsAmount > 100 ? totalItemsAmount * 0.02 : 0;
      const taxPrice = totalItemsAmount * 0.05;
      state.numOfItemsInCart = totalNumOfItems;
      state.totalItemsPrice = totalItemsAmount;
      state.shippingPrice = shippingPrice;
      state.taxPrice = taxPrice;
      state.totalAmount = totalItemsAmount + shippingPrice + taxPrice;
    },
    toggleCartDrawer: (state) => {
      state.showCartDrawer = !state.showCartDrawer;
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.numOfItemsInCart = 0;
      state.shippingPrice = 0;
      state.totalAmount = 0;
      state.totalItemsPrice = 0;
      state.taxPrice = 0;
    },
    clearItemFromCart: (state, action: PayloadAction<IProduct>) => {
      state.cartItems = clearCartItem(state.cartItems, action.payload);
    },
    addShippingAddress: (state, action: PayloadAction<IShippingAddress>) => {
      state.shippingAddress = action.payload;
    },
    addPaymentMethod: (state, action: PayloadAction<IPaymentMethod>) => {
      state.paymentMethod = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  getTotals,
  toggleCartDrawer,
  clearCart,
  clearItemFromCart,
  addItemQtyToCart,
  addShippingAddress,
  addPaymentMethod,
} = cartSlice.actions;

export default persistReducer(
  {
    key: 'rtk:cart',
    storage,
  },
  cartSlice.reducer
);
