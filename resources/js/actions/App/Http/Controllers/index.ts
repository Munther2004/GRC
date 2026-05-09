import CorporationRegistrationController from './CorporationRegistrationController'
import InviteAcceptController from './InviteAcceptController'
import CorporateDashboardController from './CorporateDashboardController'
import NotificationController from './NotificationController'
import DashboardController from './DashboardController'
import ExecutiveDashboardController from './ExecutiveDashboardController'
import ComplianceChatbotController from './ComplianceChatbotController'
import ReportController from './ReportController'
import ExecutiveSummaryController from './ExecutiveSummaryController'
import SecurityAuditController from './SecurityAuditController'
import GapAnalysisController from './GapAnalysisController'
import CrosswalkController from './CrosswalkController'
import ControlHubController from './ControlHubController'
import RiskController from './RiskController'
import ControlStatusRequestController from './ControlStatusRequestController'
import RiskTreatmentPlanController from './RiskTreatmentPlanController'
import RemediationTaskController from './RemediationTaskController'
import Admin from './Admin'
import AssessmentController from './AssessmentController'
import AssessmentComparisonController from './AssessmentComparisonController'
import EvidenceController from './EvidenceController'
import EvidenceCoverageController from './EvidenceCoverageController'
import AuditLogController from './AuditLogController'
import CorporationInviteController from './CorporationInviteController'
import RiskAppetiteController from './RiskAppetiteController'
import Settings from './Settings'

const Controllers = {
    CorporationRegistrationController: Object.assign(CorporationRegistrationController, CorporationRegistrationController),
    InviteAcceptController: Object.assign(InviteAcceptController, InviteAcceptController),
    CorporateDashboardController: Object.assign(CorporateDashboardController, CorporateDashboardController),
    NotificationController: Object.assign(NotificationController, NotificationController),
    DashboardController: Object.assign(DashboardController, DashboardController),
    ExecutiveDashboardController: Object.assign(ExecutiveDashboardController, ExecutiveDashboardController),
    ComplianceChatbotController: Object.assign(ComplianceChatbotController, ComplianceChatbotController),
    ReportController: Object.assign(ReportController, ReportController),
    ExecutiveSummaryController: Object.assign(ExecutiveSummaryController, ExecutiveSummaryController),
    SecurityAuditController: Object.assign(SecurityAuditController, SecurityAuditController),
    GapAnalysisController: Object.assign(GapAnalysisController, GapAnalysisController),
    CrosswalkController: Object.assign(CrosswalkController, CrosswalkController),
    ControlHubController: Object.assign(ControlHubController, ControlHubController),
    RiskController: Object.assign(RiskController, RiskController),
    ControlStatusRequestController: Object.assign(ControlStatusRequestController, ControlStatusRequestController),
    RiskTreatmentPlanController: Object.assign(RiskTreatmentPlanController, RiskTreatmentPlanController),
    RemediationTaskController: Object.assign(RemediationTaskController, RemediationTaskController),
    Admin: Object.assign(Admin, Admin),
    AssessmentController: Object.assign(AssessmentController, AssessmentController),
    AssessmentComparisonController: Object.assign(AssessmentComparisonController, AssessmentComparisonController),
    EvidenceController: Object.assign(EvidenceController, EvidenceController),
    EvidenceCoverageController: Object.assign(EvidenceCoverageController, EvidenceCoverageController),
    AuditLogController: Object.assign(AuditLogController, AuditLogController),
    CorporationInviteController: Object.assign(CorporationInviteController, CorporationInviteController),
    RiskAppetiteController: Object.assign(RiskAppetiteController, RiskAppetiteController),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers