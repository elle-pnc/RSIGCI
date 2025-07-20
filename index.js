/*
  index.js - Main JavaScript for RSIGCI Company Website
  Handles navigation, tab logic, job loading, application form, file upload, modals, carousel, milestones, and accessibility enhancements.
  Last updated: 2024-06-09
*/
document.addEventListener('DOMContentLoaded', function() {
  // --- DOM ELEMENT ASSIGNMENTS ---
  const heroSection = document.getElementById('heroSection');
  const aboutSection = document.getElementById('about');
  const applySection = document.getElementById('apply');
  const openPositionsTab = document.getElementById('openPositionsTab');
  const productsTab = document.getElementById('productsTab');
  const homepageSections = document.getElementById('homepageSections');

  // --- Mobile Menu Functions ---
  function toggleMobileMenu() {
    const menu = document.getElementById('slideMenu');
    const hamburger = document.getElementById('hamburgerMenuBtn');
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    menu.classList.toggle('translate-x-full');
    if (!menu.classList.contains('translate-x-full')) {
      // Menu is open: trap focus
      setTimeout(() => {
        const focusableEls = menu.querySelectorAll(focusableSelectors);
        if (focusableEls.length) focusableEls[0].focus();
      }, 100);
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', trapFocusInMobileMenu);
      if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
    } else {
      // Menu is closed: return focus to hamburger
      if (hamburger) hamburger.focus();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', trapFocusInMobileMenu);
      if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    }
  }

  function closeMobileMenu() {
    const menu = document.getElementById('slideMenu');
    const hamburger = document.getElementById('hamburgerMenuBtn');
    menu.classList.add('translate-x-full');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', trapFocusInMobileMenu);
    if (hamburger) hamburger.focus();
  }

  function trapFocusInMobileMenu(e) {
    const menu = document.getElementById('slideMenu');
    if (menu.classList.contains('translate-x-full')) return;
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableEls = Array.from(menu.querySelectorAll(focusableSelectors)).filter(el => !el.disabled && el.offsetParent !== null);
    if (!focusableEls.length) return;
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    } else if (e.key === 'Escape') {
      closeMobileMenu();
    }
  }

  // Make mobile menu functions globally available
  window.toggleMobileMenu = toggleMobileMenu;
  window.closeMobileMenu = closeMobileMenu;

  // --- Attach event listeners for hamburger and mobile menu close button ---
  const hamburgerBtn = document.getElementById('hamburgerMenuBtn');
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleMobileMenu);
  }
  const mobileMenuCloseBtn = document.getElementById('closeSlideMenu');
  if (mobileMenuCloseBtn) {
    mobileMenuCloseBtn.addEventListener('click', closeMobileMenu);
  }

  // --- Navigation Functions ---
  function goToHomepage() {
    // Clear any hash and show the hero section
    window.location.hash = '';
    showTab('hero');
    window.scrollTo(0, 0);
  }

  // Make goToHomepage globally available
  window.goToHomepage = goToHomepage;

  // --- Centralized Tab Logic ---
  function showTab(tabName, skipHashUpdate) {
    // List all main sections/tabs
    const sections = [
      heroSection,
      aboutSection,
      applySection,
      openPositionsTab,
      productsTab
    ];
    // Hide all by default
    sections.forEach(sec => { if (sec) sec.style.display = 'none'; if (sec && sec.classList) sec.classList.add('hidden'); });
    // Hide homepage sections by default
    if (homepageSections) homepageSections.style.display = 'none';
    
    let hash = '';
    if (tabName === 'hero' || tabName === 'about') {
      // Show hero, about, and apply for home
      if (heroSection) { heroSection.style.display = ''; heroSection.classList.remove('hidden'); }
      if (aboutSection) { aboutSection.style.display = ''; aboutSection.classList.remove('hidden'); }
      if (applySection) { applySection.style.display = 'none'; applySection.classList.add('hidden'); } // Hide apply by default
      if (homepageSections) homepageSections.style.display = '';
      hash = '#about';
    } else if (tabName === 'openPositions') {
      if (openPositionsTab) { openPositionsTab.style.display = ''; openPositionsTab.classList.remove('hidden'); }
      loadJobs();
      hash = '#openPositions';
    } else if (tabName === 'products') {
      if (productsTab) { productsTab.style.display = ''; productsTab.classList.remove('hidden'); }
      hash = '#products';
    } else if (tabName === 'apply') {
      if (applySection) { applySection.style.display = ''; applySection.classList.remove('hidden'); }
      hash = '#apply';
    }
    if (!skipHashUpdate && hash) window.location.hash = hash;
    window.scrollTo(0, 0);
  }

  // Make showTab globally available
  window.showTab = showTab;

  // --- See More Button Setup ---
  function setupSeeMoreButton() {
    const seeMoreBtn = document.getElementById('seeMoreBtn');
    const homepageSections = document.getElementById('homepageSections');
    const seeMoreText = document.getElementById('seeMoreText');
    const seeMoreIcon = document.getElementById('seeMoreIcon');
    
    if (seeMoreBtn && homepageSections) {
      seeMoreBtn.addEventListener('click', function() {
        const isExpanded = !homepageSections.classList.contains('hidden');
        
        if (isExpanded) {
          // Hide sections
          homepageSections.classList.add('hidden');
          if (seeMoreText) seeMoreText.textContent = 'See More About Our Company';
          seeMoreIcon.className = 'fas fa-chevron-down ml-2';
          
          // Scroll back to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Show sections
          homepageSections.classList.remove('hidden');
          seeMoreText.textContent = 'See Less';
          seeMoreIcon.className = 'fas fa-chevron-up ml-2';
          
          // Smooth scroll to the revealed sections
          setTimeout(() => {
            homepageSections.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      });
    }
  }

  // --- Button Event Listeners Setup ---
  function setupButtonListeners() {
    // Hero Buttons
    const exploreOpportunitiesBtn = document.getElementById('exploreOpportunitiesBtn');
    if (exploreOpportunitiesBtn) {
      exploreOpportunitiesBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showTab('openPositions');
      });
    }

    const applyNowBtn = document.getElementById('applyNowBtn');
    if (applyNowBtn) {
      applyNowBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showTab('apply');
      });
    }

    // Header Navigation (now <a> tags)
    const headerAboutBtn = document.getElementById('headerAboutBtn');
    if (headerAboutBtn) {
      headerAboutBtn.addEventListener('click', function() {
        showTab('hero');
      });
    }

    const headerProductsBtn = document.getElementById('headerProductsBtn');
    if (headerProductsBtn) {
      headerProductsBtn.addEventListener('click', function() {
        showTab('products');
      });
    }

    const headerCareersBtn = document.getElementById('headerCareersBtn');
    if (headerCareersBtn) {
      headerCareersBtn.addEventListener('click', function() {
        showTab('openPositions');
      });
    }

    const headerApplyBtn = document.getElementById('headerApplyBtn');
    if (headerApplyBtn) {
      headerApplyBtn.addEventListener('click', function() {
        showTab('apply');
      });
    }

    // Mobile Navigation (now <a> tags)
    const mobileAboutBtn = document.getElementById('mobileAboutBtn');
    if (mobileAboutBtn) {
      mobileAboutBtn.addEventListener('click', function() {
        closeMobileMenu();
        showTab('hero');
      });
    }

    const mobileProductsBtn = document.getElementById('mobileProductsBtn');
    if (mobileProductsBtn) {
      mobileProductsBtn.addEventListener('click', function() {
        closeMobileMenu();
        showTab('products');
      });
    }

    const mobileCareersBtn = document.getElementById('mobileCareersBtn');
    if (mobileCareersBtn) {
      mobileCareersBtn.addEventListener('click', function() {
        closeMobileMenu();
        showTab('openPositions');
      });
    }

    const mobileApplyBtn = document.getElementById('mobileApplyBtn');
    if (mobileApplyBtn) {
      mobileApplyBtn.addEventListener('click', function() {
        closeMobileMenu();
        showTab('apply');
      });
    }

    // Back to Home Buttons
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    if (backToHomeBtn) {
      backToHomeBtn.addEventListener('click', function() {
        showTab('hero');
      });
    }

    const backToHomeProductsBtn = document.getElementById('backToHomeProductsBtn');
    if (backToHomeProductsBtn) {
      backToHomeProductsBtn.addEventListener('click', function() {
        showTab('hero');
      });
    }

    // Success Modal
    const successBackBtn = document.getElementById('successBackBtn');
    if (successBackBtn) {
      successBackBtn.addEventListener('click', function() {
        closeSuccessModal();
        window.location.hash = "";
        window.scrollTo(0, 0);
        window.location.reload();
      });
    }
  }

  // --- Jobs Loading ---
  async function loadJobs() {
    try {
      const jobs = await FirebaseService.getJobs();
      const container = document.getElementById('jobsContainer');
      const paginationControls = document.getElementById('paginationControls');
      
      if (jobs.length === 0) {
        container.innerHTML = `
          <div class="col-span-2 text-center py-12">
            <i class="fas fa-briefcase text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-500 text-lg">No open positions at the moment</p>
            <p class="text-gray-400">Check back soon for new opportunities!</p>
          </div>
        `;
        paginationControls.classList.add('hidden');
        return;
      }

      const activeJobs = jobs.filter(job => job.status === 'active');
      
      if (activeJobs.length === 0) {
        container.innerHTML = `
          <div class="col-span-2 text-center py-12">
            <i class="fas fa-briefcase text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-500 text-lg">No open positions at the moment</p>
            <p class="text-gray-400">Check back soon for new opportunities!</p>
          </div>
        `;
        paginationControls.classList.add('hidden');
        return;
      }

      // Pagination logic
      const jobsPerPage = 6;
      const totalPages = Math.ceil(activeJobs.length / jobsPerPage);
      
      // Get current page from URL hash or default to 1
      const urlParams = new URLSearchParams(window.location.search);
      const currentPage = parseInt(urlParams.get('page')) || 1;
      
      // Calculate start and end indices
      const startIndex = (currentPage - 1) * jobsPerPage;
      const endIndex = startIndex + jobsPerPage;
      const currentJobs = activeJobs.slice(startIndex, endIndex);

      // Sanitize user-generated content (job.description)
      function sanitize(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
      }

      // Display current page jobs
      container.innerHTML = currentJobs.map((job, index) => `
        <div class="slide-in-right stagger-${index + 1} job-card bg-white p-4 md:p-8 rounded-xl md:rounded-2xl shadow-sm">
          <div class="flex items-start justify-between mb-3 md:mb-4">
            <div class="flex-1 min-w-0">
              <h3 class="text-lg md:text-2xl font-semibold mb-2 text-gray-800 truncate">${sanitize(job.title)}</h3>
              <p class="text-sm md:text-base text-gray-600 mb-2 md:mb-4">
                <i class="fas fa-map-marker-alt mr-1 md:mr-2 text-orange-500"></i>
                <span class="truncate">${sanitize(job.location)}</span>
              </p>
            </div>
            <div class="bg-orange-100 text-orange-600 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ml-2 flex-shrink-0">
              ${sanitize(job.type)}
            </div>
          </div>
          <p class="text-sm md:text-base text-gray-600 mb-4 md:mb-6 leading-relaxed" id="jobDesc-${job.id}">
            ${job.description && job.description.length > 150 ? 
              `<span id="jobDescPreview-${job.id}">${sanitize(job.description.substring(0, 150))}... <button onclick="toggleJobDescription('${job.id}')" class="text-blue-600 hover:text-blue-800 font-medium" id="toggleBtn-${job.id}">See more</button></span>
              <span id="jobDescFull-${job.id}" class="hidden">${sanitize(job.description)} <button onclick="toggleJobDescription('${job.id}')" class="text-blue-600 hover:text-blue-800 font-medium">See less</button></span>` 
              : (sanitize(job.description) || 'No description available')
            }
          </p>
          ${job.requirements && Array.isArray(job.requirements) && job.requirements.length > 0 ? `
            <div class="mb-4 md:mb-6">
              <h4 class="text-sm md:text-base font-semibold text-gray-800 mb-2">Requirements:</h4>
              <ul class="list-disc list-inside text-sm md:text-base text-gray-600 space-y-1">
                ${job.requirements.map(req => `<li>${sanitize(req)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div class="flex items-center space-x-4">
              <span class="text-xs md:text-sm text-gray-500">
                <i class="fas fa-clock mr-1"></i>Posted ${getTimeAgo(job.postedAt)}
              </span>
            </div>
            <button onclick="applyForJob('${job.id}')" class="btn-primary px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium w-full sm:w-auto">
              Apply Now
            </button>
          </div>
        </div>
      `).join('');

      // Setup pagination controls
      setupPagination(currentPage, totalPages, activeJobs.length);
      
    } catch (error) {
      console.error('Error loading jobs:', error);
      const container = document.getElementById('jobsContainer');
      const paginationControls = document.getElementById('paginationControls');
      container.innerHTML = `
        <div class="col-span-2 text-center py-12">
          <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
          <p class="text-gray-500 text-lg">Error loading jobs</p>
          <p class="text-gray-400">Please try again later</p>
        </div>
      `;
      paginationControls.classList.add('hidden');
    }
  }

  // Setup pagination controls
  function setupPagination(currentPage, totalPages, totalJobs) {
    const paginationControls = document.getElementById('paginationControls');
    const pageNumbers = document.getElementById('pageNumbers');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    
    // Show pagination if more than 6 jobs
    if (totalJobs > 6) {
      paginationControls.classList.remove('hidden');
      
      // Update Previous/Next buttons
      prevBtn.disabled = currentPage === 1;
      nextBtn.disabled = currentPage === totalPages;
      
      // Generate page numbers
      pageNumbers.innerHTML = '';
      const maxVisiblePages = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `px-3 py-2 border rounded-lg transition-colors ${
          i === currentPage 
            ? 'bg-blue-600 text-white border-blue-600' 
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
        }`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => goToPage(i);
        pageNumbers.appendChild(pageBtn);
      }
      
      // Add event listeners
      prevBtn.onclick = () => goToPage(currentPage - 1);
      nextBtn.onclick = () => goToPage(currentPage + 1);
    } else {
      paginationControls.classList.add('hidden');
    }
  }

  // Navigate to specific page
  function goToPage(page) {
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    window.history.pushState({}, '', url);
    loadJobs();
  }

  // Toggle job description expand/collapse
  function toggleJobDescription(jobId) {
    const preview = document.getElementById(`jobDescPreview-${jobId}`);
    const full = document.getElementById(`jobDescFull-${jobId}`);
    
    if (preview && full) {
      if (preview.classList.contains('hidden')) {
        // Show preview, hide full
        preview.classList.remove('hidden');
        full.classList.add('hidden');
      } else {
        // Show full, hide preview
        preview.classList.add('hidden');
        full.classList.remove('hidden');
      }
    }
  }

  // Get time ago string
  function getTimeAgo(dateValue) {
    // Handle Firestore Timestamp objects
    let date;
    if (dateValue && typeof dateValue.toDate === 'function') {
      // It's a Firestore Timestamp
      date = dateValue.toDate();
    } else if (dateValue) {
      // It's a regular date string or Date object
      date = new Date(dateValue);
    } else {
      return 'Recently';
    }
    
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  }

  // Apply for a specific job
  async function applyForJob(jobId) {
    try {
      // Show the application form tab
      showTab('apply');
      const jobs = await FirebaseService.getJobs();
      const job = jobs.find(j => j.id === jobId);
      
      if (job) {
        // Set the position in the form
        const positionSelect = document.querySelector('select');
        if (positionSelect) {
          positionSelect.value = job.title;
        }
        
        // Scroll to application form
        document.getElementById('apply').scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error finding job:', error);
    }
  }

  // Make functions globally available
  window.toggleJobDescription = toggleJobDescription;
  window.applyForJob = applyForJob;

  // --- Application Form Logic ---
  const applicationForm = document.getElementById('applicationForm');
  const coverLetterTextarea = document.getElementById('coverLetter');
  const coverLetterWordCount = document.getElementById('coverLetterWordCount');
  const coverLetterLimitWarning = document.getElementById('coverLetterLimitWarning');
  const dropZone = document.getElementById('dropZone');
  const resumeFile = document.getElementById('resumeFile');
  const positionSelect = document.getElementById('position');
  const otherPositionInput = document.getElementById('otherPosition');

  // Cover letter word count
  if (coverLetterTextarea) {
  coverLetterTextarea.addEventListener('input', function() {
    const words = this.value.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    coverLetterWordCount.textContent = `${wordCount}/400 words`;
    
    if (wordCount > 400) {
      coverLetterLimitWarning.classList.remove('hidden');
      this.value = words.slice(0, 400).join(' ');
    } else {
      coverLetterLimitWarning.classList.add('hidden');
    }
  });
  }

  // Position selection logic
  if (positionSelect) {
  positionSelect.addEventListener('change', function() {
    if (this.value === 'Other') {
      otherPositionInput.style.display = '';
      otherPositionInput.required = true;
    } else {
      otherPositionInput.style.display = 'none';
      otherPositionInput.required = false;
      otherPositionInput.value = '';
    }
  });
  }

  // --- File Upload System ---
  function setupFileUpload() {
    const fileInput = document.getElementById('resumeFile');
    const dropZone = document.getElementById('dropZone');
    if (!fileInput || !dropZone) return;
    
    // Store original drop zone content
    const originalContent = dropZone.innerHTML;
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('border-blue-400', 'bg-blue-50');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('border-blue-400', 'bg-blue-50');
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-blue-400', 'bg-blue-50');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileUpload(e.target.files[0]);
      }
    });
    // Keyboard support for drop zone
    dropZone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });
    function handleFileUpload(file) {
      // SECURITY: Backend validation is still required for all uploads and user input.
      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(fileExtension) || (file.type && !allowedMimeTypes.includes(file.type))) {
        alert('Please upload a PDF, DOC, DOCX, JPG, or PNG file.');
        return;
      }
      // Reduce file size limit to 5MB for faster uploads
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('File size too large. Please upload a file smaller than 5MB for faster processing.');
        return;
      }
      // Show progress bar
      const progressContainer = document.createElement('div');
      progressContainer.className = 'mt-4';
      progressContainer.innerHTML = `
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="progress-bar bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
        </div>
        <p class="text-sm text-gray-600 mt-2">Preparing file...</p>
      `;
      dropZone.appendChild(progressContainer);
      const progressBar = progressContainer.querySelector('.progress-bar');
      const statusText = progressContainer.querySelector('p');
      // Store the file for later use in form submission
      window.uploadedFile = file;
      // Simulate upload progress (actual upload happens on submit)
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          statusText.textContent = 'File ready!';
          setTimeout(() => {
            dropZone.innerHTML = `
              <i class="fas fa-check text-3xl text-green-500 mb-2"></i>
              <p class="text-green-600 font-medium">${file.name}</p>
              <p class="text-sm text-gray-500">File ready for upload (${(file.size / 1024 / 1024).toFixed(1)}MB)</p>
              <p class="text-xs text-gray-400 mt-1">Will upload during form submission</p>
            `;
          }, 500);
        } else {
          progressBar.style.width = progress + '%';
          statusText.textContent = `Preparing... ${Math.round(progress)}%`;
        }
      }, 100);
    }
  }

  // --- Application Submission ---
  async function submitApplication(event) {
    event.preventDefault();
    [
      'fullName', 'email', 'phone', 'position', 'coverLetter', 'resume', 'recaptcha', 'otherPosition'
    ].forEach(id => {
      const input = document.getElementById(id);
      if (input) input.classList.remove('form-input-error');
      const error = document.getElementById(id + 'Error');
      if (error) error.style.display = 'none';
    });
    let hasError = false;
    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
      const recaptchaError = document.getElementById('recaptchaError');
      recaptchaError.textContent = 'Please complete the reCAPTCHA to submit your application.';
      recaptchaError.style.display = 'block';
      hasError = true;
    } else {
      document.getElementById('recaptchaError').style.display = 'none';
    }
    if (hasError) return;
    const form = document.getElementById('applicationForm');
    if (!form) {
      console.error('Form not found!');
      return;
    }
    const fullName = form.querySelector('input[type="text"]').value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const phone = form.querySelector('input[type="tel"]').value.trim();
    const position = form.querySelector('select').value;
    const otherPosition = document.getElementById('otherPosition').value.trim();
    const coverLetterValue = form.querySelector('textarea').value.trim();
    let fileInput = document.getElementById('resumeFile');
    let file = (fileInput && fileInput.files.length > 0) ? fileInput.files[0] : window.uploadedFile;
    if (!fullName) {
      document.getElementById('fullName').classList.add('form-input-error');
      document.getElementById('fullNameError').textContent = 'Full name is required.';
      document.getElementById('fullNameError').style.display = 'block';
      document.getElementById('fullName').setAttribute('aria-invalid', 'true');
      hasError = true;
    } else {
      document.getElementById('fullName').setAttribute('aria-invalid', 'false');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      document.getElementById('email').classList.add('form-input-error');
      document.getElementById('emailError').textContent = 'Email is required.';
      document.getElementById('emailError').style.display = 'block';
      document.getElementById('email').setAttribute('aria-invalid', 'true');
      hasError = true;
    } else if (!emailRegex.test(email)) {
      document.getElementById('email').classList.add('form-input-error');
      document.getElementById('emailError').textContent = 'Please enter a valid email address.';
      document.getElementById('emailError').style.display = 'block';
      document.getElementById('email').setAttribute('aria-invalid', 'true');
      hasError = true;
    } else {
      document.getElementById('email').setAttribute('aria-invalid', 'false');
    }
    if (!phone) {
      document.getElementById('phone').classList.add('form-input-error');
      document.getElementById('phoneError').textContent = 'Phone number is required.';
      document.getElementById('phoneError').style.display = 'block';
      document.getElementById('phone').setAttribute('aria-invalid', 'true');
      hasError = true;
    } else {
      document.getElementById('phone').setAttribute('aria-invalid', 'false');
    }
    if (!position) {
      var positionEl = document.getElementById('position');
      if (positionEl) positionEl.classList.add('form-input-error');
      var positionErrorEl = document.getElementById('positionError');
      if (positionErrorEl) {
        positionErrorEl.textContent = 'Please select a position.';
        positionErrorEl.style.display = 'block';
      }
      if (positionEl) positionEl.setAttribute('aria-invalid', 'true');
      hasError = true;
    } else if (position === 'Other' && !otherPosition) {
      var otherPositionEl = document.getElementById('otherPosition');
      if (otherPositionEl) otherPositionEl.classList.add('form-input-error');
      var otherPositionErrorEl = document.getElementById('otherPositionError');
      if (otherPositionErrorEl) {
        otherPositionErrorEl.textContent = 'Please specify the position.';
        otherPositionErrorEl.style.display = 'block';
      }
      if (otherPositionEl) otherPositionEl.setAttribute('aria-invalid', 'true');
      hasError = true;
      if (positionEl) positionEl.setAttribute('aria-invalid', 'false');
    } else {
      if (positionEl) positionEl.setAttribute('aria-invalid', 'false');
      if (position === 'Other' && otherPositionEl) {
        otherPositionEl.setAttribute('aria-invalid', 'false');
      }
    }
    if (!coverLetterValue) {
      var coverLetterEl = document.getElementById('coverLetter');
      if (coverLetterEl) coverLetterEl.classList.add('form-input-error');
      var coverLetterErrorEl = document.getElementById('coverLetterError');
      if (coverLetterErrorEl) {
        coverLetterErrorEl.textContent = 'Cover letter is required.';
        coverLetterErrorEl.style.display = 'block';
      }
      if (coverLetterEl) coverLetterEl.setAttribute('aria-invalid', 'true');
      hasError = true;
    } else {
      var coverLetterEl = document.getElementById('coverLetter');
      if (coverLetterEl) coverLetterEl.setAttribute('aria-invalid', 'false');
    }
    if (!file) {
      var resumeErrorEl = document.getElementById('resumeError');
      if (resumeErrorEl) {
        resumeErrorEl.textContent = 'Please upload your resume or CV.';
        resumeErrorEl.style.display = 'block';
      }
      var resumeFileEl = document.getElementById('resumeFile');
      if (resumeFileEl) resumeFileEl.setAttribute('aria-invalid', 'true');
      hasError = true;
    } else {
      var resumeFileEl = document.getElementById('resumeFile');
      if (resumeFileEl) resumeFileEl.setAttribute('aria-invalid', 'false');
    }
    var policyAgreement = document.getElementById('policyAgreement');
    if (!policyAgreement || !policyAgreement.checked) {
      var policyAgreementErrorEl = document.getElementById('policyAgreementError');
      if (policyAgreementErrorEl) {
        policyAgreementErrorEl.textContent = 'You must agree to the Privacy Policy and Terms of Service.';
        policyAgreementErrorEl.style.display = 'block';
      }
      hasError = true;
    } else {
      var policyAgreementErrorEl = document.getElementById('policyAgreementError');
      if (policyAgreementErrorEl) policyAgreementErrorEl.style.display = 'none';
    }
    if (hasError) return;
    let application = {
      fullName,
      email,
      phone,
      position: position === 'Other' ? otherPosition : position,
      coverLetter: coverLetterValue,
      resume: file.name
    };
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');
    const button = document.getElementById('submitBtn');
    const originalText = button ? button.innerHTML : '';
    const originalClasses = button ? button.className : '';
    if (button) {
      button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Submitting Application...';
      button.disabled = true;
      button.className = originalClasses.replace('pulse-glow', '') + ' bg-gray-500';
    }
    try {
      console.log('Submitting application with file upload to Google Drive:', application);
      console.log('File to upload:', file);
      if (file && loadingOverlay) {
        loadingOverlay.querySelector('p').textContent = 'Uploading file to Google Drive and submitting application...';
        const progressContainer = document.createElement('div');
        progressContainer.className = 'mt-4';
        progressContainer.innerHTML = `
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="upload-progress bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
          </div>
          <p class="text-sm text-gray-600 mt-2">Uploading to Google Drive... 0%</p>
        `;
        loadingOverlay.querySelector('.bg-white').appendChild(progressContainer);
        const progressBar = progressContainer.querySelector('.upload-progress');
        const progressText = progressContainer.querySelector('p');
        try {
          const driveResult = await GoogleDriveService.uploadFile(file);
          console.log('File uploaded to Google Drive:', driveResult);
          application.resumeURL = driveResult.url;
          application.resumeFileName = file.name;
          application.driveFileId = driveResult.id;
          application.driveDownloadUrl = driveResult.downloadUrl;
          progressContainer.remove();
        } catch (uploadError) {
          console.error('Google Drive upload failed:', uploadError);
          progressContainer.remove();
          application.resumeUploadError = uploadError.message;
          application.resumeFileName = file.name;
          application.resumeUploadAttempted = true;
        }
      }
      const appId = await FirebaseService.addApplication(application);
      console.log('Application submitted successfully with ID:', appId);
      window.uploadedFile = null;
      showSuccessModal();
      if (loadingOverlay) loadingOverlay.classList.add('hidden');
      if (form) {
        form.style.display = 'none';
        form.reset();
      }
      const dropZone = document.getElementById('dropZone');
      if (dropZone) {
        dropZone.innerHTML = `
          <i class="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
          <p class="text-gray-600">Drag and drop your resume here, or <span class="text-blue-600 cursor-pointer">browse files</span></p>
          <input type="file" id="resumeFile" class="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
        `;
        setupFileUpload();
      }
      setTimeout(() => {
        closeSuccessModal();
        window.location.hash = "";
        window.scrollTo(0, 0);
        window.location.reload();
      }, 2500);
      return;
    } catch (error) {
      console.error('Error submitting application:', error);
      if (loadingOverlay) loadingOverlay.classList.add('hidden');
      if (button) {
        button.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i>Submission Failed! Try Again';
        button.className = originalClasses.replace('pulse-glow', '') + ' bg-red-600';
        button.disabled = false;
      }
      let errorMessage = `Failed to submit application: ${error.message}`;
      if (error.message.includes('timeout') || error.message.includes('network')) {
        errorMessage += '\n\nTroubleshooting tips:\n';
        errorMessage += '• Check your internet connection\n';
        errorMessage += '• Try uploading a smaller file (under 1MB)\n';
        errorMessage += '• Try again in a few minutes\n';
        errorMessage += '• If the problem persists, try without a file upload';
      }
      alert(errorMessage);
      setTimeout(() => {
        if (button) {
          button.innerHTML = originalText;
          button.className = originalClasses;
          button.disabled = false;
        }
      }, 3000);
    }
  }

  // Success Modal functions
  function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('hidden');
    trapFocusInModal(modal);
  }
  
  function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.add('hidden');
    // Show the form again for next submission
    const form = document.getElementById('applicationForm');
    if (form) form.style.display = '';
    // Return focus to the Back to Home button or main content
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    if (backToHomeBtn) backToHomeBtn.focus();
  }

  // Trap focus within modal
  function trapFocusInModal(modal) {
    if (!modal) return;
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableEls = Array.from(modal.querySelectorAll(focusableSelectors)).filter(el => !el.disabled && el.offsetParent !== null);
    if (!focusableEls.length) return;
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];
    function handleTrap(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      } else if (e.key === 'Escape') {
        closeSuccessModal();
      }
    }
    modal.addEventListener('keydown', handleTrap);
    // Focus the first element
    setTimeout(() => firstEl.focus(), 50);
    // Remove event listener when modal is closed
    function cleanup() {
      modal.removeEventListener('keydown', handleTrap);
      modal.removeEventListener('transitionend', cleanup);
    }
    modal.addEventListener('transitionend', cleanup);
  }

  // Make submitApplication globally available
  window.submitApplication = submitApplication;

  // --- Smooth Scrolling ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // --- Scroll Indicator ---
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        scrollIndicator.style.opacity = '0';
      } else {
        scrollIndicator.style.opacity = '0.7';
      }
    });
  }

  // --- Hash-based Navigation ---
  function handleHashNavigation() {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    switch(hash) {
      case 'about':
      case '':
        showTab('hero', true);
        break;
      case 'apply':
        showTab('apply', true);
        break;
      case 'openpositions':
      case 'careers':
        showTab('openPositions', true);
        break;
      case 'products':
        showTab('products', true);
        break;
      default:
        showTab('hero', true);
    }
  }
  
  // Handle hash navigation on page load and hash change
  window.addEventListener('hashchange', handleHashNavigation);
  
  // On initial load
  handleHashNavigation();

  // --- Phone Number Copy Functionality ---
  const phoneNumber = document.getElementById('phoneNumber');
  const copyClipboard = document.getElementById('copyClipboard');
  
  if (phoneNumber && copyClipboard) {
    const copyPhoneNumber = () => {
      const phoneText = phoneNumber.textContent;
      navigator.clipboard.writeText(phoneText).then(() => {
        // Show a brief visual feedback
        const originalText = copyClipboard.innerHTML;
        copyClipboard.innerHTML = '<i class="fas fa-check text-green-500"></i>';
        setTimeout(() => {
          copyClipboard.innerHTML = originalText;
        }, 1000);
      }).catch(err => {
        console.error('Failed to copy phone number:', err);
      });
    };

    phoneNumber.addEventListener('click', copyPhoneNumber);
    copyClipboard.addEventListener('click', copyPhoneNumber);
  }

  // --- Carousel Logic ---
  class Carousel {
    constructor() {
      this.currentSlide = 0;
      this.slides = document.querySelectorAll('.carousel-slide');
      this.dots = document.querySelectorAll('.carousel-dot');
      this.prevBtn = document.querySelector('.carousel-control.prev');
      this.nextBtn = document.querySelector('.carousel-control.next');
      this.autoPlayInterval = null;
      
      this.init();
    }
    
    init() {
      if (this.slides.length === 0) return;
      
      // Add event listeners
      this.prevBtn?.addEventListener('click', () => this.prevSlide());
      this.nextBtn?.addEventListener('click', () => this.nextSlide());
      
      // Add dot navigation
      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => this.goToSlide(index));
      });
      
      // Start auto-play
      this.startAutoPlay();
      
      // Pause auto-play on hover
      const carouselContainer = document.querySelector('.carousel-container');
      if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => this.stopAutoPlay());
        carouselContainer.addEventListener('mouseleave', () => this.startAutoPlay());
      }
    }
    
    goToSlide(index) {
      // Remove active class from current slide and dot
      this.slides[this.currentSlide].classList.remove('active');
      this.dots[this.currentSlide].classList.remove('active');
      
      // Update current slide
      this.currentSlide = index;
      
      // Add active class to new slide and dot
      this.slides[this.currentSlide].classList.add('active');
      this.dots[this.currentSlide].classList.add('active');
    }
    
    nextSlide() {
      const nextIndex = (this.currentSlide + 1) % this.slides.length;
      this.goToSlide(nextIndex);
    }
    
    prevSlide() {
      const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
      this.goToSlide(prevIndex);
    }
    
    startAutoPlay() {
      this.stopAutoPlay(); // Clear any existing interval
      this.autoPlayInterval = setInterval(() => {
        this.nextSlide();
      }, 5000); // Change slide every 5 seconds
    }
    
    stopAutoPlay() {
      if (this.autoPlayInterval) {
        clearInterval(this.autoPlayInterval);
        this.autoPlayInterval = null;
      }
    }
  }
  
  // Initialize carousel when DOM is loaded
  new Carousel();

  // --- Milestone Info Box Hover Logic ---
  const milestoneCards = document.querySelectorAll('.milestone-card');
  const milestoneInfo = document.getElementById('milestoneInfo');
  const milestoneDots = document.querySelectorAll('.milestone-dot');
  const milestoneNavLeft = document.getElementById('milestoneNavLeft');
  const milestoneNavRight = document.getElementById('milestoneNavRight');
  const milestonesGallery = document.getElementById('milestonesGallery');

  // Define milestone data (update as needed)
  window.milestoneData = [
    {
      year: '1997',
      title: '<b>Humble Beginnings</b>',
      desc: 'REIGN-NAN Sales Industry was established as a trading company offering packing materials, gaskets, o-rings, cords, and engineering plastics.'
    },
    {
      year: '2000',
      title: '<b>Expansion to Services</b>',
      desc: 'REIGN-NAN ventured beyond trading, beginning insulation and cladding services for industrial applications.'
    },
    {
      year: '2003',
      title: '<b>First Headquarters Constructed</b>',
      desc: 'Completion of REIGN-NAN’s first building marked a major step in company infrastructure and growth.'
    },
    {
      year: '2008',
      title: '<b>Official Incorporation & Strategic Partnerships</b>',
      desc: 'REIGN-NAN Sales Industry & General Contractor, Inc. was incorporated under the SEC.\nAlso appointed as the exclusive distributor of AESSEAL and tapped by Wyeth as an in-house contractor.'
    },
    {
      year: '2010',
      title: '<b>Industry Presence Strengthened</b>',
      desc: 'Became a prominent participant in the PSME PhilMachinery Exhibition, reinforcing the company’s reputation in the mechanical engineering industry.'
    },
    {
      year: '2013',
      title: '<b>International Recognition & ESP Division Launched</b>',
      desc: 'REIGN-NAN received the International Quality Crown Award in London.\nLaunched the ESP (Equipment, Services, and Parts) business line to diversify offerings.'
    },
    {
      year: '2016',
      title: '<b>Major Hot Insulation Contract</b>',
      desc: 'Secured a significant contract for hot insulation and cladding, demonstrating continued technical growth and trust in industrial sectors.'
    },
    {
      year: '2018',
      title: '<b>Global Collaborations</b>',
      desc: 'Formed key partnerships with international firms:<br>KC Cottrell (South Korea)<br>TAPC (Australia)<br>These partnerships strengthened REIGN-NAN’s global sourcing and service capabilities.'
    },
    {
      year: '2020',
      title: '<b>Landmark Projects Amid Challenges</b>',
      desc: 'Awarded contracts with:<br>JG Summit Petrochemical Corporation (JGSPC) for scaffolding services<br>Philippine Geothermal Production Company for civil and mechanical maintenance (MSA)'
    },
    {
      year: '2022',
      title: '<b>Recognitions & Long-Term Contracts</b>',
      desc: 'Received the “Best Bearing Supplier” recognition.\nAlso secured a 3-year industrial painting contract with JG Summit, showcasing long-term client trust.'
    },
    {
      year: '2023',
      title: '<b>Continued Project Acquisition</b>',
      desc: 'Awarded contracts for Building & Grounds Maintenance and another Insulation and Cladding project—highlighting consistent project wins.'
    },
    {
      year: '2025',
      title: '<b>Digital Transformation Begins</b>',
      desc: 'Development of the official RSIGCI website begins, marking a major step toward digital modernization and increased public visibility.'
    }
  ];

  // Initialize year labels
  function updateYearLabels() {
    milestoneCards.forEach((card, index) => {
      const yearLabel = card.querySelector('.milestone-year-label');
      if (yearLabel && milestoneData[index]) {
        yearLabel.textContent = milestoneData[index].year;
      }
    });
  }

  // Update info box with milestone data
  function updateMilestoneInfo(index) {
    if (!milestoneInfo) return;
    const title = milestoneInfo.querySelector('.milestone-info-title');
    const desc = milestoneInfo.querySelector('.milestone-info-desc');
    if (title) title.innerHTML = milestoneData[index].title;
    if (desc) desc.textContent = milestoneData[index].desc;
  }

  // Reset to default state
  function resetMilestoneInfo() {
    if (!milestoneInfo) return;
    const title = milestoneInfo.querySelector('.milestone-info-title');
    const desc = milestoneInfo.querySelector('.milestone-info-desc');
    if (title) title.innerHTML = '<b>REIGN-NAN Achievements</b>';
    if (desc) desc.textContent = 'Explore our journey through the years';
  }

  // Update active states
  function updateActiveStates(activeIndex) {
    // Update cards
    milestoneCards.forEach((card, index) => {
      card.classList.toggle('active', index === activeIndex);
    });

    // Update dots
    milestoneDots.forEach((dot, index) => {
      dot.classList.toggle('milestone-dot-active', index === activeIndex);
    });
  }

  // Navigation functionality
  let currentMilestoneIndex = 0;

  function scrollToMilestone(index) {
    const card = milestoneCards[index];
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      currentMilestoneIndex = index;
      updateActiveStates(index);
      updateMilestoneInfo(index);
      updateNavigationButtons();
    }
  }

  function updateNavigationButtons() {
    if (typeof milestoneNavLeft !== 'undefined' && milestoneNavLeft) {
      milestoneNavLeft.disabled = currentMilestoneIndex === 0;
    }
    if (typeof milestoneNavRight !== 'undefined' && milestoneNavRight) {
      milestoneNavRight.disabled = currentMilestoneIndex === milestoneCards.length - 1;
    }
  }

  // Event listeners for navigation buttons
  if (typeof milestoneNavLeft !== 'undefined' && milestoneNavLeft) {
    milestoneNavLeft.addEventListener('click', () => {
      if (currentMilestoneIndex > 0) {
        scrollToMilestone(currentMilestoneIndex - 1);
      }
    });
  }
  if (typeof milestoneNavRight !== 'undefined' && milestoneNavRight) {
    milestoneNavRight.addEventListener('click', () => {
      if (currentMilestoneIndex < milestoneCards.length - 1) {
        scrollToMilestone(currentMilestoneIndex + 1);
      }
    });
  }

  // Event listeners for milestone cards
  if (typeof milestoneCards !== 'undefined' && Array.isArray(milestoneCards)) {
    milestoneCards.forEach((card, index) => {
      if (card) {
        card.addEventListener('mouseenter', () => {
          updateActiveStates(index);
          updateMilestoneInfo(index);
        });
        card.addEventListener('mouseleave', () => {
          updateActiveStates(currentMilestoneIndex);
          if (currentMilestoneIndex === index) {
            updateMilestoneInfo(index);
          } else {
            resetMilestoneInfo();
          }
        });
        card.addEventListener('click', () => {
          scrollToMilestone(index);
        });
      }
    });
  }

  // Event listeners for milestone dots
  if (typeof milestoneDots !== 'undefined' && Array.isArray(milestoneDots)) {
    milestoneDots.forEach((dot, index) => {
      if (dot) {
        dot.addEventListener('click', () => {
          scrollToMilestone(index);
        });
        dot.addEventListener('mouseenter', () => {
          updateActiveStates(index);
          updateMilestoneInfo(index);
        });
        dot.addEventListener('mouseleave', () => {
          updateActiveStates(currentMilestoneIndex);
          if (currentMilestoneIndex === index) {
            updateMilestoneInfo(index);
          } else {
            resetMilestoneInfo();
          }
        });
      }
    });
  }

  // Initialize
  updateYearLabels();
  updateNavigationButtons();
  resetMilestoneInfo();

  // --- Milestone Focus Overlay for Mobile ---
