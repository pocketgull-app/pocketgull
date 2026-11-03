// SPDX-License-Identifier: Apache-2.0
#ifndef POCKETGULL_CORE_H
#define POCKETGULL_CORE_H

#include <stdint.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * PocketGull Rust Kernel (`libpocketgull_core.a` / `pocketgull_core.dll`)
 * C-ABI Header for Apple Swift / Xcode `.xcframework`, Go cgo, and Flutter dart:ffi.
 */

typedef struct {
    double hs_crp_mg_l;
    double hba1c_percent;
    double esr_mm_hr;
    double max_ppd_mm;
    uint8_t twi_grade;
} pg_sibi_input_t;

typedef struct {
    float depth;
    size_t curve_segments;
    float scale;
    uint32_t part_id;
} pg_extrusion_options_t;

double pg_calculate_sibi(pg_sibi_input_t input);

char* pg_compile_glyph_3d_json(const char* symbol_ptr, pg_extrusion_options_t opts);

void pg_free_string(char* ptr);

#ifdef __cplusplus
}
#endif

#endif /* POCKETGULL_CORE_H */
