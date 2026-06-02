import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSharedApi } from '../api/itinerary.api';
import { Itinerary } from '../types';
import { Loader2, MapPin, Calendar, Plane } from 'lucide-react';

export const SharedItinerary = () => {
  const { token } = useParams<{ token: string }>();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetchSharedItinerary(token);
    }
  }, [token]);

  const fetchSharedItinerary = async (shareToken: string) => {
    try {
      setLoading(true);
      const res = await getSharedApi(shareToken);
      setItinerary(res.data?.itinerary || null);
    } catch (err: any) {
      setError('This shared itinerary link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-sans flex flex-col justify-center items-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-background font-sans flex flex-col justify-center items-center text-center px-4">
        <Plane className="text-muted mb-4" size={48} />
        <p className="text-red-400 text-xl mb-6">{error || 'Itinerary not found'}</p>
        <Link to="/" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
          Go to OrbiTravelAI
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans pb-12">
      {/* Read-Only Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border-subtle/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <Plane className="text-white" size={18} />
            </div>
            Orbitravel<span className="text-blue-500">AI</span>
          </Link>
          <div className="text-muted text-sm font-medium bg-surface/50 px-3 py-1.5 rounded-full border border-border-subtle">Shared View</div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-6 py-10">
        
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
          </div>
        </div>

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
      
      <div className="mt-16 mb-8 text-center px-4">
        <div className="inline-block glass-card p-8 rounded-3xl max-w-lg w-full">
          <h3 className="text-xl font-bold text-foreground mb-2">Want to create your own AI itineraries?</h3>
          <p className="text-muted text-sm mb-6">Join OrbiTravelAI and start planning your dream trips in seconds.</p>
          <Link to="/register" className="inline-block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] font-semibold">
            Sign up for free
          </Link>
        </div>
      </div>
    </div>
  );
};
