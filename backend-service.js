// Backend Service for communicating with our Node.js server
class BackendService {
  static BACKEND_URL = 'https://rsigci-job-applications.onrender.com/api';

  // Jobs Collection
  static async getJobs() {
    try {
      const response = await fetch(`${this.BACKEND_URL}/jobs`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting jobs:', error);
      return [];
    }
  }

  static async addJob(jobData) {
    try {
      const response = await fetch(`${this.BACKEND_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add job');
      }
      
      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error('Error adding job:', error);
      throw error;
    }
  }

  static async updateJob(jobId, jobData) {
    try {
      const response = await fetch(`${this.BACKEND_URL}/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update job');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  static async deleteJob(jobId) {
    try {
      const response = await fetch(`${this.BACKEND_URL}/jobs/${jobId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  // Applications Collection
  static async getApplications() {
    try {
      const response = await fetch(`${this.BACKEND_URL}/applications`);
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting applications:', error);
      return [];
    }
  }

  static async addApplication(applicationData) {
    try {
      console.log('Adding application with data:', applicationData);
      
      // Create FormData for the application
      const formData = new FormData();
      
      // Add application data
      formData.append('fullName', applicationData.fullName);
      formData.append('email', applicationData.email);
      formData.append('phone', applicationData.phone);
      formData.append('position', applicationData.position);
      formData.append('coverLetter', applicationData.coverLetter);
      
      // Add file if it exists
      if (applicationData.resume) {
        formData.append('resume', applicationData.resume);
      }
      
      const response = await fetch(`${this.BACKEND_URL}/applications`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }
      
      const result = await response.json();
      console.log('Application submitted successfully:', result);
      return result.id;
    } catch (error) {
      console.error('Error adding application:', error);
      throw error;
    }
  }

  static async updateApplicationStatus(applicationId, status) {
    try {
      const response = await fetch(`${this.BACKEND_URL}/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  static async deleteApplication(applicationId) {
    try {
      const response = await fetch(`${this.BACKEND_URL}/applications/${applicationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete application');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  }
}

// Make the service available globally
window.BackendService = BackendService; 