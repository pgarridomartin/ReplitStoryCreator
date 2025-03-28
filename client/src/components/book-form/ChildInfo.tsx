import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { BookGenerationRequest } from "@shared/schema";

interface ChildInfoProps {
  bookData: BookGenerationRequest;
  updateBookData: (data: Partial<BookGenerationRequest>) => void;
  onNext: () => void;
}

const formSchema = z.object({
  childName: z.string().min(1, "Child's name is required"),
  childAge: z.string().min(1, "Age is required"),
  childGender: z.string().min(1, "Gender is required"),
  interests: z.array(z.string()).min(1, "Select at least one interest").max(3, "Select up to 3 interests"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ChildInfo({ bookData, updateBookData, onNext }: ChildInfoProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(bookData.interests || []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      childName: bookData.childName || "",
      childAge: bookData.childAge || "",
      childGender: bookData.childGender || "",
      interests: bookData.interests || [],
    },
  });

  const onSubmit = (values: FormValues) => {
    updateBookData(values);
    onNext();
  };

  const handleInterestChange = (interest: string, checked: boolean) => {
    let updatedInterests: string[];
    
    if (checked) {
      // Don't add more than 3 interests
      if (selectedInterests.length >= 3) return;
      updatedInterests = [...selectedInterests, interest];
    } else {
      updatedInterests = selectedInterests.filter(i => i !== interest);
    }
    
    setSelectedInterests(updatedInterests);
    form.setValue("interests", updatedInterests, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-bold font-heading mb-6">Tell Us About Your Child</h3>
        
        <FormField
          control={form.control}
          name="childName"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel className="block mb-2 font-semibold">Child's Name</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter child's name" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </FormControl>
              <p className="text-sm text-gray-500 mt-1">This will be the protagonist of the story</p>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <FormField
            control={form.control}
            name="childAge"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block mb-2 font-semibold">Age</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                      <SelectValue placeholder="Select age" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="6-8">6-8 years</SelectItem>
                    <SelectItem value="9-12">9-12 years</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="childGender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block mb-2 font-semibold">Gender</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center">
                      <RadioGroupItem value="boy" id="boy" className="mr-2" />
                      <label htmlFor="boy">Boy</label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="girl" id="girl" className="mr-2" />
                      <label htmlFor="girl">Girl</label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="neutral" id="neutral" className="mr-2" />
                      <label htmlFor="neutral">Neutral</label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="interests"
          render={() => (
            <FormItem className="mb-6">
              <FormLabel className="block mb-2 font-semibold">Child's Interests</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  "animals", "space", "dinosaurs", 
                  "fairy-tales", "superheroes", "adventure"
                ].map((interest) => (
                  <label 
                    key={interest} 
                    className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox 
                      checked={selectedInterests.includes(interest)}
                      onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                      className="mr-2"
                    />
                    <span className="capitalize">{interest.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">Select up to 3 interests</p>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center transition-all"
          >
            <span>Next: Character</span>
            <i className="ri-arrow-right-line ml-2"></i>
          </Button>
        </div>
      </form>
    </Form>
  );
}
