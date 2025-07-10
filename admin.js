// admin.js - JavaScript for RSIGCI Admin Dashboard

// Initialize Firebase Auth
const auth = firebase.auth();

// Global variables
let jobs = [];
let applications = [];
let currentApplicationId = null;
let jobsUnsubscribe = null;
let applicationsUnsubscribe = null;
let jobToDeleteId = null;

// Search and filter variables
let searchTerm = '';
let statusFilter = '';
let positionFilter = '';

// Performance optimization variables
let searchTimeout = null;
let isInitialized = false;

// Pagination state for applications
let applicationsCurrentPage = 1;
const applicationsPerPage = 10;

// ===== PERFORMANCE OPTIMIZATIONS =====

// Debounced search function
function debounce(func, wait) {
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(searchTimeout);
      func(...args);
    };
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(later, wait);
  };
}

// Lazy load images
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// Optimize table rendering
function optimizeTableRendering(container, items, renderFunction) {
  const fragment = document.createDocumentFragment();
  items.forEach(item => {
    const element = renderFunction(item);
    fragment.appendChild(element);
  });
  container.innerHTML = '';
  container.appendChild(fragment);
}

// ===== AUTHENTICATION FUNCTIONS =====

// Show/hide dashboard or login form based on auth state
function updateUI(user) {
  const loginSection = document.getElementById('loginSection');
  const dashboardContent = document.getElementById('dashboardContent');
  const adminUserEmail = document.getElementById('adminUserEmail');
  if (user) {
    if (loginSection) loginSection.style.display = 'none';
    if (dashboardContent) dashboardContent.style.display = '';
    if (adminUserEmail) adminUserEmail.textContent = user.email;
  } else {
    if (loginSection) loginSection.style.display = '';
    if (dashboardContent) dashboardContent.style.display = 'none';
    if (adminUserEmail) adminUserEmail.textContent = '';
  }
}

// Toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// Friendly error message mapping
function getFriendlyAuthError(error) {
  if (!error || !error.code) return 'An unexpected error occurred. Please try again later.';
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with that email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    default:
      return 'An unexpected error occurred. Please try again or contact support.';
  }
}

// Show/hide login and reset sections
function showLoginSection() {
  document.getElementById('loginSection').style.display = '';
  document.getElementById('resetSection').style.display = 'none';
}



// ===== SEARCH AND FILTER FUNCTIONS =====

// Debounced search applications
const debouncedSearchApplications = debounce(function() {
  searchTerm = document.getElementById('applicationSearch').value.toLowerCase();
  loadApplications();
}, 300);

function searchApplications() {
  debouncedSearchApplications();
}

// Clear search
function clearSearch() {
  document.getElementById('applicationSearch').value = '';
  searchTerm = '';
  loadApplications();
}

// Debounced search jobs
const debouncedSearchJobs = debounce(function() {
  searchTerm = document.getElementById('jobSearch').value.toLowerCase();
  loadJobsTable();
}, 300);

function searchJobs() {
  debouncedSearchJobs();
}

// Clear job search
function clearJobSearch() {
  document.getElementById('jobSearch').value = '';
  searchTerm = '';
  loadJobsTable();
}

// ===== DASHBOARD FUNCTIONS =====

// Initialize dashboard
async function initializeDashboard() {
  if (isInitialized) return;
  
  try {
    await updateDashboard();
    const lastTab = localStorage.getItem('selectedTab') || 'dashboard';
    showTab(lastTab);
    setupRealtimeListeners();
    
    // Check if job was posted successfully and show toast
    const jobPostedSuccess = localStorage.getItem('jobPostedSuccess');
    if (jobPostedSuccess === '1') {
      showToast('Job posted successfully!');
      localStorage.removeItem('jobPostedSuccess');
    }
    
    isInitialized = true;
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    showToast('Error loading dashboard. Please refresh the page.');
  }
}

// Tab navigation
function showTab(tabName) {
  // Save selected tab to localStorage
  localStorage.setItem('selectedTab', tabName);

  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.add('hidden');
  });

  // Remove active class from all tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('tab-active');
  });

  // Show selected tab
  document.getElementById(tabName).classList.remove('hidden');

  // Add active class to the correct button
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.textContent.trim().replace(/\s+/g, '').toLowerCase().includes(tabName.replace('-', ''))) {
      btn.classList.add('tab-active');
    }
  });

  // Load tab-specific content
  if (tabName === 'jobs') {
    loadJobsTable();
  } else if (tabName === 'applications') {
    loadApplications();
  }
}

// Mobile sidebar toggle
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('hidden');
}

// Set up real-time listeners
function setupRealtimeListeners() {
  try {
    // Listen for jobs changes
    jobsUnsubscribe = FirebaseService.onJobsSnapshot((updatedJobs) => {
      jobs = updatedJobs;
      updateDashboardStats();
      if (document.getElementById('jobs').classList.contains('hidden') === false) {
        loadJobsTable();
      }
    });

    // Listen for applications changes
    applicationsUnsubscribe = FirebaseService.onApplicationsSnapshot((updatedApplications) => {
      applications = updatedApplications;
      updateDashboardStats();
      if (document.getElementById('applications').classList.contains('hidden') === false) {
        loadApplications();
      }
    });
  } catch (error) {
    console.error('Error setting up real-time listeners:', error);
  }
}

// Update dashboard stats
function updateDashboardStats() {
  try {
    const activeJobs = jobs.filter(job => job.status === 'active').length;
    const totalApplications = applications.length;
    const newApplications = applications.filter(app => app.status === 'new').length;
    const approvedApplications = applications.filter(app => app.status === 'approved').length;

    document.getElementById('activeJobsCount').textContent = activeJobs;
    document.getElementById('totalApplicationsCount').textContent = totalApplications;
    document.getElementById('newApplicationsCount').textContent = newApplications;
    document.getElementById('approvedCount').textContent = approvedApplications;

    loadRecentApplications();
    loadActiveJobs();
  } catch (error) {
    console.error('Error updating dashboard stats:', error);
  }
}

// Update dashboard (legacy function for compatibility)
async function updateDashboard() {
  try {
    jobs = await FirebaseService.getJobs();
    applications = await FirebaseService.getApplications();
    updateDashboardStats();
  } catch (error) {
    console.error('Error updating dashboard:', error);
    throw error;
  }
}

// Load recent applications for dashboard
function loadRecentApplications() {
  try {
    const container = document.getElementById('recentApplications');
    const recentApps = applications.slice(0, 5);
    
    container.innerHTML = recentApps.length === 0 ? 
      '<p class="text-gray-500 text-center py-4">No applications yet</p>' :
      recentApps.map(app => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p class="font-medium text-gray-800">${app.fullName}</p>
            <p class="text-sm text-gray-500">${app.position}</p>
          </div>
          <span class="status-badge status-${app.status}">${app.status}</span>
        </div>
      `).join('');
  } catch (error) {
    console.error('Error loading recent applications:', error);
  }
}

// Load active jobs for dashboard
function loadActiveJobs() {
  try {
    const container = document.getElementById('activeJobs');
    const activeJobs = jobs.filter(job => job.status === 'active').slice(0, 5);
    
    container.innerHTML = activeJobs.length === 0 ? 
      '<p class="text-gray-500 text-center py-4">No active jobs</p>' :
      activeJobs.map(job => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p class="font-medium text-gray-800">${job.title}</p>
            <p class="text-sm text-gray-500">${job.location}</p>
          </div>
          <span class="text-sm text-gray-500">${job.applications || 0} apps</span>
        </div>
      `).join('');
  } catch (error) {
    console.error('Error loading active jobs:', error);
  }
}

// ===== JOBS MANAGEMENT =====

