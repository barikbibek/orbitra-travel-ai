import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ItineraryCard } from '../components/ItineraryCard';
import { FileUploader } from '../components/FileUploader';
import { getHistoryApi, uploadDocumentsApi, deleteItineraryApi } from '../api/itinerary.api';
import { Itinerary } from '../types';
import { Loader2, Plus, Plane } from 'lucide-react';

export const Dashboard = () => {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const res = await getHistoryApi();
      setItineraries(res.data?.itineraries || []);
    } catch (err) {
      console.error('Failed to fetch itineraries', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this itinerary?')) return;
    
    try {
      await deleteItineraryApi(id);
      setItineraries(prev => prev.filter(it => it._id !== id));
    } catch (err) {
      console.error('Failed to delete itinerary', err);
    }
  };

  const handleGenerate = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setError('');
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('documents', file);
    });

    try {
      const res = await uploadDocumentsApi(formData);
      if (res.data?.itinerary) {
        navigate(`/itinerary/${res.data.itinerary._id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate itinerary. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Generate New Itinerary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-28">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">Create Itinerary</h2>
                <p className="text-muted text-sm leading-relaxed">
                  Upload your travel documents (flights, hotels, bookings) and our AI will generate a complete day-by-day itinerary.
                </p>
              </div>
              
              <div className="glass-card rounded-2xl p-6">
                <FileUploader 
                  onFilesChange={setFiles} 
                  disabled={uploading} 
                />
                
                {error && (
                  <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <span className="flex-1 break-words">{error}</span>
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={files.length === 0 || uploading}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Generating Magic...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Generate Itinerary
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Existing Itineraries */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Your Trips</h2>
              <div className="text-sm text-muted bg-surface/50 px-3 py-1 rounded-full border border-border-subtle">
                {itineraries.length} {itineraries.length === 1 ? 'Trip' : 'Trips'}
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-32">
                <Loader2 className="animate-spin text-blue-500" size={36} />
              </div>
            ) : itineraries.length === 0 ? (
              <div className="glass-card rounded-2xl p-16 text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 border border-border-subtle">
                  <Plane className="text-muted" size={24} />
                </div>
                <p className="text-foreground font-medium text-lg mb-2">No itineraries yet</p>
                <p className="text-sm text-muted max-w-sm">Upload your flight and hotel bookings on the left to instantly generate a personalized travel plan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {itineraries.map(itinerary => (
                  <ItineraryCard 
                    key={itinerary._id} 
                    itinerary={itinerary} 
                    onDelete={handleDelete} 
                  />
                ))}
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
};
