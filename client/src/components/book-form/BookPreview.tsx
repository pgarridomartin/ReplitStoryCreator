import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { BookGenerationRequest } from "@shared/schema";

interface BookPreviewProps {
  isLoading: boolean;
  generatedStory: {
    title: string;
    content: string;
    coverImageUrl: string;
    previewImages: string[];
    bookId?: number;
  } | null;
  bookData: BookGenerationRequest;
  bookFormat: 'hardcover' | 'digital';
  setBookFormat: (format: 'hardcover' | 'digital') => void;
  onNext: () => void;
  onPrev: () => void;
  onRegenerate: () => void;
}

export default function BookPreview({
  isLoading,
  generatedStory,
  bookData,
  bookFormat,
  setBookFormat,
  onNext,
  onPrev,
  onRegenerate
}: BookPreviewProps) {
  if (isLoading || !generatedStory) {
    return (
      <div id="story-loading" className="text-center py-10">
        <div className="inline-block animate-spin text-5xl text-[#4ECDC4] mb-4">
          <i className="ri-loader-4-line"></i>
        </div>
        <p className="text-lg font-medium mb-2">Creating your unique story...</p>
        <p className="text-sm text-gray-500">Our AI is crafting a special adventure just for <span>{bookData.childName}</span>!</p>
      </div>
    );
  }

  // Extract the first paragraph for preview
  const contentPreview = generatedStory.content.split('\n\n')[0];
  
  return (
    <div>
      <h3 className="text-2xl font-bold font-heading mb-6">Preview Your Book</h3>
      
      <div className="mb-6 bg-[#F8F9FA] p-6 rounded-lg">
        <h4 className="font-bold text-lg mb-3">Story Title: <span>{generatedStory.title}</span></h4>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h5 className="font-medium">Story Preview</h5>
            <button type="button" className="text-sm text-[#4ECDC4] hover:underline">Read Full Story</button>
          </div>
          <p className="text-sm italic bg-white p-3 rounded border border-gray-100">
            {contentPreview}
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <h5 className="font-medium mb-2 text-sm">Cover Image</h5>
            <img 
              src={generatedStory.coverImageUrl} 
              alt="Book cover preview" 
              className="w-full h-40 object-cover rounded-lg shadow-md" 
            />
          </div>
          {generatedStory.previewImages.slice(0, 2).map((img, index) => (
            <div key={index}>
              <h5 className="font-medium mb-2 text-sm">Page Sample {index + 1}</h5>
              <img 
                src={img} 
                alt={`Page ${index + 1} preview`} 
                className="w-full h-40 object-cover rounded-lg shadow-md" 
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Book Format</h4>
        <RadioGroup
          value={bookFormat}
          onValueChange={(value: 'hardcover' | 'digital') => setBookFormat(value)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="border border-gray-200 rounded-lg p-4 flex items-start hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="hardcover" id="hardcover" className="mt-1 mr-3" />
            <label htmlFor="hardcover" className="cursor-pointer">
              <h5 className="font-bold">Hardcover Book</h5>
              <p className="text-sm text-gray-500">Premium quality, durable hardcover with 24 colorful pages</p>
              <p className="font-bold text-primary mt-2">$29.99</p>
            </label>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 flex items-start hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="digital" id="digital" className="mt-1 mr-3" />
            <label htmlFor="digital" className="cursor-pointer">
              <h5 className="font-bold">Digital PDF</h5>
              <p className="text-sm text-gray-500">Instant download, printable high-resolution digital copy</p>
              <p className="font-bold text-primary mt-2">$14.99</p>
            </label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="flex justify-between">
        <Button
          type="button"
          onClick={onRegenerate}
          variant="outline"
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-8 rounded-lg inline-flex items-center transition-all"
        >
          <i className="ri-refresh-line mr-2"></i>
          <span>Regenerate</span>
        </Button>
        
        <Button
          type="button"
          onClick={onNext}
          className="bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center transition-all"
        >
          <span>Proceed to Checkout</span>
          <i className="ri-arrow-right-line ml-2"></i>
        </Button>
      </div>
    </div>
  );
}
