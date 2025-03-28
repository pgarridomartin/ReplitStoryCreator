import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StepProgress from "@/components/book-form/StepProgress";
import ChildInfo from "@/components/book-form/ChildInfo";
import VisualCharacterCustomizer from "@/components/book-form/VisualCharacterCustomizer";
import StorySettings from "@/components/book-form/StorySettings";
import BookPreview from "@/components/book-form/BookPreview";
import Checkout from "@/components/book-form/Checkout";
import { BookGenerationRequest } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type Step = 1 | 2 | 3 | 4 | 5;

export default function CreateBook() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [bookData, setBookData] = useState<BookGenerationRequest>({
    // Basic information
    childName: "",
    childAge: "",
    childGender: "",
    interests: [],
    // Basic customization
    characterStyle: "",
    hairStyle: "",
    skinTone: "",
    // Advanced customization
    hairColor: "",
    eyeColor: "",
    clothingStyle: "",
    accessories: [],
    facialFeatures: [],
    height: "",
    buildType: "",
    // Story settings
    storyTheme: "",
    storyGoal: "",
    companions: [],
    storyLength: "2", // Default medium
  });
  
  // Story generation state
  const [generatedStory, setGeneratedStory] = useState<{
    title: string;
    content: string;
    coverImageUrl: string;
    previewImages: string[];
    bookId?: number;
  } | null>(null);
  
  const [bookFormat, setBookFormat] = useState<'hardcover' | 'digital'>('hardcover');
  const { toast } = useToast();

  const generateStoryMutation = useMutation({
    mutationFn: async (data: BookGenerationRequest) => {
      try {
        const res = await apiRequest('POST', '/api/books/generate', data);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to generate story. Please try again.");
        }
        
        return res.json();
      } catch (error) {
        console.error("Story generation error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setGeneratedStory(data);
      toast({
        title: "Story generated successfully!",
        description: "Your personalized story has been created.",
        variant: "default",
      });
      nextStep();
    },
    onError: (error: Error) => {
      toast({
        title: "Error generating story",
        description: error.message || "Please check all fields and try again later",
        variant: "destructive",
      });
    }
  });

  // Handler for step navigation
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  // Handler for form data updates
  const updateBookData = (data: Partial<BookGenerationRequest>) => {
    setBookData((prev) => ({ ...prev, ...data }));
  };

  // Handler for story generation
  const handleGenerateStory = () => {
    generateStoryMutation.mutate(bookData);
  };

  // Handler for regenerating the story
  const handleRegenerateStory = () => {
    generateStoryMutation.mutate(bookData);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <Header />
      
      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-heading text-center mb-4">Create Your Personalized Book</h2>
          <p className="text-center mb-12 max-w-2xl mx-auto">Follow these simple steps to create a unique story starring your child.</p>
          
          <StepProgress currentStep={currentStep} />
          
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
            {currentStep === 1 && (
              <ChildInfo 
                bookData={bookData} 
                updateBookData={updateBookData} 
                onNext={nextStep} 
              />
            )}
            
            {currentStep === 2 && (
              <VisualCharacterCustomizer 
                bookData={bookData} 
                updateBookData={updateBookData} 
                onNext={nextStep} 
                onPrev={prevStep} 
              />
            )}
            
            {currentStep === 3 && (
              <StorySettings 
                bookData={bookData} 
                updateBookData={updateBookData} 
                onNext={handleGenerateStory} 
                onPrev={prevStep}
                isGenerating={generateStoryMutation.isPending}
              />
            )}
            
            {currentStep === 4 && (
              <BookPreview 
                isLoading={generateStoryMutation.isPending}
                generatedStory={generatedStory}
                bookData={bookData}
                bookFormat={bookFormat}
                setBookFormat={setBookFormat}
                onNext={nextStep}
                onPrev={prevStep}
                onRegenerate={handleRegenerateStory}
              />
            )}
            
            {currentStep === 5 && (
              <Checkout 
                generatedStory={generatedStory}
                bookFormat={bookFormat}
                onPrev={prevStep}
              />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
