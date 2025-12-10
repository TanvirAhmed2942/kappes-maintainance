import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  variantId: null,
  stock: null,
  price: null,
};

const variantSlice = createSlice({
  name: "variant",
  initialState,
  reducers: {
    setVariantDetails: (state, action) => {
      state.variantId = action.payload?.variantId ?? null;
      state.stock = action.payload?.stock ?? null;
      state.price = action.payload?.price ?? null;
    },
    clearVariantDetails: (state) => {
      state.variantId = null;
      state.stock = null;
      state.price = null;
    },
  },
});

export const { setVariantDetails, clearVariantDetails } = variantSlice.actions;

export default variantSlice.reducer;
