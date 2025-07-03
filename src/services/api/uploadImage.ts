import rootApi from "../rootApi";

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await rootApi.post('/image/upload', formData);

  return response.data;
};

