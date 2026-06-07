import React from 'react';

const PageLayout = ({ children, className = "" }) => {
    return (
        <div className={`pb-24 px-6 md:px-12 ${className}`}>
            {children}
        </div>
    );
};

export default PageLayout;
