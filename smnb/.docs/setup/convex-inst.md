# Convex Documentation

> For general information about Convex, read [https://www.convex.dev/llms.txt](https://www.convex.dev/llms.txt).


## understanding

Introduction to Convex - the reactive database with TypeScript queries

- [Convex Overview](/understanding.md): Introduction to Convex - the reactive database with TypeScript queries
- [Best Practices](/understanding/best-practices.md): Essential best practices for building scalable Convex applications including database queries, function organization, validation, and security.
- [TypeScript](/understanding/best-practices/typescript.md): Move faster with end-to-end type safety
- [Dev workflow](/understanding/workflow.md): Development workflow from project creation to production deployment
- [The Zen of Convex](/understanding/zen.md): Convex best practices and design philosophy

## quickstart

- [Android Kotlin Quickstart](/quickstart/android.md): Add Convex to an Android Kotlin project
- [Using Convex with Bun](/quickstart/bun.md): Add Convex to a Bun project
- [Next.js Quickstart](/quickstart/nextjs.md): Add Convex to a Next.js project
- [Node.js Quickstart](/quickstart/nodejs.md): Add Convex to a Node.js project
- [Nuxt Quickstart](/quickstart/nuxt.md): Add Convex to a Nuxt project
- [Python Quickstart](/quickstart/python.md): Add Convex to a Python project
- [React Quickstart](/quickstart/react.md): Add Convex to a React project
- [React Native Quickstart](/quickstart/react-native.md): Add Convex to a React Native Expo project
- [Remix Quickstart](/quickstart/remix.md): Add Convex to a Remix project
- [Rust Quickstart](/quickstart/rust.md): Add Convex to a Rust project
- [Script Tag Quickstart](/quickstart/script-tag.md): Add Convex to any website
- [Svelte Quickstart](/quickstart/svelte.md): Add Convex to a Svelte project
- [iOS Swift Quickstart](/quickstart/swift.md): Add Convex to an iOS Swift project
- [TanStack Start Quickstart](/quickstart/tanstack-start.md): Add Convex to a TanStack Start project
- [Vue Quickstart](/quickstart/vue.md): Add Convex to a Vue project

## functions

Write functions to define your server behavior

- [Functions](/functions.md): Write functions to define your server behavior
- [Actions](/functions/actions.md): Call third-party services and external APIs from Convex
- [Bundling](/functions/bundling.md): How Convex bundles and optimizes your function code
- [Debugging](/functions/debugging.md): Debug Convex functions during development and production
- [Error Handling](/functions/error-handling.md): Handle errors in Convex queries, mutations, and actions
- [Application Errors](/functions/error-handling/application-errors.md): Handle expected failures in Convex functions
- [HTTP Actions](/functions/http-actions.md): Build HTTP APIs directly in Convex
- [Internal Functions](/functions/internal-functions.md): Functions that can only be called by other Convex functions
- [Mutations](/functions/mutation-functions.md): Insert, update, and remove data from the database
- [Queries](/functions/query-functions.md): Fetch data from the database with caching and reactivity
- [Runtimes](/functions/runtimes.md): Learn the differences between the Convex and Node.js runtimes for functions
- [Argument and Return Value Validation](/functions/validation.md): Validate function arguments and return values for security

## database

Store JSON-like documents with a relational data model

- [Database](/database.md): Store JSON-like documents with a relational data model
- [OCC and Atomicity](/database/advanced/occ.md): Optimistic concurrency control and transaction atomicity in Convex
- [Schema Philosophy](/database/advanced/schema-philosophy.md): Convex schema design philosophy and best practices
- [System Tables](/database/advanced/system-tables.md): Access metadata for Convex built-in features through system tables including scheduled functions and file storage information.
- [Backups](/database/backup-restore.md): Backup and restore your Convex data and files
- [Document IDs](/database/document-ids.md): Create complex, relational data models using IDs
- [Data Import & Export](/database/import-export.md): Import data from existing sources and export data to external systems
- [Data Export](/database/import-export/export.md): Export your data out of Convex
- [Data Import](/database/import-export/import.md): Import data into Convex
- [Paginated Queries](/database/pagination.md): Load paginated queries
- [Reading Data](/database/reading-data.md): Query and read data from Convex database tables
- [Filtering](/database/reading-data/filters.md): Filter documents in Convex queries
- [Indexes](/database/reading-data/indexes.md): Speed up queries with database indexes
- [Introduction to Indexes and Query Performance](/database/reading-data/indexes/indexes-and-query-perf.md): Learn the effects of indexes on query performance
- [Schemas](/database/schemas.md): Schema validation keeps your Convex data neat and tidy. It also gives you end-to-end TypeScript type safety!
- [Data Types](/database/types.md): Supported data types in Convex documents
- [Writing Data](/database/writing-data.md): Insert, update, and delete data in Convex database tables

## realtime

Building realtime apps with Convex

- [Realtime](/realtime.md): Building realtime apps with Convex

## auth

Add authentication to your Convex app.

- [Authentication](/auth.md): Add authentication to your Convex app.
- [Custom OIDC Provider](/auth/advanced/custom-auth.md): Integrate Convex with any OpenID Connect identity provider using custom authentication configuration and ConvexProviderWithAuth.
- [Custom JWT Provider](/auth/advanced/custom-jwt.md): Configure Convex to work with custom JWT providers that don't implement full OIDC protocol, including setup and client-side integration.
- [Convex & Auth0](/auth/auth0.md): Integrate Auth0 authentication with Convex
- [Convex & WorkOS AuthKit](/auth/authkit.md): Integrate WorkOS AuthKit authentication with Convex
- [Convex & Clerk](/auth/clerk.md): Integrate Clerk authentication with Convex
- [Convex Auth](/auth/convex-auth.md): Built-in authentication for Convex applications
- [Storing Users in the Convex Database](/auth/database-auth.md): Store user information in your Convex database
- [Debugging Authentication](/auth/debug.md): Troubleshoot authentication issues in Convex
- [Auth in Functions](/auth/functions-auth.md): Access user authentication in Convex functions

## scheduling

Schedule functions to run once or repeatedly with scheduled functions and cron jobs

- [Scheduling](/scheduling.md): Schedule functions to run once or repeatedly with scheduled functions and cron jobs
- [Cron Jobs](/scheduling/cron-jobs.md): Schedule recurring functions in Convex
- [Scheduled Functions](/scheduling/scheduled-functions.md): Schedule functions to run in the future

## file-storage

Store and serve files of any type

- [File Storage](/file-storage.md): Store and serve files of any type
- [Deleting Files](/file-storage/delete-files.md): Delete files stored in Convex
- [Accessing File Metadata](/file-storage/file-metadata.md): Access file metadata stored in Convex
- [Serving Files](/file-storage/serve-files.md): Serve files stored in Convex to users
- [Storing Generated Files](/file-storage/store-files.md): Store files generated in Convex actions
- [Uploading and Storing Files](/file-storage/upload-files.md): Upload files to Convex storage

## search

Run search queries over your Convex documents

- [AI & Search](/search.md): Run search queries over your Convex documents
- [Full Text Search](/search/text-search.md): Run search queries over your Convex documents
- [Vector Search](/search/vector-search.md): Run vector search queries on embeddings

## components

Self contained building blocks of your app

- [Components](/components.md): Self contained building blocks of your app
- [Using Components](/components/using-components.md): Using existing components

## ai

How to use AI code generation effectively with Convex

- [AI Code Generation](/ai.md): How to use AI code generation effectively with Convex
- [Convex MCP Server](/ai/convex-mcp-server.md): Convex MCP server
- [Using Cursor with Convex](/ai/using-cursor.md): Tips and best practices for using Cursor with Convex
- [Using GitHub Copilot with Convex](/ai/using-github-copilot.md): Tips and best practices for using GitHub Copilot with Convex
- [Using Windsurf with Convex](/ai/using-windsurf.md): Tips and best practices for using Windsurf with Convex

## agents

Building AI Agents with Convex

- [AI Agents](/agents.md): Building AI Agents with Convex
- [LLM Context](/agents/context.md): Customizing the context provided to the Agent's LLM
- [Debugging](/agents/debugging.md): Debugging the Agent component
- [Files and Images in Agent messages](/agents/files.md): Working with images and files in the Agent component
- [Getting Started with Agent](/agents/getting-started.md): Setting up the agent component
- [Human Agents](/agents/human-agents.md): Saving messages from a human as an agent
- [Messages](/agents/messages.md): Sending and receiving messages with an agent
- [Playground](/agents/playground.md): A simple way to test, debug, and develop with the agent
- [RAG (Retrieval-Augmented Generation) with the Agent component](/agents/rag.md): Examples of how to use RAG with the Convex Agent component
- [Rate Limiting](/agents/rate-limiting.md): Control the rate of requests to your AI agent
- [Threads](/agents/threads.md): Group messages together in a conversation history
- [Tools](/agents/tools.md): Using tool calls with the Agent component
- [Usage Tracking](/agents/usage-tracking.md): Tracking token usage of the Agent component
- [Workflows](/agents/workflows.md): Defining long-lived workflows for the Agent component

## testing

Testing your backend

- [Testing](/testing.md): Testing your backend
- [Continuous Integration](/testing/ci.md): Set up continuous integration testing for Convex applications
- [Testing Local Backend](/testing/convex-backend.md): Test functions using the local open-source Convex backend
- [convex-test](/testing/convex-test.md): Mock Convex backend for fast automated testing of functions

## production

Tips for building safe and reliable production apps

- [Deploying Your App to Production](/production.md): Tips for building safe and reliable production apps
- [Contact Us](/production/contact.md): Get support, provide feedback, stay updated with Convex releases, and report security vulnerabilities through our community channels.
- [Environment Variables](/production/environment-variables.md): Store and access environment variables in Convex
- [Hosting and Deployment](/production/hosting.md): Share your Convex backend and web app with the world
- [Custom Domains & Hosting](/production/hosting/custom.md): Serve requests from any domains and host your frontend on any static hosting provider, such as GitHub.
- [Using Convex with Netlify](/production/hosting/netlify.md): Host your frontend on Netlify and your backend on Convex
- [Preview Deployments](/production/hosting/preview-deployments.md): Use Convex with your hosting provider's preview deployments
- [Using Convex with Vercel](/production/hosting/vercel.md): Host your frontend on Vercel and your backend on Convex
- [Integrations](/production/integrations.md): Integrate Convex with third party services
- [Exception Reporting](/production/integrations/exception-reporting.md): Configure exception reporting integrations for your Convex deployment
- [Log Streams](/production/integrations/log-streams.md): Configure logging integrations for your Convex deployment
- [(Legacy) Event schema](/production/integrations/log-streams/legacy-event-schema.md): Log streams configured before May 23, 2024 will use the legacy format
- [Streaming Data in and out of Convex](/production/integrations/streaming-import-export.md): Streaming Data in and out of Convex
- [Multiple Repositories](/production/multiple-repos.md): Use Convex in multiple repositories
- [Pausing a Deployment](/production/pause-deployment.md): Temporarily disable a deployment without deleting data
- [Project Configuration](/production/project-configuration.md): Configure your Convex project for development and production deployment using convex.json, environment variables, and deployment settings.
- [Status and Guarantees](/production/state.md): Learn about Convex's production guarantees, availability targets, data durability, security features, and upcoming platform enhancements.
- [Limits](/production/state/limits.md): We’d love for you to have unlimited joy building on Convex but engineering

## self-hosting

Self Hosting Convex Projects

- [Self Hosting](/self-hosting.md): Self Hosting Convex Projects

## cli

Command-line interface for managing Convex projects and functions

- [CLI](/cli.md): Command-line interface for managing Convex projects and functions
- [Agent Mode](/cli/agent-mode.md): Configure anonymous development mode for cloud-based coding agents
- [Deploy keys](/cli/deploy-key-types.md): Use deploy keys for authentication in production build environments
- [Local Deployments for Development](/cli/local-deployments.md): Develop with Convex using deployments running locally on your machine

## client

- [Android Kotlin](/client/android.md): Android Kotlin client library for mobile applications using Convex
- [Kotlin and Convex type conversion](/client/android/data-types.md): Customizing and converting types between the Kotlin app and Convex
- [Convex JavaScript Clients](/client/javascript.md): JavaScript clients for Node.js and browser applications using Convex
- [Bun](/client/javascript/bun.md): Use Convex clients with the Bun JavaScript runtime
- [Node.js](/client/javascript/node.md): Use Convex HTTP and subscription clients in Node.js applications
- [Script Tag](/client/javascript/script-tag.md): Use Convex directly in HTML with script tags, no build tools required
- [OpenAPI & Other Languages](/client/open-api.md): Convex doesn’t have explicit support for many languages including Go, Java, and
- [Python](/client/python.md): Python client library for building applications with Convex
- [Convex React](/client/react.md): React client library for interacting with your Convex backend
- [Convex React Native](/client/react-native.md): How Convex works in a React Native app
- [Configuring Deployment URL](/client/react/deployment-urls.md): Configuring your project to run with Convex
- [Next.js Pages Router](/client/react/nextjs-pages-router/nextjs-pages-router.md): Complete guide to using Convex with Next.js Pages Router including client-side authentication, API routes, and server-side rendering.
- [Next.js Pages Quickstart](/client/react/nextjs-pages-router/quickstart.md): Get started with Convex in Next.js Pages Router by building a reactive task list app with queries, mutations, and real-time updates.
- [Next.js](/client/react/nextjs.md): How Convex works in a Next.js app
- [Next.js Server Rendering](/client/react/nextjs/server-rendering.md): Implement server-side rendering with Convex in Next.js App Router using preloadQuery, fetchQuery, and server actions for improved performance.
- [Optimistic Updates](/client/react/optimistic-updates.md): Make your React app more responsive with optimistic UI updates
- [Create-React-App Quickstart](/client/react/quickstart-create-react-app.md): Add Convex to a Create React App project
- [TanStack Start](/client/react/tanstack-start.md): How Convex works with TanStack Start
- [TanStack Start with Clerk](/client/react/tanstack-start/tanstack-start-with-clerk.md): Learn how to integrate Clerk authentication with Convex in TanStack Start applications using ID tokens and ConvexProviderWithClerk.
- [Rust](/client/rust.md): Rust client library for building applications with Convex
- [Svelte](/client/svelte.md): Reactive Svelte client library for Convex applications
- [iOS & macOS Swift](/client/swift.md): Swift client library for iOS and macOS applications using Convex
- [Swift and Convex type conversion](/client/swift/data-types.md): Customizing and converting types between the Swift app and Convex
- [Convex with TanStack Query](/client/tanstack-query.md): Integrate Convex with TanStack Query for advanced data fetching patterns
- [Vue](/client/vue.md): Community-maintained Vue integration for Convex applications
- [Nuxt](/client/vue/nuxt.md): Nuxt is a powerful web framework powered by Vue.

## dashboard

Learn how to use the Convex dashboard

- [Dashboard](/dashboard.md): Learn how to use the Convex dashboard
- [Deployments](/dashboard/deployments.md): Understand Convex deployments including production, development, and preview deployments, and how to switch between them in the dashboard.
- [Data](/dashboard/deployments/data.md): View, edit, and manage database tables and documents in the dashboard
- [Settings](/dashboard/deployments/deployment-settings.md): Configure your Convex deployment settings including URLs, environment variables, authentication, backups, integrations, and deployment management.
- [File Storage](/dashboard/deployments/file-storage.md): Upload, download, and manage files stored in your Convex deployment
- [Functions](/dashboard/deployments/functions.md): Run, test, and monitor Convex functions with metrics and performance data
- [Health](/dashboard/deployments/health.md): Monitor your Convex deployment health including failure rates, cache performance, scheduler status, and deployment insights for optimization.
- [History](/dashboard/deployments/history.md): View an audit log of configuration-related events in your Convex deployment including function deployments, index changes, and environment variable updates.
- [Logs](/dashboard/deployments/logs.md): View real-time function logs and deployment activity in your dashboard
- [Schedules](/dashboard/deployments/schedules.md): Monitor and manage scheduled functions and cron jobs in your deployment
- [Projects](/dashboard/projects.md): Create and manage Convex projects, settings, and deployments
- [Teams](/dashboard/teams.md): Manage team settings, members, billing, and access control in Convex

## error

Understand specific errors thrown by Convex

- [Errors and Warnings](/error.md): Understand specific errors thrown by Convex

## eslint

ESLint rules for Convex

- [ESLint rules](/eslint.md): ESLint rules for Convex

## tutorial

Build a real-time chat application with Convex using queries, mutations, and the sync engine for automatic updates across all connected clients.

- [Convex Tutorial: A chat app](/tutorial.md): Build a real-time chat application with Convex using queries, mutations, and the sync engine for automatic updates across all connected clients.
- [Convex Tutorial: Calling external services](/tutorial/actions.md): Extend your chat app by calling external APIs using Convex actions and the scheduler to integrate Wikipedia summaries into your application.
- [Convex Tutorial: Scaling your app](/tutorial/scale.md): Learn how to scale your Convex application using indexes, handling write conflicts, and leveraging Convex Components for best practices.

## api

TypeScript/JavaScript client libraries and CLI for Convex.

- [Convex](/api.md): TypeScript/JavaScript client libraries and CLI for Convex.
- [Class: BaseConvexClient](/api/classes/browser.BaseConvexClient.md): browser.BaseConvexClient
- [Class: ConvexClient](/api/classes/browser.ConvexClient.md): browser.ConvexClient
- [Class: ConvexHttpClient](/api/classes/browser.ConvexHttpClient.md): browser.ConvexHttpClient
- [Class: ConvexReactClient](/api/classes/react.ConvexReactClient.md): react.ConvexReactClient
- [Class: Crons](/api/classes/server.Crons.md): server.Crons
- [Class: Expression<T>](/api/classes/server.Expression.md): server.Expression
- [Class: FilterExpression<T>](/api/classes/server.FilterExpression.md): server.FilterExpression
- [Class: HttpRouter](/api/classes/server.HttpRouter.md): server.HttpRouter
- [Class: IndexRange](/api/classes/server.IndexRange.md): server.IndexRange
- [Class: SchemaDefinition<Schema, StrictTableTypes>](/api/classes/server.SchemaDefinition.md): server.SchemaDefinition
- [Class: SearchFilter](/api/classes/server.SearchFilter.md): server.SearchFilter
- [Class: TableDefinition<DocumentType, Indexes, SearchIndexes, VectorIndexes>](/api/classes/server.TableDefinition.md): server.TableDefinition
- [Class: ConvexError<TData>](/api/classes/values.ConvexError.md): values.ConvexError
- [Class: VAny<Type, IsOptional, FieldPaths>](/api/classes/values.VAny.md): values.VAny
- [Class: VArray<Type, Element, IsOptional>](/api/classes/values.VArray.md): values.VArray
- [Class: VBoolean<Type, IsOptional>](/api/classes/values.VBoolean.md): values.VBoolean
- [Class: VBytes<Type, IsOptional>](/api/classes/values.VBytes.md): values.VBytes
- [Class: VFloat64<Type, IsOptional>](/api/classes/values.VFloat64.md): values.VFloat64
- [Class: VId<Type, IsOptional>](/api/classes/values.VId.md): values.VId
- [Class: VInt64<Type, IsOptional>](/api/classes/values.VInt64.md): values.VInt64
- [Class: VLiteral<Type, IsOptional>](/api/classes/values.VLiteral.md): values.VLiteral
- [Class: VNull<Type, IsOptional>](/api/classes/values.VNull.md): values.VNull
- [Class: VObject<Type, Fields, IsOptional, FieldPaths>](/api/classes/values.VObject.md): values.VObject
- [Class: VRecord<Type, Key, Value, IsOptional, FieldPaths>](/api/classes/values.VRecord.md): values.VRecord
- [Class: VString<Type, IsOptional>](/api/classes/values.VString.md): values.VString
- [Class: VUnion<Type, T, IsOptional, FieldPaths>](/api/classes/values.VUnion.md): values.VUnion
- [Interface: BaseConvexClientOptions](/api/interfaces/browser.BaseConvexClientOptions.md): browser.BaseConvexClientOptions
- [Interface: MutationOptions](/api/interfaces/browser.MutationOptions.md): browser.MutationOptions
- [Interface: OptimisticLocalStore](/api/interfaces/browser.OptimisticLocalStore.md): browser.OptimisticLocalStore
- [Interface: SubscribeOptions](/api/interfaces/browser.SubscribeOptions.md): browser.SubscribeOptions
- [Interface: ConvexReactClientOptions](/api/interfaces/react.ConvexReactClientOptions.md): react.ConvexReactClientOptions
- [Interface: MutationOptions<Args>](/api/interfaces/react.MutationOptions.md): react.MutationOptions
- [Interface: ReactAction<Action>](/api/interfaces/react.ReactAction.md): react.ReactAction
- [Interface: ReactMutation<Mutation>](/api/interfaces/react.ReactMutation.md): react.ReactMutation
- [Interface: Watch<T>](/api/interfaces/react.Watch.md): react.Watch
- [Interface: WatchQueryOptions](/api/interfaces/react.WatchQueryOptions.md): react.WatchQueryOptions
- [Interface: Auth](/api/interfaces/server.Auth.md): server.Auth
- [Interface: BaseTableReader<DataModel, TableName>](/api/interfaces/server.BaseTableReader.md): server.BaseTableReader
- [Interface: BaseTableWriter<DataModel, TableName>](/api/interfaces/server.BaseTableWriter.md): server.BaseTableWriter
- [Interface: CronJob](/api/interfaces/server.CronJob.md): server.CronJob
- [Interface: DefineSchemaOptions<StrictTableNameTypes>](/api/interfaces/server.DefineSchemaOptions.md): server.DefineSchemaOptions
- [Interface: FilterBuilder<TableInfo>](/api/interfaces/server.FilterBuilder.md): server.FilterBuilder
- [Interface: GenericActionCtx<DataModel>](/api/interfaces/server.GenericActionCtx.md): server.GenericActionCtx
- [Interface: GenericDatabaseReader<DataModel>](/api/interfaces/server.GenericDatabaseReader.md): server.GenericDatabaseReader
- [Interface: GenericDatabaseReaderWithTable<DataModel>](/api/interfaces/server.GenericDatabaseReaderWithTable.md): server.GenericDatabaseReaderWithTable
- [Interface: GenericDatabaseWriter<DataModel>](/api/interfaces/server.GenericDatabaseWriter.md): server.GenericDatabaseWriter
- [Interface: GenericDatabaseWriterWithTable<DataModel>](/api/interfaces/server.GenericDatabaseWriterWithTable.md): server.GenericDatabaseWriterWithTable
- [Interface: GenericMutationCtx<DataModel>](/api/interfaces/server.GenericMutationCtx.md): server.GenericMutationCtx
- [Interface: GenericQueryCtx<DataModel>](/api/interfaces/server.GenericQueryCtx.md): server.GenericQueryCtx
- [Interface: IndexRangeBuilder<Document, IndexFields, FieldNum>](/api/interfaces/server.IndexRangeBuilder.md): server.IndexRangeBuilder
- [Interface: OrderedQuery<TableInfo>](/api/interfaces/server.OrderedQuery.md): server.OrderedQuery
- [Interface: PaginationOptions](/api/interfaces/server.PaginationOptions.md): server.PaginationOptions
- [Interface: PaginationResult<T>](/api/interfaces/server.PaginationResult.md): server.PaginationResult
- [Interface: Query<TableInfo>](/api/interfaces/server.Query.md): server.Query
- [Interface: QueryInitializer<TableInfo>](/api/interfaces/server.QueryInitializer.md): server.QueryInitializer
- [Interface: Scheduler](/api/interfaces/server.Scheduler.md): server.Scheduler
- [Interface: SearchFilterBuilder<Document, SearchIndexConfig>](/api/interfaces/server.SearchFilterBuilder.md): server.SearchFilterBuilder
- [Interface: SearchFilterFinalizer<Document, SearchIndexConfig>](/api/interfaces/server.SearchFilterFinalizer.md): server.SearchFilterFinalizer
- [Interface: SearchIndexConfig<SearchField, FilterFields>](/api/interfaces/server.SearchIndexConfig.md): server.SearchIndexConfig
- [Interface: StorageActionWriter](/api/interfaces/server.StorageActionWriter.md): server.StorageActionWriter
- [Interface: StorageReader](/api/interfaces/server.StorageReader.md): server.StorageReader
- [Interface: StorageWriter](/api/interfaces/server.StorageWriter.md): server.StorageWriter
- [Interface: SystemDataModel](/api/interfaces/server.SystemDataModel.md): server.SystemDataModel
- [Interface: UserIdentity](/api/interfaces/server.UserIdentity.md): server.UserIdentity
- [Interface: ValidatedFunction<Ctx, ArgsValidator, Returns>](/api/interfaces/server.ValidatedFunction.md): server.ValidatedFunction
- [Interface: VectorFilterBuilder<Document, VectorIndexConfig>](/api/interfaces/server.VectorFilterBuilder.md): server.VectorFilterBuilder
- [Interface: VectorIndexConfig<VectorField, FilterFields>](/api/interfaces/server.VectorIndexConfig.md): server.VectorIndexConfig
- [Interface: VectorSearchQuery<TableInfo, IndexName>](/api/interfaces/server.VectorSearchQuery.md): server.VectorSearchQuery
- [convex](/api/modules.md): Modules
- [Module: browser](/api/modules/browser.md): Tools for accessing Convex in the browser.
- [Module: nextjs](/api/modules/nextjs.md): Helpers for integrating Convex into Next.js applications using server rendering.
- [Module: react](/api/modules/react.md): Tools to integrate Convex into React applications.
- [Module: react-auth0](/api/modules/react_auth0.md): React login component for use with Auth0.
- [Module: react-clerk](/api/modules/react_clerk.md): React login component for use with Clerk.
- [Module: server](/api/modules/server.md): Utilities for implementing server-side Convex query and mutation functions.
- [Module: values](/api/modules/values.md): Utilities for working with values stored in Convex.
- [Namespace: Base64](/api/namespaces/values.Base64.md): values.Base64

## generated-api

Auto-generated JavaScript and TypeScript code specific to your app's API

- [Generated Code](/generated-api.md): Auto-generated JavaScript and TypeScript code specific to your app's API
- [api.js](/generated-api/api.md): Generated API references for your Convex functions and internal calls
- [dataModel.d.ts](/generated-api/data-model.md): Generated TypeScript types for your database schema and documents
- [server.js](/generated-api/server.md): Generated utilities for implementing Convex queries, mutations, and actions

## http-api

Connecting to Convex directly with HTTP

- [HTTP APIs](/http-api.md): Connecting to Convex directly with HTTP

## chef

How to use Chef by Convex

- [Chef](/chef.md): How to use Chef by Convex

## deployment-api

Deployment API

- [Deployment API](/deployment-api.md): Deployment API
- [Convex Deployment API](/deployment-api/convex-deployment-api.md): Admin API for interacting with deployments
- [Update environment variables](/deployment-api/update-environment-variables.md): Update one or many environment variables in a deployment.

## management-api

Creating and managing Convex deployments by API

- [Management API](/management-api.md): Creating and managing Convex deployments by API
- [Convex Management API](/management-api/convex-management-api.md): Management API for provisioning and managing Convex projects and deployments.
- [Create deploy key](/management-api/create-deploy-key.md): Create a deploy key like 'dev:happy-animal-123|ey...' which can be
- [Create project](/management-api/create-project.md): Create a new project on a team and provision a dev or prod deployment.
- [Delete project](/management-api/delete-project.md): Delete a project. Deletes all deployments in the project as well.
- [Get token details](/management-api/get-token-details.md): Returns the team ID for team tokens.
- [List deployments](/management-api/list-deployments.md): List deployments for a projects.
- [List projects](/management-api/list-projects.md): List all projects for a team.

## platform-apis

Convex Platform APIs are in openly available in Beta. Please contact

- [Platform APIs](/platform-apis.md): Convex Platform APIs are in openly available in Beta. Please contact
- [Embedding the dashboard](/platform-apis/embedded-dashboard.md): Convex provides a hosted dashboard that is embeddable via iframe. Embedding the
- [OAuth Applications](/platform-apis/oauth-applications.md): Convex allows third-party app developers to manage a user's projects on their

## public-deployment-api

- [Convex Public HTTP routes](/public-deployment-api/convex-public-http-routes.md): Endpoints that require no authentication
- [Execute action](/public-deployment-api/public-action-post.md): Execute an action function.
- [Execute any function](/public-deployment-api/public-function-post.md): Execute a query, mutation, or action function by name.
- [Execute function by URL path](/public-deployment-api/public-function-post-with-path.md): Execute a query, mutation, or action function by path in URL.
- [Get latest timestamp](/public-deployment-api/public-get-query-ts.md): Get the latest timestamp for queries.
- [Execute mutation](/public-deployment-api/public-mutation-post.md): Execute a mutation function.
- [Execute query at timestamp](/public-deployment-api/public-query-at-ts-post.md): Execute a query function at a specific timestamp.
- [Execute query batch](/public-deployment-api/public-query-batch-post.md): Execute multiple query functions in a batch.
- [Execute query (GET)](/public-deployment-api/public-query-get.md): Execute a query function via GET request.
- [Execute query (POST)](/public-deployment-api/public-query-post.md): Execute a query function via POST request.