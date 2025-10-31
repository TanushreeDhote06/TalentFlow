import { nanoid } from 'nanoid';

// Helper to generate random items from array
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate random number in range
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Job titles and descriptions
const jobTitles = [
  'Senior Frontend Developer',
  'Backend Engineer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Product Manager',
  'UI/UX Designer',
  'Data Scientist',
  'Machine Learning Engineer',
  'QA Engineer',
  'Technical Writer',
  'Solutions Architect',
  'Mobile Developer (iOS)',
  'Mobile Developer (Android)',
  'Security Engineer',
  'Cloud Architect',
  'Database Administrator',
  'Business Analyst',
  'Scrum Master',
  'Engineering Manager',
  'Customer Success Manager',
  'Sales Engineer',
  'Marketing Manager',
  'HR Coordinator',
  'Finance Analyst',
  'Operations Manager',
];

const jobTags = ['Remote', 'Hybrid', 'On-site', 'Full-time', 'Part-time', 'Contract', 'Urgent', 'Senior', 'Junior', 'Mid-level'];

// First and last names
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa',
  'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon',
  'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
  'Nicholas', 'Shirley', 'Eric', 'Angela', 'Jonathan', 'Helen', 'Stephen', 'Anna',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
];

const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

// Generate jobs
export function generateJobs(count = 25) {
  const jobs = [];
  const usedTitles = new Set();
  
  for (let i = 0; i < count; i++) {
    let title = randomItem(jobTitles);
    let suffix = '';
    let attempts = 0;
    
    // Ensure unique titles
    while (usedTitles.has(title + suffix) && attempts < 10) {
      suffix = ` ${randomItem(['(Remote)', '(NYC)', '(SF)', '(LA)', '(Chicago)', '(Austin)'])}`;
      attempts++;
    }
    
    const fullTitle = title + suffix;
    usedTitles.add(fullTitle);
    
    const slug = fullTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const status = i < 15 ? 'active' : 'archived';
    const selectedTags = [];
    const numTags = randomInt(2, 4);
    
    for (let j = 0; j < numTags; j++) {
      const tag = randomItem(jobTags);
      if (!selectedTags.includes(tag)) {
        selectedTags.push(tag);
      }
    }
    
    // Random expiration date (some past, some future)
    const daysOffset = randomInt(-30, 90);
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysOffset);
    
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - randomInt(1, 180));
    
    jobs.push({
      id: i + 1,
      title: fullTitle,
      slug,
      status,
      tags: selectedTags,
      order: i,
      expirationDate: expirationDate.toISOString(),
      createdAt: createdAt.toISOString(),
      description: `We are looking for a talented ${fullTitle} to join our team. This is an exciting opportunity to work on cutting-edge projects.`,
    });
  }
  
  return jobs;
}

