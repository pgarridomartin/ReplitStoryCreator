import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { BookGenerationRequest } from "@shared/schema";

interface StorySettingsProps {
  bookData: BookGenerationRequest;
  updateBookData: (data: Partial<BookGenerationRequest>) => void;
  onNext: () => void;
  onPrev: () => void;
  isGenerating: boolean;
}

const formSchema = z.object({
  storyTheme: z.string().min(1, "Story theme is required"),
  storyGoal: z.string().min(1, "Story goal is required"),
  companions: z.array(z.string()).max(2, "Select up to 2 companions"),
  storyLength: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function StorySettings({ 
  bookData, 
  updateBookData, 
  onNext, 
  onPrev,
  isGenerating
}: StorySettingsProps) {
  const [selectedCompanions, setSelectedCompanions] = useState<string[]>(bookData.companions || []);
  const [storyLengthLabel, setStoryLengthLabel] = useState(() => {
    const value = bookData.storyLength || "2";
    return value === "1" ? "Short" : value === "3" ? "Long" : "Medium";
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storyTheme: bookData.storyTheme || "",
      storyGoal: bookData.storyGoal || "",
      companions: bookData.companions || [],
      storyLength: bookData.storyLength || "2",
    },
  });

  const onSubmit = (values: FormValues) => {
    updateBookData(values);
    onNext();
  };

  const handleCompanionChange = (companion: string, checked: boolean) => {
    let updatedCompanions: string[];
    
    if (checked) {
      // Don't add more than 2 companions
      if (selectedCompanions.length >= 2) return;
      updatedCompanions = [...selectedCompanions, companion];
    } else {
      updatedCompanions = selectedCompanions.filter(c => c !== companion);
    }
    
    setSelectedCompanions(updatedCompanions);
    form.setValue("companions", updatedCompanions);
  };

  const handleStoryLengthChange = (value: number[]) => {
    const lengthValue = String(value[0]);
    let label = "Medium";
    
    if (lengthValue === "1") label = "Short";
    if (lengthValue === "3") label = "Long";
    
    setStoryLengthLabel(label);
    form.setValue("storyLength", lengthValue);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-bold font-heading mb-6">Create Your Story</h3>
        
        <FormField
          control={form.control}
          name="storyTheme"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel className="block mb-2 font-semibold">Story Theme</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="adventure">Adventure in the Wild</SelectItem>
                  <SelectItem value="space">Space Exploration</SelectItem>
                  <SelectItem value="underwater">Underwater Discovery</SelectItem>
                  <SelectItem value="magic">Magical Kingdom</SelectItem>
                  <SelectItem value="dinosaurs">Dinosaur Time Travel</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="storyGoal"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel className="block mb-2 font-semibold">Story Goal</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                    <SelectValue placeholder="What is the main character trying to do?" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="find">Find a lost treasure</SelectItem>
                  <SelectItem value="rescue">Rescue a friend</SelectItem>
                  <SelectItem value="learn">Learn a special skill</SelectItem>
                  <SelectItem value="solve">Solve a mystery</SelectItem>
                  <SelectItem value="explore">Explore a new world</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="companions"
          render={() => (
            <FormItem className="mb-6">
              <FormLabel className="block mb-2 font-semibold">Companions</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  "dog", "robot", "fairy", "dragon", "wizard"
                ].map((companion) => {
                  const label = companion === "dog" 
                    ? "Friendly Dog" 
                    : companion === "robot" 
                      ? "Helpful Robot" 
                      : companion === "fairy" 
                        ? "Magical Fairy" 
                        : companion === "dragon" 
                          ? "Friendly Dragon" 
                          : "Wise Wizard";
                  
                  return (
                    <label 
                      key={companion} 
                      className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <Checkbox 
                        checked={selectedCompanions.includes(companion)}
                        onCheckedChange={(checked) => handleCompanionChange(companion, checked as boolean)}
                        className="mr-2"
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-sm text-gray-500 mt-1">Select up to 2 companions</p>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="storyLength"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel className="block mb-2 font-semibold">Story Length</FormLabel>
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Slider
                    defaultValue={[parseInt(field.value)]}
                    min={1}
                    max={3}
                    step={1}
                    onValueChange={handleStoryLengthChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </FormControl>
                <span className="text-sm font-medium w-20">{storyLengthLabel}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Short</span>
                <span>Medium</span>
                <span>Long</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-between">
          <Button
            type="button"
            onClick={onPrev}
            variant="outline"
            disabled={isGenerating}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-8 rounded-lg inline-flex items-center transition-all"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            <span>Previous</span>
          </Button>
          
          <Button
            type="submit"
            disabled={isGenerating}
            className="bg-[#4ECDC4] hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center transition-all"
          >
            {isGenerating ? (
              <>
                <span>Generating...</span>
                <i className="ri-loader-4-line ml-2 animate-spin"></i>
              </>
            ) : (
              <>
                <span>Generate Story</span>
                <i className="ri-magic-line ml-2"></i>
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
