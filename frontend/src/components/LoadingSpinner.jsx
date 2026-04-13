/**
 * LoadingSpinner — premium loading animation component.
 */

import { motion } from 'framer-motion';

const LoadingSpinner = ({ text = 'Loading...' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <motion.div
                className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="mt-4 text-gray-500 font-medium">{text}</p>
        </div>
    );
};

export default LoadingSpinner;
