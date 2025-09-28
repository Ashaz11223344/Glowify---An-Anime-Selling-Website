import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Star, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ReviewSectionProps {
  productId: string;
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const reviews = useQuery(api.reviews.getByProduct, { productId: productId as any });
  const addReview = useMutation(api.reviews.add);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addReview({
        productId: productId as any,
        rating,
        comment,
      });
      toast.success("Review added successfully!");
      setShowReviewForm(false);
      setComment("");
      setRating(5);
    } catch (error) {
      toast.error("Please sign in to add a review");
    }
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <MessageCircle className="w-6 h-6 mr-2" />
          Customer Reviews
        </h2>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all"
        >
          Write Review
        </button>
      </div>

      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-white/5 rounded-lg border border-gray-600">
          <div className="mb-4">
            <label className="block text-white font-semibold mb-2">Rating</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`w-8 h-8 ${
                    star <= rating ? "text-yellow-400" : "text-gray-600"
                  } hover:text-yellow-400 transition-colors`}
                >
                  <Star className="w-full h-full fill-current" />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-white font-semibold mb-2">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
              rows={4}
              placeholder="Share your experience with this product..."
              required
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg transition-all"
            >
              Submit Review
            </button>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {reviews === undefined ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="p-4 bg-white/5 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold">{review.userName}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-gray-400 text-sm">
                  {new Date(review._creationTime).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-300">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
