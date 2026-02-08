const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating || 0);
  const hasHalfStar = (rating || 0) % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  return (
    <span className="text-yellow-500 text-sm">
      {'\u2605'.repeat(fullStars)}
      {hasHalfStar && '\u00bd'}
      {'\u2606'.repeat(emptyStars)}
    </span>
  );
};

export default StarRating;
