import fs from 'node:fs';
import path from 'node:path';

import uploadConfig from '@/configs/upload';

class DiskStorage {
  async saveFile(file: string) {
    const tmpPath = path.resolve(uploadConfig.TMP_FOLDER, file);
    const destPath = path.resolve(uploadConfig.UPLOADS_FOLDER, file);

    await fs.promises.access(tmpPath);
    await fs.promises.mkdir(uploadConfig.UPLOADS_FOLDER, { recursive: true });
    await fs.promises.rename(tmpPath, destPath);

    return file;
  }

  async deleteFile(file: string, type: 'tmp' | 'upload') {
    const folder = type === 'tmp' ? uploadConfig.TMP_FOLDER : uploadConfig.UPLOADS_FOLDER;
    const filePath = path.resolve(folder, file);

    try {
      await fs.promises.stat(filePath);
    } catch {
      return;
    }

    await fs.promises.unlink(filePath);
  }
}

export { DiskStorage };
