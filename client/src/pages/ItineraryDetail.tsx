import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { getItineraryApi, toggleShareApi } from '../api/itinerary.api';
import { Itinerary } from '../types';
import { Loader2, MapPin, Calendar, Share2, ArrowLeft, Copy, Check, X, Twitter, MessageCircle } from 'lucide-react';

export const ItineraryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  useEffect(() => {
    if (id) {
      fetchItinerary(id);
    }
  }, [id]);

  const fetchItinerary = async (itineraryId: string) => {
    try {
      setLoading(true);
      const res = await getItineraryApi(itineraryId);
      setItinerary(res.data?.itinerary || null);
    } catch (err: any) {
      setError('Failed to load itinerary details.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShare = async () => {
    if (!itinerary) return;
    try {
      setSharing(true);
      const res = await toggleShareApi(itinerary._id);
      setItinerary({
        ...itinerary,
        isShared: res.data?.isShared ?? false,
        shareToken: res.data?.isShared ? (res.data as any).shareUrl?.split('/').pop() || itinerary.shareToken : ''
      });
    } catch (err) {
      console.error('Failed to toggle share status');
    } finally {
      setSharing(false);
    }
  };

  const handleShareClick = async () => {
    if (!itinerary) return;
    if (!itinerary.isShared) {
      await handleToggleShare();
    }
    setIsShareModalOpen(true);
  };

  const handleCopyLink = () => {
    if (!itinerary?.shareToken) return;
    const url = `${window.location.origin}/share/${itinerary.shareToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = itinerary?.shareToken ? `${window.location.origin}/share/${itinerary.shareToken}` : '';

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-sans flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-background font-sans flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
          <p className="text-red-400 text-xl mb-4">{error || 'Itinerary not found'}</p>
          <Link to="/dashboard" className="text-blue-400 hover:text-blue-300">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans pb-12">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted hover:text-blue-400 transition-colors mb-8 text-sm font-medium">
          <ArrowLeft size={16} />
          Back to Trips
        </Link>

        {/* Header Section */}
        <div className="glass-card rounded-3xl p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight leading-tight">{itinerary.title}</h1>
              
              <div className="flex flex-wrap items-center gap-5 text-muted text-sm font-medium">
                <div className="flex items-center gap-2 bg-surface/50 px-3 py-1.5 rounded-lg border border-border-subtle">
                  <MapPin size={16} className="text-blue-400" />
                  {itinerary.destination}
                </div>
                <div className="flex items-center gap-2 bg-surface/50 px-3 py-1.5 rounded-lg border border-border-subtle">
                  <Calendar size={16} className="text-blue-400" />
                  {formatDate(itinerary.startDate)} &mdash; {formatDate(itinerary.endDate)}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
              <button
                onClick={handleShareClick}
                disabled={sharing}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                  itinerary.isShared 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                    : 'bg-blue-600 text-white border border-blue-500 hover:bg-blue-700 shadow-blue-500/20'
                }`}
              >
                {sharing ? <Loader2 className="animate-spin" size={16} /> : <Share2 size={16} />}
                {itinerary.isShared ? 'Share Trip' : 'Share Trip'}
              </button>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsShareModalOpen(false)}></div>
            <div className="relative w-full max-w-md bg-surface border border-border-subtle shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Share2 className="text-blue-400" size={20} />
                  Share Itinerary
                </h3>
                <button onClick={() => setIsShareModalOpen(false)} className="text-muted hover:text-foreground transition-colors bg-surface-hover hover:bg-surface p-2 rounded-full">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <p className="text-sm text-muted">
                  Anyone with this link can view your itinerary.
                </p>

                <div className="flex items-center gap-2 bg-background/50 border border-border-subtle rounded-xl p-2 pl-4 shadow-inner">
                  <span className="text-sm font-medium text-muted truncate flex-1 select-all">
                    {shareUrl}
                  </span>
                  <button 
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors font-medium text-sm shadow-md"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-muted mb-3 uppercase tracking-widest">Share via</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <a 
                      href={`https://wa.me/?text=${encodeURIComponent(`Check out this trip itinerary: ${shareUrl}`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl transition-colors font-medium text-sm"
                    >
                      <MessageCircle size={18} />
                      WhatsApp
                    </a>
                    <a 
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this trip itinerary!`)}&url=${encodeURIComponent(shareUrl)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-xl transition-colors font-medium text-sm"
                    >
                      <Twitter size={18} />
                      Twitter / X
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-border-subtle">
                  <button 
                    onClick={() => {
                      handleToggleShare();
                      setIsShareModalOpen(false);
                    }}
                    className="w-full py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    Disable public link
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Days Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground mb-6 tracking-tight flex items-center gap-2">
            <span className="w-8 h-1 bg-blue-500 rounded-full inline-block mr-2"></span>
            Daily Itinerary
          </h2>
          
          {itinerary.days.map((day, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-5 border-b border-border-subtle">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-400">{day.day}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{new Date(day.date).toLocaleDateString('en-IN', { weekday: 'long' })}</h3>
                    <div className="text-sm text-muted font-medium">
                      {new Date(day.date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                </div>
                {day.location && (
                  <div className="mt-4 sm:mt-0 flex items-center gap-1.5 bg-surface/50 px-3 py-1.5 rounded-lg border border-border-subtle text-sm font-medium text-muted">
                    <MapPin size={14} className="text-blue-400" /> 
                    {day.location}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-muted mb-3 uppercase tracking-widest">Activities</h4>
                    <ul className="space-y-3">
                      {day.activities.map((act, i) => (
                        <li key={i} className="flex items-start gap-3 text-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                          <span className="leading-relaxed">{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {day.notes && (
                    <div className="bg-surface/40 p-4 rounded-xl border border-border-subtle">
                      <h4 className="text-xs font-bold text-muted mb-2 uppercase tracking-widest">Notes</h4>
                      <p className="text-sm text-muted leading-relaxed italic">{day.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {day.accommodation && (
                    <div className="bg-surface/60 p-5 rounded-xl border border-border-subtle hover:border-blue-500/50 transition-colors">
                      <h4 className="text-xs font-bold text-blue-400 mb-2 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Accommodation
                      </h4>
                      <p className="text-sm text-foreground font-medium leading-relaxed">{day.accommodation}</p>
                    </div>
                  )}
                  {day.transport && (
                    <div className="bg-surface/60 p-5 rounded-xl border border-border-subtle hover:border-blue-500/50 transition-colors">
                      <h4 className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Transport
                      </h4>
                      <p className="text-sm text-foreground font-medium leading-relaxed">{day.transport}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
