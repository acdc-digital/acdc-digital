"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { ChatInterface } from "./chat-interface";
import SharedTextEditor from "./shared-text-editor";

export default function Artifact() {
  const sharedDocumentId = useQuery(api.sharedDocument.getSharedDocument);
  const createSharedDocument = useMutation(api.sharedDocument.getOrCreateSharedDocument);

  // Create the shared document if it doesn't exist
  useEffect(() => {
    if (sharedDocumentId === null) {
      createSharedDocument();
    }
  }, [sharedDocumentId, createSharedDocument]);

  // Loading state while document is being created
  if (sharedDocumentId === undefined || sharedDocumentId === null) {
    return (
      <div className="p-6 h-full">
        <div className="flex gap-6 h-full">
          <div className="w-[35%] bg-[#252526] border border-[#3e3e42] rounded-xl overflow-hidden">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-gray-400">Initializing shared workspace...</div>
              </div>
            </div>
          </div>
          <div className="w-[65%] bg-[#252526] border border-[#3e3e42] rounded-xl overflow-hidden">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-gray-400">Initializing shared document...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full">
      <div className="flex gap-6 h-full">
        {/* Chat Interface */}
        <div className="w-[35%] bg-[#252526] border border-[#3e3e42] rounded-xl overflow-hidden">
          <ChatInterface documentId={sharedDocumentId} />
        </div>
        
        {/* Shared Text Editor */}
        <div className="w-[65%] bg-[#252526] border border-[#3e3e42] rounded-xl overflow-hidden">
          <SharedTextEditor documentId={sharedDocumentId} />
        </div>
      </div>
    </div>
  );
}
