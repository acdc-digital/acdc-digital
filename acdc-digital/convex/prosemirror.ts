// convex/prosemirror.ts
import { ProsemirrorSync } from "@convex-dev/prosemirror-sync";
import { components } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Use documents table ID for collaboration
const prosemirrorSync = new ProsemirrorSync<Id<"documents">>(components.prosemirrorSync);

export const {
  getSnapshot,
  submitSnapshot,
  latestVersion,
  getSteps,
  submitSteps,
} = prosemirrorSync.syncApi({
  checkRead(_ctx, _id) {
    // TODO: Add user authentication and permission checks
    // const user = await getUserFromAuth(ctx);
    // For now, allow all reads - we'll implement auth later
    return Promise.resolve();
  },
  checkWrite(_ctx, _id) {
    // TODO: Add user authentication and permission checks  
    // const user = await getUserFromAuth(ctx);
    // For now, allow all writes - we'll implement auth later
    return Promise.resolve();
  },
  async onSnapshot(ctx, id, snapshot, version) {
    // Store a text version for search indexing
    try {
      // For now, just log the snapshot - we'll implement text extraction later
      console.log(`Document ${id} snapshot saved at version ${version}`);
      
      // TODO: Extract text content from snapshot and update search index
      // const textContent = extractTextFromSnapshot(snapshot);
      // await ctx.db.patch(id, { searchableText: textContent, lastVersion: version });
    } catch (error) {
      console.error("Error processing snapshot:", error);
    }
  },
});

// Export the sync instance for server-side document creation
export { prosemirrorSync };