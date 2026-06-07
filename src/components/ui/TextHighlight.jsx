import React from 'react';

/**
 * A component that highlights occurrences of a query string within a text.
 * @param {string} text - The full text to display.
 * @param {string} query - The search query to highlight.
 * @returns {JSX.Element} - The text with matches wrapped in a highlight span.
 */
const TextHighlight = ({ text, query }) => {
    if (!query || !text) return <>{text}</>;

    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <span key={i} className="bg-primary text-dark px-0.5 rounded-sm font-semibold">
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </>
    );
};

export default TextHighlight;
