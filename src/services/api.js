// API Configuration (production & proxy friendly)
// If using Vercel rewrites (vercel.json) or CRA dev proxy, you can hit relative paths.
// Set REACT_APP_USE_VERCEL_PROXY=true in the environment (on Vercel) to force relative requests.
const USE_VERCEL_PROXY = String(process.env.REACT_APP_USE_VERCEL_PROXY || '').toLowerCase() === 'true';
const API_BASE_URL = USE_VERCEL_PROXY
    ? ''
    : (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');
// Fallback token only for local/dev diagnostics (never commit a real token in env)
const DEFAULT_BEARER_TOKEN = process.env.REACT_APP_FALLBACK_TOKEN || '';

// Utility: build full URL safely
const buildUrl = (endpoint) => {
    if (!endpoint) throw new Error('Endpoint is required');
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint; // Absolute path safeguard
    // When using proxy/rewrites we intentionally do NOT prepend an origin
    return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// API Helper Functions
const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('adminToken') || DEFAULT_BEARER_TOKEN;
    const url = buildUrl(endpoint);

    const isFormData = options.body instanceof FormData;
    const headers = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
    };

    const finalConfig = {
        method: options.method || 'GET',
        ...options,
        headers,
    };

    let response;
    try {
        response = await fetch(url, finalConfig);
    } catch (networkErr) {
        console.error(`[API] Network failure for ${endpoint}:`, networkErr);
        throw new Error('Network error. Please check your connection.');
    }

    const contentType = response.headers.get('content-type') || '';
    let parsed;
    if (contentType.includes('application/json')) {
        try {
            parsed = await response.json();
        } catch (jsonErr) {
            console.warn('[API] Failed to parse JSON response', jsonErr);
            parsed = { success: false, message: 'Invalid JSON response', raw: null };
        }
    } else if (response.status === 204) {
        parsed = { success: true, message: 'No content', result: [] };
    } else {
        // Fallback text when non-JSON expected (should not normally happen for this API)
        const text = await response.text().catch(() => '');
        parsed = { success: response.ok, message: text || response.statusText, result: [] };
    }

    if (!response.ok) {
        const errMsg = parsed?.message || `Request failed (${response.status})`;
        throw new Error(errMsg);
    }

    return parsed;
};

// Mock data removed - now using live API data only
// All endpoints connect to real database

// --- EXPORTED FUNCTIONS ---

export const fetchDashboardData = async () => {
    try {
        // Fetch real coach data from API
        const coaches = await fetchCoaches();
        
        return {
            totalCoaches: coaches.length,
            pendingApprovals: coaches.filter(c => c.status && c.status.toLowerCase() === 'pending').length,
            approvedCoaches: coaches.filter(c => c.status && c.status.toLowerCase() === 'approved').length,
            rejectedCoaches: coaches.filter(c => c.status && c.status.toLowerCase() === 'rejected').length,
            totalUsers: coaches.length, // Using coach count as user count for now
        };
    } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        throw error;
    }
};

// Data transformer for getAllCoaches (basic coach list)
const transformCoachListData = (apiCoaches) => {
    if (!apiCoaches || !Array.isArray(apiCoaches)) {
        console.log('Invalid apiCoaches data:', apiCoaches);
        return [];
    }
    
    return apiCoaches.map((coach, index) => {
        console.log(`Coach ${index}:`, coach);
        
        return {
            id: coach.coachProfileId || coach.coach_profile_id || (index + 1),
            name: coach.fullName || coach.full_name || `Coach ${index + 1}`,
            email: coach.email || 'coach@example.com',
            status: coach.verificationStatus || 'pending',
            joined: coach.created_at || coach.createdAt || new Date().toISOString().split('T')[0],
            experience: coach.coachingExperience ? `${coach.coachingExperience} years` : '5 years',
            sports: coach.sportType || 'General',
            bio: coach.about || 'Experienced coach',
            rejectionReason: coach.rejectionReason || null,
            
            // Basic fields for list view
            country: coach.country || 'Not specified',
            city: coach.city || 'Not specified',
            about: coach.about || 'No description available',
            background: coach.background || 'No background information',
            trainingStyle: coach.trainingStyle || 'Not specified',
            displayPicture: coach.displayPicture || null,
            institutionName: coach.institutionName || 'Not specified',
            universityName: coach.universityName || 'Not specified',
            profileCompletionStatus: coach.profileCompletionStatus || 'notStarted',
            verificationStatus: coach.verificationStatus || 'pending',
            certificateStatus: coach.certificateStatus || false,
            affiliationStatus: coach.affiliationStatus || false,
            
            // Store original data for detailed view fallback
            _originalData: coach
        };
    });
};

