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

  // Predefined Mock Database
  const mockDatabase = {
    'iphone 15': {
      name: 'iPhone 15 (128GB, Black)',
      currentPrice: '₹72,999',
      history: [79900, 77500, 76900, 75000, 73999, 72999],
      badgeText: 'Great Deal',
      badgeClass: 'deal',
      adviceTitle: 'Deal Verdict: Highly Recommended',
      adviceDesc: 'iPhone 15 is currently at its lowest price in 30 days. Our AI forecast indicates minor fluctuations but no major price drop until festive sales in 2 months. Buy now.',
      retailers: [
        { name: 'Amazon India', price: '₹72,999', isBest: true },
        { name: 'Flipkart', price: '₹73,499', isBest: false },
        { name: 'Reliance Digital', price: '₹74,900', isBest: false }
      ],
      months: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
    },
    'macbook air': {
      name: 'MacBook Air M2 (8GB/256GB)',
      currentPrice: '₹92,900',
      history: [99900, 97000, 95900, 94900, 92900, 92900],
      badgeText: 'Fair Price',
      badgeClass: 'fair',
      adviceTitle: 'Deal Verdict: Good Price',
      adviceDesc: 'MacBook Air M2 is priced fairly compared to the historical average. The price has stabilized at ₹92,900. It is a safe buy now, though student promotions next month could offer extra cashback.',
      retailers: [
        { name: 'Amazon India', price: '₹92,900', isBest: true },
        { name: 'Croma Retail', price: '₹93,400', isBest: false },
        { name: 'Apple Store Online', price: '₹99,900', isBest: false }
      ],
      months: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
    },
    'bangalore -> kolkata': {
      name: 'Flight Ticket: BLR to CCU (One-way)',
      currentPrice: '₹5,400',
      history: [4200, 4800, 5100, 6800, 5800, 5400],
      badgeText: 'High Demand',
      badgeClass: 'high',
      adviceTitle: 'Deal Verdict: Volatile / Wait',
      adviceDesc: 'Prices on this route are fluctuating. Current fares are 15% higher than the seasonal median. If traveling after 2 weeks, we recommend setting a price alert; historical models show drops on Tuesday nights.',
      retailers: [
        { name: 'IndiGo Airlines', price: '₹5,400', isBest: true },
        { name: 'Air India Express', price: '₹5,750', isBest: false },
        { name: 'MakeMyTrip', price: '₹5,550', isBest: false }
      ],
      months: ['14d ago', '10d ago', '7d ago', '5d ago', '3d ago', 'Today']
    }
  };

  // Generate dynamic query details for generic searches
  function getGenericProductData(query) {
    // Generate a hash from the query to seed deterministic numbers
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      hash = query.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    
    // Generate base price between ₹1,000 and ₹50,000
    const basePrice = Math.floor((hash % 49) * 1000) + 1200;
    
    // Generate 6 month prices with random trend
    const history = [];
    let cur = basePrice * 1.15;
    for (let i = 0; i < 6; i++) {
      const step = (hash + i) % 3 === 0 ? -1 : 1;
      const pct = 0.03 * ((hash + i) % 5);
      cur += cur * step * pct;
      history.push(Math.round(cur));
    }
    
    const finalPrice = history[5];
    const formattedPrice = '₹' + finalPrice.toLocaleString('en-IN');
    
    // Determine verdict
    let badgeText = 'Fair Price';
    let badgeClass = 'fair';
    let adviceTitle = 'Deal Verdict: Fair Price';
    let adviceDesc = `AI scans show steady pricing for "${query}". The current price is within 2% of the historical market average. Good time to buy if needed.`;
    
    if (finalPrice < history[4] && finalPrice < history[0]) {
      badgeText = 'Price Drop!';
      badgeClass = 'deal';
      adviceTitle = 'Deal Verdict: Recommended Buy';
      adviceDesc = `Great time to buy! The price of "${query}" has dropped by 8% over the last two weeks. This is near its historical low.`;
    } else if (finalPrice > history[4] * 1.05) {
      badgeText = 'Priced High';
      badgeClass = 'high';
      adviceTitle = 'Deal Verdict: Wait for Drop';
      adviceDesc = `The current price is elevated compared to recent weeks. We recommend waiting or setting a price alert, as prices on this item historically drop by 10-15% during retail sales events.`;
    }
    
    return {
      name: query.charAt(0).toUpperCase() + query.slice(1),
      currentPrice: formattedPrice,
      history: history,
      badgeText: badgeText,
      badgeClass: badgeClass,
      adviceTitle: adviceTitle,
      adviceDesc: adviceDesc,
      retailers: [
        { name: 'Amazon Retail', price: '₹' + finalPrice.toLocaleString('en-IN'), isBest: true },
        { name: 'Flipkart Online', price: '₹' + Math.round(finalPrice * 1.01).toLocaleString('en-IN'), isBest: false },
        { name: 'Local Store Average', price: '₹' + Math.round(finalPrice * 1.04).toLocaleString('en-IN'), isBest: false }
      ],
      months: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
    };
  }

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
    
    // Mock the network search lag
    setTimeout(() => {
      let productData = mockDatabase[normalizedQuery];
      if (!productData) {
        // If not found in mock database, generate generic details based on search term
        productData = getGenericProductData(query);
      }
      
      // Update result details
      document.getElementById('result-product-name').textContent = productData.name;
      document.getElementById('result-current-price').textContent = productData.currentPrice;
      
      // Badge update
      const badge = document.getElementById('result-badge');
      badge.textContent = productData.badgeText;
      badge.className = 'badge ' + productData.badgeClass;
      
      // Advice update
      document.getElementById('result-advice-title').textContent = productData.adviceTitle;
      document.getElementById('result-advice-desc').textContent = productData.adviceDesc;
      
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
      
    }, 1200);
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
});
