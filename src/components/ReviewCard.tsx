import Image from 'next/image';

interface ReviewCardProps {
  authorName: string;
  authorPhoto?: string | null;
  rating: number;
  comment?: string | null;
  reviewDate: Date;
  source: string;
}

export default function ReviewCard({
  authorName,
  authorPhoto,
  rating,
  comment,
  reviewDate,
  source,
}: ReviewCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Author Photo */}
        <div className="flex-shrink-0">
          {authorPhoto ? (
            <Image
              src={authorPhoto}
              alt={authorName}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">{authorName}</h4>
              <div className="flex items-center gap-2 mt-1">
                {/* Star Rating */}
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                {/* Source Badge */}
                {source === 'google' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    <svg className="w-3 h-3" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                    </svg>
                    Google
                  </span>
                )}
              </div>
            </div>
            {/* Date */}
            <span className="text-sm text-gray-500">
              {new Date(reviewDate).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {/* Comment */}
          {comment && (
            <p className="text-gray-700 leading-relaxed mt-3">{comment}</p>
          )}
        </div>
      </div>
    </div>
  );
}

