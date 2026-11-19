import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-amber-50 border-l-4 border-amber-500 p-2.5 px-4 text-xs text-amber-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>ACADEMIC SIMULATION (22ITE61):</strong> Educational simulation only. Not a clinically validated medical decision support system. Never rely on this software for actual patient care.
          </span>
        </div>
        <span className="font-semibold text-amber-700 uppercase tracking-wider text-[10px] bg-amber-100 px-2 py-0.5 rounded">
          Simulation Only
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl p-4 shadow-sm mb-6">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs text-amber-900 leading-relaxed">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-amber-950 uppercase tracking-wide">
              Educational Simulation Notice & Clinical Disclaimer
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-200/80 text-amber-900 rounded-full">
              22ITE61 – Knowledge Engineering
            </span>
          </div>
          <p>
            This application is an educational simulation developed strictly for academic demonstration in Knowledge Engineering. It is <strong>NOT</strong> a clinically validated medical device or decision-support system. All assessments must be reviewed by qualified healthcare professionals.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] text-amber-800 font-medium">
            <span>• Never use to diagnose patients or determine a patient can safely wait.</span>
            <span>• Missing vital signs or symptoms are never assumed to be normal.</span>
            <span>• Lower urgency (Green) results do not imply delay is safe.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