// Data transformer for viewSingleCoachProfileInfo (detailed profile)
const transformSingleCoachData = (coachData) => {
    if (!coachData) {
        console.log('Invalid single coach data:', coachData);
        return null;
    }
    
    console.log('Single coach raw data:', coachData);
    
    // Parse keyAchievements if it's a JSON string
    let parsedKeyAchievements = null;
    if (coachData.keyAchievements) {
        if (typeof coachData.keyAchievements === 'string') {
            try {
                parsedKeyAchievements = JSON.parse(coachData.keyAchievements);
            } catch (e) {
                parsedKeyAchievements = coachData.keyAchievements; // Keep as string if not valid JSON
            }
        } else {
            parsedKeyAchievements = coachData.keyAchievements;
        }
    }
    
    // Parse socialMediaLinks if it's a JSON string
    let parsedSocialLinks = [];
    if (coachData.socialMediaLinks) {
        if (typeof coachData.socialMediaLinks === 'string') {
            try {
                parsedSocialLinks = JSON.parse(coachData.socialMediaLinks);
            } catch (e) {
                parsedSocialLinks = [];
            }
        } else if (Array.isArray(coachData.socialMediaLinks)) {
            parsedSocialLinks = coachData.socialMediaLinks;
        }
    }
    
    return {
        id: coachData.coachProfileId || coachData.coach_profile_id,
        name: coachData.fullName || coachData.full_name || 'Unknown Coach',
        email: coachData.email || 'coach@example.com',
        status: coachData.verificationStatus || 'pending',
        joined: coachData.created_at || coachData.createdAt || new Date().toISOString().split('T')[0],
        experience: coachData.coachingExperience ? `${coachData.coachingExperience} years` : '5 years',
        sports: coachData.sportType || 'General',
        bio: coachData.about || 'No description available',
        rejectionReason: coachData.rejectionReason || null,
        
        // Enhanced fields for detailed view
        country: coachData.country || 'Not specified',
        city: coachData.city || 'Not specified',
        about: coachData.about || 'No description available',
        background: coachData.background || 'No background information',
        trainingStyle: coachData.trainingStyle || 'Not specified',
        
        // Professional details
        displayPicture: coachData.displayPicture || null,
        institutionName: coachData.institutionName || 'Not specified',
        universityName: coachData.universityName || 'Not specified',
        
        // Status fields - ALL from API spec
        profileCompletionStatus: coachData.profileCompletionStatus || 'notStarted',
        verificationStatus: coachData.verificationStatus || 'pending',
        certificateStatus: coachData.certificateStatus || false,
        affiliationStatus: coachData.affiliationStatus || false,
        scheduleCompletionStatus: coachData.scheduleCompletionStatus || false,
        profileSubmissionStatus: coachData.profileSubmissionStatus || coachData.profilesubmissionStatus || false,
        
        // Media and achievements - ALL from API spec
        certificate: coachData.certificate || null,
        demoVideo: coachData.demoVideo || null,
        keyAchievements: parsedKeyAchievements,
        socialMediaLinks: parsedSocialLinks,
        
        // Keep original data for debugging
        _originalData: coachData
    };
};

// 1. GET /v1/admin/getAllCoaches - For coach list view
export const fetchCoaches = async () => {
    console.log('Fetching all coaches list...');
    const response = await apiRequest('/v1/admin/getAllCoaches');
    console.log('getAllCoaches API Response:', response);
    
    // Based on API spec: result[0].coachProfiles
    if (response.result && Array.isArray(response.result) && response.result[0] && response.result[0].coachProfiles) {
        const rawCoaches = response.result[0].coachProfiles;
        console.log('Extracted coach list:', rawCoaches);
        
        // Transform using coach list transformer
        const transformedCoaches = transformCoachListData(rawCoaches);
        console.log('Transformed coach list:', transformedCoaches);
        
        return transformedCoaches;
    }
    
    throw new Error('Invalid response format from getAllCoaches API');
};

