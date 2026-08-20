"""Pytest configuration for clinical-evidence-grade package."""

import os

# Prevent pytest from collecting test_null_hypothesis() from source modules.
# That function is a domain API (Popperian hypothesis testing), not a pytest test.
collect_ignore = [os.path.join("src")]
