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
});
