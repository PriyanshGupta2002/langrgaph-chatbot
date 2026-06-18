import { DocumentResponse } from "@/types/document.types";
import React, { FC } from "react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "../ui/sidebar";
import Upload from "../shared/Upload";
import DocumentCard from "./document-card";

interface DocumentListProps {
  documents: DocumentResponse[];
}
const DocumentList: FC<DocumentListProps> = ({ documents }) => {
  if (!documents?.length) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Your Documents</SidebarGroupLabel>
        <div className="px-3 py-2 space-y-3 text-sm text-muted-foreground">
          <div>No Documents. Upload Now</div>
          <Upload />
        </div>
      </SidebarGroup>
    );
  }
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Your Documents</SidebarGroupLabel>

      <Upload />
      <SidebarMenu className="mt-3">
        {documents.map((document) => (
          <SidebarMenuItem key={document.document_id}>
            <DocumentCard {...document} />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default DocumentList;
