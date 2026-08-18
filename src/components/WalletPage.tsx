import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { TopUpModal } from './TopUpModal';
import { WithdrawModal } from './WithdrawModal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User } from '../App';
import { ArrowLeft, Plus, Send, Smartphone, Building, CreditCard, ChevronRight, QrCode, Download, UserPlus, Wifi, ArrowDownToLine, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { InlinePinPad } from './ui/PinPad';
import { getDemoBalance, setDemoBalance, DEMO_LINKED_ACCOUNTS, addDemoTransaction, updateDemoRewards } from '../utils/demoData';

interface WalletPageProps {
  user: User;
  accessToken: string;
  onBack: () => void;
  onNavigate?: (page: 'cards' | 'export' | 'international') => void;
  isDemoMode?: boolean;
}

interface LinkedAccount {
  id: string;
  type: string;
  provider: string;
  accountNumber: string;
}

export function WalletPage({ user, accessToken, onBack, onNavigate, isDemoMode }: WalletPageProps) {
  const [balance, setBalance] = useState(0);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showRequestMoney, setShowRequestMoney] = useState(false);
  const [showLinkAccount, setShowLinkAccount] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQRCodeData] = useState<{ qrCode: string; amount: number } | null>(null);

  const [addFundsData, setAddFundsData] = useState({
    amount: '',
    source: '',
    pin: '',
    idempotencyKey: crypto.randomUUID(),
  });

  const [sendMoneyData, setSendMoneyData] = useState({
    recipient: '',
    amount: '',
    pin: '',
    idempotencyKey: crypto.randomUUID(),
  });

  const [requestMoneyData, setRequestMoneyData] = useState({
    recipient: '',
    amount: '',
    message: '',
  });

  const [linkAccountData, setLinkAccountData] = useState({
    type: '',
    provider: '',
    accountNumber: '',
    pin: '',
  });

  const [qrAmount, setQrAmount] = useState('');

  useEffect(() => {
    if (!accessToken) return;

    fetchWalletData();
    fetchLinkedAccounts();

    const supabase = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } },
    );

    const channel = supabase
      .channel('wallet-transactions')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'transactions' },
        (payload) => {
          const tx = payload.new as { status: string; type: string };
          if (tx.status === 'completed' && tx.type === 'topup') {
            fetchWalletData();
            toast.success('Fedha zimeongezwa kwenye akaunti yako!');
          }
          if (tx.status === 'completed' && tx.type === 'p2p_send') {
            fetchWalletData();
          }
          if (tx.status === 'failed' && (tx.type === 'withdrawal' || tx.type === 'p2p_send')) {
            fetchWalletData();
            toast.error('Uhamisho umeshindwa. Salio limerudishwa.');
          }
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [accessToken]);

  const fetchWalletData = async () => {
    if (isDemoMode) {
      setBalance(getDemoBalance());
    } else {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-69a10ee8/wallet/balance`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setBalance(data.balance || 0);
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      }
    }
  };

  const fetchLinkedAccounts = async () => {
    if (isDemoMode) {
      setLinkedAccounts(DEMO_LINKED_ACCOUNTS);
    } else {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-69a10ee8/wallet/linked-accounts`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setLinkedAccounts(data.accounts || []);
        }
      } catch (error) {
        console.error('Error fetching linked accounts:', error);
      }
    }
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDemoMode) {
      setDemoBalance(balance + parseFloat(addFundsData.amount));
      setShowAddFunds(false);
      setAddFundsData({ amount: '', source: '', pin: '' });
      fetchWalletData();
      toast.success('Funds added successfully!');
    } else {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-69a10ee8/wallet/add-funds`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(addFundsData),
          }
        );

        if (response.ok) {
          setShowAddFunds(false);
          setAddFundsData({ amount: '', source: '', pin: '', idempotencyKey: crypto.randomUUID() });
          fetchWalletData();
          toast.success('Funds added successfully!');
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to add funds');
        }
      } catch (error) {
        console.error('Error adding funds:', error);
        toast.error('An error occurred');
      }
    }
  };

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDemoMode) {
      setDemoBalance(balance - parseFloat(sendMoneyData.amount));
      addDemoTransaction({
        type: 'send',
        amount: parseFloat(sendMoneyData.amount),
        recipient: sendMoneyData.recipient,
      });
      setShowSendMoney(false);
      setSendMoneyData({ recipient: '', amount: '', pin: '' });
      fetchWalletData();
      toast.success('Money sent successfully!');
    } else {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-69a10ee8/wallet/send-money`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(sendMoneyData),
          }
        );

        if (response.ok) {
          setShowSendMoney(false);
          setSendMoneyData({ recipient: '', amount: '', pin: '', idempotencyKey: crypto.randomUUID() });
          fetchWalletData();
          toast.success('Money sent successfully!');
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to send money');
        }
      } catch (error) {
        console.error('Error sending money:', error);
        toast.error('An error occurred');
      }
    }
  };

  const handleRequestMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDemoMode) {
      addDemoTransaction({
        type: 'request',
        amount: parseFloat(requestMoneyData.amount),
        recipient: requestMoneyData.recipient,
        message: requestMoneyData.message,
      });
      setShowRequestMoney(false);
      setRequestMoneyData({ recipient: '', amount: '', message: '' });
      toast.success('Money request sent successfully!');
    } else {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-69a10ee8/wallet/request-money`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(requestMoneyData),
          }
        );

        if (response.ok) {
          setShowRequestMoney(false);
          setRequestMoneyData({ recipient: '', amount: '', message: '' });
          toast.success('Money request sent successfully!');
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to request money');
        }
      } catch (error) {
        console.error('Error requesting money:', error);
        toast.error('An error occurred');
      }
    }
  };

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDemoMode) {
      setLinkedAccounts([...linkedAccounts, linkAccountData]);
      setShowLinkAccount(false);
      setLinkAccountData({ type: '', provider: '', accountNumber: '', pin: '' });
      fetchLinkedAccounts();
      toast.success('Account linked successfully!');
    } else {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-69a10ee8/wallet/link-account`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(linkAccountData),
          }
        );

        if (response.ok) {
          setShowLinkAccount(false);
          setLinkAccountData({ type: '', provider: '', accountNumber: '', pin: '' });
          fetchLinkedAccounts();
          toast.success('Account linked successfully!');
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to link account');
        }
      } catch (error) {
        console.error('Error linking account:', error);
        toast.error('An error occurred');
      }
    }
  };

  const handleGenerateQR = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-69a10ee8/wallet/generate-qr`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ amount: qrAmount }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setQRCodeData(data);
        setShowQRCode(true);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('An error occurred');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'mobile_money':
        return <Smartphone className="size-6 text-blue-600" />;
      case 'bank':
        return <Building className="size-6 text-green-600" />;
      case 'card':
        return <CreditCard className="size-6 text-purple-600" />;
      default:
        return <Smartphone className="size-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-4 pt-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full"
            >
              <ArrowLeft className="size-5 text-white" />
            </button>
            <h1 className="text-white text-xl">Wallet</h1>
          </div>
          
          <div className="bg-white rounded-3xl p-6">
            <p className="text-gray-500 text-sm mb-1">Available Balance</p>
            <div className="text-3xl text-gray-900 mb-6">{formatCurrency(balance)}</div>
            
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => { setShowAddFunds(true); setShowTopUpModal(true); }}
                className="flex flex-col items-center gap-1 p-3 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all"
              >
                <div className="bg-blue-600 p-2 rounded-xl">
                  <Plus className="size-4 text-white" />
                </div>
                <span className="text-xs text-center">Add Money</span>
              </button>
              <button
                onClick={() => setShowSendMoney(true)}
                className="flex flex-col items-center gap-1 p-3 bg-green-50 hover:bg-green-100 rounded-2xl transition-all"
              >
                <div className="bg-green-600 p-2 rounded-xl">
                  <Send className="size-4 text-white" />
                </div>
                <span className="text-xs text-center">Send</span>
              </button>
              <button
                onClick={() => setShowRequestMoney(true)}
                className="flex flex-col items-center gap-1 p-3 bg-purple-50 hover:bg-purple-100 rounded-2xl transition-all"
              >
                <div className="bg-purple-600 p-2 rounded-xl">
                  <Download className="size-4 text-white" />
                </div>
                <span className="text-xs text-center">Request</span>
              </button>
              <button
                onClick={handleGenerateQR}
                className="flex flex-col items-center gap-1 p-3 bg-orange-50 hover:bg-orange-100 rounded-2xl transition-all"
              >
                <div className="bg-orange-600 p-2 rounded-xl">
                  <QrCode className="size-4 text-white" />
                </div>
                <span className="text-xs text-center">My QR</span>
              </button>
            </div>
            <div className="mt-2">
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="w-full flex flex-col items-center gap-1 p-3 bg-red-50 hover:bg-red-100 rounded-2xl transition-all"
              >
                <div className="bg-red-600 p-2 rounded-xl">
                  <ArrowDownToLine className="size-4 text-white" />
                </div>
                <span className="text-xs text-center">Withdraw</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 pb-6 space-y-6">
        {/* Featured Quick Transfer Card */}
        <div className="relative bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-3xl p-6 text-white overflow-hidden shadow-2xl group hover:shadow-emerald-500/20 transition-all duration-500">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/20 rounded-full -ml-24 -mb-24 blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-emerald-300/10 rounded-full blur-xl animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-white/25 backdrop-blur-md p-2 rounded-xl border border-white/30">
                    <Building className="size-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Instant Transfer</span>
                </div>
                <h3 className="text-2xl font-bold mb-1 text-[rgb(248,250,255)]">DuitNow Transfer</h3>
                <p className="text-sm text-emerald-100">Send money instantly to any bank</p>
              </div>
              <div className="bg-white/15 backdrop-blur-md p-3 rounded-2xl border border-white/30 hover:bg-white/25 transition-all cursor-pointer group-hover:scale-110 duration-300">
                <ChevronRight className="size-6 text-white" />
              </div>
            </div>
            
            {/* Account ID Badge */}
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 border border-white/30 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-400/30 p-2.5 rounded-xl">
                    <Wifi className="size-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-100 mb-0.5">Your Transfer ID</p>
                    <p className="text-lg font-bold font-mono tracking-wider text-[rgb(240,243,250)]">goPay-{user.phone.slice(-4)}</p>
                  </div>
                </div>
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-medium transition-all active:scale-95">
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Money Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Quick Add Money</h3>
            <span className="text-xs text-gray-500">Choose method</span>
          </div>
          
          <div className="space-y-4">
            {/* Featured Card - Bank Cards (Large Hero) */}
            <button
              onClick={() => setShowLinkAccount(true)}
              className="group relative w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-[32px] p-8 text-white overflow-hidden shadow-2xl hover:shadow-purple-500/40 transition-all duration-700 active:scale-[0.98] min-h-[220px]"
            >
              {/* Animated mesh gradient background */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
              </div>
              
              {/* Shimmer sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>
              
              {/* Floating orbs */}
              <div className="absolute top-8 right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 group-hover:translate-x-4 transition-all duration-700"></div>
              <div className="absolute bottom-8 left-12 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-all duration-500"></div>
              
              {/* Card chip decoration */}
              <div className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-lg border-2 border-white/30 group-hover:rotate-12 transition-transform duration-500"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-white/25 backdrop-blur-xl p-3 rounded-2xl border border-white/40 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <CreditCard className="size-7 text-white" />
                      </div>
                      <div className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30">
                        <span className="text-xs font-bold uppercase tracking-wider">Recommended</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black mb-1 tracking-tight text-[rgb(248,250,255)]">Credit & Debit Cards</h3>
                      <p className="text-sm text-purple-100 font-medium">Visa • Mastercard • All major banks</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                    <div className="w-8 h-2 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30 group-hover:translate-x-2 transition-transform duration-300">
                    <ChevronRight className="size-6 text-white" />
                  </div>
                </div>
              </div>
            </button>

            {/* Two Cards Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Reload PIN - Compact Card */}
              <button
                className="group relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-[28px] p-6 text-white overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 active:scale-95 min-h-[180px]"
              >
                {/* Cyberpunk grid */}
                <div className="absolute inset-0 opacity-20">
                  <div className="h-full w-full" style={{
                    backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.5) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                  }}></div>
                </div>
                
                {/* Neon glow lines */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
                  <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-purple-500 to-transparent"></div>
                  <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-pink-500 to-transparent"></div>
                </div>
                
                {/* Glow orb */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                
                {/* Lightning decoration */}
                <div className="absolute top-3 right-3 opacity-10 group-hover:opacity-30 transition-opacity duration-300">
                  <svg className="w-12 h-12 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                  </svg>
                </div>
                
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50 border-2 border-purple-400/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      <Smartphone className="size-7 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl mb-1 tracking-tight text-[rgb(248,250,255)]">Reload PIN</h4>
                      <p className="text-xs text-gray-400 font-medium">Instant code top-up</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <ChevronRight className="size-5 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </button>

              {/* International - Animated Rainbow */}
              {onNavigate && (
                <button
                  onClick={() => onNavigate('international')}
                  className="group relative rounded-[28px] p-6 text-white overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-500 active:scale-95 min-h-[180px]"
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 25%, #ffd93d 50%, #6bcf7f 75%, #4d96ff 100%)',
                    backgroundSize: '300% 300%',
                    animation: 'gradient-shift 8s ease infinite'
                  }}
                >
                  {/* Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200"></div>
                  
                  {/* Sparkles */}
                  <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white/60 rounded-full animate-ping"></div>
                    <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-white/70 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute top-1/2 right-1/2 w-1 h-1 bg-white/80 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                  </div>
                  
                  {/* NEW Badge */}
                  <div className="absolute top-3 right-3 z-20">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white blur-lg animate-pulse"></div>
                      <span className="relative bg-white text-rose-600 text-[10px] font-black px-2.5 py-1 rounded-full shadow-2xl uppercase tracking-widest">
                        New
                      </span>
                    </div>
                  </div>
                  
                  {/* Globe rings */}
                  <div className="absolute -bottom-6 -right-6 w-28 h-28 border-4 border-white/20 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
                  <div className="absolute -bottom-3 -right-3 w-20 h-20 border-2 border-white/30 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                  
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className="space-y-3">
                      <div className="bg-white/30 backdrop-blur-xl w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/50 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300">
                        <UserPlus className="size-7 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xl mb-1 tracking-tight drop-shadow-lg">International</h4>
                        <p className="text-xs font-semibold drop-shadow-md opacity-95">180+ countries</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5">
                        <div className="w-1 h-4 bg-white/70 rounded-full"></div>
                        <div className="w-1 h-6 bg-white/90 rounded-full"></div>
                        <div className="w-1 h-3 bg-white/70 rounded-full"></div>
                        <div className="w-1 h-5 bg-white/80 rounded-full"></div>
                      </div>
                      <ChevronRight className="size-5 text-white/80 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Linked Payment Methods */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Payment Methods</h3>
              <p className="text-xs text-gray-500">Manage your linked accounts</p>
            </div>
            <button 
              onClick={() => setShowLinkAccount(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 shadow-lg shadow-green-600/20"
            >
              <Plus className="size-4" />
              Add New
            </button>
          </div>
          
          {linkedAccounts.length === 0 ? (
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 border-2 border-dashed border-gray-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-green-100 rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-100 rounded-full -ml-20 -mb-20 blur-3xl opacity-50"></div>
              
              <div className="relative z-10 text-center">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-green-600/30">
                  <CreditCard className="size-10 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">No payment methods yet</h4>
                <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">Link your bank account or card to start adding money to your wallet instantly</p>
                <Button 
                  onClick={() => setShowLinkAccount(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-600/30 px-6 py-6 text-base rounded-2xl"
                >
                  <Plus className="size-5 mr-2" />
                  Add Your First Method
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {linkedAccounts.map((account, index) => (
                <div
                  key={account.id}
                  className="group relative bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-green-300 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 cursor-pointer overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {getAccountIcon(account.type)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-0.5">{account.provider}</p>
                        <p className="text-sm text-gray-500 font-mono">
                          {account.accountNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold text-green-700">Active</span>
                      </div>
                      <ChevronRight className="size-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Funds Dialog */}
      <Dialog open={showAddFunds} onOpenChange={setShowAddFunds}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Add Money</DialogTitle>
            <DialogDescription>Reload your wallet balance</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddFunds} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-amount">Amount (TZS)</Label>
              <Input
                id="add-amount"
                type="number"
                placeholder="10,000"
                className="h-12 rounded-xl"
                value={addFundsData.amount}
                onChange={(e) => setAddFundsData({ ...addFundsData, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-source">Payment Method</Label>
              <Select
                value={addFundsData.source}
                onValueChange={(value) => setAddFundsData({ ...addFundsData, source: value })}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {linkedAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.provider} - {account.accountNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>PIN</Label>
              <InlinePinPad
                value={addFundsData.pin}
                onChange={(v) => setAddFundsData({ ...addFundsData, pin: v })}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl"
            >
              Add Money
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Send Money Dialog */}
      <Dialog open={showSendMoney} onOpenChange={setShowSendMoney}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Send Money</DialogTitle>
            <DialogDescription>Transfer to any mobile number</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendMoney} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="send-recipient">Recipient Phone Number</Label>
              <Input
                id="send-recipient"
                placeholder="+255 XXX XXX XXX"
                className="h-12 rounded-xl"
                value={sendMoneyData.recipient}
                onChange={(e) => setSendMoneyData({ ...sendMoneyData, recipient: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="send-amount">Amount (TZS)</Label>
              <Input
                id="send-amount"
                type="number"
                placeholder="10,000"
                className="h-12 rounded-xl"
                value={sendMoneyData.amount}
                onChange={(e) => setSendMoneyData({ ...sendMoneyData, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>PIN</Label>
              <InlinePinPad
                value={sendMoneyData.pin}
                onChange={(v) => setSendMoneyData({ ...sendMoneyData, pin: v })}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl"
            >
              Send Money
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Request Money Dialog */}
      <Dialog open={showRequestMoney} onOpenChange={setShowRequestMoney}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Request Money</DialogTitle>
            <DialogDescription>Ask someone to send you money</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRequestMoney} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="request-recipient">From Phone Number</Label>
              <Input
                id="request-recipient"
                placeholder="+255 XXX XXX XXX"
                className="h-12 rounded-xl"
                value={requestMoneyData.recipient}
                onChange={(e) => setRequestMoneyData({ ...requestMoneyData, recipient: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-amount">Amount (TZS)</Label>
              <Input
                id="request-amount"
                type="number"
                placeholder="10,000"
                className="h-12 rounded-xl"
                value={requestMoneyData.amount}
                onChange={(e) => setRequestMoneyData({ ...requestMoneyData, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-message">Message (Optional)</Label>
              <Input
                id="request-message"
                placeholder="What's this for?"
                className="h-12 rounded-xl"
                value={requestMoneyData.message}
                onChange={(e) => setRequestMoneyData({ ...requestMoneyData, message: e.target.value })}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl"
            >
              Request Money
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Link Account Dark Bottom Sheet ── */}
      {showLinkAccount && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <div onClick={() => setShowLinkAccount(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderRadius: '24px 24px 0 0',
            background: 'linear-gradient(180deg,#0f1a0f 0%,#080d08 100%)',
            border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none',
            maxHeight: '92vh', overflowY: 'auto', paddingBottom: 36 }}>

            {/* Drag handle */}
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)', margin: '14px auto 0' }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus style={{ width: 22, height: 22, color: '#4ade80' }} />
                </div>
                <div>
                  <p style={{ fontSize: '18px', fontWeight: 900, color: '#fff', marginBottom: 2 }}>Unganisha Akaunti</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>Ongeza njia mpya ya malipo</p>
                </div>
              </div>
              <button onClick={() => setShowLinkAccount(false)}
                style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <X style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.6)' }} />
              </button>
            </div>

            <form onSubmit={handleLinkAccount} style={{ padding: '20px' }}>

              {/* ── Account Type ── */}
              <div style={{ marginBottom: 22 }}>
                <p style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>AINA YA AKAUNTI</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { value: 'mobile_money', icon: '📱', label: 'M-Money',  accentColor: '#4ade80' },
                    { value: 'bank',         icon: '🏦', label: 'Benki',    accentColor: '#60a5fa' },
                    { value: 'card',         icon: '💳', label: 'Kadi',     accentColor: '#fb923c' },
                  ].map(opt => {
                    const selected = linkAccountData.type === opt.value;
                    return (
                      <button type="button" key={opt.value}
                        onClick={() => setLinkAccountData({ ...linkAccountData, type: opt.value, provider: '' })}
                        style={{ padding: '14px 8px', borderRadius: 16, textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s',
                          border: `1px solid ${selected ? opt.accentColor : 'rgba(255,255,255,0.08)'}`,
                          background: selected ? `${opt.accentColor}18` : 'rgba(255,255,255,0.04)',
                          boxShadow: selected ? `0 0 16px ${opt.accentColor}25` : 'none' }}>
                        <div style={{ fontSize: '26px', marginBottom: 7 }}>{opt.icon}</div>
                        <p style={{ fontSize: '11px', fontWeight: 800, color: selected ? opt.accentColor : 'rgba(255,255,255,0.55)' }}>{opt.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Provider quick-picks ── */}
              {linkAccountData.type && (
                <div style={{ marginBottom: 22 }}>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>MTOA HUDUMA</p>
                  {linkAccountData.type === 'mobile_money' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                      {[
                        { name: 'M-Pesa',       emoji: '🟢' },
                        { name: 'Airtel Money', emoji: '🔴' },
                        { name: 'Tigo Pesa',    emoji: '🔵' },
                        { name: 'Halopesa',     emoji: '🟠' },
                      ].map(p => {
                        const sel = linkAccountData.provider === p.name;
                        return (
                          <button type="button" key={p.name}
                            onClick={() => setLinkAccountData({ ...linkAccountData, provider: p.name })}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                              border: `1px solid ${sel ? '#4ade80' : 'rgba(255,255,255,0.1)'}`,
                              background: sel ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.04)',
                              color: sel ? '#4ade80' : 'rgba(255,255,255,0.6)' }}>
                            <span>{p.emoji}</span>{p.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {linkAccountData.type === 'bank' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                      {['CRDB', 'NMB', 'NBC', 'DTB', 'Stanbic', 'Equity'].map(p => {
                        const sel = linkAccountData.provider === p;
                        return (
                          <button type="button" key={p}
                            onClick={() => setLinkAccountData({ ...linkAccountData, provider: p })}
                            style={{ padding: '7px 14px', borderRadius: 20, fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                              border: `1px solid ${sel ? '#60a5fa' : 'rgba(255,255,255,0.1)'}`,
                              background: sel ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.04)',
                              color: sel ? '#60a5fa' : 'rgba(255,255,255,0.6)' }}>
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {linkAccountData.type === 'card' && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      {[{ name: 'Visa', emoji: '💙' }, { name: 'Mastercard', emoji: '🔶' }].map(p => {
                        const sel = linkAccountData.provider === p.name;
                        return (
                          <button type="button" key={p.name}
                            onClick={() => setLinkAccountData({ ...linkAccountData, provider: p.name })}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 20, fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                              border: `1px solid ${sel ? '#fb923c' : 'rgba(255,255,255,0.1)'}`,
                              background: sel ? 'rgba(251,146,60,0.15)' : 'rgba(255,255,255,0.04)',
                              color: sel ? '#fb923c' : 'rgba(255,255,255,0.6)' }}>
                            <span>{p.emoji}</span>{p.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <input type="text"
                    placeholder={linkAccountData.type === 'mobile_money' ? 'Au andika jina la mtoa...' : linkAccountData.type === 'bank' ? 'Au andika jina la benki...' : 'Au andika mtoa...'}
                    value={linkAccountData.provider}
                    onChange={e => setLinkAccountData({ ...linkAccountData, provider: e.target.value })}
                    style={{ width: '100%', height: 50, padding: '0 16px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }} />
                </div>
              )}

              {/* ── Account / Phone Number ── */}
              {linkAccountData.type && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
                    {linkAccountData.type === 'mobile_money' ? 'NAMBARI YA SIMU' : linkAccountData.type === 'card' ? 'NAMBARI YA KADI' : 'NAMBARI YA AKAUNTI'}
                  </p>
                  <input type="text" required
                    placeholder={linkAccountData.type === 'mobile_money' ? '+255 XXX XXX XXX' : linkAccountData.type === 'card' ? '•••• •••• •••• ••••' : 'Ingiza nambari ya akaunti'}
                    value={linkAccountData.accountNumber}
                    onChange={e => setLinkAccountData({ ...linkAccountData, accountNumber: e.target.value })}
                    style={{ width: '100%', height: 52, padding: '0 16px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: `1px solid ${linkAccountData.accountNumber ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.1)'}`, color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' as const, transition: 'border 0.2s' }} />
                </div>
              )}

              {/* ── PIN ── */}
              {linkAccountData.type && (
                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>PIN YA KUTHIBITISHA</p>
                  <InlinePinPad
                    value={linkAccountData.pin}
                    onChange={v => setLinkAccountData({ ...linkAccountData, pin: v })}
                  />
                </div>
              )}

              {/* ── Submit ── */}
              {linkAccountData.type && (
                <button type="submit"
                  disabled={!linkAccountData.type || !linkAccountData.provider || !linkAccountData.accountNumber || linkAccountData.pin.length < 4}
                  style={{ width: '100%', height: 54, borderRadius: 18, fontSize: '15px', fontWeight: 900, color: '#fff', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    background: (linkAccountData.provider && linkAccountData.accountNumber && linkAccountData.pin.length >= 4)
                      ? 'linear-gradient(135deg,#16a34a,#15803d)'
                      : 'rgba(22,163,74,0.3)',
                    boxShadow: (linkAccountData.provider && linkAccountData.accountNumber && linkAccountData.pin.length >= 4)
                      ? '0 6px 24px rgba(22,163,74,0.35)'
                      : 'none' }}>
                  Unganisha Akaunti
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>My QR Code</DialogTitle>
            <DialogDescription>Share this to receive payments</DialogDescription>
          </DialogHeader>
          {qrCodeData && (
            <div className="space-y-4">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-500 w-48 h-48 mx-auto rounded-2xl flex items-center justify-center mb-4">
                  <QrCode className="size-32 text-white" />
                </div>
                <p className="text-sm text-gray-500">QR Code ID</p>
                <p className="text-xs  text-gray-400 break-all px-4">{qrCodeData.qrCode}</p>
                {qrCodeData.amount > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="text-2xl text-gray-900">{formatCurrency(qrCodeData.amount)}</p>
                  </div>
                )}
              </div>
              <div className="text-center text-sm text-gray-500">
                {qrCodeData.amount > 0
                  ? 'This QR code is for a specific amount'
                  : 'This QR code can be used for any amount'}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <TopUpModal
        open={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        accessToken={accessToken}
        userId={user.id}
        onSuccess={fetchWalletData}
      />

      <WithdrawModal
        open={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        accessToken={accessToken}
        userId={user.id}
        balance={balance}
        onSuccess={fetchWalletData}
      />
    </div>
  );
}