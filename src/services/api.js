// This is a mock "database". In a real app, this data would be on a server.
const coachesDB = [
    {
        id: 1,
        name: "Alex Thompson",
        email: "alex.thompson@example.com",
        status: "Pending",
        joined: "2023-10-26",
        experience: "8 years",
        sports: "Basketball",
        bio: "Experienced basketball coach specializing in youth development and offensive strategies.",
        rejectionReason: null,
        // New Detailed Fields
        country: "USA",
        city: "Los Angeles",
        about: "A passionate and energetic basketball coach with a focus on building strong fundamentals and a love for the game in young athletes. My goal is to develop not just skilled players, but also confident individuals.",
        background: "Played Division I college basketball at UCLA. Spent three years as an assistant coach for a high school varsity team before taking on a head coaching role.",
        trainingStyle: "High-intensity drills focused on agility, shooting mechanics, and defensive positioning. I believe in a positive reinforcement approach to motivate players.",
        affiliation: "Other",
        media: [
            { type: "image", url: "https://placehold.co/600x400/EEE/31343C?text=Coaching+Certificate" },
            { type: "image", url: "https://placehold.co/600x400/EEE/31343C?text=First+Aid+Training" },
        ]
    },
    {
        id: 2,
        name: "Samantha Ray",
        email: "samantha.ray@example.com",
        status: "Approved",
        joined: "2023-09-15",
        experience: "12 years",
        sports: "Soccer",
        bio: "Former professional soccer player, now a certified coach with a focus on defensive tactics.",
        rejectionReason: null,
        // New Detailed Fields
        country: "Canada",
        city: "Toronto",
        about: "With over a decade of experience at the professional level, I bring a deep understanding of soccer strategy and player conditioning. I am dedicated to mentoring the next generation of soccer talent.",
        background: "Played for the Canadian Women's National Team for 8 years. Transitioned to coaching after retiring, earning a UEFA A License.",
        trainingStyle: "Emphasis on tactical awareness, team cohesion, and positional play. Sessions are structured to simulate real-game scenarios.",
        affiliation: "WBC",
        media: [
            { type: "image", url: "https://placehold.co/600x400/EEE/31343C?text=UEFA+A+License" },
        ]
    },
    {
        id: 3,
        name: "Ben Carter",
        email: "ben.carter@example.com",
        status: "Approved",
        joined: "2023-08-01",
        experience: "10 years",
        sports: "Tennis",
        bio: "A dedicated tennis coach known for improving player serves and groundstrokes.",
        rejectionReason: null,
        // New Detailed Fields
        country: "USA",
        city: "Miami",
        about: "My coaching philosophy is centered around personalized development plans for each athlete, focusing on technical skill, mental toughness, and strategic gameplay.",
        background: "Competed on the ATP Challenger Tour for 5 years. Certified by the Professional Tennis Registry (PTR).",
        trainingStyle: "A mix of on-court drills, video analysis, and fitness training to build a well-rounded player.",
        affiliation: "IBF",
        media: [
            { type: "image", url: "https://placehold.co/600x400/EEE/31343C?text=PTR+Certification" },
        ]
    },
    {
        id: 4,
        name: "Priya Sharma",
        email: "priya.sharma@example.com",
        status: "Rejected",
        joined: "2023-10-20",
        experience: "5 years",
        sports: "Boxing",
        bio: "Aspiring boxing coach for amateurs.",
        rejectionReason: "Affiliation documents are out of date.",
        // New Detailed Fields
        country: "India",
        city: "Mumbai",
        about: "Passionate about the art of boxing, I aim to teach discipline, respect, and self-defense through structured training programs.",
        background: "Amateur boxer with 50+ bouts. Certified state-level coach.",
        trainingStyle: "Focus on footwork, defensive techniques, and combination punching. Strong emphasis on safety and conditioning.",
        affiliation: "IABF affiliated state association",
        media: []
    },
    {
        id: 5,
        name: "Rajiv Singh",
        email: "rajiv.singh@example.com",
        status: "Pending",
        joined: "2023-10-28",
        experience: "15 years",
        sports: "Boxing",
        bio: "Veteran boxing coach with a history of training national champions.",
        rejectionReason: null,
        // New Detailed Fields
        country: "India",
        city: "Delhi",
        about: "A disciplined and old-school coach who believes in rigorous training and unwavering dedication. My track record speaks for itself, having guided several boxers to national-level success.",
        background: "Former national-level boxer. Head coach at a renowned boxing club in Delhi for over a decade.",
        trainingStyle: "Grueling conditioning, sparring-intensive sessions, and a focus on building physical and mental endurance.",
        affiliation: "BFi-affiliated state association",
        media: [
            { type: "image", url: "https://placehold.co/600x400/EEE/31343C?text=National+Coach+ID" },
        ]
    },
];

// Simulates a network delay
const delay = (ms) => new Promise(res => setTimeout(res, ms));

// --- EXPORTED FUNCTIONS ---

export const fetchDashboardData = async () => {
    await delay(500);
    return {
      totalCoaches: coachesDB.length,
      pendingApprovals: coachesDB.filter(c => c.status === 'Pending').length,
      approvedCoaches: coachesDB.filter(c => c.status === 'Approved').length,
      rejectedCoaches: coachesDB.filter(c => c.status === 'Rejected').length,
      totalUsers: 1428,
    };
};

export const fetchCoaches = async () => {
    await delay(700);
    return [...coachesDB];
};

export const fetchCoachById = async (coachId) => {
    await delay(400);
    const coach = coachesDB.find(c => c.id === coachId);
    return coach;
};


export const updateCoachStatus = async (coachId, newStatus, rejectionReason = null) => {
    await delay(300);
    const coachIndex = coachesDB.findIndex(c => c.id === coachId);
    if (coachIndex !== -1) {
        coachesDB[coachIndex].status = newStatus;
        if (rejectionReason) {
            coachesDB[coachIndex].rejectionReason = rejectionReason;
        }
        return { success: true, updatedCoach: coachesDB[coachIndex] };
    }
    return { success: false, message: "Coach not found." };
};

export const loginUser = async (email, password) => {
    await delay(600);
    if (email === 'admin@example.com' && password === 'password123') {
        return { success: true, user: { name: 'Admin User', email }, token: 'fake-jwt-token' };
    }
    return { success: false, message: 'Invalid credentials.' };
};

