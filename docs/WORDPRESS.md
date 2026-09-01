# WordPress Operations & Clinical Publishing Suite

This document details the configuration, local development, WP-CLI automation, and Headless REST API architecture for **`pocketgull.com/articles`** and **`wordpress.pocketgull.com`**.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    subgraph WPStack ["WordPress Engine (Docker / Cloud Run)"]
        Core["WordPress Core (v6.x+)"]
        Theme["🎨 `wp-content/themes/pocketgull-articles`"]
        SNO10Taxonomy["🧬 SNO-10 Custom Taxonomy (SNOMED-CT / ICD-10)"]
        RESTAPI["⚡ WP REST API (`/wp-json/wp/v2/posts`)"]
    end

    subgraph PocketGullApp ["Pocket-Gull Angular 22 Client"]
        Service["`WordPressArticlesService` (Signals + Caching)"]
        Component["`ArticlesReaderComponent` (Caslon Editorial Reader)"]
    end

    Core --> Theme
    Theme --> SNO10Taxonomy
    SNO10Taxonomy --> RESTAPI
    RESTAPI --> Service
    Service --> Component
```

---

## 🚀 1. One-Click Local Development (Docker Compose)

A complete local WordPress + MariaDB environment is pre-configured in `docker-compose.wordpress.yml`.

### Start the Local WordPress Stack:
```bash
docker compose -f docker-compose.wordpress.yml up -d
```

### Access Points (when Docker container is running):
* **WordPress Front-End**: [http://localhost:8080](http://localhost:8080)
* **WordPress Admin Dashboard**: [http://localhost:8080/wp-admin](http://localhost:8080/wp-admin)
  * **Admin Username**: `clinical_admin` (or `$WP_ADMIN_USER`)
  * **Admin Password**: Set via `$WP_ADMIN_PASS` environment variable
* **REST API Endpoint**: [http://localhost:8080/wp-json/wp/v2/posts](http://localhost:8080/wp-json/wp/v2/posts)

---

## ⚡ 2. Automated WP-CLI Provisioning

You can automatically configure WordPress, activate the Pocket-Gull theme, create author credentials, and seed the initial health literacy articles:

```bash
# Run the automated provisioning script
bash scripts/wp_provision.sh
# or on Windows PowerShell:
.\scripts\wp_provision.ps1
```

### What the Provisioning Script Sets Up:
1. **Activates Theme**: `pocketgull-articles` (with PocketGull typeface stack and dark obsidian styling).
2. **Registers SNO-10 Taxonomies**:
   * `Hypertension (I10 / SNOMED 38341003)`
   * `Heart Failure (I50.9 / SNOMED 84114007)`
   * `Osteoarthritis & Joint Care (M17.9 / SNOMED 239873007)`
   * `Preventive Nephrology (N18.9 / SNOMED 709044004)`
   * `Bereavement & Craft Continuity (SNOMED 399269003)`
3. **Creates Primary Author**:
   * `Phil` (Author)
4. **Seeds Initial Articles**:
   * *"Keeping Their Craft Alive: How to Honor Someone You Miss by Picking Up Their Tools"*
   * *"The 2-Flight-of-Stairs Rule: Staying Safe and Close with Your Partner After a Heart Attack"*
   * *"The $100,000 Oil Change: How Daily Prevention Heals More Than Just Yourself"*

---

## 📱 3. Headless REST API Integration with Pocket-Gull App

The Pocket-Gull Angular app automatically syncs with WordPress via `WordPressArticlesService`:

```typescript
// Example Angular Signal usage:
const articles = articlesService.articles(); // reactive signal of published posts
const isLoading = articlesService.isLoading();
```

If the WordPress backend is offline or during local development, `WordPressArticlesService` automatically falls back to bundled offline seed articles with zero disruption.
