import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookGenerationRequest } from "@shared/schema";

interface CharacterCustomizationProps {
  bookData: BookGenerationRequest;
  updateBookData: (data: Partial<BookGenerationRequest>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const formSchema = z.object({
  // Basic customization (required)
  characterStyle: z.string().min(1, "Character style is required"),
  hairStyle: z.string().min(1, "Hair style is required"),
  skinTone: z.string().min(1, "Skin tone is required"),
  
  // Advanced customization (optional)
  hairColor: z.string().optional(),
  eyeColor: z.string().optional(),
  clothingStyle: z.string().optional(),
  accessories: z.array(z.string()).max(3).optional(),
  facialFeatures: z.array(z.string()).max(3).optional(),
  height: z.string().optional(),
  buildType: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CharacterCustomization({ 
  bookData, 
  updateBookData, 
  onNext, 
  onPrev 
}: CharacterCustomizationProps) {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(bookData.accessories || []);
  const [selectedFacialFeatures, setSelectedFacialFeatures] = useState<string[]>(bookData.facialFeatures || []);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Basic customization
      characterStyle: bookData.characterStyle || "",
      hairStyle: bookData.hairStyle || "",
      skinTone: bookData.skinTone || "",
      
      // Advanced customization
      hairColor: bookData.hairColor || "",
      eyeColor: bookData.eyeColor || "",
      clothingStyle: bookData.clothingStyle || "",
      accessories: bookData.accessories || [],
      facialFeatures: bookData.facialFeatures || [],
      height: bookData.height || "",
      buildType: bookData.buildType || "",
    },
  });

  const onSubmit = (values: FormValues) => {
    // Ensure accessories and facial features are included in the form values
    const updatedValues = {
      ...values,
      accessories: selectedAccessories,
      facialFeatures: selectedFacialFeatures,
    };
    
    updateBookData(updatedValues);
    onNext();
  };
  
  const handleAccessoryChange = (accessory: string, checked: boolean) => {
    let updatedAccessories: string[];
    
    if (checked) {
      // Don't add more than 3 accessories
      if (selectedAccessories.length >= 3) return;
      updatedAccessories = [...selectedAccessories, accessory];
    } else {
      updatedAccessories = selectedAccessories.filter(a => a !== accessory);
    }
    
    setSelectedAccessories(updatedAccessories);
    form.setValue("accessories", updatedAccessories);
  };
  
  const handleFacialFeatureChange = (feature: string, checked: boolean) => {
    let updatedFeatures: string[];
    
    if (checked) {
      // Don't add more than 3 facial features
      if (selectedFacialFeatures.length >= 3) return;
      updatedFeatures = [...selectedFacialFeatures, feature];
    } else {
      updatedFeatures = selectedFacialFeatures.filter(f => f !== feature);
    }
    
    setSelectedFacialFeatures(updatedFeatures);
    form.setValue("facialFeatures", updatedFeatures);
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
              <FormControl>
                <RadioGroup 
                  onValueChange={field.onChange} 
                  value={field.value}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                >
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
          name="hairStyle"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel className="font-semibold mb-3">Hair Style</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
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
                  value={field.value}
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
        
        {/* Advanced Options Toggle */}
        <div className="mb-6 border-t border-b py-4 flex items-center justify-between">
          <div>
            <h4 className="font-semibold">Advanced Character Options</h4>
            <p className="text-sm text-gray-500">Fine-tune your character with more detailed options</p>
          </div>
          <Switch
            checked={showAdvancedOptions}
            onCheckedChange={setShowAdvancedOptions}
            aria-label="Toggle advanced character options"
          />
        </div>
        
        {/* Advanced Options Section */}
        {showAdvancedOptions && (
          <Accordion type="single" collapsible className="mb-6">
            <AccordionItem value="appearance">
              <AccordionTrigger className="text-lg font-semibold">Physical Appearance</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Hair Color */}
                  <FormField
                    control={form.control}
                    name="hairColor"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="font-medium">Hair Color</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select hair color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="blonde">Blonde</SelectItem>
                            <SelectItem value="brown">Brown</SelectItem>
                            <SelectItem value="black">Black</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                            <SelectItem value="gray">Gray/Silver</SelectItem>
                            <SelectItem value="colorful">Colorful</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Eye Color */}
                  <FormField
                    control={form.control}
                    name="eyeColor"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="font-medium">Eye Color</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select eye color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="brown">Brown</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="hazel">Hazel</SelectItem>
                            <SelectItem value="gray">Gray</SelectItem>
                            <SelectItem value="amber">Amber</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Height */}
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="font-medium">Height</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select height" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="short">Short</SelectItem>
                            <SelectItem value="average">Average</SelectItem>
                            <SelectItem value="tall">Tall</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Build Type */}
                  <FormField
                    control={form.control}
                    name="buildType"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="font-medium">Build Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select build type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="slim">Slim</SelectItem>
                            <SelectItem value="average">Average</SelectItem>
                            <SelectItem value="athletic">Athletic</SelectItem>
                            <SelectItem value="stout">Stout</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="outfitAndAccessories">
              <AccordionTrigger className="text-lg font-semibold">Outfit & Accessories</AccordionTrigger>
              <AccordionContent>
                {/* Clothing Style */}
                <FormField
                  control={form.control}
                  name="clothingStyle"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="font-medium">Clothing Style</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select clothing style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="sporty">Sporty/Athletic</SelectItem>
                          <SelectItem value="fancy">Fancy/Dressy</SelectItem>
                          <SelectItem value="adventure">Adventure Gear</SelectItem>
                          <SelectItem value="space">Space Explorer</SelectItem>
                          <SelectItem value="fantasy">Fantasy/Magical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Accessories */}
                <FormField
                  control={form.control}
                  name="accessories"
                  render={() => (
                    <FormItem className="mb-4">
                      <div className="mb-2">
                        <FormLabel className="font-medium">Accessories (Choose up to 3)</FormLabel>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {[
                          "glasses", "hat", "backpack", "watch", "necklace", "crown"
                        ].map((accessory) => (
                          <label 
                            key={accessory} 
                            className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <Checkbox 
                              checked={selectedAccessories.includes(accessory)}
                              onCheckedChange={(checked) => handleAccessoryChange(accessory, checked as boolean)}
                              className="mr-2"
                            />
                            <span className="capitalize">{accessory}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedAccessories.length}/3 selected
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="facialFeatures">
              <AccordionTrigger className="text-lg font-semibold">Facial Features</AccordionTrigger>
              <AccordionContent>
                <FormField
                  control={form.control}
                  name="facialFeatures"
                  render={() => (
                    <FormItem className="mb-4">
                      <div className="mb-2">
                        <FormLabel className="font-medium">Facial Features (Choose up to 3)</FormLabel>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {[
                          "freckles", "dimples", "big smile", "round eyes", "rosy cheeks", "thick eyebrows"
                        ].map((feature) => (
                          <label 
                            key={feature} 
                            className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <Checkbox 
                              checked={selectedFacialFeatures.includes(feature)}
                              onCheckedChange={(checked) => handleFacialFeatureChange(feature, checked as boolean)}
                              className="mr-2"
                            />
                            <span className="capitalize">{feature}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedFacialFeatures.length}/3 selected
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        
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
