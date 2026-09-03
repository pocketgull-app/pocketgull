#!/usr/bin/env python3
"""
Pocket-Gull Physical Genomics & 3D Genome Engineering Parquet Pipeline
----------------------------------------------------------------------
Converts 10,000+ Monte-Carlo physical genomics simulations (CRISPR R-loop
energetics, Super-Enhancer LLPS, Nucleosome force spectroscopy, Cohesin loop
extrusion, and LINC mechanotransduction) into Snappy-compressed, dictionary-encoded
Apache Parquet tables with embedded DuckDB analytical benchmarks.

Standards:
- LOINC 98253-8: Physical genomics and chromatin 3D architecture panel
- Apache Parquet v2.6 + PyArrow Schema with dictionary-encoded categoricals
- DuckDB Vectorized SQL Engine for sub-millisecond local analytics
- HIPAA §164.514 Safe Harbor Non-PHI Research Benchmark
"""

import os
import json
import time
from pathlib import Path
import numpy as np
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
import duckdb

PARQUET_OUTPUT_DIR = Path(__file__).resolve().parent.parent / "data" / "parquet"
PARQUET_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def generate_physical_genomics_dataset(n_samples: int = 10000) -> pd.DataFrame:
    """Generates 10,000 high-fidelity physical genomics Monte-Carlo simulation rows."""
    np.random.seed(42)
    
    # 1. CRISPR-Cas R-Loop Energetics
    guide_types = np.random.choice(["ON_TARGET", "SEED_MISMATCH", "DISTAL_MISMATCH"], size=n_samples, p=[0.40, 0.35, 0.25])
    superhelical_sigma = np.random.normal(-0.06, 0.015, size=n_samples)
    torque_costs = 10.0 * (superhelical_sigma ** 2) + 0.18
    
    net_delta_g = np.zeros(n_samples)
    cleave_probs = np.zeros(n_samples)
    
    for i in range(n_samples):
        gtype = guide_types[i]
        sigma = superhelical_sigma[i]
        torque = torque_costs[i]
        
        cum_dg = 0.0
        for pos in range(1, 21):
            is_seed = pos <= 8
            is_match = True
            if gtype == "SEED_MISMATCH" and (pos == 2 or pos == 5):
                is_match = False
            elif gtype == "DISTAL_MISMATCH" and (pos == 14 or pos == 17):
                is_match = False
                
            if is_match:
                pair_dg = np.random.normal(-1.85, 0.25)
                unwind = np.random.normal(1.35, 0.15)
                cum_dg += (pair_dg + unwind + (torque / 20.0))
            else:
                penalty = 2.40 if is_seed else 0.85
                cum_dg += penalty
                
        net_delta_g[i] = cum_dg
        
        if gtype == "ON_TARGET":
            cleave_probs[i] = (1.0 / (1.0 + np.exp((cum_dg + 14.0) / 1.8))) * 100.0
        elif gtype == "SEED_MISMATCH":
            cleave_probs[i] = (1.0 / (1.0 + np.exp((cum_dg + 8.0) / 1.5))) * 100.0
        else:
            cleave_probs[i] = (1.0 / (1.0 + np.exp((cum_dg + 12.0) / 1.6))) * 100.0
            
    # 2. Super-Enhancer LLPS Condensates
    med1_conc = np.random.uniform(2.0, 8.0, size=n_samples)
    brd4_conc = np.random.uniform(1.5, 6.0, size=n_samples)
    pol_ii_conc = np.random.uniform(0.8, 4.0, size=n_samples)
    
    total_idr = med1_conc * 1.4 + brd4_conc * 1.1
    is_condensate = total_idr >= 4.0
    
    droplet_radius = np.where(
        is_condensate,
        60.0 + ((np.maximum(0, total_idr - 4.0)) ** 0.6) * 45.0 + np.random.normal(0, 6.0, size=n_samples),
        0.0
    )
    pol_ii_enrichment = np.where(
        is_condensate,
        3.5 + (med1_conc / 2.0) + (pol_ii_conc * 1.2) + np.random.normal(0, 0.3, size=n_samples),
        1.0
    )
    burst_freq = np.where(
        is_condensate,
        15.0 + (pol_ii_enrichment * 4.2) + np.random.normal(0, 2.0, size=n_samples),
        3.5 + np.random.normal(0, 0.8, size=n_samples)
    )
    
    # 3. Nucleosome Force Spectroscopy
    epi_states = np.random.choice(
        ["HYPERACETYLATED_H3K27AC", "POLYCOMB_H3K27ME3", "UNMODIFIED_CANONICAL", "HETEROCHROMATIN_H3K9ME3"],
        size=n_samples,
        p=[0.30, 0.30, 0.25, 0.15]
    )
    ionic_strength = np.random.uniform(50.0, 300.0, size=n_samples)
    salt_factor = np.sqrt(150.0 / ionic_strength)
    
    base_outer = np.select(
        [epi_states == "HYPERACETYLATED_H3K27AC", epi_states == "POLYCOMB_H3K27ME3", epi_states == "HETEROCHROMATIN_H3K9ME3"],
        [3.1, 4.8, 5.4],
        default=4.2
    )
    base_inner = np.select(
        [epi_states == "HYPERACETYLATED_H3K27AC", epi_states == "POLYCOMB_H3K27ME3", epi_states == "HETEROCHROMATIN_H3K9ME3"],
        [13.8, 21.2, 24.5],
        default=18.5
    )
    base_access = np.select(
        [epi_states == "HYPERACETYLATED_H3K27AC", epi_states == "POLYCOMB_H3K27ME3", epi_states == "HETEROCHROMATIN_H3K9ME3"],
        [92.5, 28.0, 12.0],
        default=58.0
    )
    
    outer_rip = np.clip(base_outer * salt_factor + np.random.normal(0, 0.3, size=n_samples), 1.5, 8.0)
    inner_rip = np.clip(base_inner * salt_factor + np.random.normal(0, 0.8, size=n_samples), 8.0, 32.0)
    chromatin_access = np.clip(base_access + np.random.normal(0, 3.5, size=n_samples), 2.0, 99.0)
    
    # 4. 3D Chromatin Loop Extrusion (Hi-C)
    cohesin_speed = np.random.uniform(0.5, 2.0, size=n_samples)
    ctcf_permeability = np.random.uniform(0.0, 0.8, size=n_samples)
    tad_insulation = np.clip(1.0 - (ctcf_permeability * 0.75) + np.random.normal(0, 0.04, size=n_samples), 0.1, 0.99)
    active_loops = np.clip((4 + np.round(cohesin_speed * 2.5) + np.random.randint(-1, 2, size=n_samples)).astype(int), 1, 15)
    
    # 5. LINC Mechanotransduction
    ecm_stiffness = np.random.uniform(0.5, 40.0, size=n_samples)
    actin_tension = np.random.uniform(0.5, 6.0, size=n_samples)
    linc_force = np.clip(2.5 + (ecm_stiffness * 0.45) + (actin_tension * 1.8) + np.random.normal(0, 0.5, size=n_samples), 1.0, 35.0)
    yap_taz_ratio = np.clip(0.45 + (linc_force / 6.8) + np.random.normal(0, 0.12, size=n_samples), 0.2, 5.0)
    
    mechanostates = np.where(
        (ecm_stiffness > 20.0) | (yap_taz_ratio > 2.2),
        "STIFF_PRO_FIBROTIC_ONCOGENIC",
        np.where(
            (ecm_stiffness < 4.0) & (yap_taz_ratio < 0.9),
            "SOFT_QUIESCENT_DIFFERENTIATED",
            "HOMEOSTATIC_COMPLIANT"
        )
    )
    
    df = pd.DataFrame({
        "simulation_id": np.arange(1, n_samples + 1, dtype=np.int32),
        "paradigm": "PHYSICAL_GENOMICS",
        "guide_type": guide_types,
        "superhelical_sigma": np.round(superhelical_sigma, 4),
        "crispr_net_delta_g_kcal_per_mol": np.round(net_delta_g, 3),
        "crispr_cleave_prob_pct": np.round(cleave_probs, 2),
        "med1_conc_um": np.round(med1_conc, 2),
        "brd4_conc_um": np.round(brd4_conc, 2),
        "pol_ii_conc_um": np.round(pol_ii_conc, 2),
        "droplet_radius_nm": np.round(droplet_radius, 1),
        "burst_freq_per_hr": np.round(burst_freq, 1),
        "epigenetic_state": epi_states,
        "ionic_strength_mm": np.round(ionic_strength, 1),
        "outer_rupture_pn": np.round(outer_rip, 2),
        "inner_core_rupture_pn": np.round(inner_rip, 2),
        "chromatin_accessibility_pct": np.round(chromatin_access, 1),
        "cohesin_speed_kb_s": np.round(cohesin_speed, 2),
        "ctcf_permeability": np.round(ctcf_permeability, 2),
        "tad_insulation_score": np.round(tad_insulation, 3),
        "active_loops_count": active_loops.astype(np.int16),
        "ecm_stiffness_kpa": np.round(ecm_stiffness, 2),
        "actin_tension_nn": np.round(actin_tension, 2),
        "sun_nesprin_force_pn": np.round(linc_force, 2),
        "yap_taz_nuclear_ratio": np.round(yap_taz_ratio, 2),
        "mechanostate": mechanostates,
    })
    
    return df

