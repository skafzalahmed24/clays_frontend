import React from 'react';
import Input from '../ui/Input';

const AddressForm = ({ formData, onChange, onSubmit, onCancel, isEditing = false, loading = false }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onSubmit(e);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <Input
                    type="text"
                    name="firstName"
                    required
                    placeholder="First name *"
                    value={formData.firstName}
                    onChange={onChange}
                    className="bg-transparent border-dark/20 focus:border-primary text-dark placeholder:text-dark/40"
                />
                <Input
                    type="text"
                    name="lastName"
                    required
                    placeholder="Last name *"
                    value={formData.lastName}
                    onChange={onChange}
                    className="bg-transparent border-dark/20 focus:border-primary text-dark placeholder:text-dark/40"
                />
            </div>

            <Input
                type="email"
                name="email"
                required
                placeholder="Email *"
                value={formData.email}
                onChange={onChange}
                className="bg-transparent border-dark/20 focus:border-primary text-dark placeholder:text-dark/40"
            />

            <Input
                type="tel"
                name="phone"
                required
                placeholder="Phone *"
                value={formData.phone}
                onChange={onChange}
                className="bg-transparent border-dark/20 focus:border-primary text-dark placeholder:text-dark/40"
            />

            <Input
                type="text"
                name="address"
                required
                placeholder="Address *"
                value={formData.address}
                onChange={onChange}
                className="bg-transparent border-dark/20 focus:border-primary text-dark placeholder:text-dark/40"
            />

            <Input
                type="text"
                name="apartment"
                placeholder="Apartment, suite, etc. (optional)"
                value={formData.apartment}
                onChange={onChange}
                className="bg-transparent border-dark/20 focus:border-primary text-dark placeholder:text-dark/40"
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    type="text"
                    name="city"
                    required
                    placeholder="City *"
                    value={formData.city}
                    onChange={onChange}
                    className="bg-transparent border-dark/20 focus:border-primary text-dark placeholder:text-dark/40"
                />
                <Input
                    type="text"
                    name="postalCode"
                    required
                    placeholder="Postal code *"
                    value={formData.postalCode}
                    onChange={onChange}
                    className="bg-transparent border-dark/20 focus:border-primary text-dark placeholder:text-dark/40"
                />
            </div>

            <div className="flex gap-4 pt-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 border border-dark/20 text-dark px-6 py-3 hover:bg-dark/5 transition-colors rounded-sm"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-primary text-dark font-bold uppercase tracking-widest px-6 py-3 hover:bg-dark hover:text-white transition-colors rounded-sm disabled:opacity-50"
                >
                    {loading ? 'Saving...' : isEditing ? 'Update Address' : 'Save Address'}
                </button>
            </div>
        </div>
    );
};

export default AddressForm;
