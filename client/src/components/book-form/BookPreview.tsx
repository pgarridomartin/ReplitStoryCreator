import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookGenerationRequest } from "@shared/schema";

interface Page {
  text: string;
  imageUrl: string;
}

interface BookPreviewProps {
  isLoading: boolean;
  generatedStory: {
    title: string;
    content: string;
    coverImageUrl: string;
    previewImages: string[];
    pages?: Page[];
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
  const [previewPage, setPreviewPage] = useState(0);
  const [showFullBook, setShowFullBook] = useState(false);
  
  if (isLoading || !generatedStory) {
    return (
      <div id="story-loading" className="text-center py-10">
        <div className="inline-block animate-spin text-5xl text-[#4ECDC4] mb-4">
          <i className="ri-loader-4-line"></i>
        </div>
        <p className="text-lg font-medium mb-2">Creating your unique visual story...</p>
        <p className="text-sm text-gray-500">Our AI is crafting a special adventure with beautiful illustrations just for <span className="font-medium">{bookData.childName}</span>!</p>
      </div>
    );
  }

  // Extract the first paragraph for preview
  const contentPreview = generatedStory.content.split('\n\n')[0];
  
  // Determine if we have the enhanced visual story format
  const hasVisualStory = generatedStory.pages && generatedStory.pages.length > 0;
  
  return (
    <div>
      <h3 className="text-2xl font-bold font-heading mb-6">Preview Your Book</h3>
      
      <div className="mb-6 bg-[#F8F9FA] p-6 rounded-lg">
        <h4 className="font-bold text-lg mb-3">Story Title: <span>{generatedStory.title}</span></h4>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h5 className="font-medium">Story Preview</h5>
            <Dialog>
              <DialogTrigger asChild>
                <button type="button" className="text-sm text-[#4ECDC4] hover:underline">
                  Read Full Story
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-xl max-h-[80vh] overflow-hidden">
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-4">{generatedStory.title}</h3>
                  <ScrollArea className="h-[60vh]">
                    <div className="pr-4 whitespace-pre-line">
                      {generatedStory.content}
                    </div>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-sm italic bg-white p-3 rounded border border-gray-100">
            {contentPreview}
          </p>
        </div>
        
        {hasVisualStory ? (
          <>
            <div className="mb-4">
              <h5 className="font-medium mb-2">Visual Story Preview</h5>
              <div className="flex justify-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                {showFullBook ? (
                  <div className="w-full">
                    <div className="relative flex justify-center">
                      <img 
                        src={previewPage === 0 ? generatedStory.coverImageUrl : generatedStory.pages![previewPage - 1].imageUrl} 
                        alt={`Page ${previewPage}`} 
                        className="w-full max-w-md h-64 object-contain rounded-lg" 
                        onError={(e) => {
                          // If image fails to load, replace with a fallback
                          e.currentTarget.src = "https://images.unsplash.com/photo-1516627145497-ae6968895b40?w=800&auto=format&fit=crop";
                        }}
                      />
                      <button 
                        onClick={() => setPreviewPage(prev => Math.max(0, prev - 1))}
                        disabled={previewPage === 0}
                        className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow ${previewPage === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
                      >
                        <i className="ri-arrow-left-s-line text-xl"></i>
                      </button>
                      <button 
                        onClick={() => setPreviewPage(prev => Math.min((generatedStory.pages?.length || 0), prev + 1))}
                        disabled={previewPage >= (generatedStory.pages?.length || 0)}
                        className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow ${previewPage >= (generatedStory.pages?.length || 0) ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
                      >
                        <i className="ri-arrow-right-s-line text-xl"></i>
                      </button>
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-sm font-medium">{previewPage === 0 ? 'Cover' : `Page ${previewPage} of ${generatedStory.pages?.length}`}</p>
                      {previewPage > 0 && (
                        <p className="mt-2 italic text-sm">{generatedStory.pages![previewPage - 1].text}</p>
                      )}
                    </div>
                    <div className="mt-4 text-center">
                      <button 
                        onClick={() => setShowFullBook(false)}
                        className="text-sm text-[#4ECDC4] hover:underline"
                      >
                        Return to Book Preview
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h5 className="font-medium mb-2 text-sm">Cover Image</h5>
                        <img 
                          src={generatedStory.coverImageUrl} 
                          alt="Book cover preview" 
                          className="w-full h-40 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90"
                          onClick={() => {
                            setPreviewPage(0);
                            setShowFullBook(true);
                          }}
                          onError={(e) => {
                            // If image fails to load, replace with a fallback
                            e.currentTarget.src = "https://images.unsplash.com/photo-1516627145497-ae6968895b40?w=800&auto=format&fit=crop";
                          }}
                        />
                      </div>
                      {generatedStory.previewImages.slice(0, 2).map((img, index) => (
                        <div key={index}>
                          <h5 className="font-medium mb-2 text-sm">Page Sample {index + 1}</h5>
                          <img 
                            src={img} 
                            alt={`Page ${index + 1} preview`} 
                            className="w-full h-40 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90"
                            onClick={() => {
                              setPreviewPage(index + 1);
                              setShowFullBook(true);
                            }}
                            onError={(e) => {
                              // If image fails to load, replace with a fallback
                              e.currentTarget.src = "https://images.unsplash.com/photo-1516627145497-ae6968895b40?w=800&auto=format&fit=crop";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <button 
                        onClick={() => {
                          setPreviewPage(0);
                          setShowFullBook(true);
                        }}
                        className="text-sm text-[#4ECDC4] hover:underline"
                      >
                        Browse Full Book
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <h5 className="font-medium mb-2 text-sm">Cover Image</h5>
              <img 
                src={generatedStory.coverImageUrl} 
                alt="Book cover preview" 
                className="w-full h-40 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  // If image fails to load, replace with a fallback
                  e.currentTarget.src = "https://images.unsplash.com/photo-1516627145497-ae6968895b40?w=800&auto=format&fit=crop";
                }}
              />
            </div>
            {generatedStory.previewImages.slice(0, 2).map((img, index) => (
              <div key={index}>
                <h5 className="font-medium mb-2 text-sm">Page Sample {index + 1}</h5>
                <img 
                  src={img} 
                  alt={`Page ${index + 1} preview`} 
                  className="w-full h-40 object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    // If image fails to load, replace with a fallback
                    e.currentTarget.src = "https://images.unsplash.com/photo-1516627145497-ae6968895b40?w=800&auto=format&fit=crop";
                  }}
                />
              </div>
            ))}
          </div>
        )}
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
              <p className="text-sm text-gray-500">Premium quality, durable hardcover with {hasVisualStory ? generatedStory.pages?.length : '24'} colorful pages</p>
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