// Generate candidates
export function generateCandidates(count = 1000, jobs = []) {
  const candidates = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 100 ? i : ''}@example.com`;
    const jobId = jobs[randomInt(0, jobs.length - 1)]?.id || 1;
    const stage = randomItem(stages);
    const followUp = Math.random() < 0.15; // 15% chance of follow-up flag
    
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - randomInt(1, 90));
    
    candidates.push({
      id: i + 1,
      name: `${firstName} ${lastName}`,
      email,
      jobId,
      stage,
      followUp,
      createdAt: createdAt.toISOString(),
    });
  }
  
  return candidates;
}

// Generate timeline entries for candidates
export function generateTimeline(candidates = []) {
  const timeline = [];
  let timelineId = 1;
  
  candidates.forEach(candidate => {
    const numEntries = randomInt(2, 5);
    const candidateCreatedAt = new Date(candidate.createdAt);
    
    let currentStage = 'applied';
    const stageProgression = ['applied', 'screen', 'tech', 'offer'];
    
    for (let i = 0; i < numEntries; i++) {
      const timestamp = new Date(candidateCreatedAt);
      timestamp.setDate(timestamp.getDate() + i * randomInt(3, 10));
      
      let toStage;
      if (i === numEntries - 1) {
        toStage = candidate.stage; // Final stage
      } else {
        const progressionIndex = stageProgression.indexOf(currentStage);
        if (progressionIndex < stageProgression.length - 1 && Math.random() > 0.3) {
          toStage = stageProgression[progressionIndex + 1];
        } else {
          toStage = currentStage;
        }
      }
      
      const notes = i === 0 
        ? 'Application received' 
        : randomItem([
            'Completed phone screening',
            'Technical interview scheduled',
            'Strong candidate, moving forward',
            'Great fit for the role',
            'Need to follow up on references',
            'Salary expectations aligned',
          ]);
      
      timeline.push({
        id: timelineId++,
        candidateId: candidate.id,
        fromStage: currentStage,
        toStage,
        timestamp: timestamp.toISOString(),
        notes,
      });
      
      currentStage = toStage;
    }
  });
  
  return timeline;
}

// Generate assessments
export function generateAssessments(jobs = []) {
  const assessments = [];
  
  // Create assessments for first 5 jobs
  const jobsToAssess = jobs.slice(0, Math.min(5, jobs.length));
  
  jobsToAssess.forEach((job, idx) => {
    const sections = [];
    
    // Section 1: Personal Information
    sections.push({
      id: nanoid(),
      title: 'Personal Information',
      description: 'Please provide your basic information',
      questions: [
        {
          id: nanoid(),
          type: 'short-text',
          label: 'Full Name',
          required: true,
          maxLength: 100,
        },
        {
          id: nanoid(),
          type: 'short-text',
          label: 'Email Address',
          required: true,
          maxLength: 100,
        },
        {
          id: nanoid(),
          type: 'short-text',
          label: 'Phone Number',
          required: false,
          maxLength: 20,
        },
      ],
    });
    
    // Section 2: Experience
    sections.push({
      id: nanoid(),
      title: 'Professional Experience',
      description: 'Tell us about your background',
      questions: [
        {
          id: nanoid(),
          type: 'numeric',
          label: 'Years of Experience',
          required: true,
          min: 0,
          max: 50,
        },
        {
          id: nanoid(),
          type: 'single-choice',
          label: 'Have you worked in a similar role before?',
          required: true,
          options: ['Yes', 'No'],
        },
        {
          id: nanoid(),
          type: 'long-text',
          label: 'Describe your most relevant experience',
          required: true,
          maxLength: 1000,
          conditional: {
            questionId: null, // Will be set to previous question's ID
            value: 'Yes',
          },
        },
      ],
    });
    
    // Set conditional reference
    sections[1].questions[2].conditional.questionId = sections[1].questions[1].id;
    
    // Section 3: Technical Skills
    sections.push({
      id: nanoid(),
      title: 'Technical Assessment',
      description: 'Evaluate your technical competencies',
      questions: [
        {
          id: nanoid(),
          type: 'multi-choice',
          label: 'Which technologies are you proficient in?',
          required: true,
          options: ['JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'TypeScript', 'React', 'Node.js'],
        },
        {
          id: nanoid(),
          type: 'single-choice',
          label: 'Preferred work environment?',
          required: true,
          options: ['Remote', 'Hybrid', 'On-site'],
        },
        {
          id: nanoid(),
          type: 'numeric',
          label: 'Expected Salary (in thousands)',
          required: false,
          min: 0,
          max: 500,
        },
      ],
    });
    
    // Section 4: Additional Information
    sections.push({
      id: nanoid(),
      title: 'Additional Information',
      description: 'Final questions',
      questions: [
        {
          id: nanoid(),
          type: 'long-text',
          label: 'Why do you want to join our company?',
          required: true,
          maxLength: 500,
        },
        {
          id: nanoid(),
          type: 'single-choice',
          label: 'Are you legally authorized to work in this country?',
          required: true,
          options: ['Yes', 'No'],
        },
        {
          id: nanoid(),
          type: 'file-upload',
          label: 'Upload your resume (PDF)',
          required: false,
        },
      ],
    });
    
    assessments.push({
      id: idx + 1,
      jobId: job.id,
      sections,
      updatedAt: new Date().toISOString(),
    });
  });
  
  return assessments;
}

// Main seed function
export async function seedDatabase(db) {
  console.log('Seeding database...');
  
  const jobs = generateJobs(25);
  const candidates = generateCandidates(1000, jobs);
  const timeline = generateTimeline(candidates);
  const assessments = generateAssessments(jobs);
  
  // Add all data to database
  await db.jobs.bulkAdd(jobs);
  await db.candidates.bulkAdd(candidates);
  await db.candidateTimeline.bulkAdd(timeline);
  await db.assessments.bulkAdd(assessments);
  
  // Mark as seeded
  await db.metadata.put({ key: 'seeded', value: true });
  
  console.log('Database seeded successfully!');
  console.log(`- ${jobs.length} jobs`);
  console.log(`- ${candidates.length} candidates`);
  console.log(`- ${timeline.length} timeline entries`);
  console.log(`- ${assessments.length} assessments`);
  
  return { jobs, candidates, timeline, assessments };
}

