import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Upload, X, ArrowLeft, Camera, Shield, Trash2 } from "lucide-react";

interface CustomPhotoFrameProps {
  onBack: () => void;
}

const FRAME_SIZES = [
  { value: "8x10", label: "8\" x 10\"" },
  { value: "11x14", label: "11\" x 14\"" },
  { value: "16x20", label: "16\" x 20\"" },
  { value: "20x24", label: "20\" x 24\"" },
  { value: "24x36", label: "24\" x 36\"" },
];

const PRESET_INSTRUCTIONS = [
  "Please enhance the colors to make them more vibrant",
  "Add a subtle glow effect around the main subject",
  "Make the background darker to highlight the subject",
  "Apply anime-style color enhancement",
  "Add soft lighting effects",
  "Enhance contrast and brightness",
  "Apply vintage filter effect",
  "Make colors more saturated and pop",
];

export function CustomPhotoFrame({ onBack }: CustomPhotoFrameProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    frameSize: "",
    quantity: 1,
    customInstructions: "",
    orderMethod: "email" as "email" | "whatsapp",
  });
  const [uploadedImages, setUploadedImages] = useState<Array<{ id: string; url: string; file: File }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateUploadUrl = useMutation(api.customOrders.generateUploadUrl);
  const createCustomOrder = useMutation(api.customOrders.createCustomOrder);
  const userProfile = useQuery(api.userProfiles.getUserProfile);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (files: FileList) => {
    if (files.length === 0) return;
    
    if (uploadedImages.length + files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    setIsUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast.error(`${file.name} is too large. Maximum size is 10MB`);
          continue;
        }

        const uploadUrl = await generateUploadUrl();
        
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const { storageId } = await result.json();
        const imageUrl = URL.createObjectURL(file);
        
        setUploadedImages(prev => [...prev, {
          id: storageId,
          url: imageUrl,
          file: file
        }]);
      }
      
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].url);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const addPresetInstruction = (instruction: string) => {
    const current = formData.customInstructions;
    const newInstruction = current ? `${current}\n• ${instruction}` : `• ${instruction}`;
    handleInputChange("customInstructions", newInstruction);
  };

  const handleSubmit = async () => {
    if (uploadedImages.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    if (!formData.customerName || !formData.email || !formData.phone || !formData.address || 
        !formData.frameSize) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const imageIds = uploadedImages.map(img => img.id as any);
      
      await createCustomOrder({
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        frameSize: formData.frameSize,
        frameType: "custom", // Default value since we removed frame type selection
        quantity: formData.quantity,
        customInstructions: formData.customInstructions,
        imageIds: imageIds,
        totalAmount: 0, // No pricing calculation needed
        orderMethod: formData.orderMethod,
      });

      toast.success("Custom order submitted successfully! We will contact you soon with pricing and details.");
      
      // Clean up object URLs
      uploadedImages.forEach(img => URL.revokeObjectURL(img.url));
      
      onBack();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit order");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-fill user data if available
  if (userProfile && !formData.customerName) {
    setFormData(prev => ({
      ...prev,
      customerName: userProfile.name || "",
      address: userProfile.defaultAddress?.address || "",
    }));
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <Camera className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Custom Photo Frame
          </h1>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="glass rounded-xl p-4 border-l-4 border-primary">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold text-primary mb-1">Privacy Notice</h3>
            <p className="text-sm text-muted-foreground">
              Your uploaded images will be automatically deleted from our servers after 24 hours for your privacy and security. 
              We only keep them temporarily to process your custom order.
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Upload Images */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Upload className="w-6 h-6 text-primary" />
              Upload Your Images
            </h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                  disabled={isUploading}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">
                    {isUploading ? "Uploading..." : "Click to upload images"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Maximum 10 images, up to 10MB each. Supports JPG, PNG, GIF
                  </p>
                </label>
              </div>

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {image.file.name.length > 15 ? `${image.file.name.substring(0, 15)}...` : image.file.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {uploadedImages.length > 0 && (
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-gradient-primary hover:glow-primary text-primary-foreground py-3 px-6 rounded-xl font-semibold transition-all"
                >
                  Continue to Frame Options ({uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Frame Options & Instructions */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Frame Options & Instructions</h2>
            
            <div className="space-y-6">
              {/* Frame Size */}
              <div>
                <label className="block text-sm font-medium mb-3">Frame Size *</label>
                <div className="space-y-2">
                  {FRAME_SIZES.map((size) => (
                    <label key={size.value} className="flex items-center p-3 border border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="frameSize"
                        value={size.value}
                        checked={formData.frameSize === size.value}
                        onChange={(e) => handleInputChange("frameSize", e.target.value)}
                        className="text-primary mr-3"
                      />
                      <span>{size.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium mb-2">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 1)}
                  className="w-32 px-3 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              {/* Custom Instructions */}
              <div>
                <label className="block text-sm font-medium mb-2">Custom Instructions</label>
                <textarea
                  value={formData.customInstructions}
                  onChange={(e) => handleInputChange("customInstructions", e.target.value)}
                  placeholder="Tell us how you'd like your photos enhanced..."
                  className="w-full h-32 px-3 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                />
                
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground mb-2">Quick add preset instructions:</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_INSTRUCTIONS.map((instruction, index) => (
                      <button
                        key={index}
                        onClick={() => addPresetInstruction(instruction)}
                        className="text-xs px-3 py-1 bg-muted hover:bg-primary/20 rounded-full transition-colors"
                      >
                        {instruction}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-border hover:border-primary/50 text-foreground py-3 px-6 rounded-xl font-semibold transition-all"
              >
                Back to Images
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.frameSize}
                className="flex-1 bg-gradient-primary hover:glow-primary text-primary-foreground py-3 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Customer Details */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Customer Details</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange("customerName", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Preferred Contact Method *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="orderMethod"
                      value="email"
                      checked={formData.orderMethod === "email"}
                      onChange={(e) => handleInputChange("orderMethod", e.target.value)}
                      className="text-primary"
                    />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="orderMethod"
                      value="whatsapp"
                      checked={formData.orderMethod === "whatsapp"}
                      onChange={(e) => handleInputChange("orderMethod", e.target.value)}
                      className="text-primary"
                    />
                    <span>WhatsApp</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Delivery Address *</label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full h-24 px-3 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                placeholder="Enter your complete delivery address"
              />
            </div>

            {/* Order Summary */}
            <div className="mt-6 p-4 bg-card border border-border rounded-lg">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Images:</span>
                  <span>{uploadedImages.length} photo{uploadedImages.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frame Size:</span>
                  <span>{FRAME_SIZES.find(s => s.value === formData.frameSize)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span>{formData.quantity}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Status:</span>
                  <span className="text-primary">Quote on Request</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-border hover:border-primary/50 text-foreground py-3 px-6 rounded-xl font-semibold transition-all"
              >
                Back to Options
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-primary hover:glow-primary text-primary-foreground py-3 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Custom Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
