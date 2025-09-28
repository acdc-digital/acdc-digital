/**
 * Editor Convex Service
 * Handles persistent content operations for the editor using Convex
 */

import { ConvexReactClient } from 'convex/react';
import { api } from '../../../convex/_generated/api';

// Content type for database persistence (home content is not persisted)
export type ContentType = 'blog' | 'newsletter' | 'analysis' | 'social' | 'context';

class EditorConvexService {
  private convex: ConvexReactClient;

  constructor() {
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL environment variable is required');
    }
    this.convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);
  }

  async hasContent(storyId: string, contentType: ContentType): Promise<boolean> {
    try {
      return await this.convex.query(api.editorDocuments.hasContent, {
        storyId,
        contentType
      });
    } catch (error) {
      console.error('❌ Failed to check content existence:', error);
      return false;
    }
  }

  async getContent(storyId: string, contentType: ContentType): Promise<string | null> {
    try {
      return await this.convex.query(api.editorDocuments.getContent, {
        storyId,
        contentType
      });
    } catch (error) {
      console.error('❌ Failed to get content:', error);
      return null;
    }
  }

  async saveContent(storyId: string, contentType: ContentType, content: string): Promise<void> {
    try {
      await this.convex.mutation(api.editorDocuments.updateEditorContent, {
        storyId,
        contentType,
        content
      });
      console.log(`💾 Saved ${contentType} content for story ${storyId}`);
    } catch (error) {
      console.error('❌ Failed to save content:', error);
      throw error;
    }
  }

  async getEditorDocument(storyId: string) {
    try {
      return await this.convex.query(api.editorDocuments.getEditorDocument, {
        storyId
      });
    } catch (error) {
      console.error('❌ Failed to get editor document:', error);
      return null;
    }
  }

  async deleteEditorDocument(storyId: string): Promise<boolean> {
    try {
      return await this.convex.mutation(api.editorDocuments.deleteEditorDocument, {
        storyId
      });
    } catch (error) {
      console.error('❌ Failed to delete editor document:', error);
      return false;
    }
  }
}

// Create singleton instance
let editorConvexService: EditorConvexService | null = null;

export const getEditorConvexService = (): EditorConvexService => {
  if (!editorConvexService) {
    editorConvexService = new EditorConvexService();
  }
  return editorConvexService;
};

export { EditorConvexService };
console.log('🗄️ Editor Convex Service initialized');