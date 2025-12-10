import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  buyNowProduct: null,
  isBuyNowMode: false,
};

const buyNowSlice = createSlice({
  name: "buyNow",
  initialState,
  reducers: {
    setBuyNowProduct: (state, action) => {
      state.buyNowProduct = action.payload;
      state.isBuyNowMode = true;
    },
    clearBuyNowProduct: (state) => {
      state.buyNowProduct = null;
      state.isBuyNowMode = false;
    },
  },
});

export const { setBuyNowProduct, clearBuyNowProduct } = buyNowSlice.actions;
export default buyNowSlice.reducer;
