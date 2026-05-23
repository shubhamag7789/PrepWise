/**
 * ResumeUploadZone — drag-and-drop PDF upload with JD fields
 */
import { useRef, useState, useCallback } from 'react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import Button from '@components/common/Button';

const ResumeUploadZone = ({ onAnalyze, isLoading }) => {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [showJD, setShowJD] = useState(false);

  const pickFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5 MB.');
      return;
    }
    setFile(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  }, []);

  const handleSubmit = () => {
    if (!file || isLoading) return;
    const fd = new FormData();
    fd.append('resume', file);
    fd.append('targetRole', targetRole);
    if (jobTitle.trim()) fd.append('jobTitle', jobTitle.trim());
    if (jobDescription.trim()) fd.append('jobDescription', jobDescription.trim());
    onAnalyze(fd);
  };

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 space-y-5">
      <div>
        <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Upload Resume</h3>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          PDF only, max 5 MB. AI-powered ATS scan in ~30 seconds.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={clsx(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
          dragOver
            ? 'border-brand-500 bg-brand-500/5'
            : 'border-[var(--color-border)] hover:border-brand-400/50 hover:bg-surface-50 dark:hover:bg-surface-900/30'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
        <div className="text-4xl mb-3">📄</div>
        {file ? (
          <>
            <p className="font-semibold text-[var(--color-text)]">{file.name}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {(file.size / 1024).toFixed(1)} KB — click to change
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold text-[var(--color-text)]">Drop your resume PDF here</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">or click to browse</p>
          </>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1.5">
          Target Role
        </label>
        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Full Stack Developer"
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        />
      </div>

      <button
        type="button"
        onClick={() => setShowJD(!showJD)}
        className="text-sm font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1"
      >
        {showJD ? '▼' : '▶'} Job description matching (optional)
      </button>

      {showJD && (
        <div className="space-y-3 pl-1 border-l-2 border-brand-500/30">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">
              Job Title
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. SDE Intern — Amazon"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={5}
              placeholder="Paste the job description for keyword & requirement matching…"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm resize-y min-h-[120px]"
            />
          </div>
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        isLoading={isLoading}
        disabled={!file || isLoading}
        onClick={handleSubmit}
      >
        {isLoading ? 'Analyzing with AI…' : 'Analyze Resume'}
      </Button>
    </div>
  );
};

export default ResumeUploadZone;
