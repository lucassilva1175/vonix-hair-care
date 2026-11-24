/** Aggregate only the editorial catalog snapshot, never author names or media URLs. */
export function summarizeAffiliateProductReviews(
  records: readonly { slug: string; rating: unknown }[],
  slug: string,
) {
  const ratings = records
    .filter((record) => record.slug === slug)
    .map((record) => record.rating)
    .filter(
      (rating): rating is number =>
        typeof rating === "number" && Number.isInteger(rating) && rating >= 1 && rating <= 5,
    );
  const count = ratings.length;
  return {
    count,
    average: count ? ratings.reduce((sum, rating) => sum + rating, 0) / count : null,
    distribution: [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: ratings.filter((rating) => rating === stars).length,
    })),
  };
}
