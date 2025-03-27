import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { BookGenerationRequest } from "@shared/schema";

interface CharacterCustomizationProps {
  bookData: BookGenerationRequest;
  updateBookData: (data: Partial<BookGenerationRequest>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const formSchema = z.object({
  characterStyle: z.string().min(1, "Character style is required"),
  hairStyle: z.string().min(1, "Hair style is required"),
  skinTone: z.string().min(1, "Skin tone is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CharacterCustomization({ 
  bookData, 
  updateBookData, 
  onNext, 
  onPrev 
}: CharacterCustomizationProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      characterStyle: bookData.characterStyle || "",
      hairStyle: bookData.hairStyle || "",
      skinTone: bookData.skinTone || "",
    },
  });

  const onSubmit = (values: FormValues) => {
    updateBookData(values);
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-bold font-heading mb-6">Customize Your Character</h3>
        
        <FormField
          control={form.control}
          name="characterStyle"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel className="font-semibold mb-3">Choose Character Style</FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  {
                    value: "cartoon",
                    label: "Cartoon",
                    image: "https://images.unsplash.com/photo-1580094333632-438bdc04f79f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
                  },
                  {
                    value: "watercolor",
                    label: "Watercolor",
                    image: "https://images.unsplash.com/photo-1582201942988-13e60e4556ee?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
                  },
                  {
                    value: "3d",
                    label: "3D",
                    image: "https://images.unsplash.com/photo-1584824388899-127cfc78fa31?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
                  },
                ].map((style) => (
                  <div key={style.value} className="character-option cursor-pointer">
                    <FormControl>
                      <RadioGroup 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        className="hidden"
                      >
                        <div className="relative">
                          <RadioGroupItem 
                            value={style.value} 
                            id={`style-${style.value}`} 
                            className="sr-only" 
                          />
                          <label
                            htmlFor={`style-${style.value}`}
                            className={`block cursor-pointer border-2 rounded-xl p-4 transition-all ${
                              field.value === style.value ? 'border-[#FF6B6B] shadow-lg' : 'border-gray-200'
                            }`}
                          >
                            <img 
                              src={style.image} 
                              alt={`${style.label} style character`} 
                              className="w-full h-32 object-cover rounded-lg mb-2" 
                            />
                            <h5 className="font-bold text-center">{style.label}</h5>
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="hairStyle"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel className="font-semibold mb-3">Hair Style</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-wrap gap-3"
                >
                  {["short", "long", "curly", "wavy"].map((hair) => (
                    <div key={hair} className="relative">
                      <RadioGroupItem 
                        value={hair} 
                        id={`hair-${hair}`} 
                        className="sr-only" 
                      />
                      <label
                        htmlFor={`hair-${hair}`}
                        className={`flex items-center p-2 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                          field.value === hair ? 'border-[#FF6B6B] bg-gray-50' : 'border-gray-200'
                        }`}
                      >
                        <span className="capitalize">{hair}</span>
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="skinTone"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel className="font-semibold mb-3">Skin Tone</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-wrap gap-4"
                >
                  {[
                    { value: "light", color: "bg-amber-200" },
                    { value: "medium", color: "bg-amber-400" },
                    { value: "tan", color: "bg-amber-600" },
                    { value: "dark", color: "bg-amber-900" },
                  ].map((skin) => (
                    <div key={skin.value} className="relative">
                      <RadioGroupItem 
                        value={skin.value} 
                        id={`skin-${skin.value}`} 
                        className="sr-only" 
                      />
                      <label
                        htmlFor={`skin-${skin.value}`}
                        className="cursor-pointer"
                      >
                        <div 
                          className={`w-10 h-10 rounded-full ${skin.color} border-2 hover:border-[#FF6B6B] ${
                            field.value === skin.value ? 'border-[#FF6B6B]' : 'border-transparent'
                          }`}
                        ></div>
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-between">
          <Button
            type="button"
            onClick={onPrev}
            variant="outline"
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-8 rounded-lg inline-flex items-center transition-all"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            <span>Previous</span>
          </Button>
          
          <Button
            type="submit"
            className="bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center transition-all"
          >
            <span>Next: Story</span>
            <i className="ri-arrow-right-line ml-2"></i>
          </Button>
        </div>
      </form>
    </Form>
  );
}
