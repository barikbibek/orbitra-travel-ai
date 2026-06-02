import { useCallback, useState } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';

interface Props {
  onFilesChange: (files: File[]) => void;
  disabled?:     boolean;
}

export const FileUploader = ({ onFilesChange, disabled }: Props) => {
  const [files,    setFiles]    = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  const addFiles = (incoming: File[]) => {
    const allowed = ['application/pdf', 'image/jpeg',
                     'image/jpg', 'image/png', 'image/webp'];

    const valid = incoming.filter(f => allowed.includes(f.type));
    const merged = [...files, ...valid].slice(0, 5); // max 5
    setFiles(merged);
    onFilesChange(merged);
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesChange(updated);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [files]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const isPdf = (file: File) => file.type === 'application/pdf';

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ease-out overflow-hidden group
          ${dragging
            ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
            : 'border-border-subtle hover:border-blue-500/50 bg-surface/20 hover:bg-surface/40'}
          ${disabled ? 'opacity-50 cursor-not-allowed border-border-subtle' : 'cursor-pointer'}
        `}
        onClick={() => !disabled && document.getElementById('fileInput')?.click()}
      >
        {/* Subtle background glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${dragging ? 'bg-blue-500/20 text-blue-400' : 'bg-surface border border-border-subtle text-muted group-hover:text-blue-400 group-hover:border-blue-500/30 group-hover:bg-blue-500/10'}`}>
            <Upload size={28} />
          </div>
          
          <p className="text-foreground font-semibold text-lg tracking-tight mb-1">
            Click or drag files here
          </p>
          <p className="text-muted text-sm">
            PDF, JPG, PNG, WEBP up to 10MB
          </p>
        </div>

        <input
          id="fileInput"
          type="file"
          multiple
          accept=".pdf,image/*"
          className="hidden"
          onChange={onInputChange}
          disabled={disabled}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2.5 mt-4">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-surface/60 border border-border-subtle rounded-xl px-4 py-3 group hover:border-blue-500/50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-surface shrink-0">
                {isPdf(file)
                  ? <FileText size={18} className="text-red-400" />
                  : <Image    size={18} className="text-blue-400" />
                }
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium truncate">
                  {file.name}
                </p>
                <p className="text-muted text-xs mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="text-muted hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                title="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};