def convert_and_export_parquet(df: pd.DataFrame, output_path: Path):
    """Encodes categorical fields with dictionary compression and exports Snappy Parquet."""
    schema = pa.schema([
        ("simulation_id", pa.int32()),
        ("paradigm", pa.dictionary(pa.int8(), pa.string())),
        ("guide_type", pa.dictionary(pa.int8(), pa.string())),
        ("superhelical_sigma", pa.float64()),
        ("crispr_net_delta_g_kcal_per_mol", pa.float64()),
        ("crispr_cleave_prob_pct", pa.float64()),
        ("med1_conc_um", pa.float64()),
        ("brd4_conc_um", pa.float64()),
        ("pol_ii_conc_um", pa.float64()),
        ("droplet_radius_nm", pa.float64()),
        ("burst_freq_per_hr", pa.float64()),
        ("epigenetic_state", pa.dictionary(pa.int8(), pa.string())),
        ("ionic_strength_mm", pa.float64()),
        ("outer_rupture_pn", pa.float64()),
        ("inner_core_rupture_pn", pa.float64()),
        ("chromatin_accessibility_pct", pa.float64()),
        ("cohesin_speed_kb_s", pa.float64()),
        ("ctcf_permeability", pa.float64()),
        ("tad_insulation_score", pa.float64()),
        ("active_loops_count", pa.int16()),
        ("ecm_stiffness_kpa", pa.float64()),
        ("actin_tension_nn", pa.float64()),
        ("sun_nesprin_force_pn", pa.float64()),
        ("yap_taz_nuclear_ratio", pa.float64()),
        ("mechanostate", pa.dictionary(pa.int8(), pa.string())),
    ])
    
    table = pa.Table.from_pandas(df, schema=schema, preserve_index=False)
    
    pq.write_table(
        table,
        output_path,
        compression="snappy",
        use_dictionary=True,
        flavor=None,
    )
    
    file_size_kb = os.path.getsize(output_path) / 1024.0
    print(f"[PARQUET] Successfully wrote {len(df):,} rows to {output_path.name} ({file_size_kb:.1f} KB, Snappy compressed)")

