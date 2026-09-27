import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, ArrowRight, CheckCircle2, Box, ExternalLink, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'expired';

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [amzState, setAmzState] = useState<ConnectionState>('disconnected');
  const [flpState, setFlpState] = useState<ConnectionState>('disconnected');
  const [amzProfile, setAmzProfile] = useState<any>(null);
  const [flpProfile, setFlpProfile] = useState<any>(null);

  useEffect(() => {
    checkStatus();
  }, [searchParams]);

  const checkStatus = async () => {
    try {
      const amzRes = await fetch('/api/auth/amazon/status');
      const amzData = await amzRes.json();
      if (amzData.connected) {
        setAmzState('connected');
        setAmzProfile(amzData);
      } else if (amzData.expired) {
        setAmzState('expired');
      }

      const flpRes = await fetch('/api/auth/flipkart/status');
      const flpData = await flpRes.json();
      if (flpData.connected) {
        setFlpState('connected');
        setFlpProfile(flpData);
      } else if (flpData.expired) {
        setFlpState('expired');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = async (platform: 'amazon' | 'flipkart') => {
    if (platform === 'amazon') setAmzState('connecting');
    if (platform === 'flipkart') setFlpState('connecting');

    try {
      const res = await fetch(`/api/auth/${platform}/url`);
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      if (platform === 'amazon') setAmzState('disconnected');
      if (platform === 'flipkart') setFlpState('disconnected');
    }
  };

  const isReady = amzState === 'connected' || flpState === 'connected';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="card w-full max-w-md p-8 relative z-10 animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-surfaceLight rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-border">
            <Box className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text">Seller Verification</h1>
          <p className="text-textMuted text-center mt-2 text-sm">
            Connect your marketplace accounts to authenticate and sync.
          </p>
        </div>

        <div className="space-y-4">
          {/* Amazon Button */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleConnect('amazon')}
              disabled={amzState === 'connected' || amzState === 'connecting'}
              className={clsx(
                'w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300',
                amzState === 'connected' 
                  ? 'bg-success/10 border-success/30 text-success' 
                  : amzState === 'expired'
                  ? 'bg-danger/10 border-danger/30 text-danger hover:border-danger/50'
                  : 'bg-surfaceLight border-border hover:border-primary/50 hover:bg-surfaceLight/80 text-text'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={clsx('p-2 rounded-lg', amzState === 'connected' ? 'bg-success/20' : amzState === 'expired' ? 'bg-danger/20' : 'bg-surface')}>
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm">
                  Amazon Seller Central
                </span>
              </div>
              {amzState === 'disconnected' && <span className="text-xs font-medium text-textMuted bg-surface px-2 py-1 rounded">Connect</span>}
              {amzState === 'connecting' && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
              {amzState === 'connected' && <span className="flex items-center gap-1 text-xs"><CheckCircle2 className="w-4 h-4" /> Connected</span>}
              {amzState === 'expired' && <span className="flex items-center gap-1 text-xs"><AlertCircle className="w-4 h-4" /> Reconnect</span>}
            </button>
            {amzProfile && (
              <div className="bg-surfaceLight/50 p-3 rounded-lg border border-border/50 text-xs text-textMuted animate-fade-in">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-text">Seller ID:</span>
                  <span>{amzProfile.sellerId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text">Marketplaces:</span>
                  <span className="flex items-center gap-1">
                    {amzProfile.marketplaces?.[0]?.name} <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Flipkart Button */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleConnect('flipkart')}
              disabled={flpState === 'connected' || flpState === 'connecting'}
              className={clsx(
                'w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300',
                flpState === 'connected' 
                  ? 'bg-success/10 border-success/30 text-success' 
                  : flpState === 'expired'
                  ? 'bg-danger/10 border-danger/30 text-danger hover:border-danger/50'
                  : 'bg-surfaceLight border-border hover:border-primary/50 hover:bg-surfaceLight/80 text-text'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={clsx('p-2 rounded-lg', flpState === 'connected' ? 'bg-success/20' : flpState === 'expired' ? 'bg-danger/20' : 'bg-surface')}>
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm">
                  Flipkart Seller Hub
                </span>
              </div>
              {flpState === 'disconnected' && <span className="text-xs font-medium text-textMuted bg-surface px-2 py-1 rounded">Connect</span>}
              {flpState === 'connecting' && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
              {flpState === 'connected' && <span className="flex items-center gap-1 text-xs"><CheckCircle2 className="w-4 h-4" /> Connected</span>}
              {flpState === 'expired' && <span className="flex items-center gap-1 text-xs"><AlertCircle className="w-4 h-4" /> Reconnect</span>}
            </button>
            {flpProfile && (
              <div className="bg-surfaceLight/50 p-3 rounded-lg border border-border/50 text-xs text-textMuted animate-fade-in">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-text">Seller ID:</span>
                  <span>{flpProfile.sellerId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text">Store Name:</span>
                  <span>{flpProfile.profile?.name} (★ {flpProfile.profile?.rating})</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <button
            onClick={() => navigate('/dashboard')}
            disabled={!isReady}
            className="btn btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            Enter Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
          {!isReady && (
            <p className="text-xs text-center text-textMuted mt-3">
              Please verify at least one account to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

