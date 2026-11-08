//! Pocketgull Rust Core Engine (`pocketgull-core`)
//!
//! Provides clinical DSP algorithms, SIBI calculation, FHIR R4 serialization,
//! and QR matrix generation.

pub mod dsp;
pub mod fhir;
pub mod glyph_3d;
pub mod sibi;

use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use qrcode::QrCode;

#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct PgSibiInput {
    pub hs_crp_mg_l: f64,
    pub hba1c_percent: f64,
    pub esr_mm_hr: f64,
    pub max_ppd_mm: f64,
    pub twi_grade: u8,
}

#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct PgExtrusionOptions {
    pub depth: f32,
    pub curve_segments: usize,
    pub scale: f32,
    pub part_id: u32,
}

#[no_mangle]
pub unsafe extern "C" fn pg_calculate_sibi(input: PgSibiInput) -> f64 {
    let s_input = sibi::SibiInput {
        hs_crp_mg_l: input.hs_crp_mg_l,
        hba1c_percent: input.hba1c_percent,
        esr_mm_hr: input.esr_mm_hr,
        max_ppd_mm: input.max_ppd_mm,
        twi_grade: input.twi_grade,
    };
    sibi::calculate_sibi(&s_input).composite_sibi_score
}

#[no_mangle]
pub unsafe extern "C" fn pg_compile_glyph_3d_json(
    symbol_ptr: *const c_char,
    opts: PgExtrusionOptions,
) -> *mut c_char {
    if symbol_ptr.is_null() {
        return std::ptr::null_mut();
    }
    let symbol = match CStr::from_ptr(symbol_ptr).to_str() {
        Ok(s) => s,
        Err(_) => return std::ptr::null_mut(),
    };
    let ex_opts = glyph_3d::ExtrusionOptions {
        depth: if opts.depth > 0.0 { opts.depth } else { 0.2 },
        curve_segments: if opts.curve_segments > 0 { opts.curve_segments } else { 12 },
        scale: if opts.scale > 0.0 { opts.scale } else { 0.01 },
        part_id: opts.part_id,
    };
    let json_str = match glyph_3d::compile_glyph_symbol_to_3d_mesh(symbol, Some(ex_opts)) {
        Some(mesh) => serde_json::to_string(&mesh).unwrap_or_else(|_| "{}".to_string()),
        None => "{}".to_string(),
    };
    CString::new(json_str).map(|c| c.into_raw()).unwrap_or(std::ptr::null_mut())
}

#[no_mangle]
pub unsafe extern "C" fn pg_free_string(ptr: *mut c_char) {
    if !ptr.is_null() {
        let _ = CString::from_raw(ptr);
    }
}

/// Generate ASCII QR matrix representation of input payload string.
pub fn generate_qr_ascii(data: &str) -> String {
    match QrCode::new(data) {
        Ok(code) => code.render::<char>()
            .quiet_zone(false)
            .module_dimensions(2, 1)
            .build(),
        Err(_) => "ERR_QR_GEN_FAILED".to_string(),
    }
}