function isMobile() {
  return window.innerWidth <= 600;
}
const milestonesSection = document.querySelector('.milestones-section');
const milestoneFocusOverlay = document.querySelector('.milestone-focus-overlay');
const milestoneCardsArr = Array.from(document.querySelectorAll('.milestone-card'));
const milestoneFocusArrowLeft = document.querySelector('.milestone-focus-arrow.left');
const milestoneFocusArrowRight = document.querySelector('.milestone-focus-arrow.right');
let focusedMilestoneIdx = 0;
let isMilestoneFading = false;

// Add page number indicator below the expanded card
function updateMilestonePageIndicator() {
  let overlayCard = document.querySelector('.milestones-section.milestone-focus-active .milestone-card.active');
  let indicator = document.querySelector('.milestone-page-indicator');
  if (!overlayCard) return;
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'milestone-page-indicator';
    indicator.style.textAlign = 'center';
    indicator.style.fontSize = '1.02rem';
    indicator.style.color = '#174ea6';
    indicator.style.fontWeight = '600';
    indicator.style.margin = '0.5rem 0 0.2rem 0';
    overlayCard.parentNode.insertBefore(indicator, overlayCard.nextSibling);
  }
  indicator.textContent = `Page ${focusedMilestoneIdx + 1} / ${milestoneCardsArr.length}`;
}

