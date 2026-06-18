"use client";

import { FC, useState } from "react";
import { Eye, FileText } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

import { DocumentResponse, DocumentStatus } from "@/types/document.types";
import { PdfPreviewModal } from "../shared/pdf-preview-modal";
import { useDocumentStatus } from "@/services/document/document.query";

const stageVariant = (stage: string) => {
  switch (stage) {
    case DocumentStatus.COMPLETED:
      return "bg-green-500/10 text-green-500 border-green-500/20";

    case DocumentStatus.FAILED:
      return "bg-red-500/10 text-red-500 border-red-500/20";

    default:
      return "bg-primary/10 text-primary border-primary/20";
  }
};

const stageLabel = (stage: string) => {
  switch (stage) {
    case DocumentStatus.PROCESSING:
      return "Processing";

    case DocumentStatus.COMPLETED:
      return "Ready";

    case DocumentStatus.FAILED:
      return "Failed";

    default:
      return stage;
  }
};

const DocumentCard: FC<DocumentResponse> = ({
  document_name,
  document_stage,
  document_completion_rate,
  document_url,
  document_id,
}) => {
  const [open, setOpen] = useState(false);

  const { data } = useDocumentStatus(document_id, document_stage);

  const currentStage = data?.data?.document_stage ?? document_stage;

  const currentProgress =
    data?.data?.document_completion_rate ?? document_completion_rate;

  return (
    <>
      <PdfPreviewModal
        open={open}
        onOpenChange={setOpen}
        pdfUrl={document_url}
        title={document_name}
      />

      <Card
        className="
          group
          cursor-pointer
          border-border/60
          bg-card/70
          backdrop-blur-sm
          p-3
          my-2
          transition-all
          hover:border-primary/30
          hover:shadow-md
          hover:-translate-y-0.5
        "
      >
        <div className="flex items-start gap-3">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-primary/10
              text-primary
            "
          >
            <FileText className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h4
                className="
                  truncate
                  text-sm
                  font-medium
                  text-foreground
                  max-w-42.5
                "
                title={document_name}
              >
                {document_name}
              </h4>

              <Badge variant="outline" className={stageVariant(currentStage)}>
                {stageLabel(currentStage)}
              </Badge>
            </div>

            <div className="mt-3 space-y-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{stageLabel(currentStage)}</span>
                <span>{currentProgress}%</span>
              </div>

              <Progress value={currentProgress} className="h-2" />

              {currentStage !== DocumentStatus.COMPLETED &&
                currentStage !== DocumentStatus.FAILED && (
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    Processing...
                  </div>
                )}

              {currentStage === DocumentStatus.COMPLETED && (
                <div className="flex items-center gap-2 text-xs text-green-500">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Ready for search
                </div>
              )}

              {currentStage === DocumentStatus.FAILED && (
                <div className="flex items-center gap-2 text-xs text-red-500">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  Processing failed
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(true);
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default DocumentCard;
