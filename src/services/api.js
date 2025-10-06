const USE_VERCEL_PROXY = String(process.env.REACT_APP_USE_VERCEL_PROXY || '').toLowerCase() === 'true';
const API_BASE_URL = USE_VERCEL_PROXY
    ? ''
    : (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');
const DEFAULT_BEARER_TOKEN = process.env.REACT_APP_FALLBACK_TOKEN || '';

const ENABLE_LOCAL_ADMIN = String(process.env.REACT_APP_ENABLE_LOCAL_ADMIN || '').toLowerCase() === 'true';
const LOCAL_ADMIN_EMAIL = (process.env.REACT_APP_LOCAL_ADMIN_EMAIL || '').toLowerCase();
const LOCAL_ADMIN_PASSWORD = process.env.REACT_APP_LOCAL_ADMIN_PASSWORD || '';
const LOCAL_ADMIN_SERVICE_BEARER = process.env.REACT_APP_LOCAL_ADMIN_SERVICE_BEARER || DEFAULT_BEARER_TOKEN || '';

const buildUrl = (endpoint) => {
    if (!endpoint) throw new Error('Endpoint is required');
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;
    return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

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
        const text = await response.text().catch(() => '');
        parsed = { success: response.ok, message: text || response.statusText, result: [] };
    }

    if (!response.ok) {
        const errMsg = parsed?.message || `Request failed (${response.status})`;
        throw new Error(errMsg);
    }

    return parsed;
};

export const fetchDashboardData = async () => {
    try {
        const coaches = await fetchCoaches();
        
        return {
            totalCoaches: coaches.length,
            pendingApprovals: coaches.filter(c => c.status && c.status.toLowerCase() === 'pending').length,
            approvedCoaches: coaches.filter(c => c.status && c.status.toLowerCase() === 'approved').length,
            rejectedCoaches: coaches.filter(c => c.status && c.status.toLowerCase() === 'rejected').length,
            totalUsers: coaches.length,
        };
    } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        throw error;
    }
};

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

            _originalData: coach
        };
    });
};

const transformSingleCoachData = (coachData) => {
    if (!coachData) {
        console.log('Invalid single coach data:', coachData);
        return null;
    }
    
    console.log('Single coach raw data:', coachData);

    let parsedKeyAchievements = null;
    if (coachData.keyAchievements) {
        if (typeof coachData.keyAchievements === 'string') {
            try {
                parsedKeyAchievements = JSON.parse(coachData.keyAchievements);
            } catch (e) {
                parsedKeyAchievements = coachData.keyAchievements;
            }
        } else {
            parsedKeyAchievements = coachData.keyAchievements;
        }
    }

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

        country: coachData.country || 'Not specified',
        city: coachData.city || 'Not specified',
        about: coachData.about || 'No description available',
        background: coachData.background || 'No background information',
        trainingStyle: coachData.trainingStyle || 'Not specified',

        displayPicture: coachData.displayPicture || null,
        institutionName: coachData.institutionName || 'Not specified',
        universityName: coachData.universityName || 'Not specified',

        profileCompletionStatus: coachData.profileCompletionStatus || 'notStarted',
        verificationStatus: coachData.verificationStatus || 'pending',
        certificateStatus: coachData.certificateStatus || false,
        affiliationStatus: coachData.affiliationStatus || false,
        scheduleCompletionStatus: coachData.scheduleCompletionStatus || false,
        profileSubmissionStatus: coachData.profileSubmissionStatus || coachData.profilesubmissionStatus || false,

        certificate: coachData.certificate || null,
        demoVideo: coachData.demoVideo || null,
        keyAchievements: parsedKeyAchievements,
        socialMediaLinks: parsedSocialLinks,

        _originalData: coachData
    };
};

export const fetchCoaches = async () => {
    console.log('Fetching all coaches list...');
    const response = await apiRequest('/v1/admin/getAllCoaches');
    console.log('getAllCoaches API Response:', response);

    if (response.result && Array.isArray(response.result) && response.result[0] && response.result[0].coachProfiles) {
        const rawCoaches = response.result[0].coachProfiles;
        console.log('Extracted coach list:', rawCoaches);

        const transformedCoaches = transformCoachListData(rawCoaches);
        console.log('Transformed coach list:', transformedCoaches);
        
        return transformedCoaches;
    }
    
    throw new Error('Invalid response format from getAllCoaches API');
};

export const fetchCoachById = async (coachId) => {
    console.log('Fetching detailed coach profile for ID:', coachId);
    
    try {
        const response = await apiRequest(`/v1/admin/viewSingleCoachProfileInfo/${coachId}`);
        console.log('viewSingleCoachProfileInfo API response:', response);

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

export const updateCoachStatus = async (coachId, newStatus, rejectionReason = null) => {
    try {
        console.log('Verifying coach:', coachId, 'Status:', newStatus, 'Reason:', rejectionReason);

        const verificationStatus = newStatus.toLowerCase() === 'approved' ? 'approved' : 'rejected';
        
        const requestBody = {
            coachProfileID: coachId,
            verificationStatus: verificationStatus,
            ...(rejectionReason && { rejectionReason: rejectionReason })
        };

        console.log('Verification request body:', requestBody);
        
        const response = await apiRequest('/v1/admin/verifyCoachProfile', {
            method: 'POST',
            body: JSON.stringify(requestBody)
        });
        
        console.log('Verification API response:', response);

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

export const loginUser = async (email, password) => {
    try {
        console.log('Attempting login with email:', email);

        if (
            ENABLE_LOCAL_ADMIN &&
            LOCAL_ADMIN_EMAIL && LOCAL_ADMIN_PASSWORD &&
            typeof email === 'string' && typeof password === 'string' &&
            email.toLowerCase() === LOCAL_ADMIN_EMAIL &&
            password === LOCAL_ADMIN_PASSWORD
        ) {
            const token = LOCAL_ADMIN_SERVICE_BEARER || `local-admin-token:${Date.now()}`;
            localStorage.setItem('adminToken', token);
            return {
                success: true,
                user: {
                    name: 'Admin',
                    email,
                    userId: 'local-admin',
                    role: 'admin'
                },
                token
            };
        }

        const requestBody = {
            email: email,
            password: password,
            signinType: 'email'
        };
        
        const response = await apiRequest('/v1/login', {
            method: 'POST',
            body: JSON.stringify(requestBody)
        });
        
        console.log('Login API response:', response);
        
        if (response.success && response.result && response.result[0]) {
            const result = response.result[0];

            if (result.token) {
                localStorage.setItem('adminToken', result.token);
            }
            
            return { 
                success: true, 
                user: { 
                    name: email.split('@')[0],
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

