import { createServer, Response } from 'miragejs';
import { dbHelpers, db } from '../services/db';
import { seedDatabase } from './seedData';

// Helper to add artificial latency
const delay = () => new Promise(resolve => 
  setTimeout(resolve, Math.random() * 1000 + 200) // 200-1200ms
);

// Helper to simulate random errors (5-10% failure rate)
const shouldFail = () => Math.random() < 0.075; // 7.5% failure rate

export function makeServer() {
  return createServer({
    routes() {
      this.namespace = 'api';
      this.timing = 0; // We handle timing manually

      // Initialize database on first request
      this.get('/init', async () => {
        await delay();
        
        const isSeeded = await dbHelpers.isSeeded();
        if (!isSeeded) {
          await seedDatabase(db);
        }
        
        return { initialized: true };
      });

      // Jobs endpoints
      this.get('/jobs', async (schema, request) => {
        await delay();
        
        const { search, status, page = '1', pageSize = '12', sort = 'order' } = request.queryParams;
        
        let jobs = await dbHelpers.getAllJobs();
        
        // Apply filters
        if (search) {
          const searchLower = search.toLowerCase();
          jobs = jobs.filter(job => 
            job.title.toLowerCase().includes(searchLower) ||
            job.slug.toLowerCase().includes(searchLower)
          );
        }
        
        if (status) {
          jobs = jobs.filter(job => job.status === status);
        }
        
        // Auto-archive expired jobs
        const now = new Date();
        for (const job of jobs) {
          if (job.expirationDate && new Date(job.expirationDate) < now && job.status === 'active') {
            await dbHelpers.updateJob(job.id, { status: 'archived' });
            job.status = 'archived';
          }
        }
        
        // Sort
        if (sort === 'title') {
          jobs.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sort === 'createdAt') {
          jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
          jobs.sort((a, b) => a.order - b.order);
        }
        
        // Pagination
        const pageNum = parseInt(page);
        const size = parseInt(pageSize);
        const total = jobs.length;
        const totalPages = Math.ceil(total / size);
        const start = (pageNum - 1) * size;
        const paginatedJobs = jobs.slice(start, start + size);
        
        return {
          data: paginatedJobs,
          pagination: {
            page: pageNum,
            pageSize: size,
            total,
            totalPages,
          },
        };
      });

      this.get('/jobs/:id', async (schema, request) => {
        await delay();
        
        const job = await dbHelpers.getJob(parseInt(request.params.id));
        
        if (!job) {
          return new Response(404, {}, { error: 'Job not found' });
        }
        
        return job;
      });

      this.post('/jobs', async (schema, request) => {
        await delay();
        
        if (shouldFail()) {
          return new Response(500, {}, { error: 'Failed to create job' });
        }
        
        const attrs = JSON.parse(request.requestBody);
        
        // Validate
        if (!attrs.title) {
          return new Response(400, {}, { error: 'Title is required' });
        }
        
        // Check for duplicate slug
        const existingJob = await dbHelpers.getJobBySlug(attrs.slug);
        if (existingJob) {
          return new Response(409, {}, { error: 'Slug already exists' });
        }
        
        const newJob = {
          ...attrs,
          createdAt: new Date().toISOString(),
        };
        
        const id = await dbHelpers.addJob(newJob);
        const job = await dbHelpers.getJob(id);
        
        return new Response(201, {}, job);
      });

      this.patch('/jobs/:id', async (schema, request) => {
        await delay();
        
        if (shouldFail()) {
          return new Response(500, {}, { error: 'Failed to update job' });
        }
        
        const id = parseInt(request.params.id);
        const updates = JSON.parse(request.requestBody);
        
        // Check if slug is being updated and is unique
        if (updates.slug) {
          const existingJob = await dbHelpers.getJobBySlug(updates.slug);
          if (existingJob && existingJob.id !== id) {
            return new Response(409, {}, { error: 'Slug already exists' });
          }
        }
        
        await dbHelpers.updateJob(id, updates);
        const job = await dbHelpers.getJob(id);
        
        return job;
      });

      this.patch('/jobs/:id/reorder', async (schema, request) => {
        await delay();
        
        // Higher failure rate for reorder to test rollback
        if (Math.random() < 0.1) { // 10% failure rate
          return new Response(500, {}, { error: 'Failed to reorder jobs' });
        }
        
        const { fromOrder, toOrder } = JSON.parse(request.requestBody);
        const jobs = await dbHelpers.getAllJobs();
        
        // Update order of affected jobs
        for (const job of jobs) {
          if (job.order === fromOrder) {
            await dbHelpers.updateJob(job.id, { order: toOrder });
          } else if (fromOrder < toOrder && job.order > fromOrder && job.order <= toOrder) {
            await dbHelpers.updateJob(job.id, { order: job.order - 1 });
          } else if (fromOrder > toOrder && job.order >= toOrder && job.order < fromOrder) {
            await dbHelpers.updateJob(job.id, { order: job.order + 1 });
          }
        }
        
        return { success: true };
      });

      this.delete('/jobs/:id', async (schema, request) => {
        await delay();
        
        if (shouldFail()) {
          return new Response(500, {}, { error: 'Failed to delete job' });
        }
        
        await dbHelpers.deleteJob(parseInt(request.params.id));
        return new Response(204);
      });

      // Candidates endpoints
      this.get('/candidates', async (schema, request) => {
        await delay();
        
        const { search, stage, page = '1', pageSize = '50' } = request.queryParams;
        
        let candidates = await dbHelpers.getAllCandidates();
        
        // Apply filters
        if (search) {
          const searchLower = search.toLowerCase();
          candidates = candidates.filter(c => 
            c.name.toLowerCase().includes(searchLower) ||
            c.email.toLowerCase().includes(searchLower)
          );
        }
        
        if (stage) {
          candidates = candidates.filter(c => c.stage === stage);
        }
        
        // Sort by created date (newest first)
        candidates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // For virtualization, we return all matching candidates
        // But still support pagination for initial load
        const pageNum = parseInt(page);
        const size = parseInt(pageSize);
        const total = candidates.length;
        
        return {
          data: candidates, // Return all for virtualization
          pagination: {
            page: pageNum,
            pageSize: size,
            total,
          },
        };
      });

      this.get('/candidates/:id', async (schema, request) => {
        await delay();
        
        const candidate = await dbHelpers.getCandidate(parseInt(request.params.id));
        
        if (!candidate) {
          return new Response(404, {}, { error: 'Candidate not found' });
        }
        
        return candidate;
      });

      this.get('/candidates/:id/timeline', async (schema, request) => {
        await delay();
        
        const candidateId = parseInt(request.params.id);
        const timeline = await dbHelpers.getCandidateTimeline(candidateId);
        
        return timeline;
      });

      this.post('/candidates', async (schema, request) => {
        await delay();
        
        if (shouldFail()) {
          return new Response(500, {}, { error: 'Failed to create candidate' });
        }
        
        const attrs = JSON.parse(request.requestBody);
        
        const newCandidate = {
          ...attrs,
          createdAt: new Date().toISOString(),
        };
        
        const id = await dbHelpers.addCandidate(newCandidate);
        
        // Add initial timeline entry
        await dbHelpers.addTimelineEntry({
          candidateId: id,
          fromStage: null,
          toStage: newCandidate.stage || 'applied',
          timestamp: new Date().toISOString(),
          notes: 'Application received',
        });
        
        const candidate = await dbHelpers.getCandidate(id);
        return new Response(201, {}, candidate);
      });

      this.patch('/candidates/:id', async (schema, request) => {
        await delay();
        
        if (shouldFail()) {
          return new Response(500, {}, { error: 'Failed to update candidate' });
        }
        
        const id = parseInt(request.params.id);
        const updates = JSON.parse(request.requestBody);
        const oldCandidate = await dbHelpers.getCandidate(id);
        
        // If stage changed, add timeline entry
        if (updates.stage && updates.stage !== oldCandidate.stage) {
          await dbHelpers.addTimelineEntry({
            candidateId: id,
            fromStage: oldCandidate.stage,
            toStage: updates.stage,
            timestamp: new Date().toISOString(),
            notes: updates.notes || `Moved to ${updates.stage}`,
          });
        }
        
        await dbHelpers.updateCandidate(id, updates);
        const candidate = await dbHelpers.getCandidate(id);
        
        return candidate;
      });

      // Assessments endpoints
      this.get('/assessments/:jobId', async (schema, request) => {
        await delay();
        
        const jobId = parseInt(request.params.jobId);
        const assessment = await dbHelpers.getAssessment(jobId);
        
        if (!assessment) {
          return new Response(404, {}, { error: 'Assessment not found' });
        }
        
        return assessment;
      });

      this.put('/assessments/:jobId', async (schema, request) => {
        await delay();
        
        if (shouldFail()) {
          return new Response(500, {}, { error: 'Failed to save assessment' });
        }
        
        const jobId = parseInt(request.params.jobId);
        const data = JSON.parse(request.requestBody);
        
        const assessment = {
          jobId,
          sections: data.sections,
          updatedAt: new Date().toISOString(),
        };
        
        await dbHelpers.saveAssessment(assessment);
        const saved = await dbHelpers.getAssessment(jobId);
        
        return saved;
      });

      this.post('/assessments/:jobId/submit', async (schema, request) => {
        await delay();
        
        if (shouldFail()) {
          return new Response(500, {}, { error: 'Failed to submit assessment' });
        }
        
        const jobId = parseInt(request.params.jobId);
        const data = JSON.parse(request.requestBody);
        
        const response = {
          candidateId: data.candidateId,
          jobId,
          responses: data.responses,
          submittedAt: new Date().toISOString(),
        };
        
        await dbHelpers.saveAssessmentResponse(response);
        
        return { success: true, submittedAt: response.submittedAt };
      });

      this.get('/assessments/:jobId/responses/:candidateId', async (schema, request) => {
        await delay();
        
        const jobId = parseInt(request.params.jobId);
        const candidateId = parseInt(request.params.candidateId);
        
        const response = await dbHelpers.getAssessmentResponse(candidateId, jobId);
        
        if (!response) {
          return new Response(404, {}, { error: 'Response not found' });
        }
        
        return response;
      });

      // Passthrough for any other requests
      this.passthrough();
    },
  });
}

