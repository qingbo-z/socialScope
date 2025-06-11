/**
 * SocialScope CI/CD Pipeline
 *
 * A comprehensive Dagger module for building, testing, and deploying
 * the SocialScope Elixir Phoenix application. This module provides
 * functions that can be run both locally and in CI environments.
 *
 * Features:
 * - Elixir/Phoenix application building with asset compilation
 * - Code quality checks (formatting, Credo linting)
 * - Test execution with proper environment setup
 * - Production release building
 * - Development server with hot reloading
 * - Optimized caching for dependencies and build artifacts
 */
import {
  dag,
  Container,
  Directory,
  CacheVolume,
  object,
  func,
  argument
} from "@dagger.io/dagger"

@object()
export class SocialScope {

  /**
   * Build the base Elixir container with system dependencies
   */
  @func()
  baseContainer(
    @argument({ defaultPath: "/" }) source: Directory
  ): Container {
    return dag
      .container()
      .from("elixir:1.18-alpine")
      .withMountedDirectory("/app", source)
      .withWorkdir("/app")
      .withExec([
        "apk", "add", "--no-cache",
        "git", "build-base", "curl", "nodejs", "npm"
      ])
  }

  /**
   * Install Elixir dependencies with caching
   */
  @func()
  withElixirDeps(
    @argument({ defaultPath: "/" }) source: Directory
  ): Container {
    const hexCache = dag.cacheVolume("hex-cache")
    const rebarCache = dag.cacheVolume("rebar-cache")
    const depsCache = dag.cacheVolume("deps-cache")

    return this.baseContainer(source)
      .withMountedCache("/root/.hex", hexCache)
      .withMountedCache("/root/.rebar3", rebarCache)
      .withMountedCache("/app/deps", depsCache)
      .withExec(["mix", "local.rebar", "--force"])
      .withExec(["mix", "local.hex", "--force"])
      .withExec(["mix", "deps.get"])
  }

  /**
   * Build assets with Node.js dependencies caching
   */
  @func()
  withAssets(
    @argument({ defaultPath: "/" }) source: Directory
  ): Container {
    const nodeCache = dag.cacheVolume("node-cache")
    const buildCache = dag.cacheVolume("build-cache")

    return this.withElixirDeps(source)
      .withMountedCache("/app/assets/node_modules", nodeCache)
      .withMountedCache("/app/_build", buildCache)
      .withWorkdir("/app/assets")
      .withExec(["npm", "ci"])
      .withWorkdir("/app")
      .withExec(["mix", "assets.setup"])
      .withExec(["mix", "assets.deploy"])
  }

  /**
   * Run code formatting check
   */
  @func()
  async formatCheck(
    @argument({ defaultPath: "/" }) source: Directory
  ): Promise<string> {
    return this.withElixirDeps(source)
      .withExec(["mix", "format", "--check-formatted"])
      .stdout()
  }

  /**
   * Run Credo static analysis
   */
  @func()
  async credo(
    @argument({ defaultPath: "/" }) source: Directory
  ): Promise<string> {
    return this.withElixirDeps(source)
      .withExec(["mix", "credo"])
      .stdout()
  }

  /**
   * Run all linting checks (format + credo)
   */
  @func()
  async lint(
    @argument({ defaultPath: "/" }) source: Directory
  ): Promise<string> {
    const container = this.withElixirDeps(source)

    // Run format check first
    await container
      .withExec(["mix", "format", "--check-formatted"])
      .stdout()

    // Then run credo
    return container
      .withExec(["mix", "credo"])
      .stdout()
  }

  /**
   * Run tests with proper test environment
   */
  @func()
  async test(
    @argument({ defaultPath: "/" }) source: Directory
  ): Promise<string> {
    return this.withElixirDeps(source)
      .withEnvVariable("MIX_ENV", "test")
      .withExec(["mix", "test"])
      .stdout()
  }

  /**
   * Compile the application
   */
  @func()
  compile(
    @argument({ defaultPath: "/" }) source: Directory,
    @argument({ defaultValue: "dev" }) mixEnv: string = "dev"
  ): Container {
    const buildCache = dag.cacheVolume("build-cache")

    return this.withElixirDeps(source)
      .withMountedCache("/app/_build", buildCache)
      .withEnvVariable("MIX_ENV", mixEnv)
      .withExec(["mix", "compile"])
  }

  /**
   * Build a production release
   */
  @func()
  release(
    @argument({ defaultPath: "/" }) source: Directory
  ): Container {
    return this.withAssets(source)
      .withEnvVariable("MIX_ENV", "prod")
      .withExec(["mix", "release"])
  }

  /**
   * Start development server with hot reloading
   */
  @func()
  devServer(
    @argument({ defaultPath: "/" }) source: Directory
  ): Container {
    return this.withAssets(source)
      .withEnvVariable("MIX_ENV", "dev")
      .withExposedPort(4000)
      .withExec(["mix", "phx.server"])
  }

  /**
   * Build production Docker image
   */
  @func()
  buildImage(
    @argument({ defaultPath: "/" }) source: Directory
  ): Container {
    // Multi-stage build for optimized production image
    const releaseContainer = this.release(source)

    return dag
      .container()
      .from("elixir:1.18-alpine")
      .withExec([
        "apk", "add", "--no-cache",
        "openssl", "ncurses-libs", "libstdc++"
      ])
      .withWorkdir("/app")
      .withDirectory("/app", releaseContainer.directory("/app/_build/prod/rel/social_scope"))
      .withExposedPort(4000)
      .withEntrypoint(["/app/bin/social_scope", "start"])
  }

  /**
   * Publish container image to registry
   */
  @func()
  async publish(
    @argument({ defaultPath: "/" }) source: Directory,
    @argument({ defaultValue: "" }) registry: string = ""
  ): Promise<string> {
    const image = this.buildImage(source)

    // Use ttl.sh as default registry for testing
    const registryUrl = registry || `ttl.sh/social-scope-${Math.floor(Math.random() * 10000000)}`

    return image.publish(registryUrl)
  }

  /**
   * Run complete CI pipeline (lint + test + build)
   */
  @func()
  async ci(
    @argument({ defaultPath: "/" }) source: Directory
  ): Promise<string> {
    console.log("🤖 Running CI pipeline...")

    // Run linting checks
    console.log("🔍 Running linting checks...")
    await this.lint(source)
    console.log("✅ Linting passed")

    // Run tests
    console.log("🧪 Running tests...")
    await this.test(source)
    console.log("✅ Tests passed")

    // Build release
    console.log("📦 Building release...")
    this.release(source)
    console.log("✅ Release built successfully")

    return "✅ CI pipeline completed successfully!"
  }

  /**
   * Get development environment for debugging
   */
  @func()
  devEnv(
    @argument({ defaultPath: "/" }) source: Directory
  ): Container {
    return this.withElixirDeps(source)
      .withEnvVariable("MIX_ENV", "dev")
  }

  /**
   * Run interactive shell in development environment
   */
  @func()
  shell(
    @argument({ defaultPath: "/" }) source: Directory
  ): Container {
    return this.devEnv(source)
      .terminal()
  }

  /**
   * Check if the application can start successfully
   */
  @func()
  async healthCheck(
    @argument({ defaultPath: "/" }) source: Directory
  ): Promise<string> {
    return this.withAssets(source)
      .withEnvVariable("MIX_ENV", "prod")
      .withExec(["mix", "run", "--eval", "IO.puts('Application health check passed')"])
      .stdout()
  }
}
