import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createJob, updateJob, fetchJobs } from './jobsSlice';
import { closeJobFormModal, showToast } from '../../app/uiSlice';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';

const tagOptions = ['Remote', 'Hybrid', 'On-site', 'Full-time', 'Part-time', 'Contract', 'Urgent', 'Senior', 'Junior', 'Mid-level'];

export default function JobFormModal() {
  const dispatch = useDispatch();
  const { modals } = useSelector((state) => state.ui);
  const { items } = useSelector((state) => state.jobs);
  const isOpen = modals.jobForm.isOpen;
  const jobId = modals.jobForm.jobId;
  const isEditing = jobId !== null;

  const existingJob = isEditing ? items.find(j => j.id === jobId) : null;

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    status: 'active',
    tags: [],
    expirationDate: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && existingJob) {
      setFormData({
        title: existingJob.title,
        slug: existingJob.slug,
        description: existingJob.description || '',
        status: existingJob.status,
        tags: existingJob.tags || [],
        expirationDate: existingJob.expirationDate ? existingJob.expirationDate.split('T')[0] : '',
      });
    } else if (isOpen) {
      setFormData({
        title: '',
        slug: '',
        description: '',
        status: 'active',
        tags: [],
        expirationDate: '',
      });
    }
    setErrors({});
  }, [isOpen, existingJob]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else {
      // Check for duplicate slug
      const duplicateSlug = items.find(
        j => j.slug === formData.slug && j.id !== jobId
      );
      if (duplicateSlug) {
        newErrors.slug = 'This slug is already in use';
      }
    }

    if (formData.expirationDate) {
      const expDate = new Date(formData.expirationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expDate < today) {
        newErrors.expirationDate = 'Expiration date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);

    try {
      const jobData = {
        ...formData,
        expirationDate: formData.expirationDate 
          ? new Date(formData.expirationDate).toISOString()
          : null,
      };

      if (isEditing) {
        await dispatch(updateJob({ id: jobId, updates: jobData })).unwrap();
        dispatch(showToast({
          type: 'success',
          message: 'Job updated successfully',
        }));
      } else {
        // Add order based on current jobs count
        jobData.order = items.length;
        await dispatch(createJob(jobData)).unwrap();
        dispatch(showToast({
          type: 'success',
          message: 'Job created successfully',
        }));
      }

      dispatch(closeJobFormModal());
      
      // Refresh jobs list
      dispatch(fetchJobs({}));
    } catch (error) {
      dispatch(showToast({
        type: 'error',
        message: error.message || 'Failed to save job',
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => dispatch(closeJobFormModal())}
      title={isEditing ? 'Edit Job' : 'Create New Job'}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Job Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required
          placeholder="e.g., Senior Frontend Developer"
        />

        <Input
          label="Slug"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          error={errors.slug}
          required
          helperText="URL-friendly identifier for the job"
          placeholder="e.g., senior-frontend-developer"
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder="Describe the job role and requirements..."
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'archived', label: 'Archived' },
          ]}
        />

        <Input
          label="Expiration Date"
          name="expirationDate"
          type="date"
          value={formData.expirationDate}
          onChange={handleChange}
          error={errors.expirationDate}
          helperText="Job will auto-archive after this date"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {tagOptions.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  formData.tags.includes(tag)
                    ? 'bg-primary-100 text-primary-800 border-2 border-primary-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => dispatch(closeJobFormModal())}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={submitting}
            disabled={submitting}
          >
            {isEditing ? 'Update Job' : 'Create Job'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

