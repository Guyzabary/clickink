import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

const MAX_IMAGE_SIZE = 1000; // Maximum width/height in pixels
const COMPRESSION_QUALITY = 0.8; // Image quality (0.0 to 1.0)
const SIZE_THRESHOLD = 500 * 1024; // 500KB threshold for compression

// Helper function to resize and compress image
const processImage = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      // Create canvas
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions if image is larger than max size
      if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_IMAGE_SIZE) / width);
          width = MAX_IMAGE_SIZE;
        } else {
          width = Math.round((width * MAX_IMAGE_SIZE) / height);
          height = MAX_IMAGE_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        COMPRESSION_QUALITY
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
};

export const uploadArtworkImage = async (file: File): Promise<string> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload an image file');
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Image size must be less than 10MB');
    }

    let processedFile: Blob | File = file;

    // Only process if file is larger than threshold
    if (file.size > SIZE_THRESHOLD) {
      processedFile = await processImage(file);
    }

    // Generate a unique filename
    const uniqueId = uuidv4();
    const extension = file.type === 'image/jpeg' ? 'jpg' : 'png';
    const filename = `artwork/${uniqueId}.${extension}`;

    // Create storage reference
    const storageRef = ref(storage, filename);

    // Set proper metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        'uploaded-by': 'artist-dashboard',
        'original-size': file.size.toString(),
        'processed-size': processedFile.size.toString()
      }
    };

    // Upload with metadata
    await uploadBytes(storageRef, processedFile, metadata);

    // Get download URL
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const uploadAppointmentImage = async (file: File): Promise<string> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload an image file');
    }

    // Validate file size (5MB max for appointments)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    let processedFile: Blob | File = file;

    // Only process if file is larger than threshold
    if (file.size > SIZE_THRESHOLD) {
      processedFile = await processImage(file);
    }

    // Generate a unique filename
    const uniqueId = uuidv4();
    const extension = file.type === 'image/jpeg' ? 'jpg' : 'png';
    const filename = `appointments/${uniqueId}.${extension}`;

    // Create storage reference
    const storageRef = ref(storage, filename);

    // Set proper metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        'uploaded-by': 'appointment-form',
        'original-size': file.size.toString(),
        'processed-size': processedFile.size.toString()
      }
    };

    // Upload with metadata
    await uploadBytes(storageRef, processedFile, metadata);

    // Get download URL
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const uploadChatImage = async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload an image file');
    }

    // Validate file size (5MB max for chat images)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    let processedFile: Blob | File = file;

    if (onProgress) onProgress(10);

    // Only process if file is larger than threshold
    if (file.size > SIZE_THRESHOLD) {
      processedFile = await processImage(file);
    }

    if (onProgress) onProgress(30);

    // Generate a unique filename
    const uniqueId = uuidv4();
    const extension = file.type === 'image/jpeg' ? 'jpg' : 'png';
    const filename = `chat/${uniqueId}.${extension}`;

    // Create storage reference
    const storageRef = ref(storage, filename);

    // Set proper metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        'uploaded-by': 'chat',
        'original-size': file.size.toString(),
        'processed-size': processedFile.size.toString()
      }
    };

    if (onProgress) onProgress(50);

    // Upload with metadata
    await uploadBytes(storageRef, processedFile, metadata);

    if (onProgress) onProgress(80);

    // Get download URL
    const downloadUrl = await getDownloadURL(storageRef);

    if (onProgress) onProgress(100);

    return downloadUrl;
  } catch (error) {
    console.error('Error uploading chat image:', error);
    throw error;
  }
};