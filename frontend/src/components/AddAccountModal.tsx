import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, Loader2, KeyRound, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/utils/cn';
import { accountsApi } from '@/services/accountsApi';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const AddAccountModal = ({ isOpen, onClose, onCreated }: AddAccountModalProps) => {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [whitelistCode, setWhitelistCode] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStep('mobile');
    setMobile('');
    setOtp('');
    setWhitelistCode('');
    setDeviceId('');
    setModel('');
    setError(null);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      toast.success('Verification codes sent!', {
        description: 'Test Codes: [OTP: 123456] [WHITELIST: BG-998]',
        duration: 8000,
      });
    }, 800);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await accountsApi.create({
        mobile,
        otp,
        whitelistCode: whitelistCode || undefined,
        deviceId: deviceId || undefined,
        model: model || undefined,
      });
      toast.success('Account linked successfully!');
      onCreated();
      onClose();
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link account');
    } finally {
      setLoading(false);
    }
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#141414] border border-white/10 rounded-[2rem] shadow-2xl z-[70] overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold">{step === 'mobile' ? 'Add BharatGas Account' : 'Verify Account'}</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400">
                <X className="size-5" />
              </button>
            </div>

            <div className="p-8">
              {step === 'mobile' ? (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full px-5 py-4 bg-black/40 border border-green-500/30 rounded-2xl outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all placeholder:text-gray-700 font-bold text-lg"
                    />
                  </div>

                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-widest"
                    >
                      <Settings className="size-3" />
                      Advanced Device Settings
                      <ChevronDown className={cn("size-3 transition-transform", showAdvanced && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {showAdvanced && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-4 overflow-hidden"
                        >
                          <input
                            type="text"
                            value={deviceId}
                            onChange={(e) => setDeviceId(e.target.value)}
                            placeholder="Custom Device ID"
                            className="w-full px-5 py-3 bg-black/20 border border-white/5 rounded-xl text-xs outline-none focus:border-white/20"
                          />
                          <input
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            placeholder="Device Model Name"
                            className="w-full px-5 py-3 bg-black/20 border border-white/5 rounded-xl text-xs outline-none focus:border-white/20"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-600 text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-green-500/10"
                  >
                    {loading ? <Loader2 className="size-5 animate-spin" /> : 'Send Verification OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-400 font-bold mb-1">Verify Mobile</p>
                    <p className="text-xl font-bold text-white tracking-widest">{mobile}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 text-center block">Enter 6-Digit Code</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="000000"
                        className="w-full px-5 py-4 bg-black/40 border border-green-500/30 rounded-2xl outline-none focus:border-green-500 text-center text-2xl font-black tracking-[0.5em]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 text-center block">Whitelist Code (Optional)</label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-700" />
                        <input
                          type="text"
                          value={whitelistCode}
                          onChange={(e) => setWhitelistCode(e.target.value.toUpperCase())}
                          placeholder="BG-XXXX"
                          className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/5 rounded-xl outline-none focus:border-green-500/50 text-center font-bold text-sm tracking-widest"
                        />
                      </div>
                    </div>

                    {error && <p className="text-center text-red-500 text-xs font-bold mt-2">{error}</p>}
                  </div>

                  <div className="flex flex-col gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-green-500 hover:bg-green-600 text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-green-500/10"
                    >
                      {loading ? <Loader2 className="size-5 animate-spin" /> : 'Link Account'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep('mobile')}
                      className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Back to Mobile Number
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="p-4 bg-black/20 border-t border-white/5 flex justify-center">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">BharatGas API Integration Active</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
