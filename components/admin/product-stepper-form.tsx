"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, PlusCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { useToast } from "@/hooks/use-toast";

type ProductData = {
  name: string;
  brand: string;
  category: string;
  description: string;
  features: string[];
  regularPrice: string;
  salePrice: string;
  sku: string;
  stock: string;
  availability: string;
  technicalSpecifications: { key: string; value: string }[];
  hardwareSpecifications: { key: string; value: string }[];
  options: { name: string; values: string }[];
  imageUrl: string | null;
};

const steps = [
  { id: 1, name: "Product Identity" },
  { id: 2, name: "Commercial Details" },
  { id: 3, name: "Advanced Details" },
  { id: 4, name: "Review & Submit" },
];

const initialProductState = {
  name: "",
  brand: "",
  category: "",
  description: "",
  features: [""],
  regularPrice: "",
  salePrice: "",
  sku: "",
  stock: "",
  availability: "in-stock",
  technicalSpecifications: [{ key: "", value: "" }],
  hardwareSpecifications: [{ key: "", value: "" }],
  options: [{ name: "", values: "" }],
  imageUrl: null as string | null,
};

export function ProductStepperForm({ product, onSubmit, isSubmitting }: { product: any | null; onSubmit: (data: any) => void; isSubmitting: boolean; }) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [productData, setProductData] = useState<ProductData>(initialProductState);
  const [errors, setErrors] = useState<any>({});
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
        setProductData((prev) => ({ ...prev, imageUrl: data.url }));
      } else {
        console.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const validateStep = (step: number) => {
    const newErrors: any = {};
    if (step === 1) {
      if (!productData.name) newErrors.name = "Product name is required.";
      if (!productData.brand) newErrors.brand = "Brand is required.";
      if (!productData.category) newErrors.category = "Category is required.";
      if (!productData.description) newErrors.description = "Description is required.";
    }
    if (step === 2) {
      if (!productData.regularPrice) newErrors.regularPrice = "Regular price is required.";
      if (!productData.stock) newErrors.stock = "Stock quantity is required.";
      if (!productData.sku) newErrors.sku = "SKU is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  useEffect(() => {
    if (product) {
      const parsedFeatures = product.features ? JSON.parse(product.features) : [""];
      const parsedTechSpecs = product.technicalSpecifications ? JSON.parse(product.technicalSpecifications) : [{ key: "", value: "" }];
      const parsedHardwareSpecs = product.hardwareSpecifications ? JSON.parse(product.hardwareSpecifications) : [{ key: "", value: "" }];
      const parsedOptions = product.options ? JSON.parse(product.options) : [{ name: "", values: "" }];

      setProductData({
        name: product.name || "",
        brand: product.brand || "",
        category: product.category || "",
        description: product.description || "",
        features: parsedFeatures,
        regularPrice: product.regularPrice || "",
        salePrice: product.salePrice || "",
        sku: product.sku || "",
        stock: product.stock || "",
        availability: product.availability || "in-stock",
        technicalSpecifications: parsedTechSpecs,
        hardwareSpecifications: parsedHardwareSpecs,
        options: parsedOptions,
        imageUrl: product.imageUrl || null,
      });
      setImageUrl(product.imageUrl || null);
      setCurrentStep(1);
    } else {
      setProductData(initialProductState);
      setImageUrl(null);
      setCurrentStep(1);
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProductData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setProductData((prev) => ({ ...prev, [id]: value }));
  };

  type DynamicList = 'features' | 'technicalSpecifications' | 'hardwareSpecifications' | 'options';

  const handleDynamicListChange = (listName: DynamicList, index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const list = [...productData[listName]];
    if (listName === 'features') {
        // @ts-ignore
        list[index] = value;
    } else {
        // @ts-ignore
        list[index][name] = value;
    }
    // @ts-ignore
    setProductData(prev => ({ ...prev, [listName]: list }));
  };

  const addDynamicListItem = (listName: DynamicList) => {
    const list = [...productData[listName]];
    const newItem = listName === 'features' ? "" : (listName === 'technicalSpecifications' || listName === 'hardwareSpecifications') ? { key: "", value: "" } : { name: "", values: "" };
    // @ts-ignore
    list.push(newItem);
    // @ts-ignore
    setProductData(prev => ({ ...prev, [listName]: list }));
  };

  const removeDynamicListItem = (listName: DynamicList, index: number) => {
    const list = [...productData[listName]];
    if (list.length > 1) {
        list.splice(index, 1);
        // @ts-ignore
        setProductData(prev => ({ ...prev, [listName]: list }));
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      currentStep < steps.length && setCurrentStep(currentStep + 1);
    }
  };
  const handlePrev = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const handleFormSubmit = async () => {
    if (validateStep(1) && validateStep(2)) {
      try {
        await onSubmit(productData);
        toast({ title: "Success", description: "Product submitted successfully." });
        resetForm();
      } catch (error) {
        toast({ title: "Error", description: "Failed to submit product.", variant: "destructive" });
      }
    } else {
      // Find the first step with an error and go to it
      for (let i = 1; i <= steps.length; i++) {
        if (!validateStep(i)) {
          setCurrentStep(i);
          break;
        }
      }
    }
  };

  const resetForm = () => {
    setProductData(initialProductState);
    setCurrentStep(1);
    setErrors({});
  };

  return (
    <Card>
      <CardHeader>
        {product ? (
          <div>
            <CardTitle className="mb-1">Edit Product</CardTitle>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-primary">{product.name}</p>
              <Badge variant="outline">ID: {product.id}</Badge>
            </div>
          </div>
        ) : (
          <CardTitle>Add New Product</CardTitle>
        )}
        <CardDescription>Follow the steps to manage your product details.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-y-auto max-h-[60vh] pr-4">
        {/* Stepper Indicator */}
        <div className="flex items-start mb-8">
          {steps.map((step, index) => (
            <>
              <div key={step.id} className="flex flex-col items-center w-32 text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${ 
                    currentStep > step.id ? "bg-green-500 text-white" : currentStep === step.id ? "bg-primary text-primary-foreground" : "bg-gray-200 dark:bg-gray-700"
                  }`}>
                  {currentStep > step.id ? "✓" : step.id}
                </div>
                <p className={`text-sm mt-2 font-medium ${currentStep >= step.id ? "text-primary" : "text-muted-foreground"}`}>
                  {step.name}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-5" />
              )}
            </>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6 min-h-[350px]">
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Core Details */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="text-lg font-medium">Core Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Product Name <span className="text-red-500">*</span></Label>
                    <Input id="name" value={productData.name} onChange={handleInputChange} />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="brand">Brand <span className="text-red-500">*</span></Label>
                    <Input id="brand" value={productData.brand} onChange={handleInputChange} />
                    {errors.brand && <p className="text-red-500 text-sm">{errors.brand}</p>}
                  </div>
                </div>
                                <div className="grid gap-2">
                  <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                  <Select onValueChange={(v) => handleSelectChange('category', v)} value={productData.category}>
                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="biometric">Biometric Devices</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="computers">Computers & Peripherals</SelectItem>
                      <SelectItem value="surveillance">Surveillance Solutions</SelectItem>
                      <SelectItem value="networking">Networking Equipment</SelectItem>
                      <SelectItem value="printers">Printers</SelectItem>
                      <SelectItem value="rd-service">RD Service</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                </div>
                                <div className="grid gap-2">
                  <Label htmlFor="description">Short Description <span className="text-red-500">*</span></Label>
                  <Textarea id="description" value={productData.description} onChange={handleInputChange} />
                  {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                </div>
                <div>
                  <Label>Key Features</Label>
                  {productData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <Input value={feature} onChange={(e) => handleDynamicListChange('features', index, e)} />
                      {productData.features.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeDynamicListItem('features', index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addDynamicListItem('features')}><PlusCircle className="h-4 w-4 mr-2" />Add Feature</Button>
                </div>
              </div>
              {/* Media & Downloads */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="text-lg font-medium">Media & Downloads</h3>
                <div>
                  <Label>Main Product Image</Label>
                  {imageUrl ? (
                    <div className="relative h-48 w-full">
                      <img src={imageUrl} alt="Uploaded product image" className="h-full w-full object-contain" />
                      <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => { setImageUrl(null); setProductData(prev => ({ ...prev, imageUrl: null })); }}>
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag & drop</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} />
                      </label>
                    </div>
                  )}
                </div>
                <div><Label>Image Gallery</Label><div className="flex items-center justify-center w-full"><label htmlFor="dropzone-gallery" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"><div className="flex flex-col items-center justify-center pt-5 pb-6"><UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" /><p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload multiple images</span></p></div><input id="dropzone-gallery" type="file" multiple className="hidden" /></label></div></div>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="text-lg font-medium">Commercial Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="regularPrice">Regular Price (₹) <span className="text-red-500">*</span></Label>
                        <Input id="regularPrice" type="number" value={productData.regularPrice} onChange={handleInputChange} />
                        {errors.regularPrice && <p className="text-red-500 text-sm">{errors.regularPrice}</p>}
                    </div>
                    <div className="grid gap-2"><Label htmlFor="salePrice">Sale Price (₹)</Label><Input id="salePrice" type="number" value={productData.salePrice} onChange={handleInputChange} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="stock">Stock Quantity <span className="text-red-500">*</span></Label>
                        <Input id="stock" type="number" value={productData.stock} onChange={handleInputChange} />
                        {errors.stock && <p className="text-red-500 text-sm">{errors.stock}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sku">SKU <span className="text-red-500">*</span></Label>
                        <Input id="sku" value={productData.sku} onChange={handleInputChange} />
                        {errors.sku && <p className="text-red-500 text-sm">{errors.sku}</p>}
                    </div>
                </div>
                <div className="grid gap-2"><Label htmlFor="availability">Availability</Label><Select onValueChange={(v) => handleSelectChange('availability', v)} value={productData.availability}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="in-stock">In Stock</SelectItem><SelectItem value="out-of-stock">Out of Stock</SelectItem><SelectItem value="pre-order">Pre-order</SelectItem></SelectContent></Select></div>
            </div>
          )}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="text-lg font-medium">Technical Specifications</h3>
                {productData.technicalSpecifications.map((spec, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2 mb-2 items-center">
                    <Input name="key" placeholder="Specification Name (e.g., Resolution)" value={spec.key} onChange={(e) => handleDynamicListChange('technicalSpecifications', index, e)} />
                    <div className="flex items-center gap-2">
                      <Input name="value" placeholder="Value (e.g., 500 DPI)" value={spec.value} onChange={(e) => handleDynamicListChange('technicalSpecifications', index, e)} />
                      {productData.technicalSpecifications.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeDynamicListItem('technicalSpecifications', index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>}
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addDynamicListItem('technicalSpecifications')}><PlusCircle className="h-4 w-4 mr-2" />Add Technical Spec</Button>
              </div>
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="text-lg font-medium">Hardware Specifications</h3>
                {productData.hardwareSpecifications.map((spec, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2 mb-2 items-center">
                    <Input name="key" placeholder="Specification Name (e.g., Dimensions)" value={spec.key} onChange={(e) => handleDynamicListChange('hardwareSpecifications', index, e)} />
                    <div className="flex items-center gap-2">
                      <Input name="value" placeholder="Value (e.g., 66 x 66 x 38 mm)" value={spec.value} onChange={(e) => handleDynamicListChange('hardwareSpecifications', index, e)} />
                      {productData.hardwareSpecifications.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeDynamicListItem('hardwareSpecifications', index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>}
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addDynamicListItem('hardwareSpecifications')}><PlusCircle className="h-4 w-4 mr-2" />Add Hardware Spec</Button>
              </div>
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="text-lg font-medium">Product Options</h3>
                {productData.options.map((option, index) => (
                  <div key={index} className="p-4 border rounded-lg mb-2 bg-muted/50">
                    <div className="grid grid-cols-2 gap-2 mb-2 items-center">
                        <Input name="name" placeholder="Option Name (e.g., Warranty)" value={option.name} onChange={(e) => handleDynamicListChange('options', index, e)} />
                        <Input name="values" placeholder="Values (comma-separated, e.g., 1 Year, 2 Years)" value={option.values} onChange={(e) => handleDynamicListChange('options', index, e)} />
                    </div>
                    {productData.options.length > 1 && <Button variant="ghost" size="sm" onClick={() => removeDynamicListItem('options', index)}><Trash2 className="h-4 w-4 mr-2 text-red-500" />Remove Option</Button>}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addDynamicListItem('options')}><PlusCircle className="h-4 w-4 mr-2" />Add Option</Button>
              </div>
            </div>
          )}
          {currentStep === 4 && (
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Review Your Product</h3>
                <div className="p-4 border rounded-lg space-y-1 bg-muted/50">
                    <p><strong>Name:</strong> {productData.name || "-"}</p>
                    <p><strong>Brand:</strong> {productData.brand || "-"}</p>
                    <p><strong>Category:</strong> {productData.category || "-"}</p>
                    <p><strong>Regular Price:</strong> ₹{productData.regularPrice || "0"}</p>
                    <p><strong>Sale Price:</strong> ₹{productData.salePrice || "0"}</p>
                    <p><strong>Stock:</strong> {productData.stock || "0"}</p>
                    <p><strong>Availability:</strong> {productData.availability || "-"}</p>
                    <p><strong>SKU:</strong> {productData.sku || "-"}</p>
                    <h4 className="font-medium pt-2">Features:</h4>
                    <ul className="list-disc list-inside pl-4">{productData.features.map((f,i) => f && <li key={i}>{f}</li>)}</ul>
                    <h4 className="font-medium pt-2">Technical Specifications:</h4>
                    <ul className="list-disc list-inside pl-4">{productData.technicalSpecifications.map((s,i) => s.key && <li key={i}>{s.key}: {s.value}</li>)}</ul>
                    <h4 className="font-medium pt-2">Hardware Specifications:</h4>
                    <ul className="list-disc list-inside pl-4">{productData.hardwareSpecifications.map((s,i) => s.key && <li key={i}>{s.key}: {s.value}</li>)}</ul>
                    <h4 className="font-medium pt-2">Options:</h4>
                    <ul className="list-disc list-inside pl-4">{productData.options.map((o,i) => o.name && <li key={i}>{o.name}: {o.values}</li>)}</ul>
                </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between mt-6 border-t pt-4">
        <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1}>Previous</Button>
        {currentStep < steps.length ? <Button onClick={handleNext}>Next Step</Button> : <Button onClick={handleFormSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">{isSubmitting ? 'Submitting...' : 'Submit Product'}</Button>}
      </CardFooter>
    </Card>
  );
}