// Load jobs table
function loadJobsTable() {
  try {
    const tbody = document.getElementById('jobsTableBody');
    let filteredJobs = jobs;
    if (searchTerm) {
      filteredJobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.location.toLowerCase().includes(searchTerm) ||
        job.department?.toLowerCase().includes(searchTerm) ||
        job.type.toLowerCase().includes(searchTerm)
      );
    }
    // Restore thead without select-all
    const thead = tbody.parentElement.querySelector('thead');
    if (thead) {
      thead.innerHTML = `<tr>
        <th class='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Position</th>
        <th class='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell'>Location</th>
        <th class='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell'>Type</th>
        <th class='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell'>Applications</th>
        <th class='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
        <th class='px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
      </tr>`;
    }
    tbody.innerHTML = filteredJobs.length === 0 ? 
      '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No jobs found</td></tr>' :
      filteredJobs.map(job => `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap">
            <div>
              <div class="text-sm font-medium text-gray-900">${safe(job.title)}</div>
              <div class="text-sm text-gray-500">${safe(job.department || 'General')}</div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${safe(job.location)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${safe(job.type)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${job.applications || 0}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="status-badge ${job.status === 'active' ? 'status-approved' : 'status-reviewing'}">${safe(job.status)}</span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button onclick="editJob('${job.id}')" class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
            <button onclick="deleteJob('${job.id}')" class="text-red-600 hover:text-red-900">Delete</button>
          </td>
        </tr>
      `).join('');
  } catch (error) {
    const tbody = document.getElementById('jobsTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-red-500">Error loading jobs</td></tr>';
  }
}

// Edit job
function editJob(jobId) {
  try {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    // Populate form with job data
    document.getElementById('jobTitle').value = job.title;
    document.getElementById('jobLocation').value = job.location;
    document.getElementById('jobType').value = job.type;
    document.getElementById('jobDepartment').value = job.department || '';
    document.getElementById('jobDescription').value = job.description;
    
    // Populate dynamic requirements
    const reqList = document.getElementById('requirementsList');
    reqList.innerHTML = '';
    if (Array.isArray(job.requirements) && job.requirements.length > 0) {
      job.requirements.forEach(req => {
        const div = document.createElement('div');
        div.className = 'flex mb-2 requirement-item';
        div.innerHTML = `<input type="text" class="form-input w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Enter a requirement" value="${safe(req.replace(/"/g, '&quot;'))}" />
          <button type="button" class="remove-req-btn ml-2 text-red-500 hover:text-red-700" title="Remove"><i class="fas fa-minus-circle"></i></button>`;
        reqList.appendChild(div);
      });
    } else {
      // At least one field
      const div = document.createElement('div');
      div.className = 'flex mb-2 requirement-item';
      div.innerHTML = `<input type="text" class="form-input w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg" placeholder="Enter a requirement" />
        <button type="button" class="remove-req-btn ml-2 text-red-500 hover:text-red-700" title="Remove"><i class="fas fa-minus-circle"></i></button>`;
      reqList.appendChild(div);
    }
    updateRemoveReqBtns();
    document.getElementById('jobBenefits').value = job.benefits || '';
    
    // Switch to new job tab
    showTab('new-job');
  } catch (error) {
    console.error('Error editing job:', error);
    showToast('Error loading job details. Please try again.');
  }
}

// Delete job
function deleteJob(jobId) {
  jobToDeleteId = jobId;
  const modal = document.getElementById('deleteJobModal');
  const modalContent = document.getElementById('deleteJobModalContent');
  const loading = document.getElementById('deleteJobLoading');
  modal.classList.remove('hidden');
  modalContent.style.display = '';
  loading.classList.add('hidden');
}

// ===== APPLICATIONS MANAGEMENT =====

