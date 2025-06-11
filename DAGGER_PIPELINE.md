# SocialScope Dagger Pipeline

This document describes the new Dagger-based CI/CD pipeline for the SocialScope Elixir Phoenix application.

## Overview

The pipeline has been completely rewritten to use [Dagger](https://dagger.io/) best practices, providing:

- **Reproducible builds** across local and CI environments
- **Optimized caching** for dependencies and build artifacts
- **Modular functions** that can be composed and reused
- **Type-safe pipeline definitions** with TypeScript
- **Local development support** with hot reloading

## Available Functions

### Development Functions

- `dagger call dev-server up --ports=4000:4000` - Start development server with hot reloading
- `dagger call shell` - Open interactive shell in development environment
- `dagger call dev-env` - Get development environment container for debugging

### Testing & Quality Functions

- `dagger call test` - Run all tests
- `dagger call format-check` - Check code formatting
- `dagger call credo` - Run Credo static analysis
- `dagger call lint` - Run all linting checks (format + credo)
- `dagger call health-check` - Verify application can start

### Build Functions

- `dagger call compile` - Compile the application (dev environment)
- `dagger call compile --mix-env=prod` - Compile for production
- `dagger call with-elixir-deps` - Install Elixir dependencies with caching
- `dagger call with-assets` - Build assets with Node.js dependencies
- `dagger call release` - Build production release
- `dagger call build-image` - Build production Docker image

### CI/CD Functions

- `dagger call ci` - Run complete CI pipeline (lint + test + build)
- `dagger call publish` - Build and publish container image
- `dagger call publish --registry=your-registry.com/app` - Publish to specific registry

## Local Development

### Quick Start

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Check code quality
npm run lint

# Build for production
npm run release
```

### Advanced Usage

```bash
# Get an interactive shell for debugging
dagger call shell

# Run specific test files
dagger call dev-env terminal --cmd="mix test test/specific_test.exs"

# Check application health
dagger call health-check
```

## CI/CD Integration

### GitHub Actions

The pipeline automatically runs on:
- Push to `main` or `develop` branches
- Pull requests to `main`

The workflow includes:
1. **CI Pipeline**: Linting, testing, and building
2. **Image Publishing**: Building and publishing container images
3. **Deployment**: Deploying to Fly.io (on main branch)

### Local CI Testing

Test the complete CI pipeline locally:

```bash
dagger call ci
```

This runs the same checks that will run in CI.

## Caching Strategy

The pipeline uses optimized caching for:

- **Hex packages**: Elixir package manager cache
- **Rebar3**: Erlang build tool cache
- **Dependencies**: Mix dependencies cache
- **Node modules**: NPM dependencies cache
- **Build artifacts**: Compiled code cache

This significantly speeds up subsequent builds.

## Migration from Old Pipeline

### What Changed

1. **Removed**: `pipeline.ts` script-based approach
2. **Added**: Proper Dagger module with individual functions
3. **Improved**: Caching strategy and error handling
4. **Simplified**: GitHub Actions workflow
5. **Enhanced**: Local development experience

### Breaking Changes

- Old npm scripts have been updated to use Dagger functions
- CI environment variables may need updating
- Docker builds now use multi-stage approach

### Migration Steps

1. Update your local development workflow to use new npm scripts
2. Test the pipeline locally with `dagger call ci`
3. Update any custom CI scripts to use new Dagger functions
4. Configure Dagger Cloud token if using cloud features

## Troubleshooting

### Common Issues

**Module loading errors**: Ensure you're in the project root directory

**Permission errors**: Make sure Docker is running and accessible

**Cache issues**: Clear Dagger cache with `dagger cache prune`

**Function not found**: Run `dagger functions` to see available functions

### Getting Help

- Check function documentation: `dagger call <function-name> --help`
- View function source: `.dagger/src/index.ts`
- Dagger documentation: https://docs.dagger.io/

## Performance

The new pipeline provides significant performance improvements:

- **First run**: ~5-10 minutes (downloading dependencies)
- **Subsequent runs**: ~1-3 minutes (with caching)
- **Local development**: Near-instant rebuilds with hot reloading
- **CI runs**: ~3-5 minutes (with cloud caching)

## Security

- All builds run in isolated containers
- No secrets are stored in the pipeline code
- Registry credentials managed through CI environment variables
- Dagger Cloud provides audit logs and access controls
