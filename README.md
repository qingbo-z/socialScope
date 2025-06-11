# SocialScope

A Phoenix LiveView application for visualizing social media ripple effects, built with modern CI/CD practices using Dagger.

## 🚀 Quick Start

### Development with Dagger (Recommended)

```bash
# Start development server with hot reloading
npm run dev

# Run tests
npm run test

# Check code quality
npm run lint

# Run complete CI pipeline
npm run ci
```

### Prerequisites

- [Dagger CLI](https://docs.dagger.io/install) (optional - npm scripts work without it)
- Node.js 18+ (for npm scripts only)

## Getting Started

To start your Phoenix server:

  * Run `mix setup` to install and setup dependencies
  * Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

## 🏗️ Dagger Pipeline

This project uses [Dagger](https://dagger.io/) for reproducible CI/CD pipelines that work identically in local and CI environments.

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reloading |
| `npm run test` | Run all tests |
| `npm run format` | Check code formatting |
| `npm run credo` | Run Credo static analysis |
| `npm run lint` | Run all linting checks (format + credo) |
| `npm run compile` | Compile the application |
| `npm run release` | Build production release |
| `npm run build` | Build production Docker image |
| `npm run publish` | Build and publish container image |
| `npm run ci` | Run complete CI pipeline |
| `npm run shell` | Interactive development shell |
| `npm run health` | Application health check |

### Pipeline Features

- ✅ **Reproducible builds** across local and CI environments
- ✅ **Optimized caching** for dependencies and build artifacts
- ✅ **Type-safe pipeline definitions** with TypeScript
- ✅ **Local development support** with hot reloading
- ✅ **Automated testing and quality checks**

See [DAGGER_PIPELINE.md](./DAGGER_PIPELINE.md) for detailed documentation.

### CI/CD

The GitHub Action workflow automatically:
- Runs linting, tests, and builds on every push and pull request
- Deploys to Fly.io on pushes to the main branch

### Deployment

To deploy to Fly.io:
1. Set up your Fly.io app: `flyctl apps create ripple-graph`
2. Add your `FLY_API_TOKEN` to GitHub repository secrets
3. Push to the main branch

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

## Tidewave Phoenix Integration

This application integrates with Tidewave Phoenix to enable agent-based conversational UIs.
See https://github.com/tidewave-ai/tidewave_phoenix for setup and usage.

## Learn more

  * Official website: https://www.phoenixframework.org/
  * Guides: https://hexdocs.pm/phoenix/overview.html
  * Docs: https://hexdocs.pm/phoenix
  * Forum: https://elixirforum.com/c/phoenix-forum
  * Source: https://github.com/phoenixframework/phoenix