function showMilestoneModalDesc(idx) {
  const card = milestoneCardsArr[idx];
  if (!card) return;
  let title = '', desc = '';
  if (window.milestoneData && window.milestoneData[idx]) {
    title = window.milestoneData[idx].title;
    desc = window.milestoneData[idx].desc;
  } else {
    // fallback: try to get from DOM
    const domTitle = card.querySelector('.milestone-info-title');
    const domDesc = card.querySelector('.milestone-info-desc');
    title = domTitle ? domTitle.innerHTML : '';
    desc = domDesc ? domDesc.textContent : '';
  }
  // Remove any previous expanded title/desc
  let overlayCard = document.querySelector('.milestones-section.milestone-focus-active .milestone-card.active');
  if (!overlayCard) overlayCard = card;
  const oldTitle = overlayCard.querySelector('.milestone-expanded-title');
  const oldDesc = overlayCard.querySelector('.milestone-expanded-desc');
  if (oldTitle) oldTitle.remove();
  if (oldDesc) oldDesc.remove();
  const img = overlayCard.querySelector('.milestone-img');
  if (img) {
    const titleEl = document.createElement('div');
    titleEl.className = 'milestone-expanded-title';
    titleEl.innerHTML = title;
    const descEl = document.createElement('div');
    descEl.className = 'milestone-expanded-desc';
    descEl.innerHTML = desc.replace(/\n/g, '<br>');
    img.insertAdjacentElement('afterend', descEl);
    img.insertAdjacentElement('afterend', titleEl);
  }
  updateMilestonePageIndicator();
}
function removeMilestoneModalDesc(idx) {
  const card = milestoneCardsArr[idx];
  if (!card) return;
  const descEl = card.querySelector('.milestone-modal-desc');
  if (descEl) descEl.remove();
  // Remove page indicator if present
  let indicator = document.querySelector('.milestone-page-indicator');
  if (indicator) indicator.remove();
}
function focusMilestone(idx) {
  milestoneCardsArr.forEach((c, i) => {
    if (i === idx) {
      c.classList.add('active');
      c.style.display = 'flex';
      showMilestoneModalDesc(i);
    } else {
      c.classList.remove('active');
      c.style.display = 'none';
      removeMilestoneModalDesc(i);
    }
  });
  milestonesSection.classList.add('milestone-focus-active');
  focusedMilestoneIdx = idx;
  updateMilestonePageIndicator();
  updateNavigationButtons();
}

