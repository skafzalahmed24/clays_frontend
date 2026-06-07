import React from 'react';

import { Link } from 'react-router-dom';
import Icons from '../../ui/Icons';

const PageHeader = ({ title, subtitle, children, backLink }) => {
    return (
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                {backLink && (
                    <Link to={backLink} className="inline-flex items-center gap-2 text-light/50 hover:text-primary mb-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:-translate-x-1">
                        <Icons.ArrowLeft className="w-4 h-4" /> Back
                    </Link>
                )}
                <h1 className="font-heading text-3xl text-light mb-2">{title}</h1>
                {subtitle && <p className="text-light/60 text-sm tracking-wide">{subtitle}</p>}
            </div>
            {children}
        </div>
    );
};

export default PageHeader;
