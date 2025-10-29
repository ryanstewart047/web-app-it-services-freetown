# GitHub Actions Troubleshooting & Fixes

## Issues Encountered & Solutions

### ❌ Issue 1: 403 Forbidden Error on Release Creation

**Error Message:**
```
⚠️ GitHub release failed with status: 403
Error: Too many retries.
```

**Root Cause:**
GitHub Actions didn't have permission to create releases in the repository.

**Solution:**
Added explicit permissions to the workflow file:

```yaml
permissions:
  contents: write
```

This gives the workflow permission to:
- ✅ Create releases
- ✅ Upload release assets
- ✅ Modify repository contents

---

### ❌ Issue 2: Missing GH_TOKEN Error

**Error Message:**
```
⨯ GitHub Personal Access Token is not set, neither programmatically, nor using env "GH_TOKEN"
```

**Root Cause:**
electron-builder was trying to auto-publish but couldn't find the GitHub token.

**Solution:**
1. Added `GH_TOKEN` environment variable to build steps:
   ```yaml
   env:
     GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

2. Disabled auto-publish in `package.json`:
   ```json
   "build": {
     "publish": null,
     ...
   }
   ```

---

### ❌ Issue 3: Pages Artifact Error (Unrelated to Desktop App)

**Error Message:**
```
tar: out: Cannot open: No such file or directory
```

**Explanation:**
This is from a different workflow (Next.js Pages deployment), not the desktop app build. The desktop app build is separate.

**Not Critical:**
This doesn't affect the desktop app release workflow.

---

## ✅ Current Status

After applying all fixes:

1. ✅ Workflow has `contents: write` permission
2. ✅ Build steps have `GH_TOKEN` environment variable
3. ✅ Auto-publish is disabled in package.json
4. ✅ Fresh v1.0.0 tag pushed

## 🎯 Next Steps

The workflow should now successfully:
1. Build Windows installers
2. Build macOS installers  
3. Build Linux installers
4. Create GitHub Release v1.0.0
5. Upload all 6 installer files

**Check progress:**
https://github.com/ryanstewart047/web-app-it-services-freetown/actions

**Expected completion:** ~10-15 minutes

---

## 📝 Lessons Learned

### For Future Releases

1. **Permissions are required**: Always add `permissions: contents: write` for release workflows
2. **Token environment**: Pass `GH_TOKEN` to electron-builder steps
3. **Disable auto-publish**: Set `"publish": null` in build config for manual control
4. **Test with tags**: Create test tags like `v0.0.1-test` before production releases

### Workflow Best Practices

✅ **DO:**
- Use `permissions:` at workflow level
- Pass secrets as environment variables
- Disable auto-publish for manual control
- Use specific action versions (@v4, @v1)

❌ **DON'T:**
- Assume default permissions are enough
- Let build tools auto-publish
- Use `@latest` for actions (use specific versions)

---

## 🔧 Quick Reference Commands

### Re-trigger the build:
```bash
git tag -d v1.0.0                    # Delete local tag
git push origin :refs/tags/v1.0.0   # Delete remote tag
git tag v1.0.0                       # Create new tag
git push origin v1.0.0              # Push tag (triggers build)
```

### Check workflow status:
```bash
gh run list --workflow=build-release.yml
gh run view <RUN_ID> --log-failed
```

### Cancel a running workflow:
```bash
gh run cancel <RUN_ID>
```

---

## 🎉 Success Criteria

The workflow succeeds when:
1. ✅ All 3 build jobs complete (Windows, Mac, Linux)
2. ✅ Release job creates GitHub Release
3. ✅ All 6 files are attached to release
4. ✅ Release is marked as "latest"
5. ✅ Download URLs work on website

**Release URL:** https://github.com/ryanstewart047/web-app-it-services-freetown/releases/tag/v1.0.0
