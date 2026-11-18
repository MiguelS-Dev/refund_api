import { Request, Response } from 'express';
import { z, ZodError } from 'zod';

import uploadConfig from '@/configs/upload';
import { DiskStorage } from '@/providers/disk-storage';
import { AppError } from '@/utils/AppError';

class UploadsController {
  async create(request: Request, response: Response) {
    const diskStorage = new DiskStorage();

    if (!request.file) {
      throw new AppError('Arquivo obrigatório');
    }

    try {
      const fileSchema = z.object({
        filename: z.string().min(1, 'Arquivo obrigatório'),
        mimetype: z.string().refine(
          (type) => uploadConfig.ACCEPTED_FILE_TYPES.includes(type),
          `Formato de arquivo inválido. Formatos permitidos: ${uploadConfig.ACCEPTED_FILE_TYPES.join(', ')}`
        ),
        size: z
          .number()
          .positive()
          .refine(
            (size) => size <= uploadConfig.MAX_FILE_SIZE,
            `Arquivo excede o tamanho máximo de ${uploadConfig.MAX_SIZE}MB`
          ),
      }).passthrough();

      const file = fileSchema.parse(request.file);
      const filename = await diskStorage.saveFile(file.filename);

      return response.json({ filename });
    } catch (error) {
      if (error instanceof ZodError) {
        // remove o arquivo inválido que o multer salvou em tmp
        await diskStorage.deleteFile(request.file.filename, 'tmp');
        throw new AppError(error.issues[0].message);
      }

      throw error;
    }
  }
}

export { UploadsController };
