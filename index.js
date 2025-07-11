document.addEventListener('DOMContentLoaded', function() {
  // --- DOM ELEMENT ASSIGNMENTS (MUST BE FIRST) ---
  const heroSection = document.getElementById('heroSection');
  const aboutSection = document.getElementById('about');
  const applySection = document.getElementById('apply');
  const openPositionsTab = document.getElementById('openPositionsTab');
  const productsTab = document.getElementById('productsTab');
  const homepageSections = document.getElementById('homepageSections');

  // --- Navigation and Tab Logic ---
  // (showTab function is defined later in the file)

  // --- Mobile Menu Functions ---
  function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('translate-x-full');
  }

  function closeMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.add('translate-x-full');
  }

  // Make mobile menu functions globally available
  window.toggleMobileMenu = toggleMobileMenu;
  window.closeMobileMenu = closeMobileMenu;

  // --- Mobile Menu Accessibility & UX Enhancements ---
  const hamburgerBtn = document.querySelector('nav .md\:hidden button');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileAboutBtn = document.getElementById('mobileAboutBtn');
  function openMobileMenu() {
    mobileMenu.classList.remove('translate-x-full');
    document.body.style.overflow = 'hidden';
    setTimeout(() => { if (mobileAboutBtn) mobileAboutBtn.focus(); }, 200);
  }
  function closeMobileMenuAndRestoreFocus() {
    mobileMenu.classList.add('translate-x-full');
    document.body.style.overflow = '';
    if (hamburgerBtn) hamburgerBtn.focus();
  }
  // Override global functions
  window.toggleMobileMenu = openMobileMenu;
  window.closeMobileMenu = closeMobileMenuAndRestoreFocus;

  // --- Navigation Functions ---
  function goToHomepage() {
    // Clear any hash and show the hero section
    window.location.hash = '';
    showTab('hero');
    window.scrollTo(0, 0);
    // Reset See More button
    resetSeeMoreButton();
  }

  function resetSeeMoreButton() {
    const seeMoreText = document.getElementById('seeMoreText');
    const seeMoreIcon = document.getElementById('seeMoreIcon');
    if (seeMoreText && seeMoreIcon) {
      seeMoreText.textContent = 'See More About Our Company';
      seeMoreIcon.classList.remove('fa-chevron-up');
      seeMoreIcon.classList.add('fa-chevron-down');
    }
  }

  // Make goToHomepage globally available
  window.goToHomepage = goToHomepage;

  // --- See More Button Toggle Logic ---
  function setupSeeMoreButton() {
    const seeMoreBtn = document.getElementById('seeMoreBtn');
    const homepageSections = document.getElementById('homepageSections');
    const seeMoreText = document.getElementById('seeMoreText');
    const seeMoreIcon = document.getElementById('seeMoreIcon');
    
    if (seeMoreBtn && homepageSections) {
      seeMoreBtn.onclick = function() {
        const isExpanded = !homepageSections.classList.contains('hidden');
        if (isExpanded) {
          // Hide sections
          homepageSections.classList.add('hidden');
          seeMoreText.textContent = 'See More About Our Company';
          seeMoreIcon.className = 'fas fa-chevron-down ml-2';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Show sections
          homepageSections.classList.remove('hidden');
          seeMoreText.textContent = 'See Less';
          seeMoreIcon.className = 'fas fa-chevron-up ml-2';
          setTimeout(() => {
            homepageSections.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      };
    }
  }
  // Ensure See More button is always initialized after all DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSeeMoreButton);
  } else {
    setupSeeMoreButton();
  }

  // --- Hero Buttons ---
  document.getElementById('exploreOpportunitiesBtn').onclick = function() { showTab('openPositions'); };
  document.getElementById('applyNowBtn').onclick = function() { showTab('apply'); };
  // REMOVE the old seeMoreBtn onclick here (it is now handled by setupSeeMoreButton)

  // --- Header Navigation ---
  // (These will be set up after showTab function is defined)

  // --- Mobile Navigation ---
  // (These will be set up after showTab function is defined)

  // --- Back to Home Buttons ---
  // (These will be set up after showTab function is defined)

  // --- Success Modal ---
  // (This will be set up after showTab function is defined)

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
  document.addEventListener('DOMContentLoaded', function() {
    new Carousel();
  });

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

      // Display current page jobs
      container.innerHTML = currentJobs.map((job, index) => `
        <div class="slide-in-right stagger-${index + 1} job-card bg-white p-4 md:p-8 rounded-xl md:rounded-2xl shadow-sm">
          <div class="flex items-start justify-between mb-3 md:mb-4">
            <div class="flex-1 min-w-0">
              <h3 class="text-lg md:text-2xl font-semibold mb-2 text-gray-800 truncate">${job.title}</h3>
              <p class="text-sm md:text-base text-gray-600 mb-2 md:mb-4">
                <i class="fas fa-map-marker-alt mr-1 md:mr-2 text-orange-500"></i>
                <span class="truncate">${job.location}</span>
              </p>
            </div>
            <div class="bg-orange-100 text-orange-600 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ml-2 flex-shrink-0">
              ${job.type}
            </div>
          </div>
          <p class="text-sm md:text-base text-gray-600 mb-4 md:mb-6 leading-relaxed" id="jobDesc-${job.id}">
            ${job.description && job.description.length > 150 ? 
              `<span id="jobDescPreview-${job.id}">${job.description.substring(0, 150)}... <button onclick="toggleJobDescription('${job.id}')" class="text-blue-600 hover:text-blue-800 font-medium" id="toggleBtn-${job.id}">See more</button></span>
              <span id="jobDescFull-${job.id}" class="hidden">${job.description} <button onclick="toggleJobDescription('${job.id}')" class="text-blue-600 hover:text-blue-800 font-medium">See less</button></span>` 
              : (job.description || 'No description available')
            }
          </p>
          ${job.requirements && Array.isArray(job.requirements) && job.requirements.length > 0 ? `
            <div class="mb-4 md:mb-6">
              <h4 class="text-sm md:text-base font-semibold text-gray-800 mb-2">Requirements:</h4>
              <ul class="list-disc list-inside text-sm md:text-base text-gray-600 space-y-1">
                ${job.requirements.map(req => `<li>${req}</li>`).join('')}
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

  // Position selection logic
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

  // --- File Upload System (RESTORED FROM ORIGINAL) ---
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
    function handleFileUpload(file) {
      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
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
  // Ensure file upload is set up on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFileUpload);
  } else {
    setupFileUpload();
  }

  // --- Application Submission (RESTORED FILE UPLOAD) ---
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
      hasError = true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      document.getElementById('email').classList.add('form-input-error');
      document.getElementById('emailError').textContent = 'Email is required.';
      document.getElementById('emailError').style.display = 'block';
      hasError = true;
    } else if (!emailRegex.test(email)) {
      document.getElementById('email').classList.add('form-input-error');
      document.getElementById('emailError').textContent = 'Please enter a valid email address.';
      document.getElementById('emailError').style.display = 'block';
      hasError = true;
    }
    if (!phone) {
      document.getElementById('phone').classList.add('form-input-error');
      document.getElementById('phoneError').textContent = 'Phone number is required.';
      document.getElementById('phoneError').style.display = 'block';
      hasError = true;
    }
    if (!position) {
      document.getElementById('position').classList.add('form-input-error');
      document.getElementById('positionError').textContent = 'Please select a position.';
      document.getElementById('positionError').style.display = 'block';
      hasError = true;
    } else if (position === 'Other' && !otherPosition) {
      document.getElementById('otherPosition').classList.add('form-input-error');
      document.getElementById('otherPositionError').textContent = 'Please specify the position.';
      document.getElementById('otherPositionError').style.display = 'block';
      hasError = true;
    }
    if (!coverLetterValue) {
      document.getElementById('coverLetter').classList.add('form-input-error');
      document.getElementById('coverLetterError').textContent = 'Cover letter is required.';
      document.getElementById('coverLetterError').style.display = 'block';
      hasError = true;
    }
    if (!file) {
      document.getElementById('resumeError').textContent = 'Please upload your resume or CV.';
      document.getElementById('resumeError').style.display = 'block';
      hasError = true;
    }
    const policyAgreement = document.getElementById('policyAgreement');
    if (!policyAgreement.checked) {
      document.getElementById('policyAgreementError').textContent = 'You must agree to the Privacy Policy and Terms of Service.';
      document.getElementById('policyAgreementError').style.display = 'block';
      hasError = true;
    } else {
      document.getElementById('policyAgreementError').style.display = 'none';
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
    loadingOverlay.classList.remove('hidden');
    const button = document.getElementById('submitBtn');
    const originalText = button.innerHTML;
    const originalClasses = button.className;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Submitting Application...';
    button.disabled = true;
    button.className = originalClasses.replace('pulse-glow', '') + ' bg-gray-500';
    try {
      console.log('Submitting application with file upload to Google Drive:', application);
      console.log('File to upload:', file);
      if (file) {
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
      loadingOverlay.classList.add('hidden');
      form.style.display = 'none';
      form.reset();
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
      loadingOverlay.classList.add('hidden');
      button.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i>Submission Failed! Try Again';
      button.className = originalClasses.replace('pulse-glow', '') + ' bg-red-600';
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
        button.innerHTML = originalText;
        button.className = originalClasses;
        button.disabled = false;
      }, 3000);
    }
  }

  // Success Modal functions
  function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('hidden');
  }
  
  function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.add('hidden');
    // Show the form again for next submission
    const form = document.getElementById('applicationForm');
    if (form) form.style.display = '';
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
      case 'careers': // Added to support footer link
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

  // --- Initialize ---
  // Load jobs when page loads
  document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, testing Firebase and Google Drive connection...');
    
    // Setup file upload
    setupFileUpload();
    
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
  
  // Show/hide otherPosition input
  positionSelect.addEventListener('change', function() {
    if (positionSelect.value === 'Other') {
      otherPositionInput.style.display = 'block';
    } else {
      otherPositionInput.style.display = 'none';
      otherPositionInput.value = '';
      document.getElementById('otherPositionError').style.display = 'none';
      otherPositionInput.classList.remove('form-input-error');
    }
  });
  
  // Remove error on input for otherPosition
  otherPositionInput.addEventListener('input', function() {
    otherPositionInput.classList.remove('form-input-error');
    document.getElementById('otherPositionError').style.display = 'none';
  });

  // Phone number copy-to-clipboard logic (with SVG copy icon)
  function copyPhoneNumber() {
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
  }

  if (phoneNumber) {
    phoneNumber.addEventListener('click', copyPhoneNumber);
  }
  if (copyClipboard) {
    copyClipboard.addEventListener('click', copyPhoneNumber);
  }

  // Tab logic for Open Positions
  const backToHomeBtn = document.getElementById('backToHomeBtn');
  backToHomeBtn.addEventListener('click', function() {
    showTab('hero');
  });

  // Simple Success Modal logic
  document.getElementById('successBackBtn').addEventListener('click', function() {
    closeSuccessModal();
    window.location.hash = "";
    window.scrollTo(0, 0);
    window.location.reload();
  });

  // Header Careers button opens Open Positions tab
  const headerCareersBtn = document.getElementById('headerCareersBtn');
  if (headerCareersBtn) {
    headerCareersBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showTab('openPositions');
    });
  }

  // Products & Services tab logic
  const headerProductsBtn = document.getElementById('headerProductsBtn');
  if (headerProductsBtn) {
    headerProductsBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showTab('products');
    });
  }
  if (backToHomeProductsBtn) {
    backToHomeProductsBtn.addEventListener('click', function() {
      showTab('hero');
    });
  }

  // Explore Opportunities button in hero opens Open Positions tab
  const exploreOpportunitiesBtn = document.getElementById('exploreOpportunitiesBtn');
  if (exploreOpportunitiesBtn) {
    exploreOpportunitiesBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showTab('openPositions');
    });
  }

  // Apply Now button in hero navigates to apply tab
  const applyNowBtn = document.getElementById('applyNowBtn');
  if (applyNowBtn) {
    applyNowBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showTab('apply');
    });
  }

  // --- Footer Quick Links Setup ---
  // Ensure footer links trigger correct tab logic
  document.querySelectorAll('footer a[href="#about"]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      showTab('about');
    });
  });
  document.querySelectorAll('footer a[href="#careers"]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      showTab('openPositions');
    });
  });
  document.querySelectorAll('footer a[href="#apply"]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      showTab('apply');
    });
  });

  // Centralized tab logic
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
      // Reset See More button
      resetSeeMoreButton();
      hash = '#about';
    } else if (
      tabName === 'company-overview' ||
      tabName === 'leadership' ||
      tabName === 'milestones'
    ) {
      // Show both hero and about sections
      if (heroSection) { heroSection.style.display = ''; heroSection.classList.remove('hidden'); }
      if (homepageSections) homepageSections.style.display = '';
      // Optionally scroll to section
      const section = document.getElementById(tabName);
      if (section) section.scrollIntoView({ behavior: 'smooth' });
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

  // --- Header Navigation Setup (AFTER showTab is defined) ---
  console.log('DEBUG: Attaching header button listeners');
  const debugHeaderAboutBtn = document.getElementById('headerAboutBtn');
  const debugHeaderProductsBtn = document.getElementById('headerProductsBtn');
  const debugHeaderCareersBtn = document.getElementById('headerCareersBtn');
  const debugHeaderApplyBtn = document.getElementById('headerApplyBtn');
  console.log('DEBUG: headerAboutBtn:', debugHeaderAboutBtn);
  console.log('DEBUG: headerProductsBtn:', debugHeaderProductsBtn);
  console.log('DEBUG: headerCareersBtn:', debugHeaderCareersBtn);
  console.log('DEBUG: headerApplyBtn:', debugHeaderApplyBtn);
  document.getElementById('headerAboutBtn').onclick = function() { showTab('about'); };
  document.getElementById('headerProductsBtn').onclick = function() { showTab('products'); };
  document.getElementById('headerCareersBtn').onclick = function() { showTab('openPositions'); };
  document.getElementById('headerApplyBtn').onclick = function() { showTab('apply'); };

  // --- Mobile Navigation Setup (AFTER showTab is defined) ---
  document.getElementById('mobileAboutBtn').onclick = function() { showTab('about'); };
  document.getElementById('mobileCareersBtn').onclick = function() { showTab('openPositions'); };
  document.getElementById('mobileApplyBtn').onclick = function() { showTab('apply'); };

  // --- Back to Home Buttons Setup (AFTER showTab is defined) ---
  document.getElementById('backToHomeBtn').onclick = function() { showTab('hero'); };
  document.getElementById('backToHomeProductsBtn').onclick = function() { showTab('hero'); };

  // --- Success Modal Setup (AFTER showTab is defined) ---
  document.getElementById('successBackBtn').onclick = function() { 
    document.getElementById('successModal').classList.add('hidden');
    showTab('hero');
  };

  // Load jobs if we're on the open positions tab
  if (window.location.hash === '#openPositions') {
    loadJobs();
  }
}); 