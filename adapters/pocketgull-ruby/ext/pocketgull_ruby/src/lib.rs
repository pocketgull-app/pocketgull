use magnus::{function, method, prelude::*, Error, Ruby};
use pocketgull_core::{dsp, sibi::{self, SibiInput}, fhir::{self, FhirExportParams}};

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

#[magnus::init]
fn init(ruby: &Ruby) -> Result<(), Error> {
    let module = ruby.define_module("PocketgullCore")?;
    module.define_singleton_method("calculate_sibi", function!(calculate_sibi_ruby, 5))?;
    module.define_singleton_method("calculate_rmssd", function!(calculate_rmssd_ruby, 1))?;
    Ok(())
}