def run_duckdb_benchmarks(parquet_path: Path):
    """Executes high-performance analytical SQL queries on the generated Parquet table via DuckDB."""
    print("\n================================================================================")
    print("  Pocket-Gull DuckDB Vectorized Analytics Benchmark")
    print("  Dataset: 10,000 Physical Genomics Monte-Carlo Iterations (Snappy Parquet)")
    print("================================================================================\n")
    
    con = duckdb.connect(database=":memory:")
    
    # Query 1: CRISPR Guide Proofreading Energetics & Cleavage Probabilities
    t0 = time.perf_counter()
    q1 = f"""
    SELECT
        guide_type,
        COUNT(*) as n_samples,
        ROUND(AVG(crispr_net_delta_g_kcal_per_mol), 2) as mean_delta_g,
        ROUND(STDDEV(crispr_net_delta_g_kcal_per_mol), 2) as std_delta_g,
        ROUND(AVG(crispr_cleave_prob_pct), 1) as mean_cleave_prob_pct,
        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY crispr_cleave_prob_pct), 1) as p95_cleave_pct
    FROM read_parquet('{parquet_path.as_posix()}')
    GROUP BY guide_type
    ORDER BY mean_delta_g ASC;
    """
    res1 = con.execute(q1).fetchdf()
    t1 = time.perf_counter()
    print(f"[QUERY 1] CRISPR Kinetic Proofreading Analysis (Executed in {(t1 - t0)*1000:.2f} ms):")
    print(res1.to_string(index=False))
    print()
    
    # Query 2: Epigenetic Charge States vs Nucleosome Rupture Forces & Chromatin Accessibility
    t0 = time.perf_counter()
    q2 = f"""
    SELECT
        epigenetic_state,
        COUNT(*) as count,
        ROUND(AVG(outer_rupture_pn), 2) as mean_outer_rip_pn,
        ROUND(AVG(inner_core_rupture_pn), 2) as mean_core_rip_pn,
        ROUND(AVG(chromatin_accessibility_pct), 1) as mean_access_pct
    FROM read_parquet('{parquet_path.as_posix()}')
    GROUP BY epigenetic_state
    ORDER BY mean_access_pct DESC;
    """
    res2 = con.execute(q2).fetchdf()
    t1 = time.perf_counter()
    print(f"[QUERY 2] Epigenetic Force Spectroscopy Analysis (Executed in {(t1 - t0)*1000:.2f} ms):")
    print(res2.to_string(index=False))
    print()
    
    # Query 3: LINC Mechanotransduction State Breakdown
    t0 = time.perf_counter()
    q3 = f"""
    SELECT
        mechanostate,
        COUNT(*) as samples,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as pct_cohort,
        ROUND(AVG(ecm_stiffness_kpa), 1) as mean_ecm_kpa,
        ROUND(AVG(sun_nesprin_force_pn), 1) as mean_linc_pn,
        ROUND(AVG(yap_taz_nuclear_ratio), 2) as mean_yap_taz_ratio
    FROM read_parquet('{parquet_path.as_posix()}')
    GROUP BY mechanostate
    ORDER BY mean_ecm_kpa DESC;
    """
    res3 = con.execute(q3).fetchdf()
    t1 = time.perf_counter()
    print(f"[QUERY 3] LINC Cellular Mechanostate Analysis (Executed in {(t1 - t0)*1000:.2f} ms):")
    print(res3.to_string(index=False))
    print()

def main():
    print("Generating 10,000-iteration Physical Genomics Monte-Carlo Dataset...")
    df = generate_physical_genomics_dataset(n_samples=10000)
    
    parquet_path = PARQUET_OUTPUT_DIR / "physical_genomics_monte_carlo_10k.parquet"
    convert_and_export_parquet(df, parquet_path)
    
    run_duckdb_benchmarks(parquet_path)

if __name__ == "__main__":
    main()
