use magnus::{function, method, prelude::*, Error, Ruby};
use pocketgull_core::{dsp, glyph_3d::{self, ExtrusionOptions}, sibi::{self, SibiInput}, fhir::{self, FhirExportParams}};

fn calculate_sibi_ruby(
    hs_crp: f64,
    hba1c: f64,
    esr: f64,
    ppd: f64,
    twi: u8,
) -> Result<String, Error> {
    let input = SibiInput {
        hs_crp_mg_l: hs_crp,
        hba1c_percent: hba1c,
        esr_mm_hr: esr,
        max_ppd_mm: ppd,
        twi_grade: twi,
    };
    let res = sibi::calculate_sibi(&input);
    Ok(serde_json::to_string(&res).unwrap())
}

fn calculate_rmssd_ruby(rr: Vec<f64>) -> Result<f64, Error> {
    Ok(dsp::calculate_hrv_rmssd(&rr))
}

fn compile_glyph_3d_ruby(symbol_token: String, depth: f64) -> Result<String, Error> {
    let opts = ExtrusionOptions {
        depth: if depth > 0.0 { depth as f32 } else { 0.2 },
        curve_segments: 12,
        scale: 0.01,
        part_id: 0,
    };
    match glyph_3d::compile_glyph_symbol_to_3d_mesh(&symbol_token, Some(opts)) {
        Some(mesh) => Ok(serde_json::to_string(&mesh).unwrap_or_else(|_| "{}".to_string())),
        None => Ok("{}".to_string()),
    }
}

#[magnus::init]
fn init(ruby: &Ruby) -> Result<(), Error> {
    let module = ruby.define_module("PocketgullCore")?;
    module.define_singleton_method("calculate_sibi", function!(calculate_sibi_ruby, 5))?;
    module.define_singleton_method("calculate_rmssd", function!(calculate_rmssd_ruby, 1))?;
    module.define_singleton_method("compile_glyph_3d", function!(compile_glyph_3d_ruby, 2))?;
    Ok(())
}
