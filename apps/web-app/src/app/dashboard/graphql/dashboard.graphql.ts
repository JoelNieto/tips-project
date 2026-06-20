import { gql } from 'apollo-angular';

export const DASHBOARD_SUMMARY_QUERY = gql`
  query DashboardSummary {
    dashboardSummary {
      companiesRegistered
      numberOfSurveys
      numberOfQuestions
      numberOfSurveyAssignations
      activeSurveyWindows {
        id
        surveyId
        surveyTitle
        companyName
        startDate
        expirationDate
        inviteeCount
      }
    }
  }
`;
