import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  storeName: "",
  storeLogo: "",
  isAdvertised: false,
  advertisedAt: null,
  advertisedExpiresAt: null,
  advertisementBanner: [],
};

const sellerStoreSlice = createSlice({
  name: "storeInfo",
  initialState,
  reducers: {
    setStoreInfo: (state, action) => {
      state.storeName = action.payload.storeName;
      state.storeLogo = action.payload.storeLogo;
      state.isAdvertised = action.payload.isAdvertised || false;
      state.advertisedAt = action.payload.advertisedAt || null;
      state.advertisedExpiresAt = action.payload.advertisedExpiresAt || null;
      state.advertisementBanner = action.payload.advertisementBanner || [];
    },
  },
});

//selector
export const getStoreInfo = (state) => {
  return state.sellerStore;
};

export const { setStoreInfo } = sellerStoreSlice.actions;

export default sellerStoreSlice.reducer;
