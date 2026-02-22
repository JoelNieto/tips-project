---
name: Survey Types Management
overview: Add a SurveyType entity and full CRUD management (backend + frontend), with properties for categorization, visibility, and question ordering behavior.
todos: []
isProject: false
---

# Survey Types Management

## SurveyType Entity Properties

| Property                  | Type     | Required            | Description                                                      |
| ------------------------- | -------- | ------------------- | ---------------------------------------------------------------- |
| `name`                    | string   | Yes                 | Display name (e.g., "Employee Engagement", "360 Feedback")       |
| `description`             | string   | No                  | Explanation of the survey type                                   |
| `code`                    | string   | No                  | Short identifier for programmatic use                            |
| `isActive`                | boolean  | Yes (default true)  | Enable/disable without deleting                                  |
| `sortOrder`               | int      | No                  | Display order in lists                                           |
| `categoryName`            | string   | No                  | Custom label for categories (e.g., "dimensions", "competencies") |
| `subcategoryName`         | string   | No                  | Custom label for subcategories                                   |
| `hasCategories`           | boolean  | Yes (default false) | Whether this survey type uses categories                         |
| `hasSubcategories`        | boolean  | Yes (default false) | Whether this survey type uses subcategories                      |
| `visibleCategories`       | boolean  | Yes (default false) | Show categories as sections when filling the survey              |
| `visibleSubcategories`    | boolean  | Yes (default false) | Show subcategories when filling the survey                       |
| `randomizeQuestions`      | boolean  | Yes (default false) | Randomize question order when filling the survey                 |
| `createdAt` / `updatedAt` | DateTime | Yes (auto)          | Audit timestamps                                                 |
| `createdById`             | string   | Yes                 | User who created (like Company)                                  |

---

## Implementation Plan

### 1. Prisma Schema

Add `SurveyType` model to [prisma/schema.prisma](prisma/schema.prisma) with all properties above. Relation to `User` for `createdBy` (same pattern as `Company`).

### 2. Backend (NestJS)

**Survey module** at `apps/web-server/src/app/survey/`:

- `survey.module.ts` – module wiring
- `survey-type.resolver.ts` – GraphQL resolver: `surveyTypes`, `surveyType(id)`, `createSurveyType`, `updateSurveyType`, `deleteSurveyType`
- `survey-type.service.ts` – CRUD with Prisma, auth checks
- `dto/` – `survey-type.entity.ts`, `create-survey-type.input.ts`, `update-survey-type.input.ts` (partial)

**Register** `SurveyModule` in [apps/web-server/src/app/app.module.ts](apps/web-server/src/app/app.module.ts).

### 3. Frontend (Angular)

**Survey types feature** at `apps/web-app/src/app/survey-types/`:

- GraphQL operations in `graphql/survey-types.graphql.ts` (list, single, create, update, delete)
- `survey-types-list.ts` – list with table/cards, create button, edit/delete actions
- `survey-type-form.ts` – form using Signal Forms with all fields (grouped: basic info, categories config, visibility, behavior)

**Routing**: add `/dashboard/survey-types` and `/dashboard/survey-types/:id` to [apps/web-app/src/app/dashboard/dashboard.routes.ts](apps/web-app/src/app/dashboard/dashboard.routes.ts).

**Navigation**: add "Survey Types" link in [apps/web-app/src/app/dashboard/dashboard-shell.ts](apps/web-app/src/app/dashboard/dashboard-shell.ts).

### 4. Migration

Run `pnpm prisma migrate dev` to create the migration and update the generated client.

---

## Key Files to Add/Create

```
prisma/schema.prisma                    # Add SurveyType model
apps/web-server/src/app/survey/
  survey.module.ts
  survey-type.resolver.ts
  survey-type.service.ts
  dto/survey-type.entity.ts
  dto/create-survey-type.input.ts
  dto/update-survey-type.input.ts
apps/web-app/src/app/survey-types/
  graphql/survey-types.graphql.ts
  survey-types-list.ts
  survey-type-form.ts
```

---

## Architecture Reference

Follow the existing [Company](apps/web-server/src/app/company/) module pattern:

- NestJS code-first GraphQL with DTOs
- PrismaService for data access
- Angular Signal Forms (see [company-form.ts](apps/web-app/src/app/companies/company-form.ts))
- Lazy-loaded dashboard routes
