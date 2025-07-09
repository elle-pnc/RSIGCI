// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBaqIT1KImDn5p5-rAtmB9kA0B8kR5MJSk",
  authDomain: "rsigci-ojt.firebaseapp.com",
  projectId: "rsigci-ojt",
  storageBucket: "rsigci-ojt.firebasestorage.app",
  messagingSenderId: "1003521606559",
  appId: "1:1003521606559:web:3c9ca8f8b9d93e41f5f3aa",
  measurementId: "G-M50X8E3P7N"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Initialize Storage
const storage = firebase.storage();

// Firebase Data Service
class FirebaseService {
  
  // Jobs Collection
  static async getJobs() {
    try {
      const snapshot = await db.collection('jobs').orderBy('postedAt', 'desc').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting jobs:', error);
      return [];
    }
  }

  static async addJob(jobData) {
    try {
      const docRef = await db.collection('jobs').add({
        ...jobData,
        postedAt: firebase.firestore.FieldValue.serverTimestamp(),
        applications: 0,
        status: 'active'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding job:', error);
      throw error;
    }
  }

  static async updateJob(jobId, jobData) {
    try {
      await db.collection('jobs').doc(jobId).update({
        ...jobData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  static async deleteJob(jobId) {
    try {
      await db.collection('jobs').doc(jobId).delete();
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  // Applications Collection
  static async getApplications() {
    try {
      const snapshot = await db.collection('applications').orderBy('appliedAt', 'desc').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting applications:', error);
      return [];
    }
  }

  static async addApplication(applicationData, onProgress = null) {
    try {
      console.log('Adding application with data:', applicationData);
      
      // Extract file for upload (don't save File object to Firestore)
      const fileToUpload = applicationData.file;
      
      // Remove file from data before saving to Firestore
      const { file, ...applicationDataForFirestore } = applicationData;
      
      console.log('Data for Firestore:', applicationDataForFirestore);
      
      // Prepare application data for Firestore
      const applicationToSave = {
        ...applicationDataForFirestore,
        appliedAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'new'
      };
      
      // If there's a file to upload, try to upload it
      if (fileToUpload) {
        console.log('File found, attempting upload...');
        
        try {
          // Try to upload the file with retry logic
          const downloadURL = await this.uploadFile(fileToUpload, Date.now().toString(), onProgress);
          console.log('File uploaded successfully, URL:', downloadURL);
          
          // Add file info to application data
          applicationToSave.resumeURL = downloadURL;
          applicationToSave.resumeFileName = fileToUpload.name;
          
        } catch (uploadError) {
          console.error('File upload failed, saving application without file:', uploadError);
          
          // Add error info to application data
          applicationToSave.resumeUploadError = uploadError.message;
          applicationToSave.resumeFileName = fileToUpload.name;
          applicationToSave.resumeUploadAttempted = true;
        }
      }
      
      // Save application to Firestore
      const docRef = await db.collection('applications').add(applicationToSave);
      console.log('Application saved with ID:', docRef.id);
      
      // Update job application count
      if (applicationData.position) {
        try {
          const jobsSnapshot = await db.collection('jobs')
            .where('title', '==', applicationData.position)
            .get();
          
          if (!jobsSnapshot.empty) {
            const jobDoc = jobsSnapshot.docs[0];
            await jobDoc.ref.update({
              applications: firebase.firestore.FieldValue.increment(1)
            });
          }
        } catch (error) {
          console.error('Error updating job application count:', error);
          // Don't fail the entire submission for this
        }
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding application:', error);
      throw error;
    }
  }

  static async updateApplicationStatus(applicationId, status) {
    try {
      await db.collection('applications').doc(applicationId).update({
        status: status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  static async deleteApplication(applicationId) {
    try {
      await db.collection('applications').doc(applicationId).update({
        trashed: true,
        trashedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error trashing application:', error);
      throw error;
    }
  }

  static async permanentDeleteApplication(applicationId) {
    try {
      await db.collection('applications').doc(applicationId).delete();
    } catch (error) {
      console.error('Error permanently deleting application:', error);
      throw error;
    }
  }

  // Real-time listeners
  static onJobsSnapshot(callback) {
    return db.collection('jobs')
      .orderBy('postedAt', 'desc')
      .onSnapshot(snapshot => {
        const jobs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(jobs);
      });
  }

  static onApplicationsSnapshot(callback) {
    return db.collection('applications')
      .orderBy('appliedAt', 'desc')
      .onSnapshot(snapshot => {
        const applications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(applications);
      });
  }

  // Migration helper - move data from localStorage to Firebase
  static async migrateFromLocalStorage() {
    try {
      // Migrate jobs
      const localJobs = JSON.parse(localStorage.getItem('jobs')) || [];
      for (const job of localJobs) {
        if (!job.id) continue; // Skip if already migrated
        await this.addJob({
          title: job.title,
          location: job.location,
          type: job.type,
          department: job.department,
          description: job.description,
          requirements: job.requirements,
          benefits: job.benefits,
          applications: job.applications || 0,
          status: job.status || 'active'
        });
      }

      // Migrate applications
      const localApplications = JSON.parse(localStorage.getItem('applications')) || [];
      for (const app of localApplications) {
        if (!app.id) continue; // Skip if already migrated
        await this.addApplication({
          fullName: app.fullName,
          email: app.email,
          phone: app.phone,
          position: app.position,
          coverLetter: app.coverLetter,
          resume: app.resume,
          status: app.status || 'new'
        });
      }

      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }

  // File Storage Methods with Progress Tracking and Retry Logic
  static async uploadFile(file, applicationId, onProgress = null) {
    try {
      console.log('Starting file upload for application:', applicationId);
      console.log('File details:', { name: file.name, size: file.size, type: file.type });
      
      // Check file size (limit to 5MB for faster uploads)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size too large. Please upload a file smaller than 5MB for faster processing.');
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}_${randomId}_${file.name}`;
      console.log('Generated filename:', fileName);
      
      const storageRef = storage.ref(`resumes/${fileName}`);
      console.log('Storage reference created');
      
      // Upload with metadata for better handling
      const metadata = {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          applicationId: applicationId
        }
      };
      
      console.log('Uploading with metadata:', metadata);
      
      // Retry logic for upload
      const maxRetries = 3;
      let lastError = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Upload attempt ${attempt}/${maxRetries}`);
          
          // Add timeout for faster failure detection (increased for reliability)
          const uploadTask = storageRef.put(file, metadata);
          
          // Track upload progress if callback provided
          if (onProgress) {
            uploadTask.on('state_changed', 
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
              },
              (error) => {
                console.error(`Upload error on attempt ${attempt}:`, error);
                lastError = error;
              },
              () => {
                onProgress(100); // Complete
              }
            );
          }
          
          // Set a longer timeout for reliability (60 seconds)
          const uploadPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error(`Upload timeout on attempt ${attempt}. Please check your connection.`));
            }, 60000); // 60 seconds timeout
            
            uploadTask.then((snapshot) => {
              clearTimeout(timeout);
              resolve(snapshot);
            }).catch((error) => {
              clearTimeout(timeout);
              reject(error);
            });
          });
          
          const snapshot = await uploadPromise;
          console.log('File uploaded successfully, getting download URL...');
          
          const downloadURL = await snapshot.ref.getDownloadURL();
          console.log('Download URL obtained:', downloadURL);
          
          return downloadURL;
          
        } catch (error) {
          console.error(`Upload attempt ${attempt} failed:`, error);
          lastError = error;
          
          // If this is the last attempt, throw the error
          if (attempt === maxRetries) {
            throw error;
          }
          
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          console.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
      
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Provide more specific error messages
      if (error.code === 'storage/unauthorized') {
        throw new Error('Upload failed: Unauthorized access to storage. Please check Firebase configuration.');
      } else if (error.code === 'storage/quota-exceeded') {
        throw new Error('Upload failed: Storage quota exceeded. Please contact administrator.');
      } else if (error.code === 'storage/retry-limit-exceeded') {
        throw new Error('Upload failed: Network issues. Please check your internet connection and try again.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Upload timeout. Please check your internet connection and try again. If the problem persists, try uploading a smaller file.');
      } else if (error.code === 'storage/object-not-found') {
        throw new Error('Upload failed: Storage configuration issue. Please contact administrator.');
      } else {
        throw new Error(`Upload failed: ${error.message}. Please try again or contact support.`);
      }
    }
  }

  // Diagnostic function to test Firebase Storage
  static async testStorageConnection() {
    try {
      console.log('Testing Firebase Storage connection...');
      
      // Try to upload a small test file
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
      
      const timestamp = Date.now();
      const testFileName = `test_${timestamp}.txt`;
      const storageRef = storage.ref(`test/${testFileName}`);
      
      console.log('Attempting test upload...');
      const snapshot = await storageRef.put(testFile);
      console.log('Test upload successful');
      
      const downloadURL = await snapshot.ref.getDownloadURL();
      console.log('Test download URL obtained:', downloadURL);
      
      // Clean up test file
      await snapshot.ref.delete();
      console.log('Test file cleaned up');
      
      return {
        success: true,
        message: 'Firebase Storage is working correctly'
      };
    } catch (error) {
      console.error('Firebase Storage test failed:', error);
      return {
        success: false,
        error: error.message,
        code: error.code,
        message: 'Firebase Storage test failed'
      };
    }
  }

  static async getFileDownloadURL(filePath) {
    try {
      const storageRef = storage.ref(filePath);
      return await storageRef.getDownloadURL();
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  }

  static async deleteFile(filePath) {
    try {
      const storageRef = storage.ref(filePath);
      await storageRef.delete();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}

// Export for use in other files
window.FirebaseService = FirebaseService; 