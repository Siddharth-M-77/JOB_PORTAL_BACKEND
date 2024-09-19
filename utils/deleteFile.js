import fs from 'fs';
import path from 'path';

const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`File ${filePath} deleted successfully`);
    }
  } catch (error) {
    console.error(`Failed to delete file ${filePath}:`, error);
  }
};

export default deleteFile;
