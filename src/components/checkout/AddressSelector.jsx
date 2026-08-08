import React from 'react';

const AddressSelector = ({ addresses, selectedAddressId, onSelectAddress, onAddNew, onEdit }) => {
    if (!addresses || addresses.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-base font-heading text-dark uppercase tracking-widest">
                Delivery addresses ({addresses.length})
            </h3>

            <div className="space-y-3">
                {addresses.map((address) => (
                    <div
                        key={address._id}
                        onClick={() => onSelectAddress(address._id)}
                        className={`border rounded-sm p-4 cursor-pointer transition-all ${selectedAddressId === address._id
                                ? 'border-primary bg-primary/5'
                                : 'border-dark/20 hover:border-dark/40'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            {/* Radio button */}
                            <div className="mt-1">
                                <div
                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedAddressId === address._id
                                            ? 'border-primary'
                                            : 'border-dark/40'
                                        }`}
                                >
                                    {selectedAddressId === address._id && (
                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    )}
                                </div>
                            </div>

                            {/* Address details */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-dark mb-1">
                                    {address.firstName} {address.lastName}
                                    {address.isDefault && (
                                        <span className="ml-2 text-xs text-primary font-normal">(Default)</span>
                                    )}
                                </h4>
                                <p className="text-sm text-text-main/80 mb-2">
                                    {address.address}
                                    {address.apartment && `, ${address.apartment}`}
                                    <br />
                                    {address.city}, {address.postalCode}
                                </p>
                                <p className="text-xs text-text-main/60">
                                    Phone: {address.phone}
                                </p>
                                <p className="text-xs text-text-main/60">
                                    Email: {address.email}
                                </p>

                                {/* Edit link */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(address);
                                    }}
                                    className="text-xs text-primary hover:underline mt-2 inline-block"
                                >
                                    Edit address
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add new address button */}
            <button
                type="button"
                onClick={onAddNew}
                className="w-full border border-dark/20 hover:border-primary text-primary px-4 py-3 rounded-sm text-sm font-medium transition-colors"
            >
                + Add a new delivery address
            </button>
        </div>
    );
};

export default AddressSelector;
