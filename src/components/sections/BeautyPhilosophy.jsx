import React from 'react';

const BeautyPhilosophy = () => {
    return (
        <section className="py-8 md:py-10 bg-body text-dark relative overflow-hidden">
            <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 relative z-10 text-center">
                <div className="flex flex-col items-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-widest uppercase mb-4 text-primary">Our Vision</h2>
                    <div className="w-16 h-1 bg-primary mb-6"></div>
                    <p className="max-w-2xl text-dark/70 text-lg font-light">Crafted with intention. We believe true luxury lies in the purity of ingredients and the efficacy of nature.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                    {/* Item 1 */}
                    <div className="flex flex-col items-center group">
                        <div className="w-20 h-20 rounded-full border border-primary/30 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-dark transition-all duration-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                        </div>
                        <h3 className="text-xl font-heading font-bold mb-3 uppercase tracking-wider text-primary">Clean Ingredients</h3>
                        <p className="text-dark/70 font-light text-center">Formulated without harmful toxins, sulfates, or parabens. Pure, safe, and effective.</p>
                    </div>

                    {/* Item 2 */}
                    <div className="flex flex-col items-center group">
                        <div className="w-20 h-20 rounded-full border border-primary/30 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-dark transition-all duration-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        </div>
                        <h3 className="text-xl font-heading font-bold mb-3 uppercase tracking-wider text-primary">Cruelty-Free</h3>
                        <p className="text-dark/70 font-light text-center">Never tested on animals. We are committed to ethical beauty that respects all life.</p>
                    </div>

                    {/* Item 3 */}
                    <div className="flex flex-col items-center group">
                        <div className="w-20 h-20 rounded-full border border-primary/30 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-dark transition-all duration-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                        </div>
                        <h3 className="text-xl font-heading font-bold mb-3 uppercase tracking-wider text-primary">Dermatologist Tested</h3>
                        <p className="text-dark/70 font-light text-center">Rigorously tested to ensure optimal safety and performance for even the most sensitive skin.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default BeautyPhilosophy;
