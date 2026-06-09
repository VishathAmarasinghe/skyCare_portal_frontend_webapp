import React from "react";
import { Drawer } from "antd";
import { SettingsCardTitle } from "../../types/types";
import AgreementTemplatesPanel from "./components/AgreementTemplatesPanel";
import PlaceholderReferencePanel from "./components/PlaceholderReferencePanel";
import EmailTemplatesPanel from "./components/EmailTemplatesPanel";
import OrganizationDetailsPanel from "./components/OrganizationDetailsPanel";
import AssignmentRulesPanel from "./components/AssignmentRulesPanel";
import ReferenceMaterialsPanel from "./components/ReferenceMaterialsPanel";

interface AgreementSettingsDrawerProps {
  open: boolean;
  title: SettingsCardTitle | null;
  onClose: () => void;
  templateId?: string | null;
  versionId?: string | null;
}

const AGREEMENT_SETTINGS: SettingsCardTitle[] = [
  "Agreement Templates",
  "Placeholder Reference",
  "Email Templates",
  "Organization Details",
  "Assignment Rules",
  "Reference Materials",
];

export const isAgreementSetting = (title: SettingsCardTitle | null): boolean =>
  title != null && AGREEMENT_SETTINGS.includes(title);

const AgreementSettingsDrawer: React.FC<AgreementSettingsDrawerProps> = ({
  open,
  title,
  onClose,
  templateId,
  versionId,
}) => {
  const renderContent = () => {
    switch (title) {
      case "Agreement Templates":
        return (
          <AgreementTemplatesPanel
            deepLinkTemplateId={templateId}
            deepLinkVersionId={versionId}
          />
        );
      case "Placeholder Reference":
        return <PlaceholderReferencePanel />;
      case "Email Templates":
        return <EmailTemplatesPanel />;
      case "Organization Details":
        return <OrganizationDetailsPanel />;
      case "Assignment Rules":
        return <AssignmentRulesPanel />;
      case "Reference Materials":
        return <ReferenceMaterialsPanel />;
      default:
        return null;
    }
  };

  return (
    <Drawer
      title={title || "Settings"}
      placement="right"
      width={Math.min(1200, window.innerWidth * 0.92)}
      onClose={onClose}
      open={open && isAgreementSetting(title)}
      destroyOnClose
    >
      {renderContent()}
    </Drawer>
  );
};

export default AgreementSettingsDrawer;
