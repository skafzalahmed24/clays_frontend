import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ icon: Icon, title, message, actionLabel, actionLink, action }) => {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-6">
                {Icon && <Icon className="w-10 h-10 text-black/20" />}
            </div>
            <h3 className="font-serif text-2xl text-black mb-3">{title}</h3>
            <p className="text-black/60 max-w-md mb-8 leading-relaxed font-body">{message}</p>

            {actionLink ? (
                <Link
                    to={actionLink}
                    className="inline-block px-8 py-3 bg-primary text-dark font-heading font-bold uppercase tracking-widest hover:bg-light transition-colors rounded-sm"
                >
                    {actionLabel}
                </Link>
            ) : action ? (
                <button
                    onClick={action}
                    className="inline-block px-8 py-3 bg-primary text-dark font-heading font-bold uppercase tracking-widest hover:bg-light transition-colors rounded-sm"
                >
                    {actionLabel}
                </button>
            ) : null}
        </div>
    );
};

export default EmptyState;
