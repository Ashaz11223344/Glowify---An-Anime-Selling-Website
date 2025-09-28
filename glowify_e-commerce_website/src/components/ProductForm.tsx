import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ProductFormProps {
  product?: any;
  onClose: () => void;
}

export function ProductForm({ product, onClose }: ProductFormProps) {
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    stock: product?.stock || 0,
    animeName: product?.animeName || "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [existingImageIds, setExistingImageIds] = useState(product?.imageIds || []);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Upload new images
      const newImageIds = [];
      for (const image of images) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });
        const { storageId } = await result.json();
        newImageIds.push(storageId);
      }

      const allImageIds = [...existingImageIds, ...newImageIds];

      if (product) {
        await updateProduct({
          id: product._id,
          ...formData,
          imageIds: allImageIds,
          isActive: product.isActive,
        });
        toast.success("Product updated successfully!");
      } else {
        await createProduct({
          ...formData,
          imageIds: allImageIds,
        });
        toast.success("Product created successfully!");
      }

      onClose();
    } catch (error) {
      toast.error("Failed to save product");
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImageIds(existingImageIds.filter((_: any, i: number) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setImages(images.filter((_: File, i: number) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl border border-purple-500/20 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-2">Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2">Price (₹) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Stock *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Anime Name *</label>
            <input
              type="text"
              value={formData.animeName}
              onChange={(e) => setFormData({ ...formData, animeName: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Product Images</label>
            
            {/* Existing Images */}
            {product && existingImageIds.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Current Images:</p>
                <div className="flex flex-wrap gap-2">
                  {existingImageIds.map((imageId: any, index: number) => (
                    <div key={index} className="relative">
                      <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Image {index + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 transition-all"
            />

            {/* New Images Preview */}
            {images.length > 0 && (
              <div className="mt-4">
                <p className="text-gray-400 text-sm mb-2">New Images to Upload:</p>
                <div className="flex flex-wrap gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-lg transition-all font-semibold disabled:opacity-50"
            >
              {uploading ? "Saving..." : product ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
