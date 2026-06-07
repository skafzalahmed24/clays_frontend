import React from 'react';

const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={`bg-white/5 animate-pulse rounded-sm ${className}`}
            {...props}
        />
    );
};

export default Skeleton;
