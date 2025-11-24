import { uploadImage as uploadImageS3 } from "../repositories/ImageRepository";

export const uploadImage = async (directory: string, file: File) => {
  return uploadImageS3(directory, file);
};
