# MCP Knowledge Base Setup

## Overview

This directory contains comprehensive documentation for the SvelteKit 5 AI-Compatible Boilerplate, optimized for access via Model Context Protocol (MCP).

## Structure

```
mcp/frontend/
├── overview/           # Project overview and getting started
├── guides/             # Comprehensive guides (agentic dev, testing, config, deployment)
├── api/                # API reference documentation
└── sveltekit/          # SvelteKit-specific documentation
    ├── services/       # 14 service documentation files
    ├── utils/          # 21 utility documentation files
    ├── stores/         # 17 store documentation files
    └── components/     # 8 component category files
```

## Statistics

- **Total Documentation Files**: 78
- **Services**: 14
- **Utilities**: 21
- **Stores**: 17
- **Components**: 81+ documented
- **Test Suite**: 871 tests

## MCP Configuration

**URL**: `https://xbg.solutions/boilerplates/mcp-config.json`

### Available Tools

1. **get_project_overview** - Project overview, getting started, guides
2. **get_sveltekit_architecture** - Complete SvelteKit architecture
3. **get_service_docs** - Service-specific documentation
4. **get_utility_docs** - Utility-specific documentation
5. **get_store_docs** - Store-specific documentation
6. **get_component_docs** - Component category documentation
7. **get_api_reference** - API and TypeScript interfaces
8. **search_documentation** - Search across all docs

### Usage Example

```typescript
// In your AI agent code
import { MCPClient } from '@modelcontextprotocol/sdk';

const client = new MCPClient('https://xbg.solutions/boilerplates/mcp-config.json');

// Query auth service documentation
const authDocs = await client.callTool('get_service_docs', {
  service: 'auth'
});

// Search for error handling patterns
const errorDocs = await client.callTool('search_documentation', {
  query: 'error handling',
  category: 'utilities'
});
```

## Deployment

To deploy this MCP knowledge base:

1. **Copy to Server**:
   ```bash
   # Copy mcp/ directory to your web server
   scp -r mcp/ user@xbg.solutions:/path/to/boilerplates/
   ```

2. **Static Hosting**:
   - All files are static markdown
   - No build process required
   - Can be served directly via Nginx, Apache, or CDN
   - MCP server reads files from filesystem or HTTP

3. **Update MCP Config URL**:
   - Ensure `mcp-config.json` is accessible at:
   - `https://xbg.solutions/boilerplates/mcp-config.json`

4. **CORS Configuration** (if serving via HTTP):
   ```nginx
   location /boilerplates/ {
       add_header Access-Control-Allow-Origin *;
       add_header Access-Control-Allow-Methods "GET, OPTIONS";
   }
   ```

## Documentation Principles

All documentation follows these principles:

1. **WHAT and HOW Focus**: Explains what each component does and how to use it
2. **Concise but Complete**: Detailed enough to be useful, not so detailed it requires constant updates
3. **Agent-Optimized**: Decision trees, quick reference tables, practical examples
4. **Code-First**: Extensive usage examples for every concept
5. **Integration-Aware**: Shows how pieces work together

## Maintenance

When updating the codebase:

- **Add new services/utils/stores**: Create corresponding .md file in appropriate directory
- **Update existing docs**: Focus on API changes, not implementation details
- **Keep examples current**: Update code examples when patterns change
- **Maintain MCP config**: Add new files to mcp-config.json tools section

## Related Documentation

- **Main README**: `/README.md` - Project overview
- **Agentic Dev Guide**: `/guides/agentic-development.md` - For AI agents
- **Testing Guide**: `/guides/testing.md` - Testing philosophy
- **Backend Integration**: https://github.com/xbg-solutions/boilerplate_backend

---

**Built for agentic development by [XBG Solutions](https://xbg.solutions)**
