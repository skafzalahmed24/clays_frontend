import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetContactByIdQuery, useDeleteContactMutation } from '../../store/api/contactApiSlice';
import PageHeader from '../../components/admin/layout/PageHeader';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import Icons from '../../components/ui/Icons';
import Loading from '../../components/common/Loading';

const MessageDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: message, isLoading, error } = useGetContactByIdQuery(id);
    const [deleteContact] = useDeleteContactMutation();
    const { confirm } = useConfirm();
    const { showToast } = useToast();

    const handleDelete = async () => {
        if (await confirm('Delete Message', 'Are you sure you want to delete this message? This action cannot be undone.')) {
            try {
                await deleteContact(id).unwrap();
                showToast('Message deleted successfully', 'success');
                navigate('/admin/messages');
            } catch (err) {
                showToast(err?.data?.message || 'Failed to delete message', 'error');
            }
        }
    };

    if (isLoading) return <Loading />;
    if (error) return <div className="text-red-400 text-center py-8">Error loading message details.</div>;

    const items = [
        { label: "Date Received", value: new Date(message.createdAt).toLocaleString() },
        { label: "From", value: `${message.firstName} ${message.lastName}` },
        { label: "Email", value: <a href={`mailto:${message.email}`} className="text-primary hover:underline">{message.email}</a> },
        { label: "Subject", value: message.subject },
        { label: "Status", value: <span className="px-2 py-1 rounded bg-white/10 text-xs border border-white/10">{message.status}</span> }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title={message.subject}
                subtitle={`Message from ${message.firstName} ${message.lastName}`}
                backLink="/admin/messages"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Message Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-dark-paper border border-white/10 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-4">Message Body</h3>
                        <div className="text-light/80 whitespace-pre-wrap leading-relaxed">
                            {message.message}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-dark-paper border border-white/10 p-6 rounded-lg space-y-4">
                        <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">Details</h3>
                        {items.map((item, index) => (
                            <div key={index}>
                                <div className="text-xs uppercase tracking-wider text-light/50 mb-1">{item.label}</div>
                                <div className="text-white font-medium">{item.value}</div>
                            </div>
                        ))}

                        <div className="pt-4 border-t border-white/10">
                            <button
                                onClick={handleDelete}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition-all duration-300 border border-red-500/20"
                            >
                                <Icons.Trash />
                                <span>Delete Message</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageDetails;
