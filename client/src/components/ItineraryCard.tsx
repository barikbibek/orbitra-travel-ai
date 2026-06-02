import { Link } from 'react-router-dom';
import { MapPin, Calendar, Share2, Trash2 } from 'lucide-react';
import { Itinerary } from '../types';

interface Props {
  itinerary: Itinerary;
  onDelete:  (id: string) => void;
}

export const ItineraryCard = ({ itinerary, onDelete }: Props) => {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

  return (
    <div className="glass-card rounded-2xl p-6 group relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDelete(itinerary._id)}
          className="p-2 rounded-full bg-surface-hover text-muted hover:text-red-400 hover:bg-surface transition-all shadow-sm"
          title="Delete itinerary"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div>
        <div className="flex items-start justify-between mb-4 pr-10">
          <div>
            <h3 className="text-foreground font-semibold text-xl leading-tight group-hover:text-blue-400 transition-colors">
              {itinerary.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-muted text-sm font-medium">
              <MapPin size={14} className="text-blue-500/70" />
              {itinerary.destination}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-muted text-xs mb-6">
          <div className="flex items-center gap-1.5 bg-surface/50 px-2.5 py-1.5 rounded-lg border border-border-subtle">
            <Calendar size={13} className="text-muted" />
            <span>{formatDate(itinerary.startDate)} <span className="mx-1 text-muted">→</span> {formatDate(itinerary.endDate)}</span>
          </div>
          
          {itinerary.isShared && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
              <Share2 size={12} />
              Shared
            </span>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-border-subtle">
        <Link
          to={`/itinerary/${itinerary._id}`}
          className="flex items-center justify-between w-full text-sm text-muted group-hover:text-blue-400 font-medium transition-colors"
        >
          View full details
          <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
};