const fs = require('fs/promises');

const detectImageType = (buffer) => {
  if (!buffer || buffer.length < 4) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buffer.subarray(0, 6).toString('ascii') === 'GIF87a' || buffer.subarray(0, 6).toString('ascii') === 'GIF89a') return 'gif';
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.length >= 12 && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp';
  return null;
};

const validateUploadedImages = async (req, res, next) => {
  const files = req.files || [];
  try {
    for (const file of files) {
      const handle = await fs.open(file.path, 'r');
      const header = Buffer.alloc(16);
      await handle.read(header, 0, 16, 0);
      await handle.close();
      if (!detectImageType(header)) {
        const error = new Error('One or more uploaded files are not valid images.');
        error.status = 400;
        throw error;
      }
    }
    next();
  } catch (error) {
    await Promise.all(files.map((file) => fs.unlink(file.path).catch(() => {})));
    next(error);
  }
};

module.exports = { detectImageType, validateUploadedImages };
