import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';

const TMP_FOLDER = path.resolve(process.cwd(), 'tmp');
const UPLOADS_FOLDER = path.resolve(TMP_FOLDER, 'uploads');

const MAX_SIZE = 3; // em MB
const MAX_FILE_SIZE = 1024 * 1024 * MAX_SIZE;
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif'];

const MULTER = {
  storage: multer.diskStorage({
    destination: TMP_FOLDER,
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('hex');
      const fileName = `${fileHash}-${file.originalname}`;
      return callback(null, fileName);
    }
  })
};

export default { TMP_FOLDER, UPLOADS_FOLDER, MAX_FILE_SIZE, ACCEPTED_FILE_TYPES, MULTER, MAX_SIZE };