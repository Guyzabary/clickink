import React from "react";
import { Star as FullStarIcon, StarHalf as HalfStarIcon } from "lucide-react";

interface StarRatingProps {
  rating?: number;  // average rating (0–5)
  count: number;    // number of reviews
  size?: "sm" | "md" | "lg"; // optional icon size
}

const StarRating: React.FC<StarRatingProps> = ({ rating, count, size = "md" }) => {
  // Ensure rating is a finite number between 0 and 5
  const numeric = typeof rating === "number" && !isNaN(rating) ? rating : 0;
  const safeRating = Math.max(0, Math.min(5, numeric));
  const fullStars = Math.floor(safeRating);
  const halfStar = safeRating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  // Determine pixel size for icons based on size prop
  const px = size === "sm" ? 12 : size === "lg" ? 24 : 16;
  const iconClass = `h-${px} w-${px}`;

  return (
    <div className="flex items-center">
      {/* Render full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <FullStarIcon key={`full-${i}`} className={`${iconClass} text-yellow-400 fill-yellow-400`} />
      ))}
      {/* Render half star if needed */}
      {halfStar && <HalfStarIcon className={`${iconClass} text-yellow-400`} />}
      {/* Render empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <FullStarIcon key={`empty-${i}`} className={`${iconClass} text-gray-300`} />
      ))}
      {/* Display review count */}
      <span className="ml-2 text-sm text-gray-600">({count} reviews)</span>
    </div>
  );
};

export default StarRating;