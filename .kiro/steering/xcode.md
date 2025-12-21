---
inclusion: always
---

# Xcode Build Instructions

Always use XcodeBuildMCP tool if you are working with iOS, iPadOS or macOS projects which require XCode.

## Build Process Guidelines

1. **Always list simulators first** before attempting to build:
   ```
   Use mcp_XcodeBuildMCP_list_sims to see available simulators
   ```

2. **Use specific simulator IDs** instead of names when building:
   - Simulator names can be ambiguous or not match exactly
   - Use the UUID from list_sims output for reliable builds
   - Example: `simulatorId: "4FA48E1C-4899-43BD-B940-199148A84A11"`

3. **Workspace vs Project files**:
   - For Capacitor projects, always use the `.xcworkspace` file
   - Path: `ios/App/App.xcworkspace`
   - Never use `.xcodeproj` for Capacitor projects

4. **Preferred build targets**:
   - Always build for iPad when possible (this project is iPad-focused)
   - Look for iPad simulators in the list_sims output first
   - Fallback to iPhone simulators if iPad not available

5. **Build command structure**:
   ```
   mcp_XcodeBuildMCP_build_sim({
     scheme: "App",
     simulatorId: "UUID_FROM_LIST_SIMS",
     workspacePath: "ios/App/App.xcworkspace"
   })
   ```

6. **Error handling**:
   - If build fails with "Unable to find device", check list_sims output
   - Use exact simulator ID from the available destinations
   - Don't use `useLatestOS: true` unless necessary

## Example Workflow

1. `mcp_XcodeBuildMCP_list_sims()` - Get available simulators
2. Pick an iPad simulator ID from the list (or iPhone as fallback)
3. `mcp_XcodeBuildMCP_build_sim()` with the specific simulator ID
4. If successful, optionally get app path and launch for testing