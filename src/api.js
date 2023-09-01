import { configureStore } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const hyborgApi = createApi({
  reducerPath: "hyborgApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      // `${process.env.NEXT_PUBLIC_API_URL}`,
      `https://nest-api.hyborg.world`,
  }),
  tagTypes: ["qrimage"],
  endpoints: (builder) => ({
    upload: builder.mutation({
      query: (body) => ({
        url: `/upload/generate-signed-url`,
        method: "POST",
        body,
      }),
    }),
    qr: builder.mutation({
      query: (body) => ({
        url: `/upload/connect-file`,
        method: "POST",
        body,
      }),
    }),
  }),
});
export const store = configureStore({
  reducer: {
    [hyborgApi.reducerPath]: hyborgApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(hyborgApi.middleware),
});
export const { useUploadMutation, useQrMutation } = hyborgApi;
