import { ChangeEvent } from 'react';

interface UseImageUploadProps {
  onImageChange: (base64String: string) => void;
  sizeLimit?: number; // KB
  onSizeExceeded: () => void;
}

export function useActivityImageUpload({
  onImageChange,
  sizeLimit = 100,
  onSizeExceeded,
}: UseImageUploadProps) {
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= sizeLimit * 1024) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        onImageChange(base64String);
      };
      reader.readAsDataURL(file);
    } else {
      onSizeExceeded;
    }
  };

  return handleImageUpload;
}
