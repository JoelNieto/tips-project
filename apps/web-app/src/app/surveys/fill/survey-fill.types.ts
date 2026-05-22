export interface FillAnswerOption {
  id: string;
  text: string;
  sortOrder: number | null;
  value: number;
  reverseValue: number | null;
}

export interface FillAnswerOverride {
  id: string;
  valueOverride?: number | null;
  reverseValueOverride?: number | null;
  orderOverride?: number | null;
  answer: FillAnswerOption;
}

export interface FillBankQuestion {
  id: string;
  title: string;
  text: string;
  weight?: number | null;
  isReversed: boolean;
  isMultiAnswer: boolean;
  answers: FillAnswerOption[];
}

export interface FillDimensionQuestion {
  id: string;
  order?: number | null;
  weightOverride?: number | null;
  isReversedOverride?: boolean | null;
  isMultiAnswerOverride?: boolean | null;
  answerOverrides?: FillAnswerOverride[];
  question: FillBankQuestion;
}

export interface FillMainQuestionAnswer {
  id: string;
  text: string;
  sortOrder?: number | null;
  value: number;
  reverseValue?: number | null;
}

export interface FillDimension {
  id: string;
  title: string;
  description?: string | null;
  mainQuestionText?: string | null;
  order?: number | null;
  mainQuestionAnswers: FillMainQuestionAnswer[];
  dimensionQuestions: FillDimensionQuestion[];
  subdimensions?: FillDimension[];
}

export interface FillSurveyType {
  id: string;
  name: string;
  hasCategories: boolean;
  hasSubcategories: boolean;
  categoryName?: string | null;
  subcategoryName?: string | null;
  visibleCategories: boolean;
  visibleSubcategories: boolean;
  randomizeQuestions: boolean;
}

export interface SurveyFillData {
  id: string;
  title: string;
  description?: string | null;
  surveyType: FillSurveyType;
  dimensions: FillDimension[];
}
