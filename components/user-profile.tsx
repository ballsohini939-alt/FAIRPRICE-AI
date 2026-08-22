'use client';

import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Bell, 
  Check, 
  Plus, 
  Edit3, 
  ShieldCheck, 
  Mail, 
  Phone, 
  User, 
  Eye, 
  EyeOff, 
  X, 
  Sparkles,
  ChevronDown,
  Lock
} from 'lucide-react';

interface Account {
  id: string;
  name: string;
  username: string;
  email: string;
  phoneLast2: string;
  avatar: string;
  role: string;
  tier: string;
  bio: string;
  isActive: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'price' | 'security' | 'deal';
  unread: boolean;
}

export function UserProfileHeaderWithDrawer() {
  // 1. Theme State (Light / Dark)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // 2. Notification Center State
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Price Drop Alert',
      message: 'iPhone 15 dropped by ₹4,200 at Retailer X. Now ₹68,799.',
      time: '2m ago',
      type: 'price',
      unread: true
    },
    {
      id: '2',
      title: 'Account Security',
      message: 'New login verified from Chrome on Windows.',
      time: '1h ago',
      type: 'security',
      unread: true
    },
    {
      id: '3',
      title: 'Deal Tracker',
      message: 'MacBook Air M2 hit its 6-month historical low price.',
      time: 'Yesterday',
      type: 'deal',
      unread: true
    }
  ]);

  // 3. Click-to-Reveal Profile Drawer / Modal State (HIDDEN BY DEFAULT)
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // 4. Multi-Account Management State
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: 'acc-1',
      name: 'Aarav Sharma',
      username: '@aarav_sharma',
      email: 'aarav.sharma@example.com',
      phoneLast2: '42',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      role: 'Personal Shopper',
      tier: 'Verified Buyer',
      bio: 'Smart tech enthusiast & frequent shopper. Using FairPrice AI to monitor flagship smartphone drops and domestic flight routes.',
      isActive: true
    },
    {
      id: 'acc-2',
      name: 'TechCorp Procurement',
      username: '@techcorp_procure',
      email: 'procurement@techcorp.in',
      phoneLast2: '88',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      role: 'Business Procurement',
      tier: 'Corporate Partner',
      bio: 'Bulk hardware and workstation price surveillance for IT infrastructure deployments.',
      isActive: false
    },
    {
      id: 'acc-3',
      name: 'Sharma Family Deals',
      username: '@sharma_family',
      email: 'family.sharma@gmail.com',
      phoneLast2: '19',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
      role: 'Family Shared Pool',
      tier: 'Prime Family',
      bio: 'Shared household wishlist tracking seasonal festive discounts and travel tickets.',
      isActive: false
    }
  ]);

  // Active Account
  const activeAccount = accounts.find((a) => a.isActive) || accounts[0];

  // Privacy Phone Mask State
  const [isPhoneMasked, setIsPhoneMasked] = useState<boolean>(true);

  // Modals inside drawer
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState<boolean>(false);

  // Form States
  const [editFormData, setEditFormData] = useState({
    name: activeAccount.name,
    email: activeAccount.email,
    phoneLast2: activeAccount.phoneLast2,
    bio: activeAccount.bio
  });

  const [newAccountFormData, setNewAccountFormData] = useState({
    name: '',
    email: '',
    role: 'Personal'
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Actions
  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
    showToast('All notifications marked as read');
  };

  const handleSwitchAccount = (id: string) => {
    setAccounts(
      accounts.map((acc) => ({
        ...acc,
        isActive: acc.id === id
      }))
    );
    const target = accounts.find((a) => a.id === id);
    if (target) {
      setEditFormData({
        name: target.name,
        email: target.email,
        phoneLast2: target.phoneLast2,
        bio: target.bio
      });
      showToast(`Switched account to "${target.name}"`);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setAccounts(
      accounts.map((acc) =>
        acc.id === activeAccount.id
          ? {
              ...acc,
              name: editFormData.name,
              email: editFormData.email,
              phoneLast2: editFormData.phoneLast2,
              bio: editFormData.bio
            }
          : acc
      )
    );
    setIsEditModalOpen(false);
    showToast('Profile updated successfully!');
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountFormData.name || !newAccountFormData.email) return;

    const newAcc: Account = {
      id: `acc-${Date.now()}`,
      name: newAccountFormData.name,
      username: `@${newAccountFormData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      email: newAccountFormData.email,
      phoneLast2: String(Math.floor(10 + Math.random() * 89)),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      role:
        newAccountFormData.role === 'Business'
          ? 'Business Procurement'
          : newAccountFormData.role === 'Family'
          ? 'Family Shared Pool'
          : 'Personal Shopper',
      tier: 'Verified Buyer',
      bio: `Shopping profile created for ${newAccountFormData.role.toLowerCase()} purchases on FairPrice AI.`,
      isActive: true
    };

    setAccounts(accounts.map((a) => ({ ...a, isActive: false })).concat(newAcc));
    setNewAccountFormData({ name: '', email: '', role: 'Personal' });
    setIsAddAccountModalOpen(false);
    showToast(`New account "${newAcc.name}" linked & activated!`);
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className={`transition-colors duration-300 ${isDarkMode ? 'bg-[#0c140f] text-[#eef6f1]' : 'bg-[#faf8f5] text-[#163220]'}`}>
      
      {/* 1. Header & Navigation Bar (Flexbox Alignment: flex justify-between items-center px-8 py-4) */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${isDarkMode ? 'bg-[#132219]/90 border-[#1f3727]' : 'bg-[#faf8f5]/90 border-[#e2ded7]'}`}>
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between gap-6 whitespace-nowrap">
          
          {/* Brand Logo with distinct right margin */}
          <div className="flex items-center gap-2.5 font-bold text-xl tracking-tight mr-8 flex-shrink-0 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-md font-extrabold">
              ₹
            </div>
            <span>FairPrice</span>
          </div>

          {/* Navigation Links with generous gap-6 spacing */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium flex-shrink-0">
            <a href="#home" className="text-emerald-700 dark:text-emerald-400 font-semibold hover:opacity-80 transition-opacity">Home</a>
            <a href="#how-it-works" className="text-neutral-500 dark:text-neutral-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">How it Works</a>
            <a href="#price-insights" className="text-neutral-500 dark:text-neutral-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">Price Insights</a>
            <a href="#availability" className="text-neutral-500 dark:text-neutral-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">Availability</a>
            <a href="#deals" className="text-neutral-500 dark:text-neutral-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">Deals</a>
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="text-neutral-500 dark:text-neutral-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors font-medium"
            >
              Profile
            </button>
            <a href="#about" className="text-neutral-500 dark:text-neutral-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">About</a>
          </nav>

          {/* Right-Side Control Group with gap-5 and clear breathing room */}
          <div className="flex items-center gap-5 ml-auto flex-shrink-0">
            
            {/* Notification Bell with Floating Dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setIsProfileOpen(false);
                }}
                className={`relative p-2.5 rounded-full border transition-all ${
                  isDarkMode 
                    ? 'border-[#233b2c] bg-[#14221a] hover:bg-[#1b2e23] hover:border-emerald-600' 
                    : 'border-[#e2ded7] bg-white hover:bg-neutral-100 hover:border-emerald-600'
                }`}
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#14221a] animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {showNotifications && (
                <div
                  className={`absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border shadow-2xl overflow-hidden z-50 transition-all animate-in fade-in slide-in-from-top-2 ${
                    isDarkMode ? 'bg-[#14221a] border-[#233b2c]' : 'bg-white border-[#e2ded7]'
                  }`}
                >
                  <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'bg-[#182a20] border-[#233b2c]' : 'bg-neutral-50 border-neutral-200'}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">Notifications</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold dark:bg-emerald-950 dark:text-emerald-300">
                        {unreadCount} new
                      </span>
                    </div>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-[#233b2c]">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setNotifications(
                            notifications.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
                          );
                        }}
                        className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                          notif.unread
                            ? isDarkMode
                              ? 'bg-emerald-950/20 hover:bg-emerald-950/30'
                              : 'bg-emerald-50/50 hover:bg-emerald-50'
                            : isDarkMode
                            ? 'hover:bg-[#182a20]'
                            : 'hover:bg-neutral-50'
                        }`}
                      >
                        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex-shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-semibold">{notif.title}</span>
                            <span className="text-[10px] text-neutral-400">{notif.time}</span>
                          </div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                        {notif.unread && (
                          <div className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-1.5 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                showToast(!isDarkMode ? '🌙 Dark theme enabled' : '☀️ Light theme enabled');
              }}
              className={`p-2.5 rounded-full border transition-all flex-shrink-0 ${
                isDarkMode 
                  ? 'border-[#233b2c] bg-[#14221a] text-yellow-400 hover:bg-[#1b2e23] hover:border-emerald-600' 
                  : 'border-[#e2ded7] bg-white text-neutral-700 hover:bg-neutral-100 hover:border-emerald-600'
              }`}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Avatar Pill Button ('Aarav') */}
            <button
              onClick={() => {
                setIsProfileOpen(true);
                setShowNotifications(false);
              }}
              className={`flex items-center gap-2.5 py-1.5 px-3 rounded-full border transition-all shadow-sm flex-shrink-0 ${
                isDarkMode
                  ? 'border-[#233b2c] bg-[#14221a] hover:bg-[#1b2e23] hover:border-emerald-600'
                  : 'border-[#e2ded7] bg-white hover:bg-neutral-50 hover:border-emerald-600'
              }`}
              aria-label="Open Profile Menu"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-600 flex-shrink-0">
                <img src={activeAccount.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-semibold">{activeAccount.name.split(' ')[0]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

          </div>
        </div>
      </header>

      {/* ==========================================================================
          CLICK-TO-REVEAL USER PROFILE SLIDE-OUT DRAWER / MODAL
          ========================================================================== */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          
          {/* Backdrop Click Outside to Close */}
          <div className="absolute inset-0" onClick={() => setIsProfileOpen(false)} />

          <div
            className={`relative w-full max-w-md h-full shadow-2xl flex flex-col border-l z-10 transition-transform duration-300 animate-in slide-in-from-right ${
              isDarkMode ? 'bg-[#14221a] border-[#233b2c]' : 'bg-white border-[#e2ded7]'
            }`}
          >
            {/* Drawer Header */}
            <div className={`p-5 border-b flex items-center justify-between flex-shrink-0 ${isDarkMode ? 'bg-[#182a20] border-[#233b2c]' : 'bg-neutral-50 border-neutral-200'}`}>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Account Center
                </span>
                <h2 className="text-lg font-bold mt-1">User Profile & Accounts</h2>
              </div>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content inside Drawer */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* SECTION A: Primary User Information Section */}
              <div className={`p-5 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-[#182a20]/60 border-[#233b2c]' : 'bg-neutral-50 border-neutral-200'}`}>
                
                {/* Avatar & Display Name */}
                <div className="flex items-center gap-4 pb-4 border-b border-neutral-200 dark:border-[#233b2c]">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-600 shadow-md flex-shrink-0">
                    <img src={activeAccount.avatar} alt={activeAccount.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold">{activeAccount.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {activeAccount.tier}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">{activeAccount.username}</p>
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5">
                      {activeAccount.role}
                    </p>
                  </div>
                </div>

                {/* Info List */}
                <div className="space-y-3.5 my-4">
                  {/* Email */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white dark:bg-[#1f3527] text-neutral-600 dark:text-neutral-300 shadow-xs">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Email</span>
                      <span className="text-xs font-semibold">{activeAccount.email}</span>
                    </div>
                  </div>

                  {/* Heavily Masked Phone Number */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white dark:bg-[#1f3527] text-neutral-600 dark:text-neutral-300 shadow-xs">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Mobile (Masked)</span>
                        <span className="text-xs font-mono font-bold tracking-widest">
                          {isPhoneMasked ? `+91 ••••••••${activeAccount.phoneLast2}` : `+91 98765432${activeAccount.phoneLast2}`}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsPhoneMasked(!isPhoneMasked)}
                      className="p-1.5 rounded-lg border border-neutral-200 dark:border-[#233b2c] hover:bg-neutral-100 dark:hover:bg-[#1b2e23]"
                      title="Toggle Mask"
                    >
                      {isPhoneMasked ? <Eye className="w-3.5 h-3.5 text-neutral-400" /> : <EyeOff className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  </div>

                  {/* Bio */}
                  <div className="flex items-start gap-3 pt-1">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white dark:bg-[#1f3527] text-neutral-600 dark:text-neutral-300 shadow-xs mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Bio</span>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        {activeAccount.bio}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Edit Profile CTA Button */}
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold border shadow-sm transition-all hover:scale-[1.01] bg-white dark:bg-[#1f3527] border-neutral-300 dark:border-[#233b2c] hover:border-emerald-600"
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                  Edit Profile
                </button>
              </div>

              {/* SECTION B: Multi-Account Management Section */}
              <div className={`p-5 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-[#182a20]/60 border-[#233b2c]' : 'bg-neutral-50 border-neutral-200'}`}>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-200 dark:border-[#233b2c]">
                  <div>
                    <h4 className="text-sm font-bold">Linked Accounts</h4>
                    <p className="text-[11px] text-neutral-400">Switch or connect buying profiles.</p>
                  </div>
                  <button
                    onClick={() => setIsAddAccountModalOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                    Add Account
                  </button>
                </div>

                {/* Connected Accounts List with Active Checkmark */}
                <div className="space-y-2.5">
                  {accounts.map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => handleSwitchAccount(acc.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        acc.isActive
                          ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40'
                          : isDarkMode
                          ? 'border-[#233b2c] bg-[#14221a] hover:bg-[#1f3527]'
                          : 'border-neutral-200 bg-white hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className={`w-9 h-9 rounded-full object-cover border-2 flex-shrink-0 ${
                            acc.isActive ? 'border-emerald-600' : 'border-transparent'
                          }`}
                        />
                        <div className="min-w-0">
                          <span className="block text-xs font-bold truncate">{acc.name}</span>
                          <span className="block text-[10px] text-neutral-400 truncate">{acc.email}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {acc.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3 stroke-[3]" />
                            Active
                          </span>
                        ) : (
                          <button className="text-[11px] font-medium px-2 py-0.5 rounded-full border border-neutral-200 dark:border-[#233b2c] hover:bg-neutral-200 dark:hover:bg-[#233b2c]">
                            Switch
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2FA Security Preference Card */}
                <div className="mt-4 p-3 rounded-xl border flex items-center gap-3 bg-white dark:bg-[#14221a] border-neutral-200 dark:border-[#233b2c]">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-bold">2FA Active</span>
                    <span className="text-[10px] text-neutral-400">SMS to (••••{activeAccount.phoneLast2})</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Enabled
                  </span>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#14221a] border-[#233b2c]' : 'bg-white border-[#e2ded7]'}`}>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-[#233b2c] mb-5">
              <h3 className="font-bold text-lg">Edit Profile Details</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border bg-neutral-50 dark:bg-[#18291e] border-neutral-300 dark:border-[#233b2c] focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border bg-neutral-50 dark:bg-[#18291e] border-neutral-300 dark:border-[#233b2c] focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Mobile Suffix (Last 2 Digits)</label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2 rounded-xl text-sm font-mono bg-neutral-100 dark:bg-[#1a2c20] border border-neutral-300 dark:border-[#233b2c] text-neutral-400">
                    +91 ••••••••
                  </span>
                  <input
                    type="text"
                    maxLength={2}
                    value={editFormData.phoneLast2}
                    onChange={(e) => setEditFormData({ ...editFormData, phoneLast2: e.target.value })}
                    className="w-16 text-center font-mono font-bold px-3 py-2 rounded-xl text-sm border bg-neutral-50 dark:bg-[#18291e] border-neutral-300 dark:border-[#233b2c] focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border bg-neutral-50 dark:bg-[#18291e] border-neutral-300 dark:border-[#233b2c] focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-4 border-t border-neutral-200 dark:border-[#233b2c]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold border border-neutral-300 dark:border-[#233b2c]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#14221a] border-[#233b2c]' : 'bg-white border-[#e2ded7]'}`}>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-[#233b2c] mb-5">
              <h3 className="font-bold text-lg">Link New Shopping Account</h3>
              <button onClick={() => setIsAddAccountModalOpen(false)} className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Account Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Work IT Purchases"
                  value={newAccountFormData.name}
                  onChange={(e) => setNewAccountFormData({ ...newAccountFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border bg-neutral-50 dark:bg-[#18291e] border-neutral-300 dark:border-[#233b2c] focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Account Email</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={newAccountFormData.email}
                  onChange={(e) => setNewAccountFormData({ ...newAccountFormData, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border bg-neutral-50 dark:bg-[#18291e] border-neutral-300 dark:border-[#233b2c] focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Account Role / Purpose</label>
                <select
                  value={newAccountFormData.role}
                  onChange={(e) => setNewAccountFormData({ ...newAccountFormData, role: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border bg-neutral-50 dark:bg-[#18291e] border-neutral-300 dark:border-[#233b2c] focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Personal">Personal Shopper</option>
                  <option value="Business">Business Procurement</option>
                  <option value="Family">Family Shared Pool</option>
                </select>
              </div>
              <div className="flex justify-end gap-2.5 pt-4 border-t border-neutral-200 dark:border-[#233b2c]">
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold border border-neutral-300 dark:border-[#233b2c]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                >
                  Connect Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-70 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-neutral-900 text-white shadow-2xl border border-neutral-800 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

export default UserProfileHeaderWithDrawer;
