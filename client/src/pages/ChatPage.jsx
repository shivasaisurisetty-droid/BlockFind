import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { chatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Send,
  Paperclip,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Image as ImageIcon,
  CheckCheck,
  Lock,
  ArrowLeft,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import BlockchainBadge from '../components/BlockchainBadge';
import { formatDateTime, formatDate, formatAddress } from '../utils/formatters';

export default function ChatPage() {
  const { conversationId: paramConvId } = useParams();
  const [searchParams] = useSearchParams();
  const lostReportIdParam = searchParams.get('lostReportId');
  const foundReportIdParam = searchParams.get('foundReportId');

  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(paramConvId || null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);

  // Message compose state
  const [messageText, setMessageText] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  // In-Chat Verification Modals & Forms
  const [showRequestProofModal, setShowRequestProofModal] = useState(false);
  const [proofChecklist, setProofChecklist] = useState([
    'Describe a unique physical characteristic or markings',
    'Provide serial/device information or receipts',
    'Provide previous photograph or packaging'
  ]);
  const [showSubmitProofModal, setShowSubmitProofModal] = useState(false);
  const [proofStatement, setProofStatement] = useState('');

  // Confirmation Modals
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Item was not returned');
  const [disputeDetails, setDisputeDetails] = useState('');

  // Image Lightbox Preview
  const [previewLightboxImage, setPreviewLightboxImage] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // 1. Initial Load: Get Conversations or Init from Report Params
  useEffect(() => {
    const initConversations = async () => {
      try {
        setLoadingList(true);
        if (lostReportIdParam || foundReportIdParam) {
          const createRes = await chatService.getOrCreateConversation({
            lostReportId: lostReportIdParam || undefined,
            foundReportId: foundReportIdParam || undefined
          });
          if (createRes.success) {
            setSelectedConvId(createRes.conversation.id);
            navigate(`/messages/${createRes.conversation.id}`, { replace: true });
          }
        }

        const res = await chatService.getMyConversations();
        if (res.success) {
          setConversations(res.conversations);
          if (!selectedConvId && res.conversations.length > 0 && !paramConvId) {
            setSelectedConvId(res.conversations[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
      } finally {
        setLoadingList(false);
      }
    };
    initConversations();
  }, [paramConvId, lostReportIdParam, foundReportIdParam]);

  // 2. Load Selected Conversation Thread
  const fetchActiveConversation = async (convId) => {
    if (!convId) return;
    try {
      setLoadingChat(true);
      const res = await chatService.getConversationById(convId);
      if (res.success) {
        setActiveConversation(res.conversation);
      }
    } catch (err) {
      console.error('Error fetching conversation details:', err);
    } finally {
      setLoadingChat(false);
    }
  };

  useEffect(() => {
    if (selectedConvId) {
      fetchActiveConversation(selectedConvId);
    }
  }, [selectedConvId]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  // Image selection handler
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClearImage = () => {
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!messageText.trim() && !selectedImageFile) || sendingMessage || !selectedConvId) return;

    try {
      setSendingMessage(true);
      const formData = new FormData();
      if (messageText.trim()) formData.append('content', messageText.trim());
      if (selectedImageFile) formData.append('image', selectedImageFile);

      const res = await chatService.sendMessage(selectedConvId, formData);
      if (res.success) {
        setMessageText('');
        handleClearImage();
        await fetchActiveConversation(selectedConvId);
        // Refresh sidebar conversation preview
        const convListRes = await chatService.getMyConversations();
        if (convListRes.success) setConversations(convListRes.conversations);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  // Actions
  const handleRequestVerification = async () => {
    try {
      await chatService.requestVerification(selectedConvId, {
        checklistItems: proofChecklist,
        evidenceDescription: 'Please provide identifying characteristics and proof of purchase.'
      });
      setShowRequestProofModal(false);
      fetchActiveConversation(selectedConvId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitProof = async () => {
    try {
      await chatService.submitVerificationProof(selectedConvId, {
        evidenceDescription: proofStatement
      });
      setShowSubmitProofModal(false);
      setProofStatement('');
      fetchActiveConversation(selectedConvId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyOwner = async () => {
    try {
      await chatService.verifyOwner(selectedConvId);
      setShowVerifyModal(false);
      fetchActiveConversation(selectedConvId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkReturned = async () => {
    try {
      await chatService.markAsReturned(selectedConvId);
      setShowReturnModal(false);
      fetchActiveConversation(selectedConvId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmReturn = async () => {
    try {
      await chatService.confirmReturn(selectedConvId);
      fetchActiveConversation(selectedConvId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportDispute = async (e) => {
    e.preventDefault();
    try {
      await chatService.reportDispute(selectedConvId, {
        disputeReason: `${disputeReason}${disputeDetails ? `: ${disputeDetails}` : ''}`
      });
      setShowDisputeModal(false);
      fetchActiveConversation(selectedConvId);
    } catch (err) {
      console.error(err);
    }
  };

  const isFinder = activeConversation?.myRole === 'Finder';
  const isOwner = activeConversation?.myRole === 'Lost Item Owner';
  const verificationReq = activeConversation?.verificationRequest;
  const resolution = activeConversation?.resolution;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col">
      
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
            <Lock className="w-4 h-4" />
          </span>
          <h1 className="text-xl font-bold text-slate-900 font-display">
            Anonymous Lost & Found Secure Chat
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Zero-PII Privacy Protection Active</span>
        </div>
      </div>

      {/* Main 2-Panel Chat Layout */}
      <div className="flex-1 min-h-0 bg-white rounded-3xl border border-slate-200 shadow-card flex overflow-hidden">
        
        {/* Left Panel: Conversations Sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col bg-slate-50/50">
          
          <div className="p-4 border-b border-slate-100 bg-white">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">
              Active Conversations
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingList ? (
              <div className="p-6 text-center">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <span className="text-xs text-slate-400 mt-2 block">Loading conversations...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                <p>No active conversations yet. Search lost & found items to initiate contact.</p>
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = selectedConvId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedConvId(c.id);
                      navigate(`/messages/${c.id}`);
                    }}
                    className={`p-4 transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-100/70 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {c.itemTitle}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {formatDate(c.updatedAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-indigo-700 font-semibold">
                      <User className="w-3 h-3 text-indigo-400" />
                      <span>{c.otherUser?.alias}</span>
                      <span className="text-slate-400 font-normal">({c.otherUser?.roleTitle})</span>
                    </div>

                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {c.latestMessage ? c.latestMessage.content : 'No messages yet'}
                    </p>

                    <div className="flex items-center gap-1.5 pt-1">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        c.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : c.status === 'VERIFIED'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : c.status === 'DISPUTED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Active Chat Thread */}
        <div className="flex-1 flex flex-col bg-slate-50/30 min-w-0">
          
          {loadingChat ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner message="Decrypting secure conversation thread..." />
            </div>
          ) : !activeConversation ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400">
              <div className="space-y-3">
                <MessageSquare className="w-12 h-12 mx-auto text-slate-300" />
                <h3 className="text-base font-bold text-slate-700">Select a Conversation</h3>
                <p className="text-xs max-w-sm">
                  Choose a conversation from the sidebar or click "Contact Finder" on a lost & found deposit.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header (Requirement 3 & 4) */}
              <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold text-sm shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 truncate">
                        {activeConversation.itemTitle}
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                        {activeConversation.otherParticipant?.alias} ({activeConversation.otherParticipant?.roleTitle})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Your Role: <strong className="text-indigo-600">{activeConversation.myRole}</strong> • Confidential Session
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDisputeModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Report Problem</span>
                  </button>
                </div>
              </div>

              {/* In-Chat Ownership Verification & Return Protocol Action Banner (Requirement 6, 7, 8, 9) */}
              <div className="p-3.5 bg-indigo-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                
                {/* State Indicator */}
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white/10 text-indigo-300">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block">
                      {activeConversation.status === 'RESOLVED' ? (
                        '🟢 Case Successfully Resolved & Recorded on Blockchain'
                      ) : activeConversation.status === 'VERIFIED' ? (
                        '🟢 Ownership Verified by Finder'
                      ) : activeConversation.status === 'RETURN_PENDING' ? (
                        '📦 Return Pending Owner Confirmation'
                      ) : activeConversation.status === 'DISPUTED' ? (
                        '⚠️ Case Disputed – Campus Security Notified'
                      ) : (
                        '🟡 Ownership Verification Pending'
                      )}
                    </span>
                    <span className="text-[11px] text-indigo-200">
                      {activeConversation.status === 'RESOLVED'
                        ? 'Item returned and confirmed by both parties.'
                        : activeConversation.status === 'VERIFIED'
                        ? 'Evidence accepted. Coordinate handover.'
                        : 'Exchange questions and proof before returning physical item.'}
                    </span>
                  </div>
                </div>

                {/* Dynamic Actions */}
                <div className="flex items-center gap-2">
                  
                  {/* Step 1: Finder asks for verification */}
                  {activeConversation.status === 'ACTIVE' && isFinder && (
                    <button
                      onClick={() => setShowRequestProofModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs transition-colors"
                    >
                      Request Ownership Proof
                    </button>
                  )}

                  {/* Step 2: Owner submits verification */}
                  {activeConversation.status === 'ACTIVE' && isOwner && (
                    <button
                      onClick={() => setShowSubmitProofModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs transition-colors"
                    >
                      Submit Verification Details
                    </button>
                  )}

                  {/* Step 3: Finder verifies owner */}
                  {activeConversation.status === 'ACTIVE' && isFinder && (
                    <button
                      onClick={() => setShowVerifyModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs transition-colors shadow-sm flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verify Owner
                    </button>
                  )}

                  {/* Step 4: Finder marks as returned */}
                  {activeConversation.status === 'VERIFIED' && isFinder && (
                    <button
                      onClick={() => setShowReturnModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs transition-colors shadow-sm"
                    >
                      Mark as Returned
                    </button>
                  )}

                  {/* Step 5: Owner confirms receipt (Two-Sided Resolution) */}
                  {activeConversation.status === 'RETURN_PENDING' && isOwner && (
                    <button
                      onClick={handleConfirmReturn}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Confirm I Received My Item
                    </button>
                  )}

                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {activeConversation.messages.map((msg) => {
                  if (msg.messageType === 'SYSTEM') {
                    return (
                      <div key={msg.id} className="flex justify-center my-3">
                        <div className="max-w-md px-4 py-2 bg-slate-200/70 border border-slate-300 text-slate-700 text-[11px] rounded-2xl text-center leading-relaxed font-mono">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  const isMine = msg.isMine;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mb-1 px-1">
                        <span>{msg.senderAlias}</span>
                        <span>•</span>
                        <span>{formatDateTime(msg.createdAt)}</span>
                      </div>

                      <div
                        className={`max-w-sm sm:max-w-md rounded-3xl p-4 shadow-sm text-xs leading-relaxed space-y-2 ${
                          isMine
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                        }`}
                      >
                        {msg.attachmentUrl && (
                          <div
                            onClick={() => setPreviewLightboxImage(msg.attachmentUrl)}
                            className="rounded-2xl overflow-hidden cursor-pointer border border-black/10 relative group"
                          >
                            <img
                              src={msg.attachmentUrl}
                              alt="Attachment"
                              className="w-full max-h-56 object-cover hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                              Click to view full image
                            </div>
                          </div>
                        )}

                        {msg.content && msg.content !== 'Image Attachment' && (
                          <p>{msg.content}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Image preview thumbnail before send */}
              {imagePreviewUrl && (
                <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-300">
                    <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={handleClearImage}
                      className="absolute top-1 right-1 p-0.5 bg-slate-900/80 text-white rounded-full hover:bg-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-600 font-mono truncate">
                    {selectedImageFile?.name}
                  </span>
                </div>
              )}

              {/* Message Composer Bar (Requirement 4 & 5) */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Attach Photo / Receipt Proof"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a secure message (contact info will remain hidden)..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />

                <button
                  type="submit"
                  disabled={sendingMessage || (!messageText.trim() && !selectedImageFile)}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

        </div>

      </div>

      {/* ----------------- MODALS ----------------- */}

      {/* 1. Request Ownership Proof Modal (Requirement 6) */}
      {showRequestProofModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Request Ownership Verification
            </h3>
            <p className="text-xs text-slate-500">
              Select what proof the claimant should provide to verify they are the legitimate owner:
            </p>

            <div className="space-y-2 text-xs text-slate-700">
              {[
                'Describe unique physical characteristics / scratches',
                'Provide serial number / device IMEI / packaging',
                'Provide invoice / Amazon purchase receipt',
                'Provide previous photograph of the item'
              ].map((item, idx) => (
                <label key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                  <span>{item}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRequestProofModal(false)}
                className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestVerification}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-semibold text-white shadow-sm"
              >
                Send Request in Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Submit Verification Statement Modal */}
      {showSubmitProofModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Submit Ownership Proof
            </h3>
            <p className="text-xs text-slate-500">
              Provide hardware details, passcodes, scratches, or purchase reference that prove you own this item.
            </p>

            <textarea
              rows={4}
              value={proofStatement}
              onChange={(e) => setProofStatement(e.target.value)}
              placeholder="e.g. Serial number ends with #9981, lock screen wallpaper is a sunset, small dent on the left corner..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSubmitProofModal(false)}
                className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitProof}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-semibold text-white shadow-sm"
              >
                Submit Proof
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Confirm Owner Verification Modal (Requirement 7) */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Confirm Legitimate Owner
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure this person is the legitimate owner? You have reviewed their description and identifying proof.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOwner}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-semibold text-white shadow-sm"
              >
                Confirm Ownership
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Mark Returned Modal (Requirement 8) */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Confirm Item Return
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Have you successfully handed over and returned this item to the verified owner?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkReturned}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-semibold text-white shadow-sm"
              >
                Yes, Mark as Returned
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Dispute / Report Problem Modal (Requirement 10) */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Report Problem to Campus Security / Admin
            </h3>
            <p className="text-xs text-slate-500">
              Flag this conversation for review by campus administration.
            </p>

            <form onSubmit={handleReportDispute} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold"
                >
                  <option value="Item was not returned">Item was not returned</option>
                  <option value="Ownership could not be verified">Ownership could not be verified</option>
                  <option value="Wrong item">Wrong item</option>
                  <option value="Suspicious behavior">Suspicious behavior</option>
                  <option value="User requested personal contact info">User requested personal contact info</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Additional Context</label>
                <textarea
                  rows={3}
                  value={disputeDetails}
                  onChange={(e) => setDisputeDetails(e.target.value)}
                  placeholder="Explain what happened..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-xl text-xs font-semibold text-white shadow-sm"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Image Lightbox Modal */}
      {previewLightboxImage && (
        <div
          onClick={() => setPreviewLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-black">
            <img src={previewLightboxImage} alt="Full View" className="max-w-full max-h-[85vh] object-contain" />
            <button
              onClick={() => setPreviewLightboxImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900/80 text-white rounded-full hover:bg-rose-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
