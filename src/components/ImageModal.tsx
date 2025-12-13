import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  alt?: string;
}

const ImageModal = ({ isOpen, onClose, imageUrl, alt = 'Image' }: ImageModalProps) => {
  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/90 flex items-center justify-center">
        <VisuallyHidden>
          <DialogTitle>{alt}</DialogTitle>
        </VisuallyHidden>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-full max-h-[90vh] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
