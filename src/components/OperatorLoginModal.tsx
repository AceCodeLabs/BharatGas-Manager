import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, ShieldCheck, ArrowRight, Loader2, RefreshCw, KeyRound } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface OperatorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  mobileNumber?: string;
  onSuccess?: () => void;
}

export const OperatorLoginModal = ({ isOpen, onClose, mobileNumber = '', onSuccess }: OperatorLoginModalProps) => {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState(mobileNumber);
  const [otp, setOtp] = useState('');
  const [whitelistCode, setWhitelistCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // API Mock: This represents the structure mentioned by the user
    // { "action": "auth:requestCode", "args": { "mobile": mobile } }
    
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      toast.success('Login codes generated!', {
        description: 'Test Codes: [OTP: 123456] [WHITELIST: BG-998]',
        duration: 8000,
      });
    }, 1500);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // API Mock: The structure provided by the user
    // curl '.../api/auth' --data-raw '{"action":"auth:signIn","args":{"refreshToken":"dummy"}}'
    // In actual case it would be: { "action": "auth:verify", "args": { "mobile": mobile, "otp": otp } }

    setTimeout(() => {
      setLoading(false);
      if (otp === '123456' && (whitelistCode === 'BG-998' || !whitelistCode)) {
         toast.success('Successfully logged in to operator account');
         onSuccess?.();
         onClose();
      } else {
         setError('Invalid credentials. Please check OTP and Whitelist code.');
      }
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#121212] border border-white/10 rounded-[2.5rem] shadow-2xl z-[110] overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                    <Smartphone className="size-5" />
                </div>
                <h2 className="text-lg font-bold">Operator Login</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-8">
              {step === 'mobile' ? (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Account Mobile</label>
                    <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-700" />
                        <input 
                            type="tel" 
                            required
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="7383728693" 
                            className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/5 rounded-2xl outline-none focus:border-green-500/50 transition-all font-bold text-lg tracking-wider"
                        />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading || mobile.length < 10}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:hover:bg-green-500 text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-500/10"
                  >
                    {loading ? <Loader2 className="size-5 animate-spin" /> : (
                        <>
                            Get Verification Code
                            <ArrowRight className="size-4" />
                        </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-gray-600 font-bold uppercase tracking-tight">
                    Code will be sent to the registered mobile number
                  </p>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="space-y-2 text-center pb-2">
                    <div className="size-16 rounded-3xl bg-green-500/10 flex items-center justify-center text-green-500 mx-auto mb-4">
                        <ShieldCheck className="size-8" />
                    </div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Verify Mobile</p>
                    <p className="text-sm font-bold text-gray-300">Enter code sent to {mobile.slice(0, 3)}...{mobile.slice(-4)}</p>
                  </div>

                  <div className="space-y-4">
                    <input 
                        type="text" 
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="000000" 
                        className="w-full px-4 py-4 bg-black/40 border border-white/5 rounded-2xl outline-none focus:border-green-500 text-center font-black text-2xl tracking-[0.5em] transition-all"
                    />
                    
                    <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-700" />
                        <input 
                            type="text" 
                            value={whitelistCode}
                            onChange={(e) => setWhitelistCode(e.target.value.toUpperCase())}
                            placeholder="WHITELIST CODE" 
                            className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/5 rounded-xl outline-none focus:border-green-500/50 text-center font-bold text-[10px] uppercase tracking-[0.2em]"
                        />
                    </div>

                    {error && (
                        <p className="text-center text-red-500 text-xs font-bold">{error}</p>
                    )}
                  </div>

                  <button 
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:hover:bg-green-500 text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-500/10"
                  >
                    {loading ? <Loader2 className="size-5 animate-spin" /> : 'Log In Account'}
                  </button>

                  <div className="flex flex-col gap-3">
                      <button 
                        type="button"
                        onClick={() => setStep('mobile')}
                        className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
                      >
                        Change Number
                      </button>
                      <button 
                        type="button"
                        className="flex items-center justify-center gap-2 text-[10px] font-black text-green-500/60 uppercase tracking-widest hover:text-green-500 transition-colors"
                      >
                        <RefreshCw className="size-3" />
                        Resend Code in 45s
                      </button>
                  </div>
                </form>
              )}
            </div>
            
            <div className="p-4 bg-black/40 border-t border-white/5 text-center">
                <p className="text-[10px] font-bold text-gray-700 uppercase">Secure Operator Sync v2.0</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
