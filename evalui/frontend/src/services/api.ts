import axios from 'axios';
import { Assignment, EvaluationResultData } from '../types/evaluation';

const API_BASE = '/api/v1';

export const api = {
  login: async (email: string, role?: string, department?: string, batch?: string) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, role, department, batch });
    return res.data;
  },

  register: async (payload: {
    name: string;
    email: string;
    role?: string;
    department?: string;
    batch?: string;
    organization_name?: string;
  }) => {
    const res = await axios.post(`${API_BASE}/auth/register`, payload);
    return res.data;
  },


  checkHealth: async () => {

    const res = await axios.get(`${API_BASE}/health`);
    return res.data;
  },

  createAssignment: async (payload: {
    title: string;
    subject: string;
    question: string;
    total_marks: number;
    rubric_criteria: { description: string; max_marks: number; keywords: string[] }[];
  }): Promise<Assignment> => {
    const res = await axios.post(`${API_BASE}/assignments`, payload);
    return res.data;
  },

  listAssignments: async (): Promise<Assignment[]> => {
    const res = await axios.get(`${API_BASE}/assignments`);
    return res.data;
  },

  getAssignment: async (id: string): Promise<Assignment> => {
    const res = await axios.get(`${API_BASE}/assignments/${id}`);
    return res.data;
  },

  submitText: async (payload: { assignment_id: string; student_id?: string; content: string }) => {
    const res = await axios.post(`${API_BASE}/submissions/text`, payload);
    return res.data;
  },

  submitPdf: async (formData: FormData) => {
    const res = await axios.post(`${API_BASE}/submissions/pdf`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  triggerEvaluation: async (submission_id: string): Promise<EvaluationResultData> => {
    const res = await axios.post(`${API_BASE}/evaluations`, { submission_id });
    return res.data;
  },

  getEvaluation: async (id: string): Promise<EvaluationResultData> => {
    const res = await axios.get(`${API_BASE}/evaluations/${id}`);
    return res.data;
  },

  overrideScore: async (
    evaluation_id: string,
    criterion_evaluation_id: string,
    new_score: number,
    reason: string
  ): Promise<EvaluationResultData> => {
    const res = await axios.post(
      `${API_BASE}/evaluations/${evaluation_id}/override?criterion_evaluation_id=${criterion_evaluation_id}`,
      { new_score, reason }
    );
    return res.data;
  },

  getReportUrl: (evaluation_id: string) => {
    return `${API_BASE}/evaluations/${evaluation_id}/report`;
  }
};
