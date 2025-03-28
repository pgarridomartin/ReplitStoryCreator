import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { BookGenerationRequest } from "@shared/schema";

interface VisualCharacterCustomizerProps {
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

export default function VisualCharacterCustomizer({ 
  bookData, 
  updateBookData, 
  onNext, 
  onPrev 
}: VisualCharacterCustomizerProps) {
  // State for tracking selected customizations with default values
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(bookData.accessories || ["glasses"]);
  const [selectedFacialFeatures, setSelectedFacialFeatures] = useState<string[]>(bookData.facialFeatures || ["freckles"]);
  const [currentTab, setCurrentTab] = useState("style");
  const [characterPreview, setCharacterPreview] = useState("");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Basic customization with default values
      characterStyle: bookData.characterStyle || "cartoon",
      hairStyle: bookData.hairStyle || "curly",
      skinTone: bookData.skinTone || "medium",
      
      // Advanced customization with default values
      hairColor: bookData.hairColor || "brown",
      eyeColor: bookData.eyeColor || "blue",
      clothingStyle: bookData.clothingStyle || "casual",
      accessories: bookData.accessories || ["glasses"],
      facialFeatures: bookData.facialFeatures || ["freckles"],
      height: bookData.height || "average",
      buildType: bookData.buildType || "average",
    },
  });

  // Watch form values to update the character preview
  const watchedValues = form.watch();
  
  // Generate the character preview when form values change
  useEffect(() => {
    updatePreview();
  }, [watchedValues, selectedAccessories, selectedFacialFeatures]);
  
  // This function would generate a preview of the character based on current selections
  const updatePreview = () => {
    // In a real implementation, this would use a combination of layered SVGs, canvas, or image generation
    // For this demonstration, we'll generate a sample URL for each style to show the concept
    const style = form.getValues("characterStyle") || "cartoon";
    const hairStyle = form.getValues("hairStyle") || "short";
    const skinTone = form.getValues("skinTone") || "medium";
    const hairColor = form.getValues("hairColor");
    
    // In a full implementation, we would use these to compose the character preview
    // For now, we'll use placeholder images for each combination
    const previewMap: Record<string, Record<string, string>> = {
      cartoon: {
        default: "https://images.unsplash.com/photo-1580094333632-438bdc04f79f?w=400&h=500&fit=crop",
      },
      watercolor: {
        default: "https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=400&h=500&fit=crop",
      },
      "3d": {
        default: "https://images.unsplash.com/photo-1584824388899-127cfc78fa31?w=400&h=500&fit=crop",
      }
    };
    
    // Get the appropriate preview image
    const preview = previewMap[style]?.default || previewMap.cartoon.default;
    setCharacterPreview(preview);
  };

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    // Ensure accessories and facial features are included
    const updatedValues = {
      ...values,
      accessories: selectedAccessories,
      facialFeatures: selectedFacialFeatures,
    };
    
    console.log("Submitting character customization with data:", updatedValues);
    
    // Set empty string values to undefined to avoid validation issues
    Object.keys(updatedValues).forEach(key => {
      const k = key as keyof typeof updatedValues;
      if (updatedValues[k] === '') {
        updatedValues[k] = undefined as any;
      }
    });
    
    updateBookData(updatedValues);
    onNext();
  };
  
  // Handle accessory selection
  const handleAccessorySelect = (accessory: string) => {
    if (selectedAccessories.includes(accessory)) {
      // If already selected, remove it
      const updatedAccessories = selectedAccessories.filter(a => a !== accessory);
      setSelectedAccessories(updatedAccessories);
      form.setValue("accessories", updatedAccessories);
    } else if (selectedAccessories.length < 3) {
      // If not selected and limit not reached, add it
      const updatedAccessories = [...selectedAccessories, accessory];
      setSelectedAccessories(updatedAccessories);
      form.setValue("accessories", updatedAccessories);
    }
  };
  
  // Handle facial feature selection
  const handleFacialFeatureSelect = (feature: string) => {
    if (selectedFacialFeatures.includes(feature)) {
      // If already selected, remove it
      const updatedFeatures = selectedFacialFeatures.filter(f => f !== feature);
      setSelectedFacialFeatures(updatedFeatures);
      form.setValue("facialFeatures", updatedFeatures);
    } else if (selectedFacialFeatures.length < 3) {
      // If not selected and limit not reached, add it
      const updatedFeatures = [...selectedFacialFeatures, feature];
      setSelectedFacialFeatures(updatedFeatures);
      form.setValue("facialFeatures", updatedFeatures);
    }
  };

  return (
    <div className="character-customizer">
      <h3 className="text-2xl font-bold font-heading mb-6">Customize Your Character</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Character Preview Panel */}
        <Card className="p-6 flex flex-col items-center bg-gradient-to-b from-[#f9f9f9] to-[#f1f1f1]">
          <h4 className="text-xl font-semibold mb-4">Character Preview</h4>
          
          <div className="character-preview-container w-full max-w-[300px] h-[350px] bg-white rounded-lg shadow-lg overflow-hidden mb-4">
            {characterPreview ? (
              <img 
                src={characterPreview} 
                alt="Character Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">Select options to preview character</p>
              </div>
            )}
          </div>
          
          <div className="character-summary text-sm">
            <p><strong>Style:</strong> {watchedValues.characterStyle ? watchedValues.characterStyle.charAt(0).toUpperCase() + watchedValues.characterStyle.slice(1) : 'Not selected'}</p>
            <p><strong>Hair:</strong> {watchedValues.hairStyle ? (watchedValues.hairColor ? `${watchedValues.hairColor} ${watchedValues.hairStyle}` : watchedValues.hairStyle) : 'Not selected'}</p>
            <p><strong>Skin tone:</strong> {watchedValues.skinTone || 'Not selected'}</p>
            {watchedValues.eyeColor && <p><strong>Eyes:</strong> {watchedValues.eyeColor}</p>}
            {selectedAccessories.length > 0 && (
              <p><strong>Accessories:</strong> {selectedAccessories.join(', ')}</p>
            )}
          </div>
        </Card>
        
        {/* Customization Options Panel */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="style" value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid grid-cols-5 mb-6">
                <TabsTrigger value="style">Style</TabsTrigger>
                <TabsTrigger value="hair">Hair</TabsTrigger>
                <TabsTrigger value="face">Face</TabsTrigger>
                <TabsTrigger value="outfit">Outfit</TabsTrigger>
                <TabsTrigger value="extras">Extras</TabsTrigger>
              </TabsList>
              
              {/* Art Style Tab */}
              <TabsContent value="style" className="mb-6">
                <FormField
                  control={form.control}
                  name="characterStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold mb-3">Art Style</FormLabel>
                      <FormControl>
                        <RadioGroup 
                          onValueChange={field.onChange} 
                          value={field.value}
                          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
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
                            <div key={style.value} className="character-option">
                              <RadioGroupItem 
                                value={style.value} 
                                id={`style-${style.value}`} 
                                className="sr-only" 
                              />
                              <label
                                htmlFor={`style-${style.value}`}
                                className={`block cursor-pointer border-2 rounded-xl overflow-hidden transition-all ${
                                  field.value === style.value ? 'border-[#FF6B6B] shadow-lg' : 'border-gray-200'
                                }`}
                              >
                                <img 
                                  src={style.image} 
                                  alt={`${style.label} style character`} 
                                  className="w-full h-32 object-cover" 
                                />
                                <div className="p-2 text-center">
                                  <h5 className="font-bold">{style.label}</h5>
                                </div>
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="mt-6 flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={onPrev}
                  >
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    className="bg-[#FF6B6B] text-white" 
                    onClick={() => setCurrentTab("hair")}
                  >
                    Next: Hair
                  </Button>
                </div>
              </TabsContent>
              
              {/* Hair Tab */}
              <TabsContent value="hair" className="mb-6">
                <div className="grid grid-cols-1 gap-6 mb-6">
                  <FormField
                    control={form.control}
                    name="hairStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold mb-3">Hair Style</FormLabel>
                        <FormControl>
                          <RadioGroup 
                            onValueChange={field.onChange} 
                            value={field.value}
                            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                          >
                            {[
                              {
                                value: "short",
                                label: "Short",
                                image: "https://images.unsplash.com/photo-1575378562156-ee80143d06e2?w=100&h=100&fit=crop",
                              },
                              {
                                value: "long",
                                label: "Long",
                                image: "https://images.unsplash.com/photo-1554804955-c001d118f298?w=100&h=100&fit=crop",
                              },
                              {
                                value: "curly",
                                label: "Curly",
                                image: "https://images.unsplash.com/photo-1580492487771-9363af6c2384?w=100&h=100&fit=crop",
                              },
                              {
                                value: "wavy",
                                label: "Wavy",
                                image: "https://images.unsplash.com/photo-1604030330898-3f6473a31d0b?w=100&h=100&fit=crop",
                              },
                            ].map((hair) => (
                              <div key={hair.value} className="hair-option">
                                <RadioGroupItem 
                                  value={hair.value} 
                                  id={`hair-${hair.value}`} 
                                  className="sr-only" 
                                />
                                <label
                                  htmlFor={`hair-${hair.value}`}
                                  className={`block cursor-pointer border-2 rounded-xl overflow-hidden transition-all ${
                                    field.value === hair.value ? 'border-[#FF6B6B] shadow-lg' : 'border-gray-200'
                                  }`}
                                >
                                  <img 
                                    src={hair.image} 
                                    alt={`${hair.label} hair`} 
                                    className="w-full h-24 object-cover" 
                                  />
                                  <div className="p-2 text-center">
                                    <h5 className="font-medium">{hair.label}</h5>
                                  </div>
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
                    name="hairColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold mb-3">Hair Color</FormLabel>
                        <FormControl>
                          <RadioGroup 
                            onValueChange={field.onChange} 
                            value={field.value}
                            className="grid grid-cols-3 sm:grid-cols-6 gap-4"
                          >
                            {[
                              {
                                value: "blonde",
                                label: "Blonde",
                                color: "bg-yellow-300",
                              },
                              {
                                value: "brown",
                                label: "Brown",
                                color: "bg-amber-700",
                              },
                              {
                                value: "black",
                                label: "Black",
                                color: "bg-gray-900",
                              },
                              {
                                value: "red",
                                label: "Red",
                                color: "bg-red-600",
                              },
                              {
                                value: "gray",
                                label: "Gray",
                                color: "bg-gray-400",
                              },
                              {
                                value: "colorful",
                                label: "Colorful",
                                color: "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500",
                              },
                            ].map((color) => (
                              <div key={color.value} className="color-option">
                                <RadioGroupItem 
                                  value={color.value} 
                                  id={`hair-color-${color.value}`} 
                                  className="sr-only" 
                                />
                                <label
                                  htmlFor={`hair-color-${color.value}`}
                                  className="flex flex-col items-center cursor-pointer"
                                >
                                  <div 
                                    className={`w-12 h-12 rounded-full ${color.color} border-2 hover:border-[#FF6B6B] ${
                                      field.value === color.value ? 'border-[#FF6B6B]' : 'border-transparent'
                                    }`}
                                  ></div>
                                  <span className="mt-1 text-xs">{color.label}</span>
                                </label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-6 flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setCurrentTab("style")}
                  >
                    Previous
                  </Button>
                  <Button 
                    type="button" 
                    className="bg-[#FF6B6B] text-white" 
                    onClick={() => setCurrentTab("face")}
                  >
                    Next: Face
                  </Button>
                </div>
              </TabsContent>
              
              {/* Face Tab */}
              <TabsContent value="face" className="mb-6">
                <div className="grid grid-cols-1 gap-6 mb-6">
                  <FormField
                    control={form.control}
                    name="skinTone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold mb-3">Skin Tone</FormLabel>
                        <FormControl>
                          <RadioGroup 
                            onValueChange={field.onChange} 
                            value={field.value}
                            className="flex flex-wrap gap-4 justify-center"
                          >
                            {[
                              { value: "light", color: "bg-amber-200", label: "Light" },
                              { value: "medium", color: "bg-amber-400", label: "Medium" },
                              { value: "tan", color: "bg-amber-600", label: "Tan" },
                              { value: "dark", color: "bg-amber-900", label: "Dark" },
                            ].map((skin) => (
                              <div key={skin.value} className="skin-option text-center">
                                <RadioGroupItem 
                                  value={skin.value} 
                                  id={`skin-${skin.value}`} 
                                  className="sr-only" 
                                />
                                <label
                                  htmlFor={`skin-${skin.value}`}
                                  className="flex flex-col items-center cursor-pointer"
                                >
                                  <div 
                                    className={`w-16 h-16 rounded-full ${skin.color} border-2 hover:border-[#FF6B6B] ${
                                      field.value === skin.value ? 'border-[#FF6B6B]' : 'border-transparent'
                                    }`}
                                  ></div>
                                  <span className="mt-1">{skin.label}</span>
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
                    name="eyeColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold mb-3">Eye Color</FormLabel>
                        <FormControl>
                          <RadioGroup 
                            onValueChange={field.onChange} 
                            value={field.value}
                            className="grid grid-cols-3 sm:grid-cols-6 gap-4"
                          >
                            {[
                              {
                                value: "blue",
                                label: "Blue",
                                color: "bg-blue-500",
                              },
                              {
                                value: "brown",
                                label: "Brown",
                                color: "bg-amber-800",
                              },
                              {
                                value: "green",
                                label: "Green",
                                color: "bg-green-600",
                              },
                              {
                                value: "hazel",
                                label: "Hazel",
                                color: "bg-amber-600",
                              },
                              {
                                value: "gray",
                                label: "Gray",
                                color: "bg-gray-500",
                              },
                              {
                                value: "amber",
                                label: "Amber",
                                color: "bg-yellow-600",
                              },
                            ].map((eye) => (
                              <div key={eye.value} className="eye-option">
                                <RadioGroupItem 
                                  value={eye.value} 
                                  id={`eye-${eye.value}`} 
                                  className="sr-only" 
                                />
                                <label
                                  htmlFor={`eye-${eye.value}`}
                                  className="flex flex-col items-center cursor-pointer"
                                >
                                  <div 
                                    className={`w-8 h-8 rounded-full ${eye.color} border-2 hover:border-[#FF6B6B] ${
                                      field.value === eye.value ? 'border-[#FF6B6B]' : 'border-transparent'
                                    }`}
                                  ></div>
                                  <span className="mt-1 text-xs">{eye.label}</span>
                                </label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Facial Features (Select up to 3)</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { id: "freckles", label: "Freckles", image: "https://images.unsplash.com/photo-1573496546038-82f9c39f6365?w=100&h=100&fit=crop" },
                        { id: "dimples", label: "Dimples", image: "https://images.unsplash.com/photo-1563306406-e66174fa3787?w=100&h=100&fit=crop" },
                        { id: "rosy-cheeks", label: "Rosy Cheeks", image: "https://images.unsplash.com/photo-1564746379803-fa9af858b325?w=100&h=100&fit=crop" },
                        { id: "big-smile", label: "Big Smile", image: "https://images.unsplash.com/photo-1568839360312-09f386bd6a02?w=100&h=100&fit=crop" },
                        { id: "round-face", label: "Round Face", image: "https://images.unsplash.com/photo-1544072675-17cd482575e3?w=100&h=100&fit=crop" },
                        { id: "oval-face", label: "Oval Face", image: "https://images.unsplash.com/photo-1593978301851-40c1849d47d4?w=100&h=100&fit=crop" },
                      ].map((feature) => (
                        <div
                          key={feature.id}
                          className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                            selectedFacialFeatures.includes(feature.id) 
                              ? 'border-[#FF6B6B] shadow-md' 
                              : 'border-gray-200'
                          } ${
                            !selectedFacialFeatures.includes(feature.id) && selectedFacialFeatures.length >= 3
                              ? 'opacity-50'
                              : ''
                          }`}
                          onClick={() => handleFacialFeatureSelect(feature.id)}
                        >
                          <img 
                            src={feature.image} 
                            alt={feature.label} 
                            className="w-full h-20 object-cover" 
                          />
                          <div className="p-2 text-center">
                            <p className="text-sm">{feature.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setCurrentTab("hair")}
                  >
                    Previous
                  </Button>
                  <Button 
                    type="button" 
                    className="bg-[#FF6B6B] text-white" 
                    onClick={() => setCurrentTab("outfit")}
                  >
                    Next: Outfit
                  </Button>
                </div>
              </TabsContent>
              
              {/* Outfit Tab */}
              <TabsContent value="outfit" className="mb-6">
                <FormField
                  control={form.control}
                  name="clothingStyle"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel className="text-lg font-semibold mb-3">Clothing Style</FormLabel>
                      <FormControl>
                        <RadioGroup 
                          onValueChange={field.onChange} 
                          value={field.value}
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
                        >
                          {[
                            {
                              value: "casual",
                              label: "Casual",
                              image: "https://images.unsplash.com/photo-1604079628040-94301bb21b91?w=150&h=150&fit=crop",
                            },
                            {
                              value: "sporty",
                              label: "Sporty",
                              image: "https://images.unsplash.com/photo-1606902965551-dce093cda6e7?w=150&h=150&fit=crop",
                            },
                            {
                              value: "formal",
                              label: "Formal",
                              image: "https://images.unsplash.com/photo-1546215307-57d81716a1b9?w=150&h=150&fit=crop",
                            },
                            {
                              value: "fantasy",
                              label: "Fantasy",
                              image: "https://images.unsplash.com/photo-1578632292113-dec9c32d0cd6?w=150&h=150&fit=crop",
                            },
                            {
                              value: "adventure",
                              label: "Adventure",
                              image: "https://images.unsplash.com/photo-1587064712777-9767363caa82?w=150&h=150&fit=crop",
                            },
                          ].map((style) => (
                            <div key={style.value} className="outfit-option">
                              <RadioGroupItem 
                                value={style.value} 
                                id={`outfit-${style.value}`} 
                                className="sr-only" 
                              />
                              <label
                                htmlFor={`outfit-${style.value}`}
                                className={`block cursor-pointer border-2 rounded-xl overflow-hidden transition-all ${
                                  field.value === style.value ? 'border-[#FF6B6B] shadow-lg' : 'border-gray-200'
                                }`}
                              >
                                <img 
                                  src={style.image} 
                                  alt={`${style.label} outfit`} 
                                  className="w-full h-28 object-cover" 
                                />
                                <div className="p-2 text-center">
                                  <h5 className="font-medium">{style.label}</h5>
                                </div>
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="mb-6">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold mb-3">Character Build</FormLabel>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <FormControl>
                              <RadioGroup 
                                onValueChange={field.onChange} 
                                value={field.value}
                                className="flex gap-3"
                              >
                                {[
                                  { value: "short", label: "Short" },
                                  { value: "average", label: "Average" },
                                  { value: "tall", label: "Tall" },
                                ].map((height) => (
                                  <div key={height.value} className="relative">
                                    <RadioGroupItem 
                                      value={height.value} 
                                      id={`height-${height.value}`} 
                                      className="sr-only" 
                                    />
                                    <label
                                      htmlFor={`height-${height.value}`}
                                      className={`flex items-center p-2 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                                        field.value === height.value ? 'border-[#FF6B6B] bg-gray-50' : 'border-gray-200'
                                      }`}
                                    >
                                      <span>{height.label}</span>
                                    </label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="buildType"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <RadioGroup 
                                    onValueChange={field.onChange} 
                                    value={field.value}
                                    className="flex gap-3"
                                  >
                                    {[
                                      { value: "slim", label: "Slim" },
                                      { value: "average", label: "Average" },
                                      { value: "athletic", label: "Athletic" },
                                    ].map((build) => (
                                      <div key={build.value} className="relative">
                                        <RadioGroupItem 
                                          value={build.value} 
                                          id={`build-${build.value}`} 
                                          className="sr-only" 
                                        />
                                        <label
                                          htmlFor={`build-${build.value}`}
                                          className={`flex items-center p-2 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                                            field.value === build.value ? 'border-[#FF6B6B] bg-gray-50' : 'border-gray-200'
                                          }`}
                                        >
                                          <span>{build.label}</span>
                                        </label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-6 flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setCurrentTab("face")}
                  >
                    Previous
                  </Button>
                  <Button 
                    type="button" 
                    className="bg-[#FF6B6B] text-white" 
                    onClick={() => setCurrentTab("extras")}
                  >
                    Next: Extras
                  </Button>
                </div>
              </TabsContent>
              
              {/* Extras Tab */}
              <TabsContent value="extras" className="mb-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Accessories (Select up to 3)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: "glasses", label: "Glasses", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100&h=100&fit=crop" },
                      { id: "hat", label: "Hat", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=100&h=100&fit=crop" },
                      { id: "backpack", label: "Backpack", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100&h=100&fit=crop" },
                      { id: "watch", label: "Watch", image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=100&h=100&fit=crop" },
                      { id: "necklace", label: "Necklace", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=100&h=100&fit=crop" },
                      { id: "scarf", label: "Scarf", image: "https://images.unsplash.com/photo-1520903302377-d100e9df333d?w=100&h=100&fit=crop" },
                    ].map((accessory) => (
                      <div
                        key={accessory.id}
                        className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                          selectedAccessories.includes(accessory.id) 
                            ? 'border-[#FF6B6B] shadow-md' 
                            : 'border-gray-200'
                        } ${
                          !selectedAccessories.includes(accessory.id) && selectedAccessories.length >= 3
                            ? 'opacity-50'
                            : ''
                        }`}
                        onClick={() => handleAccessorySelect(accessory.id)}
                      >
                        <img 
                          src={accessory.image} 
                          alt={accessory.label} 
                          className="w-full h-20 object-cover" 
                        />
                        <div className="p-2 text-center">
                          <p className="text-sm">{accessory.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setCurrentTab("outfit")}
                  >
                    Previous
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-[#FF6B6B] to-[#FFE66D] text-white">
                    Next: Story Settings
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
    </div>
  );
}