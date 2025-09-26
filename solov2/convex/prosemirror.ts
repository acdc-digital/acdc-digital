// convex/prosemirror.ts
import { ProsemirrorSync } from "@convex-dev/prosemirror-sync";
import { components } from "./_generated/api";

const prosemirrorSync = new ProsemirrorSync(components.prosemirrorSync);

export const {
  getSnapshot,
  submitSnapshot,
  latestVersion,
  getSteps,
  submitSteps,
} = prosemirrorSync.syncApi({
  checkRead(ctx, id) {
    // TODO: Add authentication checks
    // const user = await userFromAuth(ctx);
    // ...validate that the user can read this document
  },
  checkWrite(ctx, id) {
    // TODO: Add authentication checks  
    // const user = await userFromAuth(ctx);
    // ...validate that the user can write to this document
  },
  onSnapshot(ctx, id, snapshot, version) {
    // TODO: Handle snapshots for search indexing, etc.
    // const schema = getSchema(extensions);
    // const node = schema.nodeFromJSON(JSON.parse(snapshot));
    // const content = node.textContent;
  },
});

export { prosemirrorSync };