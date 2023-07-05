import { configureStore } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const hyborgApi = createApi({
  reducerPath: "hyborgApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}`,
  }),
  tagTypes: ["profile"],
  endpoints: (builder) => ({
    uploadVideo: builder.mutation({
      invalidatesTags: ["qrimage"],
      query: (body) => {
        const formData = new FormData();
        if (body.file) {
          formData.set("file", body.file);
        }
        return {
          url: "/upload",
          method: "POST",
          prepareHeaders: (headers) => {
            headers.set("Content-Type", "multipart/form-data");
            return headers;
          },
          body: formData,
        };
      },
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
export const { useUploadVideoMutation } = hyborgApi;
