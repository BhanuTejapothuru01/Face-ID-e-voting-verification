import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CandidateCard } from '../components/voting/CandidateCard';
import { VoteReviewModal } from '../components/voting/VoteReviewModal';
import { ShieldCheck, Vote, AlertCircle, ArrowRight } from 'lucide-react';

export default function Ballot() {
  const [candidates, setCandidates] = useState([]);
  const [session, setSession] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const voteToken = sessionStorage.getItem('vote_token');
  const voterId = sessionStorage.getItem('voter_id');
  const voterName = sessionStorage.getItem('voter_name');

  useEffect(() => {
    if (!voteToken || !voterId) {
      navigate('/vote');
      return;
    }

    const fetchSessionData = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:8000/api/voting/active-session');
        if (!res.ok) throw new Error('Failed to load election candidates.');
        const data = await res.json();

        if (data.status !== 'ACTIVE' || !data.session) {
          throw new Error('Voting session is no longer active.');
        }

        setSession(data.session);
        setCandidates(
          data.candidates && data.candidates.length > 0
            ? data.candidates
            : [
                { candidate_id: 'CAND-01', name: 'Alex Morgan', party_or_position: 'Alliance Party' },
                { candidate_id: 'CAND-02', name: 'Sarah Chen', party_or_position: 'Reform Voice' },
                { candidate_id: 'CAND-03', name: 'Marcus Vance', party_or_position: 'Independent' },
              ]
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [voteToken, voterId, navigate]);

  const selectedCandidateObj = candidates.find((c) => c.candidate_id === selectedCandidateId);

  const handleConfirmSubmit = async () => {
    if (!selectedCandidateId || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:8000/api/voting/cast-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vote_token: voteToken,
          candidate_id: selectedCandidateId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Vote submission failed.');
      }

      sessionStorage.removeItem('vote_token');
      sessionStorage.setItem('last_vote_timestamp', data.timestamp || new Date().toISOString());

      navigate('/vote/success');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
      setIsReviewOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-6">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-zinc-400">Loading official ballot...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-12 w-full flex-grow">
        <Card className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">{session?.title || 'Official Digital Ballot'}</h2>
                <p className="text-xs text-zinc-400">Authorized for voter: {voterName}</p>
              </div>
            </div>
            <Badge variant="live">SINGLE BALLOT</Badge>
          </div>

          <div className="text-center space-y-1 py-2">
            <h1 className="text-xl font-bold text-white">Select One Candidate</h1>
            <p className="text-xs text-zinc-400">Click a candidate card below to review and confirm your vote.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Candidate Card List */}
          <div className="space-y-3">
            {candidates.map((cand) => (
              <CandidateCard
                key={cand.candidate_id}
                candidate={cand}
                isSelected={selectedCandidateId === cand.candidate_id}
                onSelect={() => setSelectedCandidateId(cand.candidate_id)}
              />
            ))}
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              {selectedCandidateId ? '1 candidate selected' : 'No candidate selected'}
            </span>
            <Button
              variant="primary"
              size="lg"
              isDisabled={!selectedCandidateId || submitting}
              icon={ArrowRight}
              onClick={() => setIsReviewOpen(true)}
            >
              Review Selection
            </Button>
          </div>
        </Card>
      </main>

      {/* Mandatory Review Modal */}
      <VoteReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        candidate={selectedCandidateObj}
        electionTitle={session?.title}
        onConfirm={handleConfirmSubmit}
        isSubmitting={submitting}
      />

      <Footer />
    </div>
  );
}