function fadeToMilestone(nextIdx) {
  if (isMilestoneFading) return;
  // Prevent looping: only allow if nextIdx is within bounds
  if (nextIdx < 0 || nextIdx >= milestoneCardsArr.length) return;
  isMilestoneFading = true;
  setArrowButtonsEnabled(false);
  // Only show the next card, hide all others
  milestoneCardsArr.forEach((c, i) => {
    if (i !== nextIdx && i !== focusedMilestoneIdx) {
      c.style.display = 'none';
      c.classList.remove('active');
      removeMilestoneModalDesc(i);
    }
  });
  const currentIdx = focusedMilestoneIdx;
  const currentCard = milestoneCardsArr[currentIdx];
  const nextCard = milestoneCardsArr[nextIdx];
  if (!currentCard || !nextCard) { isMilestoneFading = false; setArrowButtonsEnabled(true); return; }
  // Fade out current
  currentCard.style.transition = 'opacity 0.6s';
  currentCard.style.opacity = '0';
  setTimeout(() => {
    currentCard.classList.remove('active');
    currentCard.style.transition = '';
    currentCard.style.opacity = '';
    currentCard.style.display = 'none';
    removeMilestoneModalDesc(currentIdx);
    // Fade in next
    nextCard.style.display = 'flex';
    nextCard.classList.add('active');
    showMilestoneModalDesc(nextIdx);
    nextCard.style.opacity = '0';
    nextCard.style.transition = 'opacity 0.6s';
    void nextCard.offsetWidth; // Force reflow
    milestonesSection.classList.add('milestone-focus-active');
    focusedMilestoneIdx = nextIdx;
    setTimeout(() => {
      nextCard.style.opacity = '1';
      setTimeout(() => {
        nextCard.style.transition = '';
        nextCard.style.opacity = '';
        isMilestoneFading = false;
        setArrowButtonsEnabled(true);
        updateMilestonePageIndicator();
        updateNavigationButtons();
      }, 700);
    }, 10);
  }, 600);
}

