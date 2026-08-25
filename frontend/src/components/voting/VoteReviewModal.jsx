import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle, CheckCircle2, User } from 'lucide-react';

export function VoteReviewModal({ isOpen, onClose, candidate, electionTitle, onConfirm, isSubmitting }) {
  if (!candidate) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Your Ballot">
      <div className="space-y-5">
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 leading-relaxed">
            <span className="font-semibold">Action Cannot Be Undone.</span> Once submitted, your vote is recorded directly to the session log.
          </div>
        </div>

        <div className="bg-[#141414] border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="text-xs text-zinc-400">Selected Candidate</div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{candidate.name}</div>
              <div className="text-xs text-indigo-400 font-medium">{candidate.party_or_position}</div>
            </div>
          </div>
          {electionTitle && (
            <div className="pt-2 border-t border-zinc-800/80 text-xs text-zinc-400">
              Election: <span className="text-zinc-200 font-medium">{electionTitle}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="md" onClick={onClose} isDisabled={isSubmitting}>
            Change Selection
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={CheckCircle2}
            isLoading={isSubmitting}
            onClick={onConfirm}
          >
            Confirm & Submit Vote
          </Button>
        </div>
      </div>
    </Modal>
  );
}
