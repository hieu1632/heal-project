import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit'; 
import type { CartItemDto } from '../../api/cartApi';

interface CartState {
  items: CartItemDto[];
  totalAmount: number;
  totalItems: number;
  isLoading: boolean;
}

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
  isLoading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<{ 
      items: CartItemDto[];
      totalAmount: number;
      totalItems: number;
    }>) => {
      state.items = action.payload.items;
      state.totalAmount = action.payload.totalAmount;
      state.totalItems = action.payload.totalItems;
    },
    addItem: (state, action: PayloadAction<CartItemDto>) => {
      const existing = state.items.find(
        item => item.productSizeId === action.payload.productSizeId
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
        existing.total = existing.price * existing.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.totalAmount = state.items.reduce((sum, item) => sum + item.total, 0);
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.totalAmount = state.items.reduce((sum, item) => sum + item.total, 0);
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    updateQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        item.total = item.price * item.quantity;
        state.totalAmount = state.items.reduce((sum, item) => sum + item.total, 0);
        state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.totalItems = 0;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { 
  setCart, 
  addItem, 
  removeItem, 
  updateQuantity, 
  clearCart, 
  setLoading 
} = cartSlice.actions;
export default cartSlice.reducer;