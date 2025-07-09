# 🔥 Firebase Setup Guide for RSIGCI Careers

## 📋 **Prerequisites**
- Google account
- Basic understanding of web development

## 🚀 **Step-by-Step Setup**

### **1. Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `RSIGCI-Careers`
4. Enable Google Analytics (optional)
5. Click "Create project"

### **2. Set Up Firestore Database**
1. In Firebase Console → Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)
5. Click "Done"

### **3. Get Firebase Configuration**
1. In Firebase Console → Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app
4. Register app with name: `RSIGCI Web`
5. Copy the config object

### **4. Update Firebase Config**
Replace the config in `firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### **5. Set Up Security Rules**
In Firestore → Rules tab, use these rules for development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // For development only
    }
  }
}
```

**⚠️ Important:** These rules allow full access. For production, implement proper authentication and security rules.

### **6. Test the Integration**
1. Open `index.html` in your browser
2. Go to admin dashboard (`admin.html`)
3. Post a new job
4. Submit an application from the main site
5. Check if it appears in the admin dashboard

## 🔧 **Features Now Available**

### **Real-time Updates**
- Jobs posted in admin appear instantly on main site
- Applications submitted on main site appear instantly in admin
- No page refresh needed

### **Data Persistence**
- All data stored in Firebase Firestore
- Survives browser restarts and server changes
- Scalable and reliable

### **Error Handling**
- Loading states with spinners
- Error messages for failed operations
- Graceful fallbacks

## 📊 **Database Structure**

### **Jobs Collection**
```javascript
{
  id: "auto-generated",
  title: "Job Title",
  location: "Location",
  type: "Full-time",
  department: "Department",
  description: "Job description",
  requirements: "Requirements",
  benefits: "Benefits",
  status: "active",
  applications: 0,
  postedAt: "timestamp"
}
```

### **Applications Collection**
```javascript
{
  id: "auto-generated",
  fullName: "Applicant Name",
  email: "email@example.com",
  phone: "+63 912 345 6789",
  position: "Job Title",
  coverLetter: "Cover letter text",
  resume: "resume.pdf",
  status: "new",
  appliedAt: "timestamp"
}
```

## 🚀 **Deployment Options**

### **Option 1: Firebase Hosting (Recommended)**
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy: `firebase deploy`

### **Option 2: GitHub Pages**
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Access via `https://username.github.io/repository-name`

### **Option 3: Netlify/Vercel**
1. Connect your GitHub repository
2. Deploy automatically on push

## 🔒 **Production Security**

Before going live, implement proper security:

1. **Authentication**: Add user login for admin access
2. **Security Rules**: Restrict read/write access
3. **Rate Limiting**: Prevent spam applications
4. **Data Validation**: Validate all inputs
5. **HTTPS**: Ensure secure connections

## 🛠 **Troubleshooting**

### **Common Issues**

1. **"Firebase not initialized"**
   - Check if Firebase SDK is loaded
   - Verify config is correct

2. **"Permission denied"**
   - Check Firestore security rules
   - Ensure database is created

3. **"Network error"**
   - Check internet connection
   - Verify Firebase project is active

### **Debug Mode**
Add this to see detailed logs:
```javascript
// In firebase-config.js
firebase.firestore().settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});
```

## 📈 **Next Steps**

1. **Add Authentication**: Secure admin access
2. **File Upload**: Store resumes in Firebase Storage
3. **Email Notifications**: Notify admins of new applications
4. **Analytics**: Track application metrics
5. **Mobile App**: Create React Native app

## 🆘 **Support**

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

**🎉 Congratulations!** Your careers site is now powered by Firebase with real-time updates and scalable infrastructure. 