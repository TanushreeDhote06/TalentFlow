import Dexie from 'dexie';

export const db = new Dexie('TalentFlowDB');

db.version(1).stores({
  jobs: '++id, title, slug, status, order, expirationDate, createdAt',
  candidates: '++id, name, email, jobId, stage, followUp, createdAt',
  candidateTimeline: '++id, candidateId, timestamp',
  assessments: '++id, jobId, updatedAt',
  assessmentResponses: '++id, candidateId, jobId, submittedAt',
  metadata: 'key'
});

// Helper functions for database operations
export const dbHelpers = {
  // Check if database is seeded
  async isSeeded() {
    const metadata = await db.metadata.get('seeded');
    return metadata?.value === true;
  },

  // Mark database as seeded
  async markSeeded() {
    await db.metadata.put({ key: 'seeded', value: true });
  },

  // Clear all data
  async clearAll() {
    await db.jobs.clear();
    await db.candidates.clear();
    await db.candidateTimeline.clear();
    await db.assessments.clear();
    await db.assessmentResponses.clear();
    await db.metadata.clear();
  },

  // Jobs operations
  async getAllJobs() {
    return await db.jobs.toArray();
  },

  async getJob(id) {
    return await db.jobs.get(id);
  },

  async getJobBySlug(slug) {
    return await db.jobs.where('slug').equals(slug).first();
  },

  async addJob(job) {
    return await db.jobs.add(job);
  },

  async updateJob(id, updates) {
    return await db.jobs.update(id, updates);
  },

  async deleteJob(id) {
    return await db.jobs.delete(id);
  },

  // Candidates operations
  async getAllCandidates() {
    return await db.candidates.toArray();
  },

  async getCandidate(id) {
    return await db.candidates.get(id);
  },

  async getCandidatesByJob(jobId) {
    return await db.candidates.where('jobId').equals(jobId).toArray();
  },

  async addCandidate(candidate) {
    return await db.candidates.add(candidate);
  },

  async updateCandidate(id, updates) {
    return await db.candidates.update(id, updates);
  },

  async deleteCandidate(id) {
    return await db.candidates.delete(id);
  },

  // Timeline operations
  async getCandidateTimeline(candidateId) {
    return await db.candidateTimeline
      .where('candidateId')
      .equals(candidateId)
      .sortBy('timestamp');
  },

  async addTimelineEntry(entry) {
    return await db.candidateTimeline.add(entry);
  },

  // Assessments operations
  async getAssessment(jobId) {
    return await db.assessments.where('jobId').equals(jobId).first();
  },

  async saveAssessment(assessment) {
    const existing = await db.assessments.where('jobId').equals(assessment.jobId).first();
    if (existing) {
      return await db.assessments.update(existing.id, assessment);
    }
    return await db.assessments.add(assessment);
  },

  async deleteAssessment(jobId) {
    const assessment = await db.assessments.where('jobId').equals(jobId).first();
    if (assessment) {
      return await db.assessments.delete(assessment.id);
    }
  },

  // Assessment responses operations
  async getAssessmentResponse(candidateId, jobId) {
    return await db.assessmentResponses
      .where(['candidateId', 'jobId'])
      .equals([candidateId, jobId])
      .first();
  },

  async saveAssessmentResponse(response) {
    const existing = await this.getAssessmentResponse(response.candidateId, response.jobId);
    if (existing) {
      return await db.assessmentResponses.update(existing.id, response);
    }
    return await db.assessmentResponses.add(response);
  },
};

export default db;

