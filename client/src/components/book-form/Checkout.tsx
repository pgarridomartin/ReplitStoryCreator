import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient"; 
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckoutRequest } from "@shared/schema";

interface CheckoutProps {
  generatedStory: {
    title: string;
    content: string;
    coverImageUrl: string;
    previewImages: string[];
    bookId?: number;
  } | null;
  bookFormat: 'hardcover' | 'digital';
  onPrev: () => void;
}

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  paymentMethod: z.enum(["credit-card", "paypal"]),
  cardNumber: z.string().optional(),
  expiry: z.string().optional(),
  cvc: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Checkout({ generatedStory, bookFormat, onPrev }: CheckoutProps) {
  const [orderComplete, setOrderComplete] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      paymentMethod: "credit-card",
      cardNumber: "",
      expiry: "",
      cvc: "",
    },
  });
  
  const price = bookFormat === 'hardcover' ? '$29.99' : '$14.99';
  
  const checkoutMutation = useMutation({
    mutationFn: async (data: CheckoutRequest) => {
      const res = await apiRequest('POST', '/api/orders', data);
      return res.json();
    },
    onSuccess: () => {
      setOrderComplete(true);
      toast({
        title: "Order placed successfully!",
        description: bookFormat === 'digital' 
          ? "Your digital book is ready for download." 
          : "Your book will be shipped within 3-5 business days.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error placing order",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (values: FormValues) => {
    if (!generatedStory?.bookId) {
      toast({
        title: "Error placing order",
        description: "Book information is missing. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    const checkoutData: CheckoutRequest = {
      bookId: generatedStory.bookId,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      format: bookFormat,
      total: bookFormat === 'hardcover' ? '29.99' : '14.99',
      address: values.address,
      city: values.city,
      state: values.state,
      zip: values.zip,
    };
    
    checkoutMutation.mutate(checkoutData);
  };
  
  if (orderComplete) {
    return (
      <div className="text-center py-10">
        <div className="inline-block bg-[#6BCB77] text-white p-4 rounded-full mb-6">
          <i className="ri-check-line text-5xl"></i>
        </div>
        <h3 className="text-2xl font-bold font-heading mb-4">Order Complete!</h3>
        <p className="mb-4">Thank you for your purchase.</p>
        {bookFormat === 'digital' ? (
          <Button className="bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-lg">
            Download Your Book
          </Button>
        ) : (
          <p>
            Your book will be shipped within 3-5 business days.<br />
            A confirmation email has been sent to your email address.
          </p>
        )}
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-bold font-heading mb-6">Complete Your Order</h3>
        
        <div className="mb-6 bg-[#F8F9FA] p-4 rounded-lg">
          <h4 className="font-bold mb-2">Order Summary</h4>
          <div className="flex justify-between mb-2">
            <span>Personalized Book: "{generatedStory?.title || 'Custom Story'}"</span>
            <span>{price}</span>
          </div>
          <div className="flex justify-between mb-2 text-sm text-gray-500">
            <span>Format: {bookFormat === 'hardcover' ? 'Hardcover' : 'Digital PDF'}</span>
          </div>
          <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>{price}</span>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Contact Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block mb-1 text-sm font-medium">First Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block mb-1 text-sm font-medium">Last Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel className="block mb-1 text-sm font-medium">Email</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    type="email" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {bookFormat === 'hardcover' && (
            <div id="shipping-info" className="mb-4">
              <h4 className="font-semibold mb-3">Shipping Information</h4>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel className="block mb-1 text-sm font-medium">Address</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block mb-1 text-sm font-medium">City</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block mb-1 text-sm font-medium">State</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block mb-1 text-sm font-medium">ZIP Code</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <h4 className="font-semibold mb-3">Payment Method</h4>
            <div className="border border-gray-200 rounded-lg p-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-wrap gap-4 mb-4"
                      >
                        <div className="flex items-center">
                          <RadioGroupItem value="credit-card" id="credit-card" className="mr-2" />
                          <label htmlFor="credit-card">Credit Card</label>
                        </div>
                        <div className="flex items-center">
                          <RadioGroupItem value="paypal" id="paypal" className="mr-2" />
                          <label htmlFor="paypal">PayPal</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch("paymentMethod") === "credit-card" && (
                <div id="credit-card-fields">
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="block mb-1 text-sm font-medium">Card Number</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="**** **** **** ****" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="expiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="block mb-1 text-sm font-medium">Expiration Date</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="MM/YY" 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="cvc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block mb-1 text-sm font-medium">CVC</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              placeholder="***" 
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button
            type="button"
            onClick={onPrev}
            variant="outline"
            disabled={checkoutMutation.isPending}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-8 rounded-lg inline-flex items-center transition-all"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            <span>Previous</span>
          </Button>
          
          <Button
            type="submit"
            disabled={checkoutMutation.isPending}
            className="bg-[#6BCB77] hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center transition-all"
          >
            {checkoutMutation.isPending ? (
              <>
                <span>Processing...</span>
                <i className="ri-loader-4-line ml-2 animate-spin"></i>
              </>
            ) : (
              <>
                <span>Complete Purchase</span>
                <i className="ri-check-line ml-2"></i>
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
