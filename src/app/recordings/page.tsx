'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Pause, Phone, Clock, Building2, Download, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { formatDistanceToNow } from 'date-fns';

interface Recording {
  id: string;
  recordingUrl: string;
  phoneNumber: string;
  businessName: string;
  leadId?: string;
  status: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
}

export default function RecordingsPage() {
  const [loading, setLoading] = useState(true);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadRecordings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recordings');
      const data = await res.json();
      if (data.recordings) {
        setRecordings(data.recordings);
      }
    } catch (e) {
      console.error('Failed to load recordings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecordings();
  }, []);

  const togglePlay = (recording: Recording) => {
    if (playingId === recording.id) {
      // Pause
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      // Play new
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(recording.recordingUrl);
      audioRef.current.play();
      audioRef.current.onended = () => setPlayingId(null);
      setPlayingId(recording.id);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Unknown';
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 p-4 md:p-8 font-sans">
      <div className="fixed inset-0 z-[-1] opacity-60">
        <AnimatedBackground />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              Call Recordings
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-light">
              Listen to recorded AI sales calls and review performance.
            </p>
          </div>
          <Button 
            onClick={loadRecordings} 
            disabled={loading}
            variant="outline"
            className="rounded-full h-12 px-6"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Recordings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="rounded-[2rem] border-none shadow-xl bg-white/80 backdrop-blur-xl overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-purple-100 text-purple-600">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-800">Recent Calls</CardTitle>
                  <CardDescription>Calls with available recordings</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {loading ? (
                <div className="p-20 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
                  <p className="text-slate-500 mt-4">Loading recordings...</p>
                </div>
              ) : recordings.length === 0 ? (
                <div className="p-20 text-center">
                  <Phone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900">No recordings yet</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mt-2">
                    Recordings will appear here after your AI makes calls with recording enabled.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recordings.map((recording, i) => (
                    <motion.div
                      key={recording.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-6 flex items-center gap-4 hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Play Button */}
                      <button
                        onClick={() => togglePlay(recording)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          playingId === recording.id 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                            : 'bg-slate-100 text-slate-600 hover:bg-purple-100 hover:text-purple-600'
                        }`}
                      >
                        {playingId === recording.id ? (
                          <Pause size={20} fill="currentColor" />
                        ) : (
                          <Play size={20} fill="currentColor" />
                        )}
                      </button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-slate-400" />
                          <p className="font-semibold text-slate-900 truncate">{recording.businessName}</p>
                        </div>
                        <p className="text-sm text-slate-500 font-mono">{recording.phoneNumber}</p>
                      </div>

                      {/* Duration */}
                      <div className="text-right hidden md:block">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Clock size={14} />
                          <span className="font-mono">{formatDuration(recording.duration)}</span>
                        </div>
                        <p className="text-xs text-slate-400">{getTimeAgo(recording.startedAt)}</p>
                      </div>

                      {/* Status Badge */}
                      <Badge 
                        variant="secondary"
                        className={`capitalize ${
                          recording.status === 'ended' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100'
                        }`}
                      >
                        {recording.status}
                      </Badge>

                      {/* Download */}
                      <a 
                        href={recording.recordingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                      >
                        <Download size={18} />
                      </a>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
