import { Button } from "@/components/ui/button";

type SuccessModalProps = {
  show: boolean;
  reportId: string;
  onClose: () => void;
};

export function SuccessModal({ show, reportId, onClose }: SuccessModalProps) {
  return (
    <div className={`modal-overlay ${show ? "show" : ""}`}>
      <div className="modal">
        <div className="modal-icon">✅</div>
        <div className="modal-title">Report Submitted</div>
        <div className="modal-body">
          Your street health report has been logged and is now visible on the live map. Manila LGU has been notified.
        </div>
        <div className="report-id">{reportId}</div>
        <br />
        <Button className="modal-close" onClick={onClose}>
          View on Map
        </Button>
      </div>
    </div>
  );
}
