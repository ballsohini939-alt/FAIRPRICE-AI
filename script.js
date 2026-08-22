/* ==========================================================================
   FAIRPRICE INTERACTIVE LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const searchForm = document.getElementById('price-search-form');
  const searchInput = document.getElementById('price-search-input');
  const checkPriceCta = document.getElementById('btn-check-price-cta');
  const resultsSection = document.getElementById('price-insights');
  const loadingState = document.getElementById('search-loading');
  const resultCard = document.getElementById('search-result-card');
  const pillTags = document.querySelectorAll('.pill-tag');
  
  // Mobile Nav Elements
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('header-nav');
  
  // Header Logo click reset
  const logo = document.getElementById('header-logo');
  logo.addEventListener('click', (e) => {
    e.preventDefault();
    searchInput.value = '';
    resultsSection.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Mobile Menu Toggle
  mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    mobileToggle.classList.toggle('active');
  });

  // Close Mobile Menu on Link Click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      mobileToggle.classList.remove('active');
      
      // Update active state
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Check Price CTA in Header focuses search input
  checkPriceCta.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    searchInput.focus();
  });



  // Draw Line and Area Chart on SVG
  function updateGraphSVG(history) {
    const minVal = Math.min(...history);
    const maxVal = Math.max(...history);
    const spread = maxVal - minVal === 0 ? 1 : maxVal - minVal;
    
    // Convert to coordinates (x from 0 to 500, y from 160 to 40)
    const points = history.map((val, idx) => {
      const x = idx * 100;
      const y = 160 - ((val - minVal) / spread) * 110; // keep some padding
      return { x, y };
    });
    
    // Create Line Path
    let linePathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Use smooth cubic bezier curve coordinates
      const prev = points[i - 1];
      const curr = points[i];
      const cpX1 = prev.x + 50;
      const cpY1 = prev.y;
      const cpX2 = curr.x - 50;
      const cpY2 = curr.y;
      linePathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }
    
    // Create Area Path
    const areaPathD = `${linePathD} L 500 200 L 0 200 Z`;
    
    const linePathElement = document.getElementById('graph-line-path');
    const areaPathElement = document.getElementById('graph-area-path');
    const dotElement = document.getElementById('graph-dot');
    
    // Reset path dash animations for clean redraw effect
    linePathElement.removeAttribute('d');
    areaPathElement.removeAttribute('d');
    
    // Apply paths
    linePathElement.setAttribute('d', linePathD);
    areaPathElement.setAttribute('d', areaPathD);
    
    // Position dot on final point
    const finalPoint = points[points.length - 1];
    dotElement.setAttribute('cx', finalPoint.x);
    dotElement.setAttribute('cy', finalPoint.y);
    
    // Re-run SVG line stroke-drawing animation
    linePathElement.style.animation = 'none';
    linePathElement.offsetHeight; // trigger reflow
    linePathElement.style.animation = 'drawLine 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';
  }

  // Display Retailer Availability List
  function updateAvailabilityList(retailers) {
    const listContainer = document.getElementById('availability-list');
    listContainer.innerHTML = '';
    
    retailers.forEach(store => {
      const li = document.createElement('li');
      li.className = 'availability-item';
      li.innerHTML = `
        <span class="retailer-name">${store.name}</span>
        <span class="retailer-price ${store.isBest ? 'best' : ''}">
          ${store.price} ${store.isBest ? '<span style="font-size:0.75rem; font-weight:600; padding:0.15rem 0.4rem; background-color:#d8f3dc; color:#1b4332; border-radius:4px; margin-inline-start:4px;">BEST</span>' : ''}
        </span>
      `;
      listContainer.appendChild(li);
    });
  }

  // Perform Simulated Search
  function performSearch(query) {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return;

    // Show Results Section, display Loading State, hide Result Card
    resultsSection.classList.remove('hidden');
    loadingState.classList.remove('hidden');
    resultCard.classList.add('hidden');
    
    // Smooth scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Call the actual API backend
    fetch('http://localhost:8001/api/price/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: normalizedQuery })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(productData => {
      // Update result details
      document.getElementById('result-product-name').textContent = productData.name;
      document.getElementById('result-current-price').textContent = productData.current_price;
      
      // Badge update
      const badge = document.getElementById('result-badge');
      badge.textContent = productData.badgeText;
      badge.className = 'badge ' + productData.badgeClass;
      
      // Advice update
      document.getElementById('result-advice-title').textContent = productData.adviceTitle;
      
      // The backend provides explanation and suggestions. We can combine them or just use explanation + one suggestion for adviceDesc if we want to match UI structure exactly.
      // In our design we only have one place for description: result-advice-desc
      const fullDesc = productData.explanation + " " + (productData.suggestions.length > 0 ? productData.suggestions[0] : "");
      document.getElementById('result-advice-desc').textContent = fullDesc;
      
      // Update availability list
      updateAvailabilityList(productData.retailers);
      
      // Draw graph
      updateGraphSVG(productData.history);
      
      // Update Month Labels on Graph
      const labelsContainer = document.querySelector('.graph-labels');
      labelsContainer.innerHTML = '';
      productData.months.forEach(m => {
        const span = document.createElement('span');
        span.textContent = m;
        labelsContainer.appendChild(span);
      });
      
      // Hide loading, show card
      loadingState.classList.add('hidden');
      resultCard.classList.remove('hidden');
      
      // Update active nav link (highlights "Price Insights")
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      const insightsLink = document.querySelector('.nav-link[href="#price-insights"]');
      if (insightsLink) insightsLink.classList.add('active');
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      alert("Could not connect to the backend server. Please ensure it is running on port 8001.");
      loadingState.classList.add('hidden');
    });
  }

  // Trigger search on submit form
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    performSearch(searchInput.value);
  });

  // Trigger search on click pill tags
  pillTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const searchTerm = tag.getAttribute('data-search');
      searchInput.value = searchTerm;
      performSearch(searchTerm);
    });
  });
  
  // Reveal animations on scroll
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };
  
  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Setup steps for scroll animation
  document.querySelectorAll('.step-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.15}s`;
    scrollObserver.observe(card);
  });
  
  // Setup features for scroll animation
  document.querySelectorAll('.feature-item').forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s`;
    scrollObserver.observe(item);
  });

  /* ==========================================================================
     1. THEME TOGGLING (LIGHT / DARK MODE)
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const storedTheme = localStorage.getItem('fairprice-theme');
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Set initial theme
  const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initialTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('fairprice-theme', nextTheme);
    
    showToast(nextTheme === 'dark' ? '🌙 Dark theme enabled' : '☀️ Light theme enabled');
  });

  /* ==========================================================================
     2. HEADER NOTIFICATION CENTER
     ========================================================================== */
  const notifBtn = document.getElementById('btn-notification-toggle');
  const notifDropdown = document.getElementById('notification-dropdown');
  const notifBadge = document.getElementById('notification-badge');
  const notifUnreadPill = document.getElementById('notif-unread-count');
  const markAllReadBtn = document.getElementById('btn-mark-all-read');
  const notifList = document.getElementById('notification-list');

  // Toggle notification dropdown
  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notifDropdown.classList.toggle('hidden');
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
      notifDropdown.classList.add('hidden');
    }
  });

  // Update notification counters
  function updateNotifCount() {
    const unreadItems = notifList.querySelectorAll('.notif-item.unread');
    const count = unreadItems.length;
    if (count > 0) {
      notifBadge.textContent = count;
      notifBadge.classList.remove('hidden');
      notifUnreadPill.textContent = `${count} new`;
    } else {
      notifBadge.classList.add('hidden');
      notifUnreadPill.textContent = `0 new`;
    }
  }

  // Click individual notification to mark as read
  notifList.addEventListener('click', (e) => {
    const item = e.target.closest('.notif-item');
    if (item && item.classList.contains('unread')) {
      item.classList.remove('unread');
      updateNotifCount();
      showToast('Notification marked as read');
    }
  });

  // Mark all notifications as read
  markAllReadBtn.addEventListener('click', () => {
    notifList.querySelectorAll('.notif-item.unread').forEach(item => {
      item.classList.remove('unread');
    });
    updateNotifCount();
    showToast('All notifications marked as read');
  });

  /* ==========================================================================
     3. USER PROFILE & MULTI-ACCOUNT STATE MANAGEMENT
     ========================================================================== */
  let isPhoneMasked = true;

  // Connected accounts data store
  let linkedAccounts = [
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
  ];

  // DOM Elements for Profile
  const profileAvatarImg = document.getElementById('profile-avatar-img');
  const headerAvatarImg = document.getElementById('header-avatar-img');
  const headerProfileName = document.getElementById('header-profile-name');
  const profileDisplayName = document.getElementById('profile-display-name');
  const profileHandle = document.getElementById('profile-handle');
  const profileTierBadge = document.getElementById('profile-tier-badge');
  const profileEmail = document.getElementById('profile-email');
  const profilePhone = document.getElementById('profile-phone');
  const profileBio = document.getElementById('profile-bio');
  const btnTogglePhoneMask = document.getElementById('btn-toggle-phone-mask');
  const linkedAccountsList = document.getElementById('linked-accounts-list');

  // Drawer Elements
  const profileDrawerOverlay = document.getElementById('profile-drawer-overlay');
  const btnProfileTrigger = document.getElementById('btn-profile-trigger');
  const btnCloseProfileDrawer = document.getElementById('btn-close-profile-drawer');

  // Render active user details to UI
  function renderActiveProfile() {
    const activeAcc = linkedAccounts.find(acc => acc.isActive) || linkedAccounts[0];
    
    if (profileAvatarImg) profileAvatarImg.src = activeAcc.avatar;
    if (headerAvatarImg) headerAvatarImg.src = activeAcc.avatar;
    if (headerProfileName) headerProfileName.textContent = activeAcc.name.split(' ')[0];
    if (profileDisplayName) profileDisplayName.textContent = activeAcc.name;
    if (profileHandle) profileHandle.textContent = activeAcc.username;
    if (profileTierBadge) profileTierBadge.textContent = activeAcc.tier;
    if (profileEmail) profileEmail.textContent = activeAcc.email;
    if (profileBio) profileBio.textContent = activeAcc.bio;
    
    updatePhoneDisplay(activeAcc.phoneLast2);
    renderAccountsList();
  }

  // Update phone display with privacy mask
  function updatePhoneDisplay(last2) {
    if (!profilePhone) return;
    if (isPhoneMasked) {
      profilePhone.textContent = `+91 ••••••••${last2}`;
    } else {
      profilePhone.textContent = `+91 98765432${last2}`;
    }
  }

  // Toggle phone mask
  if (btnTogglePhoneMask) {
    btnTogglePhoneMask.addEventListener('click', () => {
      isPhoneMasked = !isPhoneMasked;
      const activeAcc = linkedAccounts.find(acc => acc.isActive) || linkedAccounts[0];
      updatePhoneDisplay(activeAcc.phoneLast2);
      showToast(isPhoneMasked ? '🔒 Mobile number masked' : '👁️ Mobile preview revealed');
    });
  }

  // Click-to-Reveal Profile Drawer Handlers
  function openProfileDrawer() {
    renderActiveProfile();
    if (profileDrawerOverlay) {
      profileDrawerOverlay.classList.remove('hidden');
    }
    // Close notification dropdown if open
    if (notifDropdown) notifDropdown.classList.add('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeProfileDrawer() {
    if (profileDrawerOverlay) {
      profileDrawerOverlay.classList.add('hidden');
    }
    document.body.style.overflow = '';
  }

  if (btnProfileTrigger) {
    btnProfileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      openProfileDrawer();
    });
  }

  if (btnCloseProfileDrawer) {
    btnCloseProfileDrawer.addEventListener('click', closeProfileDrawer);
  }

  if (profileDrawerOverlay) {
    profileDrawerOverlay.addEventListener('click', (e) => {
      if (e.target === profileDrawerOverlay) {
        closeProfileDrawer();
      }
    });
  }

  // Open profile drawer on nav-link #profile click
  document.querySelectorAll('a[href="#profile"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openProfileDrawer();
    });
  });

  // ESC key listener to close drawer and modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProfileDrawer();
      closeEditModal();
      closeAddAccountModal();
      if (notifDropdown) notifDropdown.classList.add('hidden');
    }
  });

  // Render linked accounts list
  function renderAccountsList() {
    if (!linkedAccountsList) return;
    linkedAccountsList.innerHTML = '';
    
    linkedAccounts.forEach(acc => {
      const item = document.createElement('div');
      item.className = `account-item ${acc.isActive ? 'active' : ''}`;
      item.setAttribute('data-id', acc.id);
      
      item.innerHTML = `
        <div class="account-item-left">
          <img src="${acc.avatar}" alt="${acc.name}" class="account-item-avatar">
          <div class="account-info-text">
            <div class="account-name-row">
              <span class="account-name">${acc.name}</span>
              <span class="account-role-pill">${acc.role}</span>
            </div>
            <span class="account-email">${acc.email}</span>
          </div>
        </div>
        <div>
          ${acc.isActive ? `
            <span class="account-active-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Active
            </span>
          ` : `
            <button class="btn-switch-account" type="button">Switch</button>
          `}
        </div>
      `;

      // Switch account on click
      item.addEventListener('click', () => {
        if (!acc.isActive) {
          switchAccount(acc.id);
        }
      });

      linkedAccountsList.appendChild(item);
    });
  }

  // Switch active account
  function switchAccount(accId) {
    linkedAccounts.forEach(acc => {
      acc.isActive = (acc.id === accId);
    });
    renderActiveProfile();
    const active = linkedAccounts.find(a => a.id === accId);
    showToast(`Switched account to "${active.name}"`);
  }

  /* ==========================================================================
     4. EDIT PROFILE MODAL
     ========================================================================== */
  const modalEditProfile = document.getElementById('modal-edit-profile');
  const btnOpenEditProfile = document.getElementById('btn-edit-profile-main');
  const btnCloseEditProfile = document.getElementById('btn-close-edit-profile');
  const btnCancelEditProfile = document.getElementById('btn-cancel-edit-profile');
  const formEditProfile = document.getElementById('form-edit-profile');
  const btnChangeAvatarQuick = document.getElementById('btn-change-avatar-quick');

  const inputEditName = document.getElementById('input-edit-name');
  const inputEditEmail = document.getElementById('input-edit-email');
  const inputEditPhoneLast2 = document.getElementById('input-edit-phone-last2');
  const inputEditAvatar = document.getElementById('input-edit-avatar');
  const inputEditBio = document.getElementById('input-edit-bio');

  function openEditModal() {
    const activeAcc = linkedAccounts.find(acc => acc.isActive) || linkedAccounts[0];
    inputEditName.value = activeAcc.name;
    inputEditEmail.value = activeAcc.email;
    inputEditPhoneLast2.value = activeAcc.phoneLast2;
    inputEditAvatar.value = activeAcc.avatar;
    inputEditBio.value = activeAcc.bio;
    modalEditProfile.classList.remove('hidden');
  }

  function closeEditModal() {
    modalEditProfile.classList.add('hidden');
  }

  btnOpenEditProfile.addEventListener('click', openEditModal);
  btnChangeAvatarQuick.addEventListener('click', openEditModal);
  btnCloseEditProfile.addEventListener('click', closeEditModal);
  btnCancelEditProfile.addEventListener('click', closeEditModal);

  modalEditProfile.addEventListener('click', (e) => {
    if (e.target === modalEditProfile) closeEditModal();
  });

  formEditProfile.addEventListener('submit', (e) => {
    e.preventDefault();
    const activeAcc = linkedAccounts.find(acc => acc.isActive) || linkedAccounts[0];
    
    activeAcc.name = inputEditName.value.trim() || activeAcc.name;
    activeAcc.email = inputEditEmail.value.trim() || activeAcc.email;
    activeAcc.phoneLast2 = inputEditPhoneLast2.value.trim() || activeAcc.phoneLast2;
    if (inputEditAvatar.value.trim()) {
      activeAcc.avatar = inputEditAvatar.value.trim();
    }
    activeAcc.bio = inputEditBio.value.trim() || activeAcc.bio;
    
    renderActiveProfile();
    closeEditModal();
    showToast('Profile updated successfully!');
  });

  /* ==========================================================================
     5. ADD ACCOUNT MODAL
     ========================================================================== */
  const modalAddAccount = document.getElementById('modal-add-account');
  const btnOpenAddAccount = document.getElementById('btn-add-account-open');
  const btnCloseAddAccount = document.getElementById('btn-close-add-account');
  const btnCancelAddAccount = document.getElementById('btn-cancel-add-account');
  const formAddAccount = document.getElementById('form-add-account');

  const inputAccountName = document.getElementById('input-account-name');
  const inputAccountEmail = document.getElementById('input-account-email');
  const selectAccountRole = document.getElementById('select-account-role');

  function openAddAccountModal() {
    inputAccountName.value = '';
    inputAccountEmail.value = '';
    modalAddAccount.classList.remove('hidden');
  }

  function closeAddAccountModal() {
    modalAddAccount.classList.add('hidden');
  }

  btnOpenAddAccount.addEventListener('click', openAddAccountModal);
  btnCloseAddAccount.addEventListener('click', closeAddAccountModal);
  btnCancelAddAccount.addEventListener('click', closeAddAccountModal);

  modalAddAccount.addEventListener('click', (e) => {
    if (e.target === modalAddAccount) closeAddAccountModal();
  });

  formAddAccount.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = inputAccountName.value.trim();
    const email = inputAccountEmail.value.trim();
    const role = selectAccountRole.value;

    if (!name || !email) return;

    // Stock avatar presets
    const stockAvatars = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80'
    ];
    const randomAvatar = stockAvatars[Math.floor(Math.random() * stockAvatars.length)];

    // Deactivate previous accounts
    linkedAccounts.forEach(acc => acc.isActive = false);

    const newAcc = {
      id: `acc-${Date.now()}`,
      name: name,
      username: `@${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      email: email,
      phoneLast2: String(Math.floor(10 + Math.random() * 89)),
      avatar: randomAvatar,
      role: role === 'Business' ? 'Business Procurement' : (role === 'Family' ? 'Family Shared Pool' : 'Personal Shopper'),
      tier: 'Verified Buyer',
      bio: `Shopping profile created for ${role.toLowerCase()} purchases on FairPrice AI.`,
      isActive: true
    };

    linkedAccounts.push(newAcc);
    renderActiveProfile();
    closeAddAccountModal();
    showToast(`New account "${newAcc.name}" linked & activated!`);
  });

  /* ==========================================================================
     6. TOAST NOTIFICATION HELPER
     ========================================================================== */
  function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3200);
  }

  // Initial Profile Render
  renderActiveProfile();
});
