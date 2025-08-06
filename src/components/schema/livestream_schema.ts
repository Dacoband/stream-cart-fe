import { z } from 'zod'
export const createLivestreamSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  description: z.string().min(1, "Mô tả là bắt buộc"),
 scheduledStartTime: z.date({
  required_error: "Vui lòng chọn thời gian bắt đầu",
}),
 thumbnailUrl: z.instanceof(File, {
  message: "Vui lòng chọn ảnh đại diện cửa hàng!",
}),


  tags: z.string(),

  
    
   
});

export type CreateLivestreamSchema = z.infer<typeof createLivestreamSchema>;