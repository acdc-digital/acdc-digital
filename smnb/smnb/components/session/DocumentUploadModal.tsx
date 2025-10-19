"use client";

import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface DocumentUploadModalProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentUploadModal({ sessionId, isOpen, onClose }: DocumentUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createDocument = useMutation(api.nexus.documents.createDocument);
  const processDocument = useAction(api.nexus.actions.processDocument.default);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name.replace(/\.[^/.]+$/, "")); // Remove extension
      setError(null);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !fileName.trim()) {
      setError("Please select a file and provide a name");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(10);

      // Step 1: Generate upload URL
      const uploadUrl = await generateUploadUrl();
      setUploadProgress(20);

      // Step 2: Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Failed to upload file");
      }

      const { storageId } = await result.json();
      setUploadProgress(50);

      // Step 3: Create document record
      const documentId = await createDocument({
        sessionId,
        name: fileName,
        fileUrl: uploadUrl, // This will be replaced with actual URL
        storageId,
        fileType: file.type,
        fileSize: file.size,
      });
      setUploadProgress(70);

      // Step 4: Trigger document processing (embeddings generation)
      await processDocument({
        documentId,
        storageId,
        fileType: file.type,
      });
      setUploadProgress(100);

      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset state
        setFile(null);
        setFileName("");
        setUploadProgress(0);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setFileName("");
      setError(null);
      setSuccess(false);
      setUploadProgress(0);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-[#191919] border border-neutral-800 rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-white">Upload Document</h2>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Select File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`flex items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
                  file
                    ? "border-cyan-400/50 bg-cyan-400/5"
                    : "border-neutral-700 hover:border-neutral-600 bg-neutral-900/50"
                } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {file ? (
                  <>
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm text-neutral-300">{file.name}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-neutral-500" />
                    <span className="text-sm text-neutral-400">
                      Click to upload PDF or TXT
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Document Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Document Name
            </label>
            <Input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              disabled={uploading}
              placeholder="Enter a name for this document"
              className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-cyan-400/50"
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Uploading...</span>
                <span className="text-cyan-400 font-mono">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-4 py-3">
              <CheckCircle2 className="w-4 h-4" />
              <span>Document uploaded successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-800 bg-neutral-900/30">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
            className="bg-transparent border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || !fileName.trim() || uploading}
            className="bg-cyan-400 hover:bg-cyan-500 text-black font-medium disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