// 2. GET /v1/admin/viewSingleCoachProfileInfo/:id - For detailed coach profile
export const fetchCoachById = async (coachId) => {
    console.log('Fetching detailed coach profile for ID:', coachId);
    
    try {
        const response = await apiRequest(`/v1/admin/viewSingleCoachProfileInfo/${coachId}`);
        console.log('viewSingleCoachProfileInfo API response:', response);
        
        // Based on API spec: result[0].profileDetails
        if (response.result && Array.isArray(response.result) && response.result[0] && response.result[0].profileDetails) {
            const profileDetails = response.result[0].profileDetails;
            console.log('Extracted profile details:', profileDetails);
            
            const transformedCoach = transformSingleCoachData(profileDetails);
            console.log('Transformed single coach:', transformedCoach);
            return transformedCoach;
        }
    } catch (singleApiError) {
        console.warn('Single coach profile API failed, trying fallback to coach list:', singleApiError.message);
    }
    
    // Fallback: Get from coach list (which has basic info from getAllCoaches)
    console.log('Using fallback: getting coach from list...');
    const allCoaches = await fetchCoaches();
    const coach = allCoaches.find(c => 
        c.id === coachId || 
        c.id === String(coachId) ||
        c.id === parseInt(coachId)
    );
    
    if (coach) {
        console.log('Found coach in list:', coach);
        return coach;
    }
    
    throw new Error(`Coach with ID ${coachId} not found`);
};

// 3. POST /v1/admin/verifyCoachProfile - For coach verification
export const updateCoachStatus = async (coachId, newStatus, rejectionReason = null) => {
    try {
        console.log('Verifying coach:', coachId, 'Status:', newStatus, 'Reason:', rejectionReason);
        
        // Map status to API expected values
        const verificationStatus = newStatus.toLowerCase() === 'approved' ? 'approved' : 'rejected';
        
        const requestBody = {
            coachProfileID: coachId, // Note: API expects "coachProfileID" (capital letters)
            verificationStatus: verificationStatus,
            ...(rejectionReason && { rejectionReason: rejectionReason })
        };
        
        console.log('Verification request body:', requestBody);
        
        const response = await apiRequest('/v1/admin/verifyCoachProfile', {
            method: 'POST',
            body: JSON.stringify(requestBody)
        });
        
        console.log('Verification API response:', response);
        
        // Based on API spec: result[0] contains verification details
        if (response.success) {
            return { 
                success: true, 
                updatedCoach: {
                    id: coachId,
                    verificationStatus: verificationStatus,
                    rejectionReason: rejectionReason
                }
            };
        } else {
            return { 
                success: false, 
                message: response.message || 'Verification failed' 
            };
        }
        
    } catch (error) {
        console.error('Verification API call failed:', error.message);
        return { 
            success: false, 
            message: error.message || 'Failed to update coach status' 
        };
    }
};

// 4. POST /v1/login - Admin login
export const loginUser = async (email, password) => {
    try {
        console.log('Attempting login with email:', email);
        
        const requestBody = {
            email: email,
            password: password,
            signinType: 'email' // As per API spec for email login
        };
        
        const response = await apiRequest('/v1/login', {
            method: 'POST',
            body: JSON.stringify(requestBody)
        });
        
        console.log('Login API response:', response);
        
        if (response.success && response.result && response.result[0]) {
            const result = response.result[0];
            
            // Check if user has admin role or appropriate permissions
            // Note: The API returns role as "learner/coach/both"
            // You might need to check with your backend team about admin role
            
            // Store token in localStorage for future API calls
            if (result.token) {
                localStorage.setItem('adminToken', result.token);
            }
            
            return { 
                success: true, 
                user: { 
                    name: email.split('@')[0], // Extract name from email
                    email: email,
                    userId: result.userId,
                    role: result.role
                },
                token: result.token
            };
        } else {
            return { 
                success: false, 
                message: response.message || 'Invalid credentials.' 
            };
        }
        
    } catch (error) {
        console.error('Login API failed:', error);
        return { 
            success: false, 
            message: error.message || 'Login failed. Please check your credentials and try again.' 
        };
    }
};

