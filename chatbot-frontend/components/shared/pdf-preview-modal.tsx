"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PdfPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string;
  title?: string;
}

export function PdfPreviewModal({
  open,
  onOpenChange,
  pdfUrl,
  title,
}: PdfPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="
    h-[95vh]
    w-[95vw]
    max-w-[95vw]
    rounded-2xl
    border-0
    bg-black/80
    p-0
    backdrop-blur-md
  "
      >
        {/* Accessibility */}
        <DialogTitle className="hidden">PDF Preview</DialogTitle>

        <div className="flex h-full flex-col overflow-hidden rounded-2xl">
          {/* Topbar */}
          <div
            className="
              flex h-16 items-center
              justify-between border-b
              border-white/10
              bg-black/40 px-6
              backdrop-blur-xl
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-xl bg-red-500/10
                "
              >
                <span className="text-sm font-bold text-red-500">PDF</span>
              </div>

              <div>
                <h2 className="text-sm font-medium text-white">
                  {title || "Document Preview"}
                </h2>

                <p className="text-xs text-zinc-400">Preview mode</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="
                rounded-xl
                text-zinc-400
                hover:bg-white/10
                hover:text-white
              "
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* PDF */}
          {pdfUrl ? (
            <iframe src={pdfUrl} className="h-full w-full border-0" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-zinc-500">No preview available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
