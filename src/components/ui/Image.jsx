import React, { useState } from 'react';
import { API_URL, BASE_URL, getMediaUrl } from '../../utils/apiConfig';

/**
 * Image Component
 * 
 * Automatically handles backend URLs.
 * - If src starts with http/blob/data, uses it as is.
 * - If src is a relative path (e.g. /uploads/image.png) and isStatic is false (default), prepends API_URL.
 * - If isStatic is true, uses src as is (for imported assets).
 * - Handles image load errors with a fallback placeholder if provided or hides the image.
 */
const Image = ({
    src,
    alt,
    className,
    isStatic = false,
    placeholder = '',
    ...props
}) => {
    // const [imgSrc, setImgSrc] = useState(null);
    // Assistant note: imgSrc was set in handleError but never read.
    const [hasError, setHasError] = useState(false);

    // Initial derivation of source
    let finalSrc = src;

    if (src && !isStatic) {
        finalSrc = getMediaUrl(src);
    }

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            // setImgSrc(placeholder);
        }
    };

    if (!src && !placeholder) return null;

    return (
        <img
            src={hasError ? placeholder : (finalSrc || placeholder)}
            alt={alt || ''}
            className={className}
            onError={handleError}
            {...props}
        />
    );
};

export default Image;