function unfocusMilestone() {
  milestonesSection.classList.remove('milestone-focus-active');
  milestoneCardsArr.forEach((c, i) => {
    c.classList.remove('active');
    c.style.display = '';
    removeMilestoneModalDesc(i);
  });
  cleanUpMilestoneCardTitlesDescs(); // <-- Ensure cleanup on unfocus
}
function cleanUpMilestoneCardTitlesDescs() {
  milestoneCardsArr.forEach(card => {
    const oldTitle = card.querySelector('.milestone-expanded-title');
    const oldDesc = card.querySelector('.milestone-expanded-desc');
    if (oldTitle) oldTitle.remove();
    if (oldDesc) oldDesc.remove();
  });
}
if (milestonesSection && milestoneFocusOverlay && milestoneCardsArr.length) {
  milestoneCardsArr.forEach((card, idx) => {
    card.addEventListener('click', (e) => {
      // On mobile, trigger focus for any click inside the card
      if (isMobile() && !milestonesSection.classList.contains('milestone-focus-active')) {
        focusMilestone(idx);
      }
      // If already in focus mode, do nothing (prevent click)
      if (isMobile() && milestonesSection.classList.contains('milestone-focus-active')) {
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
    });
  });
  milestoneFocusOverlay.addEventListener('click', () => {
    if (isMobile()) {
      unfocusMilestone();
    }
  });
  if (milestoneFocusArrowLeft && milestoneFocusArrowRight) {
    milestoneFocusArrowLeft.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isMobile() && focusedMilestoneIdx > 0) {
        fadeToMilestone(focusedMilestoneIdx - 1);
      }
    });
    milestoneFocusArrowRight.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isMobile() && focusedMilestoneIdx < milestoneCardsArr.length - 1) {
        fadeToMilestone(focusedMilestoneIdx + 1);
      }
    });
  }
  // Optional: Remove focus on resize
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      unfocusMilestone();
    }
  });
}

