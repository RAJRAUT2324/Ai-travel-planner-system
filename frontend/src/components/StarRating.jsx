/**
 * StarRating — interactive star rating component.
 */

import { FiStar } from 'react-icons/fi';

const StarRating = ({ rating, onRate = null, size = 20 }) => {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onRate && onRate(star)}
                    disabled={!onRate}
                    className={`transition-transform ${onRate ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
                >
                    <FiStar
                        size={size}
                        className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                </button>
            ))}
        </div>
    );
};

export default StarRating;
