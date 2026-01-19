import { useEffect, useState } from "react";
import { getListings, type Listing } from "../../api/listings";

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getListings();
        setListings(data);
      } catch (e) {
        setError("Failed to load listings");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) return <div className="p-4">Loading listings...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Buy &amp; Sell Listings</h1>
      {listings.length === 0 ? (
        <div>No listings yet.</div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="border rounded-lg p-3 shadow-sm flex flex-col gap-1"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-medium">{listing.title}</h2>
                <span className="font-semibold">
                  €{Number(listing.price).toFixed(2)}
                </span>
              </div>
              {listing.city && (
                <div className="text-sm text-gray-600">{listing.city}</div>
              )}
              <p className="text-sm text-gray-800">
                {listing.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
