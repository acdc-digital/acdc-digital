# React Flow Integration - Testing & Validation Guide

## Manual Testing Checklist

### Pre-requisites
- [ ] SMNB application running locally (`npm run dev`)
- [ ] Convex backend connected and running
- [ ] Reddit data populated in database (or fallback keywords available)

### Test Scenarios

#### 1. View Toggle Functionality
**Test**: Switch between Columns and Flow views
- [ ] Navigate to Dashboard → Studio → Generator
- [ ] Verify "Columns" button is active by default
- [ ] Click "Flow View" button
- [ ] Verify view switches to React Flow canvas
- [ ] Click "Columns" button again
- [ ] Verify view switches back to column layout
- [ ] Confirm no data loss when switching views

**Expected Result**: Smooth transition between views with state preserved

#### 2. Flow View Rendering
**Test**: Verify React Flow renders correctly
- [ ] Switch to Flow View
- [ ] Verify keyword nodes are visible and arranged in a grid
- [ ] Verify column nodes are visible below keywords
- [ ] Verify all nodes have proper styling (colors, borders, icons)
- [ ] Verify background dots pattern is visible
- [ ] Verify controls panel is visible (zoom buttons)
- [ ] Verify minimap is visible in bottom-right corner

**Expected Result**: Clean, organized flow graph with all components visible

#### 3. Keyword Node Display
**Test**: Verify keyword nodes show correct information
- [ ] Examine keyword nodes in flow view
- [ ] Verify each node shows:
  - [ ] Trend icon (🌱 🔥 📈 etc.)
  - [ ] Keyword text with # symbol
  - [ ] Count number
  - [ ] Category
  - [ ] Engagement metric (if available)
  - [ ] Trending indicator (if applicable)
- [ ] Verify tier-based color coding (elite=purple, excel=blue, etc.)

**Expected Result**: All keyword metadata displayed accurately

#### 4. Node Interaction - Dragging
**Test**: Verify nodes can be repositioned
- [ ] Click and hold on a keyword node
- [ ] Drag node to a new position
- [ ] Release mouse
- [ ] Verify node stays in new position
- [ ] Repeat with column nodes

**Expected Result**: Nodes are draggable and stay where placed

#### 5. Edge Connections
**Test**: Connect keywords to columns
- [ ] Hover over a keyword node
- [ ] Locate connection handle (small circle on node edge)
- [ ] Click and drag from keyword node handle
- [ ] Drag to a column node
- [ ] Release to create connection
- [ ] Verify animated edge appears between nodes
- [ ] Verify edge has correct styling (color, animation)

**Expected Result**: Edge created with animation, keyword added to column

#### 6. Column Node Functionality
**Test**: Verify column nodes work correctly
- [ ] Check column nodes show correct title
- [ ] Verify item count updates when keywords are connected
- [ ] Click "Generate" button on a column with keywords
- [ ] Verify button is disabled when column is empty
- [ ] Verify button shows loading state when generating

**Expected Result**: Column nodes reflect accurate state and trigger generation

#### 7. Controls Functionality
**Test**: Verify zoom and pan controls
- [ ] Click zoom in button (+)
- [ ] Verify canvas zooms in
- [ ] Click zoom out button (-)
- [ ] Verify canvas zooms out
- [ ] Click fit view button
- [ ] Verify all nodes are centered and scaled to fit
- [ ] Use mouse wheel to zoom
- [ ] Click and drag background to pan

**Expected Result**: All zoom and pan controls work smoothly

#### 8. MiniMap Functionality
**Test**: Verify minimap navigation
- [ ] Locate minimap in bottom-right corner
- [ ] Verify it shows overview of entire graph
- [ ] Verify current viewport is highlighted
- [ ] Click on different areas of minimap
- [ ] Verify canvas pans to that location

**Expected Result**: MiniMap provides accurate overview and navigation

#### 9. Data Synchronization
**Test**: Verify changes in flow view sync with columns view
- [ ] In flow view, connect keyword to a column
- [ ] Switch to columns view
- [ ] Verify keyword appears in the correct column
- [ ] Switch back to flow view
- [ ] Verify edge is still present
- [ ] In columns view, remove a keyword from column
- [ ] Switch to flow view
- [ ] Verify edge is removed

**Expected Result**: Perfect synchronization between views

#### 10. Performance Testing
**Test**: Verify performance with many keywords
- [ ] Load flow view with maximum keywords (50)
- [ ] Verify smooth rendering (no lag)
- [ ] Pan and zoom rapidly
- [ ] Verify no stuttering or frame drops
- [ ] Create multiple connections
- [ ] Verify edges animate smoothly

**Expected Result**: Smooth performance even with many nodes

#### 11. Edge Cases
**Test**: Handle unusual scenarios
- [ ] Try to connect a keyword that's already in the column
- [ ] Verify duplicate connection is not created
- [ ] Try to connect keyword to keyword (should not work)
- [ ] Try to connect column to column (should not work)
- [ ] Resize browser window
- [ ] Verify flow view adapts to new size

**Expected Result**: Graceful handling of edge cases

#### 12. Dark Theme Consistency
**Test**: Verify dark theme styling
- [ ] Verify background is dark (#1a1a1a)
- [ ] Verify text is light and readable
- [ ] Verify controls have dark styling
- [ ] Verify minimap has dark theme
- [ ] Verify edges are visible against dark background
- [ ] Verify all colors match SMNB design system

**Expected Result**: Consistent dark theme throughout

### Visual Inspection Checklist

#### UI Elements
- [ ] Toggle buttons have clear labels and icons
- [ ] Active view button is highlighted
- [ ] Inactive view button has outline style
- [ ] Helper text updates based on view mode
- [ ] All icons render correctly (Hash, GitBranch, LayoutGrid, etc.)

#### Spacing & Layout
- [ ] Adequate spacing between nodes
- [ ] Nodes don't overlap initially
- [ ] Controls panel doesn't overlap nodes
- [ ] MiniMap doesn't overlap important content
- [ ] Panel in top-left provides clear context

#### Accessibility
- [ ] Buttons have appropriate hover states
- [ ] Node colors have sufficient contrast
- [ ] Text is readable at default zoom level
- [ ] Interactive elements have visible focus states

### Browser Testing
Test in multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Edge

### Responsive Testing
Test at different viewport sizes:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet landscape (1024x768)
- [ ] Large displays (2560x1440)

## Known Limitations

1. **Connection Validation**: Currently allows any source-to-target connection attempt
2. **Layout Persistence**: Node positions are not saved between sessions
3. **Mobile Support**: Flow view is optimized for desktop; mobile experience may vary
4. **Large Datasets**: Performance may degrade with >100 nodes

## Bug Reporting Template

If issues are found during testing, document them as:

```
**Issue**: [Brief description]
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**: [What should happen]
**Actual Behavior**: [What actually happens]
**Browser**: [Browser and version]
**Screenshot**: [If applicable]
```

## Success Criteria

All items in the checklist should pass before considering the feature ready for production:
- ✅ All core functionality works as expected
- ✅ No console errors or warnings
- ✅ Performance is acceptable (no noticeable lag)
- ✅ Visual design matches SMNB theme
- ✅ Data synchronization is reliable
- ✅ Edge cases are handled gracefully
- ✅ Works across supported browsers
- ✅ Responsive at common viewport sizes

## Next Steps After Testing

1. Document any issues found
2. Create tickets for bugs/improvements
3. Gather user feedback
4. Iterate on UX based on feedback
5. Consider additional features:
   - Save/load custom layouts
   - Export flow as image
   - Keyboard shortcuts
   - Advanced filtering
   - Auto-layout algorithms
