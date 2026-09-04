export interface RubricCriterion {
  id?: string;
  description: string;
  max_marks: number;
  keywords: string[];
  order?: number;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  question: string;
  total_marks: number;
  created_at: string;
  rubric_criteria: RubricCriterion[];
}

export interface Evidence {
  sentence_id: number;
  text: string;
  similarity: number;
  entailment: number;
  contradiction: number;
  status: string;
}

export interface CriterionEvaluation {
  id: string;
  criterion_id: string;
  description: string;
  max_marks: number;
  awarded_marks: number;
  semantic_score: number;
  entailment_score: number;
  contradiction_probability: number;
  lexical_score: number;
  status: 'ENTAILED' | 'PARTIAL' | 'CONTRADICTED' | 'UNSUPPORTED';
  evidence?: Evidence | null;
  missing_concepts: string[];
  keyword_stuffing_detected: boolean;
  feedback: string;
  override_score?: number | null;
  override_reason?: string | null;
}

export interface SentenceStruct {
  sentence_id: number;
  text: string;
  tokens: string[];
}

export interface EvaluationResultData {
  evaluation_id: string;
  submission_id: string;
  assignment_id: string;
  assignment_title: string;
  question: string;
  student_id: string;
  student_answer: string;
  total_score: number;
  final_score: number;
  max_score: number;
  percentage: number;
  processing_time: number;
  sentences: SentenceStruct[];
  criteria: CriterionEvaluation[];
  diagnostic_summary: string;
  created_at: string;
}