// Load applications
function loadApplications() {
  try {
    // Populate position filter dropdown only if needed
    const positionFilter = document.getElementById('positionFilter');
    let previousValue = positionFilter ? positionFilter.value : '';
    if (positionFilter) {
      // Get unique positions from applications
      const uniquePositions = Array.from(new Set(applications.map(app => app.position).filter(Boolean)));
      const currentOptions = Array.from(positionFilter.options).map(opt => opt.value);
      const newOptions = [''].concat(uniquePositions);
      // Only update if options have changed
      if (currentOptions.length !== newOptions.length || !currentOptions.every((v, i) => v === newOptions[i])) {
        positionFilter.innerHTML = '<option value="">All Positions</option>' +
          uniquePositions.map(pos => `<option value="${safe(pos)}">${safe(pos)}</option>`).join('');
        // Try to restore previous selection
        if (previousValue && uniquePositions.includes(previousValue)) {
          positionFilter.value = previousValue;
        }
      }
    }

    const container = document.getElementById('applicationsList');
    const statusFilter = document.getElementById('statusFilter').value;
    const selectedPosition = positionFilter ? positionFilter.value : '';
    
    let filteredApplications = applications;
    // Only exclude deleted applications if not filtering for deleted
    if (statusFilter !== 'deleted') {
      filteredApplications = filteredApplications.filter(app => app.status !== 'deleted');
    }
    
    // Apply search filter
    if (searchTerm) {
      filteredApplications = filteredApplications.filter(app => 
        app.fullName.toLowerCase().includes(searchTerm) ||
        app.email.toLowerCase().includes(searchTerm) ||
        app.position.toLowerCase().includes(searchTerm) ||
        app.phone?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filteredApplications = filteredApplications.filter(app => app.status === statusFilter);
    }
    
    // Apply position filter
    if (selectedPosition) {
      filteredApplications = filteredApplications.filter(app => app.position === selectedPosition);
    }

    // Pagination logic for applications
    const totalApplications = filteredApplications.length;
    const totalPages = Math.ceil(totalApplications / applicationsPerPage) || 1;
    const currentPage = Math.min(applicationsCurrentPage, totalPages);
    const startIndex = (currentPage - 1) * applicationsPerPage;
    const endIndex = startIndex + applicationsPerPage;
    const currentApplications = filteredApplications.slice(startIndex, endIndex);
    // --- Bulk selection: Add Select All checkbox above grid ---
    let selectAllHtml = '';
    if (currentApplications.length > 0) {
      selectAllHtml = `<div class="mb-2 flex items-center"><input type="checkbox" id="selectAllApplications" class="mr-2" onchange="toggleSelectAllApplications(this)"><label for="selectAllApplications" class="text-sm text-gray-700 cursor-pointer">Select All</label></div>`;
    }

    container.innerHTML = (totalApplications === 0 ? 
      '<div class="text-center py-12"><p class="text-gray-500">No applications found</p></div>' :
      selectAllHtml +
      currentApplications.map(app => {
        // Handle Firestore Timestamp for appliedAt
        let appliedDate = 'Recently';
        if (app.appliedAt) {
          if (typeof app.appliedAt.toDate === 'function') {
            appliedDate = app.appliedAt.toDate().toLocaleDateString();
          } else {
            appliedDate = new Date(app.appliedAt).toLocaleDateString();
          }
        }
        // Add Restore button if status is deleted
        let restoreBtn = '';
        if (app.status === 'deleted') {
          restoreBtn = `<button class="absolute top-4 right-4 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-full font-medium shadow-lg z-10 transition-transform transform hover:scale-105 focus:outline-none" title="Restore Application" onclick="restoreApplication('${app.id}')"><i class='fas fa-undo'></i></button>`;
        }
        return `
          <div class="application-card bg-white p-6 rounded-xl shadow-sm relative" id="appCard-${app.id}">
            <input type="checkbox" class="bulk-app-checkbox absolute top-4 left-4" data-app-id="${app.id}" onchange="onBulkAppCheckboxChange()">
            <button class="absolute bottom-4 left-4 text-red-500 hover:text-red-700 focus:outline-none" title="Delete Application" onclick="showDeleteApplicationModal('${app.id}', () => deleteApplication('${app.id}'))"><i class="fas fa-trash"></i></button>
            ${restoreBtn}
            <div class="flex items-start justify-between mb-4">
              <div style="padding-left: 2rem;">
                <h3 class="text-xl font-semibold text-gray-800">${safe(app.fullName)}</h3>
                <p class="text-gray-600">${safe(app.email)}</p>
                <p class="text-sm text-gray-500">${app.phone ? `<span class="copy-phone cursor-pointer hover:underline" data-phone="${safe(app.phone)}" title="Copy to clipboard">${safe(app.phone)} <i class='fas fa-copy text-gray-400 ml-1'></i></span>` : ''}</p>
              </div>
              <div class="text-right">
                <span class="status-badge status-${app.status}">${safe(app.status)}</span>
                <p class="text-sm text-gray-500 mt-1">${safe(app.position)}</p>
              </div>
            </div>
            <div class="mb-4">
              <span class="cover-letter-truncated" id="coverLetter-${app.id}">${safe(app.coverLetter ? app.coverLetter.replace(/\n/g, ' ') : 'No cover letter provided')}</span>
              ${app.coverLetter && app.coverLetter.length > 100 ? `<button class="expand-btn" onclick="toggleExpandApp('${app.id}')" title="Show more"><i id="chevron-${app.id}" class="fas fa-chevron-down"></i></button>` : ''}
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500">Applied: ${appliedDate}</span>
              <div class="flex space-x-2">
                ${app.resumeURL ? 
                  app.resumeURL.includes('drive.google.com') ? 
                    `<div class="space-y-2">
                      <p class="text-gray-700">${safe(app.resumeFileName || 'Resume uploaded to Google Drive')}</p>
                      <div class="flex space-x-2">
                        <button onclick="viewResume('${safe(app.resumeURL)}', '${safe(app.resumeFileName || 'Resume')}')" class="icon-btn bg-green-500 hover:bg-green-600 text-white" title="View in Google Drive">
                          <i class="fab fa-google-drive"></i>
                        </button>
                        ${app.driveDownloadUrl ? 
                          `<a href="${safe(app.driveDownloadUrl)}" target="_blank" class="icon-btn bg-blue-500 hover:bg-blue-600 text-white" title="Download">
                            <i class="fas fa-download"></i>
                          </a>` : ''
                        }
                      </div>
                      <p class="text-xs text-gray-500">File stored in Google Drive</p>
                    </div>` :
                    `<div class="space-y-2">
                      <p class="text-gray-700">${safe(app.resumeFileName || 'Resume uploaded')}</p>
                      <button onclick="viewResume('${safe(app.resumeURL)}', '${safe(app.resumeFileName || 'Resume')}')" class="icon-btn bg-blue-500 hover:bg-blue-600 text-white" title="View Resume">
                        <i class="fas fa-eye mr-2"></i>View Resume
                      </button>
                    </div>`
                  : app.resumeUploadError ? 
                    `<div class="space-y-2">
                      <p class="text-gray-700">${safe(app.resumeFileName || 'Resume')} (Upload Failed)</p>
                      <p class="text-red-600 text-sm">Error: ${safe(app.resumeUploadError)}</p>
                    </div>` : 
                    '<p class="text-gray-700">No resume uploaded</p>'}
                <div class="flex items-center space-x-2">
                  <select class="status-select form-input px-3 py-1 border border-gray-300 rounded-lg text-sm" data-app-id="${app.id}" onchange="updateAppStatus('${app.id}', this.value)">
                    <option value="new" ${app.status === 'new' ? 'selected' : ''}>New</option>
                    <option value="reviewing" ${app.status === 'reviewing' ? 'selected' : ''}>Reviewing</option>
                    <option value="approved" ${app.status === 'approved' ? 'selected' : ''}>Approved</option>
                    <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                    <option value="deleted" ${app.status === 'deleted' ? 'selected' : ''}>Deleted</option>
                  </select>
                  <button onclick="viewApplication('${app.id}')" class="btn-primary view-btn" title="View">View</button>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join(''));
    // Setup pagination controls
    setupApplicationsPagination(currentPage, totalPages, totalApplications);
    // Setup copy phone numbers after loading applications
    setupCopyPhoneNumbers();
  } catch (error) {
    console.error('Error loading applications:', error);
    const container = document.getElementById('applicationsList');
    container.innerHTML = '<div class="text-center py-12"><p class="text-red-500">Error loading applications</p></div>';
  }
}

// Bulk selection logic
function toggleSelectAllApplications(checkbox) {
  const allCheckboxes = document.querySelectorAll('.bulk-app-checkbox');
  allCheckboxes.forEach(cb => { cb.checked = checkbox.checked; });
  onBulkAppCheckboxChange();
}

function showBulkActionBar(show) {
  let bar = document.getElementById('bulkActionBar');
  if (!bar && show) {
    bar = document.createElement('div');
    bar.id = 'bulkActionBar';
    bar.className = 'fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white shadow-lg rounded-xl px-6 py-4 flex items-center space-x-4 border border-gray-200';
    bar.innerHTML = `
      <span class='font-semibold text-gray-700 mr-4' id='bulkSelectedCount'></span>
      <button class='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium' onclick='bulkUpdateStatus("approved")'><i class="fas fa-check mr-2"></i>Approve</button>
      <button class='bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium' onclick='bulkUpdateStatus("rejected")'><i class="fas fa-times mr-2"></i>Reject</button>
      <button class='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium' onclick='bulkDeleteApplications()'><i class="fas fa-trash mr-2"></i>Delete</button>
      <button class='ml-4 text-gray-500 hover:text-gray-700' onclick='deselectAllApplications()'><i class="fas fa-times"></i> Cancel</button>
    `;
    document.body.appendChild(bar);
  }
  if (bar) bar.style.display = show ? '' : 'none';
}

function onBulkAppCheckboxChange() {
  const checked = Array.from(document.querySelectorAll('.bulk-app-checkbox:checked'));
  showBulkActionBar(checked.length > 0);
  if (checked.length > 0) {
    document.getElementById('bulkSelectedCount').textContent = `${checked.length} selected`;
  }
  // Update Select All checkbox state
  const allCheckboxes = document.querySelectorAll('.bulk-app-checkbox');
  const selectAll = document.getElementById('selectAllApplications');
  if (selectAll) {
    selectAll.checked = checked.length === allCheckboxes.length && allCheckboxes.length > 0;
    selectAll.indeterminate = checked.length > 0 && checked.length < allCheckboxes.length;
  }
}

function deselectAllApplications() {
  document.querySelectorAll('.bulk-app-checkbox').forEach(cb => { cb.checked = false; });
  onBulkAppCheckboxChange();
}

// Fix bulkUpdateStatus to update status and refresh UI
async function bulkUpdateStatus(newStatus) {
  const checked = Array.from(document.querySelectorAll('.bulk-app-checkbox:checked'));
  if (checked.length === 0) return;
  const loadingOverlay = document.getElementById('loadingOverlay');
  loadingOverlay.querySelector('p').textContent = `Updating application status to ${newStatus}...`;
  loadingOverlay.classList.remove('hidden');
  const prevStatuses = [];
  const affectedApps = [];
  try {
    for (const cb of checked) {
      const appId = cb.getAttribute('data-app-id');
      const app = applications.find(a => a.id === appId);
      if (app) {
        prevStatuses.push({ id: appId, prevStatus: app.status });
        affectedApps.push(app);
        await FirebaseService.updateApplicationStatus(appId, newStatus);
      }
    }
    loadingOverlay.querySelector('p').textContent = `Status updated to ${newStatus}!`;
    showToast(`Application status updated to ${newStatus}`);
    setTimeout(() => {
      loadingOverlay.classList.add('hidden');
      deselectAllApplications();
      loadApplications();
    }, 1000);
    // Show undo snackbar with affected apps
    showUndoSnackbar({
      type: 'bulk-status',
      newStatus,
      prevStatuses,
      count: checked.length,
      affectedApps
    });
  } catch (error) {
    loadingOverlay.classList.add('hidden');
    showToast('Bulk update failed: ' + error.message);
  }
}

let lastBulkUndo = null;
function showUndoSnackbar(action) {
  const snackbar = document.getElementById('undoSnackbar');
  const msg = document.getElementById('undoSnackbarMsg');
  const btn = document.getElementById('undoSnackbarBtn');
  if (!snackbar || !msg || !btn) return;
  let summary = '';
  if (action.type === 'bulk-status') {
    // Show up to 2 names/emails, then '+N more' if needed
    let names = (action.affectedApps || []).map(a => a.fullName || a.email || a.id);
    let displayNames = names.slice(0, 2).join(', ');
    if (names.length > 2) displayNames += `, +${names.length - 2} more`;
    summary = `${action.count} application${action.count > 1 ? 's' : ''} set to '${action.newStatus}'`;
    if (displayNames) summary += `: ${displayNames}.`;
  }
  msg.textContent = summary;
  snackbar.classList.remove('hidden');
  let undoTimeout = setTimeout(() => {
    snackbar.classList.add('hidden');
    lastBulkUndo = null;
  }, 5000);
  lastBulkUndo = { ...action, undoTimeout };
  btn.onclick = async function() {
    snackbar.classList.add('hidden');
    clearTimeout(undoTimeout);
    if (action.type === 'bulk-status') {
      // Revert statuses
      for (const item of action.prevStatuses) {
        await FirebaseService.updateApplicationStatus(item.id, item.prevStatus);
      }
      showToast('Bulk status change undone');
      loadApplications();
    }
    lastBulkUndo = null;
  };
}

// Custom modal for confirming application deletion
function showDeleteApplicationsModal(count, onConfirm) {
  let modal = document.getElementById('deleteApplicationsModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'deleteApplicationsModal';
    document.body.appendChild(modal);
  }
  modal.className = 'fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-xs w-full text-center relative animate-fade-in">
      <div class="mb-4">
        <i class="fas fa-trash-alt text-red-600 text-4xl"></i>
      </div>
      <h2 class="text-xl font-bold mb-2">Delete Application${count > 1 ? 's' : ''}</h2>
      <p class="text-gray-700 mb-6">Are you sure you want to delete ${count} application${count > 1 ? 's' : ''}? This cannot be undone.</p>
      <div class="flex justify-center gap-4">
        <button id="confirmDeleteApplicationsBtn" class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-medium text-base">Delete</button>
        <button id="cancelDeleteApplicationsBtn" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-base">Cancel</button>
      </div>
    </div>
  `;
  modal.style.display = '';
  document.getElementById('confirmDeleteApplicationsBtn').onclick = function() {
    modal.style.display = 'none';
    onConfirm();
  };
  document.getElementById('cancelDeleteApplicationsBtn').onclick = function() {
    modal.style.display = 'none';
  };
}

// Use custom modal in bulkDeleteApplications
async function bulkDeleteApplications() {
  const checked = Array.from(document.querySelectorAll('.bulk-app-checkbox:checked'));
  if (checked.length === 0) return;
  showDeleteApplicationsModal(checked.length, async function() {
    showLoadingOverlay(true, `Deleting ${checked.length} applications...`);
    try {
      for (const cb of checked) {
        const appId = cb.getAttribute('data-app-id');
        await FirebaseService.updateApplicationStatus(appId, 'deleted');
      }
      showToast(`Deleted ${checked.length} applications.`);
      deselectAllApplications();
      loadApplications();
    } catch (err) {
      showToast('Bulk delete failed: ' + err.message);
    } finally {
      showLoadingOverlay(false);
    }
  });
}

// Patch updateAppStatus to support silent mode
const _updateAppStatus = updateAppStatus;
updateAppStatus = async function(appId, newStatus, silent) {
  try {
    await _updateAppStatus.call(this, appId, newStatus);
    if (!silent) showToast('Status updated.');
  } catch (e) {
    if (!silent) showToast('Failed to update status: ' + e.message);
    throw e;
  }
};

// Update delete logic to set status to 'deleted'
async function deleteApplication(appId, silent) {
  try {
    await FirebaseService.updateApplicationStatus(appId, 'deleted');
    if (!silent) showToast('Application deleted.');
    loadApplications();
  } catch (error) {
    if (!silent) showToast('Failed to delete application: ' + error.message);
    throw error;
  }
}

// View application details
function viewApplication(appId) {
  try {
    const app = applications.find(a => a.id === appId);
    if (!app) return;
    
    currentApplicationId = appId;
    
    const modal = document.getElementById('applicationModal');
    const content = document.getElementById('applicationModalContent');
    
    // Handle Firestore Timestamp for appliedAt
    let appliedDate = 'Recently';
    if (app.appliedAt) {
      if (typeof app.appliedAt.toDate === 'function') {
        appliedDate = app.appliedAt.toDate().toLocaleString();
      } else {
        appliedDate = new Date(app.appliedAt).toLocaleString();
      }
    }
    
    content.innerHTML = `
      <div class="space-y-4">
        <div>
          <h4 class="font-semibold text-gray-800">Personal Information</h4>
          <p><strong>Name:</strong> ${safe(app.fullName)}</p>
          <p><strong>Email:</strong> ${safe(app.email)}</p>
          <p><strong>Phone:</strong> ${app.phone ? `<span class="copy-phone cursor-pointer hover:underline" data-phone="${safe(app.phone)}" title="Copy to clipboard">${safe(app.phone)} <i class='fas fa-copy text-gray-400 ml-1'></i></span>` : ''}</p>
        </div>
        <div>
          <h4 class="font-semibold text-gray-800">Position Applied</h4>
          <p>${safe(app.position)}</p>
        </div>
        <div>
          <h4 class="font-semibold text-gray-800">Cover Letter</h4>
          <p class="modal-cover-letter text-gray-700">${safe(app.coverLetter || 'No cover letter provided')}</p>
        </div>
        <div>
          <h4 class="font-semibold text-gray-800">Resume</h4>
          ${app.resumeURL ? 
            app.resumeURL.includes('drive.google.com') ? 
              `<div class="space-y-2">
                <p class="text-gray-700">${safe(app.resumeFileName || 'Resume uploaded to Google Drive')}</p>
                <div class="flex space-x-2">
                  <button onclick="viewResume('${safe(app.resumeURL)}', '${safe(app.resumeFileName || 'Resume')}')" class="icon-btn bg-green-500 hover:bg-green-600 text-white" title="View in Google Drive">
                    <i class="fab fa-google-drive"></i>
                  </button>
                  ${app.driveDownloadUrl ? 
                    `<a href="${safe(app.driveDownloadUrl)}" target="_blank" class="icon-btn bg-blue-500 hover:bg-blue-600 text-white" title="Download">
                      <i class="fas fa-download"></i>
                    </a>` : ''
                  }
                </div>
                <p class="text-xs text-gray-500">File stored in Google Drive</p>
              </div>` :
              `<div class="space-y-2">
                <p class="text-gray-700">${safe(app.resumeFileName || 'Resume uploaded')}</p>
                <button onclick="viewResume('${safe(app.resumeURL)}', '${safe(app.resumeFileName || 'Resume')}')" class="icon-btn bg-blue-500 hover:bg-blue-600 text-white" title="View Resume">
                  <i class="fas fa-eye mr-2"></i>View Resume
                </button>
              </div>`
            : app.resumeUploadError ? 
              `<div class="space-y-2">
                <p class="text-gray-700">${safe(app.resumeFileName || 'Resume')} (Upload Failed)</p>
                <p class="text-red-600 text-sm">Error: ${safe(app.resumeUploadError)}</p>
              </div>` : 
              '<p class="text-gray-700">No resume uploaded</p>'}
      </div>
      <div>
        <h4 class="font-semibold text-gray-800">Application Date</h4>
        <p>${appliedDate}</p>
      </div>
    </div>
  `;
    
    modal.classList.remove('hidden');
    
    // Setup copy phone numbers after viewing application
    setupCopyPhoneNumbers();
  } catch (error) {
    console.error('Error viewing application:', error);
    showToast('Error loading application details. Please try again.');
  }
}

// View resume function
function viewResume(resumeURL, fileName) {
  try {
    // Check if it's an image file
    const isImage = /\.(jpg|jpeg|png)$/i.test(fileName);
    
    if (isImage) {
      // For images, show in a modal
      const modal = document.getElementById('applicationModal');
      const content = document.getElementById('applicationModalContent');
      
      content.innerHTML = `
        <div class="text-center">
          <h3 class="text-xl font-semibold mb-4">${safe(fileName)}</h3>
          <img src="${safe(resumeURL)}" alt="${safe(fileName)}" class="max-w-full max-h-96 mx-auto rounded-lg shadow-lg" />
          <div class="mt-4">
            <a href="${safe(resumeURL)}" target="_blank" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">
              <i class="fas fa-external-link-alt mr-2"></i>Open in New Tab
            </a>
          </div>
        </div>
      `;
      
      modal.classList.remove('hidden');
    } else {
      // For PDFs and other files, open in new tab
      window.open(safe(resumeURL), '_blank');
    }
  } catch (error) {
    console.error('Error viewing resume:', error);
    showToast('Error opening resume. Please try again.');
  }
}

// Close application modal
function closeApplicationModal() {
  document.getElementById('applicationModal').classList.add('hidden');
  currentApplicationId = null;
}

// Update application status
async function updateApplicationStatus(status) {
  if (!currentApplicationId) return;
  
  // Show loading overlay
  const loadingOverlay = document.getElementById('loadingOverlay');
  loadingOverlay.querySelector('p').textContent = `Updating application status to ${status}...`;
  loadingOverlay.classList.remove('hidden');
  
  try {
    await FirebaseService.updateApplicationStatus(currentApplicationId, status);
    
    closeApplicationModal();
    
    // Show confirmation
    loadingOverlay.querySelector('p').textContent = `Application ${status}! Refreshing page...`;
    
    // Refresh the page to show updated status
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (error) {
    console.error('Error updating application status:', error);
    
    // Hide loading overlay
    loadingOverlay.classList.add('hidden');
    
    alert('Error updating application status. Please try again.');
  }
}

// Update application status from dropdown
async function updateAppStatus(appId, newStatus) {
  // Show loading overlay
  const loadingOverlay = document.getElementById('loadingOverlay');
  loadingOverlay.querySelector('p').textContent = `Updating application status to ${newStatus}...`;
  loadingOverlay.classList.remove('hidden');
  
  try {
    await FirebaseService.updateApplicationStatus(appId, newStatus);
    
    // Show confirmation
    loadingOverlay.querySelector('p').textContent = `Status updated to ${newStatus}!`;
    showToast(`Application status updated to ${newStatus}`);
    
    // Hide loading overlay after a short delay
    setTimeout(() => {
      loadingOverlay.classList.add('hidden');
    }, 1000);
    
  } catch (error) {
    console.error('Error updating application status:', error);
    
    // Hide loading overlay
    loadingOverlay.classList.add('hidden');
    
    // Show error message
    showToast('Error updating status. Please try again.');
    
    // Reset the dropdown to the original value
    const dropdown = document.querySelector(`select[data-app-id="${appId}"]`);
    if (dropdown) {
      const app = applications.find(a => a.id === appId);
      if (app) {
        dropdown.value = app.status;
      }
    }
  }
}

// Toggle expand application
function toggleExpandApp(appId) {
  try {
    const card = document.getElementById('appCard-' + appId);
    const cover = document.getElementById('coverLetter-' + appId);
    const chevron = document.getElementById('chevron-' + appId);
    if (card.classList.contains('expanded')) {
      card.classList.remove('expanded');
      cover.classList.remove('expanded');
      chevron.classList.remove('fa-chevron-up');
      chevron.classList.add('fa-chevron-down');
    } else {
      card.classList.add('expanded');
      cover.classList.add('expanded');
      chevron.classList.remove('fa-chevron-down');
      chevron.classList.add('fa-chevron-up');
    }
  } catch (error) {
    console.error('Error toggling application expansion:', error);
  }
}

// Add a helper to show a custom delete modal for a single application
function showDeleteApplicationModal(appId, onConfirm) {
  let modal = document.getElementById('deleteApplicationModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'deleteApplicationModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-xs w-full text-center relative animate-fade-in">
        <div class="mb-4">
          <i class="fas fa-trash-alt text-red-600 text-4xl"></i>
        </div>
        <h2 class="text-xl font-bold mb-2">Delete Application</h2>
        <p class="text-gray-700 mb-6">Are you sure you want to delete this application? This cannot be undone.</p>
        <div class="flex justify-center gap-4">
          <button id="confirmDeleteApplicationBtn" class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-medium text-base">Delete</button>
          <button id="cancelDeleteApplicationBtn" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-base">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.style.display = '';
  document.getElementById('confirmDeleteApplicationBtn').onclick = function() {
    modal.style.display = 'none';
    onConfirm();
  };
  document.getElementById('cancelDeleteApplicationBtn').onclick = function() {
    modal.style.display = 'none';
  };
}

// Add restore and permanent delete logic
async function restoreApplication(appId) {
  try {
    await FirebaseService.updateApplicationStatus(appId, 'new');
    await firebase.firestore().collection('applications').doc(appId).update({ trashed: firebase.firestore.FieldValue.delete(), trashedAt: firebase.firestore.FieldValue.delete() });
    showToast('Application restored.');
    loadApplications(true);
    loadApplications(false);
  } catch (error) {
    showToast('Failed to restore: ' + error.message);
  }
}
async function permanentDeleteApplication(appId) {
  if (!confirm('Permanently delete this application? This cannot be undone.')) return;
  try {
    await FirebaseService.permanentDeleteApplication(appId);
    showToast('Application permanently deleted.');
    loadApplications(true);
  } catch (error) {
    showToast('Failed to delete: ' + error.message);
  }
}

// Utility to show/hide the loading overlay with a custom message
function showLoadingOverlay(show, message) {
  const overlay = document.getElementById('loadingOverlay');
  if (!overlay) return;
  if (show) {
    overlay.classList.remove('hidden');
    if (message) {
      const msgEls = overlay.querySelectorAll('p');
      if (msgEls && msgEls.length > 0) msgEls[0].textContent = message;
    }
  } else {
    overlay.classList.add('hidden');
  }
}

// ===== UTILITY FUNCTIONS =====

// Copy phone number logic for applicants
function setupCopyPhoneNumbers() {
  try {
    document.querySelectorAll('.copy-phone').forEach(el => {
      el.addEventListener('click', function(e) {
        const phone = el.getAttribute('data-phone');
        if (phone) {
          navigator.clipboard.writeText(phone);
          showToast('Phone number copied to clipboard!');
        }
        e.stopPropagation();
      });
    });
  } catch (error) {
    console.error('Error setting up copy phone numbers:', error);
  }
}

// Dynamic Requirements Field Logic
function updateRemoveReqBtns() {
  try {
    document.querySelectorAll('.remove-req-btn').forEach(btn => {
      btn.onclick = function() {
        const item = btn.closest('.requirement-item');
        if (item && document.querySelectorAll('.requirement-item').length > 1) {
          item.remove();
        }
      };
    });
  } catch (error) {
    console.error('Error updating remove requirement buttons:', error);
  }
}

// Pagination state for applications
function setupApplicationsPagination(currentPage, totalPages, totalApplications) {
  const paginationControls = document.getElementById('applicationsPaginationControls');
  const pageNumbers = document.getElementById('applicationsPageNumbers');
  const prevBtn = document.getElementById('applicationsPrevPageBtn');
  const nextBtn = document.getElementById('applicationsNextPageBtn');

  if (totalApplications > applicationsPerPage) {
    paginationControls.classList.remove('hidden');
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
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
      pageBtn.onclick = () => goToApplicationsPage(i);
      pageNumbers.appendChild(pageBtn);
    }
    prevBtn.onclick = () => goToApplicationsPage(currentPage - 1);
    nextBtn.onclick = () => goToApplicationsPage(currentPage + 1);
  } else {
    paginationControls.classList.add('hidden');
  }
}

function goToApplicationsPage(page) {
  applicationsCurrentPage = page;
  loadApplications();
}

// ===== DATA EXPORT FUNCTIONS =====

function exportJobsCSV() {
  if (!Array.isArray(jobs) || jobs.length === 0) {
    showToast('No jobs to export.');
    return;
  }
  const headers = ['Title', 'Location', 'Type', 'Department', 'Description', 'Requirements', 'Benefits', 'Status', 'Applications'];
  const rows = jobs.map(job => [
    safe(job.title),
    safe(job.location),
    safe(job.type),
    safe(job.department || ''),
    safe(job.description),
    Array.isArray(job.requirements) ? job.requirements.map(safe).join('; ') : '',
    safe(job.benefits || ''),
    safe(job.status),
    job.applications || 0
  ]);
  downloadCSV([headers, ...rows], 'jobs.csv');
}

function exportApplicationsCSV() {
  if (!Array.isArray(applications) || applications.length === 0) {
    showToast('No applications to export.');
    return;
  }
  const headers = ['Full Name', 'Email', 'Phone', 'Position', 'Status', 'Applied At'];
  const rows = applications.map(app => [
    safe(app.fullName),
    safe(app.email),
    safe(app.phone || ''),
    safe(app.position),
    safe(app.status),
    app.appliedAt && typeof app.appliedAt.toDate === 'function'
      ? formatDate(app.appliedAt.toDate())
      : (app.appliedAt ? formatDate(new Date(app.appliedAt)) : '')
  ]);
  downloadCSV([headers, ...rows], 'applications.csv');
}

function exportSelectedApplicationsCSV() {
  const checked = Array.from(document.querySelectorAll('.bulk-app-checkbox:checked'));
  if (checked.length === 0) {
    showToast('No applications selected.');
    return;
  }
  const selectedIds = checked.map(cb => cb.getAttribute('data-app-id'));
  const selectedApps = applications.filter(app => selectedIds.includes(app.id));
  if (selectedApps.length === 0) {
    showToast('No applications found for selected IDs.');
    return;
  }
  const headers = ['Full Name', 'Email', 'Phone', 'Position', 'Status', 'Applied At'];
  const rows = selectedApps.map(app => [
    safe(app.fullName),
    safe(app.email),
    safe(app.phone || ''),
    safe(app.position),
    safe(app.status),
    app.appliedAt && typeof app.appliedAt.toDate === 'function'
      ? formatDate(app.appliedAt.toDate())
      : (app.appliedAt ? formatDate(new Date(app.appliedAt)) : '')
  ]);
  downloadCSV([headers, ...rows], 'selected-applications.csv');
}

function downloadCSV(rows, filename) {
  const csvContent = rows.map(row => row.map(cell => '"' + (cell || '').replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// ===== PDF EXPORT FUNCTIONS =====

function truncate(str, n) {
  return (str && str.length > n) ? str.slice(0, n - 1) + '…' : str;
}

function exportJobsPDF() {
  if (!Array.isArray(jobs) || jobs.length === 0) {
    showToast('No jobs to export.');
    return;
  }
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast('PDF export requires jsPDF and autoTable.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  if (typeof doc.autoTable !== 'function') {
    showToast('PDF export requires jsPDF autoTable plugin.');
    return;
  }
  doc.autoTable({
    head: [[
      'Title', 'Location', 'Type', 'Department', 'Description', 'Requirements', 'Benefits', 'Status', 'Applications'
    ]],
    body: jobs.map(job => [
      truncate(safe(job.title), 32),
      truncate(safe(job.location), 32),
      truncate(safe(job.type), 18),
      truncate(safe(job.department || ''), 18),
      truncate(safe(job.description), 60),
      truncate(Array.isArray(job.requirements) ? job.requirements.map(safe).join('; ') : '', 40),
      truncate(safe(job.benefits || ''), 40),
      truncate(safe(job.status), 12),
      job.applications || 0
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 2,
      overflow: 'linebreak',
      valign: 'top',
      minCellHeight: 8
    },
    columnStyles: {
      0: { cellWidth: 28 }, // Title
      1: { cellWidth: 28 }, // Location
      2: { cellWidth: 18 }, // Type
      3: { cellWidth: 18 }, // Department
      4: { cellWidth: 40 }, // Description
      5: { cellWidth: 32 }, // Requirements
      6: { cellWidth: 32 }, // Benefits
      7: { cellWidth: 14 }, // Status
      8: { cellWidth: 16 }  // Applications
    },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 10 },
    bodyStyles: { textColor: 50 }
  });
  doc.save('jobs.pdf');
}

function exportApplicationsPDF() {
  if (!Array.isArray(applications) || applications.length === 0) {
    showToast('No applications to export.');
    return;
  }
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast('PDF export requires jsPDF and autoTable.');
    return;
  }
  const { jsPDF } = window.jspdf;
  // Use landscape orientation and A4 size for more width
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  if (typeof doc.autoTable !== 'function') {
    showToast('PDF export requires jsPDF autoTable plugin.');
    return;
  }
  // Set 1 inch (25.4mm) margins
  const marginInch = 25.4;
  const pageWidth = doc.internal.pageSize.getWidth();
  const tableWidth = pageWidth - 2 * marginInch;
  // Proportional column widths (sum to 1)
  const colProps = [0.18, 0.23, 0.13, 0.18, 0.10, 0.18];
  const colWidths = colProps.map(p => p * tableWidth);
  doc.autoTable({
    head: [[
      'Full Name', 'Email', 'Phone', 'Position', 'Status', 'Applied At'
    ]],
    body: applications.map(app => [
      truncate(safe(app.fullName), 20),
      truncate(safe(app.email), 28),
      truncate(safe(app.phone || ''), 15),
      truncate(safe(app.position), 18),
      truncate(safe(app.status), 10),
      app.appliedAt && typeof app.appliedAt.toDate === 'function'
        ? formatDate(app.appliedAt.toDate())
        : (app.appliedAt ? formatDate(new Date(app.appliedAt)) : '')
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 1.5,
      overflow: 'linebreak',
      valign: 'top',
      minCellHeight: 6
    },
    columnStyles: {
      0: { cellWidth: colWidths[0] }, // Full Name
      1: { cellWidth: colWidths[1] }, // Email
      2: { cellWidth: colWidths[2] }, // Phone
      3: { cellWidth: colWidths[3] }, // Position
      4: { cellWidth: colWidths[4] }, // Status
      5: { cellWidth: colWidths[5] }  // Applied At
    },
    margin: { left: marginInch, right: marginInch, top: 20 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 9 },
    bodyStyles: { textColor: 50 }
  });
  doc.save('applications.pdf');
}

function exportSelectedApplicationsPDF() {
  const checked = Array.from(document.querySelectorAll('.bulk-app-checkbox:checked'));
  if (checked.length === 0) {
    showToast('No applications selected.');
    return;
  }
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast('PDF export requires jsPDF and autoTable.');
    return;
  }
  const selectedIds = checked.map(cb => cb.getAttribute('data-app-id'));
  const selectedApps = applications.filter(app => selectedIds.includes(app.id));
  if (selectedApps.length === 0) {
    showToast('No applications found for selected IDs.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  if (typeof doc.autoTable !== 'function') {
    showToast('PDF export requires jsPDF autoTable plugin.');
    return;
  }
  const marginInch = 25.4;
  const pageWidth = doc.internal.pageSize.getWidth();
  const tableWidth = pageWidth - 2 * marginInch;
  const colProps = [0.18, 0.23, 0.13, 0.18, 0.10, 0.18];
  const colWidths = colProps.map(p => p * tableWidth);
  doc.autoTable({
    head: [[
      'Full Name', 'Email', 'Phone', 'Position', 'Status', 'Applied At'
    ]],
    body: selectedApps.map(app => [
      truncate(safe(app.fullName), 20),
      truncate(safe(app.email), 28),
      truncate(safe(app.phone || ''), 15),
      truncate(safe(app.position), 18),
      truncate(safe(app.status), 10),
      app.appliedAt && typeof app.appliedAt.toDate === 'function'
        ? formatDate(app.appliedAt.toDate())
        : (app.appliedAt ? formatDate(new Date(app.appliedAt)) : '')
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 1.5,
      overflow: 'linebreak',
      valign: 'top',
      minCellHeight: 6
    },
    columnStyles: {
      0: { cellWidth: colWidths[0] },
      1: { cellWidth: colWidths[1] },
      2: { cellWidth: colWidths[2] },
      3: { cellWidth: colWidths[3] },
      4: { cellWidth: colWidths[4] },
      5: { cellWidth: colWidths[5] }
    },
    margin: { left: marginInch, right: marginInch, top: 20 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 9 },
    bodyStyles: { textColor: 50 }
  });
  doc.save('selected-applications.pdf');
}

function formatDate(date) {
  // Format as YYYY-MM-DD HH:mm
  const pad = n => n < 10 ? '0' + n : n;
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
}

// ===== SECURITY ENHANCEMENTS =====

// Simple XSS sanitizer
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>'"`=\/"]/g, function (s) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
      '`': '&#96;',
      '=': '&#61;',
      '/': '&#47;'
    })[s];
  });
}

// Validate email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate phone number (simple PH format)
function isValidPhone(phone) {
  return /^\+?\d{10,15}$/.test(phone.replace(/\s+/g, ''));
}

// Validate required string
function isNonEmptyString(str) {
  return typeof str === 'string' && str.trim().length > 0;
}

// Validate job form
function validateJobForm(jobData) {
  if (!isNonEmptyString(jobData.title)) return 'Job title is required.';
  if (!isNonEmptyString(jobData.location)) return 'Location is required.';
  if (!isNonEmptyString(jobData.type)) return 'Employment type is required.';
  if (!isNonEmptyString(jobData.description)) return 'Job description is required.';
  return '';
}

// Validate login form
function validateLoginForm(email, password) {
  if (!isValidEmail(email)) return 'Please enter a valid email address.';
  if (!isNonEmptyString(password)) return 'Password is required.';
  return '';
}

// Validate reset form
function validateResetForm(email) {
  if (!isValidEmail(email)) return 'Please enter a valid email address.';
  return '';
}

// Sanitize all user-provided data before rendering
function safe(str) {
  return sanitize(str);
}

// Custom password reset functionality
async function sendCustomPasswordReset(email) {
  try {
    // First, check if the user exists
    const methods = await firebase.auth().fetchSignInMethodsForEmail(email);
    
    if (methods.length === 0) {
      // User doesn't exist, but we don't want to reveal this
      return { success: true, message: 'If an account with that email exists, a password reset link has been sent. Please check your inbox.' };
    }

    // Generate a custom reset token with our custom reset page
    const actionCodeSettings = {
      url: window.location.origin + '/reset-password.html',
      handleCodeInApp: true
    };

    await firebase.auth().sendPasswordResetEmail(email, actionCodeSettings);
    
    return { 
      success: true, 
      message: 'Password reset link has been sent to your email. Please check your inbox and spam folder.' 
    };
  } catch (error) {
    console.error('Password reset error:', error);
    // Don't reveal if user exists or not for security
    return { 
      success: true, 
      message: 'If an account with that email exists, a password reset link has been sent. Please check your inbox.' 
    };
  }
}

// ===== EVENT LISTENERS =====

// Patch tab switching to always hide bulk action bars and deselect all checkboxes
function hideBulkBarsAndDeselect() {
  const jobBar = document.getElementById('bulkJobActionBar');
  if (jobBar) jobBar.style.display = 'none';
  const appBar = document.getElementById('bulkActionBar');
  if (appBar) appBar.style.display = 'none';
  document.querySelectorAll('.bulk-job-checkbox').forEach(cb => { cb.checked = false; });
  if (typeof deselectAllApplications === 'function') deselectAllApplications();
}
document.addEventListener('DOMContentLoaded', function() {
  // Patch all tab buttons to hide bulk bars on click
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', hideBulkBarsAndDeselect);
  });
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Initialize dashboard
    initializeDashboard();
    
    // Listen for auth state changes
    auth.onAuthStateChanged(user => {
      updateUI(user);
    });

    // Handle login form submit
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const errorEl = document.getElementById('loginError');
      const errorMsg = document.getElementById('loginErrorMsg');
      const loginBtn = document.getElementById('loginBtn');
      const loginBtnText = document.getElementById('loginBtnText');
      const loginSpinner = document.getElementById('loginSpinner');
      errorMsg.textContent = '';
      errorEl.classList.add('hidden');
      loginBtn.disabled = true;
      loginSpinner.classList.remove('hidden');
      loginBtnText.textContent = 'Logging in...';
      try {
        await auth.signInWithEmailAndPassword(email, password);
        // Success: UI will update automatically
        showToast('Login successful!');
      } catch (error) {
        errorMsg.textContent = getFriendlyAuthError(error);
        errorEl.classList.remove('hidden');
      } finally {
        loginBtn.disabled = false;
        loginSpinner.classList.add('hidden');
        loginBtnText.textContent = 'Login';
      }
    });

    // Logout button logic with custom modal and loading
    document.getElementById('logoutBtn').addEventListener('click', function() {
      const modal = document.getElementById('logoutModal');
      const modalContent = document.getElementById('logoutModalContent');
      const loading = document.getElementById('logoutLoading');
      modal.classList.remove('hidden');
      modalContent.style.display = '';
      loading.classList.add('hidden');
    });
    
    document.getElementById('cancelLogoutBtn').addEventListener('click', function() {
      document.getElementById('logoutModal').classList.add('hidden');
    });
    
    document.getElementById('confirmLogoutBtn').addEventListener('click', function() {
      const modalContent = document.getElementById('logoutModalContent');
      const loading = document.getElementById('logoutLoading');
      modalContent.style.display = 'none';
      loading.classList.remove('hidden');
      setTimeout(() => {
        firebase.auth().signOut();
        document.getElementById('logoutModal').classList.add('hidden');
        showToast('Logged out successfully.');
      }, 1500);
    });

    // User card dropdown functionality
    const userCardBtn = document.getElementById('userCardBtn');
    const userDropdown = document.getElementById('userDropdown');
    const userCardIcon = document.getElementById('userCardIcon');
    
    if (userCardBtn && userDropdown) {
      userCardBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('hidden');
        userCardIcon.classList.toggle('rotate-180');
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', function(e) {
        if (!userCardBtn.contains(e.target) && !userDropdown.contains(e.target)) {
          userDropdown.classList.add('hidden');
          userCardIcon.classList.remove('rotate-180');
        }
      });
    }

    // Forgot Password link logic
    document.getElementById('forgotPasswordLink').addEventListener('click', function(e) {
      e.preventDefault();
      document.getElementById('passwordResetModal').classList.remove('hidden');
      document.getElementById('resetEmailInput').focus();
    });
    
    // Password Reset Modal functionality
    document.getElementById('cancelResetBtn').addEventListener('click', function() {
      document.getElementById('passwordResetModal').classList.add('hidden');
      document.getElementById('passwordResetForm').reset();
      document.getElementById('resetMessage').classList.add('hidden');
    });
    
    // Close modal when clicking outside
    document.getElementById('passwordResetModal').addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.add('hidden');
        document.getElementById('passwordResetForm').reset();
        document.getElementById('resetMessage').classList.add('hidden');
      }
    });
    
    // Password Reset Form Submit
    document.getElementById('passwordResetForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('resetEmailInput').value.trim();
      const sendResetBtn = document.getElementById('sendResetBtn');
      const sendResetBtnText = document.getElementById('sendResetBtnText');
      const sendResetSpinner = document.getElementById('sendResetSpinner');
      const resetMessage = document.getElementById('resetMessage');
      const resetMessageText = document.getElementById('resetMessageText');
      
      if (!email) {
        resetMessageText.textContent = 'Please enter a valid email address.';
        resetMessage.className = 'mt-4 p-3 rounded-lg bg-red-50 border border-red-200';
        resetMessage.classList.remove('hidden');
        return;
      }
      
      // Show loading state
      sendResetBtn.disabled = true;
      sendResetBtnText.classList.add('hidden');
      sendResetSpinner.classList.remove('hidden');
      resetMessage.classList.add('hidden');
      
      try {
        const result = await sendCustomPasswordReset(email);
        
        // Show success message
        resetMessageText.textContent = result.message;
        resetMessage.className = 'mt-4 p-3 rounded-lg bg-green-50 border border-green-200';
        resetMessage.classList.remove('hidden');
        
        // Clear form
        document.getElementById('resetEmailInput').value = '';
        
        // Auto-close modal after 3 seconds
        setTimeout(() => {
          document.getElementById('passwordResetModal').classList.add('hidden');
          resetMessage.classList.add('hidden');
        }, 3000);
        
      } catch (error) {
        console.error('Password reset error:', error);
        
        // Show error message
        resetMessageText.textContent = 'If an account with that email exists, a password reset link has been sent. Please check your inbox.';
        resetMessage.className = 'mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200';
        resetMessage.classList.remove('hidden');
        
      } finally {
        // Reset button state
        sendResetBtn.disabled = false;
        sendResetBtnText.classList.remove('hidden');
        sendResetSpinner.classList.add('hidden');
      }
    });

    // Handle new job form submission
    document.getElementById('newJobForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Collect requirements as array
      const reqInputs = document.querySelectorAll('#requirementsList input');
      const requirements = Array.from(reqInputs).map(input => input.value.trim()).filter(Boolean);
      const jobData = {
        title: document.getElementById('jobTitle').value,
        location: document.getElementById('jobLocation').value,
        type: document.getElementById('jobType').value,
        department: document.getElementById('jobDepartment').value,
        description: document.getElementById('jobDescription').value,
        requirements: requirements,
        benefits: document.getElementById('jobBenefits').value
      };

      // Show loading state
      const submitButton = this.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Posting Job...';
      submitButton.disabled = true;

      // Show loading overlay
      const loadingOverlay = document.getElementById('loadingOverlay');
      loadingOverlay.classList.remove('hidden');

      try {
        await FirebaseService.addJob(jobData);
        
        // Reset form
        this.reset();
        
        // Show confirmation loading
        submitButton.innerHTML = '<i class="fas fa-check mr-2"></i>Job Posted Successfully!';
        submitButton.className = submitButton.className.replace('bg-orange-500', 'bg-green-600');
        
        // Set flag for toast after reload
        localStorage.setItem('jobPostedSuccess', '1');
        
        // Switch to jobs tab and refresh after confirmation
        setTimeout(() => {
          showTab('jobs');
          window.location.reload();
        }, 1500);
      } catch (error) {
        console.error('Error posting job:', error);
        
        // Hide loading overlay
        loadingOverlay.classList.add('hidden');
        
        alert('Error posting job. Please try again.');
      } finally {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
      }
    });

    // Close sidebar when clicking the overlay (mobile only)
    document.getElementById('sidebarOverlay').addEventListener('click', function() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebarOverlay');
      sidebar.classList.remove('open');
      overlay.classList.add('hidden');
    });

    // Delete job modal event listeners
    document.getElementById('cancelDeleteJobBtn').addEventListener('click', function() {
      document.getElementById('deleteJobModal').classList.add('hidden');
      jobToDeleteId = null;
    });
    
    document.getElementById('confirmDeleteJobBtn').addEventListener('click', async function() {
      const modalContent = document.getElementById('deleteJobModalContent');
      const loading = document.getElementById('deleteJobLoading');
      modalContent.style.display = 'none';
      loading.classList.remove('hidden');
      try {
        await FirebaseService.deleteJob(jobToDeleteId);
        document.getElementById('deleteJobModal').classList.add('hidden');
        showToast('Job deleted successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        document.getElementById('deleteJobModal').classList.add('hidden');
        showToast('Error deleting job. Please try again.');
      }
      jobToDeleteId = null;
    });

    // Status filter change
    document.getElementById('statusFilter').addEventListener('change', loadApplications);
    
    // Position filter change
    document.getElementById('positionFilter').addEventListener('change', loadApplications);

    // Search functionality with debouncing
    const applicationSearch = document.getElementById('applicationSearch');
    if (applicationSearch) {
      applicationSearch.addEventListener('input', searchApplications);
    }
    
    const jobSearch = document.getElementById('jobSearch');
    if (jobSearch) {
      jobSearch.addEventListener('input', searchJobs);
    }

    // Close modal when clicking outside
    document.getElementById('applicationModal').addEventListener('click', function(e) {
      if (e.target === this) {
        closeApplicationModal();
      }
    });

    // Add requirement button
    document.getElementById('addRequirementBtn').onclick = function() {
      const list = document.getElementById('requirementsList');
      const div = document.createElement('div');
      div.className = 'flex mb-2 requirement-item';
      div.innerHTML = `<input type="text" class="form-input w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base" placeholder="Enter a requirement" />
        <button type="button" class="remove-req-btn ml-2 text-red-500 hover:text-red-700" title="Remove"><i class="fas fa-minus-circle"></i></button>`;
      list.appendChild(div);
      updateRemoveReqBtns();
    };
    
    // Initialize remove requirement buttons
    updateRemoveReqBtns();
    
    // Initialize lazy loading
    lazyLoadImages();
    
  } catch (error) {
    console.error('Error initializing admin dashboard:', error);
    showToast('Error initializing dashboard. Please refresh the page.');
  }
}); 