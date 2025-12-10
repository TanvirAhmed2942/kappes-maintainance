import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Progress } from '../../../../components/ui/progress';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Star } from 'lucide-react';

export default function ProductReviews() {
  const reviews = [
    {
      id: 1,
      name: "Randy Orton",
      rating: 4,
      date: "2 Feb 2025",
      text: "I took this bag on my recent vacation, and I couldn't be happier with it! It's sturdy, yet lightweight, and has enough compartments to keep all my belongings organized. The material feels high-quality, and it's comfortable to carry, even when it's fully packed. The size is perfect for both carry-on and checked luggage. It also holds up well in different weather conditions. Definitely a must-have for frequent travelers!"
    },
    {
      id: 2,
      name: "Randy Orton",
      rating: 4,
      date: "2 Feb 2025",
      text: "I took this bag on my recent vacation, and I couldn't be happier with it! It's sturdy, yet lightweight, and has enough compartments to keep all my belongings organized. The material feels high-quality, and it's comfortable to carry, even when it's fully packed. The size is perfect for both carry-on and checked luggage. It also holds up well in different weather conditions. Definitely a must-have for frequent travelers!"
    },
    {
      id: 3,
      name: "Randy Orton",
      rating: 4,
      date: "2 Feb 2025",
      text: "I took this bag on my recent vacation, and I couldn't be happier with it! It's sturdy, yet lightweight, and has enough compartments to keep all my belongings organized. The material feels high-quality, and it's comfortable to carry, even when it's fully packed. The size is perfect for both carry-on and checked luggage. It also holds up well in different weather conditions. Definitely a must-have for frequent travelers!"
    },
    {
      id: 4,
      name: "Randy Orton",
      rating: 4,
      date: "2 Feb 2025",
      text: "I took this bag on my recent vacation, and I couldn't be happier with it! It's sturdy, yet lightweight, and has enough compartments to keep all my belongings organized. The material feels high-quality, and it's comfortable to carry, even when it's fully packed. The size is perfect for both carry-on and checked luggage. It also holds up well in different weather conditions. Definitely a must-have for frequent travelers!"
    }
  ];

  const ratingDistribution = [
    { stars: 5, count: 150, percentage: 87 },
    { stars: 4, count: 150, percentage: 87 },
    { stars: 3, count: 20, percentage: 12 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 }
  ];

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
              }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Summary Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="text-5xl font-bold mb-1">4.9/5</div>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= 4
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                        }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  320 <span className="text-gray-400">Reviews</span>
                </div>
              </div>

              <div className="space-y-3">
                {ratingDistribution.map((item) => (
                  <div key={item.stars} className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1 w-8">
                      <span className="font-medium">{item.stars}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <Progress
                      value={item.percentage}
                      className="flex-1 h-2"
                    />
                    <div className="w-8 text-right text-gray-600">{item.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-base mb-2">{review.name}</h3>
                          {renderStars(review.rating)}
                        </div>
                        <div className="text-sm text-gray-500">{review.date}</div>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{review.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}