# ─────────────────────────────────────────────────────────────────────────────
# Pocket-Gull Vertex AI Agent Builder & Discovery Engine Infrastructure
# Google Cloud Project: gen-lang-client-0540208645
# ─────────────────────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

variable "project_id" {
  type        = string
  default     = "gen-lang-client-0540208645"
  description = "Target Google Cloud Project ID"
}

variable "region" {
  type        = string
  default     = "us-central1"
  description = "Google Cloud primary region"
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# 1. Enable Vertex AI & Discovery Engine APIs
resource "google_project_service" "discoveryengine" {
  project = var.project_id
  service = "discoveryengine.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "aiplatform" {
  project = var.project_id
  service = "aiplatform.googleapis.com"
  disable_on_destroy = false
}

# 2. GCS Bucket for Grounded Clinical Literature & Cochrane PDF Ingestion
resource "google_storage_bucket" "clinical_literature_corpus" {
  name          = "${var.project_id}-clinical-literature"
  location      = "US"
  force_destroy = false
  uniform_bucket_level_access = true

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }
}

# 3. Discovery Engine Data Store for Unstructured Clinical Documents
resource "google_discovery_engine_data_store" "clinical_datastore" {
  location                    = "global"
  data_store_id               = "pocketgull-clinical-docs"
  display_name                = "Pocket-Gull Grounded Clinical Literature Store"
  industry_vertical           = "GENERIC"
  content_config              = "CONTENT_REQUIRED"
  solution_types              = ["SOLUTION_TYPE_SEARCH", "SOLUTION_TYPE_CHAT"]
  create_advanced_site_search = false

  depends_on = [google_project_service.discoveryengine]
}

# 4. Search Engine / Agent Configuration
resource "google_discovery_engine_search_engine" "clinical_search_engine" {
  engine_id      = "pocketgull-clinical-search-engine"
  collection_id  = "default_collection"
  location       = "global"
  display_name   = "Pocket-Gull Clinical Search Engine"
  data_store_ids = [google_discovery_engine_data_store.clinical_datastore.data_store_id]
  
  search_engine_config {
    search_tier = "SEARCH_TIER_ENTERPRISE"
    search_add_ons = ["SEARCH_ADD_ON_LLM"]
  }

  depends_on = [google_discovery_engine_data_store.clinical_datastore]
}

# 5. Service Account for Cloud Run Invocations
resource "google_service_account" "agent_builder_invoker" {
  account_id   = "pocketgull-agent-builder-sa"
  display_name = "Pocket-Gull Vertex Agent Builder Runner"
}

# 6. IAM Binding: Grant Discovery Engine Viewer role to Service Account
resource "google_project_iam_member" "discovery_engine_viewer" {
  project = var.project_id
  role    = "roles/discoveryengine.viewer"
  member  = "serviceAccount:${google_service_account.agent_builder_invoker.email}"
}
