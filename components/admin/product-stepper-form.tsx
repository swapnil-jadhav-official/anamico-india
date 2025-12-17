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
import { Badge } from "@/components/ui/badge";
import { CloudUploadOutlined, PlusCircleOutlined, DeleteOutlined, CloseOutlined, EyeOutlined, ClearOutlined } from "@ant-design/icons";
import { ProductPreviewModal } from "./product-preview-modal";

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
  taxPercentage: string;
  technicalSpecifications: { key: string; value: string }[];
  hardwareSpecifications: { key: string; value: string }[];
  options: { name: string; values: string }[];
  imageUrl: string | null;
  galleryImages: string[]; // Multiple product images
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
  taxPercentage: "18",
  technicalSpecifications: [{ key: "", value: "" }],
  hardwareSpecifications: [{ key: "", value: "" }],
  options: [{ name: "", values: "" }],
  imageUrl: null as string | null,
  galleryImages: [] as string[],
};

export function ProductStepperForm({ product, onSubmit, isSubmitting }: { product: any | null; onSubmit: (data: any) => void; isSubmitting: boolean; }) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [productData, setProductData] = useState<ProductData>(initialProductState);
  const [errors, setErrors] = useState<any>({});
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showProductPreview, setShowProductPreview] = useState(false);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
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
        toast({ title: "Success", description: "Main image uploaded successfully" });
      } else {
        const error = await res.json();
        toast({ title: "Error", description: error.error || "Failed to upload image", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: "Error", description: "Error uploading image", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    // Max 4 gallery images + 1 main = 5 total
    const MAX_TOTAL_IMAGES = 5;
    const MAX_GALLERY_IMAGES = 4;
    const currentTotalImages = (imageUrl ? 1 : 0) + productData.galleryImages.length;
    const remainingSlots = MAX_TOTAL_IMAGES - currentTotalImages;

    if (remainingSlots <= 0) {
      toast({
        title: "Limit Reached",
        description: `Maximum ${MAX_TOTAL_IMAGES} images allowed (1 main + 4 gallery)`,
        variant: "destructive"
      });
      return;
    }

    if (files.length > remainingSlots) {
      toast({
        title: "Too Many Images",
        description: `You can only add ${remainingSlots} more image(s). Maximum is ${MAX_TOTAL_IMAGES} total.`,
        variant: "destructive"
      });
      return;
    }

    setUploadingGallery(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          uploadedUrls.push(data.url);
        } else {
          const error = await res.json();
          toast({
            title: "Warning",
            description: `Failed to upload ${file.name}: ${error.error}`,
            variant: "destructive"
          });
        }
      }

      if (uploadedUrls.length > 0) {
        setProductData((prev) => ({
          ...prev,
          galleryImages: [...prev.galleryImages, ...uploadedUrls]
        }));
        toast({
          title: "Success",
          description: `${uploadedUrls.length} image(s) uploaded successfully`
        });
      }
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      toast({ title: "Error", description: "Error uploading gallery images", variant: "destructive" });
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setProductData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
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
      const parsedGalleryImages = product.galleryImages ? JSON.parse(product.galleryImages) : [];

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
        taxPercentage: String(product.taxPercentage || "18"),
        technicalSpecifications: parsedTechSpecs,
        hardwareSpecifications: parsedHardwareSpecs,
        options: parsedOptions,
        imageUrl: product.imageUrl || null,
        galleryImages: parsedGalleryImages,
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
                      {productData.features.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeDynamicListItem('features', index)}><DeleteOutlined style={{ color: '#ef4444' }} /></Button>}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addDynamicListItem('features')}><PlusCircleOutlined style={{ marginRight: '4px' }} />Add Feature</Button>
                </div>
              </div>
              {/* Media & Downloads */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="text-lg font-medium">Media & Downloads</h3>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Main Product Image</Label>
                    {imageUrl && <Badge className="bg-green-600">✓ Uploaded</Badge>}
                  </div>
                  {imageUrl ? (
                    <div className="relative group overflow-hidden rounded-lg h-48 w-full border-2 border-green-300 dark:border-green-800 cursor-pointer" onClick={() => { setPreviewImage(imageUrl); setShowPreviewModal(true); }}>
                      <img src={imageUrl} alt="Uploaded product image" className="h-full w-full object-contain bg-gray-100 dark:bg-gray-900 group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(imageUrl);
                            setShowPreviewModal(true);
                          }}
                        >
                          <EyeOutlined style={{ marginRight: '4px' }} /> Preview
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageUrl(null);
                            setProductData(prev => ({ ...prev, imageUrl: null }));
                            toast({ title: "Removed", description: "Main image removed" });
                          }}
                          disabled={uploading}
                        >
                          <DeleteOutlined style={{ marginRight: '4px' }} /> Remove
                        </Button>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs rounded px-2 py-1">
                        Main Image
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="dropzone-file"
                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <CloudUploadOutlined style={{ fontSize: '32px', marginBottom: '8px', color: '#888' }} />
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag & drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP, GIF up to 5MB</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">This will be your product cover image</p>
                        </div>
                        <input
                          id="dropzone-file"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  )}
                  {uploading && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                      <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <span className="inline-block animate-spin">⟳</span> Uploading main image...
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Gallery Images (Optional)</Label>
                    <Badge variant="outline" className="text-xs">
                      {(imageUrl ? 1 : 0) + productData.galleryImages.length} / 5 Total
                    </Badge>
                  </div>

                  {/* Remaining slots indicator */}
                  <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <span className="font-medium">Remaining slots:</span> {5 - ((imageUrl ? 1 : 0) + productData.galleryImages.length)} / 5 images max (1 main + 4 gallery)
                    </p>
                  </div>

                  {/* Upload area - disabled if limit reached */}
                  {(imageUrl ? 1 : 0) + productData.galleryImages.length < 5 && (
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="dropzone-gallery" className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-all ${uploadingGallery ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <CloudUploadOutlined style={{ fontSize: '32px', marginBottom: '8px', color: '#888' }} />
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag & drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP, GIF up to 5MB each</p>
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Add up to {5 - ((imageUrl ? 1 : 0) + productData.galleryImages.length)} more image(s)</p>
                        </div>
                        <input
                          id="dropzone-gallery"
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files && handleGalleryUpload(e.target.files)}
                          disabled={uploadingGallery || (imageUrl ? 1 : 0) + productData.galleryImages.length >= 5}
                        />
                      </label>
                    </div>
                  )}

                  {uploadingGallery && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                      <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <span className="inline-block animate-spin">⟳</span> Uploading images...
                      </p>
                    </div>
                  )}

                  {/* Display uploaded gallery images with enhanced UI */}
                  {productData.galleryImages.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm">Gallery Preview ({productData.galleryImages.length})</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setProductData(prev => ({ ...prev, galleryImages: [] }));
                            toast({ title: "Cleared", description: "All gallery images removed" });
                          }}
                          className="text-xs h-7"
                        >
                          <ClearOutlined style={{ marginRight: '4px' }} /> Clear All
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {productData.galleryImages.map((imgUrl, index) => (
                          <div key={index} className="relative group overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer" onClick={() => { setPreviewImage(imgUrl); setShowPreviewModal(true); }}>
                            <img
                              src={imgUrl}
                              alt={`Gallery ${index + 1}`}
                              className="h-24 w-full object-cover group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewImage(imgUrl);
                                  setShowPreviewModal(true);
                                }}
                              >
                                <EyeOutlined />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeGalleryImage(index);
                                  toast({
                                    title: "Removed",
                                    description: `Image ${index + 1} removed from gallery`
                                  });
                                }}
                              >
                                <DeleteOutlined />
                              </Button>
                            </div>
                            <div className="absolute top-1 left-1 bg-black/60 text-white text-xs rounded px-2 py-1">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(imageUrl ? 1 : 0) + productData.galleryImages.length >= 5 && (
                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        ✓ Maximum images reached (5/5)
                      </p>
                    </div>
                  )}
                </div>
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
                <div className="grid gap-2">
                    <Label htmlFor="taxPercentage">Tax Percentage (%) <span className="text-red-500">*</span></Label>
                    <Input id="taxPercentage" type="number" min="0" max="100" step="0.1" value={productData.taxPercentage} onChange={handleInputChange} placeholder="e.g., 18 for 18% GST" />
                    <p className="text-xs text-muted-foreground">Enter tax percentage applicable to this product (e.g., 18 for 18% GST)</p>
                </div>
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
                      {productData.technicalSpecifications.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeDynamicListItem('technicalSpecifications', index)}><DeleteOutlined style={{ color: '#ef4444' }} /></Button>}
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addDynamicListItem('technicalSpecifications')}><PlusCircleOutlined style={{ marginRight: '4px' }} />Add Technical Spec</Button>
              </div>
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="text-lg font-medium">Hardware Specifications</h3>
                {productData.hardwareSpecifications.map((spec, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2 mb-2 items-center">
                    <Input name="key" placeholder="Specification Name (e.g., Dimensions)" value={spec.key} onChange={(e) => handleDynamicListChange('hardwareSpecifications', index, e)} />
                    <div className="flex items-center gap-2">
                      <Input name="value" placeholder="Value (e.g., 66 x 66 x 38 mm)" value={spec.value} onChange={(e) => handleDynamicListChange('hardwareSpecifications', index, e)} />
                      {productData.hardwareSpecifications.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeDynamicListItem('hardwareSpecifications', index)}><DeleteOutlined style={{ color: '#ef4444' }} /></Button>}
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addDynamicListItem('hardwareSpecifications')}><PlusCircleOutlined style={{ marginRight: '4px' }} />Add Hardware Spec</Button>
              </div>
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="text-lg font-medium">Product Options</h3>
                {productData.options.map((option, index) => (
                  <div key={index} className="p-4 border rounded-lg mb-2 bg-muted/50">
                    <div className="grid grid-cols-2 gap-2 mb-2 items-center">
                        <Input name="name" placeholder="Option Name (e.g., Warranty)" value={option.name} onChange={(e) => handleDynamicListChange('options', index, e)} />
                        <Input name="values" placeholder="Values (comma-separated, e.g., 1 Year, 2 Years)" value={option.values} onChange={(e) => handleDynamicListChange('options', index, e)} />
                    </div>
                    {productData.options.length > 1 && <Button variant="ghost" size="sm" onClick={() => removeDynamicListItem('options', index)}><DeleteOutlined style={{ marginRight: '4px', color: '#ef4444' }} />Remove Option</Button>}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addDynamicListItem('options')}><PlusCircleOutlined style={{ marginRight: '4px' }} />Add Option</Button>
              </div>
            </div>
          )}
          {currentStep === 4 && (
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Review Your Product</h3>

                {/* Main Details */}
                <div className="p-4 border rounded-lg space-y-1 bg-muted/50">
                    <p><strong>Name:</strong> {productData.name || "-"}</p>
                    <p><strong>Brand:</strong> {productData.brand || "-"}</p>
                    <p><strong>Category:</strong> {productData.category || "-"}</p>
                    <p><strong>Description:</strong> {productData.description || "-"}</p>
                    <p><strong>Regular Price:</strong> ₹{productData.regularPrice || "0"}</p>
                    <p><strong>Sale Price:</strong> ₹{productData.salePrice || "0"}</p>
                    <p><strong>Stock:</strong> {productData.stock || "0"}</p>
                    <p><strong>Availability:</strong> {productData.availability || "-"}</p>
                    <p><strong>SKU:</strong> {productData.sku || "-"}</p>
                    <p><strong>Tax Percentage:</strong> {productData.taxPercentage}%</p>
                </div>

                {/* Main Image */}
                {imageUrl && (
                  <div>
                    <h4 className="font-medium mb-2">Main Image:</h4>
                    <img src={imageUrl} alt="Main product" className="h-48 w-48 object-cover rounded-lg border" />
                  </div>
                )}

                {/* Gallery Images */}
                {productData.galleryImages.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Gallery Images ({productData.galleryImages.length}):</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {productData.galleryImages.map((img, i) => (
                        <img key={i} src={img} alt={`Gallery ${i + 1}`} className="h-32 w-32 object-cover rounded-lg border" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="p-4 border rounded-lg space-y-2 bg-muted/50">
                    <h4 className="font-medium">Features:</h4>
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
      <CardFooter className="flex justify-between mt-6 border-t pt-4 gap-2">
        <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1}>Previous</Button>
        <div className="flex gap-2">
          {currentStep === steps.length && (
            <Button variant="outline" onClick={() => setShowProductPreview(true)} className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950">
              <EyeOutlined style={{ marginRight: '4px' }} /> Preview
            </Button>
          )}
          {currentStep < steps.length ? <Button onClick={handleNext}>Next Step</Button> : <Button onClick={handleFormSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">{isSubmitting ? 'Submitting...' : 'Submit Product'}</Button>}
        </div>
      </CardFooter>

      {/* Image Preview Modal Overlay */}
      {showPreviewModal && previewImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowPreviewModal(false)}>
          <div className="relative bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full"
              onClick={() => setShowPreviewModal(false)}
            >
              <CloseOutlined style={{ fontSize: '24px' }} />
            </Button>
          </div>
        </div>
      )}

      {/* Product Preview Modal */}
      <ProductPreviewModal
        isOpen={showProductPreview}
        onClose={() => setShowProductPreview(false)}
        product={{
          name: productData.name,
          brand: productData.brand,
          category: productData.category,
          description: productData.description,
          regularPrice: parseInt(productData.regularPrice) || 0,
          salePrice: productData.salePrice ? parseInt(productData.salePrice) : undefined,
          stock: parseInt(productData.stock) || 0,
          availability: productData.availability,
          sku: productData.sku,
          features: productData.features.filter(f => f),
          technicalSpecifications: productData.technicalSpecifications.filter(s => s.key),
          hardwareSpecifications: productData.hardwareSpecifications.filter(s => s.key),
          imageUrl: productData.imageUrl,
          galleryImages: productData.galleryImages,
        }}
      />
    </Card>
  );
}