function setArrowButtonsEnabled(enabled) {
  if (typeof milestoneNavLeft !== 'undefined' && milestoneNavLeft) milestoneFocusArrowLeft.disabled = !enabled || focusedMilestoneIdx === 0;
  if (typeof milestoneNavRight !== 'undefined' && milestoneNavRight) milestoneFocusArrowRight.disabled = !enabled || focusedMilestoneIdx === milestoneCardsArr.length - 1;
}

  // --- Initialize Everything ---
  // Setup all button listeners
  setupButtonListeners();
  
  // Setup See More button
  setupSeeMoreButton();
    
    // Setup file upload
    setupFileUpload();
  
  // Load jobs when page loads
  document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, testing Firebase and Google Drive connection...');
    
    // Test if FirebaseService is available
    if (typeof FirebaseService === 'undefined') {
      console.error('FirebaseService is not defined! Check if firebase-config.js is loaded.');
      document.getElementById('jobsContainer').innerHTML = `
        <div class="col-span-2 text-center py-12">
          <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
          <p class="text-gray-500 text-lg">Firebase not connected</p>
          <p class="text-gray-400">Please check the console for errors</p>
        </div>
      `;
      return;
    }
    
    // Test if GoogleDriveService is available
    if (typeof GoogleDriveService === 'undefined') {
      console.error('GoogleDriveService is not defined! Check if google-drive-service.js is loaded.');
      // Continue anyway since we can still submit applications without file uploads
    }
    
    console.log('FirebaseService is available, loading jobs...');
    
    try {
      await loadJobs();
      
      // Update position options in form
      const jobs = await FirebaseService.getJobs();
      const positionSelect = document.querySelector('select');
      if (positionSelect && jobs.length > 0) {
        const activeJobs = jobs.filter(job => job.status === 'active');
        positionSelect.innerHTML = '<option value="">Select a position</option>' + 
          activeJobs.map(job => `<option value="${job.title}">${job.title}</option>`).join('') +
          '<option value="Other">Other</option>';
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      document.getElementById('jobsContainer').innerHTML = `
        <div class="col-span-2 text-center py-12">
          <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
          <p class="text-gray-500 text-lg">Error loading jobs</p>
          <p class="text-gray-400">${error.message}</p>
        </div>
      `;
    }
  });

  // Add listeners to remove error state on input
  ['fullName', 'email', 'phone', 'position', 'coverLetter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function() {
        el.classList.remove('form-input-error');
        const error = document.getElementById(id + 'Error');
        if (error) error.style.display = 'none';
      });
    }
  });
  
  // Remove file error on file select
  if (resumeFile) {
    resumeFile.addEventListener('change', function() {
      document.getElementById('resumeError').style.display = 'none';
    });
  }
  
  // Remove error on input for otherPosition
  if (otherPositionInput) {
  otherPositionInput.addEventListener('input', function() {
    otherPositionInput.classList.remove('form-input-error');
    document.getElementById('otherPositionError').style.display = 'none';
    });
  }

  // Load jobs if we're on the open positions tab
  if (window.location.hash === '#openPositions') {
    loadJobs();
  }

  // --- Hero Image Switcher ---
  const heroImageMain = document.getElementById('heroImageMain');
  const heroImageSecond = document.getElementById('heroImageSecond');
  let heroCurrent = 0;
  if (heroImageMain && heroImageSecond) {
    setInterval(() => {
      if (heroCurrent === 0) {
        heroImageMain.classList.remove('show');
        heroImageSecond.classList.add('show');
        heroCurrent = 1;
      } else {
        heroImageSecond.classList.remove('show');
        heroImageMain.classList.add('show');
        heroCurrent = 0;
      }
    }, 4000);
  }

  // Attach event listener to milestone-focus-close button
  const milestoneFocusClose = document.querySelector('.milestone-focus-close');
  if (milestoneFocusClose) {
    milestoneFocusClose.addEventListener('click', function(e) {
      e.stopPropagation();
      unfocusMilestone();
    });
  }

  // Add skip to content link at the top of the body
  document.body.insertAdjacentHTML('afterbegin', '<a href="#mainContent" class="skip-link">Skip to main content</a>');

  // Smooth scrolling for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.focus({ preventScroll: true });
      }
    });
  });

  // Intersection Observer for fade-in/slide-in on all main sections
  const animatedSections = Array.from(document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right'));
  animatedSections.forEach(sec => sec.classList.add('scroll-fade-init'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('scroll-fade-animated')) {
        entry.target.classList.add('scroll-fade-in', 'scroll-fade-animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  animatedSections.forEach(sec => observer.observe(sec));

  // Loading overlay logic for async actions (example usage: show/hide overlay)
  window.showLoadingOverlay = function() {
    let overlay = document.querySelector('.loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.innerHTML = '<div class="spinner"></div>';
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
  };
  window.hideLoadingOverlay = function() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => { overlay.style.display = 'none'; }, 300);
    }
  };
  // Usage: call showLoadingOverlay() before async, hideLoadingOverlay() after

  // Ensure focus trap for modals and mobile menu (already present, but ensure ARIA roles/labels)
  // Example: document.getElementById('mobileMenu').setAttribute('role', 'dialog');
  // Add ARIA attributes to modals if not present
  const modals = document.querySelectorAll('[role="dialog"]');
  modals.forEach(modal => {
    if (!modal.hasAttribute('aria-modal')) modal.setAttribute('aria-modal', 'true');
  });
}); 